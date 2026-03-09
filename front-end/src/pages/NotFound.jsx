import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";

const MotionLink = motion.create(Link);

export default function NotFound() {
	const { scrollY } = useScroll();
	const decorativeY = useTransform(scrollY, [0, 400], [0, 60]);

	return (
		<motion.div
			className="relative overflow-hidden min-h-100 py-15 flex items-center max-sm:rounded-none max-sm:min-h-screen justify-start w-full mx-auto max-w-7xl bg-accent rounded-2xl"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
		>
			{/* Decorative large "404" background text */}
			<motion.span
				style={{ y: decorativeY }}
				className="pointer-events-none select-none absolute right-0 top-1/2 -translate-y-1/2 text-[20rem] font-black text-gray-200/40 leading-none"
				aria-hidden="true"
			>
				404
			</motion.span>

			<div className="relative text-start mx-8 mt-5 max-sm:max-w-svw max-w-lg flex flex-col gap-5">
				<motion.p
					className="text-primary-500 uppercase font-light"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1, duration: 0.5 }}
				>
					Erro 404
				</motion.p>

				<motion.p
					className="text-8xl font-bold max-sm:text-5xl max-sm:leading-none -pl-1 leading-22"
					initial={{ opacity: 0, x: -40 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
				>
					Página não encontrada
				</motion.p>

				<motion.p
					className="text-gray-500 mb-8"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.35, duration: 0.6 }}
				>
					Mas isso não significa que sua busca pelo lugar perfeito precisa parar
					por aqui.
				</motion.p>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.97 }}
					className="w-fit"
				>
					<Link
						to="/"
						className="bg-primary flex items-center gap-4 max-sm:mt-0 mt-4 w-fit text-white px-6 py-3 rounded-lg hover:bg-primary-800 transition-colors"
					>
						<ArrowLeft />
						Voltar ao Início
					</Link>
				</motion.div>
			</div>
		</motion.div>
	);
}
