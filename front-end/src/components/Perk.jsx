import {
	BoomBox,
	CircleParking,
	Dog,
	ShieldCheck,
	TvMinimal,
	Wifi,
} from "lucide-react";
import React from "react";

const Perk = ({ perk }) => {
	const objPerk = {
		entrance: (
			<>
				<ShieldCheck className="w-4 h-4" />
				<span>Entrada privada</span>
			</>
		),
		pet: (
			<>
				<Dog className="w-4 h-4" />
				<span>Pets</span>
			</>
		),
		radio: (
			<>
				<BoomBox className="w-4 h-4" />
				<span>Rádio</span>
			</>
		),
		tv: (
			<>
				<TvMinimal className="w-4 h-4" />
				<span>TV</span>
			</>
		),
		parking: (
			<>
				<CircleParking className="w-4 h-4" />
				<span>Estacionamento gratuito</span>
			</>
		),
		Wifi: (
			<>
				<Wifi className="w-4 h-4" />
				<span>Wi-fi</span>
			</>
		),
	};
	return objPerk[perk];
};

export default Perk;
