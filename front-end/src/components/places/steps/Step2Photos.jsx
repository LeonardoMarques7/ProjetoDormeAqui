import { ImagePlus } from "lucide-react";
import PhotosUploader from "@/components/places/PhotosUploader";
import { StepHeader, FieldError } from "@/components/places/steps/Step1Space";

const MIN_PHOTOS_RECOMMENDED = 5;

/**
 * Step 2 – Fotos
 * Wrap do PhotosUploader existente com indicador de mínimo recomendado.
 */
const Step2Photos = ({ data, dispatch, errors, showMessage }) => {
	const photoCount = data.photos?.length || 0;
	const meetsMinimum = photoCount >= MIN_PHOTOS_RECOMMENDED;

	// PhotosUploader usa o padrão de callback do useState: setPhotos(prev => [...prev, item])
	// É necessário resolver o callback antes de despachar para não armazenar uma função no estado.
	const setPhotos = (value) => {
		const resolved = typeof value === "function" ? value(data.photos) : value;
		dispatch({ type: "SET_FIELD", field: "photos", value: resolved });
	};
	const setPhotoLink = (value) =>
		dispatch({ type: "SET_FIELD", field: "photolink", value });

	return (
		<div className="space-y-6">
			<StepHeader
				title="Fotos da acomodação"
				description="Boas fotos aumentam muito a chance de reservas. Recomendamos pelo menos 5."
			/>

			{/* Indicador de progresso de fotos */}
			<div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
				<div className="flex-1">
					<div className="flex justify-between text-xs text-gray-500 mb-1">
						<span>Fotos adicionadas</span>
						<span
							className={
								meetsMinimum
									? "text-green-600 font-semibold"
									: "text-amber-500 font-semibold"
							}
						>
							{photoCount} / {MIN_PHOTOS_RECOMMENDED} recomendadas
						</span>
					</div>
					<div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
						<div
							className={`h-full rounded-full transition-all duration-500 ${
								meetsMinimum ? "bg-green-500" : "bg-amber-400"
							}`}
							style={{
								width: `${Math.min(100, (photoCount / MIN_PHOTOS_RECOMMENDED) * 100)}%`,
							}}
						/>
					</div>
				</div>
				<div
					className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
						meetsMinimum
							? "bg-green-100 text-green-600"
							: "bg-amber-100 text-amber-500"
					}`}
				>
					{meetsMinimum ? "✓" : photoCount}
				</div>
			</div>

			{errors?.photos && <FieldError message={errors.photos} />}

			{/* Uploader existente */}
			<PhotosUploader
				photolink={data.photolink}
				setPhotoLink={setPhotoLink}
				photos={data.photos}
				setPhotos={setPhotos}
				showMessage={showMessage}
			/>

			{/* Dica quando sem fotos */}
			{photoCount === 0 && (
				<div className="flex flex-col items-center gap-2 py-6 text-gray-400">
					<ImagePlus size={36} className="opacity-40" />
					<p className="text-sm">Adicione pelo menos 1 foto para continuar</p>
				</div>
			)}
		</div>
	);
};

export default Step2Photos;
