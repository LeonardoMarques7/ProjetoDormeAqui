import {
	Home2 as Home,
	Buildings2 as Building2,
	Bed,
	HomeAngle as TreePine,
	Shop,
	Leaf,
	UsersGroupRounded as Users2,
	Bath,
} from "@solar-icons/react";

import { GuestsInput } from "@/components/ui/GuestsInput";
import { DoorOpenIcon } from "lucide-react";

const SPACE_TYPES = [
	{ value: "casa", label: "Casa", icon: Home },
	{ value: "apartamento", label: "Apartamento", icon: Building2 },
	{ value: "quarto", label: "Quarto", icon: Bed },
	{ value: "chalé", label: "Chalé", icon: TreePine },
	{ value: "pousada", label: "Pousada", icon: Building2 },
	{ value: "sítio", label: "Sítio", icon: Leaf },
];

const textFieldClassName =
	"w-full rounded-2xl border border-[#ddd7cf] bg-white px-4 py-3 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-300";

const Step1Space = ({ data, dispatch, errors }) => {
	const set = (field, value) => dispatch({ type: "SET_FIELD", field, value });

	return (
		<div className="space-y-8">
			<StepHeader
				title="Informações básicas"
				description="Defina o tipo da acomodação, um bom título e uma descrição clara para começar o anúncio."
			/>

			<section className="space-y-3">
				<label className="block text-base font-semibold text-gray-700">
					Tipo de espaço
				</label>
				<div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
					{SPACE_TYPES.map(({ value, label, icon: Icon }) => {
						const selected = data.type === value;
						return (
							<button
								key={value}
								type="button"
								onClick={() => set("type", value)}
								className={[
									"flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 px-2 py-4 transition-all duration-200",
									selected
										? "border-primary-700 bg-primary-50 text-primary-800 shadow-sm"
										: "border-gray-200 text-gray-600 hover:border-gray-400",
								].join(" ")}
							>
								<Icon size={22} />
								<span className="text-center text-xs font-medium leading-tight">
									{label}
								</span>
							</button>
						);
					})}
				</div>
				{errors?.type && <FieldError message={errors.type} />}
			</section>

			<section className="space-y-2">
				<label className="block text-base font-semibold text-gray-700">
					Título do anúncio
				</label>
				<input
					type="text"
					maxLength={80}
					placeholder="Ex: Apartamento aconchegante com vista para o mar"
					value={data.title}
					onChange={(event) => set("title", event.target.value)}
					className={[
						textFieldClassName,
						errors?.title ? "border-red-400 bg-red-50" : "",
					].join(" ")}
				/>
				<div className="flex items-center justify-between">
					{errors?.title ? <FieldError message={errors.title} /> : <span />}
					<span className="text-xs text-gray-400">
						{data.title?.length || 0}/80
					</span>
				</div>
			</section>

			<section className="space-y-2">
				<div className="flex items-center justify-between">
					<label className="block text-base font-semibold text-gray-700">
						Descrição principal
					</label>
					<span className="rounded-full bg-[#f4efe7] px-3 py-1 text-xs font-medium text-slate-600">
						Obrigatório
					</span>
				</div>
				<textarea
					value={data.description}
					onChange={(event) => set("description", event.target.value)}
					placeholder="Descreva o clima do espaço, o diferencial da hospedagem e o tipo de experiência que o hóspede encontrará."
					rows={6}
					className={[
						textFieldClassName,
						"min-h-[160px] resize-y py-4",
						errors?.description ? "border-red-400 bg-red-50" : "",
					].join(" ")}
				/>
				{errors?.description && <FieldError message={errors.description} />}
			</section>

			<section className="space-y-3">
				<label className="block text-base font-semibold text-gray-700">
					Capacidade
				</label>
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
					<GuestsInput
						label="Quartos"
						min={0}
						max={20}
						value={data.rooms}
						onChange={(event) => set("rooms", event.target.value)}
						icon={DoorOpenIcon}
						unitSingular="quarto"
						unitPlural="quartos"
					/>
					<GuestsInput
						label="Banheiros"
						min={0}
						max={20}
						value={data.bathrooms}
						onChange={(event) => set("bathrooms", event.target.value)}
						icon={Bath}
						unitSingular="banheiro"
						unitPlural="banheiros"
					/>
					<GuestsInput
						label="Camas"
						min={1}
						max={30}
						value={data.beds}
						onChange={(event) => set("beds", event.target.value)}
						icon={Bed}
						unitSingular="cama"
						unitPlural="camas"
					/>
					<GuestsInput
						label="Hóspedes"
						min={1}
						max={20}
						value={data.guests}
						onChange={(event) => set("guests", event.target.value)}
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

export function StepHeader({ title, description }) {
	return null;
}

export function FieldError({ message }) {
	return (
		<p className="mt-1 flex items-center gap-1 text-sm text-red-500">
			<span className="h-1.5 w-1.5 rounded-full bg-red-400" />
			{message}
		</p>
	);
}

export default Step1Space;
