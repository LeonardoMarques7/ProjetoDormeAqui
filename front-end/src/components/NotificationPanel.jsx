import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCheck, Trash2, RefreshCw } from "lucide-react";
import { useEffect, useRef } from "react";
import { isToday, isYesterday, isThisWeek } from "date-fns";
import useNotifications from "@/hooks/useNotifications";
import NotificationItem from "@/components/NotificationItem";

function groupNotifications(notifications) {
	const groups = {
		Hoje: [],
		Ontem: [],
		"Esta semana": [],
		Antigo: [],
	};

	for (const n of notifications) {
		const date = new Date(n.createdAt);
		if (isToday(date)) {
			groups["Hoje"].push(n);
		} else if (isYesterday(date)) {
			groups["Ontem"].push(n);
		} else if (isThisWeek(date)) {
			groups["Esta semana"].push(n);
		} else {
			groups["Antigo"].push(n);
		}
	}

	return Object.entries(groups).filter(([, items]) => items.length > 0);
}

const NotificationPanel = () => {
	const {
		notifications,
		loading,
		error,
		unreadCount,
		hasMore,
		panelOpen,
		closePanel,
		markAllAsRead,
		clearAll,
		loadMore,
		refetch,
	} = useNotifications();

	const panelRef = useRef(null);

	useEffect(() => {
		if (!panelOpen) return;

		const handleClickOutside = (e) => {
			if (panelRef.current && !panelRef.current.contains(e.target)) {
				closePanel();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [panelOpen, closePanel]);

	useEffect(() => {
		if (!panelOpen) return;
		const handleKey = (e) => {
			if (e.key === "Escape") closePanel();
		};
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [panelOpen, closePanel]);

	const groups = groupNotifications(notifications);

	return (
		<AnimatePresence>
			{panelOpen && (
				<motion.div
					ref={panelRef}
					key="notification-panel"
					initial={{ opacity: 0, y: -8, scale: 0.97 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: -8, scale: 0.97 }}
					transition={{ duration: 0.18, ease: "easeOut" }}
					className="absolute top-[68px] right-2 z-[200] w-[360px] max-w-[calc(100vw-1rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
					role="dialog"
					aria-label="Painel de notificações"
				>
					{/* Header */}
					<div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
						<h2 className="font-semibold text-gray-900 text-base">
							Notificações
							{unreadCount > 0 && (
								<span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold">
									{unreadCount}
								</span>
							)}
						</h2>
						<div className="flex items-center gap-1">
							{unreadCount > 0 && (
								<button
									type="button"
									onClick={markAllAsRead}
									title="Marcar todas como lidas"
									className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
								>
									<CheckCheck className="w-4 h-4" />
								</button>
							)}
							{notifications.length > 0 && (
								<button
									type="button"
									onClick={clearAll}
									title="Limpar tudo"
									className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
								>
									<Trash2 className="w-4 h-4" />
								</button>
							)}
							<button
								type="button"
								onClick={closePanel}
								aria-label="Fechar painel"
								className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
							>
								<X className="w-4 h-4" />
							</button>
						</div>
					</div>

					{/* Content */}
					<div className="overflow-y-auto max-h-[420px] flex flex-col">
						{loading && notifications.length === 0 && (
							<div className="flex items-center justify-center py-12 text-gray-400 text-sm gap-2">
								<RefreshCw className="w-4 h-4 animate-spin" />
								<span>Carregando notificações…</span>
							</div>
						)}

						{error && (
							<div className="px-4 py-6 text-center text-sm text-red-500">
								<p>{error}</p>
								<button
									type="button"
									onClick={refetch}
									className="mt-2 underline text-xs text-gray-500 hover:text-gray-700"
								>
									Tentar novamente
								</button>
							</div>
						)}

						{!loading && !error && notifications.length === 0 && (
							<div className="px-4 py-12 text-center text-sm text-gray-400">
								Você não tem notificações
							</div>
						)}

						{!error && groups.length > 0 && (
							<>
								{groups.map(([label, items]) => (
									<div key={label}>
										<div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50 sticky top-0">
											{label}
										</div>
										<AnimatePresence initial={false}>
											{items.map((notification) => (
												<NotificationItem
													key={notification._id}
													notification={notification}
												/>
											))}
										</AnimatePresence>
									</div>
								))}

								{hasMore && (
									<div className="px-4 py-3 flex justify-center border-t border-gray-100">
										<button
											type="button"
											onClick={loadMore}
											disabled={loading}
											className="text-xs text-gray-500 hover:text-gray-700 font-medium disabled:opacity-50 transition-colors"
										>
											{loading ? "Carregando…" : "Carregar mais"}
										</button>
									</div>
								)}
							</>
						)}
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default NotificationPanel;
