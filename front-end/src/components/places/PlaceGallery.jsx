import { Expand } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import LightGallery from "lightgallery/react";
import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";
import lgFullscreen from "lightgallery/plugins/fullscreen";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import "lightgallery/css/lg-fullscreen.css";
import { useRef, useState } from "react";
import photoDefaultLoading from "../../assets/loadingGif2.gif";
import photoDefault from "../../assets/photoDefault.jpg";
import { useMobileContext } from "../contexts/MobileContext";

const stagger = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const galleryItem = {
	hidden: { clipPath: "inset(100% 0 0 0)", scale: 1.06 },
	visible: {
		clipPath: "inset(0% 0 0 0)",
		scale: 1,
		transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
	},
};

export default function PlaceGallery({ photos }) {
	const { mobile } = useMobileContext();
	const lightGalleryRef = useRef(null);
	const galleryRef = useRef(null);
	const [imageErrors, setImageErrors] = useState({});

	const { scrollY } = useScroll();
	const parallaxY = useTransform(scrollY, [0, 600], [0, -60]);

	const handleImageError = (index) => {
		setImageErrors((prev) => ({ ...prev, [index]: true }));
	};

	const getImageSrc = (index) => {
		return imageErrors[index] ? photoDefault : photos[index] || photoDefault;
	};

	const handleImageClick = (index) => {
		if (lightGalleryRef.current) {
			lightGalleryRef.current.openGallery(index);
		}
	};

	const handleShowMoreClick = () => {
		if (lightGalleryRef.current) {
			lightGalleryRef.current.openGallery(0);
		}
	};

	return (
		<>
			<LightGallery
				onInit={(detail) => {
					lightGalleryRef.current = detail.instance;
				}}
				speed={500}
				plugins={[lgThumbnail, lgZoom, lgFullscreen]}
				dynamic
				dynamicEl={photos.map((_, id) => ({
					src: getImageSrc(id),
					thumb: getImageSrc(id),
				}))}
			/>

			<div
				ref={galleryRef}
				className="max-sm:p-0 max-sm:shadow-none max-h-full max-sm:mt-15 max-sm:bg-transparent max-w-full mx-auto w-full object-cover bg-center relative overflow-hidden"
			>
				<motion.div style={{ y: parallaxY }}>
					<motion.div
						className="grid relative grid-cols-5 grid-rows-2 max-sm:grid-cols-3 h-100 max-sm:p-2 gap-2 2xl:h-150 max-sm:h-[50svh]"
						variants={stagger}
						initial="hidden"
						animate="visible"
					>
						{/* Imagem principal */}
						<motion.div
							className="col-span-3 row-span-2 max-sm:col-span-4 max-sm:row-span-2 overflow-hidden rounded-2xl"
							variants={galleryItem}
						>
							<img
								className="w-full h-full object-cover cursor-pointer hover:scale-[1.04] transition-transform duration-700"
								src={getImageSrc(0)}
								onError={() => handleImageError(0)}
								alt="Imagem da acomodação"
								onClick={() => handleImageClick(0)}
							/>
						</motion.div>

						<motion.div
							className="col-span-1 row-span-1 max-sm:col-span-2 overflow-hidden rounded-2xl"
							variants={galleryItem}
						>
							<img
								className="w-full h-full object-cover cursor-pointer hover:scale-[1.04] transition-transform duration-700"
								src={getImageSrc(1)}
								onError={() => handleImageError(1)}
								alt="Imagem da acomodação"
								onClick={() => handleImageClick(1)}
							/>
						</motion.div>

						<motion.div
							className="col-span-1 row-span-1 max-sm:col-span-2 overflow-hidden rounded-2xl"
							variants={galleryItem}
						>
							<img
								className="w-full h-full object-cover cursor-pointer hover:scale-[1.04] transition-transform duration-700"
								src={getImageSrc(2)}
								onError={() => handleImageError(2)}
								alt="Imagem da acomodação"
								onClick={() => handleImageClick(2)}
							/>
						</motion.div>

						{!mobile && (
							<>
								<motion.div
									className="col-span-1 row-span-1 max-sm:col-span-4 overflow-hidden rounded-2xl"
									variants={galleryItem}
								>
									<img
										className="w-full h-full border aspect-video object-cover hover:scale-[1.04] transition-transform duration-700"
										src={photoDefaultLoading}
										alt="Imagem da acomodação"
										onClick={() => handleImageClick(3)}
									/>
								</motion.div>

								<motion.div
									className="col-span-1 row-span-1 overflow-hidden rounded-2xl"
									variants={galleryItem}
								>
									<img
										className="w-full h-full border aspect-video object-cover hover:scale-[1.04] transition-transform duration-700"
										src={photoDefaultLoading}
										alt="Imagem da acomodação"
										onClick={() => handleImageClick(4)}
									/>
								</motion.div>
							</>
						)}

						<button
							className="absolute bottom-4 right-4 max-sm:text-sm max-sm:opacity-70 max-sm:p-2 hover:max-sm:opacity-100 flex items-center px-4 py-2 rounded-lg gap-2 bg-white border border-gray-800 hover:bg-gray-50 transition-all cursor-pointer font-medium"
							onClick={handleShowMoreClick}
						>
							<Expand size={18} />
							<span className="max-sm:hidden">Mostrar todas as fotos</span>
						</button>
					</motion.div>
				</motion.div>
			</div>
		</>
	);
}
