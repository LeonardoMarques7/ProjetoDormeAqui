import { AnimatePresence, motion } from "framer-motion";
import useNotifications from "@/hooks/useNotifications";

const SnackbarUndo = () => {
	const { pendingDeletes, undoRemove } = useNotifications();

	return (
		<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-2 items-center pointer-events-none">
			<AnimatePresence>
				{pendingDeletes.map((notification) => (
					<motion.div
						key={notification._id}
						initial={{ opacity: 0, y: 20, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 20, scale: 0.95 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
						className="pointer-events-auto flex items-center gap-3 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg min-w-[260px] max-w-sm"
						role="status"
						aria-live="polite"
					>
						<span className="flex-1 truncate">
							Notificação removida
						</span>
						<button
							type="button"
							onClick={() => undoRemove(notification._id)}
							className="font-semibold text-yellow-300 hover:text-yellow-100 transition-colors underline underline-offset-2 text-sm flex-shrink-0"
						>
							Desfazer
						</button>
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	);
};

export default SnackbarUndo;
