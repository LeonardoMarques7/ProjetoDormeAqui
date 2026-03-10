/**
 * DormeAqui — Mock Notifications Server
 *
 * Express development server that simulates the notifications API.
 * Requires an `Authorization` header on every request (any non-empty value
 * is accepted); missing header returns HTTP 401.
 *
 * Usage:
 *   npm start          # production-like
 *   npm run dev        # hot-reload via nodemon
 *
 * Default port: 3001
 * Configure Vite proxy to forward /api/notifications → http://localhost:3001
 */

const express = require("express");
const cors = require("cors");

const PORT = process.env.PORT || 3001;

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------
let notifications = [
  {
    _id: "1",
    type: "success",
    title: "Reserva confirmada",
    message: "Sua reserva no Chalé da Montanha foi confirmada para 15/08.",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    link: "/account/bookings",
  },
  {
    _id: "2",
    type: "info",
    title: "Nova avaliação recebida",
    message: "João deixou uma avaliação 5 estrelas na sua acomodação.",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    link: "/account/places",
  },
  {
    _id: "3",
    type: "warning",
    title: "Pagamento pendente",
    message: "Sua reserva aguarda confirmação de pagamento.",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    link: "/account/bookings",
  },
  {
    _id: "4",
    type: "info",
    title: "Bem-vindo ao DormeAqui!",
    message: "Explore acomodações incríveis e faça sua primeira reserva.",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    link: "/",
  },
  {
    _id: "5",
    type: "error",
    title: "Pagamento recusado",
    message:
      "O pagamento da reserva #5678 foi recusado. Verifique seu cartão.",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    link: "/account/bookings",
  },
  {
    _id: "6",
    type: "info",
    title: "Nova mensagem recebida",
    message: "Maria enviou uma mensagem sobre sua acomodação.",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    link: "/account/profile",
  },
];

let nextId = 7;

// ---------------------------------------------------------------------------
// App setup
// ---------------------------------------------------------------------------
const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// ---------------------------------------------------------------------------
// Auth middleware — requires any non-empty Authorization header
// ---------------------------------------------------------------------------
function requireAuth(req, res, next) {
  const auth = req.headers["authorization"];
  if (!auth || auth.trim() === "") {
    return res.status(401).json({ error: "Unauthorized: Authorization header required." });
  }
  next();
}

app.use("/api/notifications", requireAuth);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// GET /api/notifications?page=1&limit=10
app.get("/api/notifications", (req, res) => {
  const page = Math.max(1, parseInt(req.query.page ?? "1", 10));
  const limit = Math.max(1, parseInt(req.query.limit ?? "10", 10));
  const start = (page - 1) * limit;
  const slice = notifications.slice(start, start + limit);
  res.json({ notifications: slice, total: notifications.length, page });
});

// POST /api/notifications
app.post("/api/notifications", (req, res) => {
  const { type = "info", title, message, link } = req.body ?? {};
  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }
  const notification = {
    _id: String(nextId++),
    type,
    title,
    message: message ?? "",
    read: false,
    createdAt: new Date().toISOString(),
    link: link ?? null,
  };
  notifications.unshift(notification);
  res.status(201).json(notification);
});

// PATCH /api/notifications/mark-all-read
app.patch("/api/notifications/mark-all-read", (req, res) => {
  notifications.forEach((n) => {
    n.read = true;
  });
  res.json({ success: true });
});

// PATCH /api/notifications/:id/read
app.patch("/api/notifications/:id/read", (req, res) => {
  const n = notifications.find((x) => x._id === req.params.id);
  if (!n) {
    return res.status(404).json({ error: "Notification not found" });
  }
  n.read = true;
  res.json({ success: true });
});

// DELETE /api/notifications/clear
app.delete("/api/notifications/clear", (req, res) => {
  notifications.splice(0, notifications.length);
  res.json({ success: true });
});

// DELETE /api/notifications/:id
app.delete("/api/notifications/:id", (req, res) => {
  const idx = notifications.findIndex((x) => x._id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: "Notification not found" });
  }
  notifications.splice(idx, 1);
  res.json({ success: true });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`✅  DormeAqui Mock Server running at http://localhost:${PORT}`);
  console.log(`   Endpoints:`);
  console.log(`     GET    /api/notifications?page=&limit=`);
  console.log(`     POST   /api/notifications`);
  console.log(`     PATCH  /api/notifications/mark-all-read`);
  console.log(`     PATCH  /api/notifications/:id/read`);
  console.log(`     DELETE /api/notifications/clear`);
  console.log(`     DELETE /api/notifications/:id`);
  console.log(`   All routes require an Authorization header.`);
});
