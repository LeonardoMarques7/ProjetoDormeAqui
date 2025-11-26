import { Checkbox } from "@/components/ui/checkbox";
import Perk from "./Perk";
import { PERKS_CONFIG } from "./perksConfig";

const Perks = ({ perks, setPerks }) => {
	const handlePerkToggle = (perkId, checked) => {
		setPerks((prevValue) =>
			checked
				? [...prevValue, perkId]
				: prevValue.filter((perk) => perk !== perkId)
		);
	};

	return (
		<div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
			{PERKS_CONFIG.map((perkConfig) => {
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
	);
};

export default Perks;
