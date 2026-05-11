import axios from "axios";
import { useEffect, useReducer, useState } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";

import { useUserContext } from "@/components/contexts/UserContext";
import { useMessage } from "@/components/contexts/MessageContext";
import {
	placeReducer,
	INITIAL_STATE,
} from "@/components/places/wizard/placeReducer";
import {
	TOTAL_STEPS,
	validateStep,
	isStepValid,
	STEPS_CONFIG,
} from "@/components/places/wizard/stepConfig";
import AccommodationWizardShell from "@/components/places/wizard/AccommodationWizardShell";
import StepNavigation from "@/components/places/wizard/StepNavigation";
import Step1Space from "@/components/places/steps/Step1Space";
import Step2Location from "@/components/places/steps/Step2Location";
import Step2Photos from "@/components/places/steps/Step2Photos";
import Step4Perks from "@/components/places/steps/Step4Perks";
import Step5Pricing from "@/components/places/steps/Step5Pricing";
import Step6Review from "@/components/places/steps/Step6Review";
import { normalizeAccommodationPayload } from "@/components/places/wizard/normalizeAccommodationPayload";
import { useDraftSave } from "@/hooks/useDraftSave";

import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import "lightgallery/css/lg-fullscreen.css";

const STEP_COMPONENTS = {
	1: Step1Space,
	2: Step2Location,
	3: Step2Photos,
	4: Step4Perks,
	5: Step5Pricing,
	6: Step6Review,
};

const getModeFromPathname = (pathname, id) => {
	if (pathname.includes("/edit/") || id) return "edit";
	return "create";
};

const mapPlaceToState = (data = {}) => ({
	type: data.type || "",
	title: data.title || "",
	city: data.city || data.addressCity || "",
	address: data.address || "",
	addressStreet: data.addressStreet || data.address_street || "",
	addressNumber: data.addressNumber || data.address_number || "",
	addressComplement: data.addressComplement || data.address_complement || "",
	addressNeighborhood:
		data.addressNeighborhood || data.address_neighborhood || "",
	addressCity: data.addressCity || data.address_city || data.city || "",
	addressState: data.addressState || data.address_state || "",
	addressZipCode: data.addressZipCode || data.address_zip_code || "",
	addressCountry:
		data.addressCountry || data.address_country || "Brasil",
	latitude: data.latitude ?? "",
	longitude: data.longitude ?? "",
	locationReference: data.locationReference || data.location_reference || "",
	locationDescription:
		data.locationDescription || data.location_description || "",
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
});

const NewPlace = () => {
	const { user, ready } = useUserContext();
	const { id } = useParams();
	const location = useLocation();
	const mode = getModeFromPathname(location.pathname, id);
	const isEditMode = mode === "edit";
	const { showMessage } = useMessage();
	const [state, dispatch] = useReducer(placeReducer, INITIAL_STATE);
	const [currentStep, setCurrentStep] = useState(1);
	const [redirect, setRedirect] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isLoadingPlace, setIsLoadingPlace] = useState(isEditMode);
	const [loadFailed, setLoadFailed] = useState(false);
	const { hasDraft, loadDraft, clearDraft } = useDraftSave(
		!isEditMode ? state : INITIAL_STATE,
	);

	useEffect(() => {
		if (!isEditMode || !id) {
			setIsLoadingPlace(false);
			return;
		}

		let isMounted = true;
		setIsLoadingPlace(true);
		setLoadFailed(false);

		const fetchPlace = async () => {
			try {
				const { data } = await axios.get(`/places/${id}`);
				if (!isMounted) return;
				dispatch({
					type: "SET_MULTIPLE",
					payload: mapPlaceToState(data),
				});
			} catch (error) {
				if (!isMounted) return;
				setLoadFailed(true);
				showMessage(
					error?.response?.status === 404
						? "Acomodação não encontrada."
						: "Erro ao carregar a acomodação.",
					"error",
				);
			} finally {
				if (isMounted) {
					setIsLoadingPlace(false);
				}
			}
		};

		fetchPlace();
		return () => {
			isMounted = false;
		};
	}, [id, isEditMode, showMessage]);

	useEffect(() => {
		if (isEditMode) return;
		if (!hasDraft()) return;

		const draft = loadDraft();
		const hasContent =
			draft?.title ||
			draft?.description ||
			draft?.addressStreet ||
			draft?.addressCity ||
			draft?.photos?.length > 0;

		if (!hasContent) return;

		dispatch({ type: "LOAD_DRAFT", payload: draft });
		showMessage("Rascunho anterior carregado automaticamente.", "info");
	}, [hasDraft, isEditMode, loadDraft, showMessage]);

	if (ready && !user) return <Navigate to="/" />;
	if (redirect) return <Navigate to="/account/places" />;

	const stepErrors = validateStep(currentStep, state);
	const currentStepValid = isStepValid(currentStep, state);

	const handleNext = () => {
		if (!currentStepValid) return;
		if (currentStep < TOTAL_STEPS) setCurrentStep((step) => step + 1);
	};

	const handleBack = () => {
		if (currentStep === 1) {
			setRedirect(true);
			return;
		}
		setCurrentStep((step) => step - 1);
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setIsSubmitting(true);

		const payload = normalizeAccommodationPayload(state);

		try {
			if (isEditMode && id) {
				await axios.put(`/places/${id}`, payload);
				showMessage("Alterações salvas com sucesso!", "success");
			} else {
				await axios.post("/places", { ...payload, owner: user._id });
				showMessage("Acomodação publicada com sucesso!", "success");
				clearDraft();
			}
			setRedirect(true);
		} catch (error) {
			console.error("Erro ao salvar place:", error);
			showMessage(
				isEditMode
					? "Erro ao atualizar acomodação."
					: "Erro ao publicar acomodação.",
				"error",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const StepComponent = STEP_COMPONENTS[currentStep];

	if (isLoadingPlace) {
		return (
			<div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<div className="grid gap-6 xl:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
					<div className="min-h-[640px] animate-pulse rounded-[28px] bg-[#f4efe7]" />
					<div className="min-h-[640px] animate-pulse rounded-[28px] bg-[#f7f3ed]" />
				</div>
			</div>
		);
	}

	if (loadFailed && isEditMode) {
		return (
			<div className="mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col items-center justify-center gap-4 px-4 text-center">
				<h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-900">
					Acomodação não encontrada
				</h1>
				<p className="max-w-lg text-sm leading-7 text-slate-500">
					Não foi possível carregar os dados desta acomodação. Verifique se ela
					ainda existe ou retorne para a lista de acomodações.
				</p>
				<button
					type="button"
					onClick={() => setRedirect(true)}
					className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
				>
					Voltar para acomodações
				</button>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<AccommodationWizardShell
					mode={mode}
					currentStep={currentStep}
					data={state}
					onStepClick={(stepId) => setCurrentStep(stepId)}
				>
					<StepComponent
						data={state}
						dispatch={dispatch}
						errors={stepErrors}
						showMessage={showMessage}
						onSubmit={handleSubmit}
						isSubmitting={isSubmitting}
						mode={mode}
					/>

					{currentStep < TOTAL_STEPS && (
						<StepNavigation
							currentStep={currentStep}
							isCurrentStepValid={currentStepValid}
							stepErrors={stepErrors}
							onNext={handleNext}
							onBack={handleBack}
						/>
					)}

					{currentStep === TOTAL_STEPS && (
						<div className="mt-4 border-t border-gray-100 pt-4">
							<button
								type="button"
								onClick={handleBack}
								className="flex items-center gap-2 rounded-full px-4 py-2 font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
							>
								← Voltar
							</button>
						</div>
					)}
				</AccommodationWizardShell>
			</div>
		</div>
	);
};

export default NewPlace;
