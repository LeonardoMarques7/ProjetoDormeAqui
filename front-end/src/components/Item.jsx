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
import { Bath, Bed, HomeIcon, MapPin, Users2 } from "lucide-react";

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
	const [shouldFlip, setShouldFlip] = useState(false);
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

	useEffect(() => {
		const checkPosition = () => {
			if (cardRef.current) {
				const rect = cardRef.current.getBoundingClientRect();
				const spaceOnRight = window.innerWidth - rect.right;
				setShouldFlip(spaceOnRight < 420);
			}
		};

		checkPosition();

		const handleMouseEnter = () => checkPosition();
		const card = cardRef.current;
		if (card) card.addEventListener("mouseenter", handleMouseEnter);

		window.addEventListener("resize", checkPosition);

		return () => {
			window.removeEventListener("resize", checkPosition);
			if (card) card.removeEventListener("mouseenter", handleMouseEnter);
		};
	}, []);

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
					className="group flex flex-col gap-2 rounded-2xl w-full transition-all duration-700 hover:row-span-1 hover:h-full hover:col-span-1 hover:scale-110 hover:z-50 relative"
				>
					<div
						className={`flex gap-4 h-full ${
							shouldFlip ? "flex-row-reverse" : ""
						}`}
					>
						{/* Seção do carrossel - mantém tamanho fixo */}
						<div className="w-fit flex-shrink-0">
							<div className="relative">
								<Carousel
									opts={{
										loop: true,
									}}
									plugins={[...(isHovered ? [Autoplay({ delay: 3000 })] : [])]}
									className="w-full relative h-full"
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
													className="aspect-square object-cover  transition-transform rounded-2xl"
												/>
											</CarouselItem>
										))}
									</CarouselContent>
									<div onClick={(e) => e.preventDefault()}>
										<CarouselPrevious className="absolute border-none left-2 text-white bg-white/30 hover:cursor-pointer" />
									</div>
									<div onClick={(e) => e.preventDefault()}>
										<CarouselNext className="absolute right-2 border-none bg-white/30 text-white hover:cursor-pointer" />
									</div>
								</Carousel>
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
							<div className="mt-2 group-hover:hidden transition-transform">
								<h3 className="text-xl font-semibold line-clamp-1">
									{place.city}
								</h3>
								<p
									className="line-clamp-2 text-gray-600"
									dangerouslySetInnerHTML={{
										__html: md.render(place.description),
									}}
								></p>
							</div>
						</div>

						<div
							className={`w-15 visible h-full flex items-center justify-center -ml-15`}
						>
							<div className=" w-15"></div>
						</div>

						{/* Conteúdo expandido */}
						<div className="hidden hover:visible bg-white shadow-2xl group-hover:flex w-full flex-1 h-fit my-auto -mx-5  rounded-2xl flex-col gap-2 p-4">
							<div className="flex flex-col gap-2">
								<h3 className="text-xl font-semibold line-clamp-3">
									{place.title}
								</h3>
								<div className="flex items-center text-sm text-gray-600 gap-2">
									<MapPin size={15} />
									<span>{place.city}</span>
								</div>
								<p
									className="line-clamp-4 text-gray-600"
									dangerouslySetInnerHTML={{
										__html: md.render(place.description),
									}}
								></p>
							</div>
							<div className="flex gap-4 items-center justify-start max-w-auto">
								<div className="flex gap-2 rounded-2xl items-center">
									<div className="flex items-center gap-2">
										<Users2 size={15} />
										<div className="text-sm">{place.guests}</div>
									</div>
								</div>
								<div className="w-1 rounded-full h-1 bg-gray-500"></div>
								<div className="flex gap-2 rounded-2xl items-center">
									<div className="flex items-center gap-2">
										<HomeIcon size={15} />
										<span>{place.rooms}</span>
									</div>
								</div>
								<div className="w-1 rounded-full h-1 bg-gray-500"></div>
								<div className="flex gap-2 rounded-2xl items-center">
									<div className="flex items-center gap-2">
										<Bed size={15} />
										<span>{place.beds}</span>
									</div>
								</div>
								<div className="w-1 rounded-full h-1 bg-gray-500"></div>
								<div className="flex gap-2 rounded-2xl items-center">
									<div className="flex items-center gap-2">
										<Bath size={15} />
										<span className="mr-2">{place.bathrooms}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Link>
			)}
		</>
	);
};

export default Item;
