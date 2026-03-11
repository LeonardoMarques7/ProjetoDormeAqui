import { useNotification } from "@/components/contexts/NotificationContext";
import NotificationItem from "./NotificationItem";
import EmptyNotificationState from "./EmptyNotificationState";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

const NotificationDropdown = ({ onClose }) => {
	const {
		notifications,
		clearAllNotifications,
		markAllAsRead,
		getUnreadCount,
	} = useNotification();

	const unreadCount = getUnreadCount();

	return (
		<div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-96 max-h-[500px] flex flex-col overflow-hidden">
			{/* Header */}
			<div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
				<h3 className="font-semibold text-gray-900">Notificações</h3>

				{unreadCount > 0 && (
					<button
						onClick={markAllAsRead}
						className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
					>
						Marcar como lidas
					</button>
				)}
			</div>

			{/* Notificações ou empty state */}
			<div className="flex-1 overflow-y-auto">
				{notifications.length === 0 ? (
					<EmptyNotificationState />
				) : (
					<motion.div className="divide-y divide-gray-200">
						{notifications.map((notification, index) => (
							<motion.div
								key={notification.id}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.05 }}
							>
								<NotificationItem
									notification={notification}
									onClose={onClose}
								/>
							</motion.div>
						))}
					</motion.div>
				)}
			</div>

			{/* Footer */}
			{notifications.length > 0 && (
				<div className="px-4 py-3 border-t border-gray-200 flex justify-center">
					<button
						onClick={clearAllNotifications}
						className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors group"
					>
						<Trash2 className="w-4 h-4 group-hover:text-red-600" />
						Limpar tudo
					</button>
				</div>
			)}
		</div>
	);
};

export default NotificationDropdown;
