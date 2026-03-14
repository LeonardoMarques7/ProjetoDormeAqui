import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import printHome from "../../assets/imageBanner.png";

export default function FeaturedVideo() {
	const sectionRef = useRef(null);
	const { scrollY } = useScroll();
	const parallaxY = useTransform(scrollY, [0, 800], [-10, 10]);

	return (
		<section
			ref={sectionRef}
			className="w-full py-20 px-4 flex flex-col items-center"
		>
			{/* Title */}
			{/* <motion.h2
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				className="text-4xl font-extrabold text-primary-900 text-center mb-12"
			>
				Experiência em destaque
			</motion.h2> */}

			{/* Video card */}
			<div
				className="relative w-full max-w-4xl rounded-[2rem] overflow-hidden shadow-2xl border border-white/20"
				style={{ aspectRatio: "16/10" }}
			>
				{/* Video background */}
				<motion.div
					className="absolute inset-0"
					initial={{ scale: 1.05 }}
					whileInView={{ scale: 1 }}
					transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
				>
					<motion.div className="w-full h-full" style={{ y: parallaxY }}>
						{/* <video
							src="/videos/demo.mp4"
							autoPlay
							muted
							loop
							playsInline
							className="w-full h-full object-cover"
						/> */}
						<img src={printHome} alt="Tela inicial do Projeto" />
					</motion.div>

					{/* Overlay */}
					{/* <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" /> */}
				</motion.div>

				{/* Text */}
				{/* <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 z-10">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
					>
						<h3 className="text-white text-4xl font-extrabold mb-3 drop-shadow-lg">
							Descubra novos lugares
						</h3>

						<p className="text-white/75 max-w-md">
							Viva experiências únicas em hospedagens selecionadas para você.
						</p>
					</motion.div>
				</div> */}
			</div>
		</section>
	);
}
