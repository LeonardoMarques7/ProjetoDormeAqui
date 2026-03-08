import { motion } from "framer-motion";
import Perk from "@/components/common/Perk";
import { useMobileContext } from "../contexts/MobileContext";

const stagger = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const fadeUp = {
	hidden: { opacity: 0, y: 28 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const maskReveal = {
	hidden: { y: "105%" },
	visible: { y: "0%", transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};

export default function PlacePerks({ perks }) {
	const { mobile } = useMobileContext();

	return (
		<motion.div
			className="py-7 border-b max-w-2xl"
			variants={stagger}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true }}
		>
			<div className="overflow-hidden">
				<motion.p variants={maskReveal} className="text-primary-500 uppercase font-light">
					Comodidades
				</motion.p>
			</div>
			<div className="overflow-hidden">
				<motion.p variants={maskReveal} className="text-3xl font-bold">
					O que esse lugar oferece
				</motion.p>
			</div>

			<motion.div variants={fadeUp} className="mt-2">
				<div className="sm:grid sm:grid-cols-2 max-sm:flex max-sm:flex-wrap gap-3 max-sm:gap-2.5 mt-5 max-w-7xl mx-auto">
					{perks.map(
						(perk, index) =>
							perk && (
								<motion.div
									key={index}
									variants={fadeUp}
									className={`flex w-fit items-center text-sm rounded-2xl gap-2.5 ${
										mobile ? "border border-primary-100 px-3 py-2 rounded-xl" : ""
									}`}
								>
									<Perk place={true} perk={perk} />
								</motion.div>
							),
					)}
				</div>
			</motion.div>
		</motion.div>
	);
}
