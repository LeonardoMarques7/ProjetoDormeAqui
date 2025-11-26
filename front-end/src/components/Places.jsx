import {
	BedDouble,
	CornerDownLeft,
	Edit2,
	ExternalLink,
	MapPin,
	Trash2,
	Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import ScrollReveal from "scrollreveal";
import { motion } from "framer-motion";
import MarkdownIt from "markdown-it";
import Perk from "./Perk";
import ScrollPlace from "./ScrollPlace";

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

	const handleDelete = async () => {
		try {
			const { data } = await axios.delete(`/places/${place._id}`);
			console.log("Conta deletada!", data);
			setRedirect(true); // redireciona após excluir
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

	const md = new MarkdownIt({
		html: false,
		breaks: true,
		linkify: true,
	});

	return (
		<div className="container__places mx-auto justify-center max-w-full max-h-full h-full overflow-x-clip mt-[5svh] flex flex-col gap-10 p-8 lg:max-w-7xl">
			{currentPlaces.map((place, id) => (
				<div
					key={id}
					className="headline relative item__place flex items-center gap-5 top-[5svh] w-full lg:max-w-7xl"
				>
					<div className=" w-full flex items-center relative justify-center">
						<ScrollPlace data={place.photos} />
					</div>
					<div className="flex w-fit h-90 flex-col relative items-start justify-center gap-4 py-5 bg-gray-50 p-5 backdrop-blur-sm shadow-2xl shadow-primary-200/50 rounded-2xl">
						<h2 className="text-4xl font-bold text-wrap max-w-[70%]">
							{place.title}
						</h2>
						<div className="flex gap-2 items-center">
							<MapPin size={18} /> {place.city}
						</div>
						<p
							dangerouslySetInnerHTML={{ __html: md.render(place.description) }}
							className="text-gray-500 text-start overflow-hidden line-clamp-4"
						></p>
						<div className="item__place__actions flex items-center gap-2 w-full">
							<p className="absolute top-0 shadow-2xl right-0 px-8 rounded-tr-full rounded-bl-full py-2 bg-primary-500 text-white ">
								<strong>R${place.price}</strong> por noite
							</p>
							<div className="flex items-center gap-4 text-gray-400 flex-1">
								{place.perks.map((perk, index) => (
									<div
										key={index}
										className=" hover:scale-110 ease-in-out duration-500 transition-all"
									>
										<Perk perk={perk} minimal={true} />
									</div>
								))}
							</div>
							<div className="flex items-center gap-2">
								<a
									href={`/places/${place._id}`}
									className="group cursor-pointer w-fit hover:bg-primary-600 hover:text-white px-5 hover:px-6 justify-center flex items-center gap-0 hover:gap-3 ease-in-out duration-300 rounded-2xl text-center py-2.5 overflow-hidden"
								>
									<ExternalLink
										size={18}
										className="transition-transform text-primary-500 group-hover:text-white duration-300 group-hover:scale-110"
									/>
									<span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden">
										Acessar acomodação
									</span>
								</a>
								<a
									href={`/account/places/new/${place._id}`}
									className="edit__btn group cursor-pointer flex items-center hover:text-white justify-center transition-all duration-300 ease-in-out px-5 hover:px-6 hover:bg-gray-600 gap-0 hover:gap-3 text-gray-500 rounded-2xl text-center py-2.5 overflow-hidden"
								>
									<Edit2
										size={18}
										className="transition-transform group-hover:text-white duration-300 group-hover:scale-110"
									/>
									<span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden">
										Editar
									</span>
								</a>
								<a
									href={`/account/places/r/${place._id}`}
									className="edit__btn group cursor-pointer group-hover:text-white hover:text-white flex items-center justify-center transition-all duration-300 ease-in-out px-5 hover:px-6 hover:bg-red-600 gap-0 hover:gap-3 text-red-500  rounded-2xl text-center py-2.5 overflow-hidden"
								>
									<Trash2
										size={18}
										className="transition-transform duration-300 group-hover:scale-110"
									/>
									<span className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden">
										Deletar
									</span>
								</a>
							</div>
						</div>
					</div>
				</div>
			))}

			{totalPages > 1 && (
				<Pagination className="">
					<PaginationContent className="mt-10 !list-none">
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
