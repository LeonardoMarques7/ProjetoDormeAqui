import {
	ArrowRight,
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

import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
	TooltipProvider,
} from "@/components/ui/tooltip";

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
const PlaceCard = ({ place, index }) => {
	const [api, setApi] = useState(null);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [isHovered, setIsHovered] = useState(false);
	const [imageErrors, setImageErrors] = useState({});
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

	const handleImageError = (index) => {
		setImageErrors((prev) => ({ ...prev, [index]: true }));
	};

	const getImageSrc = (item, index) => {
		if (imageErrors[`${item._id}_${index}`]) {
			return photoDefault;
		}
		return item.photos?.[index];
	};

	return (
		<div
			ref={cardRef}
			className={`item__projeto rounded-xl max-sm:flex-col relative flex gap-5 max-sm:gap-2 ${
				index % 2 === 0 ? "item__left " : "item__right"
			}`}
			key={place._id}
		>
			<div className="grid gap-2 max-sm:gap-x-2 grid-cols-8  grid-rows-3 h-50 max-sm:col-span-4 max-sm:row-span-2 ">
				<img
					src={getImageSrc(place, 0)}
					onError={() => handleImageError(`${place._id}_0`)}
					className="row-span-4 col-span-5 max-sm:col-span-5  h-full max-sm:w-full w-50 object-cover rounded-2xl"
					alt={place.title}
				/>
				<img
					src={getImageSrc(place, 1)}
					onError={() => handleImageError(`${place._id}_1`)}
					className="row-span-2 col-span-3  h-full w-40 object-cover rounded-2xl"
					alt={place.title}
				/>
				<img
					src={getImageSrc(place, 2)}
					onError={() => handleImageError(`${place._id}_2`)}
					className="row-span-2 col-span-3  h-full w-40 object-cover rounded-2xl"
					alt={place.title}
				/>
			</div>
			<div className="relative flex flex-col w-full justify-between gap-2">
				<div className="flex flex-col">
					<p className="absolute -top-6 max-sm:static text-primary-700 cursor-pointer uppercase font-light">
						{place.city}
					</p>
					<Link
						to={`/places/${place._id}`}
						className="cursor-pointer hover:underline font-bold text-3xl text-[#0F172B] text-wrap max-w-md overflow-hidden"
					>
						{place.title}
					</Link>
					<div className="relative font-medium text-2xl flex-1  text-[#0F172B]">
						R$ {place.price}
						<span className="absolute font-normal text-sm pl-1 top-2">
							/noite
						</span>
					</div>
				</div>
				<div className="flex items-end gap-10 w-full justify-between">
					<div className="flex items-center gap-2">
						<Tooltip>
							<TooltipTrigger asChild>
								<a
									href={`/places/${place._id}`}
									className="group cursor-pointer w-fit hover:bg-primary-600 hover:text-white px-3 justify-center flex items-center gap-0 hover:gap-3 ease-in-out duration-300 rounded-xl text-center py-2.5 overflow-hidden"
								>
									<ArrowRight size={18} className="group-hover:-rotate-12" />
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
			{currentPlaces.map((place, index) => (
				<PlaceCard key={place._id} index={index} place={place} />
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
