# 🔧 Quick Reference & Troubleshooting

## 📌 Resumo Rápido

| O que | Onde | Como |
|------|------|------|
| **Criar notificação** | Backend evento | `await createNotification(userId, type, entityId, data)` |
| **Sincronizar** | Frontend on connect | `GET /api/notifications` |
| **Receber em tempo real** | WebSocket | `socket.on("notification:new", ...)` |
| **Marcar como lida** | Frontend UI | `PATCH /api/notifications/:id/read` |
| **Descartar** | Frontend UI | `PATCH /api/notifications/:id/dismiss` |
| **Contar não lidas** | Frontend UI | `GET /api/notifications/unread-count` |

---

## 🚀 Quick Start (5 minutos)

### Backend

1. **Mover arquivos para lugar correto**
```bash
mkdir back-end/domains/notifications
mkdir back-end/websocket
mkdir back-end/events

mv back-end/NotificationModel.js back-end/domains/notifications/model.js
mv back-end/NotificationService.js back-end/domains/notifications/service.js
mv back-end/NotificationRoutes.js back-end/domains/notifications/routes.js
mv back-end/NotificationWebSocket.js back-end/websocket/notification.js
mv back-end/EventHandlers.js back-end/events/handlers.js
```

2. **Atualizar `back-end/routes/index.js`**
```javascript
import NotificationRoutes from "../domains/notifications/routes.js";

router.use("/notifications", NotificationRoutes);
```

3. **Atualizar `back-end/server.js`**
```javascript
import http from "http";
import { initializeNotificationWebSocket } from "./websocket/notification.js";

const httpServer = http.createServer(app);
const io = initializeNotificationWebSocket(httpServer);

httpServer.listen(PORT);
```

4. **Instalar socket.io**
```bash
cd back-end
npm install socket.io
```

### Frontend

1. **Instalar socket.io-client**
```bash
cd front-end
npm install socket.io-client
```

2. **Atualizar `front-end/src/App.jsx`**
```javascript
import { NotificationProvider } from "@/components/contexts/NotificationContextEventBased";

<NotificationProvider>
  {/* app */}
</NotificationProvider>
```

3. **Remover useEffect duplicados**
- Procurar por `useEffect` que cria notificações
- Remover
- Backend vai criar via evento

---

## 🛠️ Integração em 10 Segundos

### Quando usuário cria algo (ex: reserva)

```javascript
// imports
import { onReservationCreated } from "../../events/handlers.js";

// no handler
await onReservationCreated(booking, guestUser, hostUser);
```

### Quando algo específico acontece (ex: pagamento)

```javascript
// import
import { onPaymentSuccess, onPaymentFailed } from "../../events/handlers.js";

// no webhook
if (status === "approved") {
  await onPaymentSuccess(booking, paymentDetails, userId);
}
```

---

## 🐛 Troubleshooting

### ❌ WebSocket não conecta

**Sintomas**: Notificações não chegam em tempo real, console mostra erro de conexão

**Solução**:
```javascript
// 1. Verificar se servidor está rodando
curl http://localhost:3001

// 2. Verificar CORS em NotificationWebSocket.js
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",  // ✅ Correto
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// 3. Verificar token em localStorage
localStorage.getItem("authToken")  // Deve ter valor

// 4. Verificar console do backend
// Deve mostrar: "[WebSocket] Cliente conectado: ..."
```

### ❌ Notificações duplicadas após reload

**Sintomas**: Mesma notificação aparece 2x+ após Ctrl+R

**Solução**:
```javascript
// 1. Verificar índice MongoDB
db.notifications.getIndexes()
// Deve ter: idx_notification_dedup

// 2. Se não existir, recriar
db.notifications.dropIndex("idx_notification_dedup")
// Backend vai recriar ao iniciar

// 3. Verificar se `dismissed: false` está sendo consultado
// Em NotificationModel.js, linha que cria índice
notificationSchema.index(
  { userId: 1, type: 1, entityId: 1 },
  { partialFilterExpression: { dismissed: false } }  // ✅ Importante
);
```

### ❌ Toast não desaparece

**Sintomas**: Toast fica na tela por mais de 5 segundos

**Solução**:
```javascript
// Em NotificationToast.jsx ou NotificationDropdown.jsx
useEffect(() => {
  const timer = setTimeout(() => {
    removeFromToastQueue(notification._id);  // ✅ Remove após 5s
  }, 5000);
  
  return () => clearTimeout(timer);
}, [notification._id, removeFromToastQueue]);
```

### ❌ Backend não envia notificação

**Sintomas**: Nenhum log de notificação criada, usuário não recebe

**Solução**:
```javascript
// 1. Verificar se evento está sendo disparado
console.log("[Bookings] Reserva criada, disparando notificações...");
await onReservationCreated(booking, guestUser, hostUser);
console.log("[Bookings] Notificações disparadas");

// 2. Verificar se há erro silencioso em handlers
// Adicionar try/catch com logs
try {
  await createNotification(...);
  console.log("[Notification] ✅ Criada com sucesso");
} catch (error) {
  console.error("[Notification] ❌ Erro:", error.message);
}

// 3. Verificar se usuários têm _id válido
console.log("Guest ID:", guestUser._id);
console.log("Host ID:", hostUser._id);

// 4. Verificar se notificação foi salva no MongoDB
db.notifications.findOne({ userId: ObjectId("...") })
```

### ❌ Notificação criada mas não chega ao frontend

**Sintomas**: Log "[Notification] Criada" mas não aparece na UI

**Solução**:
```javascript
// 1. Verificar se socket está conectado
console.log("[WebSocket] Usuário identificado:", userId);
// Deve aparecer no log quando conecta

// 2. Verificar se userSocketMap tem o mapa correto
// Em NotificationWebSocket.js
socket.on("identify", (userId) => {
  userSocketMap.set(userId.toString(), socket.id);
  console.log(`[WebSocket] Mapeado ${userId} → ${socket.id}`);
});

// 3. Verificar se evento está sendo emitido
notificationEventEmitter.on("notification:created", ({ userId, notification }) => {
  console.log(`[Event] Notificação criada para ${userId}`);
  const socketId = userSocketMap.get(userId.toString());
  console.log(`[Event] Socket encontrado: ${socketId}`);
  
  if (socketId) {
    io.to(socketId).emit("notification:new", notification);
    console.log(`[Event] ✅ Enviado ao socket`);
  } else {
    console.log(`[Event] ❌ Socket não encontrado`);
  }
});

// 4. Verificar se frontend está escutando
socket.on("notification:new", (notification) => {
  console.log("[Frontend] Notificação recebida:", notification);  // ✅ Deve aparecer
});
```

### ❌ Erro "Índice duplicado" ao criar notificação

**Sintomas**: MongoDB erro `E11000 duplicate key error`

**Solução**:
```javascript
// Isso é esperado! O findOrCreate trata isso:
// back-end/NotificationService.js, linha ~50

catch (error) {
  if (error.code === 11000) {
    // ✅ Race condition normal
    const existing = await Notification.findOne({...});
    return { notification: existing, created: false };
  }
  throw error;
}

// Se continuar falhando:
// 1. Verificar índice
db.notifications.getIndexes()

// 2. Remover índices ruins
db.notifications.dropIndex("idx_notification_dedup")

// 3. Reiniciar backend para recriar
```

---

## 📋 Checklist de Debugging

```bash
# 1. Backend rodando?
ps aux | grep node
# Ou no Windows: tasklist | findstr node

# 2. MongoDB conectado?
# Em backend logs:
# [MongoDB] Conectado a ...

# 3. WebSocket iniciado?
# Em backend logs:
# [WebSocket] Iniciado em http://localhost:3001

# 4. Frontend conectado?
# Console do browser deve mostrar:
# [WebSocket] Conectado

# 5. Notificação criada?
# Backend logs:
# [Notification] Criada: reservation_created para ...

# 6. Emitida via WebSocket?
# Backend logs:
# [WebSocket] Notificação enviada ao usuário

# 7. Recebida no frontend?
# Browser console:
# [Frontend] Notificação recebida: {titulo, ...}
```

---

## 🔄 Fluxo de Debug

Ao testar, abra 3 janelas:

```
┌─────────────────────┬─────────────────────┬─────────────────────┐
│  Terminal Backend   │   Terminal Frontend │   Browser Console   │
│  (npm run dev)      │   (npm run dev)     │   (F12)             │
├─────────────────────┼─────────────────────┼─────────────────────┤
│                     │                     │                     │
│ [Notification]      │                     │                     │
│ Criada:             │                     │                     │
│ reservation_created │                     │                     │
│ ↓                   │                     │                     │
│ [WebSocket]         │                     │                     │
│ Notificação         │                     │                     │
│ enviada para User A │                     │                     │
│                     │                     │ [WebSocket]         │
│                     │                     │ Conectado           │
│                     │                     │ ↓                   │
│                     │                     │ [Frontend] Notif... │
│                     │                     │ recebida            │
│                     │                     │ ✅ TOAST APARECE    │
│                     │                     │                     │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

---

## 🎯 Validação Passo-a-Passo

### Teste 1: Criar Notificação

```bash
# Terminal 1: Backend
npm run dev
# Esperar por: [MongoDB] Conectado
# Esperar por: [WebSocket] Servidor rodando

# Terminal 2: Frontend
npm run dev
# Navegar para http://localhost:3000
# Abrir console (F12)

# Browser console deve mostrar:
# [WebSocket] Conectado
# [WebSocket] Identificado como usuário ...

# Criar reserva
# Browser console deve mostrar:
# [Frontend] Notificação recebida: {title: "🎉 Sua reserva..."}

# Backend logs:
# [Notification] Criada: reservation_created para ...
```

### Teste 2: Recarregar sem duplicata

```bash
# Página com notificação aberta
# Pressionar Ctrl+R
# Esperar página recarregar
# Mesmo número de notificações
# ✅ NENHUMA DUPLICATA
```

### Teste 3: Discartar

```bash
# Click em X na notificação
# Notificação desaparece
# Pressionar Ctrl+R
# Notificação NÃO reaparece
# ✅ FUNCIONANDO
```

---

## 📊 Logs Esperados

### Backend (normal)

```
[MongoDB] Conectado a mongodb://localhost:27017/dormeaqui
[Server] Servidor rodando na porta 3001
[WebSocket] Servidor WebSocket iniciado
[Bookings] Reserva criada, disparando notificações...
[Notification] Criada: reservation_created para user_123
[Notification] Criada: reservation_created para user_456
[WebSocket] Notificação enviada ao usuário user_123
[WebSocket] Notificação enviada ao usuário user_456
[WebSocket] Cliente conectado: socket_abc123
[WebSocket] Usuário user_123 identificado com socket socket_abc123
```

### Frontend (normal)

```
[WebSocket] Conectado
[WebSocket] Identificado como usuário user_123
[Frontend] Notificação recebida: {title: "🎉 Sua reserva foi confirmada!"}
[NotificationContext] Sincronizado: 1 notificações
```

---

## 🆘 Precisa de mais ajuda?

Se o erro não está aqui:

1. **Adicione logs em locais suspeitos**
   ```javascript
   console.log("[DEBUG] Variável X:", varX);
   console.log("[DEBUG] Antes de fazer Y");
   await funcaoY();
   console.log("[DEBUG] Depois de fazer Y");
   ```

2. **Verifique order de inicialização**
   - Backend começa?
   - MongoDB conecta?
   - WebSocket inicia?
   - Frontend conecta ao WebSocket?
   - Evento é disparado?
   - Notificação é criada?
   - Socket.io emite?
   - Frontend recebe?
   - UI atualiza?

3. **Reinicie tudo**
   ```bash
   # Matar processos
   pkill -f "node"
   
   # Limpar node_modules (se muito quebrado)
   rm -rf node_modules
   npm install
   
   # Reiniciar
   npm run dev
   ```

4. **Verificar token de autenticação**
   ```javascript
   // No browser console
   localStorage.getItem("authToken")
   localStorage.getItem("userId")
   // Ambos devem ter valores
   ```

---

## ✅ Você consegue!

Este é um sistema profissional. Se algo não funciona:

1. **Não é mágica** - seguir os logs
2. **Logs são amigos** - adicionar `console.log` em tudo
3. **Ordem importa** - verificar sequência de inicialização
4. **Testes isolados** - testar cada parte separadamente

Boa sorte! 🚀
