const METHODS = [
	{ id: "credit", label: "Crédito", icon: "💳" },
	{ id: "debit", label: "Débito", icon: "🏦" },
	{ id: "pix", label: "Pix", icon: "⚡" },
];

const PaymentMethodSelector = ({ selected, onChange }) => {
	return (
		<div className="flex gap-2 mb-5">
			{METHODS.map((method) => (
				<button
					key={method.id}
					type="button"
					onClick={() => onChange(method.id)}
					className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
						selected === method.id
							? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
							: "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
					}`}
				>
					<span>{method.icon}</span>
					{method.label}
				</button>
			))}
		</div>
	);
};

export default PaymentMethodSelector;
