import { Check } from "lucide-react";
import { STEPS_CONFIG } from "@/components/places/wizard/stepConfig";

/**
 * StepIndicator
 *
 * Exibe a barra de progresso estilo onboarding com:
 * - Bolinha numerada por step (completo / ativo / futuro)
 * - Linha conectora entre steps
 * - Percentual de progresso real nos campos preenchidos
 *
 * @param {number} currentStep - step atual (1-based)
 * @param {object} data - estado do formulário (para calcular progresso real)
 * @param {number} progressPercent - percentual calculado externamente
 */
const StepIndicator = ({ currentStep, progressPercent }) => {
	return (
		<div className="w-full mb-6">
			{/* Barra de progresso linear */}
			<div className="w-full h-1 bg-gray-200 rounded-full mb-4 overflow-hidden">
				<div
					className="h-full bg-primary-600 rounded-full transition-all duration-500 ease-in-out"
					style={{ width: `${progressPercent}%` }}
				/>
			</div>

			{/* Steps */}
			<div className="flex items-center justify-between w-full max-w-xl mx-auto">
				{STEPS_CONFIG.map((step, index) => {
					const isCompleted = currentStep > step.id;
					const isActive = currentStep === step.id;
					const isFuture = currentStep < step.id;

					return (
						<div key={step.id} className="flex items-center flex-1">
							{/* Bolinha */}
							<div className="flex flex-col items-center gap-1">
								<div
									className={`
										flex items-center justify-center w-8 h-8 rounded-full 
										text-sm font-semibold border-2 transition-all duration-300
										${isCompleted ? "bg-primary-600 border-primary-600 text-white" : ""}
										${isActive ? "bg-white border-primary-600 text-primary-700 shadow-md scale-110" : ""}
										${isFuture ? "bg-white border-gray-300 text-gray-400" : ""}
									`}
								>
									{isCompleted ? <Check size={14} strokeWidth={3} /> : step.id}
								</div>
								{/* Label apenas no desktop */}
								<span
									className={`
										hidden sm:block text-[10px] font-medium text-center leading-tight max-w-[60px]
										${isActive ? "text-primary-700" : ""}
										${isCompleted ? "text-primary-600" : ""}
										${isFuture ? "text-gray-400" : ""}
									`}
								>
									{step.title}
								</span>
							</div>

							{/* Linha conectora (exceto no último) */}
							{index < STEPS_CONFIG.length - 1 && (
								<div className="flex-1 h-0.5 mx-1 mb-4 sm:mb-5 transition-all duration-500">
									<div
										className={`h-full rounded-full transition-all duration-500 ${
											isCompleted ? "bg-primary-600" : "bg-gray-200"
										}`}
									/>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default StepIndicator;
