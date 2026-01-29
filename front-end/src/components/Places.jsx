import {
	ChevronRight,
	Edit,
	Edit2,
	Ellipsis,
	ExternalLink,
	HousePlus,
	Icon,
	MapPin,
	Star,
	Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ScrollReveal from "scrollreveal";
import MarkdownIt from "markdown-it";
import PaginationControls from "./PaginationControls";

import { Link } from "react-router-dom";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
		[api],
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

	const navItemsPlace = [
		{
			path: `/account/places/${place._id}`,
			label: "Acessar",
			icon: ExternalLink,
			class: "text-blue-500",
		},
		{
			path: `/account/places/new/${place._id}`,
			label: "Editar",
			icon: Edit,
		},
		{
			path: `/account/places/r/${place._id}`,
			label: "Deletar",
			icon: Trash2,
			class: "text-white",
			classBg: "bg-red-500 text-white",
		},
	];

	return (
		<div
			ref={cardRef}
			className={`flex-col bg-white/80 max-w-[325px] h-fit relative flex-1 flex rounded-3xl border border-primary-200 `}
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
						<span className="text-sm font-semibold">ID: {place._id}</span>
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
			<div className="px-4 py-5">
				<div className="flex flex-col gap-3">
					<div className="flex justify-between items-center max-sm:mb-3 leading-5">
						<p className="text-[1.2rem] font-light text-gray-900">
							{place.title}
						</p>
						<DropdownMenu modal={false}>
							<DropdownMenuTrigger
								className={`outline-none bg-primary-100/50 cursor-pointer hover:bg-primary-100 transition-all rounded-full`}
							>
								<Ellipsis size={20} />
							</DropdownMenuTrigger>

							<DropdownMenuContent
								align="end"
								className="p-2 bg-white rounded-xl shadow-xl flex flex-col gap-2"
							>
								{navItemsPlace.map((item) => {
									const Icon = item.icon;
									return (
										<Link
											key={item.path}
											to={item.path}
											className={`${item.classBg} flex group w-full justify-between hover:bg-gray-100 transition-colors items-center gap-2 px-4 py-2 rounded-xl`}
										>
											<Icon className={item.class} size={18} />
											{item.label}
										</Link>
									);
								})}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
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
