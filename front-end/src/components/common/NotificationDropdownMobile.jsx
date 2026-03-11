import { useNotification } from "@/components/contexts/NotificationContext";
import { motion } from "framer-motion";
import { SlidersHorizontal, Trash, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getNotificationConfig } from "./NotificationIconsConfig";
import { TrashIcon } from "@heroicons/react/24/outline";

const NotificationDropdownMobile = ({ onClose }) => {
	const {
		notifications,
		clearAllNotifications,
		markAllAsRead,
		markAsRead,
		removeNotification,
		getUnreadCount,
	} = useNotification();

	const unreadCount = getUnreadCount();

	const groupNotificationsByPeriod = (notifs) => {
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
		const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

		const groups = {
			today: [],
			thisWeek: [],
			thisMonth: [],
			older: [],
		};

		notifs.forEach((notif) => {
			const notifDate = new Date(notif.createdAt);
			if (notifDate >= today) {
				groups.today.push(notif);
			} else if (notifDate >= thisWeek) {
				groups.thisWeek.push(notif);
			} else if (notifDate >= thisMonth) {
				groups.thisMonth.push(notif);
			} else {
				groups.older.push(notif);
			}
		});

		return groups;
	};

	const groups = groupNotificationsByPeriod(notifications);
	const totalNotifications = notifications.length;

	const renderGroup = (groupName, groupLabel, notifs) => {
		if (notifs.length === 0) return null;

		return (
			<motion.div
				key={groupName}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="mb-8"
			>
				<motion.h3
					initial={{ opacity: 0, x: -10 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.1 }}
					className="text-xs font-bold text-gray-900 tracking-wider px-6 mb-4"
				>
					{groupLabel}
				</motion.h3>
				<motion.div
					className="space-y-1.5"
					variants={{
						container: {
							staggerChildren: 0.05,
						},
					}}
					initial="hidden"
					animate="container"
				>
					{notifs.map((notification) => {
						const config = getNotificationConfig(notification.type);
						const IconComponent = config.icon;

						return (
							<motion.div
								key={notification.id}
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								whileHover={{ x: 4 }}
								transition={{
									type: "spring",
									stiffness: 400,
									damping: 40,
								}}
								onClick={() => {
									if (!notification.read) {
										markAsRead(notification.id);
									}
									if (notification.action) {
										notification.action();
									}
								}}
								className={`mx-3 px-3 py-3.5 rounded-xl  group transition-all duration-200 bg-white/50 hover:bg-white/80`}
							>
								<div className="flex gap-3 items-start">
									{/* Icon Badge */}
									<motion.div
										whileHover={{ scale: 1.1 }}
										className="flex-shrink-0 mt-0.5 rounded-full"
										style={{
											backgroundColor: config.bgColor,
										}}
									>
										<div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0">
											<IconComponent
												size={18}
												strokeWidth={1}
												style={{
													color: config.secondaryColor,
												}}
											/>
										</div>
									</motion.div>

									{/* Content */}
									<div className="flex-1 min-w-0">
										<div className="flex items-end justify-between gap-2">
											<div className="flex-1">
												<p className="text-sm font-semibold text-gray-900">
													{notification.titleType}
												</p>
												<p className="text-xs text-gray-600 mt-1 leading-relaxed">
													{notification.message}
												</p>
											</div>

											{/* Delete button */}
											<motion.button
												onClick={(e) => {
													e.stopPropagation();
													removeNotification(notification.id);
												}}
												whileHover={{ scale: 1.15 }}
												whileTap={{ scale: 0.9 }}
												className="opacity-0 group-hover:opacity-100 p-1 cursor-pointer  transition-opacity flex-shrink-0"
												title="Remover"
											>
												<TrashIcon className="w-3.5 h-3.5 text-gray-400 hover:text-red-500!" />
											</motion.button>
										</div>

										{/* Time */}
										<p className="text-xs text-gray-500 mt-2">
											{formatDistanceToNow(new Date(notification.createdAt), {
												addSuffix: true,
												locale: ptBR,
											})}
										</p>
									</div>
								</div>
							</motion.div>
						);
					})}
				</motion.div>
			</motion.div>
		);
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.3, ease: "easeOut" }}
			className="fixed inset-0 z-100 flex items-end md:hidden"
		>
			{/* Backdrop com blur */}
			<motion.div
				initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
				animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
				exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
				transition={{ duration: 0.3, ease: "easeOut" }}
				onClick={onClose}
				className="absolute inset-0 bg-black/25"
			/>

			{/* Drawer */}
			<motion.div
				initial={{ y: "100%", opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				exit={{ y: "100%", opacity: 0 }}
				transition={{
					type: "spring",
					damping: 25,
					stiffness: 250,
					mass: 1.2,
					duration: 0.6,
				}}
				className="relative w-full bg-gradient-to-b from-white via-white to-white/98 rounded-t-[32px] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
			>
				{/* Handle bar */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.15, duration: 0.4 }}
					className="flex justify-center pt-3.5 pb-1"
				>
					<motion.div
						whileHover={{ width: 48 }}
						className="w-10 h-1.5 bg-gradient-to-r from-gray-300 to-gray-200 rounded-full transition-all duration-300"
					/>
				</motion.div>

				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: -15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2, duration: 0.4 }}
					className="px-6 py-6 border-b border-gray-100/30 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md"
				>
					<div className="flex-1">
						<h2 className="text-2xl font-bold text-gray-900 tracking-tight">
							Notificações
						</h2>
						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.25 }}
							className="text-xs text-gray-500 mt-2.5 font-medium"
						>
							Você tem{" "}
							<span className="text-blue-600 font-bold">
								{totalNotifications}
							</span>{" "}
							notificação
							{totalNotifications !== 1 ? "s" : ""}
						</motion.p>
					</div>

					<motion.button
						onClick={onClose}
						whileHover={{ scale: 1.1, backgroundColor: "#f3f4f6" }}
						whileTap={{ scale: 0.92 }}
						className="p-2 rounded-xl transition-all duration-200"
					>
						<X className="w-5 h-5 text-gray-600" />
					</motion.button>
				</motion.div>

				{/* Actions bar */}
				{notifications.length > 0 && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.25 }}
						className="px-6 py-3 gap-2.5 flex flex-col justify-start"
					>
						<motion.button
							onClick={markAllAsRead}
							whileHover={{ x: 2 }}
							whileTap={{ scale: 0.98 }}
							className="flex w-fit cursor-pointer hover:border-primary-600 text-xs px-4 py-1 border rounded-full"
						>
							Marcar todas como lidas
						</motion.button>
						<motion.button
							onClick={clearAllNotifications}
							whileHover={{ color: "#dc2626", x: 2 }}
							whileTap={{ scale: 0.98 }}
							className="flex w-fit cursor-pointer hover:border-[#dc2626] text-xs px-4 py-1 border rounded-full"
						>
							Limpar todas as notificações
						</motion.button>
					</motion.div>
				)}

				{/* Content */}
				<motion.div className="flex-1 overflow-y-auto px-0 py-5 scroll-smooth [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300/50 [&::-webkit-scrollbar-track]:bg-transparent">
					{notifications.length === 0 ? (
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.4, delay: 0.1 }}
							className="flex flex-col items-center justify-center py-24"
						>
							<motion.div
								animate={{ y: [0, -8, 0] }}
								transition={{
									duration: 3,
									repeat: Infinity,
									ease: "easeInOut",
								}}
								className="text-6xl mb-4"
							>
								🔔
							</motion.div>
							<h3 className="text-lg font-semibold text-gray-900 mb-1.5">
								Sem notificações
							</h3>
							<p className="text-sm text-gray-500 text-center px-6 leading-relaxed">
								Você está em dia com tudo!
							</p>
						</motion.div>
					) : (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ staggerChildren: 0.02, delayChildren: 0.1 }}
							className="px-0"
						>
							{renderGroup("today", "Hoje", groups.today)}
							{renderGroup("thisWeek", "Esta Semana", groups.thisWeek)}
							{renderGroup("thisMonth", "Este Mês", groups.thisMonth)}
							{renderGroup("older", "Anterior", groups.older)}
						</motion.div>
					)}
				</motion.div>

				{/* Footer */}
			</motion.div>
		</motion.div>
	);
};

export default NotificationDropdownMobile;
