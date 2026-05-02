import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
	AlertTriangle,
	ArrowUpRight,
	Banknote,
	BarChart3,
	Bath,
	BedDouble,
	BookOpen,
	Building2,
	CalendarDays,
	Camera,
	CheckCircle2,
	ChevronRight,
	ChevronsLeft,
	Clock3,
	DoorOpen,
	DollarSign,
	Eye,
	ExternalLink,
	Maximize2,
	Home,
	LineChart as LineChartIcon,
	MapPin,
	MessageCircle,
	PanelLeft,
	Plus,
	Settings,
	Sparkles,
	Star,
	TrendingDown,
	TrendingUp,
	Users2,
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
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import NotificationBell from "@/components/common/NotificationBell";
import { useUserContext } from "@/components/contexts/UserContext";
import { UserImageFallback } from "@/components/ui/figma/ImageWithFallback";
import { getHostDashboard } from "@/services/dashboardService";
import CalendarGridMonth from "./CalendarGridMonth";
import AccommodationLogbook from "./AccommodationLogbook";
import {
	calculateFinancialMetrics,
	calculateMonthlyRevenue,
	calculatePerformanceMetrics,
	calculateRentalKPIs,
	generateAlerts,
} from "./utils_dashboardCalculations";
import photoDefault from "@/assets/photoDefault.jpg";
import logoPrimary from "@/assets/logos/logo__primary.png";

const sectionGroups = [
	{
		label: "Central",
		items: [
			{ id: "today", label: "Hoje", icon: PanelLeft },
			{ id: "places", label: "Acomodações", icon: Building2 },
			{ id: "performance", label: "Desempenho", icon: BarChart3 },
			{ id: "finance", label: "Finanças", icon: Banknote },
			{ id: "insights", label: "Sugestões", icon: Sparkles },
		],
	},
	{
		label: "Operação",
		items: [
			{ id: "reservations", label: "Reservas", icon: Clock3 },
			{ id: "messages", label: "Mensagens", icon: MessageCircle },
			{ id: "logbook", label: "Histórico", icon: BookOpen },
		],
	},
	{
		label: "Configuração",
		items: [
			{
				id: "new-place",
				label: "Novo anúncio",
				icon: Plus,
				to: "/account/places/new",
			},
			{
				id: "profile",
				label: "Perfil",
				icon: Settings,
				to: "/account/profile",
			},
		],
	},
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

const toDate = (value) => (value ? new Date(value) : null);

const getBookingPlaceId = (booking) =>
	String(booking?.place?._id || booking?.place || "");

const getBookingTotal = (booking) =>
	Number(
		booking?.priceTotal || booking?.totalValue || booking?.totalPrice || 0,
	);

const isCanceledBooking = (booking) => {
	const status = String(booking?.status || "").toLowerCase();
	const paymentStatus = String(booking?.paymentStatus || "").toLowerCase();
	return (
		["canceled", "cancelled", "rejected"].includes(status) ||
		["canceled", "cancelled", "rejected"].includes(paymentStatus)
	);
};

const isRevenueBooking = (booking) =>
	!isCanceledBooking(booking) &&
	["approved", "paid", "completed"].includes(
		String(booking?.paymentStatus || "").toLowerCase(),
	);

const nightsBetween = (checkin, checkout) => {
	const start = toDate(checkin);
	const end = toDate(checkout);
	if (!start || !end) return 0;
	return Math.max(0, Math.round((end - start) / (24 * 60 * 60 * 1000)));
};

const getStatusTone = (value) => {
	if (value === "critical") return "border-red-200 bg-red-50 text-red-700";
	if (value === "warning") return "border-amber-200 bg-amber-50 text-amber-700";
	if (value === "success") return "border-teal-200 bg-teal-50 text-teal-700";
	return "border-slate-200 bg-slate-50 text-slate-600";
};

const buildPropertyStats = (places = [], bookings = []) => {
	const now = new Date();
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
	const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

	return places
		.map((place) => {
			const placeId = String(place._id);
			const placeBookings = bookings.filter(
				(booking) => getBookingPlaceId(booking) === placeId,
			);
			const activeBookings = placeBookings.filter(
				(booking) => !isCanceledBooking(booking),
			);
			const revenueBookings = placeBookings.filter(isRevenueBooking);
			const monthlyRevenue = revenueBookings.reduce((total, booking) => {
				const checkout = toDate(booking.checkout || booking.checkOut);
				if (!checkout || checkout < monthStart || checkout >= monthEnd)
					return total;
				return total + getBookingTotal(booking);
			}, 0);
			const totalRevenue = revenueBookings.reduce(
				(total, booking) => total + getBookingTotal(booking),
				0,
			);
			const bookedNights = activeBookings.reduce(
				(total, booking) =>
					total +
					nightsBetween(
						booking.checkin || booking.checkIn,
						booking.checkout || booking.checkOut,
					),
				0,
			);
			const occupancyRate = Math.min(
				100,
				Math.round((bookedNights / Math.max(places.length ? 30 : 1, 1)) * 100),
			);
			const futureEvents = activeBookings
				.flatMap((booking) => [
					{
						type: "Entrada",
						date: toDate(booking.checkin || booking.checkIn),
						booking,
					},
					{
						type: "Saída",
						date: toDate(booking.checkout || booking.checkOut),
						booking,
					},
				])
				.filter((event) => event.date && event.date >= now)
				.sort((a, b) => a.date - b.date);
			const nextEvent = futureEvents[0] || null;
			const averageDailyRate =
				bookedNights > 0
					? Math.round(totalRevenue / bookedNights)
					: Number(place.price || 0);
			const rating = Number(place.averageRating || 0);
			const alerts = [];

			if (!place.isActive) {
				alerts.push({ tone: "critical", label: "Anúncio inativo" });
			}
			if (activeBookings.length === 0) {
				alerts.push({ tone: "critical", label: "Sem reservas" });
			}
			if (occupancyRate > 0 && occupancyRate < 35) {
				alerts.push({ tone: "warning", label: "Baixa ocupação" });
			}
			if (rating > 0 && rating < 4.5) {
				alerts.push({ tone: "warning", label: "Avaliação em atenção" });
			}
			if (!place.photos || place.photos.length < 3) {
				alerts.push({ tone: "warning", label: "Poucas fotos" });
			}
			if (alerts.length === 0) {
				alerts.push({ tone: "success", label: "Operação saudável" });
			}

			const priorityScore =
				(nextEvent?.date && nextEvent.date.toDateString() === now.toDateString()
					? 100
					: 0) +
				alerts.filter((alert) => alert.tone === "critical").length * 30 +
				alerts.filter((alert) => alert.tone === "warning").length * 12 -
				monthlyRevenue / 1000;

			return {
				...place,
				id: placeId,
				monthlyRevenue,
				totalRevenue,
				bookedNights,
				occupancyRate,
				averageDailyRate,
				nextEvent,
				alerts,
				priorityScore,
				activeBookings,
				revenueBookings,
			};
		})
		.sort((a, b) => b.priorityScore - a.priorityScore);
};

function HostMetric({ label, value, helper, icon: Icon, trend }) {
	const TrendIcon = trend === "down" ? TrendingDown : TrendingUp;

	return (
		<div className="group rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm shadow-black/[0.03] backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md hover:shadow-black/[0.05]">
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
						{label}
					</p>
					<p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
						{value}
					</p>
				</div>
				<span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white transition duration-300 group-hover:bg-slate-800">
					<Icon size={18} aria-hidden="true" />
				</span>
			</div>
			<div className="mt-3 flex items-center gap-2 text-sm leading-5 text-slate-500">
				{trend && (
					<TrendIcon
						className={`h-4 w-4 shrink-0 ${
							trend === "down" ? "text-red-600" : "text-teal-700"
						}`}
						aria-hidden="true"
					/>
				)}
				<span>{helper}</span>
			</div>
		</div>
	);
}

function HostCenterSidebar({ activeSection, onSectionChange }) {
	return (
		<aside className="hidden h-[calc(100vh-2rem)] w-72 shrink-0 sticky top-4 overflow-hidden rounded-xl border border-white/70 bg-white/65 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur-2xl lg:flex lg:flex-col">
			<div className="px-4 py-5">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white shadow-sm">
						<Home className="h-5 w-5" />
					</div>
					<div className="min-w-0">
						<p className="text-[11px] font-semibold uppercase tracking-wide text-teal-700">
							DormeAqui
						</p>
						<h1 className="truncate text-lg font-semibold text-slate-950">
							Central do Anfitrião
						</h1>
					</div>
				</div>
				<div className="mt-5 flex items-start gap-2 border-l border-teal-500/40 pl-3">
					<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
					<div>
						<p className="text-xs font-semibold text-slate-800">
							Operação monitorada
						</p>
						<p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
							Hoje, agenda e imóveis em atenção.
						</p>
					</div>
				</div>
			</div>
			<nav className="flex-1 space-y-5 overflow-y-auto px-3 py-3">
				{sectionGroups.map((group) => (
					<div key={group.label}>
						<p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
							{group.label}
						</p>
						<div className="space-y-1">
							{group.items.map((item) => {
								const Icon = item.icon;
								const isActive = activeSection === item.id;
								const className = `group relative flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors ${
									isActive
										? "bg-slate-950/[0.04] text-slate-950"
										: "text-slate-600 hover:bg-slate-950/[0.035] hover:text-slate-950"
								}`;
								const iconClassName = `h-4 w-4 shrink-0 ${
									isActive
										? "text-teal-700"
										: "text-slate-400 group-hover:text-slate-700"
								}`;

								if (item.to) {
									return (
										<Link key={item.id} to={item.to} className={className}>
											<span
												className={`absolute left-0 top-2 h-6 w-0.5 rounded-r-full ${
													isActive ? "bg-teal-700" : "bg-transparent"
												}`}
											/>
											<Icon className={iconClassName} />
											<span className="min-w-0 flex-1 truncate">
												{item.label}
											</span>
										</Link>
									);
								}

								return (
									<button
										key={item.id}
										type="button"
										onClick={() => onSectionChange(item.id)}
										className={`${className} cursor-pointer text-left`}
									>
										<span
											className={`absolute left-0 top-2 h-6 w-0.5 rounded-r-full ${
												isActive ? "bg-teal-700" : "bg-transparent"
											}`}
										/>
										<Icon className={iconClassName} />
										<span className="min-w-0 flex-1 truncate">
											{item.label}
										</span>
									</button>
								);
							})}
						</div>
					</div>
				))}
			</nav>
			<div className="p-3">
				<Link
					to="/account/places/new"
					className="flex h-11 items-center justify-between rounded-md border border-slate-200/80 bg-white/55 px-3 text-sm font-semibold text-slate-800 transition-colors hover:border-slate-300 hover:bg-white/80"
				>
					<span className="inline-flex items-center gap-2">
						<Plus className="h-4 w-4" />
						Novo anúncio
					</span>
					<ArrowUpRight className="h-4 w-4 text-slate-400" />
				</Link>
			</div>
		</aside>
	);
}

function HostCenterTopNav({ activeSection, onSectionChange }) {
	const { user } = useUserContext();
	const compactItems = [
		{ id: "today", label: "Hoje" },
		{ id: "places", label: "Acomodações" },
		{ id: "performance", label: "Desempenho" },
		{ id: "logbook", label: "Histórico" },
	];
	const initials = user?.name
		?.split(" ")
		.map((part) => part[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<header className="sticky top-3 z-30 mx-auto flex w-full max-w-7xl items-center gap-2 px-3">
			<Link
				to="/"
				className="hidden h-14 shrink-0 items-center rounded-full border border-slate-300/70 bg-white/80 px-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-2xl transition-colors hover:bg-white md:flex"
			>
				<img src={logoPrimary} alt="DormeAqui" className="h-8 object-contain" />
			</Link>

			<nav className="flex h-14 min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto rounded-full border border-slate-200/70 bg-white/80 px-2 shadow-[0_16px_45px_rgba(15,23,42,0.06)] backdrop-blur-2xl">
				{compactItems.map((item) => {
					const isActive = activeSection === item.id;
					return (
						<button
							key={item.id}
							type="button"
							onClick={() => onSectionChange(item.id)}
							className={`h-10 cursor-pointer shrink-0 rounded-full px-4 text-xs font-semibold transition-colors ${
								isActive
									? "bg-slate-950 text-white shadow-sm"
									: "text-slate-600 hover:bg-slate-950/[0.05] hover:text-slate-950"
							}`}
						>
							{item.label}
						</button>
					);
				})}
			</nav>

			<div className="hidden shrink-0 items-center gap-1.5 md:flex">
				<Link
					to="/account/places/new"
					className="flex h-14 items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-4 text-xs font-semibold text-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-2xl transition-colors hover:bg-white"
				>
					<Plus className="h-4 w-4" />
					Novo
				</Link>
				<div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200/70 bg-white/80 text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-2xl">
					<NotificationBell />
				</div>
				<Link
					to="/account/profile"
					className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-slate-200/70 bg-white/80 text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur-2xl transition-colors hover:bg-white"
					aria-label="Perfil"
				>
					{user?.photo ? (
						<UserImageFallback
							type="avatar"
							src={user.photo}
							alt={user.name}
							className="h-full w-full object-cover"
						/>
					) : (
						<span className="text-xs font-semibold text-slate-700">
							{initials || "DA"}
						</span>
					)}
				</Link>
			</div>
		</header>
	);
}

function SectionTabs({ activeSection, onSectionChange }) {
	const items = sectionGroups[0].items;

	return (
		<div className="lg:hidden -mx-4 overflow-x-auto border-b border-slate-200 bg-white px-4 py-3">
			<div className="flex min-w-max gap-2">
				{items.map((item) => (
					<button
						key={item.id}
						type="button"
						onClick={() => onSectionChange(item.id)}
						className={`h-9 rounded-md border px-3 text-sm font-semibold transition-colors ${
							activeSection === item.id
								? "border-slate-950 bg-slate-950 text-white"
								: "border-slate-200 bg-white text-slate-600"
						}`}
					>
						{item.label}
					</button>
				))}
			</div>
		</div>
	);
}

function PropertyCard({ property, onOpen }) {
	const mainAlert = property.alerts[0];
	const photo = property.photos?.[0] || photoDefault;

	return (
		<button
			type="button"
			onClick={() => onOpen(property)}
			className="group grid cursor-pointer grid-cols-[96px_minmax(0,1fr)] gap-4 rounded-xl border border-white/80 bg-white/70 p-3 text-left shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl transition-colors hover:border-slate-300/70 hover:bg-white/90"
		>
			<img
				src={photo}
				alt={property.title}
				className="h-24 w-24 rounded-md object-cover"
				onError={(event) => {
					event.currentTarget.src = photoDefault;
				}}
			/>
			<div className="min-w-0">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<p className="truncate text-sm font-semibold text-slate-950">
							{property.title || "Acomodação sem título"}
						</p>
						<p className="truncate text-xs text-slate-500">
							{property.city || "Cidade não informada"}
						</p>
					</div>
					<ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" />
				</div>
				<div className="mt-3 grid grid-cols-3 gap-2">
					<div>
						<p className="text-[11px] text-slate-400">Receita</p>
						<p className="text-sm font-semibold text-slate-950">
							{formatCurrency(property.monthlyRevenue)}
						</p>
					</div>
					<div>
						<p className="text-[11px] text-slate-400">Ocupação</p>
						<p className="text-sm font-semibold text-slate-950">
							{property.occupancyRate}%
						</p>
					</div>
					<div>
						<p className="text-[11px] text-slate-400">Diária</p>
						<p className="text-sm font-semibold text-slate-950">
							{formatCurrency(property.averageDailyRate)}
						</p>
					</div>
				</div>
				<div className="mt-3 flex flex-wrap items-center gap-2">
					<span
						className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${getStatusTone(mainAlert.tone)}`}
					>
						{mainAlert.label}
					</span>
					<span className="text-[11px] font-medium text-slate-500">
						{property.nextEvent
							? `${property.nextEvent.type} em ${formatDate(property.nextEvent.date)}`
							: "Sem próxima reserva"}
					</span>
				</div>
			</div>
		</button>
	);
}

function AttentionPropertyCard({ property, index, onOpen }) {
	const mainAlert = property.alerts[0];
	const photo = property.photos?.[0] || photoDefault;
	const severityLabel =
		mainAlert.tone === "critical"
			? "Alta prioridade"
			: mainAlert.tone === "warning"
				? "Acompanhar"
				: "Estável";
	const severityClass =
		mainAlert.tone === "critical"
			? "bg-red-950 text-white"
			: mainAlert.tone === "warning"
				? "bg-amber-400 text-slate-950"
				: "bg-teal-600 text-white";

	return (
		<button
			type="button"
			onClick={() => onOpen(property)}
			className="group w-full cursor-pointer rounded-[1.4rem] border border-white/80 bg-white/68 p-3 text-left shadow-[0_14px_36px_rgba(15,23,42,0.045)] backdrop-blur-2xl transition-colors hover:bg-white/90"
		>
			<div className="flex gap-3">
				<div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[1.05rem]">
					<img
						src={photo}
						alt={property.title}
						className="h-full w-full object-cover"
						onError={(event) => {
							event.currentTarget.src = photoDefault;
						}}
					/>
					<span className="absolute left-2 top-2 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-bold text-slate-900 backdrop-blur">
						#{index + 1}
					</span>
				</div>

				<div className="min-w-0 flex-1">
					<div className="flex items-start justify-between gap-3">
						<div className="min-w-0">
							<p className="truncate text-xs font-semibold uppercase tracking-wide text-teal-700">
								{property.city || "Cidade n\u00e3o informada"}
							</p>
							<p className="mt-1 line-clamp-1 text-sm font-semibold text-slate-950">
								{property.title || "Acomodação sem título"}
							</p>
						</div>
						<span
							className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${severityClass}`}
						>
							{severityLabel}
						</span>
					</div>

					<div className="mt-3 grid grid-cols-3 gap-2">
						<div>
							<p className="text-[10px] font-medium text-slate-400">Receita</p>
							<p className="text-xs font-bold text-slate-950">
								{formatCurrency(property.monthlyRevenue)}
							</p>
						</div>
						<div>
							<p className="text-[10px] font-medium text-slate-400">Ocup.</p>
							<p className="text-xs font-bold text-slate-950">
								{property.occupancyRate}%
							</p>
						</div>
						<div>
							<p className="text-[10px] font-medium text-slate-400">Diária</p>
							<p className="text-xs font-bold text-slate-950">
								{formatCurrency(property.averageDailyRate)}
							</p>
						</div>
					</div>

					<div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-200/70 pt-3">
						<p className="min-w-0 truncate text-xs font-medium text-slate-600">
							{mainAlert.label}
						</p>
						<ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1" />
					</div>
				</div>
			</div>
		</button>
	);
}

function InsightActionCard({ alert }) {
	const isCritical = alert.severity === "critical";
	const isWarning = alert.severity === "warning";
	const Icon = isCritical || isWarning ? AlertTriangle : Sparkles;
	const toneClass = isCritical
		? "border-red-200/80 bg-red-50/80 text-red-800"
		: isWarning
			? "border-amber-200/80 bg-amber-50/85 text-amber-800"
			: "border-sky-200/80 bg-sky-50/80 text-sky-800";
	const actionLabel = isCritical
		? "Resolver agora"
		: isWarning
			? "Revisar hoje"
			: "Ver oportunidade";

	return (
		<div className="rounded-[1.4rem] border border-white/80 bg-white/68 p-4 shadow-[0_14px_36px_rgba(15,23,42,0.045)] backdrop-blur-2xl">
			<div className="flex items-start gap-3">
				<div
					className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${toneClass}`}
				>
					<Icon className="h-4 w-4" />
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-2">
						<p className="font-semibold text-slate-950">{alert.title}</p>
						<span
							className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${toneClass}`}
						>
							{alert.severity === "critical"
								? "Crítico"
								: alert.severity === "warning"
									? "Atenção"
									: "Insight"}
						</span>
					</div>
					<p className="mt-2 text-sm leading-relaxed text-slate-600">
						{alert.description}
					</p>
					<div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200/70 pt-3">
						<p className="text-xs font-medium text-slate-500">
							Impacto esperado: operação, conversão ou receita.
						</p>
						<span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-slate-950">
							{actionLabel}
							<ArrowUpRight className="h-3.5 w-3.5" />
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}

function MiniMovementCalendar({ events = [] }) {
	const today = new Date();
	const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
	const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
	const startOffset = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1;
	const eventDates = new Map();

	events.forEach((event) => {
		const eventDate = new Date(event.startDate || event.date);
		if (Number.isNaN(eventDate.getTime())) return;
		const key = eventDate.toISOString().split("T")[0];
		const current = eventDates.get(key) || { checkin: 0, checkout: 0 };
		if (event.type === "checkin" || event.movementType === "Entrada") {
			current.checkin += 1;
		}
		if (event.type === "checkout" || event.movementType === "Saída") {
			current.checkout += 1;
		}
		eventDates.set(key, current);
	});

	const days = [
		...Array.from({ length: startOffset }, () => null),
		...Array.from(
			{ length: monthEnd.getDate() },
			(_, index) => new Date(today.getFullYear(), today.getMonth(), index + 1),
		),
	];

	return (
		<div className="rounded-[1.25rem] border border-slate-200/70 bg-white/45 p-4">
			<div className="mb-4 flex items-center justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
						Calendário
					</p>
					<p className="text-sm font-semibold capitalize text-slate-950">
						{today.toLocaleDateString("pt-BR", {
							month: "long",
							year: "numeric",
						})}
					</p>
				</div>
				<div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">
					<span className="inline-flex items-center gap-1">
						<span className="h-2 w-2 rounded-full bg-teal-600" />
						Entrada
					</span>
					<span className="inline-flex items-center gap-1">
						<span className="h-2 w-2 rounded-full bg-slate-800" />
						Saída
					</span>
				</div>
			</div>
			<div className="grid grid-cols-7 gap-1 text-center">
				{["S", "T", "Q", "Q", "S", "S", "D"].map((day, index) => (
					<div
						key={`${day}-${index}`}
						className="pb-1 text-[10px] font-semibold text-slate-400"
					>
						{day}
					</div>
				))}
				{days.map((day, index) => {
					if (!day) return <div key={`empty-${index}`} className="h-8" />;
					const key = day.toISOString().split("T")[0];
					const eventSummary = eventDates.get(key);
					const isToday = day.toDateString() === today.toDateString();

					return (
						<div
							key={key}
							className={`relative flex h-8 items-center justify-center rounded-full text-xs font-semibold ${
								isToday
									? "bg-slate-950 text-white"
									: eventSummary
										? "bg-white text-slate-950"
										: "text-slate-500"
							}`}
						>
							{day.getDate()}
							{eventSummary && (
								<span className="absolute bottom-1 flex gap-0.5">
									{eventSummary.checkin > 0 && (
										<span className="h-1 w-1 rounded-full bg-teal-600" />
									)}
									{eventSummary.checkout > 0 && (
										<span className="h-1 w-1 rounded-full bg-slate-800" />
									)}
								</span>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

function AccommodationOperationalCard({ property }) {
	const photos = [
		property.photos?.[0] || photoDefault,
		property.photos?.[1] || property.photos?.[0] || photoDefault,
		property.photos?.[2] || property.photos?.[0] || photoDefault,
	];
	const mainAlert = property.alerts[0];

	return (
		<div className="w-full rounded-[1.35rem] border border-white/80 bg-white/68 p-4 text-left shadow-[0_14px_38px_rgba(15,23,42,0.045)] backdrop-blur-2xl">
			<div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
				<div className="grid h-48 grid-cols-8 grid-rows-4 gap-2 overflow-hidden rounded-[1.1rem]">
					{photos.map((photo, index) => (
						<img
							key={`${property.id}-photo-${index}`}
							src={photo}
							alt={property.title}
							className={`h-full w-full object-cover ${
								index === 0 ? "col-span-5 row-span-4" : "col-span-3 row-span-2"
							}`}
							onError={(event) => {
								event.currentTarget.src = photoDefault;
							}}
						/>
					))}
				</div>

				<div className="flex min-w-0 flex-col justify-between gap-5">
					<div>
						<div className="flex items-start justify-between gap-4">
							<div className="min-w-0">
								<p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
									{property.city || "Cidade não informada"}
								</p>
								<h3 className="mt-1 line-clamp-2 text-2xl font-semibold leading-tight text-slate-950">
									{property.title || "Acomoda\u00e7\u00e3o sem t\u00edtulo"}
								</h3>
							</div>
							<Link
								to={`/account/places/new/${property._id}`}
								className="mt-1 shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
							>
								Editar
							</Link>
						</div>

						<div className="mt-3 flex flex-wrap items-end gap-3">
							<p className="text-2xl font-semibold tabular-nums text-slate-950">
								{formatCurrency(property.price)}
								<span className="ml-1 text-sm font-medium text-slate-500">
									/noite
								</span>
							</p>
							<span
								className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusTone(mainAlert.tone)}`}
							>
								{mainAlert.label}
							</span>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-2 md:grid-cols-4">
						<div className="border-l border-slate-200 pl-3">
							<p className="text-[11px] font-medium text-slate-400">
								Receita mês
							</p>
							<p className="mt-1 text-sm font-semibold text-slate-950">
								{formatCurrency(property.monthlyRevenue)}
							</p>
						</div>
						<div className="border-l border-slate-200 pl-3">
							<p className="text-[11px] font-medium text-slate-400">Ocupação</p>
							<p className="mt-1 text-sm font-semibold text-slate-950">
								{property.occupancyRate}%
							</p>
						</div>
						<div className="border-l border-slate-200 pl-3">
							<p className="text-[11px] font-medium text-slate-400">
								Próxima reserva
							</p>
							<p className="mt-1 text-sm font-semibold text-slate-950">
								{property.nextEvent
									? `${property.nextEvent.type} · ${formatDate(property.nextEvent.date)}`
									: "Sem agenda"}
							</p>
						</div>
						<div className="border-l border-slate-200 pl-3">
							<p className="text-[11px] font-medium text-slate-400">
								Avaliação
							</p>
							<p className="mt-1 flex items-center gap-1 text-sm font-semibold text-slate-950">
								<Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
								{property.averageRating
									? Number(property.averageRating).toFixed(1)
									: "-"}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function PropertyQuickStat({
	icon: Icon,
	label,
	value,
	helper,
	tone = "slate",
}) {
	const toneClass =
		tone === "teal"
			? "bg-teal-50 text-teal-800 ring-teal-100"
			: tone === "sky"
				? "bg-sky-50 text-sky-800 ring-sky-100"
				: tone === "amber"
					? "bg-amber-50 text-amber-800 ring-amber-100"
					: "bg-white/80 text-slate-800 ring-slate-200";

	return (
		<div className={`min-w-0 rounded-2xl px-3 py-3 ring-1 ${toneClass}`}>
			<div className="flex items-center gap-2">
				<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/80 text-current shadow-sm">
					<Icon className="h-4 w-4" />
				</span>
				<div className="min-w-0">
					<p className="truncate text-[11px] font-semibold uppercase tracking-wide opacity-70">
						{label}
					</p>
					<p className="truncate text-base font-semibold tabular-nums">
						{value}
					</p>
				</div>
			</div>
			{helper && (
				<p className="mt-2 truncate text-[11px] font-medium opacity-65">
					{helper}
				</p>
			)}
		</div>
	);
}

function PropertyOperationalBoardCard({ property, rank }) {
	const mainAlert = property.alerts[0];
	const photo = property.photos?.[0] || photoDefault;
	const galleryPhotos = [
		property.photos?.[0] || photoDefault,
		property.photos?.[1] || property.photos?.[0] || photoDefault,
		property.photos?.[2] || property.photos?.[0] || photoDefault,
	];
	const rating = property.averageRating
		? Number(property.averageRating).toFixed(1)
		: "-";
	const photoCount = property.photos?.length || 0;
	const amenitiesCount = property.perks?.length || 0;
	const totalBookings = property.activeBookings?.length || 0;
	const totalRevenue = property.totalRevenue || 0;
	const progressColor =
		mainAlert.tone === "critical"
			? "bg-red-500"
			: mainAlert.tone === "warning"
				? "bg-amber-500"
				: "bg-teal-600";
	const toneClass =
		mainAlert.tone === "critical"
			? "border-red-200 bg-red-50 text-red-700"
			: mainAlert.tone === "warning"
				? "border-amber-200 bg-amber-50 text-amber-700"
				: "border-teal-200 bg-teal-50 text-teal-700";

	return (
		<article className="group overflow-hidden rounded-[1.7rem] border border-white/80 bg-white/72 p-3 shadow-[0_18px_48px_rgba(15,23,42,0.055)] backdrop-blur-2xl transition-colors hover:bg-white">
			<div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)_220px]">
				<div className="relative grid min-h-[250px] grid-cols-[1.55fr_0.9fr] gap-2 overflow-hidden rounded-[1.35rem] bg-slate-100">
					<img
						src={galleryPhotos[0]}
						alt={property.title}
						className="h-full w-full object-cover"
						onError={(event) => {
							event.currentTarget.src = photoDefault;
						}}
					/>
					<div className="grid min-h-0 gap-2">
						{galleryPhotos.slice(1).map((galleryPhoto, index) => (
							<img
								key={`${property.id}-gallery-${index}`}
								src={galleryPhoto}
								alt={`${property.title} - foto ${index + 2}`}
								className="h-full min-h-0 w-full object-cover"
								onError={(event) => {
									event.currentTarget.src = photoDefault;
								}}
							/>
						))}
					</div>
					<div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
					<div className="absolute left-3 top-3 flex items-center gap-2">
						<span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-slate-950 shadow-sm backdrop-blur">
							#{rank}
						</span>
						<span
							className={`rounded-full border px-3 py-1 text-[11px] font-bold shadow-sm backdrop-blur ${toneClass}`}
						>
							{mainAlert.label}
						</span>
					</div>
					<div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
						<p className="inline-flex min-w-0 items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-700 backdrop-blur">
							<MapPin className="h-3.5 w-3.5 shrink-0 text-teal-700" />
							<span className="truncate">
								{property.city || "Cidade não informada"}
							</span>
						</p>
						<p className="shrink-0 rounded-full bg-slate-950/85 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
							{property.isActive ? "Ativo" : "Inativo"}
						</p>
					</div>
				</div>

				<div className="flex min-w-0 flex-col justify-between gap-5 p-1">
					<div>
						<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
							<div className="min-w-0">
								<p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
									Quadro operacional
								</p>
								<h4 className="mt-1 line-clamp-2 text-2xl font-semibold leading-tight text-slate-950">
									{property.title || "Acomodação sem título"}
								</h4>
							</div>
							<p className="shrink-0 text-left md:text-right">
								<span className="block text-2xl font-semibold tabular-nums text-slate-950">
									{formatCurrency(property.price)}
								</span>
								<span className="text-xs font-medium text-slate-500">
									por noite
								</span>
							</p>
						</div>

						<div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
							<PropertyQuickStat
								icon={Users2}
								label={"H\u00f3spedes"}
								value={property.guests || "-"}
								helper="capacidade"
								tone="teal"
							/>
							<PropertyQuickStat
								icon={DoorOpen}
								label="Quartos"
								value={property.rooms || "-"}
								helper={`${property.beds || 0} camas`}
								tone="sky"
							/>
							<PropertyQuickStat
								icon={Bath}
								label="Banheiros"
								value={property.bathrooms || "-"}
								helper={`${photoCount} fotos`}
							/>
							<PropertyQuickStat
								icon={Star}
								label="Nota"
								value={rating}
								helper={`${amenitiesCount} comodidades`}
								tone="amber"
							/>
						</div>
					</div>

					<div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px]">
						<div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4">
							<div className="flex items-center justify-between gap-3">
								<div>
									<p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
										{"Ocupa\u00e7\u00e3o mensal"}
									</p>
									<p className="mt-1 text-2xl font-semibold tabular-nums text-slate-950">
										{property.occupancyRate}%
									</p>
								</div>
								<div className="text-right text-xs font-medium text-slate-500">
									<p>{property.bookedNights} noites</p>
									<p>{totalBookings} reservas ativas</p>
								</div>
							</div>
							<div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
								<div
									className={`h-full rounded-full ${progressColor}`}
									style={{ width: `${Math.min(property.occupancyRate, 100)}%` }}
								/>
							</div>
						</div>

						<div className="rounded-2xl bg-slate-950 p-4 text-white">
							<p className="text-xs font-semibold uppercase tracking-wide text-white/55">
								{"Receita m\u00eas"}
							</p>
							<p className="mt-2 text-2xl font-semibold tabular-nums">
								{formatCurrency(property.monthlyRevenue)}
							</p>
							<p className="mt-2 text-xs font-medium text-white/55">
								Total: {formatCurrency(totalRevenue)}
							</p>
						</div>
					</div>
				</div>

				<aside className="flex min-w-0 flex-col justify-between gap-3 rounded-[1.35rem] bg-slate-50/80 p-4">
					<div className="space-y-3">
						<div className="rounded-2xl border border-slate-200/70 bg-white p-3">
							<p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
								{"Pr\u00f3xima movimenta\u00e7\u00e3o"}
							</p>
							<p className="mt-2 text-sm font-semibold text-slate-950">
								{property.nextEvent
									? `${property.nextEvent.type} em ${formatDate(property.nextEvent.date)}`
									: "Sem reserva futura"}
							</p>
						</div>
						<div className="grid grid-cols-2 gap-2 text-sm">
							<div className="rounded-2xl border border-slate-200/70 bg-white p-3">
								<BedDouble className="h-4 w-4 text-slate-400" />
								<p className="mt-2 font-semibold text-slate-950">
									{property.beds || "-"}
								</p>
								<p className="text-[11px] text-slate-500">camas</p>
							</div>
							<div className="rounded-2xl border border-slate-200/70 bg-white p-3">
								<Camera className="h-4 w-4 text-slate-400" />
								<p className="mt-2 font-semibold text-slate-950">
									{photoCount}
								</p>
								<p className="text-[11px] text-slate-500">fotos</p>
							</div>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<Link
							to={`/places/${property._id}`}
							className="flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
						>
							<Eye className="h-4 w-4" />
							Ver
						</Link>
						<Link
							to={`/account/places/new/${property._id}`}
							className="flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-950 px-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
						>
							Editar
							<ArrowUpRight className="h-4 w-4" />
						</Link>
					</div>
				</aside>
			</div>
		</article>
	);
}

function PropertyRankingRow({ property, rank }) {
	const mainAlert = property.alerts[0];
	const toneClass =
		mainAlert.tone === "critical"
			? "border-red-200 bg-red-50 text-red-700"
			: mainAlert.tone === "warning"
				? "border-amber-200 bg-amber-50 text-amber-700"
				: "border-teal-200 bg-teal-50 text-teal-700";

	return (
		<div className="group grid gap-4 rounded-[1.3rem] border border-white/80 bg-white/72 p-4 shadow-[0_12px_32px_rgba(15,23,42,0.04)] backdrop-blur-2xl transition-colors hover:bg-white">
			<div className="grid gap-4 lg:grid-cols-[84px_minmax(0,1fr)_auto] lg:items-center">
				<div className="relative h-20 w-20 overflow-hidden rounded-[1rem]">
					<img
						src={property.photos?.[0] || photoDefault}
						alt={property.title}
						className="h-full w-full object-cover"
						onError={(event) => {
							event.currentTarget.src = photoDefault;
						}}
					/>
					<span className="absolute left-2 top-2 rounded-full bg-slate-950 px-2 py-0.5 text-[10px] font-bold text-white">
						#{rank}
					</span>
				</div>

				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-2">
						<h4 className="truncate text-base font-semibold text-slate-950">
							{property.title || "Acomodação sem título"}
						</h4>
						<span
							className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${toneClass}`}
						>
							{mainAlert.label}
						</span>
					</div>
					<p className="mt-1 text-sm text-slate-500">
						{property.city || "Cidade não informada"} ·{" "}
						{property.isActive ? "Ativo" : "Inativo"}
					</p>

					<div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
						<div>
							<p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
								Receita
							</p>
							<p className="font-semibold text-slate-950">
								{formatCurrency(property.monthlyRevenue)}
							</p>
						</div>
						<div>
							<p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
								Ocupação
							</p>
							<p className="font-semibold text-slate-950">
								{property.occupancyRate}%
							</p>
						</div>
						<div>
							<p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
								Próxima
							</p>
							<p className="font-semibold text-slate-950">
								{property.nextEvent
									? formatDate(property.nextEvent.date)
									: "Sem reserva"}
							</p>
						</div>
						<div>
							<p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
								Avaliação
							</p>
							<p className="font-semibold text-slate-950">
								{property.averageRating
									? Number(property.averageRating).toFixed(1)
									: "-"}
							</p>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-3 lg:justify-end">
					<div className="text-right">
						<p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
							Diária
						</p>
						<p className="text-lg font-semibold tabular-nums text-slate-950">
							{formatCurrency(property.price)}
						</p>
					</div>
					<Link
						to={`/account/places/new/${property._id}`}
						className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
					>
						Editar
						<ArrowUpRight className="h-3.5 w-3.5" />
					</Link>
				</div>
			</div>
		</div>
	);
}

function PropertyDrawer({ property, open, onOpenChange }) {
	if (!property) return null;

	const photo = property.photos?.[0] || photoDefault;

	return (
		<Drawer open={open} onOpenChange={onOpenChange} direction="right">
			<DrawerContent className="w-[92vw] max-w-xl overflow-y-auto border-l border-slate-200 bg-white sm:max-w-2xl">
				<DrawerHeader className="border-b border-slate-100 p-6 text-left">
					<div className="flex gap-4">
						<img
							src={photo}
							alt={property.title}
							className="h-24 w-24 rounded-lg object-cover"
							onError={(event) => {
								event.currentTarget.src = photoDefault;
							}}
						/>
						<div className="min-w-0 flex-1">
							<DrawerTitle className="text-xl text-slate-950">
								{property.title}
							</DrawerTitle>
							<DrawerDescription className="mt-1 text-slate-500">
								{property.city || "Cidade não informada"} ·{" "}
								{property.isActive ? "Anúncio ativo" : "Anúncio inativo"}
							</DrawerDescription>
							<div className="mt-4 flex flex-wrap gap-2">
								<Link
									to={`/account/places/new/${property._id}`}
									className="inline-flex h-9 items-center gap-2 rounded-md bg-slate-950 px-3 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
								>
									Editar
									<ArrowUpRight className="h-3.5 w-3.5" />
								</Link>
								<Link
									to={`/places/${property._id}`}
									className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
								>
									Ver anúncio
									<ExternalLink className="h-3.5 w-3.5" />
								</Link>
							</div>
						</div>
					</div>
				</DrawerHeader>

				<div className="space-y-6 p-6">
					<div className="grid grid-cols-2 gap-3">
						<HostMetric
							label="Receita mês"
							value={formatCurrency(property.monthlyRevenue)}
							helper="Receita aprovada no mês"
							icon={DollarSign}
						/>
						<HostMetric
							label="Ocupação"
							value={`${property.occupancyRate}%`}
							helper={`${property.bookedNights} noites registradas`}
							icon={CalendarDays}
						/>
						<HostMetric
							label="Diária média"
							value={formatCurrency(property.averageDailyRate)}
							helper={`Preço listado: ${formatCurrency(property.price)}`}
							icon={LineChartIcon}
						/>
						<HostMetric
							label="Avaliação"
							value={
								property.averageRating ? property.averageRating.toFixed(1) : "-"
							}
							helper="Média pública do anúncio"
							icon={Star}
						/>
					</div>

					<section>
						<h3 className="text-sm font-semibold text-slate-950">
							Diagnóstico
						</h3>
						<div className="mt-3 space-y-2">
							{property.alerts.map((alert) => (
								<div
									key={alert.label}
									className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium ${getStatusTone(alert.tone)}`}
								>
									{alert.tone === "success" ? (
										<CheckCircle2 className="h-4 w-4" />
									) : (
										<AlertTriangle className="h-4 w-4" />
									)}
									{alert.label}
								</div>
							))}
						</div>
					</section>

					<section>
						<h3 className="text-sm font-semibold text-slate-950">
							Próxima movimentação
						</h3>
						<div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
							{property.nextEvent ? (
								<div className="flex items-center justify-between gap-4">
									<div>
										<p className="text-sm font-semibold text-slate-950">
											{property.nextEvent.type}
										</p>
										<p className="text-xs text-slate-500">
											{property.nextEvent.booking?.user?.name || "Hóspede"} ·{" "}
											{formatDate(property.nextEvent.date)}
										</p>
									</div>
									<span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
										{property.nextEvent.booking?.guests || 1} hóspede(s)
									</span>
								</div>
							) : (
								<p className="text-sm text-slate-500">
									Não há entradas ou saídas futuras para esta acomodação.
								</p>
							)}
						</div>
					</section>
				</div>
			</DrawerContent>
		</Drawer>
	);
}

function HostCenter({
	initialView = "today",
	activeSection: controlledActiveSection,
}) {
	const [internalActiveSection, setInternalActiveSection] = useState(initialView);
	const [payload, setPayload] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [selectedProperty, setSelectedProperty] = useState(null);
	const [calendarExpanded, setCalendarExpanded] = useState(false);
	const [movementsExpanded, setMovementsExpanded] = useState(false);
	const [attentionCollapsed, setAttentionCollapsed] = useState(false);
	const [showAttentionContent, setShowAttentionContent] = useState(true);
	const activeSection = controlledActiveSection ?? internalActiveSection;

	useEffect(() => {
		if (!controlledActiveSection) {
			setInternalActiveSection(initialView);
		}
	}, [controlledActiveSection, initialView]);

	useEffect(() => {
		setAttentionCollapsed(movementsExpanded);
	}, [movementsExpanded]);

	useEffect(() => {
		if (attentionCollapsed) {
			setShowAttentionContent(false);
			return undefined;
		}

		const timeoutId = window.setTimeout(() => {
			setShowAttentionContent(true);
		}, 650);

		return () => window.clearTimeout(timeoutId);
	}, [attentionCollapsed]);

	useEffect(() => {
		const loadDashboard = async () => {
			try {
				setLoading(true);
				setError("");
				const raw = await getHostDashboard();
				const metrics = calculatePerformanceMetrics(
					raw.bookings || [],
					raw.places || [],
					raw.metrics || {},
				);

				setPayload({
					bookings: raw.bookings || [],
					places: raw.places || [],
					calendar: raw.calendar || { events: [], emptyDays: [] },
					today: raw.today || { checkins: 0, checkouts: 0, pendingBookings: 0 },
					finance: calculateFinancialMetrics(raw.finance || {}),
					metrics,
					rentalKPIs: calculateRentalKPIs(raw.bookings || [], raw.places || []),
					revenueData: calculateMonthlyRevenue(raw.bookings || []),
					alerts: generateAlerts(raw.alerts || [], raw.today || {}, metrics),
				});
			} catch (err) {
				console.error("Erro ao carregar central do anfitrião:", err);
				setError("Não foi possível carregar a Central do Anfitrião agora.");
			} finally {
				setLoading(false);
			}
		};

		loadDashboard();
	}, []);

	const data = useMemo(() => {
		if (!payload) return null;
		const propertyStats = buildPropertyStats(payload.places, payload.bookings);
		const allAlerts = [
			...payload.alerts.critical,
			...payload.alerts.warning,
			...payload.alerts.info,
		];
		const urgentAlerts = allAlerts.filter((alert) =>
			["critical", "warning"].includes(alert.severity),
		);
		const upcomingMovements = (payload.calendar?.events || [])
			.filter((event) => event.type === "checkin" || event.type === "checkout")
			.map((event) => ({
				...event,
				date: new Date(event.startDate),
				movementType: event.type === "checkin" ? "Entrada" : "Saída",
			}))
			.filter((event) => event.date >= new Date())
			.sort((a, b) => a.date - b.date);

		return {
			...payload,
			propertyStats,
			allAlerts,
			urgentAlerts,
			upcomingMovements,
		};
	}, [payload]);

	if (loading) {
		return (
			<div className="flex min-h-[70vh] items-center justify-center bg-slate-50">
				<div className="text-center">
					<div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-slate-950" />
					<p className="mt-4 text-sm font-medium text-slate-500">
						Carregando Central do Anfitrião...
					</p>
				</div>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="flex min-h-[70vh] items-center justify-center bg-slate-50">
				<div className="rounded-lg border border-red-100 bg-white p-6 text-center shadow-sm">
					<p className="font-semibold text-red-700">{error}</p>
					<button
						type="button"
						onClick={() => window.location.reload()}
						className="mt-4 h-10 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white"
					>
						Tentar novamente
					</button>
				</div>
			</div>
		);
	}

	const todayTotal =
		(data.today.checkins || 0) +
		(data.today.checkouts || 0) +
		(data.today.pendingBookings || 0);
	const revenueChartHasData = data.revenueData.some(
		(item) => Number(item.receita || item.projecao || 0) > 0,
	);
	const propertyChartData = data.propertyStats.slice(0, 6).map((property) => ({
		name: property.title?.slice(0, 16) || "Acomodação",
		receita: property.monthlyRevenue,
		ocupacao: property.occupancyRate,
		status: property.alerts[0]?.tone,
	}));
	const placesRevenue = data.propertyStats.reduce(
		(total, property) => total + property.monthlyRevenue,
		0,
	);
	const placesOccupancyAverage = data.propertyStats.length
		? Math.round(
				data.propertyStats.reduce(
					(total, property) => total + property.occupancyRate,
					0,
				) / data.propertyStats.length,
			)
		: 0;
	const activePlacesCount = data.propertyStats.filter(
		(property) => property.isActive,
	).length;
	const placesAttentionCount = data.propertyStats.filter((property) =>
		["critical", "warning"].includes(property.alerts[0]?.tone),
	).length;

	return (
		<div className="min-h-screen bg-white text-slate-950">
			<div className="mx-auto w-full max-w-7xl px-3">
				<main className="min-w-0">
					<section className="px-1 py-8 md:px-0">
						<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
							<div>
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
									Central do Anfitrião
								</p>
								<h2 className="mt-2 text-4xl font-semibold tracking-[-0.01em] text-slate-950">
									Bem-vindo, anfitrião
								</h2>
							</div>
							<div className="max-w-xl rounded-[1.5rem] border border-white/70 bg-white/45 px-5 py-4 text-sm text-slate-600 shadow-[0_14px_40px_rgba(15,23,42,0.05)] backdrop-blur-2xl">
								{todayTotal > 0
									? `${todayTotal} ponto(s) operacionais para acompanhar hoje.`
									: "Operação sem urgências imediatas."}{" "}
								{data.urgentAlerts.length > 0
									? `${data.urgentAlerts.length} alerta(s) merecem prioridade.`
									: "Nenhum alerta crítico ativo."}
							</div>
						</div>
					</section>

					<div className="space-y-8 pb-8">
						{activeSection === "today" && (
							<>
								<section className="grid grid-cols-1 gap-4 md:grid-cols-3">
									<HostMetric
										label="Entradas hoje"
										value={data.today.checkins || 0}
										helper="Preparar recepção e horários"
										icon={Home}
									/>
									<HostMetric
										label="Saídas hoje"
										value={data.today.checkouts || 0}
										helper="Organizar limpeza e vistoria"
										icon={Clock3}
									/>
									<HostMetric
										label="Reservas pendentes"
										value={data.today.pendingBookings || 0}
										helper="Responder rápido aumenta conversão"
										icon={MessageCircle}
									/>
								</section>

								<section
									className={`grid grid-cols-1 gap-5 ${
										movementsExpanded
											? attentionCollapsed
												? "xl:grid-cols-[minmax(0,1fr)_76px]"
												: "xl:grid-cols-[minmax(0,1fr)_260px]"
											: "xl:grid-cols-[1.35fr_0.65fr]"
									} transition-[grid-template-columns] duration-1000 ease-in-out`}
								>
									<div className="rounded-[1.6rem] border border-white/80 bg-white/55 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.045)] backdrop-blur-2xl">
										<div className="mb-5 flex items-start justify-between gap-4">
											<div>
												<h3 className="font-semibold text-slate-950">
													Próximas movimentações
												</h3>
												<p className="text-sm text-slate-500">
													Entradas e saídas em ordem operacional.
												</p>
											</div>
											<button
												type="button"
												onClick={() => {
													setShowAttentionContent(false);
													setMovementsExpanded((expanded) => !expanded);
													setAttentionCollapsed((collapsed) =>
														movementsExpanded ? false : true,
													);
												}}
												className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50"
											>
												{movementsExpanded ? (
													<ChevronsLeft className="h-5 w-5" />
												) : (
													<ChevronsLeft className="h-5 w-5 rotate-180" />
												)}
												{/* {movementsExpanded ? "Restaurar" : "Expandir"} */}
											</button>
										</div>
										<div className="space-y-4">
											<div className="overflow-hidden rounded-2xl">
												<CalendarGridMonth calendar={data.calendar} compact />
											</div>
											<div className="grid gap-2 md:grid-cols-2">
												{data.upcomingMovements.slice(0, 4).map((event) => (
													<div
														key={`${event.id}-${event.type}`}
														className="rounded-2xl border border-slate-200/70 bg-white/55 px-3 py-2.5"
													>
														<div className="flex items-center justify-between gap-3">
															<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
																{formatDate(event.date)}
															</p>
															<span className="rounded-full bg-slate-950 px-2.5 py-1 text-[10px] font-semibold text-white">
																{event.movementType}
															</span>
														</div>
														<p className="mt-2 truncate text-sm font-semibold text-slate-950">
															{event.placeTitle}
														</p>
														<p className="truncate text-xs text-slate-500">
															{event.guest} · {event.guestCount || 1} hosp.
														</p>
													</div>
												))}
												{data.upcomingMovements.length === 0 && (
													<p className="py-8 text-center text-sm text-slate-500">
														Sem movimentações futuras registradas.
													</p>
												)}
											</div>
										</div>
									</div>

									<div
										className={`rounded-[1.6rem] border border-white/80 bg-white/55 shadow-[0_16px_40px_rgba(15,23,42,0.045)] backdrop-blur-2xl ${
											attentionCollapsed
												? "p-3"
												: movementsExpanded
													? "p-4"
													: "p-5"
										} transition-all duration-1000 ease-in-out`}
									>
										{attentionCollapsed ? (
											<></>
										) : (
											<div
												className={`transition-all duration-500 ease-out ${
													showAttentionContent
														? "translate-x-0 opacity-100"
														: "translate-x-4 opacity-0"
												}`}
											>
												<div className="mb-4">
													<p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
														Dados rápidos
													</p>
													<h3 className="mt-1 font-semibold text-slate-950">
														Receita e performance
													</h3>
												</div>
												<div className="space-y-4">
													<div className="rounded-2xl border border-slate-200/70 bg-white/60 p-3">
														<h4 className="mb-3 text-xs font-semibold text-slate-700">
															Receita realizada e projeção
														</h4>
														<div className="h-[190px]">
															{revenueChartHasData ? (
																<ResponsiveContainer width="100%" height="100%">
																	<LineChart data={data.revenueData}>
																		<CartesianGrid
																			stroke="#e2e8f0"
																			strokeDasharray="4 4"
																			vertical={false}
																		/>
																		<XAxis
																			dataKey="mes"
																			tickLine={false}
																			axisLine={false}
																			tick={{ fontSize: 10 }}
																		/>
																		<YAxis
																			tickLine={false}
																			axisLine={false}
																			tick={{ fontSize: 10 }}
																			tickFormatter={formatCurrency}
																		/>
																		<RechartsTooltip
																			formatter={(value) =>
																				formatCurrency(value)
																			}
																		/>
																		<Line
																			type="monotone"
																			dataKey="receita"
																			stroke="#0f766e"
																			strokeWidth={2.5}
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
																<div className="flex h-full items-center justify-center text-xs text-slate-500">
																	Sem dados de receita.
																</div>
															)}
														</div>
													</div>
													<div className="rounded-2xl border border-slate-200/70 bg-white/60 p-3">
														<h4 className="mb-3 text-xs font-semibold text-slate-700">
															Desempenho por imóvel
														</h4>
														<div className="h-[190px]">
															<ResponsiveContainer width="100%" height="100%">
																<BarChart data={propertyChartData}>
																	<CartesianGrid
																		stroke="#e2e8f0"
																		strokeDasharray="4 4"
																		vertical={false}
																	/>
																	<XAxis
																		dataKey="name"
																		tickLine={false}
																		axisLine={false}
																		tick={{ fontSize: 10 }}
																	/>
																	<YAxis
																		tickLine={false}
																		axisLine={false}
																		tick={{ fontSize: 10 }}
																		tickFormatter={formatCurrency}
																	/>
																	<RechartsTooltip
																		formatter={(value) => formatCurrency(value)}
																	/>
																	<Bar dataKey="receita" radius={[6, 6, 0, 0]}>
																		{propertyChartData.map((item) => (
																			<Cell
																				key={item.name}
																				fill={
																					item.status === "critical"
																						? "#dc2626"
																						: item.status === "warning"
																							? "#d97706"
																							: "#0f766e"
																				}
																			/>
																		))}
																	</Bar>
																</BarChart>
															</ResponsiveContainer>
														</div>
													</div>
												</div>
											</div>
										)}
									</div>
								</section>
							</>
						)}

						{activeSection === "places" && (
							<section>
								<div className="mb-5 overflow-hidden rounded-[2rem] border border-white/80 bg-[#eef6f3] p-4 shadow-[0_18px_50px_rgba(15,23,42,0.055)]">
									<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch">
										<div className="flex min-h-[210px] flex-col justify-between rounded-[1.5rem] bg-white/65 p-5 backdrop-blur-xl">
											<div>
												<p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
													Quadro operacional
												</p>
												<h3 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.01em] text-slate-950">
													{"Lista operacional de im\u00f3veis"}
												</h3>
												<p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
													{
														"Painel por acomoda\u00e7\u00e3o com capacidade, fotos, comodidades, receita, ocupa\u00e7\u00e3o e pr\u00f3xima movimenta\u00e7\u00e3o."
													}
												</p>
											</div>
											<div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">
												<HostMetric
													label={"Im\u00f3veis ativos"}
													value={`${activePlacesCount}/${data.propertyStats.length}`}
													helper={"An\u00fancios publicados"}
													icon={Building2}
												/>
												<HostMetric
													label={"Receita do m\u00eas"}
													value={formatCurrency(placesRevenue)}
													helper={"Soma por acomoda\u00e7\u00e3o"}
													icon={DollarSign}
													trend="up"
												/>
												<HostMetric
													label={"Ocupa\u00e7\u00e3o m\u00e9dia"}
													value={`${placesOccupancyAverage}%`}
													helper={"M\u00e9dia operacional"}
													icon={BarChart3}
												/>
												<HostMetric
													label={"Em aten\u00e7\u00e3o"}
													value={placesAttentionCount}
													helper={"Alertas cr\u00edticos ou aviso"}
													icon={AlertTriangle}
													trend={placesAttentionCount ? "down" : undefined}
												/>
											</div>
										</div>
										<div className="relative min-h-[210px] overflow-hidden rounded-[1.5rem] bg-slate-950 p-5 text-white">
											<div className="absolute right-0 top-0 h-32 w-32 rounded-bl-[4rem] bg-teal-400/30" />
											<div className="relative z-10 flex h-full flex-col justify-between">
												<div>
													<p className="text-xs font-semibold uppercase tracking-wide text-white/55">
														{"Portf\u00f3lio"}
													</p>
													<p className="mt-2 text-4xl font-semibold tabular-nums">
														{data.propertyStats.length}
													</p>
													<p className="mt-1 text-sm font-medium text-white/55">
														{"acomoda\u00e7\u00f5es acompanhadas"}
													</p>
												</div>
												<Link
													to="/account/places/new"
													className="inline-flex h-11 w-fit cursor-pointer items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-slate-100"
												>
													<Plus className="h-4 w-4" />
													{"Novo an\u00fancio"}
												</Link>
											</div>
										</div>
									</div>
								</div>
								<div className="hidden">
									<div>
										<h3 className="text-xl font-semibold text-slate-950">
											Lista operacional de imóveis
										</h3>
										<p className="text-sm text-slate-500">
											Ranking de performance com leitura rápida de receita,
											ocupação e risco.
										</p>
									</div>
									<Link
										to="/account/places/new"
										className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
									>
										<Plus className="h-4 w-4" />
										Novo anúncio
									</Link>
								</div>
								<div className="space-y-4">
									{data.propertyStats.map((property, index) => (
										<PropertyOperationalBoardCard
											key={property.id}
											property={property}
											rank={index + 1}
										/>
									))}
								</div>
							</section>
						)}

						{activeSection === "__legacy_places__" && (
							<section>
								<div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
									<div>
										<h3 className="text-xl font-semibold text-slate-950">
											Mini dashboards por acomodação
										</h3>
										<p className="text-sm text-slate-500">
											Cada imóvel mostra receita, ocupação, próxima reserva e
											alertas.
										</p>
									</div>
									<Link
										to="/account/places/new"
										className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
									>
										<Plus className="h-4 w-4" />
										Novo anúncio
									</Link>
								</div>
								<div className="grid grid-cols-1 gap-4">
									{data.propertyStats.map((property) => (
										<AccommodationOperationalCard
											key={property.id}
											property={property}
										/>
									))}
								</div>
							</section>
						)}

						{activeSection === "performance" && (
							<section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
								<div className="rounded-xl border border-white/80 bg-white/65 p-5 shadow-[0_12px_32px_rgba(15,23,42,0.04)] backdrop-blur-xl">
									<h3 className="font-semibold text-slate-950">
										Receita realizada e projeção
									</h3>
									<div className="mt-5 h-[320px]">
										{revenueChartHasData ? (
											<ResponsiveContainer width="100%" height="100%">
												<LineChart data={data.revenueData}>
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
													<RechartsTooltip
														formatter={(value) => formatCurrency(value)}
													/>
													<Line
														type="monotone"
														dataKey="receita"
														stroke="#0f766e"
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
											<div className="flex h-full items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-500">
												Sem receita suficiente para gráfico.
											</div>
										)}
									</div>
								</div>

								<div className="rounded-xl border border-white/80 bg-white/65 p-5 shadow-[0_12px_32px_rgba(15,23,42,0.04)] backdrop-blur-xl">
									<h3 className="font-semibold text-slate-950">
										Desempenho por imóvel
									</h3>
									<div className="mt-5 h-[320px]">
										<ResponsiveContainer width="100%" height="100%">
											<BarChart data={propertyChartData}>
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
												<RechartsTooltip
													formatter={(value) => formatCurrency(value)}
												/>
												<Bar dataKey="receita" radius={[6, 6, 0, 0]}>
													{propertyChartData.map((item) => (
														<Cell
															key={item.name}
															fill={
																item.status === "critical"
																	? "#dc2626"
																	: item.status === "warning"
																		? "#d97706"
																		: "#0f766e"
															}
														/>
													))}
												</Bar>
											</BarChart>
										</ResponsiveContainer>
									</div>
								</div>
							</section>
						)}

						{activeSection === "finance" && (
							<section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
								<HostMetric
									label="Receita do mês"
									value={formatCurrency(data.finance.monthlyEarnings)}
									helper="Ganhos aprovados no período"
									icon={DollarSign}
									trend="up"
								/>
								<HostMetric
									label="Receita futura"
									value={formatCurrency(data.finance.futureEarnings)}
									helper="Reservas futuras aprovadas"
									icon={TrendingUp}
								/>
								<HostMetric
									label="Taxas"
									value={formatCurrency(data.finance.totalFees)}
									helper="Custo operacional estimado"
									icon={Banknote}
								/>
								<HostMetric
									label="RevPAR"
									value={formatCurrency(data.rentalKPIs.revPAR)}
									helper="Receita por noite disponível"
									icon={BarChart3}
								/>
							</section>
						)}

						{activeSection === "performance" && (
							<section className="rounded-[1.8rem] border border-white/80 bg-white/55 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.045)] backdrop-blur-2xl">
								<div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
									<div>
										<div className="flex items-center gap-2">
											<span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-white">
												<Sparkles className="h-4 w-4" />
											</span>
											<div>
												<h3 className="font-semibold text-slate-950">
													Sugestões e ações
												</h3>
												<p className="mt-1 text-sm text-slate-500">
													Priorização executiva para melhorar operação,
													conversão e receita.
												</p>
											</div>
										</div>
									</div>

									<div className="grid grid-cols-3 gap-2 md:min-w-72">
										<div className="rounded-2xl bg-white/60 px-3 py-2 text-center">
											<p className="text-lg font-semibold text-red-700">
												{
													data.allAlerts.filter(
														(alert) => alert.severity === "critical",
													).length
												}
											</p>
											<p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
												Críticos
											</p>
										</div>
										<div className="rounded-2xl bg-white/60 px-3 py-2 text-center">
											<p className="text-lg font-semibold text-amber-700">
												{
													data.allAlerts.filter(
														(alert) => alert.severity === "warning",
													).length
												}
											</p>
											<p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
												Atenção
											</p>
										</div>
										<div className="rounded-2xl bg-white/60 px-3 py-2 text-center">
											<p className="text-lg font-semibold text-sky-700">
												{
													data.allAlerts.filter(
														(alert) => alert.severity === "info",
													).length
												}
											</p>
											<p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
												Ideias
											</p>
										</div>
									</div>
								</div>

								<div className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-2">
									{data.allAlerts.map((alert) => (
										<InsightActionCard key={alert.id} alert={alert} />
									))}
									{data.allAlerts.length === 0 && (
										<div className="rounded-[1.4rem] border border-white/80 bg-white/68 p-6 text-center shadow-[0_14px_36px_rgba(15,23,42,0.045)] backdrop-blur-2xl">
											<CheckCircle2 className="mx-auto h-8 w-8 text-teal-700" />
											<p className="mt-3 font-semibold text-slate-950">
												Nenhum alerta ativo
											</p>
											<p className="mt-1 text-sm text-slate-500">
												A operação está sem pontos críticos no momento.
											</p>
										</div>
									)}
								</div>
							</section>
						)}

						{activeSection === "reservations" && (
							<section className="rounded-xl border border-white/80 bg-white/65 p-5 shadow-[0_12px_32px_rgba(15,23,42,0.04)] backdrop-blur-xl">
								<h3 className="font-semibold text-slate-950">Reservas</h3>
								<p className="mt-1 text-sm text-slate-500">
									Atalho para a visão completa de reservas.
								</p>
								<Link
									to="/account/bookings"
									className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white"
								>
									Abrir reservas
									<ArrowUpRight className="h-4 w-4" />
								</Link>
							</section>
						)}

						{activeSection === "messages" && (
							<section className="rounded-xl border border-white/80 bg-white/65 p-5 shadow-[0_12px_32px_rgba(15,23,42,0.04)] backdrop-blur-xl">
								<h3 className="font-semibold text-slate-950">Mensagens</h3>
								<p className="mt-1 text-sm text-slate-500">
									Use os alertas da Central para priorizar mensagens não
									respondidas.
								</p>
							</section>
						)}

						{activeSection === "logbook" && <AccommodationLogbook />}
					</div>
				</main>
			</div>

			<PropertyDrawer
				property={selectedProperty}
				open={Boolean(selectedProperty)}
				onOpenChange={(open) => {
					if (!open) setSelectedProperty(null);
				}}
			/>

			<Dialog open={calendarExpanded} onOpenChange={setCalendarExpanded}>
				<DialogContent className="max-h-[92vh] max-w-5xl sm:max-w-5xl overflow-y-auto rounded-[1.5rem] border border-slate-200 bg-white p-5">
					<CalendarGridMonth calendar={data.calendar} />
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default HostCenter;
