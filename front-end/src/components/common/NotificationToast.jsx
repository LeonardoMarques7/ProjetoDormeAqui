import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNotification } from "@/components/contexts/NotificationContext";
import { getNotificationConfig } from "./NotificationIconsConfig";
import { ptBR } from "date-fns/locale";

const NotificationToast = () => {
	const { toastQueue, removeFromToastQueue } = useNotification();

	return (
		<div className="relative max-7xl mr-10">
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
	const config = getNotificationConfig(notification.type);
	const IconComponent = config.icon;

	const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
		addSuffix: true,
		locale: ptBR,
	});

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
			className="fixed max-w-sm w-96 right-0 z-100 pointer-events-auto backdrop-blur-sm overflow-hidden"
		>
			{/* Icon Container */}
			<div className="flex bg-gray-50 w-fit p-3 rounded-4xl items-center justify-between gap-4">
				{/* Icon Container */}
				<div className="flex itesm-center gap-4">
					<div
						className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
						style={{
							backgroundColor: config.bgColor,
						}}
					>
						<IconComponent
							className="w-6 h-6 "
							style={{
								color: config.primaryColor,
							}}
						/>
					</div>

					{/* Content */}
					<div className="flex-1 min-w-0">
						{notification.title && (
							<p className="font-bold text-nowrap text-gray-900 truncate">
								{notification.title}
							</p>
						)}
						<p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
							{notification.message}
						</p>
					</div>
				</div>

				<p className="text-xs mb-auto  pr-3 -ml-5! text-gray-400">{timeAgo}</p>

				{/* Close Button */}
				{/* <motion.button className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
									<Minus className="w-5 h-5" />
								</motion.button> */}
			</div>
		</motion.div>
	);
};

export default NotificationToast;
