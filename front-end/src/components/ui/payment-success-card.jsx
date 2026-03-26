import { cn } from "@/lib/utils";

export const Card = ({ className, ...props }) => (
	<div
		className={cn(
			"rounded-2xl border border-gray-200 bg-white shadow-sm",
			className,
		)}
		{...props}
	/>
);

export const CardContent = ({ className, ...props }) => (
	<div className={cn("p-6", className)} {...props} />
);
