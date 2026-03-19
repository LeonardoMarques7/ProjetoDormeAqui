import { Server } from "socket.io";
import { notificationEventEmitter } from "../NotificationService.js";

// Map de userId -> socket.id para saber para qual socket enviar notificações
const userSocketMap = new Map();

/**
 * Inicializa WebSocket para notificações em tempo real
 * @param {http.Server} httpServer - Servidor HTTP
 * @param {Object} options - Opções do Socket.io
 */
export function initializeNotificationWebSocket(httpServer, options = {}) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    ...options,
  });

  // Escuta eventos de notificação criada
  notificationEventEmitter.on("notification:created", ({ userId, notification }) => {
    const socketId = userSocketMap.get(userId.toString());
    if (socketId) {
      io.to(socketId).emit("notification:new", notification);
      console.log(`[WebSocket] Notificação enviada ao usuário ${userId}`);
    }
  });

  // Escuta eventos de notificação descartada
  notificationEventEmitter.on("notification:dismissed", ({ userId, notificationId }) => {
    const socketId = userSocketMap.get(userId.toString());
    if (socketId) {
      io.to(socketId).emit("notification:dismissed", { notificationId });
    }
  });

  // Middleware de autenticação
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Autenticação necessária"));
    }

    // Aqui você pode validar o token JWT se necessário
    // Para simplicidade, vamos apenas passar
    next();
  });

  // Handlers de conexão
  io.on("connection", (socket) => {
    console.log(`[WebSocket] Cliente conectado: ${socket.id}`);

    // Quando o cliente se identifica com seu userId
    socket.on("identify", (userId) => {
      userSocketMap.set(userId.toString(), socket.id);
      console.log(`[WebSocket] Usuário ${userId} identificado com socket ${socket.id}`);

      // Confirma ao cliente que está conectado
      socket.emit("connected", { userId, socketId: socket.id });
    });

    // Handler para desconexão
    socket.on("disconnect", () => {
      // Remove o usuário do mapa
      for (const [userId, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
          userSocketMap.delete(userId);
          console.log(`[WebSocket] Usuário ${userId} desconectado`);
          break;
        }
      }
    });

    // Handler para testes/pings
    socket.on("ping", () => {
      socket.emit("pong");
    });
  });

  return io;
}

/**
 * Envia uma notificação para um usuário através do WebSocket
 * @param {Object} io - Instância do Socket.io
 * @param {string} userId - ID do usuário
 * @param {Object} notification - Dados da notificação
 */
export function sendNotificationToUser(io, userId, notification) {
  const socketId = userSocketMap.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit("notification:new", notification);
  }
}

/**
 * Obtém o socket ID de um usuário
 * @param {string} userId - ID do usuário
 * @returns {string|null}
 */
export function getUserSocketId(userId) {
  return userSocketMap.get(userId.toString()) || null;
}

/**
 * Obtém a lista de usuários conectados
 * @returns {Array<string>}
 */
export function getConnectedUsers() {
  return Array.from(userSocketMap.keys());
}
