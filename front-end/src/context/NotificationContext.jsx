import axios from "axios";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useReducer,
	useRef,
	useState,
} from "react";

export const NotificationContext = createContext(null);

export const useNotificationContext = () => useContext(NotificationContext);

const PAGE_LIMIT = 10;
const UNDO_TIMEOUT_MS = 5000;
const MAX_RETRIES = 3;

function notificationsReducer(state, action) {
	switch (action.type) {
		case "FETCH_START":
			return { ...state, loading: true, error: null };
		case "FETCH_SUCCESS": {
			const incoming = action.payload.notifications ?? [];
			const all =
				action.payload.page === 1
					? incoming
					: [...state.notifications, ...incoming];
			const unique = all.filter(
				(n, idx, arr) => arr.findIndex((x) => x._id === n._id) === idx,
			);
			return {
				...state,
				loading: false,
				notifications: unique,
				total: action.payload.total ?? state.total,
				page: action.payload.page,
				hasMore:
					unique.length < (action.payload.total ?? unique.length),
			};
		}
		case "FETCH_ERROR":
			return { ...state, loading: false, error: action.payload };
		case "ADD":
			return {
				...state,
				notifications: [action.payload, ...state.notifications],
				total: state.total + 1,
			};
		case "MARK_READ": {
			const updated = state.notifications.map((n) =>
				n._id === action.payload ? { ...n, read: true } : n,
			);
			return { ...state, notifications: updated };
		}
		case "MARK_ALL_READ": {
			const updated = state.notifications.map((n) => ({ ...n, read: true }));
			return { ...state, notifications: updated };
		}
		case "REMOVE": {
			const filtered = state.notifications.filter(
				(n) => n._id !== action.payload,
			);
			return {
				...state,
				notifications: filtered,
				total: Math.max(0, state.total - 1),
			};
		}
		case "RESTORE": {
			const restored = [action.payload, ...state.notifications].filter(
				(n, idx, arr) => arr.findIndex((x) => x._id === n._id) === idx,
			);
			return {
				...state,
				notifications: restored,
				total: state.total + 1,
			};
		}
		case "CLEAR_ALL":
			return { ...state, notifications: [], total: 0 };
		default:
			return state;
	}
}

const initialState = {
	notifications: [],
	loading: false,
	error: null,
	total: 0,
	page: 1,
	hasMore: false,
};

export const NotificationProvider = ({ children }) => {
	const [state, dispatch] = useReducer(notificationsReducer, initialState);
	const [panelOpen, setPanelOpen] = useState(false);
	const [pendingDeletes, setPendingDeletes] = useState([]);
	const undoTimers = useRef({});
	const retryCount = useRef(0);

	const fetchNotifications = useCallback(async (page = 1) => {
		dispatch({ type: "FETCH_START" });
		try {
			const { data } = await axios.get(
				`/notifications?page=${page}&limit=${PAGE_LIMIT}`,
			);
			retryCount.current = 0;
			dispatch({
				type: "FETCH_SUCCESS",
				payload: {
					notifications: data.notifications ?? data ?? [],
					total: data.total ?? (Array.isArray(data) ? data.length : 0),
					page,
				},
			});
		} catch (error) {
			if (error.response?.status === 401) {
				retryCount.current = 0;
				dispatch({
					type: "FETCH_SUCCESS",
					payload: {
						notifications: [
							{
								_id: "__login_hint__",
								type: "info",
								title: "Faça login para ver suas notificações",
								message: "Acesse sua conta para visualizar notificações.",
								read: true,
								createdAt: new Date().toISOString(),
							},
						],
						total: 1,
						page: 1,
					},
				});
			} else if (retryCount.current < MAX_RETRIES) {
				retryCount.current += 1;
				const delay = 1000 * 2 ** retryCount.current;
				setTimeout(() => fetchNotifications(page), delay);
			} else {
				retryCount.current = 0;
				dispatch({ type: "FETCH_ERROR", payload: "Não foi possível carregar as notificações. Tente novamente." });
			}
		}
	}, []);

	useEffect(() => {
		fetchNotifications(1);
	}, [fetchNotifications]);

	const addNotification = useCallback((notification) => {
		dispatch({ type: "ADD", payload: notification });
	}, []);

	const markAsRead = useCallback(async (id) => {
		dispatch({ type: "MARK_READ", payload: id });
		try {
			await axios.patch(`/notifications/${id}/read`);
		} catch {
			// silently ignore sync errors
		}
	}, []);

	const markAllAsRead = useCallback(async () => {
		dispatch({ type: "MARK_ALL_READ" });
		try {
			await axios.patch("/notifications/read-all");
		} catch {
			// silently ignore sync errors
		}
	}, []);

	const removeNotification = useCallback((notification) => {
		dispatch({ type: "REMOVE", payload: notification._id });
		setPendingDeletes((prev) => [
			...prev.filter((p) => p._id !== notification._id),
			notification,
		]);

		const timer = setTimeout(() => {
			setPendingDeletes((prev) =>
				prev.filter((p) => p._id !== notification._id),
			);
			axios.delete(`/notifications/${notification._id}`).catch(() => {});
		}, UNDO_TIMEOUT_MS);

		undoTimers.current[notification._id] = timer;
	}, []);

	const undoRemove = useCallback((id) => {
		const timer = undoTimers.current[id];
		if (timer) {
			clearTimeout(timer);
			delete undoTimers.current[id];
		}
		setPendingDeletes((prev) => {
			const notification = prev.find((p) => p._id === id);
			if (notification) {
				dispatch({ type: "RESTORE", payload: notification });
			}
			return prev.filter((p) => p._id !== id);
		});
	}, []);

	const clearAll = useCallback(async () => {
		dispatch({ type: "CLEAR_ALL" });
		try {
			await axios.delete("/notifications");
		} catch {
			// silently ignore sync errors
		}
	}, []);

	const loadMore = useCallback(() => {
		if (!state.loading && state.hasMore) {
			fetchNotifications(state.page + 1);
		}
	}, [fetchNotifications, state.loading, state.hasMore, state.page]);

	const refetch = useCallback(() => {
		fetchNotifications(1);
	}, [fetchNotifications]);

	const openPanel = useCallback(() => setPanelOpen(true), []);
	const closePanel = useCallback(() => setPanelOpen(false), []);
	const togglePanel = useCallback(() => setPanelOpen((prev) => !prev), []);

	const unreadCount = state.notifications.filter(
		(n) => !n.read && n._id !== "__login_hint__",
	).length;

	return (
		<NotificationContext.Provider
			value={{
				notifications: state.notifications,
				loading: state.loading,
				error: state.error,
				total: state.total,
				hasMore: state.hasMore,
				unreadCount,
				panelOpen,
				pendingDeletes,
				addNotification,
				markAsRead,
				markAllAsRead,
				removeNotification,
				undoRemove,
				clearAll,
				loadMore,
				refetch,
				openPanel,
				closePanel,
				togglePanel,
			}}
		>
			{children}
		</NotificationContext.Provider>
	);
};
