import { Edit, Edit2, ExternalLink, MapPin, Star, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ScrollReveal from "scrollreveal";
import MarkdownIt from "markdown-it";
import PaginationControls from "./PaginationControls";

import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
	TooltipProvider,
} from "@/components/ui/tooltip";

import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { useRef } from "react";

const DotButton = ({ selected, onClick }) => (
	<button
		className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${
			selected ? "bg-white w-6" : "bg-white/50"
		}`}
		type="button"
		onClick={onClick}
	/>
);

// NOVO COMPONENTE: PlaceCard - cada card tem seus próprios estados
const PlaceCard = ({ place }) => {
	const [api, setApi] = useState(null);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [isHovered, setIsHovered] = useState(false);
	const [scrollSnaps, setScrollSnaps] = useState([]);
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

		const onSelect = () => {
			setSelectedIndex(api.selectedScrollSnap());
		};

		setScrollSnaps(api.scrollSnapList());
		setSelectedIndex(api.selectedScrollSnap());

		api.on("select", onSelect);

		return () => {
			api.off("select", onSelect);
		};
	}, [api]);

	return (
		<div
			ref={cardRef}
			className={`flex-col bg-white/80 max-w-[350px] h-fit relative flex-1 flex rounded-3xl border border-primary-200 gap-5`}
		>
			{/* Carrossel de imagens */}
			<div className="relative">
				<Carousel
					opts={{
						loop: true,
					}}
					className="w-full relative rounded-b-none"
					setApi={setApi}
				>
					<CarouselContent>
						{place.photos.map((photo, index) => (
							<CarouselItem
								className="relative overflow-hidden rounded-b-none rounded-t-2xl"
								key={index}
							>
								<img
									src={photo}
									alt={`Imagem da acomodação ${index + 1}`}
									className="aspect-square z-0 w-full *:rounded-2xl object-cover transition-transform rounded-t-2xl rounded-b-none"
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
							key={`${place._id}-dot-${index}`}
							selected={index === selectedIndex}
							onClick={() => onDotButtonClick(index)}
						/>
					))}
				</div>
			</div>
			<div className="px-4 mr-4 max-sm:py-0 flex flex-col justify-between w-full">
				<div className="flex flex-col gap-3">
					<div className="flex justify-between max-sm:mb-3 leading-5">
						<p className="text-[1.2rem] font-light text-gray-900">
							{place.title}
						</p>
					</div>
					<p className="flex items-center gap-4">
						<div className="flex items-center flex-1 gap-1 text-xs w-full text-gray-600">
							<MapPin size={14} />
							<span>{place.city}</span>
						</div>
					</p>
				</div>
				<div className="flex items-center mt-4 justify-between">
					<div className=" flex flex-col max-sm:items-start items-end py-4">
						<div className="flex items-center gap-2">
							<Tooltip>
								<TooltipTrigger asChild>
									<a
										href={`/places/${place._id}`}
										className="group cursor-pointer w-fit hover:bg-primary-600 hover:text-white px-3 justify-center flex items-center gap-0 hover:gap-3 ease-in-out duration-300 rounded-xl text-center py-2.5 overflow-hidden"
									>
										<ExternalLink
											size={18}
											className="transition-transform text-primary-500 group-hover:text-white duration-300 group-hover:scale-110"
										/>
									</a>
								</TooltipTrigger>
								<TooltipContent className="bg-primary-600">
									<p>Acessar acomodação</p>
								</TooltipContent>
							</Tooltip>
							<Tooltip>
								<TooltipTrigger asChild>
									<a
										href={`/account/places/new/${place._id}`}
										className="edit__btn group cursor-pointer flex items-center hover:text-white justify-center transition-all duration-300 ease-in-out px-3 hover:bg-blue-600 gap-0 hover:gap-3 text-blue-500 rounded-xl text-center py-2.5 overflow-hidden"
									>
										<Edit
											size={18}
											className="transition-transform group-hover:text-white duration-300 group-hover:scale-110"
										/>
									</a>
								</TooltipTrigger>
								<TooltipContent className="bg-blue-600">
									<p>Editar acomodação</p>
								</TooltipContent>
							</Tooltip>

							<Tooltip>
								<TooltipTrigger asChild>
									<a
										href={`/account/places/r/${place._id}`}
										className="edit__btn group cursor-pointer group-hover:text-white hover:text-white flex items-center justify-center transition-all duration-300 ease-in-out px-3 hover:bg-red-600 gap-0 hover:gap-3 text-red-500 rounded-xl text-center py-2.5 overflow-hidden"
									>
										<Trash2
											size={18}
											className="transition-transform duration-300 group-hover:scale-110"
										/>
									</a>
								</TooltipTrigger>
								<TooltipContent className="bg-red-600">
									<p>Excluir acomodação</p>
								</TooltipContent>
							</Tooltip>
						</div>
					</div>
					<p className="font-medium text-primary-600 rounded-xl p-2 absolute right-4">
						R$ {place.price}/noite
					</p>
				</div>
			</div>
		</div>
	);
};

const Places = ({ places }) => {
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 4;

	// Calcular total de páginas
	const totalPages = Math.ceil(places.length / itemsPerPage);

	// Obter itens da página atual
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentPlaces = places.slice(indexOfFirstItem, indexOfLastItem);

	const handleDelete = async () => {
		try {
			const { data } = await axios.delete(`/places/${place._id}`);
			console.log("Conta deletada!", data);
			setRedirect(true);
		} catch (error) {
			console.error("Erro ao deletar:", error);
		}
	};

	useEffect(() => {
		ScrollReveal().reveal(".headline", {
			duration: 1500,
			origin: "top",
			distance: "100px",
			easing: "ease-in-out",
			reset: false,
		});
	}, []);

	return (
		<>
			{currentPlaces.map((place) => (
				<PlaceCard key={place._id} place={place} />
			))}

			{/* Componente de paginação reutilizável */}
			<PaginationControls
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={setCurrentPage}
				scrollToTop={true}
			/>
		</>
	);
};

export default Places;
