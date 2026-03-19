# 📋 Exemplo Prático Completo: Fluxo de Reserva com Notificações

Este documento mostra exatamente como integrar notificações em um fluxo real de reserva.

---

## Cenário

**Usuário A** (hóspede) cria uma reserva em um lugar de **Usuário B** (anfitrião).

Resultado esperado:
- ✅ Usuário A recebe: "🎉 Sua reserva foi confirmada!"
- ✅ Usuário B recebe: "🏠 Sua acomodação recebeu uma nova reserva!"
- ✅ Ambos veem em tempo real via WebSocket
- ✅ Notificações persistem após reload
- ✅ Não há duplicação

---

## 1️⃣ Backend: Criar o Evento

### Localizar: `back-end/domains/bookings/routes.js`

```javascript
import { Router } from "express";
import Booking from "./model.js";
import Place from "../places/model.js";
import User from "../users/model.js";
import { authenticateToken } from "../../middleware/auth.js";
import { onReservationCreated } from "../../events/handlers.js"; // ✨ NOVO

const router = Router();

/**
 * POST /bookings
 * Cria uma nova reserva
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { placeId, checkin, checkout, guests } = req.body;
    const guestUserId = req.user.id;

    // 1. Validar dados
    if (!placeId || !checkin || !checkout || !guests) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    // 2. Buscar lugar e anfitrião
    const place = await Place.findById(placeId).populate("user");
    if (!place) {
      return res.status(404).json({ error: "Lugar não encontrado" });
    }

    const guestUser = await User.findById(guestUserId);
    if (!guestUser) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // 3. Criar reserva
    const booking = new Booking({
      place: placeId,
      user: guestUserId,
      checkin,
      checkout,
      guests,
      pricePerNight: place.pricePerNight,
      priceTotal: calculateTotalPrice(place.pricePerNight, checkin, checkout),
      nights: calculateNights(checkin, checkout),
      paymentStatus: "pending",
    });

    await booking.save();
    await booking.populate("place");

    // ✨ 4. NOVO: Disparar evento de notificação
    console.log("[Bookings] Reserva criada, disparando notificações...");
    await onReservationCreated(booking, guestUser, place.user);

    // 5. Responder ao cliente
    res.status(201).json({
      success: true,
      booking: booking.toObject(),
      message: "Reserva criada com sucesso!",
    });
  } catch (error) {
    console.error("[Bookings] Erro ao criar reserva:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### O que acontece internamente

Quando `await onReservationCreated(...)` é executado:

```javascript
// Em back-end/events/handlers.js
export async function onReservationCreated(booking, guestUser, hostUser) {
  try {
    // Para o hóspede
    if (guestUser) {
      await createNotification(
        guestUser._id,
        "reservation_created",      // ← Tipo único
        booking._id.toString(),       // ← ID da reserva (entityId)
        {
          title: "🎉 Sua reserva foi confirmada!",
          message: `Sua estadia em "${booking.place.name}" foi confirmada para ${new Date(booking.checkin).toLocaleDateString("pt-BR")}...`,
          entityType: "reservation",
          link: `/bookings/${booking._id}`,
          metadata: { bookingId: booking._id.toString() },
        }
      );
    }

    // Para o anfitrião
    if (hostUser) {
      await createNotification(
        hostUser._id,
        "reservation_created",       // ← Mesmo tipo
        booking._id.toString(),       // ← Mesma reserva
        {
          title: "🏠 Sua acomodação recebeu uma nova reserva!",
          message: `"${booking.place.name}" tem uma nova reserva de ${guestUser?.firstName}...`,
          entityType: "reservation",
          link: `/host/bookings/${booking._id}`,
          metadata: { bookingId: booking._id.toString() },
        }
      );
    }
  } catch (error) {
    console.error("[Events] Erro ao criar notificações:", error);
  }
}
```

### Isso chama `NotificationService.createNotification`

```javascript
// Em back-end/NotificationService.js
export async function createNotification(
  userId,
  type,
  entityId,
  notificationData
) {
  try {
    // Usa o método findOrCreate do schema Mongoose
    const { notification, created } = await Notification.findOrCreate(
      userId,
      type,
      entityId,
      {
        title: notificationData.title,
        message: notificationData.message,
        entityType: notificationData.entityType,
        link: notificationData.link,
        metadata: notificationData.metadata,
      }
    );

    if (created) {
      // ✨ Emite evento para WebSocket
      notificationEventEmitter.emit("notification:created", {
        userId,
        notification: notification.toObject(),
      });
      console.log(`[Notification] Criada: ${type} para ${userId}`);
    } else {
      console.log(`[Notification] Duplicada detectada: ${type} para ${userId}`);
    }

    return { notification, created };
  } catch (error) {
    console.error("[Notification] Erro:", error);
    throw error;
  }
}
```

### O método `findOrCreate` do Mongoose

```javascript
// Em back-end/NotificationModel.js
notificationSchema.statics.findOrCreate = async function (
  userId,
  type,
  entityId,
  notificationData
) {
  const Notification = this;

  try {
    // 1. Tenta buscar notificação existente
    const existing = await Notification.findOne({
      userId,
      type,
      entityId: entityId || null,
      dismissed: false,  // ← Importante: só busca não descartadas
    });

    if (existing) {
      // ✅ JÁ EXISTE: só atualiza timestamp
      existing.updatedAt = new Date();
      await existing.save();
      return { notification: existing, created: false };
    }

    // 2. Se não existe, cria nova
    const newNotification = new Notification({
      userId,
      type,
      entityId: entityId || null,
      ...notificationData,
    });

    await newNotification.save();
    return { notification: newNotification, created: true };
  } catch (error) {
    if (error.code === 11000) {
      // Race condition: 2 requisições criaram ao mesmo tempo
      // Tenta buscar novamente
      const existing = await Notification.findOne({
        userId,
        type,
        entityId: entityId || null,
        dismissed: false,
      });
      return { notification: existing, created: false };
    }
    throw error;
  }
};
```

---

## 2️⃣ WebSocket: Enviar para o Frontend

Quando `notificationEventEmitter.emit("notification:created", ...)` é executado:

```javascript
// Em back-end/NotificationWebSocket.js
notificationEventEmitter.on("notification:created", ({ userId, notification }) => {
  // Encontra o socket do usuário
  const socketId = userSocketMap.get(userId.toString());
  
  if (socketId) {
    // Envia a notificação para o cliente
    io.to(socketId).emit("notification:new", notification);
    console.log(`[WebSocket] Notificação enviada para ${userId}`);
  }
});
```

---

## 3️⃣ Frontend: Receber e Exibir

### Quando o usuário abre a aplicação

**Em `front-end/src/App.jsx`:**

```javascript
import { NotificationProvider } from "@/components/contexts/NotificationContextEventBased";

function App() {
  return (
    <NotificationProvider>
      {/* Resto da app */}
    </NotificationProvider>
  );
}
```

### O que acontece em `NotificationContextEventBased.jsx`

```javascript
// 1. Conecta WebSocket
useEffect(() => {
  const connectWebSocket = () => {
    socketRef.current = io(window.location.origin, {
      auth: { token: localStorage.getItem("authToken") },
    });

    socketRef.current.on("connect", () => {
      // 2. Sincroniza notificações existentes
      syncNotificationsFromBackend();
    });

    // 3. Escuta notificações em tempo real
    socketRef.current.on("notification:new", (notification) => {
      addNotificationLocal(notification);
    });
  };

  connectWebSocket();
}, []);

// 4. Sincroniza com backend
const syncNotificationsFromBackend = useCallback(async () => {
  const token = localStorage.getItem("authToken");
  
  const response = await fetch("/api/notifications?page=1&limit=100", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();
  setNotifications(data.notifications);  // ✅ Carrega do backend
}, []);

// 5. Adiciona notificação local
const addNotificationLocal = useCallback((notification) => {
  setNotifications((prev) => {
    // ✅ Verifica duplicata por ID
    if (prev.some((n) => n._id === notification._id)) {
      return prev;  // Ignora duplicata
    }
    return [notification, ...prev];
  });

  // ✅ Adiciona ao toast para exibição temporária
  setToastQueue((prev) => [...prev, notification]);
}, []);
```

### Resultado

1. **Toast aparece** (auto-dismiss em 5s)
2. **Notificação é adicionada à central**
3. **Badge de contagem atualiza**

---

## 4️⃣ Teste: Recarregar Página

Usuário pressiona Ctrl+R:

### O que NÃO acontece (sistema antigo)
```javascript
// ❌ VELHO: onCreate/useEffect criava notificação ao carregar
useEffect(() => {
  addNotification({ title: "Reserva confirmada" });  // Executa a CADA reload
}, []);

// Resultado: cada reload = nova duplicata
// 1º load:    1 notificação
// Reload:     2 notificações iguais
// Reload:     3 notificações iguais
// ...
```

### O que ACONTECE (novo sistema)
```javascript
// ✅ NOVO: sincroniza com backend

useEffect(() => {
  socketRef.current.on("connect", () => {
    // 1. Conecta ao WebSocket
    // 2. Sincroniza com backend: GET /api/notifications
    // 3. Carrega mesma notificação (por ID)
    // 4. Nenhuma notificação duplicada é criada
  });
}, []);

// Resultado: mesma notificação em todos os reloads
// 1º load:    1 notificação (criada no backend)
// Reload:     1 notificação (sincronizada do backend)
// Reload:     1 notificação (sincronizada do backend)
// ...
```

---

## 5️⃣ Teste: Descartar Notificação

Usuário clica no X ou swipe:

```javascript
// Em NotificationDropdown.jsx ou NotificationItem.jsx
const handleDismiss = async (notificationId) => {
  // 1. Chama API
  const token = localStorage.getItem("authToken");
  await fetch(`/api/notifications/${notificationId}/dismiss`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });

  // 2. Backend atualiza: dismissed = true
  // 3. Notificação desaparece do frontend
  // 4. Usuário recarrega: notificação NÃO reaparece
  //    (porque dismissed=true, não está na query)
};
```

---

## 6️⃣ Teste: 2 Abas Diferentes

Abrir conta em 2 abas (mesmo usuário):

### Aba 1: Criar Reserva
```
Aba 1 → POST /bookings
         ↓
        Backend cria notificação
         ↓
        WebSocket emite notification:new
         ↓
        Aba 1 recebe ✅
        Aba 2 recebe ✅  (porque são mesmo usuário)
```

### Aba 2: Vê em Tempo Real
- Notificação aparece **sem recarregar**
- Toast aparece
- Badge atualiza

---

## 7️⃣ Teste: 2 Usuários Diferentes

Abrir conta de 2 usuários (em computadores diferentes ou incógnito):

### Hóspede (User A)
```
POST /bookings (como User A)
↓
Cria notificação para User A: "🎉 Sua reserva..."
↓
WebSocket envia APENAS para User A
↓
User B NÃO recebe (socket diferente)
```

### Anfitrião (User B)
```
Recebe notificação: "🏠 Nova reserva..."
(em tempo real ou ao recarregar)
```

---

## 📊 Fluxo de Dados Completo

```
FRONTEND (User A)          BACKEND                    DATABASE
─────────────────          ───────                    ────────

User cria
reserva
│
POST /bookings
├──────────────────────→ Handler cria booking
│                        │
│                        ├─→ Salva em Booking collection
│                        │
│                        ├─→ Dispara onReservationCreated
│                        │   ├─→ createNotification(User A, ...)
│                        │   │   └─→ Notification.findOrCreate
│                        │   │       ├─→ Busca existente ❌
│                        │   │       └─→ Cria nova ✅  ──→ Salva em Notification collection
│                        │   │       └─→ Emite notification:created
│                        │   │
│                        │   └─→ createNotification(User B, ...)
│                        │       └─→ Idem (cria outra notificação)
│                        │
│                        └─→ Responde 201
│                             ↓
Response 201
│
Toast aparece ✅
(gerado localmente, antes do WebSocket)
│
Aguarda WebSocket...
        ↓
User A socket conectado
│
socketRef.on("notification:new", ...)
├─→ Recebe notificação de User A ✅
│   (talvez já exista localmente do POST response)
│
Simultaneamente:
User B socket conectado
│
socketRef.on("notification:new", ...)
├─→ Recebe notificação de User B ✅
│
Ambos veem notificações ✅
Reload não duplica ✅
```

---

## ✅ Validação Final

Checklist para validar que está funcionando:

- [ ] Criar reserva
- [ ] Toast aparece em <1 segundo
- [ ] Notificação na central
- [ ] Badge mostra 1 não lida
- [ ] Recarregar página
- [ ] Mesma notificação aparece (não duplica)
- [ ] Abrir em 2 abas
- [ ] Criar reserva na aba 1
- [ ] Aba 2 recebe em tempo real
- [ ] Discartar notificação
- [ ] Recarregar: não reaparece
- [ ] Marcar como lida
- [ ] Badge atualiza

---

## 🎯 Resultado Final

✅ **Sistema realista como WhatsApp/Airbnb/Uber**
- Notificações apenas de eventos reais
- Sem duplicação
- Funciona em múltiplas abas
- Persiste após reload
- Descartáveis
- Histórico correto
