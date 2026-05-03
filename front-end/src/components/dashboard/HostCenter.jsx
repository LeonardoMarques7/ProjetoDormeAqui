import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
	AlertTriangle,
	ArrowUpRight,
	Banknote,
	BarChart3,
	BookOpen,
	Building2,
	CalendarDays,
	ChevronRight,
	CheckCircle2,
	Clock3,
	ClipboardCheck,
	DoorOpen,
	FileBarChart,
	Home,
	LineChart as LineChartIcon,
	Menu,
	MessageCircle,
	Plus,
	RefreshCw,
	ShieldCheck,
	Sparkles,
	Wrench,
	X,
} from "lucide-react";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip as RechartsTooltip,
	XAxis,
	YAxis,
} from "recharts";
import { getHostDashboard } from "@/services/dashboardService";
import CalendarGridMonth from "./CalendarGridMonth";
import AccommodationLogbook from "./AccommodationLogbook";
import photoDefault from "@/assets/photoDefault.jpg";
import { ChevronDoubleDownIcon } from "@heroicons/react/24/outline";

const navigation = [
	{ id: "overview", label: "Visão geral", icon: Home },
	{ id: "agenda", label: "Agenda", icon: CalendarDays },
	{ id: "reservations", label: "Reservas", icon: Clock3 },
	{ id: "places", label: "Acomodações", icon: Building2 },
	{ id: "pre-checkin", label: "Pré-check-in", icon: ShieldCheck },
	{ id: "cleaning", label: "Limpeza e vistoria", icon: ClipboardCheck },
	{ id: "finance", label: "Financeiro", icon: Banknote },
	{ id: "maintenance", label: "Manutenção e danos", icon: Wrench },
	{ id: "reports", label: "Relatórios", icon: FileBarChart },
	{ id: "logbook", label: "Histórico", icon: BookOpen },
];

const formatCurrency = (value) =>
	new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
		maximumFractionDigits: 0,
	}).format(Number(value || 0));

const formatDate = (value) =>
	value
		? new Intl.DateTimeFormat("pt-BR", {
				day: "2-digit",
				month: "short",
			}).format(new Date(value))
		: "Sem data";

const formatDateTime = (value) =>
	value
		? new Intl.DateTimeFormat("pt-BR", {
				day: "2-digit",
				month: "short",
				hour: "2-digit",
				minute: "2-digit",
			}).format(new Date(value))
		: "Sem data";

const bookingStatusLabels = {
	pending: "Pendente",
	confirmed: "Confirmada",
	in_progress: "Em andamento",
	evaluation: "Avaliação",
	review: "Revisão",
	completed: "Finalizada",
	canceled: "Cancelada",
	rejected: "Rejeitada",
};

const toneMap = {
	primary: {
		iconBg: "bg-primary-100",
		iconText: "text-primary-700",
		trendBg: "bg-primary-100",
		trendText: "text-primary-700",
	},
	blue: {
		iconBg: "bg-sky-50",
		iconText: "text-sky-600",
		trendBg: "bg-sky-50",
		trendText: "text-sky-700",
	},
	green: {
		iconBg: "bg-emerald-50",
		iconText: "text-emerald-600",
		trendBg: "bg-emerald-50",
		trendText: "text-emerald-700",
	},
	amber: {
		iconBg: "bg-amber-50",
		iconText: "text-amber-600",
		trendBg: "bg-amber-50",
		trendText: "text-amber-700",
	},
	violet: {
		iconBg: "bg-violet-50",
		iconText: "text-violet-600",
		trendBg: "bg-violet-50",
		trendText: "text-violet-700",
	},
	slate: {
		iconBg: "bg-slate-100",
		iconText: "text-slate-700",
		trendBg: "bg-slate-100",
		trendText: "text-slate-700",
	},
};

const getTone = (tone = "blue") => toneMap[tone] || toneMap.blue;

function MetricCard({
	label,
	value,
	suffix,
	helper,
	icon: Icon,
	tone = "blue",
}) {
	const palette = getTone(tone);

	return (
		<article className="group flex h-full min-w-0 flex-col rounded-[20px] border border-slate-200/70 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(15,23,42,0.09)]">
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0">
					<p className="text-[13px] font-medium text-slate-500">{label}</p>
					<div className="mt-4 flex items-end gap-2">
						<p className="truncate text-3xl font-semibold tracking-tight text-slate-950">
							{value}
						</p>
						{suffix && (
							<span className="pb-1 text-sm font-medium text-slate-500">
								{suffix}
							</span>
						)}
					</div>
					{helper && <p className="mt-3 text-xs text-slate-500">{helper}</p>}
				</div>

				<div className="flex shrink-0 flex-col items-end gap-2">
					<span
						className={`flex h-10 w-10 items-center justify-center rounded-xl ${palette.iconBg} ${palette.iconText}`}
					>
						<Icon className="h-5 w-5" />
					</span>
				</div>
			</div>
		</article>
	);
}

function PanelCard({ title, description, action, children, className = "" }) {
	return (
		<section
			className={`rounded-[20px] border border-slate-200/70 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] ${className}`}
		>
			{(title || description || action) && (
				<div className="mb-4 flex flex-wrap items-start justify-between gap-3">
					<div className="min-w-0">
						{title && (
							<h3 className="text-base font-semibold tracking-tight text-slate-950">
								{title}
							</h3>
						)}
						{description && (
							<p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
								{description}
							</p>
						)}
					</div>
					{action}
				</div>
			)}
			{children}
		</section>
	);
}

function Pill({ children, tone = "slate" }) {
	const palette = getTone(tone);
	return (
		<span
			className={`inline-flex items-center rounded-full w-fit px-2.5 py-1 text-xs font-semibold ${palette.trendBg} ${palette.trendText}`}
		>
			{children}
		</span>
	);
}

function MetricCardRow({
	label,
	value,
	tone = "slate",
	helper,
	icon: Icon = ArrowUpRight,
}) {
	const palette = getTone(tone);
	return (
		<div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3">
			<div className="flex items-center justify-between gap-3">
				<p className="text-xs font-medium uppercase tracking-wide text-slate-500">
					{label}
				</p>
				<span
					className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${palette.iconBg} ${palette.iconText}`}
				>
					<Icon className="h-4 w-4" />
				</span>
			</div>
			<p className="mt-3 text-xl font-semibold tracking-tight text-slate-950">
				{value}
			</p>
			{helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
		</div>
	);
}

function EmptyState({ icon: Icon, title, description }) {
	return (
		<div className="rounded-[20px] border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center">
			<span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
				<Icon className="h-6 w-6" />
			</span>
			<h3 className="mt-4 text-lg font-semibold text-slate-950">{title}</h3>
			<p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
				{description}
			</p>
		</div>
	);
}

function SectionHeader({ eyebrow, title, description, action }) {
	return (
		<div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<p className="text-xs font-semibold uppercase tracking-wide text-primary-700">
					{eyebrow}
				</p>
				<h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
					{title}
				</h2>
				{description && (
					<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
						{description}
					</p>
				)}
			</div>
			{action && <div className="shrink-0 sm:self-center">{action}</div>}
		</div>
	);
}

function Sidebar({ activeSection, onChange }) {
	return (
		<aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
			<div className="sticky top-0 flex h-screen flex-col overflow-y-auto">
				<div className="mb-6 px-4">
					<h1 className="mt-1 text-xl font-semibold text-slate-950">
						Central do Anfitrião
					</h1>
				</div>
				<nav className="space-y-1 pb-5">
					{navigation.map((item) => {
						const Icon = item.icon;
						const isActive = activeSection === item.id;
						return (
							<button
								key={item.id}
								type="button"
								onClick={() => onChange(item.id)}
								className={`flex h-11 w-full cursor-pointer items-center gap-3 border-r-2 px-3 text-left text-sm font-medium transition-colors ${
									isActive
										? "border-primary-900 text-primary-900"
										: "text-slate-600 hover:text-primary-900 hover:border-primary-300 border-r-2 border-transparent"
								}`}
							>
								<Icon className="h-4 w-4 shrink-0" />
								<span className="truncate">{item.label}</span>
							</button>
						);
					})}
				</nav>
			</div>
		</aside>
	);
}

function MobileNav({ activeSection, onChange }) {
	const [open, setOpen] = useState(false);
	const activeItem = navigation.find((item) => item.id === activeSection);

	return (
		<div className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200/70 bg-white px-3 text-sm font-semibold text-slate-950 shadow-[0_8px_20px_rgba(15,23,42,0.04)]"
			>
				<span className="inline-flex items-center gap-2">
					<Menu className="h-4 w-4" />
					{activeItem?.label || "Central"}
				</span>
			</button>

			{open && (
				<div className="fixed inset-0 z-40 bg-slate-950/30">
					<div className="h-full w-[86vw] max-w-sm bg-white p-4 shadow-xl">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="text-lg font-semibold text-slate-950">
								Central do Anfitrião
							</h2>
							<button
								type="button"
								onClick={() => setOpen(false)}
								className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/70 bg-white"
							>
								<X className="h-4 w-4" />
							</button>
						</div>
						<div className="space-y-1">
							{navigation.map((item) => {
								const Icon = item.icon;
								return (
									<button
										key={item.id}
										type="button"
										onClick={() => {
											onChange(item.id);
											setOpen(false);
										}}
										className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium ${
											activeSection === item.id
												? "bg-primary-900 text-white"
												: "text-slate-600 hover:bg-slate-100"
										}`}
									>
										<Icon className="h-4 w-4" />
										{item.label}
									</button>
								);
							})}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

function AlertsPanel({ alerts = [] }) {
	return (
		<PanelCard
			title="Alertas críticos e sugestões"
			description="Pontos de atenção que pedem uma ação rápida."
		>
			<div className="space-y-3">
				{alerts.slice(0, 5).map((alert) => {
					const severityTone =
						alert.severity === "critical" || alert.severity === "warning"
							? "amber"
							: alert.severity === "healthy"
								? "green"
								: "blue";

					return (
						<div
							key={alert.id}
							className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4"
						>
							<div className="flex items-start gap-3">
								<span
									className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getTone(severityTone).iconBg} ${getTone(severityTone).iconText}`}
								>
									<Sparkles className="h-5 w-5" />
								</span>
								<div className="min-w-0">
									<div className="flex flex-wrap items-center gap-2">
										<p className="text-sm font-semibold text-slate-950">
											{alert.title}
										</p>
										<Pill tone={severityTone}>{alert.severity}</Pill>
									</div>
									<p className="mt-1 text-xs leading-5 text-slate-500">
										{alert.message}
									</p>
								</div>
							</div>
						</div>
					);
				})}
				{alerts.length === 0 && (
					<div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-4 text-sm text-slate-500">
						Nenhum alerta prioritário no momento.
					</div>
				)}
			</div>
		</PanelCard>
	);
}

function MovementCard({ event, accent = "primary" }) {
	const photo = event.guestPhoto || photoDefault;
	const email = event.guestEmail || "Sem e-mail informado";
	const label =
		event.type === "checkin" ? "Entrada / Check-in" : "Saída / Check-out";

	return (
		<div className="flex min-w-0 items-center gap-3 rounded-[999px] border border-slate-200/70 bg-white px-3 py-3 shadow-sm">
			<div className="relative shrink-0">
				<img
					src={photo}
					alt={event.guest}
					className="h-14 w-14 rounded-full object-cover ring-2 ring-white"
				/>{" "}
				{/* <span>
					<ChevronDoubleDownIcon />
				</span> */}
			</div>
			<div className="min-w-0 flex items-start justify-between flex-1">
				<div className="">
					<div className="flex flex-col min-w-0 flex-wrap">
						<p className="truncate text-sm font-semibold text-slate-950">
							{event.guest}
						</p>
					</div>

					<p className="truncate text-xs text-slate-500">{email}</p>
				</div>
			</div>
		</div>
	);
}

function MovementsBoard({ movements = [] }) {
	const checkins = movements.filter((event) => event.type === "checkin");
	const checkouts = movements.filter((event) => event.type === "checkout");

	return (
		<PanelCard
			title="Entrada e saída"
			description="Quem chega e quem sai nos próximos dias."
		>
			<div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-semibold text-slate-950">
								Entrada / Check-in
							</p>
							<p className="text-xs text-slate-500">
								{checkins.length} próximos movimentos
							</p>
						</div>
						<Pill tone="primary">{checkins.length}</Pill>
					</div>
					{checkins.length > 0 ? (
						<div className="space-y-2">
							{checkins.slice(0, 4).map((event) => (
								<MovementCard
									key={`${event.id}-${event.type}`}
									event={event}
									accent="primary"
								/>
							))}
						</div>
					) : (
						<div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-4 text-sm text-slate-500">
							Nenhuma entrada prevista.
						</div>
					)}
				</div>

				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-semibold text-slate-950">
								Saída / Check-out
							</p>
							<p className="text-xs text-slate-500">
								{checkouts.length} próximos movimentos
							</p>
						</div>
						<Pill tone="amber">{checkouts.length}</Pill>
					</div>
					{checkouts.length > 0 ? (
						<div className="space-y-2">
							{checkouts.slice(0, 4).map((event) => (
								<MovementCard
									key={`${event.id}-${event.type}`}
									event={event}
									accent="amber"
								/>
							))}
						</div>
					) : (
						<div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-4 text-sm text-slate-500">
							Nenhuma saída prevista.
						</div>
					)}
				</div>
			</div>
		</PanelCard>
	);
}

function FinanceSummary({ finance }) {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
			<MetricCard
				label="Dinheiro confirmado neste mês"
				value={formatCurrency(finance?.monthlyEarnings)}
				helper="valores já processados e confirmados"
				tone="green"
				icon={Banknote}
			/>
			<MetricCard
				label="Valores que ainda entram"
				value={formatCurrency(finance?.futureEarnings)}
				helper="reservas futuras já aprovadas"
				tone="blue"
				icon={LineChartIcon}
			/>
			<MetricCard
				label="Custos estimados"
				value={formatCurrency(finance?.totalFees)}
				helper="resumo das taxas da operação"
				tone="amber"
				icon={AlertTriangle}
			/>
			<MetricCard
				label="Valor por noite disponível"
				value={formatCurrency(
					finance?.availableNightEarnings ?? finance?.revPAR,
				)}
				helper="leitura simples para comparar desempenho"
				tone="violet"
				icon={BarChart3}
			/>
		</div>
	);
}

function ChartsPanel({ charts, properties = [] }) {
	const revenueData = charts?.revenueProjection || [];
	const propertyData =
		charts?.propertyPerformance?.length > 0
			? charts.propertyPerformance
			: properties.slice(0, 6).map((property) => ({
					id: property.id || property._id,
					name: property.title?.slice(0, 16) || "Acomodações",
					revenue: property.monthlyRevenue || 0,
					occupancyRate: property.occupancyRate || 0,
					status: property.status || "slate",
				}));

	return (
		<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-2">
			<PanelCard title="Dinheiro ao longo do tempo">
				<div className="h-[280px]">
					{revenueData.length > 0 ? (
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={revenueData}>
								<CartesianGrid
									stroke="#e2e8f0"
									strokeDasharray="4 4"
									vertical={false}
								/>
								<XAxis
									dataKey="mes"
									tickLine={false}
									axisLine={false}
									tick={{ fontSize: 12 }}
								/>
								<YAxis
									tickLine={false}
									axisLine={false}
									tick={{ fontSize: 12 }}
									tickFormatter={formatCurrency}
								/>
								<RechartsTooltip formatter={(value) => formatCurrency(value)} />
								<Line
									type="monotone"
									dataKey="receita"
									stroke="#111827"
									strokeWidth={3}
									dot={false}
								/>
								<Line
									type="monotone"
									dataKey="projecao"
									stroke="#334155"
									strokeWidth={2}
									strokeDasharray="6 6"
									dot={false}
								/>
							</LineChart>
						</ResponsiveContainer>
					) : (
						<EmptyState
							icon={LineChartIcon}
							title="Ainda sem histórico suficiente"
							description="Quando houver dados consolidados, o gráfico vai aparecer aqui."
						/>
					)}
				</div>
			</PanelCard>

			<PanelCard title="Como cada imóvel está indo">
				<div className="h-[280px]">
					{propertyData.length > 0 ? (
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={propertyData}>
								<CartesianGrid
									stroke="#e2e8f0"
									strokeDasharray="4 4"
									vertical={false}
								/>
								<XAxis
									dataKey="name"
									tickLine={false}
									axisLine={false}
									tick={{ fontSize: 12 }}
								/>
								<YAxis
									tickLine={false}
									axisLine={false}
									tick={{ fontSize: 12 }}
									tickFormatter={formatCurrency}
								/>
								<RechartsTooltip formatter={(value) => formatCurrency(value)} />
								<Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
									{propertyData.map((item) => (
										<Cell
											key={item.id}
											fill={
												item.status === "critical"
													? "#dc2626"
													: item.status === "warning"
														? "#d97706"
														: "#111827"
											}
										/>
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					) : (
						<EmptyState
							icon={BarChart3}
							title="Ainda sem dados por imóvel"
							description="Assim que a operação tiver mais volume, este gráfico é preenchido automaticamente."
						/>
					)}
				</div>
			</PanelCard>
		</div>
	);
}

function PropertyCard({ property }) {
	const photo = property.photos?.[0] || photoDefault;
	const nextEvent = property.nextEvent;

	return (
		<article className="min-w-0 overflow-hidden rounded-[20px] border border-slate-200/70 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
			<div className="grid min-w-0 gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
				<img
					src={photo}
					alt={property.title}
					className="h-48 w-full rounded-[16px] object-cover lg:h-full"
				/>
				<div className="min-w-0">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
						<div className="min-w-0">
							<p className="text-sm text-slate-500">{property.city}</p>
							<Link
								to={`/places/${property.id}`}
								className="mt-1 block truncate text-xl font-semibold tracking-tight text-slate-950 hover:text-primary-700"
							>
								{property.title}
							</Link>
						</div>
						<Pill
							tone={
								property.status === "critical" || property.status === "warning"
									? "amber"
									: "green"
							}
						>
							{property.statusLabel}
						</Pill>
					</div>

					<div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
						<MetricCardRow
							label="Receita"
							value={formatCurrency(property.monthlyRevenue)}
							tone="green"
						/>
						<MetricCardRow
							label="Ocupação"
							value={`${property.occupancyRate ?? 0}%`}
							tone="blue"
							icon={ArrowUpRight}
						/>
						<MetricCardRow
							label="Avaliação"
							value={property.averageRating || "Sem nota"}
							tone="violet"
							icon={CheckCircle2}
						/>
						<MetricCardRow
							label="Próxima"
							value={
								nextEvent
									? `${nextEvent.type} ${formatDate(nextEvent.date)}`
									: "Sem evento"
							}
							tone="slate"
							icon={Clock3}
						/>
					</div>

					<div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
						<span className="rounded-full bg-slate-100 px-3 py-1">
							{property.guests || "-"} hóspedes
						</span>
						<span className="rounded-full bg-slate-100 px-3 py-1">
							{property.rooms || "-"} quartos
						</span>
						<span className="rounded-full bg-slate-100 px-3 py-1">
							{property.bathrooms || "-"} banheiros
						</span>
						{property.perks?.slice(0, 4).map((perk) => (
							<span key={perk} className="rounded-full bg-slate-100 px-3 py-1">
								{perk}
							</span>
						))}
					</div>

					<div className="mt-4 flex flex-wrap items-center gap-2">
						{property.alerts?.slice(0, 3).map((alert) => (
							<span
								key={alert.id}
								className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
							>
								{alert.title}
							</span>
						))}
					</div>
				</div>
			</div>
		</article>
	);
}

function ReservationsTable({ bookings = [] }) {
	return (
		<div className="min-w-0 overflow-hidden rounded-[20px] border border-slate-200/70 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
			<div className="overflow-x-auto">
				<table className="w-full min-w-[760px] text-left text-sm">
					<thead className="border-b align-middle border-slate-200/70 bg-primary-50/40 text-[11px] uppercase tracking-[0.18em] h-15 text-slate-500">
						<tr>
							<th className="px-4 py-3">Reserva</th>
							<th className="px-4 py-3">Acomodação</th>
							<th className="px-4 py-3">Período</th>
							<th className="px-4 py-3">Hóspedes</th>
							<th className="px-4 py-3">Status</th>
							<th className="px-4 py-3 text-right">Total</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100">
						{bookings.map((booking) => (
							<tr
								key={booking._id}
								className="align-middle transition-colors hover:bg-primary-50/70"
							>
								<td className="px-4 py-3 font-medium text-slate-950">
									#{String(booking._id).slice(-6).toUpperCase()}
								</td>
								<td className="px-4 py-3">
									<p className="font-medium text-slate-900">
										{booking.place?.title}
									</p>
									<p className="text-xs text-slate-500">{booking.user?.name}</p>
								</td>
								<td className="px-4 py-3 text-slate-600">
									{formatDate(booking.checkin)} - {formatDate(booking.checkout)}
								</td>
								<td className="px-4 py-3 text-slate-600">
									{booking.guests || 1}
								</td>
								<td className="px-4 py-3">
									<Pill
										tone={
											booking.status === "confirmed" ||
											booking.status === "in_progress"
												? "primary"
												: booking.status === "pending"
													? "amber"
													: "slate"
										}
									>
										{bookingStatusLabels[booking.status] || booking.status}
									</Pill>
								</td>
								<td className="px-4 py-3 text-right font-semibold text-slate-950">
									{formatCurrency(booking.priceTotal)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			{bookings.length === 0 && (
				<p className="border-t border-slate-100 p-8 text-center text-sm text-slate-500">
					Nenhuma reserva encontrada.
				</p>
			)}
		</div>
	);
}

function Overview({ data, onNavigate, action }) {
	const actions = data.overview?.actionsToday || data.today || {};

	return (
		<div className="space-y-5">
			<SectionHeader
				eyebrow="Resumo"
				title="Resumo do dia"
				description="Os sinais mais importantes da sua operação, em leitura rápida."
				action={action}
			/>
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
				<MetricCard
					label="Entradas previstas"
					value={actions.checkins || 0}
					helper="para hoje"
					tone="green"
					icon={DoorOpen}
				/>
				<MetricCard
					label="Saídas previstas"
					value={actions.checkouts || 0}
					helper="para hoje"
					tone="amber"
					icon={Clock3}
				/>
				<MetricCard
					label="Reservas que pedem atenção"
					value={actions.pendingBookings || 0}
					helper="ainda aguardando seu retorno"
					tone="blue"
					icon={MessageCircle}
				/>
				<MetricCard
					label="Imóveis com alerta"
					value={actions.propertiesWithAlerts || 0}
					helper="precisam de revisão"
					tone="violet"
					icon={AlertTriangle}
				/>
			</div>

			<div className="mt-5 grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_360px]">
				<div className="min-w-0 space-y-5">
					<MovementsBoard movements={data.upcomingMovements} />
					<FinanceSummary
						finance={data.overview?.financialSummary || data.finance}
					/>
					<ChartsPanel
						charts={data.charts}
						properties={data.operationalProperties || []}
					/>
				</div>
				<div className="min-w-0 space-y-5">
					<AlertsPanel alerts={data.priorityAlerts} />
					<PanelCard title="Agenda compacta">
						<div className="mb-4 flex justify-end">
							<button
								type="button"
								onClick={() => onNavigate("agenda")}
								className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700"
							>
								Abrir agenda
								<ChevronRight className="h-4 w-4" />
							</button>
						</div>
						<CalendarGridMonth calendar={data.calendar} compact />
					</PanelCard>
				</div>
			</div>
		</div>
	);
}

function Agenda({ data, action }) {
	return (
		<div className="space-y-5">
			<SectionHeader
				eyebrow="Agenda"
				title="Agenda do dia"
				description="Veja entradas, saídas e permanências no calendário."
				action={action}
			/>
			<PanelCard>
				<CalendarGridMonth calendar={data.calendar} />
			</PanelCard>
			<MovementsBoard movements={data.upcomingMovements} />
		</div>
	);
}

function PlacesSection({ properties = [], action }) {
	return (
		<div className="space-y-5">
			<SectionHeader
				eyebrow="Imóveis"
				title="Seus imóveis"
				description="Acompanhe o desempenho, a ocupação e os sinais de atenção de cada imóvel."
				action={
					<div className="flex items-center gap-2">
						<Link
							to="/account/places/new"
							className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
						>
							<Plus className="h-4 w-4" />
							Nova acomodação
						</Link>
						{action}
					</div>
				}
			/>
			<div className="space-y-4">
				{properties.map((property) => (
					<PropertyCard key={property.id} property={property} />
				))}
				{properties.length === 0 && (
					<EmptyState
						icon={Building2}
						title="Nenhuma acomodação cadastrada"
						description="Cadastre a primeira acomodação para começar a acompanhar operação, reservas e desempenho."
					/>
				)}
			</div>
		</div>
	);
}

function Finance({ data, action }) {
	return (
		<div className="space-y-5">
			<SectionHeader
				eyebrow="Financeiro"
				title="Seu dinheiro"
				description="Leitura simples do que já entrou, do que ainda vem e do que sai."
				action={action}
			/>
			<FinanceSummary finance={data.finance} />
			<ChartsPanel
				charts={data.charts}
				properties={data.operationalProperties || []}
			/>
		</div>
	);
}

function FutureSection({ type, action }) {
	const content = {
		"pre-checkin": {
			icon: ShieldCheck,
			title: "Pré-check-in",
			description:
				"Esta área será usada futuramente para documentos, dados do hóspede, confirmações e regras da casa.",
		},
		cleaning: {
			icon: ClipboardCheck,
			title: "Limpeza e vistoria",
			description:
				"Esta área será usada futuramente para checklists, fotos, prazos e status operacional entre estadias.",
		},
		maintenance: {
			icon: Wrench,
			title: "Manutenção e danos",
			description:
				"Esta área será usada futuramente para ocorrências, evidências, responsáveis e custos associados.",
		},
		reports: {
			icon: FileBarChart,
			title: "Relatórios",
			description:
				"Esta área será usada futuramente para exportações e relatórios para proprietário, co-host e operação.",
		},
	}[type];

	return (
		<div className="space-y-5">
			<SectionHeader
				eyebrow="Em breve"
				title={content.title}
				description="Área em construção para uso futuro."
				action={action}
			/>
			<EmptyState
				icon={content.icon}
				title={`${content.title} será ativado em uma próxima etapa`}
				description={content.description}
			/>
		</div>
	);
}
function HostCenter({
	initialView = "overview",
	activeSection: controlledActiveSection,
}) {
	const [internalActiveSection, setInternalActiveSection] =
		useState(initialView);
	const [payload, setPayload] = useState(null);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState("");
	const activeSection = controlledActiveSection ?? internalActiveSection;

	const loadDashboard = useCallback(async ({ silent = false } = {}) => {
		try {
			if (!silent) {
				setLoading(true);
			}
			setError("");
			const data = await getHostDashboard();
			setPayload(data);
		} catch (err) {
			console.error("Erro ao carregar central do anfitrião:", err);
			setError("Não foi possível carregar a Central do Anfitrião agora.");
		} finally {
			if (!silent) {
				setLoading(false);
			}
		}
	}, []);

	useEffect(() => {
		if (!controlledActiveSection) {
			setInternalActiveSection(initialView);
		}
	}, [controlledActiveSection, initialView]);

	useEffect(() => {
		loadDashboard();
	}, [loadDashboard]);

	useEffect(() => {
		const refreshSilently = () => loadDashboard({ silent: true });
		const handleVisibilityChange = () => {
			if (document.visibilityState === "visible") {
				refreshSilently();
			}
		};

		window.addEventListener("focus", refreshSilently);
		document.addEventListener("visibilitychange", handleVisibilityChange);
		const intervalId = window.setInterval(refreshSilently, 30000);

		return () => {
			window.removeEventListener("focus", refreshSilently);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			window.clearInterval(intervalId);
		};
	}, [loadDashboard]);

	const handleSectionChange = (sectionId) => {
		setInternalActiveSection(sectionId);
	};

	const handleRefresh = async () => {
		if (refreshing) return;
		setRefreshing(true);
		try {
			await loadDashboard({ silent: true });
		} finally {
			setRefreshing(false);
		}
	};

	const refreshAction = (
		<button
			type="button"
			onClick={handleRefresh}
			disabled={refreshing}
			className="inline-flex cursor-pointer h-10 items-center gap-2 rounded-xl border border-slate-200/70 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
		>
			<RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
			Atualizar
		</button>
	);

	if (loading) {
		return (
			<div className="flex min-h-[70vh] items-center justify-center ">
				<div className="text-center">
					<div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-950" />
					<p className="mt-4 text-sm font-medium text-slate-500">
						Carregando Central do Anfitrião...
					</p>
				</div>
			</div>
		);
	}

	if (error || !payload) {
		return (
			<div className="flex min-h-[70vh] items-center justify-center ">
				<div className="rounded-[20px] border border-red-100 bg-white p-6 text-center shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
					<p className="font-semibold text-red-700">{error}</p>
					<button
						type="button"
						onClick={() => window.location.reload()}
						className="mt-4 h-10 rounded-xl bg-primary-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
					>
						Tentar novamente
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen w-full  text-slate-950">
			<MobileNav activeSection={activeSection} onChange={handleSectionChange} />
			<div className="mx-auto flex min-w-0 max-w-[1480px] items-start gap-4 px-4 py-4 sm:px-6 lg:px-8">
				<Sidebar activeSection={activeSection} onChange={handleSectionChange} />
				<main className="min-w-0 flex-1 overflow-hidden">
					{activeSection === "overview" && (
						<Overview
							data={payload}
							onNavigate={handleSectionChange}
							action={refreshAction}
						/>
					)}
					{activeSection === "agenda" && (
						<Agenda data={payload} action={refreshAction} />
					)}
					{activeSection === "reservations" && (
						<div>
							<SectionHeader
								eyebrow="Reservas"
								title="Reservas"
								description="Lista operacional de reservas e respectivos status."
								action={refreshAction}
							/>
							<ReservationsTable bookings={payload.bookings} />
						</div>
					)}
					{activeSection === "places" && (
						<PlacesSection
							properties={payload.operationalProperties || []}
							action={refreshAction}
						/>
					)}
					{activeSection === "pre-checkin" && (
						<FutureSection type="pre-checkin" action={refreshAction} />
					)}
					{activeSection === "cleaning" && (
						<FutureSection type="cleaning" action={refreshAction} />
					)}
					{activeSection === "finance" && (
						<Finance data={payload} action={refreshAction} />
					)}
					{activeSection === "maintenance" && (
						<FutureSection type="maintenance" action={refreshAction} />
					)}
					{activeSection === "reports" && (
						<FutureSection type="reports" action={refreshAction} />
					)}
					{activeSection === "logbook" && (
						<div>
							<SectionHeader
								eyebrow="Histórico"
								title="Histórico operacional"
								description="Logbook de eventos e registros das acomodações."
								action={refreshAction}
							/>
							<AccommodationLogbook />
						</div>
					)}
				</main>
			</div>
		</div>
	);
}

export default HostCenter;
