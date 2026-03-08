// ─── Easings ────────────────────────────────────────────────────────────────
export const ease = {
	power3Out: [0.22, 1, 0.36, 1],
	power2Out: [0.25, 0.46, 0.45, 0.94],
	expo: [0.16, 1, 0.3, 1],
	smooth: [0.32, 0.72, 0, 1],
	spring: { type: "spring", stiffness: 260, damping: 20 },
	springGentle: { type: "spring", stiffness: 120, damping: 20 },
	springBouncy: { type: "spring", stiffness: 400, damping: 10 },
};

// ─── Fade variants ───────────────────────────────────────────────────────────
export const fadeUp = {
	hidden: { opacity: 0, y: 40 },
	visible: (i = 0) => ({
		opacity: 1,
		y: 0,
		transition: { duration: 0.7, ease: ease.power3Out, delay: i * 0.1 },
	}),
};

export const fadeIn = {
	hidden: { opacity: 0 },
	visible: (i = 0) => ({
		opacity: 1,
		transition: { duration: 0.6, ease: ease.power2Out, delay: i * 0.1 },
	}),
};

export const fadeLeft = {
	hidden: { opacity: 0, x: -40 },
	visible: (i = 0) => ({
		opacity: 1,
		x: 0,
		transition: { duration: 0.7, ease: ease.power3Out, delay: i * 0.1 },
	}),
};

export const fadeRight = {
	hidden: { opacity: 0, x: 40 },
	visible: (i = 0) => ({
		opacity: 1,
		x: 0,
		transition: { duration: 0.7, ease: ease.power3Out, delay: i * 0.1 },
	}),
};

// ─── Scale variants ──────────────────────────────────────────────────────────
export const scaleUp = {
	hidden: { opacity: 0, scale: 0.85 },
	visible: (i = 0) => ({
		opacity: 1,
		scale: 1,
		transition: { duration: 0.6, ease: ease.expo, delay: i * 0.08 },
	}),
};

// ─── Stagger container ───────────────────────────────────────────────────────
export const staggerContainer = (stagger = 0.1, delayChildren = 0) => ({
	hidden: {},
	visible: {
		transition: { staggerChildren: stagger, delayChildren },
	},
});

export const staggerItem = {
	hidden: { opacity: 0, y: 30 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.6, ease: ease.power3Out },
	},
};

// ─── Clip-path reveal ────────────────────────────────────────────────────────
export const clipRevealY = {
	hidden: { clipPath: "inset(100% 0% 0% 0%)", opacity: 0 },
	visible: (i = 0) => ({
		clipPath: "inset(0% 0% 0% 0%)",
		opacity: 1,
		transition: { duration: 0.8, ease: ease.expo, delay: i * 0.12 },
	}),
};

export const clipRevealX = {
	hidden: { clipPath: "inset(0% 100% 0% 0%)" },
	visible: (i = 0) => ({
		clipPath: "inset(0% 0% 0% 0%)",
		transition: { duration: 0.9, ease: ease.expo, delay: i * 0.1 },
	}),
};

// ─── Page transition variants ────────────────────────────────────────────────
export const pageTransition = {
	initial: { opacity: 0, y: 24, scale: 0.98 },
	animate: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: { duration: 0.5, ease: ease.power3Out },
	},
	exit: {
		opacity: 0,
		y: -12,
		scale: 0.98,
		transition: { duration: 0.3, ease: ease.power2Out },
	},
};

export const pageSlide = {
	initial: { clipPath: "inset(0 0 100% 0)" },
	animate: {
		clipPath: "inset(0 0 0% 0)",
		transition: { duration: 0.65, ease: ease.expo },
	},
	exit: {
		clipPath: "inset(0 0 100% 0)",
		transition: { duration: 0.4, ease: ease.power2Out },
	},
};

// ─── Card hover ──────────────────────────────────────────────────────────────
export const cardHover = {
	rest: { scale: 1, y: 0, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" },
	hover: {
		scale: 1.025,
		y: -6,
		boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
		transition: ease.springGentle,
	},
};

// ─── Image reveal / parallax ─────────────────────────────────────────────────
export const imageReveal = {
	hidden: { scale: 1.15, opacity: 0 },
	visible: {
		scale: 1,
		opacity: 1,
		transition: { duration: 0.9, ease: ease.expo },
	},
};

// ─── Slide variants for carousels / modals ───────────────────────────────────
export const slideVariants = {
	enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0, scale: 0.97 }),
	center: { x: 0, opacity: 1, scale: 1, transition: { duration: 0.55, ease: ease.smooth } },
	exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0, scale: 0.97 }),
};
