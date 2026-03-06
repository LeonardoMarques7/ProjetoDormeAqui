import {
	MarkdownEditor,
	MarkdownEditor2,
} from "@/components/ui/MarkdownEditor";
import { StepHeader, FieldError } from "@/components/places/steps/Step1Space";

/**
 * Step 3 – Descrição
 * Editor markdown para descrição principal e informações extras (regras).
 */
const Step3Description = ({ data, dispatch, errors }) => {
	const set = (field, value) => dispatch({ type: "SET_FIELD", field, value });

	return (
		<div className="space-y-8">
			<StepHeader
				title="Descrição do espaço"
				description="Conte o que torna o seu espaço único. Seja honesto e detalhado."
			/>

			{/* Descrição principal */}
			<section className="space-y-3">
				<div className="flex items-center justify-between">
					<label className="block text-base font-semibold text-gray-700">
						Descrição
					</label>
					<span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
						Obrigatório
					</span>
				</div>
				<MarkdownEditor
					onChange={(text) => set("description", text)}
					initialValue={data.description}
				/>
				{errors?.description && <FieldError message={errors.description} />}
			</section>

			{/* Informações extras / regras */}
			<section className="space-y-3">
				<div className="flex items-center justify-between">
					<label className="block text-base font-semibold text-gray-700">
						Regras e informações extras
					</label>
					<span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
						Opcional
					</span>
				</div>
				<p className="text-sm text-gray-500">
					Horários permitidos, proibições, políticas de cancelamento, etc.
				</p>
				<MarkdownEditor2
					onChange={(text) => set("extras", text)}
					initialValue={data.extras}
				/>
			</section>
		</div>
	);
};

export default Step3Description;
