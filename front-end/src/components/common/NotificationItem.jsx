import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { useNotification } from "@/components/contexts/NotificationContext";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const NotificationItem = ({ notification, onClose }) => {
	const { removeNotification, markAsRead } = useNotification();

	const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
		addSuffix: true,
		locale: ptBR,
	});

	const handleMarkAsRead = (e) => {
		e.stopPropagation();
		if (!notification.read) {
			markAsRead(notification.id);
		}
	};

	const handleDelete = (e) => {
		e.stopPropagation();
		removeNotification(notification.id);
	};

	const handleItemClick = () => {
		// Marca como lida ao clicar
		if (!notification.read) {
			markAsRead(notification.id);
		}

		// Se houver uma ação associada, executa
		if (notification.action) {
			notification.action();
		}
	};

	return (
		<motion.div
			onClick={handleItemClick}
			className={`px-4 py-3 cursor-pointer transition-all ${
				notification.read
					? "bg-white hover:bg-gray-50"
					: "bg-blue-50 hover:bg-blue-100"
			}`}
			whileHover={{
				backgroundColor: notification.read ? "#f9fafb" : "#eff6ff",
				scale: 1.01,
			}}
			whileTap={{ scale: 0.98 }}
		>
			<div className="flex items-start gap-3">
				<div className="flex-1 min-w-0">
					<div className="flex items-start  justify-between">
						<div>
							{notification.title && (
								<h4 className="font-semibold text-gray-900 text-sm">
									{notification.title}
								</h4>
							)}
							<p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
								{notification.message}
							</p>
						</div>

						{!notification.read && (
							<div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 ml-2 mt-1" />
						)}
					</div>

					<div className="flex items-center justify-between mt-2">
						<p className="text-xs text-gray-500">{timeAgo}</p>

						<div className="flex items-center gap-1">
							{!notification.read && (
								<motion.button
									onClick={handleMarkAsRead}
									whileHover={{ scale: 1.1 }}
									whileTap={{ scale: 0.9 }}
									className="p-1 text-gray-400 hover:text-green-600 transition-colors rounded"
									title="Marcar como lida"
								>
									<Check className="w-4 h-4" />
								</motion.button>
							)}

							<motion.button
								onClick={handleDelete}
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
								className="p-1 text-gray-400 hover:text-red-600 transition-colors rounded"
								title="Remover notificação"
							>
								<X className="w-4 h-4" />
							</motion.button>
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	);
};

export default NotificationItem;
