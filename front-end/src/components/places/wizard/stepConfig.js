import {
	Home,
	MapPinned,
	Camera,
	Sparkles,
	Tag,
	ClipboardCheck,
} from "lucide-react";

// ============================================
// CONFIGURAÇÃO DOS STEPS DO WIZARD
// Adicionar / remover / reordenar steps aqui
// ============================================

/**
 * Cada step define:
 * - id: identificador único
 * - title: título exibido no indicador
 * - description: subtítulo descritivo
 * - icon: ícone Lucide
 * - fields: campos obrigatórios deste step
 * - validate: função que retorna objeto de erros { campo: "mensagem" }
 */
export const STEPS_CONFIG = [
	{
		id: 1,
		title: "Informações básicas",
		description: "Tipo de acomodação, resumo do anúncio e capacidade.",
		icon: Home,
		fields: [
			"type",
			"title",
			"description",
			"rooms",
			"bathrooms",
			"beds",
			"guests",
		],
		validate: (data) => {
			const errors = {};
			if (!data.type) errors.type = "Selecione o tipo do espaço";
			if (!data.title?.trim()) errors.title = "Título é obrigatório";
			if (!data.description?.trim())
				errors.description = "Escreva uma descrição curta da acomodação";
			if (!data.rooms || Number(data.rooms) < 1)
				errors.rooms = "Informe o número de quartos";
			if (!data.bathrooms || Number(data.bathrooms) < 1)
				errors.bathrooms = "Informe o número de banheiros";
			if (!data.beds || Number(data.beds) < 1)
				errors.beds = "Informe o número de camas";
			if (!data.guests || Number(data.guests) < 1)
				errors.guests = "Informe a capacidade de hóspedes";
			return errors;
		},
	},
	{
		id: 2,
		title: "Localização",
		description: "Endereço completo, referência e coordenadas.",
		icon: MapPinned,
		fields: [
			"addressZipCode",
			"addressStreet",
			"addressNumber",
			"addressNeighborhood",
			"addressCity",
			"addressState",
			"addressCountry",
		],
		validate: (data) => {
			const errors = {};
			if (!data.addressZipCode?.trim()) errors.addressZipCode = "CEP é obrigatório";
			if (!data.addressStreet?.trim()) errors.addressStreet = "Rua é obrigatória";
			if (!data.addressNumber?.trim()) errors.addressNumber = "Número é obrigatório";
			if (!data.addressNeighborhood?.trim())
				errors.addressNeighborhood = "Bairro é obrigatório";
			if (!data.addressCity?.trim()) errors.addressCity = "Cidade é obrigatória";
			if (!data.addressState?.trim()) errors.addressState = "Estado é obrigatório";
			if (!data.addressCountry?.trim()) errors.addressCountry = "País é obrigatório";
			return errors;
		},
	},
	{
		id: 3,
		title: "Fotos",
		description: "Mostre seu espaço com boas fotos.",
		icon: Camera,
		fields: ["photos"],
		validate: (data) => {
			const errors = {};
			if (!data.photos || data.photos.length === 0)
				errors.photos = "Adicione pelo menos 1 foto para continuar";
			return errors;
		},
	},
	{
		id: 4,
		title: "Comodidades",
		description: "Selecione o que está disponível.",
		icon: Sparkles,
		fields: [],
		// Comodidades são opcionais
		validate: () => ({}),
	},
	{
		id: 5,
		title: "Preço e regras",
		description: "Defina diária, horários e orientações ao hóspede.",
		icon: Tag,
		fields: ["price", "checkin", "checkout"],
		validate: (data) => {
			const errors = {};
			if (!data.price || Number(data.price) <= 0)
				errors.price = "Defina o preço por noite";
			if (!data.checkin) errors.checkin = "Informe o horário de check-in";
			if (!data.checkout) errors.checkout = "Informe o horário de check-out";
			return errors;
		},
	},
	{
		id: 6,
		title: "Revisão",
		description: "Confira e publique sua acomodação.",
		icon: ClipboardCheck,
		fields: [],
		validate: () => ({}),
	},
];

export const TOTAL_STEPS = STEPS_CONFIG.length;

/**
 * Retorna os erros de validação de um step específico.
 * @returns {object} errors - objeto vazio se válido
 */
export function validateStep(stepId, data) {
	const step = STEPS_CONFIG.find((s) => s.id === stepId);
	if (!step) return {};
	return step.validate(data);
}

/**
 * Verifica se um step está completamente válido.
 */
export function isStepValid(stepId, data) {
	const errors = validateStep(stepId, data);
	return Object.keys(errors).length === 0;
}

/**
 * Retorna o progresso real (percentual de campos obrigatórios preenchidos).
 */
export function computeProgress(data) {
	const allRequired = [
		{ field: "type", check: (v) => !!v },
		{ field: "title", check: (v) => !!v?.trim() },
		{ field: "description", check: (v) => !!v?.trim() },
		{ field: "addressZipCode", check: (v) => !!v?.trim() },
		{ field: "addressStreet", check: (v) => !!v?.trim() },
		{ field: "addressNumber", check: (v) => !!v?.trim() },
		{ field: "addressNeighborhood", check: (v) => !!v?.trim() },
		{ field: "addressCity", check: (v) => !!v?.trim() },
		{ field: "addressState", check: (v) => !!v?.trim() },
		{ field: "addressCountry", check: (v) => !!v?.trim() },
		{ field: "rooms", check: (v) => Number(v) >= 1 },
		{ field: "bathrooms", check: (v) => Number(v) >= 1 },
		{ field: "beds", check: (v) => Number(v) >= 1 },
		{ field: "guests", check: (v) => Number(v) >= 1 },
		{ field: "photos", check: (v) => Array.isArray(v) && v.length > 0 },
		{ field: "price", check: (v) => Number(v) > 0 },
		{ field: "checkin", check: (v) => !!v },
		{ field: "checkout", check: (v) => !!v },
	];

	const filled = allRequired.filter(({ field, check }) => check(data[field])).length;
	return Math.round((filled / allRequired.length) * 100);
}
