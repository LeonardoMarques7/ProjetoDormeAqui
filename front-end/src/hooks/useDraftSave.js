import { useEffect, useCallback } from "react";

const DRAFT_KEY = "dormeaqui_draft";
const SAVE_DELAY_MS = 1000; // debounce de 1s

/**
 * Hook de autosave no localStorage.
 *
 * Uso:
 *   const { hasDraft, loadDraft, clearDraft } = useDraftSave(state);
 *
 * @param {object} data - estado atual do formulário
 */
export function useDraftSave(data) {
	// Salva com debounce para não escrever a cada tecla
	useEffect(() => {
		const timer = setTimeout(() => {
			// Não salva rascunho vazio
			const hasContent =
				data.title || data.city || data.photos?.length > 0;
			if (hasContent) {
				localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
			}
		}, SAVE_DELAY_MS);

		return () => clearTimeout(timer);
	}, [data]);

	const hasDraft = useCallback(() => {
		return !!localStorage.getItem(DRAFT_KEY);
	}, []);

	const loadDraft = useCallback(() => {
		const raw = localStorage.getItem(DRAFT_KEY);
		if (!raw) return null;
		try {
			return JSON.parse(raw);
		} catch {
			return null;
		}
	}, []);

	const clearDraft = useCallback(() => {
		localStorage.removeItem(DRAFT_KEY);
	}, []);

	return { hasDraft, loadDraft, clearDraft };
}
