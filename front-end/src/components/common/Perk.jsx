import React from "react";
import { PERKS_CONFIG } from "@/components/common/perksConfig";

const Perk = ({ place = false, perk, minimal = null, width = 20 }) => {
	// Gera o objPerk dinamicamente a partir da configuração
	const objPerk = PERKS_CONFIG.reduce((acc, perkConfig) => {
		const Icon = perkConfig.icon;
		const Image = perkConfig.image;
		acc[perkConfig.id] = (
			<div
				className={`gap-2 flex justify-between flex-1  ${!place ? "flex-col" : "gap-4 items-center"}`}
			>
				{Icon && !Image ? (
					<Icon
						className={`${minimal && width == 20 ? "w-5 h-5" : "w-7 h-7"} ${place && "!w-5 !h-5"} `}
					/>
				) : (
					<img
						src={perkConfig.image}
						className={`${minimal && width == 20 ? "w-5 h-5" : "w-7 h-7"} ${place && "!w-5 !h-5"}`}
					/>
				)}
				{!minimal && (
					<span className={` max-w-40 ${place ? "text-nowrap" : "text-wrap"}`}>
						{perkConfig.label}
					</span>
				)}
			</div>
		);
		return acc;
	}, {});

	return objPerk[perk] || undefined;
};

export default Perk;
