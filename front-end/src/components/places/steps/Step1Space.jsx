import {
	Home,
	Building2,
	BedDouble,
	TreePine,
	Hotel,
	Leaf,
	Users2,
	Bed,
	Bath,
	DoorOpen,
} from "lucide-react";
import { GuestsInput } from "@/components/ui/GuestsInput";

// ============================================
// TIPOS DE ESPAÇO
// ============================================
const SPACE_TYPES = [
	{ value: "casa", label: "Casa", icon: Home },
	{ value: "apartamento", label: "Apartamento", icon: Building2 },
	{ value: "quarto", label: "Quarto", icon: BedDouble },
	{ value: "chalé", label: "Chalé", icon: TreePine },
	{ value: "pousada", label: "Pousada", icon: Hotel },
	{ value: "sítio", label: "Sítio", icon: Leaf },
];

/**
 * Step 1 – Sobre o espaço
 * Tipo, título, cidade, quartos, banheiros, camas, hóspedes.
 */
const Step1Space = ({ data, dispatch, errors }) => {
	const set = (field, value) => dispatch({ type: "SET_FIELD", field, value });

	return (
		<div className="space-y-8">
			<StepHeader
				title="Sobre o espaço"
				description="Comece escolhendo o tipo de acomodação e as informações básicas."
			/>

			{/* Tipo do espaço */}
			<section className="space-y-3">
				<label className="block text-base font-semibold text-gray-700">
					Tipo de espaço
				</label>
				<div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
					{SPACE_TYPES.map(({ value, label, icon: Icon }) => {
						const selected = data.type === value;
						return (
							<button
								key={value}
								type="button"
								onClick={() => set("type", value)}
								className={`
									flex flex-col items-center justify-center gap-2 py-4 px-2
									rounded-2xl border-2 transition-all duration-200 cursor-pointer
									${
										selected
											? "border-primary-700 bg-primary-50 text-primary-800 shadow-sm"
											: "border-gray-200 hover:border-gray-400 text-gray-600"
									}
								`}
							>
								<Icon size={22} />
								<span className="text-xs font-medium leading-tight text-center">
									{label}
								</span>
							</button>
						);
					})}
				</div>
				{errors?.type && <FieldError message={errors.type} />}
			</section>

			{/* Título */}
			<section className="space-y-2">
				<label className="block text-base font-semibold text-gray-700">
					Título do anúncio
				</label>
				<input
					type="text"
					maxLength={80}
					placeholder="Ex: Apartamento aconchegante com vista para o mar"
					value={data.title}
					onChange={(e) => set("title", e.target.value)}
					className={`
						w-full px-4 py-3 border rounded-2xl text-sm
						focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all
						${errors?.title ? "border-red-400 bg-red-50" : "border-gray-300"}
					`}
				/>
				<div className="flex justify-between items-center">
					{errors?.title ? <FieldError message={errors.title} /> : <span />}
					<span className="text-xs text-gray-400">
						{data.title?.length || 0}/80
					</span>
				</div>
			</section>

			{/* Cidade */}
			<section className="space-y-2">
				<label className="block text-base font-semibold text-gray-700">
					Cidade e Estado
				</label>
				<input
					type="text"
					placeholder="Ex: Florianópolis, SC"
					value={data.city}
					onChange={(e) => set("city", e.target.value)}
					className={`
						w-full px-4 py-3 border rounded-2xl text-sm
						focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all
						${errors?.city ? "border-red-400 bg-red-50" : "border-gray-300"}
					`}
				/>
				{errors?.city && <FieldError message={errors.city} />}
			</section>

			{/* Capacidade - 4 counters */}
			<section className="space-y-3">
				<label className="block text-base font-semibold text-gray-700">
					Capacidade
				</label>
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
					<GuestsInput
						label="Quartos"
						min={0}
						max={20}
						value={data.rooms}
						onChange={(e) => set("rooms", e.target.value)}
						icon={DoorOpen}
						unitSingular="quarto"
						unitPlural="quartos"
					/>
					<GuestsInput
						label="Banheiros"
						min={0}
						max={20}
						value={data.bathrooms}
						onChange={(e) => set("bathrooms", e.target.value)}
						icon={Bath}
						unitSingular="banheiro"
						unitPlural="banheiros"
					/>
					<GuestsInput
						label="Camas"
						min={1}
						max={30}
						value={data.beds}
						onChange={(e) => set("beds", e.target.value)}
						icon={Bed}
						unitSingular="cama"
						unitPlural="camas"
					/>
					<GuestsInput
						label="Hóspedes"
						min={1}
						max={20}
						value={data.guests}
						onChange={(e) => set("guests", e.target.value)}
						icon={Users2}
						unitSingular="hóspede"
						unitPlural="hóspedes"
					/>
				</div>
				{(errors?.rooms ||
					errors?.bathrooms ||
					errors?.beds ||
					errors?.guests) && (
					<FieldError
						message={
							errors.rooms || errors.bathrooms || errors.beds || errors.guests
						}
					/>
				)}
			</section>
		</div>
	);
};

// ──────────────────────────────────────────
// Helpers internos reutilizados nos steps
// ──────────────────────────────────────────
export function StepHeader({ title, description }) {
	return (
		<div className="text-start">
			<h1 className="text-2xl font-semibold text-gray-800 mb-1">{title}</h1>
			<p className="text-gray-500 text-sm">{description}</p>
		</div>
	);
}

export function FieldError({ message }) {
	return (
		<p className="flex items-center gap-1 text-sm text-red-500 mt-1">
			<span className="w-1.5 h-1.5 rounded-full bg-red-400" />
			{message}
		</p>
	);
}

export default Step1Space;
