# 🚀 Guia de Implementação: Sistema de Notificações Baseado em Eventos

## ⚡ Resumo Executivo

O sistema foi redesenhado para:
- ✅ **Criar notificações APENAS em eventos reais** (não em page loads)
- ✅ **Evitar duplicatas** com verificação única `(userId, type, entityId)`
- ✅ **Sincronizar em tempo real** via WebSocket
- ✅ **Persistir corretamente** no banco de dados
- ✅ **Sobreviver ao reload** de página

---

## 📁 Arquivos Criados

### Backend (Node.js/Express)

```
back-end/
├── NotificationModel.js          # Schema MongoDB + método findOrCreate
├── NotificationService.js         # Lógica principal de notificações
├── NotificationRoutes.js          # Rotas HTTP da API
├── NotificationWebSocket.js       # Gerenciador WebSocket
└── EventHandlers.js              # Exemplos de integração com eventos
```

### Frontend (React)

```
front-end/src/components/
└── contexts/
    └── NotificationContextEventBased.jsx  # Novo context com WebSocket
```

---

## 🔧 Passo 1: Integrar Backend

### 1.1 Mover arquivos para a estrutura correta

Os arquivos foram criados temporariamente na raiz. Você precisa:

1. **Criar diretório**: `back-end/domains/notifications/`
2. **Mover arquivos**:
   - `back-end/NotificationModel.js` → `back-end/domains/notifications/model.js`
   - `back-end/NotificationService.js` → `back-end/domains/notifications/service.js`
   - `back-end/NotificationRoutes.js` → `back-end/domains/notifications/routes.js`
3. **Mover arquivos de utilidade**:
   - `back-end/NotificationWebSocket.js` → `back-end/websocket/notification.js`
   - `back-end/EventHandlers.js` → `back-end/events/handlers.js`

### 1.2 Atualizar imports

Após mover, atualizar os imports nos arquivos:

**Em `back-end/routes/index.js`:**

```javascript
// Adicionar no topo:
import NotificationRoutes from "../domains/notifications/routes.js";

// Adicionar após as outras rotas:
router.use("/notifications", NotificationRoutes);
```

### 1.3 Inicializar WebSocket

**Em `back-end/server.js` ou `back-end/index.js`:**

```javascript
import http from "http";
import { initializeNotificationWebSocket } from "./websocket/notification.js";

// Após criar a instância do Express:
const app = express();
const httpServer = http.createServer(app);

// Inicializar WebSocket
const io = initializeNotificationWebSocket(httpServer);

// Em vez de app.listen(), usar:
httpServer.listen(process.env.PORT || 3001, () => {
  console.log("Servidor rodando com WebSocket");
});
```

### 1.4 Cron Job para Limpeza (Opcional)

Adicione em `back-end/server.js`:

```javascript
import { cleanupOldNotifications } from "./domains/notifications/service.js";

// Executar limpeza a cada dia (1:00 AM)
schedule.scheduleJob("0 1 * * *", async () => {
  console.log("[CRON] Limpando notificações antigas...");
  await cleanupOldNotifications(30);
});
```

---

## 🎯 Passo 2: Integrar Eventos de Negócio

### 2.1 Reserva Criada

**Em `back-end/domains/bookings/routes.js` (ou onde criar reserva)**

```javascript
import { onReservationCreated } from "../../events/handlers.js";

// No handler que cria a reserva:
async function createBooking(req, res) {
  try {
    const booking = await Booking.create({...});
    
    // Buscar usuários
    const guestUser = await User.findById(booking.user);
    const hostUser = await User.findById(booking.place.user);
    
    // Disparar notificações
    await onReservationCreated(booking, guestUser, hostUser);
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### 2.2 Pagamento Aprovado

**Em `back-end/domains/payments/routes.js` (webhook ou callback)**

```javascript
import { onPaymentSuccess, onPaymentFailed } from "../../events/handlers.js";

// No webhook de pagamento Mercado Pago:
async function handlePaymentWebhook(req, res) {
  const { payment_id, status } = req.body;
  
  const booking = await Booking.findOne({ mercadopagoPaymentId: payment_id });
  const user = await User.findById(booking.user);
  
  if (status === "approved") {
    await onPaymentSuccess(booking, { 
      amount: req.body.amount,
      paymentId: payment_id 
    }, user._id);
  } else if (status === "rejected") {
    await onPaymentFailed(booking, { 
      amount: req.body.amount,
      reason: req.body.reason 
    }, user._id);
  }
  
  res.json({ success: true });
}
```

### 2.3 Login/Logout

**Em `back-end/domains/users/routes.js`:**

```javascript
import { onUserLogin, onUserLogout } from "../../events/handlers.js";

// No endpoint de login:
router.post("/login", async (req, res) => {
  // ... autenticação ...
  const user = await User.findById(userId);
  
  // Criar notificação
  await onUserLogin(user);
  
  res.json({ token });
});

// No endpoint de logout:
router.post("/logout", authenticateToken, async (req, res) => {
  const user = await User.findById(req.user.id);
  
  // Criar notificação
  await onUserLogout(user);
  
  res.json({ success: true });
});
```

---

## 🎨 Passo 3: Integrar Frontend

### 3.1 Substituir NotificationProvider

**Em `front-end/src/App.jsx`:**

```javascript
// Remover:
// import { NotificationProvider } from "@/components/contexts/NotificationContext";

// Adicionar:
import { NotificationProvider } from "@/components/contexts/NotificationContextEventBased";

// Manter o restante igual
function App() {
  return (
    <NotificationProvider>
      {/* resto da app */}
    </NotificationProvider>
  );
}
```

### 3.2 Instalar socket.io-client

```bash
cd front-end
npm install socket.io-client
```

### 3.3 Remover useEffect que cria notificações

**Procure e remova:**

1. Em `front-end/src/pages/PaymentSuccess.jsx`:
```javascript
// ❌ REMOVER ISTO:
useEffect(() => {
  if (!hasShownMessage.current) {
    showMessage("Pagamento aprovado! Sua reserva foi confirmada.", "success");
    hasShownMessage.current = true;
  }
}, []);
```

2. Em `front-end/src/components/layout/CardNav.jsx`:
```javascript
// ✅ MANTER APENAS O LOGOUT:
const logout = async () => {
  try {
    await axios.post("/users/logout", {}, { withCredentials: true });
    // ❌ REMOVER addNotification daqui
    navigate("/");
  } catch (error) {
    // erro
  }
};
```

A notificação de logout será criada pelo backend via evento.

---

## 🧪 Passo 4: Testar

### 4.1 Teste Manual

```bash
# Terminal 1: Backend
cd back-end
npm start

# Terminal 2: Frontend
cd front-end
npm run dev
```

### 4.2 Testar Fluxo Completo

1. **Abrir 2 abas do navegador**: uma como hóspede, outra como anfitrião
2. **Criar uma reserva** como hóspede
3. **Verificar notificações**:
   - ✅ Hóspede recebe: "🎉 Sua reserva foi confirmada!"
   - ✅ Anfitrião recebe: "🏠 Sua acomodação recebeu uma nova reserva!"
   - ✅ Toast aparece automaticamente
   - ✅ Adicionadas à central

### 4.3 Testar Deduplicação

1. **Criar uma reserva** (notificação criada)
2. **Recarregar página** (Ctrl+R)
3. **Verificar**: mesma notificação aparece, MAS não duplicada
4. **Discartar notificação**
5. **Recarregar novamente**: notificação NÃO reaparece

### 4.4 Testar em 2 Abas

1. **Abrir mesma conta em 2 abas**
2. **Criar reserva na aba 1**
3. **Verificar na aba 2**: notificação aparece em tempo real (WebSocket)

---

## 📊 Estrutura de Dados

### Notificação no MongoDB

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: "reservation_created",
  title: "🎉 Sua reserva foi confirmada!",
  message: "Sua estadia em XYZ foi confirmada...",
  entityId: "reservation_123",
  entityType: "reservation",
  read: false,
  dismissed: false,
  link: "/bookings/reservation_123",
  metadata: {
    bookingId: "reservation_123",
    placeId: "place_456",
    checkIn: "2026-03-20T00:00:00Z"
  },
  createdAt: "2026-03-14T12:30:00Z",
  updatedAt: "2026-03-14T12:30:00Z"
}
```

### Índice Único

O schema cria índice único em:
- `userId`
- `type`
- `entityId`
- `dismissed: false`

Isso garante que a mesma notificação não seja criada 2x enquanto não for descartada.

---

## 🔄 Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuário cria reserva no frontend                         │
└────────────────────┬────────────────────────────────────────┘
                     │ POST /bookings
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Backend salva reserva no MongoDB                         │
└────────────────────┬────────────────────────────────────────┘
                     │ 
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Backend dispara evento onReservationCreated              │
│    (cria notificação com findOrCreate)                      │
└────────────────────┬────────────────────────────────────────┘
                     │ Emite: notification:created
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. WebSocket envia notificação ao frontend                  │
└────────────────────┬────────────────────────────────────────┘
                     │ WebSocket: notification:new
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Frontend recebe e atualiza estado                        │
│    - Adiciona à lista de notificações                       │
│    - Enfileira para Toast (auto-dismiss em 5s)              │
└────────────────────┬────────────────────────────────────────┘
                     │
     ┌───────────────┴───────────────┐
     ▼                               ▼
┌──────────────────┐          ┌──────────────────┐
│ Toast aparece   │          │ Central atualiza │
│ (temporário)    │          │ (com notificação)│
└──────────────────┘          └──────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 6. Usuário recarrega página (Ctrl+R)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Frontend conecta WebSocket e sincroniza                  │
│    GET /notifications com backend                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. Mesma notificação é carregada (NÃO duplicada)           │
│    Aparece na central, NÃO é recriada                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Checklist de Implementação

### Backend
- [ ] Criar diretório `back-end/domains/notifications/`
- [ ] Mover `NotificationModel.js` → `model.js`
- [ ] Mover `NotificationService.js` → `service.js`
- [ ] Mover `NotificationRoutes.js` → `routes.js`
- [ ] Criar diretório `back-end/websocket/`
- [ ] Mover `NotificationWebSocket.js` → `notification.js`
- [ ] Criar diretório `back-end/events/`
- [ ] Mover `EventHandlers.js` → `handlers.js`
- [ ] Adicionar rotas em `back-end/routes/index.js`
- [ ] Inicializar WebSocket em `server.js`
- [ ] Instalar `socket.io`: `npm install socket.io`
- [ ] Integrar evento `onReservationCreated` em bookings
- [ ] Integrar evento `onPaymentSuccess` em payments
- [ ] Testar backend API

### Frontend
- [ ] Instalar `socket.io-client`: `npm install socket.io-client`
- [ ] Copiar `NotificationContextEventBased.jsx` para `contexts/`
- [ ] Atualizar `App.jsx` para usar novo provider
- [ ] Remover useEffect que cria notificações duplicadas
- [ ] Testar WebSocket connection
- [ ] Testar sincronização de notificações
- [ ] Testar deduplicação em reload
- [ ] Testar dismiss

### Integração
- [ ] Testar fluxo completo ponta-a-ponta
- [ ] Testar em múltiplas abas
- [ ] Testar com 2 usuários diferentes
- [ ] Teste de stress (criar múltiplas notificações)

---

## 🚨 Troubleshooting

### WebSocket não conecta
- Verificar se backend está rodando na porta correta
- Verificar CORS em `NotificationWebSocket.js`
- Verificar token de autenticação em localStorage

### Notificações não aparecem
- Verificar console do browser (Network tab)
- Verificar se evento está sendo disparado no backend
- Verificar se o socket está identificado (userId)

### Duplicatas ainda aparecem
- Verificar índice MongoDB: `db.notifications.getIndexes()`
- Executar: `db.notifications.dropIndex("idx_notification_dedup")`
- Reiniciar backend para recriar índice

### Toast não desaparece
- Verificar `removeFromToastQueue` em NotificationDropdown
- Verificar timeout de 5 segundos

---

## 📚 Documentação Relacionada

- MongoDB Indexes: https://docs.mongodb.com/manual/indexes/
- Socket.io: https://socket.io/docs/
- React Context: https://react.dev/reference/react/useContext

---

## ✅ Status

- ✅ Backend: Implementado
- ✅ Frontend: Implementado
- ✅ WebSocket: Implementado
- ✅ Deduplicação: Implementado
- ⏳ Integração: Aguardando implementação manual

**Próxima etapa**: Seguir o "Passo 1: Integrar Backend" acima.
