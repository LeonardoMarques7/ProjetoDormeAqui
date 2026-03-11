import { motion } from "framer-motion";
import { Trash2, Check } from "lucide-react";
import { useNotification } from "@/components/contexts/NotificationContext";
import { getNotificationConfig } from "./NotificationIconsConfig";

const NotificationItemDesktop = ({ notification, onClose }) => {
	const { removeNotification, markAsRead } = useNotification();
	const config = getNotificationConfig(notification.type);

	const IconComponent = config.icon;

	const handleMarkAsRead = () => {
		if (!notification.read) {
			markAsRead(notification.id);
		}
	};

	const handleDelete = () => {
		removeNotification(notification.id);
	};

	const handleAction = (action) => {
		if (notification.action && notification.action.callback) {
			notification.action.callback();
		}
		handleMarkAsRead();
	};

	// Formatar data
	const formatDate = (dateString) => {
		const now = new Date();
		const notifDate = new Date(dateString);
		const diffMs = now - notifDate;
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return "agora";
		if (diffMins < 60) return `${diffMins}m atrás`;
		if (diffHours < 24) return `${diffHours}h atrás`;
		if (diffDays < 7) return `${diffDays}d atrás`;

		return notifDate.toLocaleDateString("pt-BR");
	};

	return (
		<motion.div
			className="px-6 py-4 group cursor-pointer"
			whileHover={{ x: 2 }}
			transition={{ type: "spring", stiffness: 400, damping: 30 }}
		>
			<div className="flex gap-4">
				{/* Avatar/Icon */}
				<div
					className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow"
					style={{ backgroundColor: config.bgColor }}
				>
					<IconComponent
						className="w-6 h-6"
						style={{ color: config.primaryColor }}
					/>
				</div>

				{/* Content */}
				<div className="flex-1 min-w-0">
					{/* Title and actions row */}
					<div className="flex items-start justify-between gap-2 mb-1">
						<div>
							<h4 className="text-sm font-semibold text-gray-900 truncate">
								{notification.title}
							</h4>
							<p className="text-xs text-gray-500 mt-0.5">
								{formatDate(notification.createdAt)} •{" "}
								{notification.category ||
									notification.type}
							</p>
						</div>

						{!notification.read && (
							<div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
						)}
					</div>

					{/* Message */}
					<p className="text-sm text-gray-600 line-clamp-2 mb-2">
						{notification.message}
					</p>

					{/* Action buttons */}
					{notification.action &&
						notification.action.type === "buttons" && (
							<div className="flex gap-2 mt-3">
								{notification.action.buttons?.map(
									(btn, idx) => (
										<button
											key={idx}
											onClick={() =>
												handleAction(
													notification.action
												)
											}
											className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
												btn.variant ===
												"primary"
													? "bg-gray-900 text-white hover:bg-black hover:shadow-md"
													: "bg-gray-100 text-gray-900 hover:bg-gray-200"
											}`}
										>
											{btn.label}
										</button>
									)
								)}
							</div>
						)}
				</div>

				{/* Delete button */}
				<motion.button
					onClick={handleDelete}
					className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
					whileHover={{ scale: 1.1 }}
					transition={{
						type: "spring",
						stiffness: 400,
						damping: 30,
					}}
				>
					<Trash2 className="w-4 h-4" />
				</motion.button>
			</div>
		</motion.div>
	);
};

export default NotificationItemDesktop;
