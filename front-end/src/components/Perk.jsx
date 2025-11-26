import React from "react";
import { PERKS_CONFIG } from "./perksConfig";

const Perk = ({ perk, minimal }) => {
	// Gera o objPerk dinamicamente a partir da configuração
	const objPerk = PERKS_CONFIG.reduce((acc, perkConfig) => {
		const Icon = perkConfig.icon;
		const Image = perkConfig.image;

		acc[perkConfig.id] = (
			<>
				{Icon && !Image ? (
					<Icon className={`${minimal ? "w-5 h-5" : "w-4 h-4"}`} />
				) : (
					<img
						src={perkConfig.image}
						className={`${minimal ? "w-5 h-5" : "w-4 h-4"}`}
					/>
				)}

				{!minimal && <span>{perkConfig.label}</span>}
			</>
		);
		return acc;
	}, {});

	return objPerk[perk] || null;
};

export default Perk;
