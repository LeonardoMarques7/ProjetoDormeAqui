import { MapPin, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// Tentar ambas as variáveis (fallback)
const googleMapsApiKey = 
	import.meta.env.VITE_GOOGLE_PLACES_API_KEY ||
	import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

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
	const [iframeError, setIframeError] = useState(false);

	// Validar se a API key está configurada
	const hasApiKey =
		googleMapsApiKey &&
		typeof googleMapsApiKey === "string" &&
		googleMapsApiKey.trim() !== "";

	const hasValidCity = city && typeof city === "string" && city.trim() !== "";

	const shouldShowMap = hasValidCity && hasApiKey;

	useEffect(() => {
		// Debug: Log da configuração
		if (!hasValidCity) {
			console.warn("[PlaceLocation] City não foi fornecido:", { city });
		}
		if (!hasApiKey) {
			console.warn("[PlaceLocation] Google Maps API Key não configurada:", {
				key: googleMapsApiKey,
				env: import.meta.env,
			});
		}
	}, [hasValidCity, hasApiKey]);

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
				{shouldShowMap && !iframeError ? (
					<div className="relative w-full h-64 rounded-2xl overflow-hidden bg-gray-50">
						<iframe
							src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${encodeURIComponent(city)}&zoom=12`}
							className="w-full h-full border-0"
							allowFullScreen={true}
							loading="lazy"
							referrerPolicy="no-referrer-when-downgrade"
							title={`Mapa de ${city}`}
							onError={() => {
								console.error("[PlaceLocation] Erro ao carregar iframe do mapa");
								setIframeError(true);
							}}
							style={{
								boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
								borderRadius: "1rem",
							}}
						/>
					</div>
				) : (
					<div className="w-full h-64 rounded-2xl bg-gray-100 flex flex-col items-center justify-center text-gray-500 gap-3">
						{!hasValidCity ? (
							<>
								<AlertCircle size={48} className="text-amber-500" />
								<p className="text-center text-sm">
									Informação de localização não disponível
								</p>
							</>
						) : !hasApiKey ? (
							<>
								<AlertCircle size={48} className="text-red-500" />
								<p className="text-center text-sm">
									Chave de API do Google Maps não configurada
								</p>
								<p className="text-center text-xs text-gray-400">
									Configure VITE_GOOGLE_MAPS_API_KEY
								</p>
							</>
						) : iframeError ? (
							<>
								<AlertCircle size={48} className="text-red-500" />
								<p className="text-center text-sm">
									Erro ao carregar o mapa
								</p>
								<p className="text-center text-xs text-gray-400">
									Tente recarregar a página
								</p>
							</>
						) : (
							<>
								<MapPin size={48} />
								<p>Mapa não disponível</p>
							</>
						)}
					</div>
				)}
			</motion.div>
		</motion.div>
	);
}
