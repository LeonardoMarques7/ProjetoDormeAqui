import { motion } from "framer-motion";
import { Bell } from "lucide-react";

const EmptyNotificationState = () => {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="flex flex-col items-center justify-center py-12 px-4"
		>
			<motion.div
				animate={{ y: [0, -5, 0] }}
				transition={{ duration: 2, repeat: Infinity }}
				className="text-5xl mb-3"
			>
				🔔
			</motion.div>

			<h3 className="text-lg font-semibold text-gray-900 mb-1">
				Sem nenhuma notificação
			</h3>

			<p className="text-sm text-gray-500 text-center max-w-xs">
				Quando você receber mensagens, reservas ou atualizações da plataforma, elas aparecerão aqui.
			</p>
		</motion.div>
	);
};

export default EmptyNotificationState;
