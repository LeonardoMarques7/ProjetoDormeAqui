import { BedDouble, CornerDownLeft, Edit2, MapPin, Users } from "lucide-react";
import { useState } from "react";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";

const Places = ({ places }) => {
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 4;

	// Calcular total de páginas
	const totalPages = Math.ceil(places.length / itemsPerPage);

	// Obter itens da página atual
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentPlaces = places.slice(indexOfFirstItem, indexOfLastItem);

	// Função para mudar de página
	const handlePageChange = (pageNumber) => {
		setCurrentPage(pageNumber);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<div className="container__places mx-auto max-w-full max-h-full h-full overflow-x-clip mt-[5svh] flex flex-col gap-50 p-8 lg:max-w-7xl">
			{currentPlaces.map((place) => (
				<div
					key={place._id}
					className="item__place flex items-center gap-5 top-[5svh] w-full lg:max-w-7xl"
				>
					<div className="relative w-full flex items-center justify-center">
						<img
							src={place.photos[0]}
							className="image__place h-100 aspect-video absolute left-0 top-0 object-cover rounded-2xl shadow-xl shadow-primary-200/80"
							alt="Foto da acomodação"
						/>
					</div>
					<CornerDownLeft size={50} className="relative top-10 icon__place" />
					<div className="flex w-fit flex-col items-start gap-4 bg-white/80 p-5 backdrop-blur-sm shadow-xl shadow-primary-200/50 rounded-2xl">
						<div className="flex gap-2 items-center text-gray-500">
							<MapPin size={18} /> {place.city}
						</div>
						<h2 className="text-4xl font-bold">{place.title}</h2>
						<p className="text-gray-500 text-start overflow-hidden line-clamp-4">
							{place.description}
						</p>
						<div className="flex items-center gap-4">
							<div className="flex gap-2 items-center text-gray-500">
								<Users size={18} /> {place.guests}
							</div>
							<div className="flex gap-2 items-center text-gray-500">
								<BedDouble size={18} /> 2
							</div>
						</div>
						<div className="item__place__actions flex items-center gap-2 w-full">
							<a
								href={`/places/${place._id}`}
								className="cursor-pointer hover:bg-primary-600 ease-in-out grow duration-500 w-full bg-primary-500 text-white rounded-2xl flex-1 text-center py-2.5"
							>
								Ver mais
							</a>
							<a
								href={`/account/places/new/${place._id}`}
								className="edit__btn cursor-pointer justify-center flex items-center grow-0 px-5 hover:bg-gray-600 ease-in-out duration-500 gap-4 bg-gray-500 text-white rounded-2xl text-center py-2.5"
							>
								<Edit2 size={18} />
								Editar
							</a>
						</div>
					</div>
				</div>
			))}

			{totalPages > 1 && (
				<Pagination className="mt-10">
					<PaginationContent className="mt-10">
						<PaginationItem>
							<PaginationPrevious
								onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
								className={
									currentPage === 1
										? "pointer-events-none opacity-50"
										: "cursor-pointer"
								}
							/>
						</PaginationItem>

						{[...Array(totalPages)].map((_, index) => {
							const pageNumber = index + 1;
							return (
								<PaginationItem key={pageNumber}>
									<PaginationLink
										onClick={() => handlePageChange(pageNumber)}
										isActive={currentPage === pageNumber}
										className="cursor-pointer"
									>
										{pageNumber}
									</PaginationLink>
								</PaginationItem>
							);
						})}

						<PaginationItem>
							<PaginationNext
								onClick={() =>
									handlePageChange(Math.min(totalPages, currentPage + 1))
								}
								className={
									currentPage === totalPages
										? "pointer-events-none opacity-50"
										: "cursor-pointer"
								}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			)}
		</div>
	);
};

export default Places;
