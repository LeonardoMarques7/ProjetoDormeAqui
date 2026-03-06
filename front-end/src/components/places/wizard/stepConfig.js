import { Home, Camera, FileText, Sparkles, Tag, ClipboardCheck } from "lucide-react";

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
		title: "Sobre o espaço",
		description: "Tipo de acomodação, localização e capacidade.",
		icon: Home,
		fields: ["type", "title", "city", "rooms", "bathrooms", "beds", "guests"],
		validate: (data) => {
			const errors = {};
			if (!data.type) errors.type = "Selecione o tipo do espaço";
			if (!data.title?.trim()) errors.title = "Título é obrigatório";
			if (!data.city?.trim()) errors.city = "Cidade é obrigatória";
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
		id: 3,
		title: "Descrição",
		description: "Conte o que torna o seu espaço especial.",
		icon: FileText,
		fields: ["description"],
		validate: (data) => {
			const errors = {};
			if (!data.description?.trim())
				errors.description = "Escreva uma descrição do espaço";
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
		title: "Preço",
		description: "Defina preço e disponibilidade.",
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
		{ field: "city", check: (v) => !!v?.trim() },
		{ field: "rooms", check: (v) => Number(v) >= 1 },
		{ field: "bathrooms", check: (v) => Number(v) >= 1 },
		{ field: "beds", check: (v) => Number(v) >= 1 },
		{ field: "guests", check: (v) => Number(v) >= 1 },
		{ field: "photos", check: (v) => Array.isArray(v) && v.length > 0 },
		{ field: "description", check: (v) => !!v?.trim() },
		{ field: "price", check: (v) => Number(v) > 0 },
		{ field: "checkin", check: (v) => !!v },
		{ field: "checkout", check: (v) => !!v },
	];

	const filled = allRequired.filter(({ field, check }) => check(data[field])).length;
	return Math.round((filled / allRequired.length) * 100);
}
