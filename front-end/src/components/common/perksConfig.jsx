import {
	Wifi,
	AirVent,
	Flame,
	Car,
	DoorOpen,
	Accessibility,
	Tv,
	Clapperboard,
	Radio,
	UtensilsCrossed,
	Refrigerator,
	Microwave,
	WashingMachine,
	AlarmSmoke,
	FireExtinguisher,
	BriefcaseMedical,
	Landmark,
	Trees,
	PawPrint,
	Laptop,
	BedDouble,
	Sparkles,
	Droplet,
	Ham,
} from "lucide-react";

import iron from "@/assets/icons/iron.png";

// ============================================
// CONFIGURAÇÃO CENTRALIZADA DOS PERKS
// Adicione novos perks aqui facilmente!
// ============================================
export const PERKS_CONFIG = [
	// Básico
	{
		id: "wifi",
		label: "Wi-Fi",
		icon: Wifi,
	},
	{
		id: "ar",
		label: "Ar-condicionado",
		icon: AirVent,
	},
	{
		id: "aquecimento",
		label: "Aquecimento",
		icon: Flame,
	},

	// Estacionamento e acesso
	{
		id: "estacionamento_gratuito",
		label: "Estacionamento gratuito",
		icon: Car,
	},

	{
		id: "acessibilidade",
		label: "Acessível para cadeirantes",
		icon: Accessibility,
	},

	// Entretenimento
	{
		id: "tv",
		label: "TV",
		icon: Tv,
	},
	{
		id: "streaming",
		label: "Serviços de streaming",
		icon: Clapperboard,
	},

	// Cozinha
	{
		id: "cozinha",
		label: "Cozinha",
		icon: UtensilsCrossed,
	},
	{
		id: "geladeira",
		label: "Geladeira",
		icon: Refrigerator,
	},

	// Lavanderia
	{
		id: "maquina_lavar",
		label: "Máquina de lavar",
		icon: WashingMachine,
	},
	{
		id: "ferro",
		label: "Ferro de passar",
		image: iron,
	},
	{
		id: "secadora",
		label: "Secadora",
		icon: WashingMachine,
	},

	// Segurança
	{
		id: "deteccao_fumaca",
		label: "Detector de fumaça",
		icon: AlarmSmoke,
	},
	{
		id: "extintor",
		label: "Extintor de incêndio",
		icon: FireExtinguisher,
	},
	{
		id: "kit_primeiros_socorros",
		label: "Kit de primeiros socorros",
		icon: BriefcaseMedical,
	},

	// Ao ar livre
	{
		id: "churrasqueira",
		label: "Churrasqueira",
		icon: Ham,
	},

	{
		id: "jardim",
		label: "Jardim",
		icon: Trees,
	},

	// Para pets

	// Trabalho
	{
		id: "workspace",
		label: "Espaço de trabalho dedicado",
		icon: Laptop,
	},
	{
		id: "agua_quente",
		label: "Água quente",
		icon: Droplet,
	},
];

// Cria um objeto para lookup rápido
export const PERKS_MAP = PERKS_CONFIG.reduce((acc, perk) => {
	acc[perk.id] = perk;
	return acc;
}, {});
