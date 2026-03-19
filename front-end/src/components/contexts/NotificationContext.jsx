import {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
} from "react";

const NotificationContext = createContext();

// Helper functions para lidar com localStorage
const STORAGE_KEY = "dormeaqui_notifications";
const MAX_NOTIFICATIONS = 100;
const DAYS_TO_KEEP = 30;

const getStoredNotifications = () => {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch {
		return [];
	}
};

const saveNotifications = (notifications) => {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
	} catch {
		console.warn("Falha ao salvar notificações no localStorage");
	}
};

const isNotificationExpired = (createdAt) => {
	const notifDate = new Date(createdAt);
	const now = new Date();
	const diffDays = (now - notifDate) / (1000 * 60 * 60 * 24);
	return diffDays > DAYS_TO_KEEP;
};

const cleanupExpiredNotifications = (notifications) => {
	return notifications.filter(
		(notif) => !isNotificationExpired(notif.createdAt),
	);
};

export const NotificationProvider = ({ children }) => {
	const [notifications, setNotifications] = useState(() => {
		const stored = getStoredNotifications();
		return cleanupExpiredNotifications(stored);
	});

	const [toastQueue, setToastQueue] = useState([]);

	// Sincronizar com localStorage quando notificações mudam
	useEffect(() => {
		saveNotifications(notifications);
	}, [notifications]);

	const generateId = () =>
		`notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

	const addNotification = useCallback((notification) => {
		const newNotification = {
			id: notification.id || generateId(),
			title: notification.title || "Notificação",
			message: notification.message || "",
			type: notification.type || "system",
			createdAt: notification.createdAt || new Date().toISOString(),
			read: notification.read || false,
			icon: notification.icon || null,
			actions: notification.actions || [],
		};

		setNotifications((prev) => {
			const updated = [newNotification, ...prev];
			// Manter apenas as últimas MAX_NOTIFICATIONS
			return updated.slice(0, MAX_NOTIFICATIONS);
		});

		// Adicionar à fila de toasts
		setToastQueue((prev) => [...prev, newNotification]);

		return newNotification;
	}, []);

	const removeNotification = useCallback((id) => {
		setNotifications((prev) => prev.filter((notif) => notif.id !== id));
		setToastQueue((prev) => prev.filter((notif) => notif.id !== id));
	}, []);

	const markAsRead = useCallback((id) => {
		setNotifications((prev) =>
			prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)),
		);
	}, []);

	const markAllAsRead = useCallback(() => {
		setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
	}, []);

	const clearAllNotifications = useCallback(() => {
		setNotifications([]);
		setToastQueue([]);
	}, []);

	const removeFromToastQueue = useCallback((id) => {
		setToastQueue((prev) => prev.filter((notif) => notif.id !== id));
	}, []);

	const getUnreadCount = useCallback(() => {
		return notifications.filter((notif) => !notif.read).length;
	}, [notifications]);

	const value = {
		notifications,
		toastQueue,
		addNotification,
		removeNotification,
		markAsRead,
		markAllAsRead,
		clearAllNotifications,
		removeFromToastQueue,
		getUnreadCount,
	};

	return (
		<NotificationContext.Provider value={value}>
			{children}
		</NotificationContext.Provider>
	);
};

export const useNotification = () => {
	const context = useContext(NotificationContext);
	if (!context) {
		throw new Error(
			"useNotification deve ser usado dentro de NotificationProvider",
		);
	}
	return context;
};


