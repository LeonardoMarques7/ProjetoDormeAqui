import {
	BoomBox,
	CircleParking,
	Dog,
	ShieldCheck,
	TvMinimal,
	Wifi,
} from "lucide-react";
import React from "react";

const Perk = ({ perk, minimal }) => {
	const objPerk = {
		entrance: (
			<>
				<ShieldCheck className={`${minimal ? "w-5 h-5" : "w-4 h-4"}`} />
				{!minimal && <span>Entrada privada</span>}
			</>
		),
		pet: (
			<>
				<Dog className={`${minimal ? "w-5 h-5" : "w-4 h-4"}`} />
				{!minimal && <span>Pets</span>}
			</>
		),
		radio: (
			<>
				<BoomBox className={`${minimal ? "w-5 h-5" : "w-4 h-4"}`} />
				{!minimal && <span>Rádio</span>}
			</>
		),
		tv: (
			<>
				<TvMinimal className={`${minimal ? "w-5 h-5" : "w-4 h-4"}`} />
				{!minimal && <span>TV</span>}
			</>
		),
		parking: (
			<>
				<CircleParking className={`${minimal ? "w-5 h-5" : "w-4 h-4"}`} />
				{!minimal && <span>Estacionamento gratuito</span>}
			</>
		),
		Wifi: (
			<>
				<Wifi className={`${minimal ? "w-5 h-5" : "w-4 h-4"}`} />
				{!minimal && <span>Wi-fi</span>}
			</>
		),
	};
	return objPerk[perk];
};

export default Perk;
