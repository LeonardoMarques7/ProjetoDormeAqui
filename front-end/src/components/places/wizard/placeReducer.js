// ============================================
// ESTADO INICIAL
// Centraliza todos os campos do formulário
// ============================================
export const INITIAL_STATE = {
	type: "",
	title: "",
	city: "",
	rooms: "",
	bathrooms: "",
	beds: "",
	guests: "",
	photos: [],
	photolink: "",
	description: "",
	extras: "",
	perks: [],
	price: "",
	checkin: "",
	checkout: "",
};

// ============================================
// REDUCER
// ============================================
export function placeReducer(state, action) {
	switch (action.type) {
		case "SET_FIELD":
			return { ...state, [action.field]: action.value };

		case "SET_MULTIPLE":
			// action.payload = objeto com múltiplos campos
			return { ...state, ...action.payload };

		case "LOAD_DRAFT":
			return { ...INITIAL_STATE, ...action.payload };

		case "RESET":
			return INITIAL_STATE;

		default:
			return state;
	}
}
