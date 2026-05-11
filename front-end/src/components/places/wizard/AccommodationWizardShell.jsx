import {
	BedDouble,
	CheckCheck,
	Home,
	NotebookPen,
	Sparkles,
	WalletCards,
} from "lucide-react";
import photoDefault from "@/assets/photoDefault.jpg";
import AccommodationLocationMap from "@/components/places/AccommodationLocationMap";
import { STEPS_CONFIG, isStepValid } from "@/components/places/wizard/stepConfig";
import { resolveLocationLabel } from "@/components/places/wizard/normalizeAccommodationPayload";

const labelByMode = {
	create: "Nova acomodação",
	edit: "Editar acomodação",
};

const subtitleByMode = {
	create:
		"Preencha cada etapa com calma para montar um anúncio claro, confiável e pronto para publicar.",
	edit:
		"Atualize as informações da acomodação com o mesmo padrão visual, revisando contexto, localização e detalhes operacionais.",
};

const formatCurrency = (value) => {
	const numeric = Number(value);
	if (!Number.isFinite(numeric) || numeric <= 0) return "R$ —";
	return numeric.toLocaleString("pt-BR", {
		style: "currency",
		currency: "BRL",
	});
};

const ContextVisual = ({ currentStep, data }) => {
	if (currentStep === 2) {
		const addressLabel =
			[
				[data.addressStreet, data.addressNumber].filter(Boolean).join(", "),
				resolveLocationLabel(data),
			]
				.filter(Boolean)
				.join(" • ") || "Localização da acomodação";

		return (
			<AccommodationLocationMap
				latitude={data.latitude}
				longitude={data.longitude}
				addressLabel={addressLabel}
			/>
		);
	}

	if (currentStep === 3) {
		const photos = data.photos?.length
			? data.photos.slice(0, 4)
			: Array.from({ length: 4 }, () => null);

		return (
			<div className="grid grid-cols-2 gap-3 rounded-[18px] border border-[#ece7df] bg-white p-3 shadow-[0_8px_32px_rgba(30,24,18,0.05)]">
				{photos.map((photo, index) => (
					<div
						key={`${photo || "empty"}-${index}`}
						className="overflow-hidden rounded-[14px] bg-[#f6f1ea]"
					>
						<img
							src={photo || photoDefault}
							alt="Prévia da foto"
							className={`h-32 w-full object-cover ${photo ? "" : "opacity-40 grayscale"}`}
						/>
					</div>
				))}
			</div>
		);
	}

	if (currentStep === 4) {
		return (
			<div className="rounded-[18px] border border-[#ece7df] bg-white p-5 shadow-[0_8px_32px_rgba(30,24,18,0.05)]">
				<div className="mb-4 flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3f2ef] text-[#4b4b4b]">
						<Sparkles className="h-4 w-4" />
					</div>
					<div>
						<p className="text-sm font-medium text-[#1f1f1f]">
							Comodidades do anúncio
						</p>
						<p className="text-xs text-[#6d6d6d]">
							Mantenha só o que realmente está disponível.
						</p>
					</div>
				</div>
				<div className="flex flex-wrap gap-2">
					{(data.perks?.length ? data.perks : ["Wi-fi", "Cozinha", "Ar-condicionado"])
						.slice(0, 8)
						.map((perk) => (
							<span
								key={perk}
								className="rounded-full border border-[#ece5dc] bg-[#fbfaf8] px-3 py-2 text-xs font-medium text-[#4b4b4b]"
							>
								{perk}
							</span>
						))}
				</div>
			</div>
		);
	}

	if (currentStep === 5) {
		return (
			<div className="rounded-[18px] border border-[#ece7df] bg-white p-5 shadow-[0_8px_32px_rgba(30,24,18,0.05)]">
				<div className="mb-4 flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3f2ef] text-[#4b4b4b]">
						<WalletCards className="h-4 w-4" />
					</div>
					<div>
						<p className="text-sm font-medium text-[#1f1f1f]">Preço e horários</p>
						<p className="text-xs text-[#6d6d6d]">Resumo da etapa atual.</p>
					</div>
				</div>
				<p className="text-[30px] font-semibold tracking-[-0.04em] text-[#272727]">
					{formatCurrency(data.price)}
				</p>
				<div className="mt-4 flex flex-wrap gap-2">
					<span className="rounded-full bg-[#f3f2ef] px-3 py-1.5 text-xs font-medium text-[#4b4b4b]">
						Check-in {data.checkin || "—"}
					</span>
					<span className="rounded-full bg-[#f3f2ef] px-3 py-1.5 text-xs font-medium text-[#4b4b4b]">
						Check-out {data.checkout || "—"}
					</span>
				</div>
			</div>
		);
	}

	if (currentStep === 6) {
		const reviewItems = [
			{ label: "Título", ready: Boolean(data.title?.trim()) },
			{ label: "Localização", ready: Boolean(data.addressCity?.trim() || data.city?.trim()) },
			{ label: "Fotos", ready: Boolean(data.photos?.length) },
			{ label: "Preço", ready: Number(data.price) > 0 },
		];

		return (
			<div className="rounded-[18px] border border-[#ece7df] bg-white p-5 shadow-[0_8px_32px_rgba(30,24,18,0.05)]">
				<div className="mb-4 flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3f2ef] text-[#4b4b4b]">
						<CheckCheck className="h-4 w-4" />
					</div>
					<div>
						<p className="text-sm font-medium text-[#1f1f1f]">Checklist final</p>
						<p className="text-xs text-[#6d6d6d]">Confirme o status de cada bloco.</p>
					</div>
				</div>
				<div className="grid gap-2">
					{reviewItems.map((item) => (
						<div
							key={item.label}
							className="flex items-center justify-between rounded-[14px] bg-[#fbfaf8] px-4 py-3 text-sm"
						>
							<span className="text-[#4b4b4b]">{item.label}</span>
							<span
								className={`rounded-full px-3 py-1 text-xs font-semibold ${
									item.ready
										? "bg-emerald-100 text-emerald-700"
										: "bg-amber-100 text-amber-700"
								}`}
							>
								{item.ready ? "Pronto" : "Pendente"}
							</span>
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="grid gap-3 md:grid-cols-2">
			<div className="rounded-[18px] border border-[#ece7df] bg-white p-5 shadow-[0_8px_32px_rgba(30,24,18,0.05)]">
				<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#f3f2ef] text-[#4b4b4b]">
					<Home className="h-4 w-4" />
				</div>
				<p className="text-sm font-medium text-[#1f1f1f]">Tipo da acomodação</p>
				<p className="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-[#272727]">
					{data.type || "Defina o tipo"}
				</p>
			</div>
			<div className="rounded-[18px] border border-[#ece7df] bg-white p-5 shadow-[0_8px_32px_rgba(30,24,18,0.05)]">
				<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#f3f2ef] text-[#4b4b4b]">
					<BedDouble className="h-4 w-4" />
				</div>
				<p className="text-sm font-medium text-[#1f1f1f]">Capacidade</p>
				<p className="mt-2 text-sm leading-relaxed text-[#6d6d6d]">
					{data.guests || 0} hóspedes • {data.rooms || 0} quartos • {data.beds || 0} camas
				</p>
			</div>
		</div>
	);
};

const AccommodationWizardShell = ({
	mode = "create",
	currentStep,
	data,
	children,
	onStepClick,
}) => {
	const step = STEPS_CONFIG.find((item) => item.id === currentStep) || STEPS_CONFIG[0];

	return (
		<div className="grid min-h-[calc(100vh-96px)] items-start gap-8 lg:grid-cols-[minmax(320px,1fr)_minmax(0,620px)] xl:grid-cols-[minmax(360px,1fr)_minmax(520px,630px)]">
			<section className="px-2 pt-4 lg:pt-10 xl:pt-16">
				<div className="grid gap-6 xl:grid-cols-[42px_minmax(0,1fr)]">
					<div className="hidden xl:block">
						<div className="relative flex h-full flex-col items-center gap-5">
							<div className="absolute left-1/2 top-3 bottom-3 w-px -translate-x-1/2 bg-[#ddd6cd]" />
							{STEPS_CONFIG.map((item) => {
								const active = item.id === currentStep;
								const completed =
									isStepValid(item.id, data) && currentStep > item.id;
								const clickable = currentStep > item.id || completed;
								return (
									<div key={item.id} className="group relative">
										<button
											type="button"
											onClick={() => clickable && onStepClick?.(item.id)}
											aria-label={item.title}
											className={`relative z-[1] flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-all ${
												active
													? "border-primary-700 bg-primary-700 text-white shadow-[0_12px_26px_rgba(49,107,241,0.22)]"
													: completed
														? "cursor-pointer border-[#d9d3c9] bg-white text-[#363636] hover:border-primary-300"
														: clickable
															? "cursor-pointer border-[#ddd6cd] bg-white text-[#6d6d6d] hover:border-primary-200"
															: "cursor-default border-[#ddd6cd] bg-white text-[#949494]"
											}`}
										>
											{item.id}
										</button>
										<div className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 z-[2] hidden -translate-y-1/2 whitespace-nowrap rounded-full bg-[#272727] px-3 py-1.5 text-xs font-medium text-white shadow-lg group-hover:block">
											{item.title}
										</div>
									</div>
								);
							})}
						</div>
					</div>

					<div>
						<div className="mb-5 inline-flex items-center gap-3">
							<div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ddd6cd] bg-white text-[#636363]">
								<NotebookPen className="h-4 w-4" />
							</div>
							<div className="rounded-full border border-[#ddd6cd] bg-white/92 px-4 py-2 text-[15px] text-[#363636]">
								{labelByMode[mode]}
							</div>
						</div>

						<h1 className="max-w-[460px] text-[clamp(50px,5.6vw,66px)] font-medium leading-[0.98] tracking-[-0.05em] text-[#272727]">
							{step.title}
						</h1>

						<p className="mt-6 max-w-[490px] text-[18px] leading-[1.5] text-[#2d2d2d]">
							{step.description} {subtitleByMode[mode]}
						</p>

						<div className="mt-8 flex flex-wrap gap-2 xl:hidden">
							{STEPS_CONFIG.map((item) => {
								const active = item.id === currentStep;
								return (
									<span
										key={item.id}
										className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
											active ? "bg-primary-700 text-white" : "bg-white text-[#6d6d6d]"
										}`}
									>
										{item.id}. {item.title}
									</span>
								);
							})}
						</div>

						<div className="mt-10 w-full max-w-[440px]">
							<ContextVisual currentStep={currentStep} data={data} />
						</div>
					</div>
				</div>
			</section>

			<section className="relative overflow-hidden rounded-[22px] border border-[#f0ebe3] bg-[linear-gradient(180deg,#fbfaf8_0%,#f7f3ed_100%)] px-4 py-8 sm:px-8 sm:py-12">
				<div className="pointer-events-none absolute inset-0 opacity-[0.22] [background-image:radial-gradient(circle_at_12%_16%,rgba(135,115,91,0.26)_0_1px,transparent_1.2px),radial-gradient(circle_at_36%_10%,rgba(135,115,91,0.24)_0_1px,transparent_1.2px),radial-gradient(circle_at_64%_24%,rgba(135,115,91,0.24)_0_1px,transparent_1.2px),radial-gradient(circle_at_82%_16%,rgba(135,115,91,0.24)_0_1px,transparent_1.2px),radial-gradient(circle_at_24%_52%,rgba(135,115,91,0.22)_0_1px,transparent_1.2px),radial-gradient(circle_at_72%_72%,rgba(135,115,91,0.22)_0_1px,transparent_1.2px)] [background-size:160px_160px]" />
				<div className="pointer-events-none absolute bottom-[-340px] right-[-150px] h-[620px] w-[620px] rounded-full border border-[rgba(230,224,216,0.9)]" />

				<div className="relative z-[1] rounded-[24px] bg-white/96 p-5 shadow-[0_20px_50px_rgba(49,37,22,0.04)] sm:p-6">
					{children}
				</div>
			</section>
		</div>
	);
};

export default AccommodationWizardShell;
