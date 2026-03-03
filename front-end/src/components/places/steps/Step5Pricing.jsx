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
				title="Preço e disponibilidade"
				description="Defina o valor da diária e os horários de entrada e saída."
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
		</div>
	);
};

export default Step5Pricing;
