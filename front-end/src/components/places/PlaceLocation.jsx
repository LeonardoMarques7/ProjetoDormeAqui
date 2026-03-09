import { MapPin } from "lucide-react";
import { motion } from "framer-motion";

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

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

export default function PlaceLocation({ city }) {
	const hasMap =
		city &&
		googleMapsApiKey &&
		typeof googleMapsApiKey === "string" &&
		googleMapsApiKey.trim() !== "";

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
					Localização
				</motion.p>
			</div>
			<div className="overflow-hidden">
				<motion.p variants={maskReveal} className="text-3xl font-bold">
					Onde você vai ficar
				</motion.p>
			</div>

			<motion.div variants={fadeUp} className="mt-5">
				{hasMap ? (
					<iframe
						src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${encodeURIComponent(city)}&zoom=12`}
						className="w-full h-64 rounded-2xl border-0 shadow-sm"
						allowFullScreen
						loading="lazy"
						referrerPolicy="no-referrer-when-downgrade"
						title={`Mapa de ${city}`}
					/>
				) : (
					<div className="w-full h-64 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500">
						<MapPin size={48} className="mb-2" />
						<p>Mapa não disponível</p>
					</div>
				)}
			</motion.div>
		</motion.div>
	);
}
