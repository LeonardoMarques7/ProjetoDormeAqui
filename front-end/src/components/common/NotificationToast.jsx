import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useNotification } from "@/components/contexts/NotificationContext";
import { getNotificationConfig } from "./NotificationIconsConfig";

const NotificationToast = () => {
	const { toastQueue, removeFromToastQueue } = useNotification();

	return (
		<div className="fixed top-20 right-4 z-50 flex flex-col gap-3 pointer-events-none">
			<AnimatePresence>
				{toastQueue.map((notification) => (
					<ToastItem
						key={notification.id}
						notification={notification}
						onDismiss={() =>
							removeFromToastQueue(notification.id)
						}
					/>
				))}
			</AnimatePresence>
		</div>
	);
};

const ToastItem = ({ notification, onDismiss }) => {
	const config = getNotificationConfig(notification.type);
	const IconComponent = config.icon;

	useEffect(() => {
		const timer = setTimeout(() => {
			onDismiss();
		}, 5000);

		return () => clearTimeout(timer);
	}, [onDismiss]);

	return (
		<motion.div
			initial={{
				opacity: 0,
				x: 400,
				y: -20,
			}}
			animate={{
				opacity: 1,
				x: 0,
				y: 0,
			}}
			exit={{
				opacity: 0,
				x: 400,
				y: -20,
			}}
			transition={{
				type: "spring",
				stiffness: 300,
				damping: 30,
				mass: 0.8,
			}}
			className="bg-white border border-gray-200 rounded-xl shadow-xl p-5 max-w-sm w-96 pointer-events-auto backdrop-blur-sm overflow-hidden"
		>
			<div className="flex items-start gap-4">
				{/* Icon Container */}
				<div
					className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm"
					style={{
						backgroundColor: config.bgColor,
					}}
				>
					<IconComponent
						className="w-6 h-6"
						style={{
							color: config.primaryColor,
						}}
					/>
				</div>

				{/* Content */}
				<div className="flex-1 min-w-0 pt-0.5">
					{notification.title && (
						<h4 className="font-semibold text-gray-900 truncate">
							{notification.title}
						</h4>
					)}
					<p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
						{notification.message}
					</p>

					{notification.action &&
						notification.action.type === "buttons" && (
							<div className="flex gap-2 mt-3">
								{notification.action.buttons?.map(
									(btn, idx) => (
										<button
											key={idx}
											onClick={() => {
												notification.action
													.callback?.();
												onDismiss();
											}}
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

				{/* Close Button */}
				<motion.button
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.95 }}
					onClick={onDismiss}
					className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
					aria-label="Fechar notificação"
				>
					<X className="w-5 h-5" />
				</motion.button>
			</div>

			{/* Progress bar */}
			<motion.div
				initial={{ scaleX: 1 }}
				animate={{ scaleX: 0 }}
				transition={{
					duration: 5,
					ease: "linear",
				}}
				className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-gray-400 to-transparent origin-left"
			/>
		</motion.div>
	);
};

export default NotificationToast;
