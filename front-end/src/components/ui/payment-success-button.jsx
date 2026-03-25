import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

const buttonVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				icon: "h-10 w-10 rounded-xl bg-gray-100 hover:bg-gray-200",
			},
			size: {
				icon: "h-10 w-10",
			},
		},
		defaultVariants: {
			variant: "icon",
			size: "icon",
		},
	},
);

export const Button = ({ className, variant, size, ...props }) => {
	return (
		<button
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
};
