import { useNotification } from "@/components/contexts/NotificationContext";
import NotificationItemDesktop from "./NotificationItemDesktop";
import EmptyNotificationState from "./EmptyNotificationState";
import { motion } from "framer-motion";
import { Trash2, Check, X, Minus } from "lucide-react";
import { useState } from "react";
import { MobileContext, useMobileContext } from "../contexts/MobileContext";

const NotificationDropdown = ({ className, onClose }) => {
	const {
		notifications,
		clearAllNotifications,
		markAllAsRead,
		getUnreadCount,
	} = useNotification();

	const [activeTab, setActiveTab] = useState("all");
	const { mobile } = useMobileContext();

	const unreadCount = getUnreadCount();

	const filteredNotifications = notifications.filter((notif) => {
		if (activeTab === "all") return true;
		if (activeTab === "unread") return !notif.read;
		return true;
	});

	const containerVariants = {
		hidden: { opacity: 0, scale: 0.95, y: -10 },
		visible: {
			opacity: 1,
			scale: 1,
			y: 0,
			transition: { type: "spring", stiffness: 300, damping: 30, mass: 0.8 },
		},
		exit: {
			opacity: 0,
			scale: 0.95,
			y: -10,
			transition: { duration: 0.2 },
		},
	};

	const listVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.03, delayChildren: 0.1 },
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 10 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { type: "spring", stiffness: 200, damping: 20 },
		},
	};

	const isFullscreen = !!onClose;

	return (
		<motion.div
			className={
				className ??
				"bg-white rounded-2xl shadow-xl border border-gray-100 w-96 max-h-[600px] flex flex-col overflow-hidden backdrop-blur-sm"
			}
			variants={isFullscreen ? undefined : containerVariants}
			initial={isFullscreen ? undefined : "hidden"}
			animate={isFullscreen ? undefined : "visible"}
			exit={isFullscreen ? undefined : "exit"}
		>
			{/* Header */}
			<div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-semibold text-gray-900">Notificações</h2>
					{mobile ? (
						<button
							onClick={onClose}
							className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
							aria-label="Fechar notificações"
						>
							<X className="w-5 h-5 text-gray-600" />
						</button>
					) : (
						<button
							className="p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
							aria-label="Fechar notificações"
							onClick={onClose}
						>
							<Minus className="w-5 h-5 text-gray-600" />
						</button>
					)}
				</div>

				{/* Tabs */}
				<div className="flex gap-2">
					{[
						{ id: "all", label: "Geral" },
						{ id: "unread", label: `Não lidas (${unreadCount})` },
					].map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
								activeTab === tab.id
									? "bg-gray-900 text-white"
									: "text-gray-600 hover:bg-gray-100"
							}`}
						>
							{tab.label}
						</button>
					))}
				</div>
			</div>

			{/* Notificações */}
			<div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
				{filteredNotifications.length === 0 ? (
					<EmptyNotificationState />
				) : (
					<motion.div
						variants={listVariants}
						initial="hidden"
						animate="visible"
						className="divide-y divide-gray-100"
					>
						{filteredNotifications.map((notification) => (
							<motion.div key={notification.id} variants={itemVariants}>
								<NotificationItemDesktop notification={notification} />
							</motion.div>
						))}
					</motion.div>
				)}
			</div>

			{/* Footer Actions */}
			{filteredNotifications.length > 0 && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="px-6 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between"
				>
					{unreadCount > 0 && (
						<button
							onClick={markAllAsRead}
							className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors group"
						>
							<Check className="w-4 h-4 group-hover:scale-110 transition-transform" />
							Marcar como lidas
						</button>
					)}
					<button
						onClick={clearAllNotifications}
						className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors ml-auto group"
					>
						<Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
						Limpar
					</button>
				</motion.div>
			)}
		</motion.div>
	);
};

export default NotificationDropdown;
