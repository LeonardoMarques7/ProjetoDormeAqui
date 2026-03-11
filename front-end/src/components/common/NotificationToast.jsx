import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useNotification } from "@/components/contexts/NotificationContext";

// Ícones padrão por tipo
const typeIcons = {
	system: "🔔",
	reservation: "🎉",
	payment: "💳",
	message: "💬",
	platform: "⭐",
	welcome: "👋",
	goodbye: "👋",
	success: "✅",
	warning: "⚠️",
	error: "❌",
	info: "ℹ️",
};

const typeColors = {
	system: "bg-blue-50 border-blue-200",
	reservation: "bg-green-50 border-green-200",
	payment: "bg-purple-50 border-purple-200",
	message: "bg-indigo-50 border-indigo-200",
	platform: "bg-orange-50 border-orange-200",
	welcome: "bg-pink-50 border-pink-200",
	goodbye: "bg-gray-50 border-gray-200",
	success: "bg-green-50 border-green-200",
	warning: "bg-yellow-50 border-yellow-200",
	error: "bg-red-50 border-red-200",
	info: "bg-blue-50 border-blue-200",
};

const NotificationToast = () => {
	const { toastQueue, removeFromToastQueue } = useNotification();

	return (
		<div className="fixed top-20 right-4 z-50 flex flex-col gap-3 pointer-events-none">
			<AnimatePresence>
				{toastQueue.map((notification) => (
					<ToastItem
						key={notification.id}
						notification={notification}
						onDismiss={() => removeFromToastQueue(notification.id)}
					/>
				))}
			</AnimatePresence>
		</div>
	);
};

const ToastItem = ({ notification, onDismiss }) => {
	const icon =
		notification.icon || typeIcons[notification.type] || typeIcons.info;
	const colorClass = typeColors[notification.type] || typeColors.info;

	useEffect(() => {
		const timer = setTimeout(() => {
			onDismiss();
		}, 5000);

		return () => clearTimeout(timer);
	}, [onDismiss]);

	return (
		<motion.div
			initial={{ opacity: 0, x: 400, y: -20 }}
			animate={{ opacity: 1, x: 0, y: 0 }}
			exit={{ opacity: 0, x: 400, y: -20 }}
			transition={{ duration: 0.3, ease: "easeOut" }}
			className={`${colorClass} border rounded-lg shadow-lg p-4 max-w-sm w-96 pointer-events-auto backdrop-blur-sm`}
		>
			<div className="flex items-start gap-3">
				<span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>

				<div className="flex-1 min-w-0">
					{notification.title && (
						<h4 className="font-semibold text-gray-900 truncate">
							{notification.title}
						</h4>
					)}
					<p className="text-sm text-gray-700 mt-1 line-clamp-2">
						{notification.message}
					</p>

					{notification.actions && notification.actions.length > 0 && (
						<div className="flex gap-2 mt-3">
							{notification.actions.map((action) => (
								<button
									key={action.id}
									onClick={() => {
										action.onClick?.();
										onDismiss();
									}}
									className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
										action.primary
											? "bg-blue-600 text-white hover:bg-blue-700"
											: "bg-gray-200 text-gray-700 hover:bg-gray-300"
									}`}
								>
									{action.label}
								</button>
							))}
						</div>
					)}
				</div>

				<motion.button
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.95 }}
					onClick={onDismiss}
					className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors ml-2"
					aria-label="Fechar notificação"
				>
					<X className="w-5 h-5" />
				</motion.button>
			</div>

			<motion.div
				initial={{ scaleX: 1 }}
				animate={{ scaleX: 0 }}
				transition={{ duration: 5, ease: "linear" }}
				className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-current opacity-30 origin-left"
				style={{
					background: `linear-gradient(to right, currentColor, transparent)`,
				}}
			/>
		</motion.div>
	);
};

export default NotificationToast;
