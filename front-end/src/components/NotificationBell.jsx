import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import useNotifications from "@/hooks/useNotifications";

const NotificationBell = () => {
	const { unreadCount, togglePanel, panelOpen } = useNotifications();

	return (
		<button
			type="button"
			onClick={togglePanel}
			aria-label={
				panelOpen
					? "Fechar notificações"
					: `Abrir notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ""}`
			}
			className="relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
		>
			<Bell className="w-5 h-5 text-gray-700" />

			<AnimatePresence>
				{unreadCount > 0 && (
					<motion.span
						key="badge"
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						exit={{ scale: 0 }}
						transition={{ type: "spring", stiffness: 500, damping: 30 }}
						className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none"
					>
						{unreadCount > 99 ? "99+" : unreadCount}
					</motion.span>
				)}
			</AnimatePresence>
		</button>
	);
};

export default NotificationBell;
