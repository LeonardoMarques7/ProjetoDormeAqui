import React from "react";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";

const Teste = () => {
	return (
		<>
			<div className="bg-primary-500 relative flex flex-col justify-center items-center h-[50svh] ">
				<h2 className="title__booking font-bold pt-10 text-4xl text-white text-center">
					Mingas Reservas
				</h2>
			</div>
			<Pagination>
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious href="#" />
					</PaginationItem>
					<PaginationItem>
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam eum
						assumenda itaque consequatur ex vel? Nam deserunt maxime adipisci
						asperiores.
						<PaginationLink href="#">1</PaginationLink>
					</PaginationItem>
					<PaginationItem>
						<PaginationEllipsis />
					</PaginationItem>
					<PaginationItem>
						<PaginationNext href="#" />
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</>
	);
};

export default Teste;
