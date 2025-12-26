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
			{showPreview && (
				<div className="relative max-sm:m-0 max-sm:static max-sm:p-0 shadow-xl left-10 p-3 pt-1 flex-1 w-full border overflow-y-auto max-sm:min-w-auto min-w-xl transition-transform duration-500 rounded-4xl h-fit bg-white max-sm:bg-transparent max-sm:shadow-none max-sm:border-none">
					<Preview data={formData} />
				</div>
			)}
		</>
	);
}
