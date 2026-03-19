import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { Menu, MenuButton, MenuItems } from "@headlessui/react";
import { useNotification } from "@/components/contexts/NotificationContext";
import NotificationDropdown from "./NotificationDropdown";

function useIsMobile() {
	const [isMobile, setIsMobile] = useState(() =>
		typeof window !== "undefined"
			? window.matchMedia("(max-width: 639px)").matches
			: false,
	);

	useEffect(() => {
		const mq = window.matchMedia("(max-width: 639px)");
		const handler = (e) => setIsMobile(e.matches);
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	return isMobile;
}

const NotificationBell = () => {
	const { getUnreadCount } = useNotification();
	const unreadCount = getUnreadCount();
	const isMobile = useIsMobile();
	const [mobileOpen, setMobileOpen] = useState(false);

	const badge = unreadCount > 0 && (
		<motion.div
			initial={{ scale: 0 }}
			animate={{ scale: 1 }}
			exit={{ scale: 0 }}
			transition={{ type: "spring", stiffness: 300, damping: 20 }}
			className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
		>
			{unreadCount > 99 ? "99+" : unreadCount}
		</motion.div>
	);

	if (isMobile) {
		return (
			<>
				<motion.button
					onClick={() => setMobileOpen(true)}
					className="relative p-2.5 rounded-lg hover:bg-gray-100 transition-colors duration-200"
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					aria-label="Notificações"
				>
					<Bell className="w-5 h-5 text-gray-700" />
					{badge}
				</motion.button>

				{createPortal(
					<AnimatePresence>
						{mobileOpen && (
							<motion.div
								key="mobile-notifications"
								initial={{ y: "100%" }}
								animate={{ y: 0 }}
								exit={{ y: "100%" }}
								transition={{ type: "spring", damping: 28, stiffness: 280 }}
								className="fixed inset-0 z-[999] bg-white flex flex-col"
							>
								<NotificationDropdown
									className="flex flex-col flex-1 overflow-hidden bg-white"
									onClose={() => setMobileOpen(false)}
								/>
							</motion.div>
						)}
					</AnimatePresence>,
					document.body,
				)}
			</>
		);
	}

	return (
		<Menu as="div" className="relative">
			{({ open }) => (
				<>
					<MenuButton
						className="relative p-2.5 rounded-lg hover:bg-gray-100 active:scale-95 transition-all duration-200 outline-none cursor-pointer"
						aria-label="Notificações"
					>
						<Bell className="w-5 h-5 text-gray-700" />
						{badge}
					</MenuButton>

					<AnimatePresence>
						{open && (
							<MenuItems
								static
								as={motion.div}
								initial={{ opacity: 0, scale: 0.95, y: -8 }}
								animate={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.95, y: -8 }}
								transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
								className="absolute right-0 top-full mt-3 z-50 w-96 max-w-[calc(100vw-1rem)] outline-none origin-top-right"
							>
								<NotificationDropdown />
							</MenuItems>
						)}
					</AnimatePresence>
				</>
			)}
		</Menu>
	);
};

export default NotificationBell;
