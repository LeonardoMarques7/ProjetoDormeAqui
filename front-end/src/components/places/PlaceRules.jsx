import { CalendarX, ScrollText, ShieldHalf } from "lucide-react";
import { motion } from "framer-motion";

const stagger = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const fadeUp = {
	hidden: { opacity: 0, y: 28 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const maskReveal = {
	hidden: { y: "105%" },
	visible: { y: "0%", transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};

export default function PlaceRules({ place, refundPolicy }) {
	return (
		<motion.div
			className="py-7 max-w-2xl border-b"
			variants={stagger}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true }}
		>
			<div className="overflow-hidden">
				<motion.p variants={maskReveal} className="text-primary-500 uppercase font-light">
					Políticas e Regras
				</motion.p>
			</div>
			<div className="overflow-hidden">
				<motion.p variants={maskReveal} className="text-3xl font-bold">
					O que você deve saber
				</motion.p>
			</div>

			<motion.div variants={fadeUp} className="my-4 space-y-6">
				<div>
					<CalendarX size={18} />
					<p className="font-semibold mt-2">Política de cancelamento</p>
					<p className="text-gray-600 mb-3">
						{refundPolicy
							? refundPolicy
							: "Adicione as datas de viagem para obter as informações de cancelamento dessa reserva."}
					</p>
				</div>

				<div>
					<ScrollText size={18} />
					<p className="font-semibold mt-2">Regras da casa</p>
					<div className="flex flex-col text-gray-700">
						<span>Check-in após {place.checkin}</span>
						<span>Checkout antes das {place.checkout}</span>
						<span>Máximo de {place.guests > 1 ? "hóspedes" : "hóspede"}</span>
					</div>
				</div>

				<div>
					<ShieldHalf size={18} />
					<p className="font-semibold mt-2">Segurança e propriedade</p>
					<div className="flex flex-col text-gray-700">
						<span>Alarme de monóxido de carbono não informado</span>
						<span>Detector de fumaça não informado</span>
						<span>Câmeras de segurança na parte externa da propriedade</span>
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
}
