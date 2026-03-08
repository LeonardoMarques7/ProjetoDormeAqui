import { motion } from "framer-motion";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt({ html: false, breaks: true, linkify: true });

const fadeUp = {
	hidden: { opacity: 0, y: 28 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function PlaceDescription({ description }) {
	return (
		<motion.div
			className="border max-w-2xl border-r-0 py-7 border-l-0"
			variants={fadeUp}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true }}
		>
			<p
				dangerouslySetInnerHTML={{ __html: md.render(description) }}
			/>
		</motion.div>
	);
}
