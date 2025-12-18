"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TimePicker({
	id = "time-picker",
	label = "Time",
	dateLabel = "",
	defaultValue = "10:30",
	value,
	onChange,
	className,
}) {
	return (
		<div className={`flex gap-4 ${className}`}>
			<div className="flex flex-col gap-3 flex-1">
				<Input
					type="time"
					id={id}
					defaultValue={defaultValue}
					value={value}
					onChange={onChange}
					className="bg-background outline-none border-none shadow-none focus:outline-none   active:outline-none appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
				/>
			</div>
		</div>
	);
}
