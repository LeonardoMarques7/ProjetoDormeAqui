import { Check } from "lucide-react";
import { STEPS_CONFIG } from "@/components/places/wizard/stepConfig";
import { isStepValid } from "@/components/places/wizard/stepConfig";

/**
 * StepSidebar — stepper vertical estilo SaaS/Airbnb dashboard
 *
 * Desktop: sidebar fixa à esquerda com todos os steps listados verticalmente.
 * Mobile: oculto (o NewPlace exibe um header compacto "Etapa X de Y").
 *
 * @param {number}   currentStep   - step ativo (1-based)
 * @param {object}   data          - estado do formulário (para calcular quais steps estão válidos)
 * @param {function} onStepClick   - callback ao clicar num step concluído
 */
const StepSidebar = ({ currentStep, data, onStepClick }) => {
	return (
		<aside className="hidden lg:flex flex-col w-64 shrink-0 pr-8 pt-2">
			{/* Logo / título da seção */}
			<div className="mb-8">
				<p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
					Nova acomodação
				</p>
				<h2 className="text-lg font-bold text-gray-800 leading-tight">
					Complete todas as etapas
				</h2>
			</div>

			{/* Lista de steps */}
			<nav className="flex flex-col gap-1">
				{STEPS_CONFIG.map((step) => {
					const isCompleted =
						isStepValid(step.id, data) && currentStep > step.id;
					const isActive = currentStep === step.id;
					const isFuture = currentStep < step.id;
					const Icon = step.icon;

					const isClickable = isCompleted; // só pode clicar em steps já concluídos

					return (
						<button
							key={step.id}
							type="button"
							disabled={!isClickable}
							onClick={() => isClickable && onStepClick(step.id)}
							className={`
								group flex items-start gap-3 px-3 py-3 rounded-xl text-left
								transition-all duration-200 w-full
								${isActive ? "bg-primary-50 border border-primary-200 shadow-sm" : ""}
								${isCompleted ? "hover:bg-gray-100 cursor-pointer" : ""}
								${isFuture ? "opacity-50 cursor-default" : ""}
							`}
						>
							{/* Círculo indicador */}
							<div className="relative flex flex-col items-center shrink-0 mt-0.5">
								{/* Linha conectora superior (exceto no primeiro) */}
								{step.id > 1 && (
									<span
										className={`
											absolute -top-[calc(0.75rem+4px)] left-1/2 -translate-x-1/2
											w-0.5 h-3 rounded-full
											${isCompleted || isActive ? "bg-primary-300" : "bg-gray-200"}
										`}
									/>
								)}

								{/* Bolinha */}
								<div
									className={`
										flex items-center justify-center w-8 h-8 rounded-full
										border-2 transition-all duration-300 shrink-0
										${isCompleted ? "bg-primary-600 border-primary-600 text-white" : ""}
										${isActive ? "bg-white border-primary-600 text-primary-700 shadow-md scale-105" : ""}
										${isFuture ? "bg-white border-gray-300 text-gray-400" : ""}
									`}
								>
									{isCompleted ? (
										<Check size={14} strokeWidth={3} />
									) : (
										<Icon size={14} />
									)}
								</div>

								{/* Linha conectora inferior (exceto no último) */}
								{step.id < STEPS_CONFIG.length && (
									<span
										className={`
											absolute top-[calc(2rem+4px)] left-1/2 -translate-x-1/2
											w-0.5 h-3 rounded-full
											${isCompleted ? "bg-primary-300" : "bg-gray-200"}
										`}
									/>
								)}
							</div>

							{/* Texto */}
							<div className="flex flex-col min-w-0 pt-0.5">
								<span
									className={`
										text-sm font-semibold leading-tight transition-colors
										${isActive ? "text-primary-800" : ""}
										${isCompleted ? "text-gray-700 group-hover:text-primary-700" : ""}
										${isFuture ? "text-gray-400" : ""}
									`}
								>
									{step.title}
								</span>
								<span
									className={`
										text-xs leading-snug mt-0.5 line-clamp-2 transition-colors
										${isActive ? "text-primary-600" : "text-gray-400"}
									`}
								>
									{step.description}
								</span>

								{/* Badge "concluído" */}
								{isCompleted && (
									<span className="mt-1 text-[10px] font-semibold text-green-600 uppercase tracking-wide">
										Concluído
									</span>
								)}
							</div>
						</button>
					);
				})}
			</nav>
		</aside>
	);
};

export default StepSidebar;
