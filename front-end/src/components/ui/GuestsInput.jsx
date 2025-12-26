"use client";

import * as React from "react";
import { Users, Plus, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function GuestsInput({
	id = "guests-input",
	label = "Nº Hóspedes",
	placeholder = "4",
	min = 1,
	max = 50,
	value,
	onChange,
	className = "",
}) {
	const numericValue = parseInt(value) || 0;

	const handleIncrement = () => {
		if (numericValue < max) {
			handleChange(numericValue + 1);
		}
	};

	const handleDecrement = () => {
		if (numericValue > min) {
			handleChange(numericValue - 1);
		}
	};

	const handleChange = (newValue) => {
		if (onChange) {
			onChange({
				target: {
					value: newValue.toString(),
					name: id,
					id: id,
				},
			});
		}
	};

	const handleInputChange = (e) => {
		const inputValue = e.target.value;

		// Remove tudo que não é número
		const numbers = inputValue.replace(/\D/g, "");

		if (numbers === "") {
			handleChange(0);
			return;
		}

		let numValue = parseInt(numbers);

		// Aplica limites
		if (numValue > max) numValue = max;
		if (numValue < min) numValue = min;

		handleChange(numValue);
	};

	const handleFocus = (e) => {
		e.target.select();
	};

	const getGuestText = () => {
		if (numericValue === 0) return "";
		if (numericValue === 1) return "1 hóspede";
		return `${numericValue} hóspedes`;
	};

	return (
		<div className={`flex flex-col gap-2 ${className}`}>
			{label && (
				<Label
					htmlFor={id}
					className="text-[1rem] ml-2 font-medium text-gray-600"
				>
					{label}
				</Label>
			)}
			<div className="relative flex items-center">
				<Users className="absolute left-4 text-gray-400 size-5 pointer-events-none" />

				<Input
					id={id}
					type="text"
					inputMode="numeric"
					placeholder={placeholder}
					value={numericValue > 0 ? numericValue : ""}
					onChange={handleInputChange}
					onFocus={handleFocus}
					className="border flex-1 border-gray-300 pl-12 pr-24 py-3 rounded-2xl outline-primary-400 text-base font-medium hover:border-gray-400 focus:border-primary-400 transition-colors text-center"
				/>

				<div className="absolute right-2 flex items-center gap-1">
					<button
						type="button"
						onClick={handleDecrement}
						disabled={numericValue <= min}
						className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-all"
						aria-label="Diminuir número de hóspedes"
					>
						<Minus className="size-4 text-gray-600" />
					</button>

					<button
						type="button"
						onClick={handleIncrement}
						disabled={numericValue >= max}
						className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-all"
						aria-label="Aumentar número de hóspedes"
					>
						<Plus className="size-4 text-gray-600" />
					</button>
				</div>
			</div>

			{numericValue > 0 && (
				<p className="text-xs text-gray-500 ml-2">{getGuestText()}</p>
			)}
		</div>
	);
}
