import axios from "axios";
import { useReducer, useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

import { useUserContext } from "@/components/contexts/UserContext";
import { useMessage } from "@/components/contexts/MessageContext";

// Wizard
import {
	placeReducer,
	INITIAL_STATE,
} from "@/components/places/wizard/placeReducer";
import {
	TOTAL_STEPS,
	validateStep,
	isStepValid,
} from "@/components/places/wizard/stepConfig";
import StepSidebar from "@/components/places/wizard/StepSidebar";
import StepNavigation from "@/components/places/wizard/StepNavigation";
import { STEPS_CONFIG } from "@/components/places/wizard/stepConfig";

// Steps
import Step1Space from "@/components/places/steps/Step1Space";
import Step2Photos from "@/components/places/steps/Step2Photos";
import Step3Description from "@/components/places/steps/Step3Description";
import Step4Perks from "@/components/places/steps/Step4Perks";
import Step5Pricing from "@/components/places/steps/Step5Pricing";
import Step6Review from "@/components/places/steps/Step6Review";

// Hooks
import { useDraftSave } from "@/hooks/useDraftSave";

import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import "lightgallery/css/lg-fullscreen.css";

// ============================================
// MAP: número do step → componente
// ============================================
const STEP_COMPONENTS = {
	1: Step1Space,
	2: Step2Photos,
	3: Step3Description,
	4: Step4Perks,
	5: Step5Pricing,
	6: Step6Review,
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
const NewPlace = () => {
	const { user, ready } = useUserContext();
	const { id } = useParams();
	const { showMessage } = useMessage();

	// Estado único via reducer
	const [state, dispatch] = useReducer(placeReducer, INITIAL_STATE);

	// Controle de navegação
	const [currentStep, setCurrentStep] = useState(1);
	const [redirect, setRedirect] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Autosave (não salva ao editar um place existente para não sujar o rascunho)
	const { hasDraft, loadDraft, clearDraft } = useDraftSave(
		!id ? state : INITIAL_STATE,
	);

	// ─── Carrega place existente (edição) ───────────────────────────────────
	useEffect(() => {
		if (!id) return;

		const fetchPlace = async () => {
			try {
				const { data } = await axios.get(`/places/${id}`);
				dispatch({
					type: "SET_MULTIPLE",
					payload: {
						type: data.type || "",
						title: data.title || "",
						city: data.city || "",
						rooms: data.rooms || "",
						bathrooms: data.bathrooms || "",
						beds: data.beds || "",
						guests: data.guests || "",
						photos: data.photos || [],
						description: data.description || "",
						extras: data.extras || "",
						perks: data.perks || [],
						price: data.price || "",
						checkin: data.checkin || "",
						checkout: data.checkout || "",
					},
				});
			} catch (err) {
				showMessage("Erro ao carregar a acomodação.", "error");
			}
		};

		fetchPlace();
	}, [id]);

	// ─── Oferta de rascunho ao criar novo place ──────────────────────────────
	useEffect(() => {
		if (id) return; // não oferecer rascunho na edição
		if (!hasDraft()) return;

		const draft = loadDraft();
		const hasContent = draft?.title || draft?.city || draft?.photos?.length > 0;
		if (!hasContent) return;

		// Microfeedback discreto — carrega sem perguntar (pode-se trocar por modal)
		dispatch({ type: "LOAD_DRAFT", payload: draft });
		showMessage("Rascunho anterior carregado automaticamente.", "info");
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// ─── Redirect pós-autenticação ───────────────────────────────────────────
	if (ready && !user) return <Navigate to="/" />;
	if (redirect) return <Navigate to="/account/places" />;

	// ─── Navegação ───────────────────────────────────────────────────────────
	const stepErrors = validateStep(currentStep, state);
	const currentStepValid = isStepValid(currentStep, state);

	const handleNext = () => {
		if (!currentStepValid) return;
		if (currentStep < TOTAL_STEPS) setCurrentStep((s) => s + 1);
	};

	const handleBack = () => {
		if (currentStep === 1) {
			setRedirect(true);
		} else {
			setCurrentStep((s) => s - 1);
		}
	};

	// ─── Submit ──────────────────────────────────────────────────────────────
	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);

		const payload = {
			type: state.type,
			title: state.title,
			city: state.city,
			rooms: Number(state.rooms),
			bathrooms: Number(state.bathrooms),
			beds: Number(state.beds),
			guests: Number(state.guests),
			photos: state.photos,
			description: state.description,
			extras: state.extras,
			perks: state.perks,
			price: Number(state.price),
			checkin: state.checkin,
			checkout: state.checkout,
		};

		try {
			if (id) {
				await axios.put(`/places/${id}`, payload);
				showMessage("Acomodação atualizada com sucesso!", "success");
			} else {
				await axios.post("/places", { ...payload, owner: user._id });
				showMessage("Acomodação publicada com sucesso!", "success");
				clearDraft();
			}
			setRedirect(true);
		} catch (error) {
			console.error("Erro ao salvar place:", error);
			showMessage(
				id ? "Erro ao atualizar acomodação." : "Erro ao publicar acomodação.",
				"error",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	// ─── Render step atual ───────────────────────────────────────────────────
	const StepComponent = STEP_COMPONENTS[currentStep];
	const activeStepConfig = STEPS_CONFIG[currentStep - 1];

	return (
		<div className=" min-h-screen ">
			{/* ── Layout principal ─────────────────────────────────────── */}
			<div className="flex max-w-6xl mx-auto px-4  max-sm:w-full   max-sm:p-0 sm:px-6 lg:px-8 py-8 gap-8">
				{/* ── SIDEBAR VERTICAL (desktop only) ─────────────────── */}
				<StepSidebar
					currentStep={currentStep}
					data={state}
					onStepClick={(stepId) => setCurrentStep(stepId)}
				/>

				{/* ── COLUNA DE CONTEÚDO ──────────────────────────────── */}
				<div className="flex-1 min-w-0 flex flex-col ">
					{/* Header mobile: "Etapa X de Y" */}
					<div className="lg:hidden mb-5">
						<div className="flex items-center justify-between mb-3">
							<span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
								Etapa {currentStep} de {TOTAL_STEPS}
							</span>
							<span className="text-xs text-primary-600 font-semibold">
								{Math.round(((currentStep - 1) / TOTAL_STEPS) * 100)}% concluído
							</span>
						</div>
						{/* Barra de progresso mobile */}
						<div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
							<div
								className="h-full bg-primary-600 rounded-full transition-all duration-500"
								style={{
									width: `${Math.round(((currentStep - 1) / TOTAL_STEPS) * 100)}%`,
								}}
							/>
						</div>
						{/* Nome do step atual (mobile) */}
						<div className="flex items-center gap-2 mt-3">
							{activeStepConfig?.icon && (
								<span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary-100 text-primary-700">
									<activeStepConfig.icon size={14} />
								</span>
							)}
							<span className="text-base font-semibold text-gray-800">
								{activeStepConfig?.title}
							</span>
						</div>
					</div>

					{/* Separador desktop */}
					<div className="hidden lg:block h-px bg-gray-100 mb-6" />

					{/* Conteúdo do step atual */}
					<div className="flex-1">
						<StepComponent
							data={state}
							dispatch={dispatch}
							errors={stepErrors}
							showMessage={showMessage}
							onSubmit={handleSubmit}
							isSubmitting={isSubmitting}
						/>
					</div>

					{/* Navegação (Voltar / Próximo) — oculta no último step */}
					{currentStep < TOTAL_STEPS && (
						<StepNavigation
							currentStep={currentStep}
							isCurrentStepValid={currentStepValid}
							stepErrors={stepErrors}
							onNext={handleNext}
							onBack={handleBack}
						/>
					)}

					{/* Apenas botão Voltar no último step */}
					{currentStep === TOTAL_STEPS && (
						<div className="border-t border-gray-100 pt-4 mt-4">
							<button
								type="button"
								onClick={handleBack}
								className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium py-2 px-4 rounded-full hover:bg-gray-100"
							>
								← Voltar
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default NewPlace;
