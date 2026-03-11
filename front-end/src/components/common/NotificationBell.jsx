import { useState, useRef } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useNotification } from "@/components/contexts/NotificationContext";
import NotificationDropdown from "./NotificationDropdown";
import NotificationDropdownMobile from "./NotificationDropdownMobile";

const NotificationBell = () => {
	const { getUnreadCount } = useNotification();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const bellRef = useRef(null);
	const [bellPosition, setBellPosition] = useState({ top: 0, right: 0 });
	const unreadCount = getUnreadCount();

	const handleToggle = () => {
		if (!isDropdownOpen && bellRef.current) {
			const rect = bellRef.current.getBoundingClientRect();
			setBellPosition({
				top: rect.bottom + 12, // 12px gap
				right: window.innerWidth - rect.right,
			});
		}
		setIsDropdownOpen(!isDropdownOpen);
	};

	return (
		<div className="relative z-50">
			<motion.button
				ref={bellRef}
				onClick={handleToggle}
				className="relative p-2.5 rounded-lg hover:bg-gray-100 transition-colors duration-200"
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
				aria-label="Notificações"
			>
				<motion.div
					animate={{ y: isDropdownOpen ? 0 : 0 }}
					transition={{
						type: "spring",
						stiffness: 200,
						damping: 20,
					}}
				>
					<Bell className="w-5 h-5 text-gray-700" />
				</motion.div>

				{unreadCount > 0 && (
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						exit={{ scale: 0 }}
						transition={{
							type: "spring",
							stiffness: 300,
							damping: 20,
						}}
						className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
					>
						{unreadCount > 99 ? "99+" : unreadCount}
					</motion.div>
				)}
			</motion.button>

			{/* Desktop Dropdown (via Portal) */}
			{isDropdownOpen &&
				createPortal(
					<AnimatePresence>
						<motion.div
							initial={{
								opacity: 0,
								scale: 0.95,
								y: -8,
							}}
							animate={{
								opacity: 1,
								scale: 1,
								y: 0,
							}}
							exit={{
								opacity: 0,
								scale: 0.95,
								y: -8,
							}}
							transition={{
								type: "spring",
								stiffness: 300,
								damping: 25,
								mass: 0.8,
							}}
							style={{
								position: "fixed",
								top: `${bellPosition.top}px`,
								right: `${bellPosition.right}px`,
								zIndex: 999,
							}}
							onClick={(e) => e.stopPropagation()}
							className="hidden md:block"
						>
							<NotificationDropdown
								onClose={() =>
									setIsDropdownOpen(false)
								}
							/>
						</motion.div>
					</AnimatePresence>,
					document.body
				)}

			{/* Mobile Drawer */}
			{isDropdownOpen &&
				createPortal(
					<NotificationDropdownMobile
						onClose={() => setIsDropdownOpen(false)}
					/>,
					document.body
				)}

			{/* Backdrop for closing on click outside (desktop) */}
			{isDropdownOpen &&
				createPortal(
					<div
						className="fixed inset-0 z-40 hidden md:block"
						onClick={() => setIsDropdownOpen(false)}
					/>,
					document.body
				)}
		</div>
	);
};

export default NotificationBell;
