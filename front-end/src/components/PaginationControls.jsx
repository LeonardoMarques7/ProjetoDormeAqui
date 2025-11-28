import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";

const PaginationControls = ({
	currentPage,
	totalPages,
	onPageChange,
	scrollToTop = true,
	className = "",
}) => {
	const handlePageChange = (pageNumber) => {
		onPageChange(pageNumber);
		if (scrollToTop) {
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	// Não renderiza se tiver apenas 1 página ou menos
	if (totalPages <= 1) return null;

	return (
		<Pagination className={className}>
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
	);
};

export default PaginationControls;
