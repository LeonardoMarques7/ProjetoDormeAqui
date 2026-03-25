import { ArrowRight, Edit, ExternalLink, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import ScrollReveal from "scrollreveal";
import PaginationControls from "@/components/ui/PaginationControls";

import { Link } from "react-router-dom";

import { useRef } from "react";

import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
	TooltipProvider,
} from "@/components/ui/tooltip";

import photoDefault from "@/assets/photoDefault.jpg";

// NOVO COMPONENTE: PlaceCard - cada card tem seus próprios estados
const PlaceCard = ({ place, index, onDelete }) => {
	const [api, setApi] = useState(null);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [imageErrors, setImageErrors] = useState({});
	const [scrollSnaps, setScrollSnaps] = useState([]);
	const cardRef = useRef(null);

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

	const handleImageError = (index) => {
		setImageErrors((prev) => ({ ...prev, [index]: true }));
	};

	const getImageSrc = (item, index) => {
		if (imageErrors[`${item._id}_${index}`]) {
			return photoDefault;
		}
		return item.photos?.[index];
	};

	const handleDeleteClick = (e) => {
		e.preventDefault();
		onDelete(place);
	};

	return (
		<div
			ref={cardRef}
			className="item__projeto relative flex gap-[10px] rounded-[25px] overflow-hidden bg-white shadow-lg max-sm:flex-col"
			key={place._id}
		>
			{/* Seção de Imagens */}
			<div className="relative h-[410px] w-[707px] max-sm:w-full max-sm:h-[300px] flex-shrink-0">
				{/* Imagem Principal Grande */}
				<div className="absolute left-0 top-0 h-full w-[497px] max-sm:w-[60%] rounded-[25px] overflow-hidden">
					<img
						src={getImageSrc(place, 0)}
						onError={() => handleImageError(`${place._id}_0`)}
						className="w-full h-full object-cover"
						alt={place.title}
					/>
				</div>

				{/* Badge de Avaliação */}
				<div className="absolute top-[16px] left-[16px] z-10 bg-yellow-400 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-md">
					<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
						<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
					</svg>
					<span className="font-medium text-sm">Avaliação</span>
				</div>

				{/* Imagens Menores Empilhadas à Direita */}
				<div className="absolute right-0 top-0 h-full flex flex-col gap-[10px] p-[10px] max-sm:hidden">
					<div className="relative w-[200px] h-[200px] rounded-[25px] overflow-hidden flex-shrink-0">
						<img
							src={getImageSrc(place, 1)}
							onError={() => handleImageError(`${place._id}_1`)}
							className="w-full h-full object-cover"
							alt={place.title}
						/>
					</div>
					<div className="relative w-[200px] h-[200px] rounded-[25px] overflow-hidden flex-shrink-0">
						<img
							src={getImageSrc(place, 2)}
							onError={() => handleImageError(`${place._id}_2`)}
							className="w-full h-full object-cover"
							alt={place.title}
						/>
					</div>
				</div>
			</div>

			{/* Seção de Informações */}
			<div className="relative flex flex-col justify-between p-6 flex-1 max-sm:p-4">
				{/* Título e Preço */}
				<div className="flex flex-col gap-3 mb-4">
					<p className="text-primary-700 uppercase text-xs font-semibold tracking-wide">
						{place.city}
					</p>
					<Link
						to={`/places/${place._id}`}
						className="cursor-pointer hover:underline font-bold text-3xl max-sm:text-2xl text-[#0F172B] break-words"
					>
						{place.title}
					</Link>
					<div className="flex items-baseline gap-2">
						<span className="font-bold text-2xl text-[#0F172B]">
							R$ {place.price}
						</span>
						<span className="text-sm font-normal text-gray-600">/noite</span>
					</div>
				</div>

				{/* Botões de Ação */}
				<div className="flex items-center gap-3 max-sm:flex-wrap">
					{/* Botão Ver */}
					<Tooltip>
						<TooltipTrigger asChild>
							<Link
								to={`/places/${place._id}`}
								className="group flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 hover:text-white text-gray-600 hover:bg-gray-700"
							>
								<ExternalLink
									size={18}
									className="transition-transform group-hover:-rotate-12"
								/>
								<span className="text-sm hidden group-hover:inline">Ver</span>
							</Link>
						</TooltipTrigger>
						<TooltipContent className="bg-gray-700">
							<p>Ver acomodação</p>
						</TooltipContent>
					</Tooltip>

					{/* Botão Editar */}
					<Tooltip>
						<TooltipTrigger asChild>
							<Link
								to={`/account/places/new/${place._id}`}
								className="group flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 hover:text-white text-blue-600 hover:bg-blue-600"
							>
								<Edit
									size={18}
									className="transition-transform group-hover:scale-110"
								/>
								<span className="text-sm hidden group-hover:inline">
									Editar
								</span>
							</Link>
						</TooltipTrigger>
						<TooltipContent className="bg-blue-600">
							<p>Editar acomodação</p>
						</TooltipContent>
					</Tooltip>

					{/* Botão Excluir */}
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								onClick={handleDeleteClick}
								className="group flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 hover:text-white text-red-600 hover:bg-red-600"
							>
								<Trash2
									size={18}
									className="transition-transform group-hover:scale-110"
								/>
								<span className="text-sm hidden group-hover:inline">
									Excluir
								</span>
							</button>
						</TooltipTrigger>
						<TooltipContent className="bg-red-600">
							<p>Excluir acomodação</p>
						</TooltipContent>
					</Tooltip>
				</div>
			</div>
		</div>
	);
};

const Places = ({ places, onDelete }) => {
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 4;

	// Calcular total de páginas
	const totalPages = Math.ceil(places.length / itemsPerPage);

	// Obter itens da página atual
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentPlaces = places.slice(indexOfFirstItem, indexOfLastItem);

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
				<PlaceCard
					key={place._id}
					index={index}
					place={place}
					onDelete={onDelete}
				/>
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
