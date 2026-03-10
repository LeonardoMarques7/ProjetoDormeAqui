import { motion } from "framer-motion";
import { Check, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import useNotifications from "@/hooks/useNotifications";

const SWIPE_THRESHOLD = 80;

const typeDot = {
	info: "bg-blue-400",
	success: "bg-green-400",
	warning: "bg-yellow-400",
	error: "bg-red-400",
};

const NotificationItem = ({ notification }) => {
	const { markAsRead, removeNotification } = useNotifications();
	const navigate = useNavigate();

	const handleClick = () => {
		if (!notification.read && notification._id !== "__login_hint__") {
			markAsRead(notification._id);
		}
		if (notification.link) {
			navigate(notification.link);
		}
	};

	const handleRemove = (e) => {
		e.stopPropagation();
		removeNotification(notification);
	};

	const handleMarkRead = (e) => {
		e.stopPropagation();
		markAsRead(notification._id);
	};

	const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
		addSuffix: true,
		locale: ptBR,
	});

	const dot = typeDot[notification.type] ?? typeDot.info;

	return (
		<motion.div
			layout
			initial={{ opacity: 0, x: -10 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: 40, transition: { duration: 0.18 } }}
			drag="x"
			dragConstraints={{ left: -120, right: 0 }}
			dragElastic={0.1}
			onDragEnd={(_, info) => {
				if (info.offset.x < -SWIPE_THRESHOLD) {
					removeNotification(notification);
				}
			}}
			onClick={handleClick}
			className={`relative flex items-start gap-3 px-4 py-4 md:py-3 cursor-pointer border-b border-gray-100 select-none transition-colors hover:bg-gray-50 ${
				!notification.read ? "bg-blue-50/40" : ""
			}`}
			role="button"
			tabIndex={0}
			onKeyDown={(e) => e.key === "Enter" && handleClick()}
			aria-label={notification.title}
		>
			{/* Unread dot */}
			<div className="flex-shrink-0 mt-1.5">
				<span
					className={`inline-block w-2.5 h-2.5 md:w-2 md:h-2 rounded-full ${
						!notification.read ? dot : "bg-transparent"
					}`}
				/>
			</div>

			{/* Content */}
			<div className="flex-1 min-w-0">
				{notification.title && (
					<p
						className={`text-sm font-medium text-gray-900 truncate ${
							!notification.read ? "font-semibold" : ""
						}`}
					>
						{notification.title}
					</p>
				)}
				{notification.message && (
					<p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
						{notification.message}
					</p>
				)}
				<span className="text-[11px] text-gray-400 mt-1 block">{timeAgo}</span>
			</div>

			{/* Action buttons */}
			<div
				className="flex-shrink-0 flex items-center gap-1"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				{!notification.read && notification._id !== "__login_hint__" && (
					<button
						type="button"
						onClick={handleMarkRead}
						title="Marcar como lida"
						aria-label="Marcar como lida"
						className="p-2 md:p-1 rounded text-gray-400 hover:text-green-500 hover:bg-green-50 transition-colors touch-manipulation"
					>
						<Check className="w-4 h-4 md:w-3.5 md:h-3.5" />
					</button>
				)}
				{notification._id !== "__login_hint__" && (
					<button
						type="button"
						onClick={handleRemove}
						title="Apagar"
						aria-label="Apagar notificação"
						className="p-2 md:p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors touch-manipulation"
					>
						<Trash2 className="w-4 h-4 md:w-3.5 md:h-3.5" />
					</button>
				)}
			</div>
		</motion.div>
	);
};

export default NotificationItem;
