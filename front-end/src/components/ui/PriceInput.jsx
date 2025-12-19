"use client";

import * as React from "react";
import { DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PriceInput({
	id = "price-input",
	label = "Preço por noite",
	placeholder = "130,00",
	value,
	onChange,
	className = "",
}) {
	const [displayValue, setDisplayValue] = React.useState("");

	// Formata o valor para BRL
	const formatCurrency = (value) => {
		if (!value) return "";

		// Remove tudo que não é número
		const numbers = value.replace(/\D/g, "");

		// Converte para número e divide por 100 para ter os centavos
		const amount = parseFloat(numbers) / 100;

		// Formata para BRL
		return amount.toLocaleString("pt-BR", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
	};

	// Atualiza o display quando o valor externo muda
	React.useEffect(() => {
		if (value) {
			// Se o valor vem como número, formata
			const numericValue =
				typeof value === "string" ? value.replace(/\D/g, "") : value.toString();
			setDisplayValue(formatCurrency(numericValue));
		}
	}, [value]);

	const handleChange = (e) => {
		const inputValue = e.target.value;

		// Remove tudo que não é número
		const numbers = inputValue.replace(/\D/g, "");

		// Limita a 10 dígitos (99.999.999,99)
		const limitedNumbers = numbers.slice(0, 10);

		// Formata para exibição
		const formatted = formatCurrency(limitedNumbers);
		setDisplayValue(formatted);

		// Retorna o valor numérico para o pai (em centavos ou reais)
		if (onChange) {
			const numericValue = parseFloat(limitedNumbers) / 100;
			onChange({
				target: {
					value: numericValue.toFixed(2),
					name: e.target.name,
					id: e.target.id,
				},
			});
		}
	};

	const handleFocus = (e) => {
		e.target.select();
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
				<div className="absolute left-4 flex items-center gap-1 text-gray-500 pointer-events-none">
					<span className="text-md">R$</span>
				</div>
				<Input
					id={id}
					type="text"
					inputMode="numeric"
					placeholder={placeholder}
					value={displayValue}
					onChange={handleChange}
					onFocus={handleFocus}
					className="border flex-1 border-gray-300 selection:bg-primary-900 pl-10 pr-4 py-3 rounded-2xl transition-colors"
				/>
			</div>
			{displayValue && (
				<p className="text-xs text-gray-500 ml-2">
					Valor: R$ {displayValue} por noite
				</p>
			)}
		</div>
	);
}
