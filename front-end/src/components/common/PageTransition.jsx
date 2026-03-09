import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

const variants = {
	initial: {
		opacity: 0,
		clipPath: "inset(0 0 8% 0)",
		y: 20,
	},
	animate: {
		opacity: 1,
		clipPath: "inset(0 0 0% 0)",
		y: 0,
		transition: {
			duration: 0.55,
			ease: [0.22, 1, 0.36, 1],
		},
	},
	exit: {
		opacity: 0,
		clipPath: "inset(8% 0 0 0)",
		y: -16,
		transition: {
			duration: 0.35,
			ease: [0.32, 0.72, 0, 1],
		},
	},
};

/**
 * PageTransition – wrap this around <Routes> in App.jsx.
 * Uses location.key so each route change triggers the animation.
 */
export default function PageTransition({ children }) {
	const location = useLocation();

	return (
		<AnimatePresence mode="wait" initial={false}>
			<motion.div
				key={location.key}
				variants={variants}
				initial="initial"
				animate="animate"
				exit="exit"
				style={{ transformOrigin: "top center" }}
			>
				{children}
			</motion.div>
		</AnimatePresence>
	);
}
