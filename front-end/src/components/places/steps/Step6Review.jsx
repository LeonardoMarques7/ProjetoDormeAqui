import { Check, X, SaveAll, AlertTriangle } from "lucide-react";
import Preview from "@/components/places/Preview";
import { StepHeader } from "@/components/places/steps/Step1Space";

// ============================================
// CHECKLIST DE REVISÃO
// Define o que precisa estar preenchido
// ============================================
const CHECKLIST = [
	{
		label: "Tipo de espaço",
		check: (d) => !!d.type,
		value: (d) => d.type,
	},
	{
		label: "Título",
		check: (d) => !!d.title?.trim(),
		value: (d) => d.title,
	},
	{
		label: "Cidade",
		check: (d) => !!d.city?.trim(),
		value: (d) => d.city,
	},
	{
		label: "Quartos / Camas / Banheiros",
		check: (d) =>
			Number(d.rooms) >= 1 && Number(d.beds) >= 1 && Number(d.bathrooms) >= 1,
		value: (d) =>
			`${d.rooms || 0} quartos · ${d.beds || 0} camas · ${d.bathrooms || 0} banheiros`,
	},
	{
		label: "Hóspedes",
		check: (d) => Number(d.guests) >= 1,
		value: (d) => `${d.guests} pessoa${Number(d.guests) !== 1 ? "s" : ""}`,
	},
	{
		label: "Fotos",
		check: (d) => d.photos?.length > 0,
		value: (d) =>
			`${d.photos?.length || 0} foto${d.photos?.length !== 1 ? "s" : ""}`,
		recommended: (d) => d.photos?.length < 5,
		recommendedMsg: "Recomendamos pelo menos 5 fotos",
	},
	{
		label: "Descrição",
		check: (d) => !!d.description?.trim(),
		value: (d) =>
			d.description?.length > 40
				? d.description.substring(0, 40) + "…"
				: d.description,
	},
	{
		label: "Comodidades",
		check: () => true, // sempre ok (opcional)
		value: (d) =>
			d.perks?.length > 0
				? `${d.perks.length} selecionada${d.perks.length !== 1 ? "s" : ""}`
				: "Nenhuma selecionada",
		optional: true,
	},
	{
		label: "Preço por noite",
		check: (d) => Number(d.price) > 0,
		value: (d) =>
			d.price
				? `R$ ${Number(d.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
				: "",
	},
	{
		label: "Check-in / Check-out",
		check: (d) => !!d.checkin && !!d.checkout,
		value: (d) =>
			d.checkin && d.checkout ? `${d.checkin} → ${d.checkout}` : "",
	},
];

/**
 * Step 6 – Revisão final
 * Preview completo + checklist automático + botão salvar.
 */
const Step6Review = ({ data, onSubmit, isSubmitting }) => {
	const allCriticalOk = CHECKLIST.filter((item) => !item.optional).every(
		(item) => item.check(data),
	);

	const missingCount = CHECKLIST.filter(
		(item) => !item.optional && !item.check(data),
	).length;

	return (
		<div className="space-y-8">
			<StepHeader
				title="Revisão final"
				description="Confira tudo antes de publicar. Você poderá editar depois."
			/>

			{/* Preview */}
			<div className="border border-gray-200 rounded-2xl overflow-hidden">
				<Preview data={data} />
			</div>

			{/* Checklist */}
			<section className="space-y-3">
				<h2 className="text-base font-semibold text-gray-700">
					Checklist de publicação
				</h2>

				<div className="space-y-2">
					{CHECKLIST.map((item) => {
						const ok = item.check(data);
						const showWarning = ok && item.recommended?.(data);

						return (
							<div
								key={item.label}
								className={`
									flex items-center justify-between px-4 py-3 rounded-xl text-sm border
									${!ok && !item.optional ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-100"}
									${showWarning ? "bg-amber-50 border-amber-200" : ""}
								`}
							>
								<div className="flex items-center gap-2">
									{/* Ícone de status */}
									{ok ? (
										showWarning ? (
											<AlertTriangle
												size={14}
												className="text-amber-500 shrink-0"
											/>
										) : (
											<Check size={14} className="text-green-600 shrink-0" />
										)
									) : (
										<X
											size={14}
											className={`${item.optional ? "text-gray-400" : "text-red-500"} shrink-0`}
										/>
									)}
									<span
										className={`font-medium ${
											!ok && !item.optional ? "text-red-700" : "text-gray-700"
										}`}
									>
										{item.label}
									</span>
									{item.optional && (
										<span className="text-[10px] text-gray-400 bg-gray-200 px-1.5 rounded">
											opcional
										</span>
									)}
								</div>

								{/* Valor ou alerta */}
								<div className="text-right">
									{ok ? (
										<span
											className={`text-xs ${showWarning ? "text-amber-600" : "text-gray-500"}`}
										>
											{showWarning ? item.recommendedMsg : item.value(data)}
										</span>
									) : (
										<span
											className={`text-xs ${item.optional ? "text-gray-400" : "text-red-500"}`}
										>
											{item.optional ? "—" : "Pendente"}
										</span>
									)}
								</div>
							</div>
						);
					})}
				</div>

				{!allCriticalOk && (
					<div className="flex items-center gap-2 mt-2 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
						<AlertTriangle size={16} />
						<span>
							{missingCount} item
							{missingCount !== 1 ? "s" : ""} obrigatório
							{missingCount !== 1 ? "s" : ""} pendente
							{missingCount !== 1 ? "s" : ""}. Volte e complete antes de
							publicar.
						</span>
					</div>
				)}
			</section>

			{/* Botão Salvar */}
			<form onSubmit={onSubmit} className="flex justify-center pb-4">
				<button
					type="submit"
					disabled={!allCriticalOk || isSubmitting}
					className={`
						flex items-center gap-2 px-10 py-3 rounded-full font-semibold
						transition-all duration-200 text-base shadow-md
						${
							allCriticalOk && !isSubmitting
								? "bg-primary-600 hover:bg-primary-700 text-white cursor-pointer hover:shadow-lg"
								: "bg-gray-200 text-gray-400 cursor-not-allowed"
						}
					`}
				>
					<SaveAll size={18} />
					{isSubmitting ? "Salvando…" : "Publicar acomodação"}
				</button>
			</form>
		</div>
	);
};

export default Step6Review;
