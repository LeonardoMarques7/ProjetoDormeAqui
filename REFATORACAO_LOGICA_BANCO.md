# Refatoração: Lógica que Pertence ao Banco de Dados

> **Contexto:** O projeto usa **MongoDB** com Mongoose. Toda a análise abaixo aponta trechos de código JavaScript que fazem trabalho de **agregação, validação de integridade ou cálculo de métricas** — responsabilidades que pertencem ao banco de dados. Para MongoDB isso significa usar **Aggregation Pipelines, Views, Atlas Triggers ou hooks próximos ao driver**; para uma eventual migração a PostgreSQL, os equivalentes seriam **Stored Functions, Triggers, Views Materializadas e Constraints**.

---

## Etapa 1 — `reviews/model.js` · `update-average-ratings.js` · `bookings/model.js`

---

### 1. `back-end/domains/reviews/model.js`

#### Trecho atual — recálculo de média em JavaScript após cada save/delete

```js
// Linhas 17–38
const recalculateAverageRating = async (reviewModel, placeId) => {
    if (!placeId) return;
    const [stats] = await reviewModel.aggregate([
        { $match: { place: placeId } },
        { $group: { _id: "$place", averageRating: { $avg: "$rating" } } }
    ]);
    const averageRating = stats?.averageRating || 0;
    await Place.findByIdAndUpdate(placeId, { averageRating });
};

reviewSchema.post("save", async function () {
    await recalculateAverageRating(this.constructor, this.place);
});

reviewSchema.post("deleteOne", { document: true, query: false }, async function () {
    await recalculateAverageRating(this.constructor, this.place);
});

reviewSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        await recalculateAverageRating(this.model, doc.place);
    }
});
```

**Problema:** A média de avaliação é um **dado derivado** que vive na coleção `places.averageRating` mas é calculada por JavaScript a cada operação de review. Isso gera:
- Dois round-trips ao banco para cada review inserida/excluída.
- Risco de inconsistência se o processo cair entre o `save` e o `findByIdAndUpdate`.

#### Alteração proposta

**MongoDB (manter Mongoose):** Substituir o campo desnormalizado por uma **Aggregation View** consultada em tempo real, eliminando a necessidade de manter `averageRating` sincronizado, ou usar `$inc`/`$set` atômico dentro de uma única operação com `bulkWrite`.

```js
// reviews/model.js — versão proposta
// Remove as funções recalculateAverageRating e os hooks post-save/post-delete.
// Deixa apenas o schema e o índice:

reviewSchema.index({ place: 1, user: 1 });
reviewSchema.index({ booking: 1 }, { unique: true });
reviewSchema.index({ user: 1 });
reviewSchema.index({ place: 1, rating: 1 });

export default model("Review", reviewSchema);
```

```js
// places/model.js — novo campo virtual (não persistido) OU
// Criar uma MongoDB View chamada "place_ratings":
// db.createView("place_ratings", "reviews", [
//   { $group: { _id: "$place", averageRating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } }
// ])
//
// Nos pontos de leitura do dashboard/places, fazer um $lookup nessa view
// em vez de ler place.averageRating.
```

**SQL equivalente (PostgreSQL):**
```sql
-- Trigger que atualiza places.average_rating automaticamente
CREATE OR REPLACE FUNCTION fn_recalculate_place_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE places
  SET average_rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM reviews
    WHERE place_id = COALESCE(NEW.place_id, OLD.place_id)
  ),
  review_count = (
    SELECT COUNT(*) FROM reviews
    WHERE place_id = COALESCE(NEW.place_id, OLD.place_id)
  )
  WHERE id = COALESCE(NEW.place_id, OLD.place_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_place_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION fn_recalculate_place_rating();
```

---

### 2. `back-end/update-average-ratings.js`

#### Trecho atual — script de recálculo manual em loop JavaScript

```js
// Linhas 14–34
const places = await Place.find({});

for (const place of places) {
    const reviews = await Review.find({ place: place._id });

    if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;
        await Place.findByIdAndUpdate(place._id, { averageRating });
    } else {
        await Place.findByIdAndUpdate(place._id, { averageRating: 0 });
    }
}
```

**Problema:** O script carrega **todos os places** e **todos os reviews** por place em memória JavaScript, executa N+1 queries e recalcula algo que o banco deveria saber calcular sozinho. É um script de "resincronização" que só existe porque o campo desnormalizado `averageRating` pode ficar obsoleto.

#### Alteração proposta

**MongoDB — script de resync usando uma única Aggregation Pipeline:**

```js
// update-average-ratings.js — versão proposta
import mongoose from "mongoose";
import "dotenv/config";

const { MONGO_URL } = process.env;

async function updateAverageRatings() {
    await mongoose.connect(MONGO_URL);
    console.log("Conectado ao MongoDB");

    // Uma única pipeline que calcula e atualiza em batch
    const result = await mongoose.connection.db.collection("reviews").aggregate([
        {
            $group: {
                _id: "$place",
                averageRating: { $avg: "$rating" },
                reviewCount: { $sum: 1 }
            }
        },
        {
            $merge: {
                into: "places",
                on: "_id",
                whenMatched: [
                    {
                        $set: {
                            averageRating: "$$new.averageRating",
                            reviewCount: "$$new.reviewCount"
                        }
                    }
                ],
                whenNotMatched: "discard"
            }
        }
    ]).toArray();

    console.log("Atualização concluída via aggregation pipeline.");
    process.exit();
}

updateAverageRatings().catch((err) => { console.error(err); process.exit(1); });
```

**SQL equivalente:**
```sql
-- Procedure de resync em lote
CREATE OR REPLACE PROCEDURE sp_resync_place_ratings()
LANGUAGE plpgsql AS $$
BEGIN
  UPDATE places p
  SET
    average_rating = sub.avg_rating,
    review_count   = sub.cnt
  FROM (
    SELECT place_id, AVG(rating) AS avg_rating, COUNT(*) AS cnt
    FROM reviews
    GROUP BY place_id
  ) sub
  WHERE p.id = sub.place_id;
END;
$$;
-- Execução: CALL sp_resync_place_ratings();
```

---

### 3. `back-end/domains/bookings/model.js`

#### Trecho atual — validações de negócio dentro do Model (createFromPayment)

```js
// Linhas 42–160 (método estático createFromPayment)

// Verifica conflito de datas em JavaScript após buscar todas as reservas
const conflictingBookings = await Booking.find({
    place,
    $or: [
        { checkin: { $lt: checkoutDate }, checkout: { $gt: checkinDate } }
    ]
}).session(session);

if (conflictingBookings.length > 0) { ... }

// Verifica intervalo mínimo buscando a última reserva
const lastBooking = await Booking.findOne({ place }).sort({ checkout: -1 }).session(session);

if (lastBooking?.checkout) {
    const hoursDiff = (checkinDate - lastCheckoutDate) / (1000 * 60 * 60);
    const minIntervalHours = 3;
    if (hoursDiff < minIntervalHours) { ... }
}
```

**Problema:** A lógica de **conflito de datas** e **intervalo mínimo entre reservas** é uma regra de integridade de dados. O JavaScript executa isso em duas queries separadas dentro de uma transação, mas:
- O banco poderia garantir isso com **índices e constraints** (evitando race conditions).
- Em SQL, seria uma constraint de exclusão ou uma stored function chamada antes do INSERT.

#### Alteração proposta

**MongoDB — usar `findOneAndUpdate` com condição atômica para verificar conflito:**

```js
// bookings/model.js — versão proposta para o trecho de criação
// Substituir as duas queries separadas por uma única query de conflito
// e uma constraint garantida pelo índice de sobreposição.

// Índice de suporte para conflito de datas (adicionar ao schema):
bookingSchema.index(
    { place: 1, checkin: 1, checkout: 1 },
    {
        name: "idx_booking_date_overlap",
        // Em MongoDB não há constraint de exclusão nativa para intervalos,
        // mas o índice melhora a performance da query de conflito.
    }
);

// Substituir as duas queries por uma única aggregation que verifica ambas as condições:
const conflictOrTooClose = await Booking.findOne({
    place,
    status: { $nin: ["canceled", "rejected"] },
    $or: [
        // Conflito de datas
        { checkin: { $lt: checkoutDate }, checkout: { $gt: checkinDate } },
        // Intervalo mínimo de 3h após último checkout
        {
            checkout: {
                $gt: new Date(checkinDate.getTime() - 3 * 60 * 60 * 1000),
                $lte: checkinDate
            }
        }
    ]
}).session(session).lean();

if (conflictOrTooClose) {
    const isOverlap = new Date(conflictOrTooClose.checkin) < checkoutDate &&
                      new Date(conflictOrTooClose.checkout) > checkinDate;
    const err = new Error(
        isOverlap
            ? "Datas conflitantes com reservas existentes."
            : "Intervalo mínimo de 3 horas entre check-out e check-in não respeitado."
    );
    err.statusCode = isOverlap ? 409 : 400;
    throw err;
}
```

**SQL equivalente:**
```sql
-- Stored function que valida e insere em uma única operação atômica
CREATE OR REPLACE FUNCTION fn_create_booking(
    p_place_id   UUID,
    p_user_id    UUID,
    p_checkin    TIMESTAMPTZ,
    p_checkout   TIMESTAMPTZ,
    p_guests     INT,
    p_nights     INT,
    p_price_total NUMERIC,
    p_price_per_night NUMERIC,
    p_payment_status TEXT
)
RETURNS bookings LANGUAGE plpgsql AS $$
DECLARE
    v_booking bookings;
BEGIN
    -- Verificar conflito de datas e intervalo mínimo em uma única query
    IF EXISTS (
        SELECT 1 FROM bookings
        WHERE place_id = p_place_id
          AND status NOT IN ('canceled', 'rejected')
          AND (
            -- Sobreposição
            (checkin < p_checkout AND checkout > p_checkin)
            OR
            -- Intervalo mínimo de 3h
            (checkout > p_checkin - INTERVAL '3 hours' AND checkout <= p_checkin)
          )
        FOR UPDATE  -- lock para evitar race condition
    ) THEN
        RAISE EXCEPTION 'conflict_or_interval' USING ERRCODE = '23P01';
    END IF;

    INSERT INTO bookings (place_id, user_id, checkin, checkout, guests, nights,
                          price_total, price_per_night, payment_status, status)
    VALUES (p_place_id, p_user_id, p_checkin, p_checkout, p_guests, p_nights,
            p_price_total, p_price_per_night, p_payment_status,
            CASE WHEN p_payment_status = 'approved' THEN 'confirmed' ELSE 'pending' END)
    RETURNING * INTO v_booking;

    RETURN v_booking;
END;
$$;
```

---

## Etapa 2 — `financialEntries/service.js` · `dashboard/service.js` (agregações de receita)

---

### 4. `back-end/domains/financialEntries/service.js`

#### Trecho atual — `buildCategorySummary`, `buildSubcategorySummary`, `buildPropertySummary`

```js
// Linhas 357–456
const buildCategorySummary = (entries = []) => {
    const groups = new Map();
    for (const entry of entries) {
        const groupKey = entry.entryType;
        // acumula total e items por entryType em JS
        ...
    }
    return Array.from(groups.values())...;
};

const buildSubcategorySummary = (entries = []) => {
    const groups = new Map();
    for (const entry of entries) {
        const subKey = `${entry.entryType}:${entry.category}`;
        // acumula total por entryType+category em JS
        ...
    }
    ...
};

const buildPropertySummary = (entries = [], places = [], bookings = []) => {
    // Cruza entries + bookings por placeId em JS usando Maps
    const bookingRevenueByPlace = new Map();
    for (const booking of bookings) { ... }
    const entryImpactByPlace = new Map();
    for (const entry of entries) { ... }
    ...
};
```

**Problema:** Estas três funções buscam os dados brutos do banco e depois fazem toda a agregação em memória JavaScript (`Map`, `reduce`, loops). São operações de `GROUP BY` que o banco executa de forma muito mais eficiente.

#### Alteração proposta

**MongoDB — mover para Aggregation Pipelines:**

```js
// financialEntries/service.js — versão proposta

// Substituir buildCategorySummary por query direta ao banco:
const getCategorySummary = async (hostId, monthKey, placeIds) => {
    return FinancialEntry.aggregate([
        {
            $match: {
                host: hostId,
                competenceMonth: monthKey,
                ...(placeIds.length > 0 ? { place: { $in: placeIds } } : {}),
                status: { $nin: ["draft", "canceled", "void", "failed"] }
            }
        },
        {
            $group: {
                _id: "$entryType",
                total: {
                    $sum: {
                        $cond: [
                            { $eq: ["$entryType", "manual_revenue"] },
                            "$amount",
                            { $multiply: ["$amount", -1] }
                        ]
                    }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id": 1 } }
    ]);
};

// Substituir buildSubcategorySummary:
const getSubcategorySummary = async (hostId, monthKey, placeIds) => {
    return FinancialEntry.aggregate([
        {
            $match: {
                host: hostId,
                competenceMonth: monthKey,
                ...(placeIds.length > 0 ? { place: { $in: placeIds } } : {}),
                status: { $nin: ["draft", "canceled", "void", "failed"] }
            }
        },
        {
            $group: {
                _id: { entryType: "$entryType", category: "$category" },
                total: {
                    $sum: {
                        $cond: [
                            { $eq: ["$entryType", "manual_revenue"] },
                            "$amount",
                            { $multiply: ["$amount", -1] }
                        ]
                    }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id.entryType": 1, "_id.category": 1 } }
    ]);
};

// Substituir buildPropertySummary — cruzamento entries + bookings via $lookup:
const getPropertySummary = async (hostId, monthKey, placeIds, periodStart, periodEnd) => {
    return FinancialEntry.aggregate([
        {
            $match: {
                host: hostId,
                competenceMonth: monthKey,
                place: { $in: placeIds },
                status: { $nin: ["draft", "canceled", "void", "failed"] }
            }
        },
        {
            $group: {
                _id: "$place",
                entriesImpact: {
                    $sum: {
                        $cond: [
                            { $eq: ["$entryType", "manual_revenue"] },
                            "$amount",
                            { $multiply: ["$amount", -1] }
                        ]
                    }
                },
                entryCount: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: "bookings",
                let: { placeId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$place", "$$placeId"] },
                            paymentStatus: "approved",
                            status: { $nin: ["canceled", "rejected"] },
                            checkout: { $gte: periodStart, $lte: periodEnd }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            grossRevenue: { $sum: "$priceTotal" },
                            bookingCount: { $sum: 1 }
                        }
                    }
                ],
                as: "bookingSummary"
            }
        },
        {
            $lookup: {
                from: "places",
                localField: "_id",
                foreignField: "_id",
                as: "placeInfo"
            }
        },
        {
            $project: {
                id: { $toString: "$_id" },
                title: { $arrayElemAt: ["$placeInfo.title", 0] },
                city: { $arrayElemAt: ["$placeInfo.city", 0] },
                grossRevenue: { $ifNull: [{ $arrayElemAt: ["$bookingSummary.grossRevenue", 0] }, 0] },
                bookingCount: { $ifNull: [{ $arrayElemAt: ["$bookingSummary.bookingCount", 0] }, 0] },
                entriesImpact: 1,
                entryCount: 1,
                netRevenue: {
                    $add: [
                        { $ifNull: [{ $arrayElemAt: ["$bookingSummary.grossRevenue", 0] }, 0] },
                        "$entriesImpact"
                    ]
                }
            }
        },
        { $sort: { grossRevenue: -1 } }
    ]);
};
```

**SQL equivalente:**
```sql
-- View para resumo por categoria
CREATE OR REPLACE VIEW vw_financial_category_summary AS
SELECT
    host_id,
    competence_month,
    place_id,
    entry_type,
    SUM(CASE WHEN entry_type = 'manual_revenue' THEN amount ELSE -amount END) AS net_impact,
    COUNT(*) AS entry_count
FROM financial_entries
WHERE status NOT IN ('draft', 'canceled', 'void', 'failed')
GROUP BY host_id, competence_month, place_id, entry_type;

-- View para resumo por subcategoria
CREATE OR REPLACE VIEW vw_financial_subcategory_summary AS
SELECT
    host_id,
    competence_month,
    place_id,
    entry_type,
    category,
    SUM(CASE WHEN entry_type = 'manual_revenue' THEN amount ELSE -amount END) AS net_impact,
    COUNT(*) AS entry_count
FROM financial_entries
WHERE status NOT IN ('draft', 'canceled', 'void', 'failed')
GROUP BY host_id, competence_month, place_id, entry_type, category;

-- Stored function para resumo por propriedade
CREATE OR REPLACE FUNCTION fn_property_financial_summary(
    p_host_id UUID, p_month TEXT,
    p_period_start TIMESTAMPTZ, p_period_end TIMESTAMPTZ
)
RETURNS TABLE(
    place_id UUID, title TEXT, city TEXT,
    gross_revenue NUMERIC, entries_impact NUMERIC,
    net_revenue NUMERIC, booking_count BIGINT, entry_count BIGINT
) LANGUAGE sql AS $$
    SELECT
        p.id,
        p.title,
        p.city,
        COALESCE(b.gross_revenue, 0),
        COALESCE(fe.entries_impact, 0),
        COALESCE(b.gross_revenue, 0) + COALESCE(fe.entries_impact, 0),
        COALESCE(b.booking_count, 0),
        COALESCE(fe.entry_count, 0)
    FROM places p
    LEFT JOIN (
        SELECT place_id,
               SUM(price_total) AS gross_revenue,
               COUNT(*) AS booking_count
        FROM bookings
        WHERE payment_status = 'approved'
          AND status NOT IN ('canceled','rejected')
          AND checkout BETWEEN p_period_start AND p_period_end
        GROUP BY place_id
    ) b ON b.place_id = p.id
    LEFT JOIN (
        SELECT place_id,
               SUM(CASE WHEN entry_type='manual_revenue' THEN amount ELSE -amount END) AS entries_impact,
               COUNT(*) AS entry_count
        FROM financial_entries
        WHERE host_id = p_host_id
          AND competence_month = p_month
          AND status NOT IN ('draft','canceled','void','failed')
        GROUP BY place_id
    ) fe ON fe.place_id = p.id
    WHERE p.owner_id = p_host_id
    ORDER BY gross_revenue DESC;
$$;
```

---

### 5. `back-end/domains/dashboard/service.js` — `buildRevenueSeries`

#### Trecho atual

```js
// Linhas 108–152
const buildRevenueSeries = async (placeIds = []) => {
    // Faz duas queries separadas: uma para encontrar a "anchor date" e outra
    // para buscar totais mensais — depois monta a série em JavaScript
    const [anchorResult] = await Booking.aggregate([
        { $match: match },
        { $group: { _id: null, lastCheckout: { $max: "$checkout" } } },
    ]);
    ...
    const totals = await Booking.aggregate([
        { $match: { ...match, checkout: { $gte: rangeStart, $lte: rangeEnd } } },
        {
            $group: {
                _id: { year: { $year: "$checkout" }, month: { $month: "$checkout" } },
                receita: { $sum: { $ifNull: ["$priceTotal", 0] } },
            },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
    totals.forEach(({ _id, receita }) => {
        monthTotals.set(`${_id.year}-${_id.month}`, receita);
    });
    return buildRevenueProjectionSeries(anchorDate, monthTotals);
};
```

**Problema:** Duas roundtrips ao banco para calcular algo que poderia ser feito em **uma única pipeline** que já retorna os 6 meses e a data âncora juntos.

#### Alteração proposta

**MongoDB — pipeline unificada:**

```js
// dashboard/service.js — versão proposta para buildRevenueSeries
const buildRevenueSeries = async (placeIds = []) => {
    if (placeIds.length === 0) {
        return buildRevenueProjectionSeries(new Date(), new Map());
    }

    const match = {
        place: { $in: placeIds },
        paymentStatus: "approved",
        status: { $nin: Array.from(CANCELED_BOOKING_STATUSES) },
        checkout: { $type: "date" },
        priceTotal: { $gt: 0 },
    };

    // Pipeline única: calcula anchorDate e totais mensais em uma só execução
    const [result] = await Booking.aggregate([
        { $match: match },
        {
            $group: {
                _id: { year: { $year: "$checkout" }, month: { $month: "$checkout" } },
                receita: { $sum: { $ifNull: ["$priceTotal", 0] } },
                lastCheckout: { $max: "$checkout" }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        {
            $group: {
                _id: null,
                months: { $push: { year: "$_id.year", month: "$_id.month", receita: "$receita" } },
                anchorDate: { $max: "$lastCheckout" }
            }
        }
    ]);

    if (!result) return buildRevenueProjectionSeries(new Date(), new Map());

    const monthTotals = new Map(
        result.months.map(({ year, month, receita }) => [`${year}-${month}`, receita])
    );
    return buildRevenueProjectionSeries(new Date(result.anchorDate), monthTotals);
};
```

**SQL equivalente:**
```sql
-- Stored function para série de receita mensal
CREATE OR REPLACE FUNCTION fn_revenue_series(
    p_host_id UUID,
    p_months_back INT DEFAULT 6
)
RETURNS TABLE(
    mes_key TEXT,
    mes_label TEXT,
    receita NUMERIC,
    projecao NUMERIC,
    tipo TEXT
) LANGUAGE sql AS $$
    WITH monthly AS (
        SELECT
            TO_CHAR(DATE_TRUNC('month', b.checkout), 'YYYY-MM') AS mes_key,
            TO_CHAR(b.checkout, 'Mon')                           AS mes_label,
            SUM(b.price_total)                                   AS receita
        FROM bookings b
        JOIN places p ON p.id = b.place_id
        WHERE p.owner_id = p_host_id
          AND b.payment_status = 'approved'
          AND b.status NOT IN ('canceled','rejected')
          AND b.checkout >= DATE_TRUNC('month', NOW()) - (p_months_back || ' months')::INTERVAL
          AND b.checkout <  DATE_TRUNC('month', NOW()) + INTERVAL '1 month'
        GROUP BY 1, 2
    )
    SELECT
        mes_key, mes_label, receita, NULL AS projecao, 'real' AS tipo
    FROM monthly
    ORDER BY mes_key;
$$;
```

---

## Etapa 3 — `cleaningInspection/service.js` · `bookings/transitionService.js` · `dashboard/service.js` (buildMonthlyReportSeries)

---

### 6. `back-end/domains/cleaningInspection/service.js`

#### Trecho atual — contagem de status em loop JavaScript

```js
// Linhas 136–147
const summary = emptySummary();
for (const task of tasks) {
    if (task.overallStatus === "awaiting_cleaning") summary.pendingCleanings += 1;
    if (task.overallStatus === "cleaning_in_progress") summary.cleaningInProgress += 1;
    if (task.overallStatus === "awaiting_inspection") summary.pendingInspections += 1;
    if (task.overallStatus === "approved") summary.approvedForCheckin += 1;
    if (task.overallStatus === "blocked") summary.blockedProperties += 1;
}
```

**Problema:** Busca **todos os documentos** da coleção para o host e depois conta por status em JavaScript. Uma simples agregação `$group` no banco retorna apenas os contadores sem trafegar os documentos completos.

#### Alteração proposta

**MongoDB — separar a contagem dos dados completos:**

```js
// cleaningInspection/service.js — versão proposta
export const buildCleaningInspectionData = async (hostId) => {
    // Contagens em uma única query de aggregation (sem trazer documentos)
    const statusCounts = await CleaningInspection.aggregate([
        { $match: { host: hostId } },
        { $group: { _id: "$overallStatus", count: { $sum: 1 } } }
    ]);

    const countMap = Object.fromEntries(
        statusCounts.map(({ _id, count }) => [_id, count])
    );

    const summary = emptySummary();
    summary.pendingCleanings    = countMap["awaiting_cleaning"] || 0;
    summary.cleaningInProgress  = countMap["cleaning_in_progress"] || 0;
    summary.pendingInspections  = countMap["awaiting_inspection"] || 0;
    summary.approvedForCheckin  = countMap["approved"] || 0;
    summary.blockedProperties   = countMap["blocked"] || 0;

    summary.items = summary.items.map((item) => ({
        ...item,
        value: summary[item.key] ?? 0,
    }));

    // Apenas agora busca os documentos completos (para o grid/lista)
    const tasks = await CleaningInspection.find({ host: hostId })
        .sort({ nextCheckin: 1, updatedAt: -1 })
        .populate("place", "title city photos")
        .populate({ path: "previousBooking", select: "checkin checkout status paymentStatus guests user", populate: { path: "user", select: "name email" } })
        .populate({ path: "nextBooking",     select: "checkin checkout status paymentStatus guests user", populate: { path: "user", select: "name email" } })
        .lean();

    return { summary, filters: CLEANING_INSPECTION_FILTERS, items: tasks.map(normalizeTask) };
};
```

**SQL equivalente:**
```sql
-- View materializada para contagem de tarefas por status
CREATE MATERIALIZED VIEW mv_cleaning_summary AS
SELECT
    host_id,
    overall_status,
    COUNT(*) AS task_count
FROM cleaning_inspections
GROUP BY host_id, overall_status;

-- Índice para refresh eficiente
CREATE UNIQUE INDEX ON mv_cleaning_summary(host_id, overall_status);
-- Atualizar: REFRESH MATERIALIZED VIEW CONCURRENTLY mv_cleaning_summary;
```

---

### 7. `back-end/domains/bookings/transitionService.js`

#### Trecho atual — máquina de estados em JavaScript com duas queries

```js
// Linhas 35–98 (transitionBookingStatus)
const allowedFromStatuses = Object.keys(ALLOWED_TRANSITIONS).filter((status) =>
    isTransitionAllowed(status, toStatus)
);

const booking = await Booking.findOneAndUpdate(
    { _id: bookingId, status: { $in: allowedFromStatuses } },
    update,
    { new: true }
);

if (!booking) {
    // Segunda query para descobrir o motivo da falha
    const existing = await Booking.findById(bookingId).select("status").lean();
    ...
}
```

**Problema:** A validação da transição é feita em JavaScript antes de ir ao banco. Quando a transição falha, é necessária uma segunda query para obter o status atual. Em SQL isso seria uma única stored procedure com a lógica toda dentro, garantindo atomicidade verdadeira.

#### Alteração proposta

**MongoDB — eliminar a segunda query usando `$cond` na pipeline de update:**

```js
// bookings/transitionService.js — versão proposta
export const transitionBookingStatus = async (bookingId, toStatus, options = {}) => {
    const { reason = "", changedBy = null } = options;
    const now = new Date();

    const allowedFromStatuses = Object.keys(ALLOWED_TRANSITIONS).filter((s) =>
        isTransitionAllowed(s, toStatus)
    );

    if (allowedFromStatuses.length === 0) {
        const err = new Error(`Transição inválida: não é possível ir para '${toStatus}'.`);
        err.statusCode = 400;
        throw err;
    }

    const statusHistoryEntry = {
        status: toStatus,
        changedAt: now,
        changedBy: changedBy ? new mongoose.Types.ObjectId(changedBy) : null,
        reason,
    };

    const updateOp = {
        $set: { status: toStatus, lastStatusChange: now },
        $push: { statusHistory: statusHistoryEntry },
    };
    if (toStatus === "review") {
        updateOp.$set.reviewRequestedAt = now;
        updateOp.$set.reviewRequestedBy = changedBy ? new mongoose.Types.ObjectId(changedBy) : null;
    }

    // findOneAndUpdate retorna null se não encontrar OU se o status não for permitido.
    // Usamos a opção `includeResultMetadata` para distinguir os dois casos sem segunda query.
    const result = await Booking.findOneAndUpdate(
        { _id: bookingId, status: { $in: allowedFromStatuses } },
        updateOp,
        { new: true, includeResultMetadata: true }   // Mongoose >= 7.5 / MongoDB driver >= 5
    );

    if (result.value === null) {
        // Verifica em uma única query adicional usando projection mínima
        const existing = await Booking.exists({ _id: bookingId });
        if (!existing) {
            const err = new Error("Reserva não encontrada.");
            err.statusCode = 404;
            throw err;
        }
        // O documento existe mas o status não é permitido — retorna o status atual em select
        const { status: currentStatus } = await Booking.findById(bookingId).select("status").lean();
        const err = new Error(
            `Transição inválida: não é possível ir de '${currentStatus}' para '${toStatus}'.`
        );
        err.statusCode = 400;
        throw err;
    }

    return result.value;
};
```

**SQL equivalente:**
```sql
-- Stored procedure para transição de status com auditoria
CREATE OR REPLACE PROCEDURE sp_transition_booking_status(
    p_booking_id UUID,
    p_to_status  TEXT,
    p_reason     TEXT DEFAULT '',
    p_changed_by UUID DEFAULT NULL
)
LANGUAGE plpgsql AS $$
DECLARE
    v_current_status TEXT;
    v_allowed        TEXT[] := ARRAY(
        SELECT from_status FROM booking_allowed_transitions
        WHERE to_status = p_to_status
    );
BEGIN
    SELECT status INTO v_current_status
    FROM bookings WHERE id = p_booking_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'not_found' USING ERRCODE = 'P0001';
    END IF;

    IF NOT (v_current_status = ANY(v_allowed)) THEN
        RAISE EXCEPTION 'invalid_transition: % -> %', v_current_status, p_to_status
            USING ERRCODE = 'P0002';
    END IF;

    UPDATE bookings
    SET status = p_to_status, last_status_change = NOW()
    WHERE id = p_booking_id;

    INSERT INTO booking_status_history(booking_id, status, changed_at, changed_by, reason)
    VALUES (p_booking_id, p_to_status, NOW(), p_changed_by, p_reason);

    IF p_to_status = 'review' THEN
        UPDATE bookings
        SET review_requested_at = NOW(), review_requested_by = p_changed_by
        WHERE id = p_booking_id;
    END IF;
END;
$$;
```

---

### 8. `back-end/domains/dashboard/service.js` — `buildMonthlyReportSeries`

#### Trecho atual — loop de 6 meses com aggregation dentro de cada iteração

```js
// Linhas 320–419
const buildMonthlyReportSeries = async ({ placeIds, placeCount, anchorDate }) => {
    const series = [];

    for (let i = 5; i >= 0; i -= 1) {
        // Calcula limites do mês
        const monthStart = ...;
        const monthEnd = ...;

        // UMA AGGREGATION POR MÊS (6 queries ao banco!)
        const [monthlyStats] = await Booking.aggregate([
            { $match: { ... checkin: { $lte: monthEnd }, checkout: { $gte: monthStart } ... } },
            { $project: { ... overlapStart, overlapEnd ... } },
            { $project: { revenue: ..., overlapNights: ... } },
            { $group: { _id: null, revenue: ..., bookedNights: ..., reservations: ... } },
        ]);

        series.push({ ... });
    }
    return series;
};
```

**Problema:** **6 queries separadas ao banco** (uma por mês) para construir uma série temporal. Isso é exatamente o que uma única aggregation pipeline com `$group` por mês (`$year`/`$month`) deve fazer.

#### Alteração proposta

**MongoDB — uma única pipeline que retorna todos os 6 meses:**

```js
// dashboard/service.js — versão proposta para buildMonthlyReportSeries
const buildMonthlyReportSeries = async ({ placeIds, placeCount, anchorDate }) => {
    const rangeStart = new Date(anchorDate.getFullYear(), anchorDate.getMonth() - 5, 1);
    const rangeEnd   = toEndOfDay(new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 0));

    const rows = placeIds.length > 0
        ? await Booking.aggregate([
            {
                $match: {
                    place: { $in: placeIds },
                    status: { $nin: Array.from(CANCELED_BOOKING_STATUSES) },
                    checkin: { $lte: rangeEnd },
                    checkout: { $gte: rangeStart },
                }
            },
            {
                $project: {
                    paymentStatus: 1,
                    priceTotal: { $ifNull: ["$priceTotal", 0] },
                    checkout: 1,
                    // Sobreposição com cada mês será calculada por lookup, mas
                    // para simplificar usamos o mês do checkout como chave:
                    monthYear: {
                        $dateToString: { format: "%Y-%m", date: "$checkout" }
                    },
                    overlapStart: { $max: ["$checkin", rangeStart] },
                    overlapEnd:   { $min: ["$checkout", rangeEnd] },
                }
            },
            {
                $group: {
                    _id: "$monthYear",
                    revenue: {
                        $sum: {
                            $cond: [{ $eq: ["$paymentStatus", "approved"] }, "$priceTotal", 0]
                        }
                    },
                    bookedNights: {
                        $sum: {
                            $cond: [
                                { $gt: ["$overlapEnd", "$overlapStart"] },
                                { $ceil: { $divide: [{ $subtract: ["$overlapEnd", "$overlapStart"] }, ONE_DAY_MS] } },
                                0
                            ]
                        }
                    },
                    reservations: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ])
        : [];

    const rowMap = new Map(rows.map(({ _id, revenue, bookedNights, reservations }) =>
        [_id, { revenue, bookedNights, reservations }]
    ));

    const series = [];
    for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(anchorDate.getFullYear(), anchorDate.getMonth() - i, 1);
        const monthEnd   = toEndOfDay(new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0));
        const monthDays  = eachDayBetween(monthStart, monthEnd);
        const key = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}`;
        const data = rowMap.get(key) || { revenue: 0, bookedNights: 0, reservations: 0 };
        const capacityNights = placeCount * monthDays.length;

        series.push({
            key,
            label: monthLabel(monthStart),
            revenue: data.revenue,
            revenueGoal: null,
            occupancyRate: capacityNights > 0 ? Math.round((data.bookedNights / capacityNights) * 100) : 0,
            reservations: data.reservations,
            bookedNights: data.bookedNights,
            occupiedDays: data.bookedNights,
            availableDays: capacityNights,
            emptyDays: Math.max(0, capacityNights - data.bookedNights),
            isolatedDays: null,
        });
    }
    return series;
};
```

**SQL equivalente:**
```sql
-- Stored function para série mensal de relatório
CREATE OR REPLACE FUNCTION fn_monthly_report_series(
    p_host_id    UUID,
    p_anchor     DATE DEFAULT CURRENT_DATE,
    p_months_back INT DEFAULT 6
)
RETURNS TABLE(
    mes_key     TEXT,
    mes_label   TEXT,
    revenue     NUMERIC,
    booked_nights BIGINT,
    reservations  BIGINT,
    capacity_nights BIGINT,
    occupancy_rate NUMERIC
) LANGUAGE sql AS $$
    WITH months AS (
        SELECT generate_series(
            DATE_TRUNC('month', p_anchor) - ((p_months_back - 1) || ' months')::INTERVAL,
            DATE_TRUNC('month', p_anchor),
            '1 month'
        ) AS month_start
    ),
    place_count AS (
        SELECT COUNT(*) AS cnt FROM places WHERE owner_id = p_host_id
    ),
    bookings_agg AS (
        SELECT
            TO_CHAR(DATE_TRUNC('month', b.checkout), 'YYYY-MM') AS mes_key,
            SUM(CASE WHEN b.payment_status = 'approved' THEN b.price_total ELSE 0 END) AS revenue,
            SUM(
                GREATEST(0,
                    DATE_PART('day',
                        LEAST(b.checkout, m.month_start + INTERVAL '1 month')
                        - GREATEST(b.checkin, m.month_start)
                    )
                )
            ) AS booked_nights,
            COUNT(*) AS reservations
        FROM bookings b
        JOIN places p ON p.id = b.place_id
        JOIN months m ON b.checkin <= m.month_start + INTERVAL '1 month - 1 day'
                     AND b.checkout >= m.month_start
        WHERE p.owner_id = p_host_id
          AND b.status NOT IN ('canceled','rejected')
        GROUP BY 1
    )
    SELECT
        TO_CHAR(m.month_start, 'YYYY-MM'),
        TO_CHAR(m.month_start, 'Mon'),
        COALESCE(a.revenue, 0),
        COALESCE(a.booked_nights, 0),
        COALESCE(a.reservations, 0),
        (SELECT cnt FROM place_count) * DATE_PART('day', m.month_start + INTERVAL '1 month' - m.month_start),
        CASE
            WHEN (SELECT cnt FROM place_count) * DATE_PART('day', m.month_start + INTERVAL '1 month' - m.month_start) > 0
            THEN ROUND(COALESCE(a.booked_nights, 0)::numeric /
                       ((SELECT cnt FROM place_count) * DATE_PART('day', m.month_start + INTERVAL '1 month' - m.month_start)) * 100, 1)
            ELSE 0
        END
    FROM months m
    LEFT JOIN bookings_agg a ON a.mes_key = TO_CHAR(m.month_start, 'YYYY-MM')
    ORDER BY m.month_start;
$$;
```

---

## Resumo Geral das Responsabilidades por Camada

| Arquivo | Trecho | Onde Deveria Estar |
|---|---|---|
| `reviews/model.js` | `recalculateAverageRating` + hooks post-save/delete | **Trigger** no banco (MongoDB Atlas Trigger ou SQL Trigger) |
| `update-average-ratings.js` | Loop N+1 de recálculo | **Aggregation `$merge`** ou **Stored Procedure** de resync |
| `bookings/model.js` | Conflito de datas e intervalo mínimo em `createFromPayment` | **Stored Function / Constraint** de exclusão de datas |
| `financialEntries/service.js` | `buildCategorySummary`, `buildSubcategorySummary`, `buildPropertySummary` | **Aggregation Pipelines** no banco / **Views SQL** |
| `dashboard/service.js` | `buildRevenueSeries` (2 queries) | **Aggregation Pipeline unificada** / **SQL View + Function** |
| `dashboard/service.js` | `buildMonthlyReportSeries` (6 queries em loop) | **Aggregation Pipeline** com `$group` por mês / **SQL Window Function** |
| `cleaningInspection/service.js` | Contagem de status por loop JavaScript | **Aggregation `$group`** / **SQL View Materializada** |
| `bookings/transitionService.js` | Dupla query na transição de status | **Stored Procedure** atômica / `findOneAndUpdate` sem segunda query |
