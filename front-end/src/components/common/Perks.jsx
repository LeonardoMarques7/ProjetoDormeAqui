import { Checkbox } from "@/components/ui/checkbox";
import Perk from "@/components/common/Perk";
import { PERKS_CONFIG } from "@/components/common/perksConfig";
import PaginationControls from "@/components/ui/PaginationControls";
import { useState } from "react";

const Perks = ({ perks, setPerks }) => {
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;

	const totalPages = Math.ceil(PERKS_CONFIG.length / itemsPerPage);

	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentPerks = PERKS_CONFIG.slice(indexOfFirstItem, indexOfLastItem);

	const handlePerkToggle = (perkId, checked) => {
		setPerks((prevValue) =>
			checked
				? [...prevValue, perkId]
				: prevValue.filter((perk) => perk !== perkId),
		);
	};

	return (
		<div className="flex flex-col gap-4 max-w-4xl w-full">
			<div className="grid gap-4 w-full grid-cols-3">
				{currentPerks.map((perkConfig) => {
					const isSelected = perks.includes(perkConfig.id);

					return (
						<label
							key={perkConfig.id}
							htmlFor={perkConfig.id}
							className={`relative flex flex-col items-start font-medium justify-start gap-3 cursor-pointer px-4 py-6 rounded-2xl border-2 transition-all ${
								isSelected
									? "border-primary-900 bg-primary-100/50"
									: "border-gray-200 bg-white hover:border-gray-300"
							}`}
						>
							<Perk perk={perkConfig.id} />

							<Checkbox
								id={perkConfig.id}
								name={perkConfig.id}
								value={perkConfig.id}
								checked={isSelected}
								onCheckedChange={(checked) =>
									handlePerkToggle(perkConfig.id, checked)
								}
								className="absolute top-3 right-3"
							/>
						</label>
					);
				})}
			</div>

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
