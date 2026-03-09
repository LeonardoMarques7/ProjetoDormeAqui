import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { TOTAL_STEPS } from "@/components/places/wizard/stepConfig";

/**
 * StepNavigation
 *
 * Barra de navegação inferior com botões Voltar / Próximo.
 * O botão Próximo é desabilitado se o step atual for inválido.
 *
 * @param {number}   currentStep       - step atual
 * @param {boolean}  isCurrentStepValid - se validação do step passou
 * @param {object}   stepErrors        - erros atuais { campo: "mensagem" }
 * @param {function} onNext            - avança step
 * @param {function} onBack            - volta step ou cancela
 */
const StepNavigation = ({
	currentStep,
	isCurrentStepValid,
	stepErrors,
	onNext,
	onBack,
}) => {
	const isLastStep = currentStep === TOTAL_STEPS;
	const isFirstStep = currentStep === 1;

	// Primeiro erro encontrado para exibir como hint
	const firstError = Object.values(stepErrors || {})[0];

	return (
		<div className="border-t border-gray-100 pt-4 mt-4">
			{/* Hint de validação */}
			<div className="h-5 mb-3 px-1">
				{!isCurrentStepValid && firstError && (
					<p className="text-sm text-amber-600 flex items-center gap-1 animate-fade-in">
						<span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
						{firstError}
					</p>
				)}
			</div>

			{/* Botões */}
			<div className="flex justify-between items-center">
				{/* Voltar / Cancelar */}
				<button
					type="button"
					onClick={onBack}
					className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium py-2 px-4 rounded-full hover:bg-gray-100"
				>
					<ArrowLeft size={16} />
					{isFirstStep ? "Cancelar" : "Voltar"}
				</button>

				{/* Próximo (escondido no último step, que tem botão Salvar próprio) */}
				{!isLastStep && (
					<button
						type="button"
						onClick={onNext}
						disabled={!isCurrentStepValid}
						title={
							!isCurrentStepValid
								? "Preencha os campos obrigatórios para continuar"
								: undefined
						}
						className={`
							flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition-all duration-200
							${
								isCurrentStepValid
									? "bg-primary-700 hover:bg-primary-900 text-white cursor-pointer shadow-sm hover:shadow"
									: "bg-gray-200 text-gray-400 cursor-not-allowed"
							}
						`}
					>
						Próximo
						<ArrowRight size={16} />
					</button>
				)}
			</div>
		</div>
	);
};

export default StepNavigation;
