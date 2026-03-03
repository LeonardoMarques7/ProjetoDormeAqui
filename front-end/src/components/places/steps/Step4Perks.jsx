import Perks from "@/components/common/Perks";
import { StepHeader } from "@/components/places/steps/Step1Space";

/**
 * Step 4 – Comodidades
 * Wrap do Perks existente. Perks são opcionais, mas bom ter.
 */
const Step4Perks = ({ data, dispatch }) => {
	const setPerks = (value) => {
		// Permite tanto callback de função quanto valor direto
		const resolved = typeof value === "function" ? value(data.perks) : value;
		dispatch({ type: "SET_FIELD", field: "perks", value: resolved });
	};

	return (
		<div className="space-y-6">
			<StepHeader
				title="Comodidades"
				description="Selecione o que está disponível. Quanto mais completo, melhor para o hóspede."
			/>

			{/* Contador de selecionados */}
			{data.perks?.length > 0 && (
				<div className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 bg-primary-50 border border-primary-200 px-4 py-2 rounded-full">
					<span className="w-5 h-5 rounded-full bg-primary-700 text-white text-xs flex items-center justify-center font-bold">
						{data.perks.length}
					</span>
					comodidade{data.perks.length !== 1 ? "s" : ""} selecionada
					{data.perks.length !== 1 ? "s" : ""}
				</div>
			)}

			<Perks perks={data.perks} setPerks={setPerks} />

			{/* Hint quando nenhum selecionado */}
			{data.perks?.length === 0 && (
				<p className="text-sm text-gray-400 text-center py-2">
					Nenhuma comodidade selecionada. Você pode pular esta etapa se
					preferir.
				</p>
			)}
		</div>
	);
};

export default Step4Perks;
