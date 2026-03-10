import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCheck, Trash2, RefreshCw } from "lucide-react";
import { useEffect, useRef } from "react";
import { isToday, isYesterday, isThisWeek } from "date-fns";
import useNotifications from "@/hooks/useNotifications";
import NotificationItem from "@/components/NotificationItem";
import { useIsMobile } from "@/hooks/use-mobile";

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

	const isMobile = useIsMobile();
	const panelRef = useRef(null);

	// Click outside closes panel on desktop
	useEffect(() => {
		if (!panelOpen || isMobile) return;

		const handleClickOutside = (e) => {
			if (panelRef.current && !panelRef.current.contains(e.target)) {
				closePanel();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [panelOpen, closePanel, isMobile]);

	useEffect(() => {
		if (!panelOpen) return;
		const handleKey = (e) => {
			if (e.key === "Escape") closePanel();
		};
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [panelOpen, closePanel]);

	const groups = groupNotifications(notifications);

	const panelContent = (
		<>
			{/* Header */}
			<div className="relative flex items-center justify-between px-4 py-3 border-b border-gray-100">
				{/* Drag handle indicator for mobile */}
				{isMobile && (
					<div
						className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-gray-300"
						aria-hidden="true"
					/>
				)}
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
							aria-label="Marcar todas como lidas"
							className="p-2 md:p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors touch-manipulation"
						>
							<CheckCheck className="w-5 h-5 md:w-4 md:h-4" />
						</button>
					)}
					{notifications.length > 0 && (
						<button
							type="button"
							onClick={clearAll}
							title="Limpar tudo"
							aria-label="Limpar todas as notificações"
							className="p-2 md:p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors touch-manipulation"
						>
							<Trash2 className="w-5 h-5 md:w-4 md:h-4" />
						</button>
					)}
					<button
						type="button"
						onClick={closePanel}
						aria-label="Fechar painel de notificações"
						className="p-2 md:p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors touch-manipulation"
					>
						<X className="w-5 h-5 md:w-4 md:h-4" />
					</button>
				</div>
			</div>

			{/* Content */}
			<div
				className="overflow-y-auto flex flex-col"
				style={{ maxHeight: isMobile ? "calc(70vh - 64px)" : "420px" }}
			>
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
		</>
	);

	if (isMobile) {
		return (
			<AnimatePresence>
				{panelOpen && (
					<>
						{/* Backdrop */}
						<motion.div
							key="notification-backdrop"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="fixed inset-0 bg-black/40 z-[190]"
							onClick={closePanel}
							aria-hidden="true"
						/>

						{/* Bottom sheet */}
						<motion.div
							ref={panelRef}
							key="notification-panel"
							initial={{ y: "100%" }}
							animate={{ y: 0 }}
							exit={{ y: "100%" }}
							transition={{ type: "spring", damping: 30, stiffness: 300 }}
							drag="y"
							dragConstraints={{ top: 0, bottom: 0 }}
							dragElastic={{ top: 0, bottom: 0.3 }}
							onDragEnd={(_, info) => {
								if (info.offset.y > 120) {
									closePanel();
								}
							}}
							className="fixed bottom-0 left-0 right-0 z-[200] bg-white rounded-t-2xl shadow-2xl flex flex-col overflow-hidden"
							style={{ maxHeight: "70vh" }}
							role="dialog"
							aria-modal="true"
							aria-label="Painel de notificações"
						>
							{panelContent}
						</motion.div>
					</>
				)}
			</AnimatePresence>
		);
	}

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
					{panelContent}
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default NotificationPanel;
