import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * MagneticCursor – custom cursor with:
 *   • large ring that follows with spring physics
 *   • small trailing dot that snaps faster
 *   • magnetic attraction to elements with data-magnetic="true"
 *   • text-mode when hovering data-cursor-text elements
 */
export default function MagneticCursor() {
	const cursorRef = useRef(null);
	const [cursorText, setCursorText] = useState("");
	const [isPointer, setIsPointer] = useState(false);
	const [isHidden, setIsHidden] = useState(true);

	// Raw mouse position
	const rawX = useMotionValue(-100);
	const rawY = useMotionValue(-100);

	// Dot (snappy) – slight lag
	const dotX = useSpring(rawX, { stiffness: 600, damping: 35, mass: 0.3 });
	const dotY = useSpring(rawY, { stiffness: 600, damping: 35, mass: 0.3 });

	// Ring (sluggish) – heavy lag for trailing effect
	const ringX = useSpring(rawX, { stiffness: 160, damping: 22, mass: 0.8 });
	const ringY = useSpring(rawY, { stiffness: 160, damping: 22, mass: 0.8 });

	// Ring scale
	const ringScale = useSpring(1, { stiffness: 300, damping: 25 });

	useEffect(() => {
		const onMove = (e) => {
			rawX.set(e.clientX);
			rawY.set(e.clientY);
			setIsHidden(false);
		};

		const onLeave = () => setIsHidden(true);
		const onEnter = () => setIsHidden(false);

		const onOver = (e) => {
			const el = e.target;
			const isMagnetic = el.closest("[data-magnetic]");
			const cursorTextEl = el.closest("[data-cursor-text]");
			const isClickable =
				el.closest("a, button, [role='button'], [data-cursor]") ||
				window.getComputedStyle(el).cursor === "pointer";

			if (cursorTextEl) {
				setCursorText(cursorTextEl.dataset.cursorText || "");
				ringScale.set(2.2);
			} else if (isClickable) {
				setCursorText("");
				ringScale.set(1.6);
				setIsPointer(true);
			} else {
				setCursorText("");
				ringScale.set(1);
				setIsPointer(false);
			}
		};

		window.addEventListener("mousemove", onMove);
		window.addEventListener("mouseleave", onLeave);
		window.addEventListener("mouseenter", onEnter);
		window.addEventListener("mouseover", onOver);

		return () => {
			window.removeEventListener("mousemove", onMove);
			window.removeEventListener("mouseleave", onLeave);
			window.removeEventListener("mouseenter", onEnter);
			window.removeEventListener("mouseover", onOver);
		};
	}, [rawX, rawY, ringScale]);

	const visible = !isHidden;

	return (
		<>
			{/* ── Trailing ring ── */}
			{/* <motion.div
				className="magnetic-cursor-ring"
				style={{
					x: ringX,
					y: ringY,
					scale: ringScale,
					opacity: visible ? 1 : 0,
				}}
			>
				{cursorText && (
					<span className="magnetic-cursor-text">{cursorText}</span>
				)}
			</motion.div> */}

			{/* ── Dot ── */}
			<motion.div
				className="magnetic-cursor-dot z-1000"
				style={{
					x: dotX,
					y: dotY,
					opacity: visible ? 1 : 0,
					scale: isPointer ? 0 : 1,
				}}
			/>
		</>
	);
}
