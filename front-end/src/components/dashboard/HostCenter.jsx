import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
	DangerTriangle as AlertTriangle,
	ArrowRightUp as ArrowUpRight,
	Banknote,
	Chart as BarChart3,
	Book as BookOpen,
	Buildings as Building2,
	Calendar as CalendarDays,
	AltArrowRight as ChevronRight,
	CheckCircle as CheckCircle2,
	ClockCircle as Clock3,
	ClipboardCheck,
	Login3 as DoorOpen,
	Graph as FileBarChart,
	Gallery,
	Home,
	Broom,
	Logout3,
	Ticket,
	GraphUp as LineChartIcon,
	HamburgerMenu as Menu,
	ChatRoundDots as MessageCircle,
	Paperclip,
	AddCircle as Plus,
	Refresh as RefreshCw,
	ShieldCheck,
	Stars as Sparkles,
	Tuning as Wrench,
	Wallet as WalletIcon,
	CloseCircle as X,
} from "@solar-icons/react";
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

const navigation = [
	{ id: "overview", label: "Visão geral", icon: Home },
	{ id: "agenda", label: "Agenda", icon: CalendarDays },
	{ id: "reservations", label: "Reservas", icon: Ticket },
	{ id: "places", label: "Acomodações", icon: Building2 },
	{ id: "pre-checkin", label: "Pré-check-in", icon: ShieldCheck },
	{ id: "cleaning", label: "Limpeza e vistoria", icon: ClipboardCheck },
	{ id: "finance", label: "Financeiro", icon: Banknote },
	{ id: "maintenance", label: "Manutenção e danos", icon: Wrench },
	{ id: "reports", label: "Relatórios", icon: FileBarChart },
	{ id: "logbook", label: "Histórico", icon: BookOpen },
];

const groupedNavigation = [
	{
		label: "Principal",
		itemIds: ["overview", "agenda", "reservations", "places"],
	},
	{
		label: "Operação",
		itemIds: ["pre-checkin", "cleaning", "maintenance"],
	},
	{
		label: "Gestão",
		itemIds: ["finance", "reports", "logbook"],
	},
].map((group) => ({
	...group,
	items: group.itemIds
		.map((id) => navigation.find((item) => item.id === id))
		.filter(Boolean),
}));

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

const preCheckinFilters = [
	{ key: "all", label: "Todos" },
	{ key: "pending", label: "Pendentes" },
	{ key: "sent", label: "Enviados" },
	{ key: "in_review", label: "Em análise" },
	{ key: "approved", label: "Aprovados" },
	{ key: "rejected", label: "Reprovados" },
];

const preCheckinStatusLabels = {
	pending: "Pendente",
	pendente: "Pendente",
	sent: "Enviado",
	enviado: "Enviado",
	in_review: "Em análise",
	em_analise: "Em análise",
	review: "Em análise",
	approved: "Aprovado",
	aprovado: "Aprovado",
	rejected: "Reprovado",
	reprovado: "Reprovado",
	missing: "Faltando",
	faltando: "Faltando",
	accepted: "Aceitas",
	aceitas: "Aceitas",
};

const cleaningInspectionFilters = [
	{ key: "all", label: "Todos" },
	{ key: "awaiting_cleaning", label: "Aguardando limpeza" },
	{ key: "cleaning_in_progress", label: "Em limpeza" },
	{ key: "awaiting_inspection", label: "Aguardando vistoria" },
	{ key: "approved", label: "Aprovados" },
	{ key: "blocked", label: "Bloqueados" },
];

const cleaningInspectionStatusLabels = {
	awaiting_cleaning: "Aguardando limpeza",
	cleaning_in_progress: "Em limpeza",
	awaiting_inspection: "Aguardando vistoria",
	approved: "Aprovado para entrada",
	blocked: "Bloqueado",
	done: "Concluída",
	not_required: "Não necessária",
	pending: "Pendente",
	issue: "Com ocorrência",
	not_applicable: "Não se aplica",
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
	red: {
		iconBg: "bg-red-50",
		iconText: "text-red-600",
		trendBg: "bg-red-50",
		trendText: "text-red-700",
	},
	slate: {
		iconBg: "bg-slate-100",
		iconText: "text-slate-700",
		trendBg: "bg-slate-100",
		trendText: "text-slate-700",
	},
};

const getTone = (tone = "blue") => toneMap[tone] || toneMap.blue;

const firstAvailable = (...values) =>
	values.find((value) => value !== undefined && value !== null && value !== "");

const normalizeStatusKey = (status) => {
	const raw = String(status || "")
		.trim()
		.toLowerCase();
	if (!raw) return "";
	return raw
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[\s-]+/g, "_");
};

const getStatusLabel = (status) => {
	const key = normalizeStatusKey(status);
	return preCheckinStatusLabels[key] || status || "Indisponível";
};

const getCleaningInspectionStatusLabel = (status) => {
	const key = normalizeStatusKey(status);
	return cleaningInspectionStatusLabels[key] || status || "Indisponível";
};

const getCanonicalPreCheckinStatus = (status) => {
	const key = normalizeStatusKey(status);
	if (["pending", "pendente"].includes(key)) return "pending";
	if (["sent", "enviado"].includes(key)) return "sent";
	if (["in_review", "em_analise", "review"].includes(key)) return "in_review";
	if (["approved", "aprovado", "accepted", "aceitas"].includes(key))
		return "approved";
	if (["rejected", "reprovado"].includes(key)) return "rejected";
	return key;
};

const getPreCheckinPayload = (data = {}) =>
	data.preCheckin || data.preCheckins || data.preCheckinOverview || {};

const getPreCheckinItems = (preCheckinPayload) => {
	if (Array.isArray(preCheckinPayload)) return preCheckinPayload;
	if (Array.isArray(preCheckinPayload.items)) return preCheckinPayload.items;
	if (Array.isArray(preCheckinPayload.records))
		return preCheckinPayload.records;
	if (Array.isArray(preCheckinPayload.list)) return preCheckinPayload.list;
	return [];
};

const getPreCheckinSummaryItems = (preCheckinPayload) => {
	const summary =
		preCheckinPayload.summary?.items ||
		preCheckinPayload.summaryCards ||
		preCheckinPayload.cards ||
		[];
	if (Array.isArray(summary) && summary.length > 0) return summary;

	return [
		{ key: "pending", label: "Pré-check-ins pendentes", available: false },
		{ key: "documentsSent", label: "Documentos enviados", available: false },
		{ key: "documentsMissing", label: "Documentos faltando", available: false },
		{
			key: "upcomingWithIssues",
			label: "Check-ins próximos com pendência",
			available: false,
		},
		{
			key: "houseRulesAccepted",
			label: "Regras da casa aceitas",
			available: false,
		},
	];
};

const getGuestName = (item = {}) =>
	firstAvailable(
		item.guest?.name,
		item.user?.name,
		item.booking?.user?.name,
		item.guestName,
		item.name,
	);

const getAccommodationName = (item = {}) =>
	firstAvailable(
		item.place?.title,
		item.accommodation?.title,
		item.booking?.place?.title,
		item.placeTitle,
		item.accommodationName,
	);

const getPreCheckinStatus = (item = {}) =>
	firstAvailable(item.status, item.preCheckinStatus, item.statusPreCheckin);

const getDocumentStatus = (item = {}) =>
	firstAvailable(
		item.documentsStatus,
		item.documentStatus,
		item.documents?.status,
		item.documentosStatus,
	);

const getRulesStatus = (item = {}) =>
	firstAvailable(
		item.houseRulesStatus,
		item.rulesStatus,
		item.rulesAcceptedStatus,
		item.houseRulesAccepted,
	);

const getCleaningInspectionPayload = (data = {}) =>
	data.cleaningInspection || data.cleaningAndInspection || data.cleaning || {};

const getCleaningInspectionItems = (payload = {}) => {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload.items)) return payload.items;
	if (Array.isArray(payload.records)) return payload.records;
	if (Array.isArray(payload.list)) return payload.list;
	return [];
};

const getCleaningInspectionSummaryItems = (payload = {}) => {
	const summary =
		payload.summary?.items || payload.summaryCards || payload.cards || [];
	if (Array.isArray(summary) && summary.length > 0) return summary;

	return [
		{ key: "pendingCleanings", label: "Limpezas pendentes", available: false },
		{
			key: "cleaningInProgress",
			label: "Limpezas em andamento",
			available: false,
		},
		{
			key: "pendingInspections",
			label: "Vistorias pendentes",
			available: false,
		},
		{
			key: "approvedForCheckin",
			label: "Imóveis aprovados para entrada",
			available: false,
		},
		{ key: "blockedProperties", label: "Imóveis bloqueados", available: false },
	];
};

const getCleaningPlaceName = (item = {}) =>
	firstAvailable(
		item.place?.title,
		item.accommodation?.title,
		item.placeTitle,
		item.accommodationName,
	);

const getCleaningOverallStatus = (item = {}) =>
	firstAvailable(item.overallStatus, item.status);

const getCleaningStatus = (item = {}) =>
	firstAvailable(item.cleaningStatus, item.cleaning?.status);

const getInspectionStatus = (item = {}) =>
	firstAvailable(item.inspectionStatus, item.inspection?.status);

const kpiIconMap = {
	checkinsToday: DoorOpen,
	checkoutsToday: Logout3,
	pendingBookings: MessageCircle,
	pendingPreCheckins: ShieldCheck,
	pendingCleanings: ClipboardCheck,
	propertiesWithAlerts: AlertTriangle,
	pendingInspections: ClipboardCheck,
	openIncidents: Wrench,
	criticalAlerts: AlertTriangle,
	monthlyGrossRevenue: Banknote,
	operatingExpenses: AlertTriangle,
	estimatedProfit: LineChartIcon,
	futureRevenue: Banknote,
	availableNightEarnings: BarChart3,
	activeProperties: Building2,
	occupancyRate: BarChart3,
	averageRating: CheckCircle2,
	averageDailyRate: Banknote,
	cleaningInProgress: RefreshCw,
	approvedForCheckin: CheckCircle2,
	blockedProperties: AlertTriangle,
};

const formatKpiValue = (item) => {
	if (!item?.available) return "Indisponível";
	if (item.value === null || item.value === undefined) return "Sem dados";

	if (item.format === "currency") return formatCurrency(item.value);
	if (item.format === "percent")
		return `${Math.round(Number(item.value || 0))}%`;
	if (item.format === "rating") return Number(item.value).toFixed(1);

	return item.value;
};

function OverviewKpiCard({ item }) {
	const Icon = kpiIconMap[item.key] || BarChart3;
	const palette = getTone(item.available ? item.tone : "slate");
	const isUnavailable = !item.available;

	return (
		<article
			className={`min-w-0 rounded-[18px] border p-4 transition-colors ${
				isUnavailable
					? "border-dashed border-slate-300 bg-slate-50/80"
					: "border-slate-200/70 bg-white shadow-[0_8px_20px_rgba(15,23,42,0.05)] hover:border-slate-300"
			}`}
		>
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="text-[13px] font-medium text-slate-500">{item.label}</p>
					<p
						className={`mt-3 truncate font-semibold tracking-tight ${
							isUnavailable
								? "text-lg text-slate-500"
								: "text-[28px] leading-none text-slate-950"
						}`}
					>
						{formatKpiValue(item)}
					</p>
				</div>
				<span
					className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${palette.iconBg} ${palette.iconText}`}
				>
					<Icon className="h-5 w-5" weight="BoldDuotone" />
				</span>
			</div>
			{item.helper && (
				<p className="mt-3 text-xs leading-5 text-slate-500">{item.helper}</p>
			)}
		</article>
	);
}

function OverviewKpiGroup({
	eyebrow,
	title,
	description,
	items = [],
	columns = "xl:grid-cols-4",
}) {
	return (
		<PanelCard className="p-5">
			<div className="mb-4">
				<p className="text-xs font-semibold uppercase tracking-wide text-primary-700">
					{eyebrow}
				</p>
				<h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
					{title}
				</h3>
				<p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
					{description}
				</p>
			</div>
			<div className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${columns}`}>
				{items.map((item) => (
					<OverviewKpiCard key={item.key} item={item} />
				))}
			</div>
		</PanelCard>
	);
}

const unavailableKpi = (
	key,
	label,
	helper = "Dados indisponíveis no back-end atual",
) => ({
	key,
	label,
	value: null,
	format: "number",
	helper,
	tone: "slate",
	status: "unavailable",
	available: false,
});

const getOverviewKpi = (overview, groupKey, itemKey, overrides = {}) => {
	const item = overview?.[groupKey]?.items?.find(
		(entry) => entry.key === itemKey,
	);
	return item
		? { ...item, ...overrides }
		: unavailableKpi(itemKey, overrides.label || "Indicador indisponível");
};

function MovementSummaryCard({
	title,
	event,
	icon: Icon,
	emptyText,
	onNavigate,
	section,
}) {
	return (
		<article className="rounded-[18px] flex flex-col justify-end border border-slate-200/70 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
			<div className="flex flex-1 items-start justify-between gap-3">
				<div className="min-w-0 flex-1">
					<p className="text-[13px] font-medium text-slate-500">{title}</p>
					{event ? (
						<>
							<p className="mt-3 truncate text-lg font-semibold tracking-tight text-slate-950">
								{event.guest || event.placeTitle || "Movimentação"}
							</p>
							<p className="mt-1 truncate text-xs text-slate-500">
								{event.placeTitle || "Acomodação"} ·{" "}
								{formatDateTime(event.startDate)}
							</p>
						</>
					) : (
						<p className="mt-3 text-sm font-medium text-slate-500">
							{emptyText}
						</p>
					)}
				</div>
				<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
					<Icon className="h-5 w-5" weight="BoldDuotone" />
				</span>
			</div>
			<button
				type="button"
				onClick={() => onNavigate(section)}
				className=" mt-4 cursor-pointer group flex justify-between items-center gap-1 text-sm font-semibold text-primary-700"
			>
				<p className="group-hover:underline">Ver detalhes</p>
				<ArrowUpRight className="bg-primary-100 group-hover:bg-primary-500 group-hover:text-white transition-all text-primary-500 rounded-full p-1 h-6 w-6" />
			</button>
		</article>
	);
}

function UpcomingSummary({ movementGroups, onNavigate }) {
	const nextCheckin = movementGroups?.checkins?.[0] || null;
	const nextCheckout = movementGroups?.checkouts?.[0] || null;

	return (
		<PanelCard
			title="Próximas movimentações"
			description="O próximo ponto de agenda que merece conferência."
		>
			<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
				<MovementSummaryCard
					title="Próximo check-in"
					event={nextCheckin}
					icon={DoorOpen}
					emptyText="Nenhum check-in previsto"
					onNavigate={onNavigate}
					section="agenda"
				/>
				<MovementSummaryCard
					title="Próximo check-out"
					event={nextCheckout}
					icon={Logout3}
					emptyText="Nenhum check-out previsto"
					onNavigate={onNavigate}
					section="agenda"
				/>
				<MovementSummaryCard
					title="Próxima limpeza"
					event={null}
					icon={Broom}
					emptyText="Dados indisponíveis"
					onNavigate={onNavigate}
					section="cleaning"
				/>
				<MovementSummaryCard
					title="Reserva pendente urgente"
					event={null}
					icon={MessageCircle}
					emptyText="Dados indisponíveis"
					onNavigate={onNavigate}
					section="reservations"
				/>
			</div>
		</PanelCard>
	);
}

function OverviewShortcuts({ onNavigate }) {
	const shortcuts = [
		{ label: "Abrir agenda", section: "agenda", icon: CalendarDays },
		{ label: "Ver reservas", section: "reservations", icon: Ticket },
		{ label: "Limpeza e vistoria", section: "cleaning", icon: Broom },
		{ label: "Ver financeiro", section: "finance", icon: Banknote },
	];

	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
			{shortcuts.map((shortcut) => {
				const Icon = shortcut.icon;
				return (
					<button
						key={shortcut.section}
						type="button"
						onClick={() => onNavigate(shortcut.section)}
						className="flex min-h-12 group  cursor-pointer items-center justify-between gap-3 rounded-[16px] border border-slate-200/70 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition-colors hover:border-primary-200 hover:bg-primary-50/50 hover:text-primary-900"
					>
						<span className="inline-flex items-center gap-2">
							<Icon className="h-4 w-4" weight="BoldDuotone" />
							{shortcut.label}
						</span>
						<ChevronRight className="h-6 w-6 group-hover:bg-primary-500 rounded-full transition-all duration-700 group-hover:text-white p-1" />
					</button>
				);
			})}
		</div>
	);
}

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
						<Icon className="h-5 w-5" weight="BoldDuotone" />
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

function PreCheckinStatusBadge({ status }) {
	const key = getCanonicalPreCheckinStatus(status);
	const tone =
		key === "approved"
			? "green"
			: key === "rejected" || key === "missing" || key === "faltando"
				? "red"
				: key === "sent" || key === "in_review"
					? "blue"
					: key === "pending"
						? "amber"
						: "slate";

	return <Pill tone={tone}>{getStatusLabel(status)}</Pill>;
}

function CleaningInspectionStatusBadge({ status }) {
	const key = normalizeStatusKey(status);
	const tone =
		key === "approved" || key === "done"
			? "green"
			: key === "blocked" || key === "issue"
				? "red"
				: key === "cleaning_in_progress"
					? "blue"
					: key === "awaiting_cleaning" ||
						  key === "awaiting_inspection" ||
						  key === "pending"
						? "amber"
						: "slate";

	return <Pill tone={tone}>{getCleaningInspectionStatusLabel(status)}</Pill>;
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
					<Icon className="h-4 w-4" weight="BoldDuotone" />
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
				<Icon className="h-6 w-6" weight="BoldDuotone" />
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
		<aside className="hidden w-64 shrink-0 border pl-2.5 py-5 rounded-3xl h-fit border-slate-200 bg-white lg:block">
			<div className="sticky top-0 flex flex-col overflow-y-auto">
				<div className="mb-6 px-4">
					<h1 className="mt-1 text-xl font-semibold text-slate-950">
						Central do Anfitrião
					</h1>
				</div>
				<nav className="space-y-6 pb-5">
					{groupedNavigation.map((group) => (
						<div key={group.label} className="space-y-1">
							<p className="px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
								{group.label}
							</p>
							{group.items.map((item) => {
								const Icon = item.icon;
								const isActive = activeSection === item.id;
								return (
									<button
										key={item.id}
										type="button"
										onClick={() => onChange(item.id)}
										className={`flex h-11 w-full cursor-pointer rounded-l-2xl items-center gap-3 border-r-2 px-3 text-left text-sm font-medium transition-colors ${
											isActive
												? "border-primary-900 bg-primary-50/70 text-primary-900"
												: "border-transparent text-slate-600 hover:border-primary-300 hover:bg-slate-50 hover:text-primary-900"
										}`}
									>
										<Icon className="h-4 w-4 shrink-0" weight="BoldDuotone" />
										<span className="truncate">{item.label}</span>
									</button>
								);
							})}
						</div>
					))}
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
						<div className="space-y-5">
							{groupedNavigation.map((group) => (
								<div key={group.label} className="space-y-1">
									<p className="px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
										{group.label}
									</p>
									{group.items.map((item) => {
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
												<Icon className="h-4 w-4" weight="BoldDuotone" />
												{item.label}
											</button>
										);
									})}
								</div>
							))}
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
			title="Alertas críticos e oportunidades"
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

function MovementsBoard({ groups }) {
	const checkins = groups?.checkins || [];
	const checkouts = groups?.checkouts || [];

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
	const monthlyGrossRevenue =
		finance?.monthlyGrossRevenue ?? finance?.monthlyEarnings;
	const futureRevenue = finance?.futureRevenue ?? finance?.futureEarnings;
	const operatingExpenses = finance?.operatingExpenses ?? finance?.totalFees;
	const estimatedProfit = finance?.estimatedProfit;
	const availableNightEarnings =
		finance?.availableNightEarnings ?? finance?.revPAR;

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
			<MetricCard
				label="Receita bruta do mês"
				value={formatCurrency(monthlyGrossRevenue)}
				helper="reservas aprovadas com check-out no mês"
				tone="green"
				icon={Banknote}
			/>
			<MetricCard
				label="Receita futura"
				value={formatCurrency(futureRevenue)}
				helper="reservas futuras confirmadas e aprovadas"
				tone="blue"
				icon={LineChartIcon}
			/>
			<MetricCard
				label="Despesas operacionais"
				value={formatCurrency(operatingExpenses)}
				helper="custos conhecidos da operação"
				tone="amber"
				icon={AlertTriangle}
			/>
			<MetricCard
				label="Lucro estimado"
				value={formatCurrency(estimatedProfit)}
				helper="receita bruta menos despesas operacionais"
				tone="violet"
				icon={BarChart3}
			/>
			<MetricCard
				label="Ganho por noite disponível"
				value={formatCurrency(availableNightEarnings)}
				helper="receita bruta mensal por noite disponível"
				tone="slate"
				icon={LineChartIcon}
			/>
		</div>
	);
}

const financialStatusLabels = {
	approved: "Aprovado",
	pending: "Pendente",
	received: "Recebido",
	refunded: "Reembolsado",
	canceled: "Cancelado",
	rejected: "Cancelado",
	in_review: "Em análise",
};

const getFinancialTone = (item = {}) => {
	if (item.available === false) return "slate";
	return item.tone || "slate";
};

const formatFinancialValue = (item = {}) => {
	if (item.available === false) return "Indisponível";
	if (item.value === null || item.value === undefined) return "Sem dados";
	if (item.format === "percent") return `${Number(item.value).toFixed(1)}%`;
	if (item.format === "number") return item.value;
	return formatCurrency(item.value);
};

function FinancialStatusBadge({ status }) {
	const key = normalizeStatusKey(status);
	const tone =
		key === "approved" || key === "received"
			? "green"
			: key === "pending" || key === "in_review"
				? "amber"
				: key === "refunded"
					? "blue"
					: key === "canceled" || key === "rejected"
						? "red"
						: "slate";

	return (
		<Pill tone={tone}>
			{financialStatusLabels[key] || status || "Indisponível"}
		</Pill>
	);
}

function FinancialSummaryCards({ items = [] }) {
	if (items.length === 0) {
		return (
			<EmptyState
				icon={Banknote}
				title="Resumo financeiro indisponível"
				description="Quando o back-end enviar os indicadores financeiros consolidados, eles aparecerão aqui."
			/>
		);
	}

	const iconMap = {
		monthlyGrossRevenue: Banknote,
		monthlyNetRevenue: WalletIcon,
		operatingExpenses: AlertTriangle,
		estimatedProfit: LineChartIcon,
		futureRevenue: Clock3,
		availableNightEarnings: BarChart3,
	};

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3">
			{items.map((item) => {
				const Icon = iconMap[item.key] || Banknote;
				return (
					<MetricCard
						key={item.key || item.label}
						label={item.label}
						value={formatFinancialValue(item)}
						helper={item.helper}
						tone={getFinancialTone(item)}
						icon={Icon}
					/>
				);
			})}
		</div>
	);
}

function FinancialFilterTabs({ filters = [], activeFilter, onChange }) {
	const visibleFilters =
		filters.length > 0
			? filters
			: [
					{ key: "current_month", label: "Mês atual" },
					{ key: "previous_month", label: "Mês anterior" },
					{ key: "upcoming_receivables", label: "Próximos recebimentos" },
					{ key: "by_property", label: "Por acomodação" },
					{ key: "by_payment_status", label: "Por status do pagamento" },
				];

	return (
		<div className="flex gap-2 overflow-x-auto pb-1">
			{visibleFilters.map((filter) => (
				<button
					key={filter.key}
					type="button"
					onClick={() => onChange(filter.key)}
					className={`h-9 shrink-0 rounded-full cursor-pointer border px-3 text-sm font-semibold transition-colors ${
						activeFilter === filter.key
							? "border-primary-900 bg-primary-900 text-white"
							: "border-slate-200 bg-white text-slate-600 hover:border-primary-200 hover:text-primary-900 hover:bg-primary-100"
					}`}
				>
					{filter.label}
				</button>
			))}
		</div>
	);
}

function FinancialMetricGrid({
	items = [],
	emptyTitle,
	emptyDescription,
	icon = Banknote,
}) {
	if (items.length === 0) {
		return (
			<EmptyState
				icon={icon}
				title={emptyTitle}
				description={emptyDescription}
			/>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
			{items.map((item) => (
				<MetricCardRow
					key={item.key || item.label}
					label={item.label}
					value={formatFinancialValue(item)}
					helper={item.helper}
					tone={getFinancialTone(item)}
					icon={item.available === false ? AlertTriangle : Banknote}
				/>
			))}
		</div>
	);
}

function FinancialRevenuePanel({ revenue }) {
	return (
		<PanelCard
			title="Receitas"
			description="Valores já consolidados pelo back-end para o período financeiro atual."
		>
			<FinancialMetricGrid
				items={revenue?.items || []}
				emptyTitle="Receitas indisponíveis"
				emptyDescription="Receita bruta, líquida, futura e pagamentos dependem do payload financeiro do back-end."
				icon={Banknote}
			/>
		</PanelCard>
	);
}

function FinancialExpensesPanel({ expenses }) {
	return (
		<PanelCard
			title="Despesas operacionais"
			description="Categorias de custo separadas para mostrar o que já existe e o que ainda precisa de modelagem financeira."
		>
			<FinancialMetricGrid
				items={expenses?.items || []}
				emptyTitle="Despesas indisponíveis"
				emptyDescription="Taxas, limpeza, manutenção, condomínio, IPTU, água, luz e internet dependem de dados do back-end."
				icon={AlertTriangle}
			/>
		</PanelCard>
	);
}

function FinancialProfitPanel({ profitability, comparison }) {
	return (
		<PanelCard
			title="Lucro e rentabilidade"
			description="Resultado estimado, margem e comparativo mensal já calculados pelo back-end."
		>
			<FinancialMetricGrid
				items={profitability?.items || []}
				emptyTitle="Rentabilidade indisponível"
				emptyDescription="Lucro, margem e comparativo mensal precisam vir consolidados pelo back-end."
				icon={LineChartIcon}
			/>
			{comparison?.previousMonth && (
				<div className="mt-4 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
					<p className="text-sm font-semibold text-slate-950">
						Mês atual vs mês anterior
					</p>
					<div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
						<DetailRow
							label="Receita bruta atual"
							value={formatCurrency(comparison.currentMonth?.grossRevenue)}
						/>
						<DetailRow
							label="Receita bruta anterior"
							value={formatCurrency(comparison.previousMonth?.grossRevenue)}
						/>
						<DetailRow
							label="Lucro estimado atual"
							value={formatCurrency(comparison.currentMonth?.estimatedProfit)}
						/>
						<DetailRow
							label="Lucro estimado anterior"
							value={formatCurrency(comparison.previousMonth?.estimatedProfit)}
						/>
					</div>
				</div>
			)}
		</PanelCard>
	);
}

function FinancialPropertyCard({ property }) {
	return (
		<article className="rounded-[20px] border border-slate-200/70 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="min-w-0">
					<h3 className="truncate text-lg font-semibold tracking-tight text-slate-950">
						{property.title || "Acomodação não informada"}
					</h3>
					<p className="mt-1 text-sm text-slate-500">
						{property.city || "Cidade indisponível"}
					</p>
				</div>
				<Pill
					tone={
						property.status === "critical"
							? "red"
							: property.status === "warning"
								? "amber"
								: "green"
					}
				>
					{property.statusLabel || "Indisponível"}
				</Pill>
			</div>
			<div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
				<MetricCardRow
					label="Receita bruta"
					value={formatCurrency(property.grossRevenue)}
					tone="green"
					icon={Banknote}
				/>
				<MetricCardRow
					label="Despesas"
					value={formatCurrency(property.expenses)}
					tone="amber"
					icon={AlertTriangle}
				/>
				<MetricCardRow
					label="Lucro estimado"
					value={formatCurrency(property.estimatedProfit)}
					tone="green"
					icon={LineChartIcon}
				/>
				<MetricCardRow
					label="Ocupação"
					value={
						property.occupancyRate !== null &&
						property.occupancyRate !== undefined
							? `${property.occupancyRate}%`
							: "Indisponível"
					}
					tone="blue"
					icon={BarChart3}
				/>
				<MetricCardRow
					label="Ganho por noite disponível"
					value={formatCurrency(property.availableNightEarnings)}
					tone="violet"
					icon={LineChartIcon}
				/>
			</div>
		</article>
	);
}

function FinancialPropertyList({ properties = [] }) {
	return (
		<PanelCard
			title="Custos por imóvel"
			description="Resultado financeiro por acomodação, já agrupado pelo back-end."
		>
			{properties.length > 0 ? (
				<div className="space-y-3">
					{properties.map((property) => (
						<FinancialPropertyCard
							key={property.id || property.title}
							property={property}
						/>
					))}
				</div>
			) : (
				<EmptyState
					icon={Building2}
					title="Custos por imóvel indisponíveis"
					description="Quando o back-end enviar receitas, despesas e lucro por acomodação, a lista aparecerá aqui."
				/>
			)}
		</PanelCard>
	);
}

function PaymentsRefundsList({ items = [] }) {
	return (
		<PanelCard
			title="Pagamentos e reembolsos"
			description="Movimentos financeiros vinculados a reservas e acomodações."
		>
			{items.length > 0 ? (
				<div className="overflow-x-auto">
					<table className="w-full min-w-[760px] text-left text-sm">
						<thead className="border-b border-slate-200/70 bg-primary-50/40 text-[11px] uppercase tracking-[0.18em] text-slate-500">
							<tr>
								<th className="px-4 py-3">Movimento</th>
								<th className="px-4 py-3">Reserva</th>
								<th className="px-4 py-3">Acomodação</th>
								<th className="px-4 py-3">Data</th>
								<th className="px-4 py-3">Status</th>
								<th className="px-4 py-3 text-right">Valor</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{items.map((item) => (
								<tr
									key={item.id}
									className="transition-colors hover:bg-primary-50/70"
								>
									<td className="px-4 py-3 font-medium text-slate-950">
										{item.label || "Movimento financeiro"}
									</td>
									<td className="px-4 py-3 text-slate-600">
										{item.reservation || item.bookingId || "Indisponível"}
									</td>
									<td className="px-4 py-3 text-slate-600">
										{item.placeTitle || "Acomodação indisponível"}
									</td>
									<td className="px-4 py-3 text-slate-600">
										{formatDate(item.date)}
									</td>
									<td className="px-4 py-3">
										<FinancialStatusBadge status={item.status} />
									</td>
									<td className="px-4 py-3 text-right font-semibold text-slate-950">
										{formatCurrency(item.value)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			) : (
				<EmptyState
					icon={Ticket}
					title="Pagamentos e reembolsos indisponíveis"
					description="Quando o back-end enviar pagamentos recebidos, pendentes e reembolsos por reserva, eles aparecerão aqui."
				/>
			)}
		</PanelCard>
	);
}

function ChartsPanel({ charts }) {
	const revenueData = charts?.revenueProjection || [];
	const propertyData = charts?.propertyPerformance || [];

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
	const overview = data.overview || {};

	return (
		<div className="space-y-5">
			<SectionHeader
				eyebrow="Visão geral"
				title="Central de decisão"
				description="Ações, riscos e dinheiro em uma leitura rápida para decidir o que fazer agora."
				action={action}
			/>
			<OverviewKpiGroup
				eyebrow="O que fazer hoje"
				title="Ações de hoje"
				description="Movimentos e pendências operacionais que precisam entrar primeiro na sua rotina."
				items={overview.actionsToday?.items || []}
				columns="xl:grid-cols-5"
			/>
			<OverviewKpiGroup
				eyebrow="Problemas agora"
				title="Riscos operacionais"
				description="Alertas que podem afetar hóspedes, imóveis ou a continuidade da operação."
				items={overview.operationalRisks?.items || []}
				columns="xl:grid-cols-4"
			/>

			<div className="mt-5 grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(360px,1fr)_360px]">
				<div className="min-w-0 space-y-5">
					<MovementsBoard groups={data.upcomingMovementGroups} />
					<OverviewKpiGroup
						eyebrow="Saúde financeira"
						title="Financeiro resumido"
						description="Receita, despesas conhecidas e projeção para entender margem e caixa futuro."
						items={overview.financialSummary?.items || []}
						columns="xl:grid-cols-5"
					/>
					<OverviewKpiGroup
						eyebrow="Performance dos imóveis"
						title="Desempenho geral"
						description="Indicadores consolidados para comparar se os imóveis estão performando bem."
						items={overview.performanceSummary?.items || []}
						columns="xl:grid-cols-4"
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
								className="inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-primary-700"
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

function OverviewCompact({ data, onNavigate, action }) {
	const overview = data.overview || {};
	const daySummaryItems = [
		getOverviewKpi(overview, "actionsToday", "checkinsToday", {
			label: "Entradas hoje",
		}),
		getOverviewKpi(overview, "actionsToday", "checkoutsToday", {
			label: "Saídas hoje",
		}),
		getOverviewKpi(overview, "actionsToday", "pendingBookings", {
			label: "Pendências",
		}),
		getOverviewKpi(overview, "operationalRisks", "criticalAlerts", {
			label: "Alertas críticos",
		}),
	];
	const attentionItems = [
		getOverviewKpi(overview, "operationalRisks", "propertiesWithAlerts", {
			label: "Imóveis com alerta",
		}),
		getOverviewKpi(overview, "actionsToday", "pendingCleanings", {
			label: "Limpezas pendentes",
		}),
		getOverviewKpi(overview, "operationalRisks", "pendingInspections", {
			label: "Vistorias pendentes",
		}),
		getOverviewKpi(overview, "operationalRisks", "openIncidents", {
			label: "Ocorrências abertas",
		}),
	];
	const financeItems = [
		getOverviewKpi(overview, "financialSummary", "monthlyGrossRevenue", {
			label: "Receita bruta do mês",
		}),
		getOverviewKpi(overview, "financialSummary", "estimatedProfit", {
			label: "Lucro estimado",
		}),
		getOverviewKpi(overview, "financialSummary", "futureRevenue", {
			label: "Receita futura",
		}),
	];
	const performanceItems = [
		getOverviewKpi(overview, "performanceSummary", "activeProperties", {
			label: "Imóveis ativos",
		}),
		getOverviewKpi(overview, "performanceSummary", "occupancyRate", {
			label: "Ocupação média",
		}),
		getOverviewKpi(overview, "performanceSummary", "averageRating", {
			label: "Avaliação média",
		}),
	];

	return (
		<div className="space-y-5">
			<SectionHeader
				eyebrow="Visão geral"
				title="Central de decisão"
				description="Somente o que ajuda a decidir agora. Detalhes ficam nas áreas específicas."
				action={action}
			/>
			<OverviewKpiGroup
				eyebrow="Hoje"
				title="Resumo do dia"
				description="Entradas, saídas, pendências e alertas que merecem a primeira checagem."
				items={daySummaryItems}
				columns="xl:grid-cols-4"
			/>
			<OverviewKpiGroup
				eyebrow="Atenção"
				title="Precisa da sua atenção"
				description="Sinais operacionais resumidos. A execução detalhada fica nas abas de operação."
				items={attentionItems}
				columns="xl:grid-cols-4"
			/>
			<UpcomingSummary
				movementGroups={data.upcomingMovementGroups}
				onNavigate={onNavigate}
			/>
			<div className="grid grid-cols-1 gap-5 2xl:grid-cols-2">
				<OverviewKpiGroup
					eyebrow="Financeiro"
					title="Resumo financeiro compacto"
					description="Apenas os três sinais financeiros essenciais."
					items={financeItems}
					columns="xl:grid-cols-2"
				/>
				<OverviewKpiGroup
					eyebrow="Performance"
					title="Desempenho geral compacto"
					description="Leitura rápida da carteira de imóveis."
					items={performanceItems}
					columns="xl:grid-cols-2 "
				/>
			</div>
			<OverviewShortcuts onNavigate={onNavigate} />
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
			<MovementsBoard groups={data.upcomingMovementGroups} />
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
	const [activeFilter, setActiveFilter] = useState("current_month");
	const financial = data.financial || {
		summaryCards: [],
		revenue: { items: [] },
		expenses: { items: [] },
		profitability: { items: [] },
		properties: [],
		paymentsRefunds: [],
		filters: [],
	};
	const showRevenue = activeFilter === "current_month";
	const showComparison = activeFilter === "previous_month";
	const showReceivables = activeFilter === "upcoming_receivables";
	const showProperties = activeFilter === "by_property";
	const showPaymentStatus = activeFilter === "by_payment_status";

	return (
		<div className="space-y-5">
			<SectionHeader
				eyebrow="Financeiro"
				title="Financeiro"
				description="Acompanhe receitas, despesas, lucro estimado e desempenho financeiro das suas acomodações."
				action={action}
			/>
			<FinancialSummaryCards
				items={
					financial.summaryCards?.length > 0
						? financial.summaryCards
						: [
								{
									key: "monthlyGrossRevenue",
									label: "Receita bruta do mês",
									value: data.finance?.monthlyGrossRevenue,
									helper: "Campo legado do dashboard",
									tone: "green",
								},
								{
									key: "operatingExpenses",
									label: "Despesas operacionais",
									value: data.finance?.operatingExpenses,
									helper: "Campo legado do dashboard",
									tone: "amber",
								},
								{
									key: "estimatedProfit",
									label: "Lucro estimado",
									value: data.finance?.estimatedProfit,
									helper: "Campo legado do dashboard",
									tone: "green",
								},
							]
				}
			/>

			<PanelCard
				title="Filtros financeiros"
				description="Os controles usam os recortes financeiros entregues pelo back-end; nenhum valor é recalculado na interface."
			>
				<FinancialFilterTabs
					filters={financial.filters}
					activeFilter={activeFilter}
					onChange={setActiveFilter}
				/>
			</PanelCard>

			{showRevenue && (
				<div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
					<FinancialRevenuePanel revenue={financial.revenue} />
					<FinancialExpensesPanel expenses={financial.expenses} />
					<div className="xl:col-span-2">
						<FinancialProfitPanel
							profitability={financial.profitability}
							comparison={financial.comparison}
						/>
					</div>
				</div>
			)}

			{showComparison && (
				<FinancialProfitPanel
					profitability={financial.profitability}
					comparison={financial.comparison}
				/>
			)}

			{showReceivables && (
				<PaymentsRefundsList items={financial.paymentsRefunds || []} />
			)}

			{showProperties && (
				<FinancialPropertyList properties={financial.properties || []} />
			)}

			{showPaymentStatus && (
				<PaymentsRefundsList items={financial.paymentsRefunds || []} />
			)}

			{financial.unavailableData?.length > 0 && (
				<PanelCard title="Dados financeiros ainda incompletos">
					<div className="space-y-2">
						{financial.unavailableData.map((item) => (
							<div
								key={item}
								className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-3 text-sm text-slate-600"
							>
								{item}
							</div>
						))}
					</div>
				</PanelCard>
			)}
		</div>
	);
}

function ReportsSection({ data, action }) {
	return (
		<div className="space-y-5">
			<SectionHeader
				eyebrow="Relatórios"
				title="Relatórios e tendências"
				description="Gráficos e comparações consolidadas para analisar dinheiro, ocupação e desempenho por imóvel."
				action={action}
			/>
			<ChartsPanel charts={data.charts} />
			<EmptyState
				icon={FileBarChart}
				title="Relatórios detalhados em construção"
				description="Exportações, comparativos mensais e relatórios operacionais podem ser conectados aqui quando o back-end enviar esses dados."
			/>
		</div>
	);
}

function PreCheckinSummaryCards({ items = [] }) {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
			{items.map((item) => {
				const Icon = kpiIconMap[item.key] || ShieldCheck;
				const available = item.available !== false;
				const palette = getTone(available ? item.tone || "blue" : "slate");
				return (
					<article
						key={item.key || item.label}
						className={`rounded-[18px] border p-4 ${
							available
								? "border-slate-200/70 bg-white shadow-[0_8px_20px_rgba(15,23,42,0.05)]"
								: "border-dashed border-slate-300 bg-slate-50/80"
						}`}
					>
						<div className="flex items-start justify-between gap-3">
							<div className="min-w-0">
								<p className="text-[13px] font-medium text-slate-500">
									{item.label}
								</p>
								<p
									className={`mt-3 truncate font-semibold tracking-tight ${
										available
											? "text-[26px] leading-none text-slate-950"
											: "text-lg text-slate-500"
									}`}
								>
									{available
										? firstAvailable(
												item.value,
												item.count,
												item.total,
												"Sem dados",
											)
										: "Indisponível"}
								</p>
							</div>
							<span
								className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${palette.iconBg} ${palette.iconText}`}
							>
								<Icon className="h-5 w-5" weight="BoldDuotone" />
							</span>
						</div>
						{item.helper && (
							<p className="mt-3 text-xs leading-5 text-slate-500">
								{item.helper}
							</p>
						)}
					</article>
				);
			})}
		</div>
	);
}

function PreCheckinCard({ item, onOpen }) {
	const status = getPreCheckinStatus(item);
	const documentStatus = getDocumentStatus(item);
	const rulesStatus = getRulesStatus(item);
	const checkinDate = firstAvailable(
		item.checkin,
		item.checkIn,
		item.checkinDate,
		item.booking?.checkin,
	);
	const arrivalTime = firstAvailable(
		item.arrivalTime,
		item.expectedArrivalTime,
		item.estimatedArrival,
		item.chegadaPrevista,
	);
	const guestCount = firstAvailable(
		item.guestCount,
		item.guests,
		item.booking?.guests,
		item.quantidadeHospedes,
	);
	const vehiclePlate = firstAvailable(
		item.vehiclePlate,
		item.plate,
		item.vehicle?.plate,
		item.veiculo?.placa,
	);

	return (
		<article className="rounded-[20px] border border-slate-200/70 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
			<div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-2">
						<h3 className="truncate text-lg font-semibold tracking-tight text-slate-950">
							{getGuestName(item) || "Hóspede não informado"}
						</h3>
						<PreCheckinStatusBadge status={status} />
					</div>
					<p className="mt-1 truncate text-sm text-slate-500">
						{getAccommodationName(item) || "Acomodação não informada"}
					</p>
				</div>
				<button
					type="button"
					onClick={() => onOpen(item)}
					className="inline-flex cursor-pointer h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
				>
					Ver detalhes
					<ChevronRight className="h-4 w-4" />
				</button>
			</div>

			<div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
				<MetricCardRow
					label="Check-in"
					value={formatDate(checkinDate)}
					tone="blue"
					icon={CalendarDays}
				/>
				<MetricCardRow
					label="Chegada prevista"
					value={arrivalTime || "Indisponível"}
					tone="slate"
					icon={Clock3}
				/>
				<MetricCardRow
					label="Hóspedes"
					value={guestCount ?? "Indisponível"}
					tone="violet"
					icon={Building2}
				/>
				<MetricCardRow
					label="Veículo/placa"
					value={vehiclePlate || "Não informado"}
					tone="slate"
					icon={ShieldCheck}
				/>
			</div>

			<div className="mt-4 flex flex-wrap gap-2">
				<PreCheckinStatusBadge
					status={documentStatus || "Documentos indisponíveis"}
				/>
				<PreCheckinStatusBadge status={rulesStatus || "Regras indisponíveis"} />
			</div>
		</article>
	);
}

function PreCheckinList({ items, onOpen }) {
	if (items.length === 0) {
		return (
			<EmptyState
				icon={ShieldCheck}
				title="Nenhum pré-check-in encontrado"
				description="Quando o back-end enviar pré-check-ins vinculados às reservas, eles aparecerão aqui para acompanhamento."
			/>
		);
	}

	return (
		<div className="space-y-3">
			{items.map((item, index) => (
				<PreCheckinCard
					key={item.id || item._id || item.bookingId || index}
					item={item}
					onOpen={onOpen}
				/>
			))}
		</div>
	);
}

function DetailRow({ label, value }) {
	return (
		<div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3">
			<p className="text-xs font-medium uppercase tracking-wide text-slate-500">
				{label}
			</p>
			<p className="mt-1 text-sm font-semibold text-slate-950">
				{value || "Indisponível"}
			</p>
		</div>
	);
}

function PreCheckinDetailsDrawer({ item, onClose }) {
	if (!item) return null;
	const documents = Array.isArray(item.documents) ? item.documents : [];
	const checkinDate = firstAvailable(
		item.checkin,
		item.checkIn,
		item.checkinDate,
		item.booking?.checkin,
	);
	const checkoutDate = firstAvailable(
		item.checkout,
		item.checkOut,
		item.booking?.checkout,
	);

	return (
		<div className="fixed inset-0 z-50 bg-slate-950/30">
			<div className="ml-auto flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-white p-5 shadow-2xl">
				<div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
					<div>
						<p className="text-xs font-semibold uppercase tracking-wide text-primary-700">
							Detalhe do pré-check-in
						</p>
						<h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
							{getGuestName(item) || "Hóspede não informado"}
						</h2>
						<p className="mt-1 text-sm text-slate-500">
							{getAccommodationName(item) || "Acomodação não informada"}
						</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				<div className="mt-5 space-y-5">
					<PanelCard title="Dados do hóspede">
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<DetailRow label="Nome" value={getGuestName(item)} />
							<DetailRow
								label="E-mail"
								value={firstAvailable(
									item.guest?.email,
									item.user?.email,
									item.email,
								)}
							/>
							<DetailRow
								label="Telefone"
								value={firstAvailable(
									item.guest?.phone,
									item.phone,
									item.telefone,
								)}
							/>
							<DetailRow
								label="Quantidade de hóspedes"
								value={firstAvailable(
									item.guestCount,
									item.guests,
									item.booking?.guests,
								)}
							/>
						</div>
					</PanelCard>

					<PanelCard title="Documentos">
						{documents.length > 0 ? (
							<div className="space-y-2">
								{documents.map((document, index) => (
									<div
										key={document.id || document.type || index}
										className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3"
									>
										<p className="text-sm font-semibold text-slate-950">
											{document.label || document.type || "Documento"}
										</p>
										<PreCheckinStatusBadge status={document.status} />
									</div>
								))}
							</div>
						) : (
							<p className="text-sm text-slate-500">
								Documentos indisponíveis no retorno atual da API.
							</p>
						)}
					</PanelCard>

					<PanelCard title="Informações de chegada">
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<DetailRow
								label="Data do check-in"
								value={formatDate(checkinDate)}
							/>
							<DetailRow
								label="Horário previsto"
								value={firstAvailable(
									item.arrivalTime,
									item.expectedArrivalTime,
									item.estimatedArrival,
								)}
							/>
							<DetailRow
								label="Veículo/placa"
								value={firstAvailable(
									item.vehiclePlate,
									item.plate,
									item.vehicle?.plate,
									item.veiculo?.placa,
								)}
							/>
							<DetailRow
								label="Observações"
								value={firstAvailable(
									item.notes,
									item.observations,
									item.observacoes,
								)}
							/>
						</div>
					</PanelCard>

					<PanelCard title="Regras da casa">
						<div className="flex flex-wrap items-center gap-3">
							<PreCheckinStatusBadge status={getRulesStatus(item)} />
							<p className="text-sm text-slate-500">
								O aceite detalhado depende dos campos enviados pelo back-end.
							</p>
						</div>
					</PanelCard>

					<PanelCard title="Reserva relacionada">
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<DetailRow
								label="Reserva"
								value={firstAvailable(
									item.bookingId,
									item.booking?._id,
									item.reservationId,
								)}
							/>
							<DetailRow
								label="Acomodação"
								value={getAccommodationName(item)}
							/>
							<DetailRow label="Check-in" value={formatDate(checkinDate)} />
							<DetailRow label="Check-out" value={formatDate(checkoutDate)} />
						</div>
					</PanelCard>
				</div>
			</div>
		</div>
	);
}

function PreCheckinSection({ data, action }) {
	const [activeFilter, setActiveFilter] = useState("all");
	const [selectedItem, setSelectedItem] = useState(null);
	const preCheckinPayload = getPreCheckinPayload(data);
	const items = getPreCheckinItems(preCheckinPayload);
	const summaryItems = getPreCheckinSummaryItems(preCheckinPayload);
	const filteredItems =
		activeFilter === "all"
			? items
			: items.filter(
					(item) =>
						getCanonicalPreCheckinStatus(getPreCheckinStatus(item)) ===
						activeFilter,
				);

	return (
		<div className="space-y-5">
			<SectionHeader
				eyebrow="Operação"
				title="Pré-check-in"
				description="Centralize dados dos hóspedes, documentos, horário de chegada e aceite das regras antes do check-in."
				action={action}
			/>
			<PreCheckinSummaryCards items={summaryItems} />

			<PanelCard
				title="Pré-check-ins"
				description="Acompanhe o status de envio, documentos e regras antes da chegada."
			>
				<div className="mb-4 flex flex-wrap gap-2">
					{preCheckinFilters.map((filter) => (
						<button
							key={filter.key}
							type="button"
							onClick={() => setActiveFilter(filter.key)}
							className={`h-9 rounded-full border px-3 text-sm font-semibold transition-colors ${
								activeFilter === filter.key
									? "border-primary-900 bg-primary-900 text-white"
									: "border-slate-200 bg-white text-slate-600 hover:border-primary-200 hover:bg-primary-100 cursor-pointer hover:text-primary-900"
							}`}
						>
							{filter.label}
						</button>
					))}
				</div>
				<PreCheckinList items={filteredItems} onOpen={setSelectedItem} />
			</PanelCard>

			<PreCheckinDetailsDrawer
				item={selectedItem}
				onClose={() => setSelectedItem(null)}
			/>
		</div>
	);
}

function CleaningInspectionSummaryCards({ items = [] }) {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
			{items.map((item) => {
				const Icon = kpiIconMap[item.key] || ClipboardCheck;
				const available = item.available !== false;
				const palette = getTone(available ? item.tone || "blue" : "slate");
				return (
					<article
						key={item.key || item.label}
						className={`rounded-[18px] border p-4 ${
							available
								? "border-slate-200/70 bg-white shadow-[0_8px_20px_rgba(15,23,42,0.05)]"
								: "border-dashed border-slate-300 bg-slate-50/80"
						}`}
					>
						<div className="flex items-start justify-between gap-3">
							<div className="min-w-0">
								<p className="text-[13px] font-medium text-slate-500">
									{item.label}
								</p>
								<p
									className={`mt-3 truncate font-semibold tracking-tight ${
										available
											? "text-[26px] leading-none text-slate-950"
											: "text-lg text-slate-500"
									}`}
								>
									{available
										? firstAvailable(
												item.value,
												item.count,
												item.total,
												"Sem dados",
											)
										: "Indisponível"}
								</p>
							</div>
							<span
								className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${palette.iconBg} ${palette.iconText}`}
							>
								<Icon className="h-5 w-5" weight="BoldDuotone" />
							</span>
						</div>
						{item.helper && (
							<p className="mt-3 text-xs leading-5 text-slate-500">
								{item.helper}
							</p>
						)}
					</article>
				);
			})}
		</div>
	);
}

function CleaningInspectionCard({ item, onOpen }) {
	const lastCheckout = firstAvailable(
		item.lastCheckout,
		item.previousBooking?.checkout,
	);
	const nextCheckin = firstAvailable(
		item.nextCheckin,
		item.nextBooking?.checkin,
	);
	const relatedBooking = firstAvailable(
		item.nextBooking?.id,
		item.previousBooking?.id,
		item.bookingId,
	);
	const assignee = firstAvailable(item.assignee?.name, item.assigneeName);

	return (
		<article className="rounded-[20px] border border-slate-200/70 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
			<div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-2">
						<h3 className="truncate text-lg font-semibold tracking-tight text-slate-950">
							{getCleaningPlaceName(item) || "Acomodação não informada"}
						</h3>
						<CleaningInspectionStatusBadge
							status={getCleaningOverallStatus(item)}
						/>
					</div>
					<p className="mt-1 truncate text-sm text-slate-500">
						Reserva relacionada: {relatedBooking || "Indisponível"}
					</p>
				</div>
				<button
					type="button"
					onClick={() => onOpen(item)}
					className="inline-flex cursor-pointer h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
				>
					Ver detalhes
					<ChevronRight className="h-4 w-4" />
				</button>
			</div>

			<div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
				<MetricCardRow
					label="Último check-out"
					value={formatDateTime(lastCheckout)}
					tone="amber"
					icon={Clock3}
				/>
				<MetricCardRow
					label="Próximo check-in"
					value={formatDateTime(nextCheckin)}
					tone="blue"
					icon={DoorOpen}
				/>
				<MetricCardRow
					label="Responsável"
					value={assignee || "Indisponível"}
					tone="slate"
					icon={ShieldCheck}
				/>
				<MetricCardRow
					label="Prazo"
					value={item.deadlineLabel || "Indisponível"}
					tone="violet"
					icon={CalendarDays}
				/>
			</div>

			<div className="mt-4 flex flex-wrap gap-2">
				<CleaningInspectionStatusBadge status={getCleaningStatus(item)} />
				<CleaningInspectionStatusBadge status={getInspectionStatus(item)} />
				{item.notes && (
					<span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
						Com observações
					</span>
				)}
			</div>
		</article>
	);
}

function CleaningInspectionList({ items, onOpen }) {
	if (items.length === 0) {
		return (
			<EmptyState
				icon={ClipboardCheck}
				title="Nenhuma tarefa de limpeza ou vistoria encontrada"
				description="Quando o back-end enviar tarefas entre check-out e próximo check-in, elas aparecerão aqui para acompanhamento."
			/>
		);
	}

	return (
		<div className="space-y-3">
			{items.map((item, index) => (
				<CleaningInspectionCard
					key={item.id || item._id || index}
					item={item}
					onOpen={onOpen}
				/>
			))}
		</div>
	);
}

function ChecklistPreview({ title, items = [] }) {
	return (
		<PanelCard title={title}>
			{items.length > 0 ? (
				<div className="space-y-2">
					{items.map((item, index) => (
						<div
							key={item.id || item.label || index}
							className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3"
						>
							<div className="min-w-0">
								<p className="text-sm font-semibold text-slate-950">
									{item.label || "Item do checklist"}
								</p>
								{item.notes && (
									<p className="mt-1 text-xs text-slate-500">{item.notes}</p>
								)}
							</div>
							<CleaningInspectionStatusBadge status={item.status} />
						</div>
					))}
				</div>
			) : (
				<p className="text-sm text-slate-500">
					Checklist indisponível no retorno atual da API.
				</p>
			)}
		</PanelCard>
	);
}

function PhotoPreview({ title, photos = [] }) {
	return (
		<PanelCard title={title}>
			{photos.length > 0 ? (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
					{photos.map((photo, index) => (
						<div
							key={photo.url || index}
							className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
						>
							<img
								src={photo.url}
								alt={photo.label || title}
								className="aspect-square w-full object-cover"
							/>
							<p className="truncate px-3 py-2 text-xs font-medium text-slate-600">
								{photo.label || "Foto"}
							</p>
						</div>
					))}
				</div>
			) : (
				<p className="text-sm text-slate-500">
					Fotos indisponíveis no retorno atual da API.
				</p>
			)}
		</PanelCard>
	);
}

function CleaningInspectionDetailsDrawer({ item, onClose }) {
	if (!item) return null;
	const lastCheckout = firstAvailable(
		item.lastCheckout,
		item.previousBooking?.checkout,
	);
	const nextCheckin = firstAvailable(
		item.nextCheckin,
		item.nextBooking?.checkin,
	);
	const relatedBooking = firstAvailable(
		item.nextBooking?.id,
		item.previousBooking?.id,
		item.bookingId,
	);

	return (
		<div className="fixed inset-0 z-50 bg-slate-950/30">
			<div className="ml-auto flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-white p-5 shadow-2xl">
				<div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
					<div>
						<p className="text-xs font-semibold uppercase tracking-wide text-primary-700">
							Detalhe da limpeza e vistoria
						</p>
						<h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
							{getCleaningPlaceName(item) || "Acomodação não informada"}
						</h2>
						<p className="mt-1 text-sm text-slate-500">
							Reserva relacionada: {relatedBooking || "Indisponível"}
						</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				<div className="mt-5 space-y-5">
					<PanelCard title="Dados da acomodação">
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<DetailRow
								label="Acomodação"
								value={getCleaningPlaceName(item)}
							/>
							<DetailRow label="Cidade" value={item.place?.city} />
							<DetailRow label="Status geral" value={item.overallStatusLabel} />
							<DetailRow label="Responsável" value={item.assignee?.name} />
						</div>
					</PanelCard>

					<PanelCard title="Reserva e horários">
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<DetailRow label="Reserva" value={relatedBooking} />
							<DetailRow
								label="Último check-out"
								value={formatDateTime(lastCheckout)}
							/>
							<DetailRow
								label="Próximo check-in"
								value={formatDateTime(nextCheckin)}
							/>
							<DetailRow
								label="Prazo antes da entrada"
								value={item.deadlineLabel}
							/>
						</div>
					</PanelCard>

					<PanelCard title="Status operacional">
						<div className="flex flex-wrap gap-2">
							<CleaningInspectionStatusBadge status={getCleaningStatus(item)} />
							<CleaningInspectionStatusBadge
								status={getInspectionStatus(item)}
							/>
							<CleaningInspectionStatusBadge
								status={getCleaningOverallStatus(item)}
							/>
						</div>
					</PanelCard>

					<ChecklistPreview
						title="Checklist de limpeza"
						items={item.cleaningChecklist || []}
					/>
					<ChecklistPreview
						title="Checklist de vistoria"
						items={item.inspectionChecklist || []}
					/>
					<PhotoPreview title="Fotos antes" photos={item.photosBefore || []} />
					<PhotoPreview title="Fotos depois" photos={item.photosAfter || []} />

					<PanelCard title="Observações operacionais">
						<p className="text-sm leading-6 text-slate-600">
							{item.notes || "Nenhuma observação operacional informada."}
						</p>
					</PanelCard>
				</div>
			</div>
		</div>
	);
}

function CleaningInspectionSection({ data, action }) {
	const [activeFilter, setActiveFilter] = useState("all");
	const [selectedItem, setSelectedItem] = useState(null);
	const cleaningInspectionPayload = getCleaningInspectionPayload(data);
	const items = getCleaningInspectionItems(cleaningInspectionPayload);
	const summaryItems = getCleaningInspectionSummaryItems(
		cleaningInspectionPayload,
	);
	const filters =
		cleaningInspectionPayload.filters || cleaningInspectionFilters;
	const filteredItems =
		activeFilter === "all"
			? items
			: items.filter(
					(item) =>
						normalizeStatusKey(getCleaningOverallStatus(item)) === activeFilter,
				);

	return (
		<div className="space-y-5">
			<SectionHeader
				eyebrow="Operação"
				title="Limpeza e vistoria"
				description="Acompanhe limpezas, checklists, vistorias e prazos antes da próxima entrada."
				action={action}
			/>
			<CleaningInspectionSummaryCards items={summaryItems} />

			<PanelCard
				title="Tarefas operacionais"
				description="Controle o preparo da acomodação entre o check-out e o próximo check-in."
			>
				<div className="mb-4 flex flex-wrap gap-2">
					{filters.map((filter) => (
						<button
							key={filter.key}
							type="button"
							onClick={() => setActiveFilter(filter.key)}
							className={`h-9 rounded-full border px-3 text-sm font-semibold transition-colors ${
								activeFilter === filter.key
									? "border-primary-900 bg-primary-900 text-white"
									: "border-slate-200 bg-white text-slate-600 hover:bg-primary-100 cursor-pointer hover:border-primary-200 hover:text-primary-900"
							}`}
						>
							{filter.label}
						</button>
					))}
				</div>
				<CleaningInspectionList
					items={filteredItems}
					onOpen={setSelectedItem}
				/>
			</PanelCard>

			<CleaningInspectionDetailsDrawer
				item={selectedItem}
				onClose={() => setSelectedItem(null)}
			/>
		</div>
	);
}

const maintenanceDamageFilters = [
	{ key: "all", label: "Todos" },
	{ key: "open", label: "Ocorrências abertas" },
	{ key: "damage", label: "Danos reportados" },
	{ key: "maintenance_pending", label: "Manutenção pendente" },
	{ key: "in_progress", label: "Em andamento" },
	{ key: "resolved", label: "Resolvidos" },
	{ key: "archived", label: "Arquivados" },
];

const maintenanceDamageTypeLabels = {
	damage: "Dano",
	dano: "Dano",
	maintenance: "Manutenção",
	manutencao: "Manutenção",
	operational_occurrence: "Ocorrência operacional",
	occurrence: "Ocorrência operacional",
	ocorrencia_operacional: "Ocorrência operacional",
	missing_item: "Item faltando",
	item_faltando: "Item faltando",
	complaint: "Reclamação",
	reclamacao: "Reclamação",
	failed_inspection: "Vistoria reprovada",
	vistoria_reprovada: "Vistoria reprovada",
};

const maintenanceDamageStatusLabels = {
	open: "Aberto",
	aberto: "Aberto",
	in_review: "Em análise",
	em_analise: "Em análise",
	in_maintenance: "Em manutenção",
	em_manutencao: "Em manutenção",
	in_progress: "Em andamento",
	resolved: "Resolvido",
	resolvido: "Resolvido",
	charged: "Cobrado",
	cobrado: "Cobrado",
	archived: "Arquivado",
	arquivado: "Arquivado",
	pending: "Pendente",
	pendente: "Pendente",
};

const maintenanceDamagePriorityLabels = {
	low: "Baixa",
	baixa: "Baixa",
	medium: "Média",
	media: "Média",
	high: "Alta",
	alta: "Alta",
	critical: "Crítica",
	critica: "Crítica",
};

const maintenanceDamageSummaryIconMap = {
	openOccurrences: AlertTriangle,
	openIncidents: AlertTriangle,
	reportedDamages: ShieldCheck,
	damagesReported: ShieldCheck,
	pendingMaintenance: Wrench,
	maintenancePending: Wrench,
	completedMaintenance: CheckCircle2,
	maintenanceCompleted: CheckCircle2,
	estimatedCost: Banknote,
	totalEstimatedCost: Banknote,
};

const getMaintenanceDamagePayload = (data = {}) =>
	data.maintenanceDamage ||
	data.maintenanceAndDamage ||
	data.maintenance ||
	data.damageReports ||
	data.incidents ||
	{};

const getMaintenanceDamageItems = (payload = {}) => {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload.items)) return payload.items;
	if (Array.isArray(payload.records)) return payload.records;
	if (Array.isArray(payload.list)) return payload.list;
	if (Array.isArray(payload.occurrences)) return payload.occurrences;
	return [];
};

const getMaintenanceDamageSummaryItems = (payload = {}) => {
	const summary =
		payload.summary?.items || payload.summaryCards || payload.cards || [];
	return Array.isArray(summary) ? summary : [];
};

const getMaintenanceDamageType = (item = {}) =>
	firstAvailable(item.type, item.category, item.kind, item.issueType);

const getMaintenanceDamageStatus = (item = {}) =>
	firstAvailable(item.status, item.resolutionStatus, item.state);

const getMaintenanceDamagePriority = (item = {}) =>
	firstAvailable(item.priority, item.severity, item.urgency);

const getMaintenanceDamageAccommodation = (item = {}) =>
	firstAvailable(
		item.place?.title,
		item.accommodation?.title,
		item.property?.title,
		item.placeTitle,
		item.accommodationName,
		item.propertyName,
	);

const getMaintenanceDamageReservation = (item = {}) =>
	firstAvailable(
		item.booking?.code,
		item.booking?.id,
		item.booking?._id,
		item.bookingId,
		item.reservationId,
		item.reservation?.id,
		item.reservation?._id,
	);

const getMaintenanceDamageGuest = (item = {}) =>
	firstAvailable(
		item.guest?.name,
		item.user?.name,
		item.booking?.user?.name,
		item.guestName,
	);

const getMaintenanceDamageCost = (item = {}) =>
	firstAvailable(
		item.estimatedCostLabel,
		item.formattedEstimatedCost,
		item.costLabel,
		item.estimatedCost,
		item.cost,
		item.amount,
	);

const formatMaintenanceDamageCost = (value) => {
	if (value === null || value === undefined || value === "") return null;
	return typeof value === "number" ? formatCurrency(value) : value;
};

const getMaintenanceDamageDateOpened = (item = {}) =>
	firstAvailable(
		item.openedAt,
		item.createdAt,
		item.reportedAt,
		item.dateOpened,
	);

const getMaintenanceDamageDateResolved = (item = {}) =>
	firstAvailable(
		item.resolvedAt,
		item.closedAt,
		item.archivedAt,
		item.dateResolved,
	);

const getMaintenanceDamageDescription = (item = {}) =>
	firstAvailable(item.description, item.details, item.notes, item.summary);

const getMaintenanceDamageShortDescription = (item = {}) =>
	firstAvailable(
		item.shortDescription,
		item.title,
		item.summary,
		item.description,
	);

const getMaintenanceDamageAttachments = (item = {}) => {
	const attachments = firstAvailable(
		item.attachments,
		item.files,
		item.photos,
		item.images,
	);
	return Array.isArray(attachments) ? attachments : [];
};

const getMaintenanceDamageHistory = (item = {}) => {
	const history = firstAvailable(item.history, item.timeline, item.updates);
	return Array.isArray(history) ? history : [];
};

const getMaintenanceDamageFilterKey = (item = {}) => {
	const explicitFilter = normalizeStatusKey(
		firstAvailable(item.filterKey, item.group, item.bucket),
	);
	const type = normalizeStatusKey(getMaintenanceDamageType(item));
	const status = normalizeStatusKey(getMaintenanceDamageStatus(item));

	if (explicitFilter) return explicitFilter;
	if (["damage", "dano"].includes(type)) return "damage";
	if (["archived", "arquivado"].includes(status)) return "archived";
	if (["resolved", "resolvido", "charged", "cobrado"].includes(status)) {
		return "resolved";
	}
	if (["in_progress", "in_maintenance", "em_manutencao"].includes(status)) {
		return "in_progress";
	}
	if (
		["maintenance", "manutencao"].includes(type) &&
		["pending", "pendente", "open", "aberto"].includes(status)
	) {
		return "maintenance_pending";
	}
	if (["open", "aberto", "in_review", "em_analise"].includes(status)) {
		return "open";
	}
	return "";
};

function MaintenanceDamageStatusBadge({ status }) {
	const key = normalizeStatusKey(status);
	const tone =
		key === "resolved" ||
		key === "resolvido" ||
		key === "charged" ||
		key === "cobrado"
			? "green"
			: key === "archived" || key === "arquivado"
				? "slate"
				: key === "in_maintenance" ||
					  key === "em_manutencao" ||
					  key === "in_progress"
					? "blue"
					: key === "open" || key === "aberto" || key === "in_review"
						? "amber"
						: "slate";

	return (
		<Pill tone={tone}>
			{maintenanceDamageStatusLabels[key] || status || "Indisponível"}
		</Pill>
	);
}

function MaintenanceDamagePriorityBadge({ priority }) {
	const key = normalizeStatusKey(priority);
	const tone =
		key === "critical" || key === "critica"
			? "red"
			: key === "high" || key === "alta"
				? "amber"
				: key === "medium" || key === "media"
					? "blue"
					: "slate";

	return (
		<Pill tone={tone}>
			{maintenanceDamagePriorityLabels[key] || priority || "Indisponível"}
		</Pill>
	);
}

function MaintenanceDamageTypeBadge({ type }) {
	const key = normalizeStatusKey(type);
	return (
		<Pill tone="slate">
			{maintenanceDamageTypeLabels[key] || type || "Indisponível"}
		</Pill>
	);
}

function MaintenanceDamageSummaryCards({ items = [] }) {
	if (items.length === 0) return null;

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
			{items.map((item) => {
				const Icon =
					maintenanceDamageSummaryIconMap[item.key] ||
					kpiIconMap[item.key] ||
					Wrench;
				const available = item.available !== false;
				const palette = getTone(available ? item.tone || "blue" : "slate");
				return (
					<article
						key={item.key || item.label}
						className={`rounded-[18px] border p-4 ${
							available
								? "border-slate-200/70 bg-white shadow-[0_8px_20px_rgba(15,23,42,0.05)]"
								: "border-dashed border-slate-300 bg-slate-50/80"
						}`}
					>
						<div className="flex items-start justify-between gap-3">
							<div className="min-w-0">
								<p className="text-[13px] font-medium text-slate-500">
									{item.label}
								</p>
								<p
									className={`mt-3 break-words font-semibold tracking-tight ${
										available
											? "text-[26px] leading-none text-slate-950"
											: "text-lg text-slate-500"
									}`}
								>
									{available
										? firstAvailable(
												item.value,
												item.count,
												item.total,
												"Sem dados",
											)
										: "Indisponível"}
								</p>
							</div>
							<span
								className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${palette.iconBg} ${palette.iconText}`}
							>
								<Icon className="h-5 w-5" weight="BoldDuotone" />
							</span>
						</div>
						{item.helper && (
							<p className="mt-3 text-xs leading-5 text-slate-500">
								{item.helper}
							</p>
						)}
					</article>
				);
			})}
		</div>
	);
}

function MaintenanceDamageFilterTabs({ activeFilter, onChange }) {
	return (
		<div className="flex gap-2 overflow-x-auto pb-1">
			{maintenanceDamageFilters.map((filter) => (
				<button
					key={filter.key}
					type="button"
					onClick={() => onChange(filter.key)}
					className={`h-9 shrink-0 rounded-full border px-3 text-sm font-semibold transition-colors ${
						activeFilter === filter.key
							? "border-primary-900 bg-primary-900 text-white"
							: "border-slate-200 bg-white text-slate-600 hover:border-primary-200 hover:text-primary-900"
					}`}
				>
					{filter.label}
				</button>
			))}
		</div>
	);
}

function MaintenanceDamageCard({ item, onOpen }) {
	const type = getMaintenanceDamageType(item);
	const status = getMaintenanceDamageStatus(item);
	const priority = getMaintenanceDamagePriority(item);
	const cost = formatMaintenanceDamageCost(getMaintenanceDamageCost(item));
	const reservation = getMaintenanceDamageReservation(item);

	return (
		<article className="rounded-[20px] border border-slate-200/70 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.05)] transition-colors hover:border-slate-300">
			<div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-2">
						<h3 className="truncate text-lg font-semibold tracking-tight text-slate-950">
							{getMaintenanceDamageAccommodation(item) ||
								"Acomodação não informada"}
						</h3>
						<MaintenanceDamageTypeBadge type={type} />
					</div>
					<p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
						{getMaintenanceDamageShortDescription(item) ||
							"Descrição indisponível"}
					</p>
				</div>
				<button
					type="button"
					onClick={() => onOpen(item)}
					className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
				>
					Ver detalhes
					<ChevronRight className="h-4 w-4" />
				</button>
			</div>

			<div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
				<MetricCardRow
					label="Prioridade"
					value={
						maintenanceDamagePriorityLabels[normalizeStatusKey(priority)] ||
						priority ||
						"Indisponível"
					}
					tone="amber"
					icon={AlertTriangle}
				/>
				<MetricCardRow
					label="Status"
					value={
						maintenanceDamageStatusLabels[normalizeStatusKey(status)] ||
						status ||
						"Indisponível"
					}
					tone="blue"
					icon={ClipboardCheck}
				/>
				<MetricCardRow
					label="Custo estimado"
					value={cost || "Indisponível"}
					tone="green"
					icon={Banknote}
				/>
				<MetricCardRow
					label="Aberto em"
					value={formatDate(getMaintenanceDamageDateOpened(item))}
					tone="slate"
					icon={CalendarDays}
				/>
			</div>

			<div className="mt-4 flex flex-wrap gap-2">
				<MaintenanceDamagePriorityBadge priority={priority} />
				<MaintenanceDamageStatusBadge status={status} />
				{reservation && (
					<span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
						Reserva {reservation}
					</span>
				)}
			</div>
		</article>
	);
}

function MaintenanceDamageList({ items, onOpen }) {
	if (items.length === 0) {
		return (
			<EmptyState
				icon={Wrench}
				title="Nenhuma ocorrência encontrada"
				description="Quando o back-end enviar ocorrências, danos ou manutenções, elas aparecerão aqui para acompanhamento."
			/>
		);
	}

	return (
		<div className="space-y-3">
			{items.map((item, index) => (
				<MaintenanceDamageCard
					key={item.id || item._id || index}
					item={item}
					onOpen={onOpen}
				/>
			))}
		</div>
	);
}

function AttachmentPreview({ attachments = [] }) {
	if (attachments.length === 0) {
		return (
			<p className="text-sm text-slate-500">
				Fotos ou anexos indisponíveis no retorno atual da API.
			</p>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
			{attachments.map((attachment, index) => {
				const url =
					typeof attachment === "string"
						? attachment
						: firstAvailable(attachment.url, attachment.src, attachment.path);
				const label =
					typeof attachment === "string"
						? `Anexo ${index + 1}`
						: firstAvailable(
								attachment.label,
								attachment.name,
								attachment.filename,
							);
				const isImage = /\.(png|jpe?g|webp|gif|avif)$/i.test(String(url || ""));
				const Icon = isImage ? Gallery : Paperclip;

				return (
					<div
						key={url || label || index}
						className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3"
					>
						{isImage && url ? (
							<img
								src={url}
								alt={label || "Anexo da ocorrência"}
								className="aspect-video w-full rounded-xl object-cover"
							/>
						) : (
							<div className="flex aspect-video w-full items-center justify-center rounded-xl bg-white text-slate-600">
								<Icon className="h-6 w-6" weight="BoldDuotone" />
							</div>
						)}
						<p className="mt-2 truncate text-xs font-semibold text-slate-600">
							{label || "Anexo"}
						</p>
					</div>
				);
			})}
		</div>
	);
}

function MaintenanceDamageHistory({ history = [] }) {
	if (history.length === 0) {
		return (
			<p className="text-sm text-slate-500">
				Histórico de atualizações indisponível no retorno atual da API.
			</p>
		);
	}

	return (
		<div className="space-y-3">
			{history.map((entry, index) => (
				<div
					key={entry.id || entry._id || index}
					className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3"
				>
					<p className="text-sm font-semibold text-slate-950">
						{firstAvailable(
							entry.title,
							entry.status,
							entry.action,
							"Atualização",
						)}
					</p>
					<p className="mt-1 text-xs text-slate-500">
						{formatDate(
							firstAvailable(entry.date, entry.createdAt, entry.updatedAt),
						)}
					</p>
					{entry.description && (
						<p className="mt-2 text-sm leading-6 text-slate-600">
							{entry.description}
						</p>
					)}
				</div>
			))}
		</div>
	);
}

function MaintenanceDamageDetailsDrawer({ item, onClose }) {
	if (!item) return null;

	const type = getMaintenanceDamageType(item);
	const status = getMaintenanceDamageStatus(item);
	const priority = getMaintenanceDamagePriority(item);
	const cost = formatMaintenanceDamageCost(getMaintenanceDamageCost(item));
	const attachments = getMaintenanceDamageAttachments(item);
	const history = getMaintenanceDamageHistory(item);

	return (
		<div className="fixed inset-0 z-50 bg-slate-950/30">
			<div className="ml-auto flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-white p-5 shadow-2xl">
				<div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
					<div>
						<p className="text-xs font-semibold uppercase tracking-wide text-primary-700">
							Detalhe da ocorrência
						</p>
						<h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
							{getMaintenanceDamageAccommodation(item) ||
								"Acomodação não informada"}
						</h2>
						<p className="mt-1 text-sm text-slate-500">
							{getMaintenanceDamageShortDescription(item) ||
								"Descrição resumida indisponível"}
						</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50"
						aria-label="Fechar detalhes da ocorrência"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				<div className="mt-5 space-y-5">
					<PanelCard title="Status da resolução">
						<div className="flex flex-wrap gap-2">
							<MaintenanceDamageTypeBadge type={type} />
							<MaintenanceDamageStatusBadge status={status} />
							<MaintenanceDamagePriorityBadge priority={priority} />
						</div>
					</PanelCard>

					<PanelCard title="Dados principais">
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<DetailRow
								label="Acomodação afetada"
								value={getMaintenanceDamageAccommodation(item)}
							/>
							<DetailRow
								label="Tipo da ocorrência"
								value={
									maintenanceDamageTypeLabels[normalizeStatusKey(type)] || type
								}
							/>
							<DetailRow
								label="Custo estimado"
								value={cost || "Indisponível"}
							/>
							<DetailRow
								label="Responsável"
								value={firstAvailable(
									item.assignee?.name,
									item.responsible?.name,
									item.assigneeName,
									item.responsibleName,
								)}
							/>
							<DetailRow
								label="Reserva relacionada"
								value={getMaintenanceDamageReservation(item)}
							/>
							<DetailRow
								label="Hóspede relacionado"
								value={getMaintenanceDamageGuest(item)}
							/>
							<DetailRow
								label="Data de abertura"
								value={formatDate(getMaintenanceDamageDateOpened(item))}
							/>
							<DetailRow
								label="Data de resolução"
								value={formatDate(getMaintenanceDamageDateResolved(item))}
							/>
						</div>
					</PanelCard>

					<PanelCard title="Descrição completa">
						<p className="text-sm leading-6 text-slate-600">
							{getMaintenanceDamageDescription(item) ||
								"Descrição completa indisponível no retorno atual da API."}
						</p>
					</PanelCard>

					<PanelCard title="Fotos e anexos">
						<AttachmentPreview attachments={attachments} />
					</PanelCard>

					<PanelCard title="Histórico de atualizações">
						<MaintenanceDamageHistory history={history} />
					</PanelCard>
				</div>
			</div>
		</div>
	);
}

function MaintenanceDamageSection({ data, action }) {
	const [activeFilter, setActiveFilter] = useState("all");
	const [selectedItem, setSelectedItem] = useState(null);
	const payload = getMaintenanceDamagePayload(data);
	const items = getMaintenanceDamageItems(payload);
	const summaryItems = getMaintenanceDamageSummaryItems(payload);
	const filteredItems =
		activeFilter === "all"
			? items
			: items.filter(
					(item) => getMaintenanceDamageFilterKey(item) === activeFilter,
				);

	return (
		<div className="space-y-5">
			<SectionHeader
				eyebrow="Operação"
				title="Manutenção e danos"
				description="Acompanhe ocorrências, danos, custos estimados e manutenções que afetam suas acomodações."
				action={action}
			/>

			<MaintenanceDamageSummaryCards items={summaryItems} />

			<PanelCard
				title="Ocorrências e manutenções"
				description="Dados operacionais separados da Visão Geral para acompanhar prioridade, status e imóvel afetado."
			>
				<div className="mb-4">
					<MaintenanceDamageFilterTabs
						activeFilter={activeFilter}
						onChange={setActiveFilter}
					/>
				</div>
				<MaintenanceDamageList items={filteredItems} onOpen={setSelectedItem} />
			</PanelCard>

			<MaintenanceDamageDetailsDrawer
				item={selectedItem}
				onClose={() => setSelectedItem(null)}
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
						<OverviewCompact
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
						<PreCheckinSection data={payload} action={refreshAction} />
					)}
					{activeSection === "cleaning" && (
						<CleaningInspectionSection data={payload} action={refreshAction} />
					)}
					{activeSection === "finance" && (
						<Finance data={payload} action={refreshAction} />
					)}
					{activeSection === "maintenance" && (
						<MaintenanceDamageSection data={payload} action={refreshAction} />
					)}
					{activeSection === "reports" && (
						<ReportsSection data={payload} action={refreshAction} />
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
