import { motion } from "framer-motion";
import { Bell } from "lucide-react";

const EmptyNotificationState = () => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ type: "spring", stiffness: 200, damping: 25 }}
			className="flex flex-col items-center justify-center py-16 px-6"
		>
			{/* Icon with animation */}
			<motion.div
				animate={{ y: [0, -6, 0] }}
				transition={{
					duration: 3,
					repeat: Infinity,
					ease: "easeInOut",
				}}
				className="mb-4"
			>
				<div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
					<Bell className="w-8 h-8 text-gray-400" />
				</div>
			</motion.div>

			<h3 className="text-base font-semibold text-gray-900 mb-2">
				Sem nenhuma notificação
			</h3>

			<p className="text-sm text-gray-500 text-center max-w-sm leading-relaxed">
				Quando você receber mensagens, reservas ou atualizações da
				plataforma, elas aparecerão aqui.
			</p>
		</motion.div>
	);
};

export default EmptyNotificationState;
