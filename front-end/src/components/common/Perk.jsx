import React from "react";
import { PERKS_CONFIG } from "@/components/common/perksConfig";

const Perk = ({ perk, minimal = null, width = 20 }) => {
	// Gera o objPerk dinamicamente a partir da configuração
	const objPerk = PERKS_CONFIG.reduce((acc, perkConfig) => {
		const Icon = perkConfig.icon;
		const Image = perkConfig.image;
		acc[perkConfig.id] = (
			<>
				{Icon && !Image ? (
					<Icon
						className={`${minimal && width == 20 ? "w-5 h-5" : "w-4 h-4"} `}
					/>
				) : (
					<img
						src={perkConfig.image}
						className={`${minimal && width == 20 ? "w-5 h-5" : "w-4 h-4"}`}
					/>
				)}
				{!minimal && <span>{perkConfig.label}</span>}
			</>
		);
		return acc;
	}, {});

	return objPerk[perk] || undefined;
};

export default Perk;
