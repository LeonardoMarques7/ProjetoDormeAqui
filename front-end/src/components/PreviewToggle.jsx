import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
	TooltipProvider,
} from "@/components/ui/tooltip";
import { ChevronRight, ChevronLeftIcon } from "lucide-react";
import { useState } from "react";
import Preview from "./Preview";

export function PreviewToggle({ formData }) {
	const [showPreview, setShowPreview] = useState(true);

	return (
		<>
			<TooltipProvider delayDuration={120}>
				<Tooltip className="relative">
					<TooltipTrigger asChild>
						<div className="flex flex-col justify-center items-center">
							<div
								onClick={() => setShowPreview(!showPreview)}
								className="edit__btn group cursor-pointer h-fit w-fit min-h-10 min-w-10 group-hover:text-white hover:text-white flex items-center justify-center transition-all duration-300 ease-in-out bg-primary-500 gap-0 hover:gap-3 text-white rounded-2xl text-center overflow-hidden"
							>
								{showPreview ? (
									<ChevronRight
										size={18}
										className="transition-transform duration-300 group-hover:scale-110"
									/>
								) : (
									<ChevronLeftIcon
										size={18}
										className="transition-transform duration-300 group-hover:scale-110"
									/>
								)}
							</div>

							<div className="w-0.5 h-full bg-gray-200"></div>
						</div>
					</TooltipTrigger>

					{/* Tooltip sem flechinha e com estilo moderno */}
					<TooltipContent
						side="top"
						className="rounded-md top-0 bg-black/80 backdrop-blur-md text-white px-3 py-1.5 text-sm animate-in fade-in zoom-in-95 border border-white/10 shadow-lg"
					>
						{showPreview ? "Fechar preview" : "Abrir preview"}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>

			{showPreview && (
				<div className="p-2 py-0 pb-4  flex-1 w-full  overflow-y-auto min-w-xl transition-transform duration-500 rounded-4xl h-fit bg-white">
					<Preview data={formData} />
				</div>
			)}
		</>
	);
}
