import { motion } from "framer-motion";

const containerVariants = (stagger = 0.1, delay = 0) => ({
	hidden: {},
	visible: {
		transition: {
			staggerChildren: stagger,
			delayChildren: delay,
		},
	},
});

const itemVariants = {
	hidden: { opacity: 0, y: 32 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
	},
};

/**
 * ScrollReveal – staggers direct children when they enter the viewport.
 *
 * Props:
 *   as        – HTML tag to render (default: "div")
 *   stagger   – delay between children (default: 0.1s)
 *   delay     – initial delay before first child (default: 0)
 *   once      – only animate once (default: true)
 *   threshold – viewport threshold (default: 0.15)
 *   className – forwarded to the wrapper
 *   children  – elements to stagger
 *
 * Each child is automatically wrapped in a <motion.div> unless you pass
 * asChild={false} or the child is already a motion element.
 */
export default function ScrollReveal({
	as: Tag = "div",
	stagger = 0.1,
	delay = 0,
	once = true,
	threshold = 0.15,
	className = "",
	children,
}) {
	const MotionTag = motion[Tag] ?? motion.div;

	return (
		<MotionTag
			className={className}
			variants={containerVariants(stagger, delay)}
			initial="hidden"
			whileInView="visible"
			viewport={{ once, amount: threshold }}
		>
			{Array.isArray(children)
				? children.map((child, i) => (
						<motion.div key={i} variants={itemVariants}>
							{child}
						</motion.div>
					))
				: <motion.div variants={itemVariants}>{children}</motion.div>}
		</MotionTag>
	);
}

/** Re-export item variant so consumers can use it directly on motion elements */
export { itemVariants as scrollRevealItem };
