import { useState, useRef, useEffect } from "react";
import printIphone12 from "@/assets/print-iphone-14.png";

const VIDEO_SRC =
	"https://res.cloudinary.com/dljk7hf81/video/upload/v1758916215/Video_model_midjourney_ngbdaf.mp4";

export default function IOSVideoPlayer() {
	const videoRef = useRef(null);
	const [playing, setPlaying] = useState(false);
	const [showOverlay, setShowOverlay] = useState(true);
	const [progress, setProgress] = useState(0);
	const [mounted, setMounted] = useState(false);

	// Fade-in mount animation
	useEffect(() => {
		const t = setTimeout(() => setMounted(true), 80);
		return () => clearTimeout(t);
	}, []);

	// Track progress
	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;
		const onTimeUpdate = () => {
			if (video.duration) setProgress(video.currentTime / video.duration);
		};
		video.addEventListener("timeupdate", onTimeUpdate);
		return () => video.removeEventListener("timeupdate", onTimeUpdate);
	}, []);

	const togglePlay = () => {
		const video = videoRef.current;
		if (!video) return;
		if (playing) {
			video.pause();
			setPlaying(false);
			setShowOverlay(true);
		} else {
			video.play();
			setPlaying(true);
			setShowOverlay(false);
		}
	};

	// Tap on video shows overlay briefly, then hides it
	const handleVideoTap = () => {
		if (playing) {
			setShowOverlay(true);
			clearTimeout(window.__playerHideTimer);
			window.__playerHideTimer = setTimeout(() => setShowOverlay(false), 2000);
		}
	};

	return (
		<div style={styles.page}>
			<div
				style={{
					...styles.phoneWrapper,
					opacity: mounted ? 1 : 0,
					transform: mounted
						? "translateY(0) scale(1)"
						: "translateY(32px) scale(0.97)",
					transition:
						"opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)",
				}}
			>
				{/* Phone shell */}
				<div style={styles.phone}>
					{/* Dynamic Island */}
					<div style={styles.dynamicIsland} />

					{/* Screen */}
					<div style={styles.screen}>
						{/* Video */}
						<video
							ref={videoRef}
							src={VIDEO_SRC}
							poster={printIphone12}
							loop
							muted
							playsInline
							onClick={handleVideoTap}
							style={styles.video}
						/>

						{/* Play/Pause Overlay */}
						<div
							onClick={togglePlay}
							style={{
								...styles.overlay,
								opacity: showOverlay ? 1 : 0,
								pointerEvents: showOverlay ? "auto" : "none",
							}}
						>
							<div style={styles.controlButton}>
								{playing ? (
									// Pause icon
									<svg width="22" height="24" viewBox="0 0 22 24" fill="none">
										<rect
											x="1"
											y="2"
											width="6"
											height="20"
											rx="2"
											fill="#000"
										/>
										<rect
											x="15"
											y="2"
											width="6"
											height="20"
											rx="2"
											fill="#000"
										/>
									</svg>
								) : (
									// Play icon
									<svg
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										style={{ marginLeft: 3 }}
									>
										<polygon points="5,3 21,12 5,21" fill="#000" />
									</svg>
								)}
							</div>
						</div>

						{/* Progress bar */}
						{playing && (
							<div style={styles.progressTrack}>
								<div
									style={{
										...styles.progressFill,
										width: `${progress * 100}%`,
									}}
								/>
							</div>
						)}
					</div>

					{/* Home indicator */}
					<div style={styles.homeIndicator} />
				</div>

				{/* Ambient glow under phone */}
				<div style={styles.glow} />
			</div>
		</div>
	);
}

const styles = {
	page: {
		minHeight: "100vh",
		width: "100%",
		background:
			"radial-gradient(ellipse at 60% 30%, #2a2a2a 0%, #111 60%, #000 100%)",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		fontFamily: "sans-serif",
	},
	phoneWrapper: {
		position: "relative",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
	},
	phone: {
		width: 300,
		height: 600,
		backgroundColor: "#0a0a0a",
		borderRadius: 56,
		padding: 10,
		boxShadow:
			"0 0 0 1px rgba(255,255,255,0.08), 0 8px 40px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)",
		position: "relative",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		zIndex: 1,
	},
	dynamicIsland: {
		position: "absolute",
		top: 18,
		left: "50%",
		transform: "translateX(-50%)",
		width: 110,
		height: 30,
		backgroundColor: "#000",
		borderRadius: 15,
		zIndex: 10,
		boxShadow: "0 2px 8px rgba(0,0,0,0.6)",
	},
	screen: {
		width: "100%",
		height: "100%",
		backgroundColor: "#000",
		borderRadius: 48,
		overflow: "hidden",
		position: "relative",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
	video: {
		width: "100%",
		height: "100%",
		objectFit: "cover",
		borderRadius: 48,
		display: "block",
		cursor: "pointer",
	},
	overlay: {
		position: "absolute",
		top: 0,
		left: 0,
		width: "100%",
		height: "100%",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.18)",
		transition: "opacity 0.35s cubic-bezier(0.4,0,0.2,1)",
		cursor: "pointer",
		zIndex: 5,
		borderRadius: 48,
	},
	controlButton: {
		width: 64,
		height: 64,
		borderRadius: "50%",
		backgroundColor: "rgba(255,255,255,0.85)",
		backdropFilter: "blur(12px)",
		WebkitBackdropFilter: "blur(12px)",
		border: "1px solid rgba(255,255,255,0.4)",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		boxShadow:
			"0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0.5px rgba(255,255,255,0.9)",
		transition: "transform 0.15s ease, background-color 0.15s ease",
	},
	progressTrack: {
		position: "absolute",
		bottom: 24,
		left: "50%",
		transform: "translateX(-50%)",
		width: "70%",
		height: 3,
		backgroundColor: "rgba(255,255,255,0.25)",
		borderRadius: 2,
		zIndex: 6,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		backgroundColor: "rgba(255,255,255,0.85)",
		borderRadius: 2,
		transition: "width 0.25s linear",
	},
	homeIndicator: {
		position: "absolute",
		bottom: 14,
		left: "50%",
		transform: "translateX(-50%)",
		width: 120,
		height: 5,
		backgroundColor: "rgba(255,255,255,0.25)",
		borderRadius: 3,
		zIndex: 10,
	},
	glow: {
		position: "absolute",
		bottom: -40,
		left: "50%",
		transform: "translateX(-50%)",
		width: 200,
		height: 60,
		background:
			"radial-gradient(ellipse, rgba(120,80,200,0.25) 0%, transparent 70%)",
		filter: "blur(20px)",
		zIndex: 0,
		pointerEvents: "none",
	},
};
