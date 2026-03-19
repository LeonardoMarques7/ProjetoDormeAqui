import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Trash2 } from "lucide-react";
import { useNotification } from "@/components/contexts/NotificationContext";
import { getNotificationConfig } from "./NotificationIconsConfig";

const SWIPE_DELETE_THRESHOLD = 80;

const NotificationItemDesktop = ({ notification }) => {
	const { removeNotification, markAsRead } = useNotification();
	const config = getNotificationConfig(notification.type);
	const IconComponent = config.icon;
	const wrapperRef = useRef(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const x = useMotionValue(0);
	const deleteWidth = useTransform(x, [0, 120], [0, 120]);
	const deleteOpacity = useTransform(x, [0, 40], [0, 1]);

	const handleMarkAsRead = () => {
		if (!notification.read) {
			markAsRead(notification.id);
		}
	};

	const triggerDelete = async () => {
		if (isDeleting) return;
		setIsDeleting(true);

		// 1. Desliza para a direita
		await animate(x, 420, { duration: 0.25, ease: [0.4, 0, 1, 1] });

		// 2. Colapsa a altura do wrapper
		if (wrapperRef.current) {
			const h = wrapperRef.current.offsetHeight;
			await animate(
				wrapperRef.current,
				{ height: [h, 0], opacity: [1, 0] },
				{ duration: 0.2, ease: [0.4, 0, 0.6, 1] },
			);
		}

		// 3. Remove do estado
		removeNotification(notification.id);
	};

	const handleAction = () => {
		if (notification.action?.callback) {
			notification.action.callback();
		}
		handleMarkAsRead();
	};

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
		<div ref={wrapperRef} className="relative overflow-hidden group">
			{/* Zona vermelha revelada ao arrastar */}
			<motion.div
				className="absolute left-0 top-0 bottom-0 bg-red-500 flex items-center justify-center pointer-events-none z-[5]"
				style={{ width: deleteWidth, opacity: deleteOpacity }}
			>
				<Trash2 className="w-5 h-5 text-white" />
			</motion.div>

			{/* Conteúdo arrastável */}
			<motion.div
				drag={isDeleting ? false : "x"}
				style={{ x }}
				dragConstraints={{ left: 0, right: 120 }}
				dragElastic={0.05}
				dragMomentum={false}
				onDragEnd={(_, info) => {
					if (info.offset.x > SWIPE_DELETE_THRESHOLD) {
						triggerDelete();
					} else {
						animate(x, 0, { type: "spring", stiffness: 500, damping: 40 });
					}
				}}
				onClick={handleMarkAsRead}
				className="px-6 py-4 bg-white relative z-10 cursor-pointer"
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
						<div className="flex items-start justify-between gap-2 mb-1">
							<div>
								<h4 className="text-sm font-semibold text-gray-900 truncate">
									{notification.title}
								</h4>
								<p className="text-xs text-gray-500 mt-0.5">
									{formatDate(notification.createdAt)} •{" "}
									{notification.category || notification.type}
								</p>
							</div>
							{!notification.read && (
								<div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
							)}
						</div>

						<p className="text-sm text-gray-600 line-clamp-2 mb-2">
							{notification.message}
						</p>

						{notification.action?.type === "buttons" && (
							<div className="flex gap-2 mt-3">
								{notification.action.buttons?.map((btn, idx) => (
									<button
										key={idx}
										onClick={(e) => {
											e.stopPropagation();
											handleAction();
										}}
										className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
											btn.variant === "primary"
												? "bg-gray-900 text-white hover:bg-black hover:shadow-md"
												: "bg-gray-100 text-gray-900 hover:bg-gray-200"
										}`}
									>
										{btn.label}
									</button>
								))}
							</div>
						)}
					</div>

				{/* Botão de deletar (hover — desktop) */}
				<motion.button
					onClick={(e) => {
						e.stopPropagation();
						triggerDelete();
					}}
					className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
					whileHover={{ scale: 1.1 }}
					transition={{ type: "spring", stiffness: 400, damping: 30 }}
				>
					<Trash2 className="w-4 h-4" />
				</motion.button>
			</div>
		</motion.div>
	</div>
	);
};

export default NotificationItemDesktop;

