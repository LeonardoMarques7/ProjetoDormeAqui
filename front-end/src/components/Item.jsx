import { Link } from "react-router-dom";
import { Skeleton } from "@mantine/core";
import MarkdownIt from "markdown-it";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState, useRef } from "react";
import axios from "axios";

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
} from "lucide-react";

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
					className="group flex bg-white shadow-xl rounded-2xl p-4 flex-col gap-3 w-full max-w-[350px] transition-transform duration-300"
				>
					{/* Carrossel de imagens */}
					<div className="relative">
						<Carousel
							opts={{
								loop: true,
							}}
							plugins={[...(isHovered ? [Autoplay({ delay: 3000 })] : [])]}
							className="w-full relative"
							setApi={setApi}
						>
							<CarouselContent>
								{place.photos.map((photo, index) => (
									<CarouselItem
										className="relative overflow-hidden !rounded-2xl"
										key={index}
									>
										<img
											src={photo}
											alt={`Imagem da acomodação ${index + 1}`}
											className="aspect-square w-full object-cover transition-transform rounded-2xl"
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
					<div
						className={`flex flex-col gap-2 transition-opacity  duration-300 ${
							isHovered
								? "opacity-0 h-0 overflow-hidden"
								: "group-hover:opacity-100"
						}`}
					>
						<div>
							<h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
								{place.title}
							</h3>
							<div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
								<MapPin size={14} />
								<span>{place.city}</span>
							</div>
						</div>
						{/* Price */}
						<div className="flex py-2 items-baseline border-t-1 flex-col">
							<span className="text-sm text-gray-500 line-through">
								R$ {Math.round(place.price * 1.2)}
							</span>
							<span className="text-xl font-bold text-gray-900">
								R$ {place.price}
							</span>
						</div>
					</div>

					{/* Card info - estado hover (expanded) */}
					<div
						className={`flex flex-col gap-3 transition-opacity duration-300  ${
							isHovered
								? "group-hover:opacity-100 group-hover:max-h-96"
								: "opacity-0 max-h-0 overflow-hidden"
						} `}
					>
						<div>
							<h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
								{place.title}
							</h3>
							<div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
								<MapPin size={14} />
								<span>{place.city}</span>
							</div>
						</div>

						{/* Amenities grid */}
						<div className="flex items-center gap-3 text-sm text-gray-700">
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

						{/* Perks */}
						<div className="flex items-center gap-3">
							<div className="flex flex-nowrap gap-3 overflow-hidden">
								{place.perks.map(
									(perk, index) =>
										perk && (
											<div
												key={index}
												className="flex bg-primary-100 text-primary-400 p-1 rounded-md"
											>
												<Perk perk={perk} minimal={true} />
											</div>
										)
								)}
							</div>
						</div>
						{/* Price and button */}
						<div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-200">
							<div className="flex flex-col">
								<span className="text-xs text-gray-500 line-through">
									R$ {Math.round(place.price * 1.2)}
								</span>
								<div className="flex items-baseline gap-1">
									<span className="text-xl font-bold text-gray-900">
										R$ {place.price}
									</span>
								</div>
							</div>
							<Link
								to={`/places/${place._id}`}
								className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
							>
								Reservar
							</Link>
						</div>
					</div>
				</Link>
			)}
		</>
	);
};

export default Item;
