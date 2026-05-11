import { CalendarArrowDown, CalendarArrowUp } from "lucide-react";
import { PriceInput } from "@/components/ui/PriceInput";
import { TimePicker } from "@/components/ui/TimePicker";
import { StepHeader, FieldError } from "@/components/places/steps/Step1Space";

/**
 * Step 5 – Preço e disponibilidade
 * Preço por noite, horário de check-in e check-out.
 */
const Step5Pricing = ({ data, dispatch, errors }) => {
	const set = (field, value) => dispatch({ type: "SET_FIELD", field, value });

	return (
		<div className="space-y-8">
			<StepHeader
				title="Preço e regras"
				description="Defina a diária, os horários e inclua orientações importantes para o hóspede."
			/>

			{/* Preço */}
			<section className="space-y-2">
				<label className="block text-base font-semibold text-gray-700">
					Preço por noite
				</label>
				<PriceInput
					label=""
					placeholder="130,00"
					value={data.price}
					onChange={(e) => set("price", e.target.value)}
				/>
				{errors?.price && <FieldError message={errors.price} />}

				<p className="text-xs text-gray-400">
					O valor é em reais (R$). Você pode alterar a qualquer momento.
				</p>
			</section>

			{/* Horários */}
			<section className="space-y-3">
				<label className="block text-base font-semibold text-gray-700">
					Horários
				</label>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{/* Check-in */}
					<div className="space-y-1.5">
						<label className="flex items-center gap-2 text-sm text-gray-600 font-medium">
							<CalendarArrowUp size={15} className="text-primary-600" />
							Check-in (entrada)
						</label>
						<div className="relative">
							<TimePicker
								className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
								value={data.checkin}
								onChange={(e) => set("checkin", e.target.value)}
							/>
						</div>
						{errors?.checkin && <FieldError message={errors.checkin} />}
					</div>

					{/* Check-out */}
					<div className="space-y-1.5">
						<label className="flex items-center gap-2 text-sm text-gray-600 font-medium">
							<CalendarArrowDown size={15} className="text-primary-600" />
							Check-out (saída)
						</label>
						<div className="relative">
							<TimePicker
								className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
								value={data.checkout}
								onChange={(e) => set("checkout", e.target.value)}
							/>
						</div>
						{errors?.checkout && <FieldError message={errors.checkout} />}
					</div>
				</div>
			</section>

			<section className="space-y-3">
				<div className="flex items-center justify-between">
					<label className="block text-base font-semibold text-gray-700">
						Regras e informações extras
					</label>
					<span className="rounded-full bg-[#f4efe7] px-3 py-1 text-xs font-medium text-slate-600">
						Opcional
					</span>
				</div>
				<p className="text-sm text-gray-500">
					Horários especiais, políticas de cancelamento, instruções de acesso e
					outras observações úteis.
				</p>
				<textarea
					value={data.extras}
					onChange={(event) =>
						dispatch({
							type: "SET_FIELD",
							field: "extras",
							value: event.target.value,
						})
					}
					rows={5}
					placeholder="Ex: silêncio após 22h, check-in mediante confirmação, garagem sob consulta..."
					className="min-h-[150px] w-full resize-y rounded-2xl border border-[#ddd7cf] bg-white px-4 py-4 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
				/>
			</section>
		</div>
	);
};

export default Step5Pricing;
