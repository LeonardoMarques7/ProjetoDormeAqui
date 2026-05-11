import GooglePlacesInput from "@/components/places/GooglePlacesInput";
import { StepHeader, FieldError } from "@/components/places/steps/Step1Space";

const fieldClassName =
	"w-full rounded-2xl border border-[#ddd7cf] bg-white px-4 py-3 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-300";

const helperClassName = "text-xs leading-relaxed text-slate-500";

const Field = ({ label, required = false, error, children }) => (
	<div className="space-y-2">
		<label className="block text-sm font-medium text-slate-700">
			{label}
			{required && <span className="ml-1 text-red-500">*</span>}
		</label>
		{children}
		{error && <FieldError message={error} />}
	</div>
);

const Step2Location = ({ data, dispatch, errors }) => {
	const set = (field, value) => dispatch({ type: "SET_FIELD", field, value });

	const handlePlaceSelect = (selection) => {
		set("addressStreet", selection.street || "");
		set("addressNumber", selection.streetNumber || "");
		set("addressComplement", selection.complement || "");
		set("addressNeighborhood", selection.neighborhood || "");
		set("addressCity", selection.city || "");
		set("addressState", selection.state || "");
		set("addressZipCode", selection.zipCode || "");
		set("addressCountry", selection.country || "Brasil");
		set("city", selection.cityLabel || selection.city || "");
		set("address", selection.fullAddress || selection.address || "");
		set("latitude", selection.latitude ?? "");
		set("longitude", selection.longitude ?? "");
	};

	return (
		<div className="space-y-8">
			<StepHeader
				title="Localização da acomodação"
				description="Informe o endereço completo para ajudar o hóspede a entender melhor a região e validar a posição no mapa."
			/>

			<section className="space-y-3">
				<p className="text-sm font-medium text-slate-800">
					Buscar com Google Maps
				</p>
				<GooglePlacesInput
					value={data.address}
					onChange={(event) => set("address", event.target.value)}
					onPlaceSelect={handlePlaceSelect}
					placeholder="Digite o endereço completo da acomodação"
					searchType="address"
					className="rounded-[18px] border border-[#ddd7cf] bg-white shadow-none"
				/>
				<p className={helperClassName}>
					Selecione uma sugestão para preencher automaticamente rua, bairro,
					cidade, estado, CEP e coordenadas.
				</p>
			</section>

			<section className="grid gap-5 md:grid-cols-2">
				<Field label="CEP" required error={errors?.addressZipCode}>
					<input
						type="text"
						value={data.addressZipCode}
						onChange={(event) => set("addressZipCode", event.target.value)}
						placeholder="00000-000"
						className={fieldClassName}
					/>
				</Field>

				<Field label="País" required error={errors?.addressCountry}>
					<input
						type="text"
						value={data.addressCountry}
						onChange={(event) => set("addressCountry", event.target.value)}
						placeholder="Brasil"
						className={fieldClassName}
					/>
				</Field>

				<div className="md:col-span-2">
					<Field label="Rua" required error={errors?.addressStreet}>
						<input
							type="text"
							value={data.addressStreet}
							onChange={(event) => set("addressStreet", event.target.value)}
							placeholder="Rua das Palmeiras"
							className={fieldClassName}
						/>
					</Field>
				</div>

				<Field label="Número" required error={errors?.addressNumber}>
					<input
						type="text"
						value={data.addressNumber}
						onChange={(event) => set("addressNumber", event.target.value)}
						placeholder="245"
						className={fieldClassName}
					/>
				</Field>

				<Field label="Complemento">
					<input
						type="text"
						value={data.addressComplement}
						onChange={(event) => set("addressComplement", event.target.value)}
						placeholder="Apto, bloco, casa, fundos..."
						className={fieldClassName}
					/>
				</Field>

				<Field label="Bairro" required error={errors?.addressNeighborhood}>
					<input
						type="text"
						value={data.addressNeighborhood}
						onChange={(event) =>
							set("addressNeighborhood", event.target.value)
						}
						placeholder="Centro"
						className={fieldClassName}
					/>
				</Field>

				<Field label="Cidade" required error={errors?.addressCity}>
					<input
						type="text"
						value={data.addressCity}
						onChange={(event) => set("addressCity", event.target.value)}
						placeholder="Florianópolis"
						className={fieldClassName}
					/>
				</Field>

				<Field label="Estado" required error={errors?.addressState}>
					<input
						type="text"
						value={data.addressState}
						onChange={(event) => set("addressState", event.target.value)}
						placeholder="SC"
						className={fieldClassName}
					/>
				</Field>

				<Field label="Ponto de referência">
					<input
						type="text"
						value={data.locationReference}
						onChange={(event) => set("locationReference", event.target.value)}
						placeholder="Próximo ao mercado central"
						className={fieldClassName}
					/>
				</Field>

				<div className="md:col-span-2">
					<Field label="Descrição da localização">
						<textarea
							value={data.locationDescription}
							onChange={(event) =>
								set("locationDescription", event.target.value)
							}
							placeholder="Descreva a região, acessos, comércio próximo e detalhes úteis para o hóspede."
							rows={5}
							className={[fieldClassName, "min-h-[132px] resize-y py-4"].join(" ")}
						/>
					</Field>
				</div>

				<Field label="Latitude">
					<input
						type="text"
						value={data.latitude}
						onChange={(event) => set("latitude", event.target.value)}
						placeholder="-27.5954"
						className={fieldClassName}
					/>
				</Field>

				<Field label="Longitude">
					<input
						type="text"
						value={data.longitude}
						onChange={(event) => set("longitude", event.target.value)}
						placeholder="-48.5480"
						className={fieldClassName}
					/>
				</Field>
			</section>

			<div className="px-1 py-1">
				<p className="text-sm font-medium text-slate-800">
					Visibilidade do endereço
				</p>
				<p className="mt-2 text-sm leading-relaxed text-slate-500">
					Esses dados são usados para gestão da acomodação pelo anfitrião. A
					exibição pública do endereço completo depende das regras de
					visibilidade e privacidade aplicáveis ao fluxo da reserva.
				</p>
			</div>
		</div>
	);
};

export default Step2Location;
