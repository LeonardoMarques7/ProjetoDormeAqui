import { Link } from "react-router-dom";
import { Skeleton } from "@mantine/core";
import MarkdownIt from "markdown-it";
import Autoplay from "embla-carousel-autoplay";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState, useRef } from "react";
import axios from "axios";
import { ShimmerButton } from "@/components/ui/shimmer-button";

import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import Perk from "./Perk";
import {
	Bath,
	Bed,
	Home,
	MapPin,
	Users2,
	Wifi,
	Waves,
	Thermometer,
	Star,
	ArrowRight,
	ChevronDown,
} from "lucide-react";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
const DotButton = ({ selected, onClick }) => (
	<button
		className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${
			selected ? "bg-white w-6" : "bg-white/50"
		}`}
		type="button"
		onClick={onClick}
	/>
);

const Item = ({ place = null, placeHolder }) => {
	const [owner, setOwner] = useState("");
	const [api, setApi] = useState();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [scrollSnaps, setScrollSnaps] = useState([]);
	const [isHovered, setIsHovered] = useState(false);
	const cardRef = useRef(null);

	const md = new MarkdownIt({
		html: false,
		breaks: true,
		linkify: true,
	});

	const onDotButtonClick = useCallback(
		(index) => {
			if (!api) return;
			api.scrollTo(index);
		},
		[api]
	);

	useEffect(() => {
		if (!api) return;

		setScrollSnaps(api.scrollSnapList());
		setSelectedIndex(api.selectedScrollSnap());

		api.on("select", () => {
			setSelectedIndex(api.selectedScrollSnap());
		});
	}, [api]);

	useEffect(() => {
		if (place) {
			const axiosGetOwner = async () => {
				const { data } = await axios.get(`users/minimal/${place.owner}`);
				setOwner(data);
			};
			axiosGetOwner();
		}
	}, [place]);

	return (
		<>
			{placeHolder ? (
				<div className="flex flex-col gap-2 max-w-[350px]">
					<Skeleton className="aspect-square w-full rounded-2xl" />
					<div className="space-y-2">
						<Skeleton className="h-7 w-3/4" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-5/6" />
					</div>
					<Skeleton className="h-5 w-32" />
				</div>
			) : (
				<Link
					ref={cardRef}
					to={`/places/${place._id}`}
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
					className={`${
						isHovered && "border-2 border-primary-200 "
					} flex bg-white shadow-md rounded-2xl  h-fit gap-4 flex-col w-full max-w-[350px] transition-all duration-300`}
				>
					{/* Carrossel de imagens */}
					<div className="relative">
						<Carousel
							opts={{
								loop: true,
							}}
							plugins={[...(isHovered ? [Autoplay({ delay: 3000 })] : [])]}
							className="w-full relative rounded-b-none"
							setApi={setApi}
						>
							<CarouselContent>
								{place.photos.map((photo, index) => (
									<CarouselItem
										className="relative overflow-hidden rounded-b-none"
										key={index}
									>
										<img
											src={photo}
											alt={`Imagem da acomodação ${index + 1}`}
											className="aspect-square w-full object-cover transition-transform rounded-t-2xl rounded-b-none"
										/>
									</CarouselItem>
								))}
							</CarouselContent>

							{/* Navegação do carrossel */}
							<div onClick={(e) => e.preventDefault()}>
								<CarouselPrevious className="absolute border-none left-2 text-white bg-white/30 hover:cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" />
							</div>
							<div onClick={(e) => e.preventDefault()}>
								<CarouselNext className="absolute right-2 border-none bg-white/30 text-white hover:cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity" />
							</div>

							{/* Rating badge */}
							<div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
								<Star size={14} fill="#FFC107" stroke="#FFC107" />
								<span className="text-sm font-semibold">4.98</span>
							</div>
						</Carousel>

						{/* Dot indicators */}
						<div
							className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10"
							onClick={(e) => e.preventDefault()}
						>
							{scrollSnaps.map((_, index) => (
								<DotButton
									key={index}
									selected={index === selectedIndex}
									onClick={() => onDotButtonClick(index)}
								/>
							))}
						</div>
					</div>

					{/* Card info - estado normal */}
					<div className="mt-2 px-4 flex flex-col gap-1">
						<div className="flex flex-col  flex-1">
							<span className="text-xs text-gray-500 flex items-center gap-1 ">
								De <div className="">R$ {Math.round(place.price * 1.2)}</div>
							</span>
							<div className="flex items-baseline gap-1">
								<span className="text-xl font-medium text-gray-900">
									Por R$ {place.price}
								</span>
							</div>
						</div>
						<div className=" leading-5">
							<p className="text-[1rem] font-light text-gray-900 line-clamp-2 overflow- max-w-[60%]">
								{place.title}
							</p>
						</div>
						<p className="flex items-center gap-4">
							<div className="flex py-2 items-center flex-1 gap-1 text-xs w-full text-gray-600">
								<MapPin size={14} />
								<span>{place.city}</span>
							</div>
							{!isHovered && <ChevronDown size={15} className="mr-2" />}
						</p>

						{/* Card info - estado hover (expanded) */}
						<div
							className={`flex flex-col pt-3 gap-3 flex-1 border-t-1 border-primary-100 px-0 transition-all duration-300 ${
								isHovered
									? "opacity-100 max-h-96 pt-4"
									: "opacity-0 max-h-0 overflow-hidden"
							}`}
						>
							{/* Amenities grid */}
							<div className="flex items-center justify-between gap-3 text-sm text-gray-700">
								<div className="flex items-center gap-1.5">
									<Users2 size={16} />
									<span>{place.guests}</span>
								</div>
								<div className="w-1 h-1 rounded-full bg-gray-400"></div>
								<div className="flex items-center gap-1.5">
									<Home size={16} />
									<span>{place.rooms}</span>
								</div>
								<div className="w-1 h-1 rounded-full bg-gray-400"></div>
								<div className="flex items-center gap-1.5">
									<Bed size={16} />
									<span>{place.beds}</span>
								</div>
								<div className="w-1 h-1 rounded-full bg-gray-400"></div>
								<div className="flex items-center gap-1.5">
									<Bath size={16} />
									<span>{place.bathrooms}</span>
								</div>
							</div>

							{/* Price and button */}
						</div>
					</div>
					<AnimatePresence>
						{isHovered ? (
							<motion.div
								className="flex items-center mx-2 mb-2 flex-1 gap-3"
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 10 }}
								transition={{ duration: 0.2 }}
							>
								<InteractiveHoverButton
									className="w-full rounded-xl text-center font-medium"
									onClick={(e) => {
										e.preventDefault();
										window.location.href = `/places/${place._id}`;
									}}
								>
									Reservar
								</InteractiveHoverButton>
							</motion.div>
						) : null}
					</AnimatePresence>
				</Link>
			)}
		</>
	);
};

export default Item;
