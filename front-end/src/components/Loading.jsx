import React, { useEffect } from "react";
import { motion } from "framer-motion";
import ScrollReveal from "scrollreveal";
import { Bed, Home, MapPin, Key } from "lucide-react";

export default function Loading() {
	useEffect(() => {
		ScrollReveal().reveal(".sr-fade-1", {
			duration: 5000,
			origin: "bottom",
			distance: "600px",
			easing: "ease-in-out",
			interval: 500,
		});
		ScrollReveal().reveal(".sr-fade-2", {
			duration: 10000,
			origin: "bottom",
			distance: "600px",
			easing: "ease-in-out",
			interval: 1500,
		});
		ScrollReveal().reveal(".sr-fade-3", {
			duration: 15000,
			origin: "bottom",
			distance: "600px",
			easing: "ease-in-out",
			interval: 3000,
		});
	}, []);

	return (
		<div className="flex flex-col items-center gap-10 justify-center h-screen bg-primary-500 rounded-lg p-12 text-white">
			<div className="relative mb-10">
				<div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
				<Bed className="absolute inset-0 m-auto text-white size-10" />
			</div>

			<div className="flex flex-col gap-4 text-center ">
				<motion.p className="sr-fade-1 text-xl font-semibold flex items-center justify-center gap-2">
					<Home className="size-6" /> Sua hospedagem, seu lar temporário.
				</motion.p>

				<motion.p className="sr-fade-2 text-lg opacity-90 flex items-center justify-center gap-2">
					<MapPin className="size-6" /> Encontre o lugar perfeito em qualquer
					destino.
				</motion.p>

				<motion.p className="sr-fade-3 text-lg opacity-90 flex items-center justify-center gap-2">
					<Key className="size-6" /> Conforto e praticidade na palma da mão.
				</motion.p>
			</div>
		</div>
	);
}
