import { Checkbox } from "@/components/ui/checkbox";
import Perk from "./Perk";
import { PERKS_CONFIG } from "./perksConfig";
import PaginationControls from "./PaginationControls";
import { useState } from "react";

const Perks = ({ perks, setPerks }) => {
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10; // 8 perks por página

	// Calcular total de páginas baseado no PERKS_CONFIG
	const totalPages = Math.ceil(PERKS_CONFIG.length / itemsPerPage);

	// Obter itens da página atual do PERKS_CONFIG
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentPerks = PERKS_CONFIG.slice(indexOfFirstItem, indexOfLastItem);

	const handlePerkToggle = (perkId, checked) => {
		setPerks((prevValue) =>
			checked
				? [...prevValue, perkId]
				: prevValue.filter((perk) => perk !== perkId)
		);
	};

	return (
		<div className="flex flex-col gap-10">
			<div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
				{currentPerks.map((perkConfig) => {
					const isSelected = perks.includes(perkConfig.id);

					return (
						<label
							key={perkConfig.id}
							htmlFor={perkConfig.id}
							className={`flex items-center gap-2 cursor-pointer px-3 hover:bg-primary-300 hover:text-white py-2 rounded-xl border-1 border-gray-300 transition-colors ${
								isSelected
									? "bg-primary-500 text-white border-transparent"
									: "bg-white text-gray-800"
							}`}
						>
							<Checkbox
								id={perkConfig.id}
								name={perkConfig.id}
								value={perkConfig.id}
								checked={isSelected}
								onCheckedChange={(checked) =>
									handlePerkToggle(perkConfig.id, checked)
								}
							/>
							<Perk perk={perkConfig.id} />
						</label>
					);
				})}
			</div>

			{/* Paginação - só aparece se tiver mais de 8 perks */}
			<PaginationControls
				currentPage={currentPage}
				totalPages={totalPages}
				onPageChange={setCurrentPage}
				scrollToTop={false}
			/>
		</div>
	);
};

export default Perks;
