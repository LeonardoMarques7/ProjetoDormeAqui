import { useState, useEffect } from "react";
import {
	ResponsiveContainer,
	LineChart,
	Line,
	BarChart,
	Bar,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip as RechartsTooltip,
} from "recharts";
import {
	DollarSign,
	BarChart3,
	Calendar,
	CalendarCheck2,
	CalendarClock,
	AlertTriangle,
	Star,
	TrendingUp,
	TrendingDown,
	Plus,
	Minus,
} from "lucide-react";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";
import { getHostDashboard } from "@/services/dashboardService";
import CalendarGridMonth from "./CalendarGridMonth";
import AlertCard from "./AlertCard";
import AccommodationLogbook from "./AccommodationLogbook";
import {
	calculateMonthlyRevenue,
	calculateWeeklyOccupancy,
	calculatePerformanceMetrics,
	calculateRevenueByProperty,
	calculateFinancialMetrics,
	calculateRentalKPIs,
	generateAlerts,
} from "./utils_dashboardCalculations";

/**
 * Componente atômico de card KPI
 */
const KPICard = ({
	label,
	value,
	icon: Icon,
	trend = null,
	trendValue = 0,
	subtext = "",
	details = [],
	progressLabel = "",
	description = "",
	color = "emerald",
	progress = null,
}) => {
	const colorMap = {
		emerald: {
			border: "border-slate-200 hover:border-teal-300",
			label: "text-teal-700",
			accent: "bg-teal-700",
			iconBg: "bg-teal-50",
			iconText: "text-teal-700",
		},
		blue: {
			border: "border-slate-200 hover:border-sky-300",
			label: "text-sky-700",
			accent: "bg-sky-700",
			iconBg: "bg-sky-50",
			iconText: "text-sky-700",
		},
		amber: {
			border: "border-slate-200 hover:border-amber-300",
			label: "text-amber-700",
			accent: "bg-amber-600",
			iconBg: "bg-amber-50",
			iconText: "text-amber-700",
		},
		purple: {
			border: "border-slate-200 hover:border-slate-300",
			label: "text-slate-700",
			accent: "bg-slate-700",
			iconBg: "bg-slate-100",
			iconText: "text-slate-700",
		},
	};

	const colors = colorMap[color];

	return (
		<div
			className={`group relative overflow-hidden rounded-xl border ${colors.border} bg-white px-5 py-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors duration-200`}
		>
			<div className={`absolute left-0 top-0 h-full w-1 ${colors.accent}`} />

			<div className="relative z-10">
				<div className="flex items-start justify-between mb-3">
					<span
						className={`text-xs font-semibold flex items-start gap-2 ${colors.label} uppercase tracking-wide`}
					>
						{label}
						<Tooltip>
							<TooltipTrigger asChild>
								<span className="text-slate-400 transition-colors duration-200 hover:text-slate-600">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth="1.5"
										stroke="currentColor"
										className="size-4 -mt-0.5"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
										/>
									</svg>
								</span>
							</TooltipTrigger>
							<TooltipContent
								className="bg-white border border-slate-200 shadow-lg rounded-md px-3 py-2 text-xs text-slate-700 w-56"
								align="center"
							>
								{description}
							</TooltipContent>
						</Tooltip>
					</span>

					{trend && trendValue !== 0 && (
						<div
							className={`flex items-center gap-1 text-xs font-semibold ${
								trend === "up" ? "text-teal-700" : "text-red-600"
							}`}
						>
							{trend === "up" ? (
								<TrendingUp className="w-4 h-4" />
							) : (
								<TrendingDown className="w-4 h-4" />
							)}
							<span>{Math.abs(trendValue)}%</span>
						</div>
					)}
				</div>

				<div className="mb-4">
					<p className="text-3xl font-semibold text-slate-950 tabular-nums">
						{value}
					</p>
				</div>

				{subtext && <p className="text-sm text-slate-600 mb-3">{subtext}</p>}

				{details.length > 0 && (
					<div className="mb-4 space-y-1.5 text-sm">
						{details.map((detail) => (
							<div
								key={detail.label}
								className="flex items-center justify-between gap-3"
							>
								<span className="text-slate-500">{detail.label}</span>
								<span className="font-semibold text-slate-800 text-right">
									{detail.value}
								</span>
							</div>
						))}
					</div>
				)}

				{progress !== null && (
					<div>
						{progressLabel && (
							<div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
								<span>{progressLabel}</span>
								<span className="font-semibold">{Math.round(progress)}%</span>
							</div>
						)}
						<div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
							<div
								className={`h-full ${colors.accent} rounded-full transition-all duration-500`}
								style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
							/>
						</div>
					</div>
				)}
			</div>

			{Icon && (
				<div
					className={`absolute bottom-4 right-4 rounded-lg ${colors.iconBg} p-2 ${colors.iconText}`}
				>
					<Icon className="w-5 h-5" />
				</div>
			)}
		</div>
	);
};

/**
 * Dashboard Redesenhada - Versão Nova
 */
function HostDashboard() {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [currentAlertPage, setCurrentAlertPage] = useState(1);
	const [urgentAlertPage, setUrgentAlertPage] = useState(1);
	const [monthlyRevenueGoal, setMonthlyRevenueGoal] = useState(10000);
	const [monthlyRevenueGoalInput, setMonthlyRevenueGoalInput] =
		useState("10.000,00");
	const [propertyRevenueGoal, setPropertyRevenueGoal] = useState(10000);
	const [propertyRevenueGoalInput, setPropertyRevenueGoalInput] =
		useState("10.000,00");
	const [movementPage, setMovementPage] = useState(1);
	const alertsPerPage = 3;

	// Calcular alertas paginados
	let allAlerts = [];
	let totalAlertPages = 1;
	let currentAlerts = [];

	if (data) {
		allAlerts = [
			...data.alerts.critical,
			...data.alerts.warning,
			...data.alerts.info,
		];
		totalAlertPages = Math.ceil(allAlerts.length / alertsPerPage);
		const indexOfLastAlert = currentAlertPage * alertsPerPage;
		const indexOfFirstAlert = indexOfLastAlert - alertsPerPage;
		currentAlerts = allAlerts.slice(indexOfFirstAlert, indexOfLastAlert);
	}

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const raw = await getHostDashboard();

				const processed = {
					bookings: raw.bookings || [],
					places: raw.places || [],
					calendar: raw.calendar || { events: [], emptyDays: [] },
					today: raw.today || { checkins: 0, checkouts: 0, pendingBookings: 0 },
					finance: calculateFinancialMetrics(raw.finance || {}),
					rentalKPIs: calculateRentalKPIs(raw.bookings || [], raw.places || []),
					metrics: calculatePerformanceMetrics(
						raw.bookings || [],
						raw.places || [],
						raw.metrics || {},
					),
					revenueData: calculateMonthlyRevenue(raw.bookings || []),
					occupancyData: calculateWeeklyOccupancy(
						raw.bookings || [],
						raw.places || [],
					),
					propertyRevenue: calculateRevenueByProperty(
						raw.bookings || [],
						raw.places || [],
					),
					alerts: generateAlerts(
						raw.alerts || [],
						raw.today || {},
						calculatePerformanceMetrics(
							raw.bookings || [],
							raw.places || [],
							raw.metrics || {},
						),
					),
				};

				setData(processed);
			} catch (err) {
				console.error("Erro ao carregar dashboard:", err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen bg-slate-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700 mx-auto mb-4"></div>
					<p className="text-slate-600">Carregando dashboard...</p>
				</div>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="min-h-screen bg-slate-50 flex items-center justify-center">
				<div className="text-center">
					<p className="text-red-600 mb-4">Erro ao carregar dados</p>
					<button
						onClick={() => window.location.reload()}
						className="px-4 py-2 bg-teal-700 text-white rounded-lg transition-colors duration-200 hover:bg-teal-800"
					>
						Tentar novamente
					</button>
				</div>
			</div>
		);
	}

	const formatCurrency = (value) =>
		new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
			maximumFractionDigits: 0,
		}).format(value);

	const formatMoneyInput = (value) =>
		new Intl.NumberFormat("pt-BR", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value);

	const parseMoneyInput = (value) => {
		const normalized = value.replace(/\./g, "").replace(",", ".");
		const parsed = Number(normalized.replace(/[^\d.]/g, ""));
		return Number.isFinite(parsed) ? parsed : 0;
	};

	const updateMonthlyRevenueGoal = (nextValue) => {
		const normalizedValue = Math.max(0, Math.round(nextValue));
		setMonthlyRevenueGoal(normalizedValue);
		setMonthlyRevenueGoalInput(formatMoneyInput(normalizedValue));
	};

	const handleMonthlyRevenueGoalChange = (event) => {
		const inputValue = event.target.value;
		const parsedValue = parseMoneyInput(inputValue);

		setMonthlyRevenueGoalInput(inputValue);

		if (Number.isFinite(parsedValue)) {
			setMonthlyRevenueGoal(Math.max(0, Math.round(parsedValue)));
		}
	};

	const handleMonthlyRevenueGoalBlur = () => {
		updateMonthlyRevenueGoal(monthlyRevenueGoal);
	};

	const updatePropertyRevenueGoal = (nextValue) => {
		const normalizedValue = Math.max(0, Math.round(nextValue));
		setPropertyRevenueGoal(normalizedValue);
		setPropertyRevenueGoalInput(formatMoneyInput(normalizedValue));
	};

	const handlePropertyRevenueGoalChange = (event) => {
		const inputValue = event.target.value;
		const parsedValue = parseMoneyInput(inputValue);

		setPropertyRevenueGoalInput(inputValue);

		if (Number.isFinite(parsedValue)) {
			setPropertyRevenueGoal(Math.max(0, Math.round(parsedValue)));
		}
	};

	const handlePropertyRevenueGoalBlur = () => {
		updatePropertyRevenueGoal(propertyRevenueGoal);
	};

	const resetPropertyRevenueGoal = () => {
		updatePropertyRevenueGoal(10000);
	};

	const revenueActualData = data.revenueData.filter(
		(item) => typeof item.receita === "number",
	);
	const currentRevenue = revenueActualData[revenueActualData.length - 1];
	const revenueTrend = currentRevenue?.variacaoPercentual || 0;
	const revenueTrendLabel =
		revenueTrend >= 0
			? `+${revenueTrend.toFixed(1)}% em relação ao mês anterior`
			: `${revenueTrend.toFixed(1)}% em relação ao mês anterior`;
	const hasRevenueChartData = data.revenueData.some(
		(item) => Number(item.receita || item.projecao || 0) > 0,
	);
	const hasOccupancyChartData = data.occupancyData.some(
		(item) => Number(item.taxaOcupacao || 0) > 0,
	);
	const propertyGoalData = data.propertyRevenue.map((property) => {
		const percentage =
			propertyRevenueGoal > 0
				? (Number(property.revenue || 0) / propertyRevenueGoal) * 100
				: 0;

		return {
			...property,
			meta: propertyRevenueGoal,
			percentualMeta: Math.round(percentage),
			percentualExibido: Math.min(Math.round(percentage), 120),
			baixaReceita: percentage < 50,
			metaBatida: percentage >= 100,
		};
	});
	const hasPropertyGoalData = propertyGoalData.some(
		(item) => Number(item.revenue || 0) > 0 && propertyRevenueGoal > 0,
	);
	const monthlyRevenueProgress =
		monthlyRevenueGoal > 0
			? (data.finance.monthlyEarnings / monthlyRevenueGoal) * 100
			: 0;
	const remainingMonthlyRevenue = Math.max(
		monthlyRevenueGoal - data.finance.monthlyEarnings,
		0,
	);
	const averageListedNightPrice =
		data.places.length > 0
			? data.places.reduce(
					(total, place) => total + Number(place.price || 0),
					0,
				) / data.places.length
			: 0;
	const adrProgress =
		averageListedNightPrice > 0
			? (data.rentalKPIs.adr / averageListedNightPrice) * 100
			: 0;
	const revPARProgress =
		data.rentalKPIs.adr > 0
			? (data.rentalKPIs.revPAR / data.rentalKPIs.adr) * 100
			: 0;
	const now = new Date();
	const currentWeekStart = new Date(now);
	currentWeekStart.setDate(now.getDate() - 6);
	currentWeekStart.setHours(0, 0, 0, 0);
	const previousWeekStart = new Date(currentWeekStart);
	previousWeekStart.setDate(currentWeekStart.getDate() - 7);
	const previousWeekEnd = new Date(currentWeekStart);
	previousWeekEnd.setMilliseconds(-1);
	const getBookingDate = (booking) =>
		new Date(booking.checkin || booking.checkIn);
	const currentWeekBookings = data.bookings.filter((booking) => {
		const bookingDate = getBookingDate(booking);
		return bookingDate >= currentWeekStart && bookingDate <= now;
	}).length;
	const previousWeekBookings = data.bookings.filter((booking) => {
		const bookingDate = getBookingDate(booking);
		return bookingDate >= previousWeekStart && bookingDate <= previousWeekEnd;
	}).length;
	const bookingWeekDiff = currentWeekBookings - previousWeekBookings;
	const bookingComparisonText =
		bookingWeekDiff === 0
			? "Mesmo volume da semana passada"
			: `${bookingWeekDiff > 0 ? "+" : ""}${bookingWeekDiff} vs semana passada`;
	const bookingProgress =
		previousWeekBookings > 0
			? (currentWeekBookings / previousWeekBookings) * 100
			: currentWeekBookings > 0
				? 100
				: 0;
	const urgentAlerts = allAlerts.filter((alert) =>
		["critical", "warning"].includes(alert.severity),
	);
	const urgentAlertsPerPage = 2;
	const urgentAlertList = urgentAlerts.length > 0 ? urgentAlerts : allAlerts;
	const totalUrgentAlertPages = Math.max(
		1,
		Math.ceil(urgentAlertList.length / urgentAlertsPerPage),
	);
	const currentUrgentAlerts = urgentAlertList.slice(
		(urgentAlertPage - 1) * urgentAlertsPerPage,
		urgentAlertPage * urgentAlertsPerPage,
	);
	const calendarEvents = data.calendar?.events || [];
	const checkinEvents =
		calendarEvents
			.filter((event) => event.type === "checkin")
			.map((event) => ({
				...event,
				date: new Date(event.startDate),
			}))
			.filter((event) => event.date >= currentWeekStart)
			.sort((a, b) => a.date - b.date);
	const checkoutEvents =
		calendarEvents
			.filter((event) => event.type === "checkout")
			.map((event) => ({
				...event,
				date: new Date(event.startDate),
			}))
			.filter((event) => event.date >= currentWeekStart)
			.sort((a, b) => a.date - b.date);
	const upcomingMovements = [
		...checkinEvents.map((event) => ({
			...event,
			movementType: "Entrada",
			badgeClass: "border-teal-200 bg-teal-50 text-teal-700",
			dateClass: "text-teal-700",
		})),
		...checkoutEvents.map((event) => ({
			...event,
			movementType: "Saída",
			badgeClass: "border-slate-200 bg-slate-100 text-slate-700",
			dateClass: "text-slate-700",
		})),
	]
		.sort((a, b) => a.date - b.date);
	const movementsPerPage = 5;
	const totalMovementPages = Math.max(
		1,
		Math.ceil(upcomingMovements.length / movementsPerPage),
	);
	const boundedMovementPage = Math.min(movementPage, totalMovementPages);
	const currentMovements = upcomingMovements.slice(
		(boundedMovementPage - 1) * movementsPerPage,
		boundedMovementPage * movementsPerPage,
	);
	const emptyMovementRows = Array.from({
		length: Math.max(0, movementsPerPage - currentMovements.length),
	});
	const movementStart = upcomingMovements.length
		? (boundedMovementPage - 1) * movementsPerPage + 1
		: 0;
	const movementEnd = Math.min(
		boundedMovementPage * movementsPerPage,
		upcomingMovements.length,
	);
	const formatShortDate = (date) =>
		new Intl.DateTimeFormat("pt-BR", {
			day: "2-digit",
			month: "short",
		}).format(date);
	const formatGuestCount = (count) =>
		`${count} ${Number(count) === 1 ? "hóspede" : "hóspedes"}`;
	const todayTasks = [
		{
			label: "Check-ins hoje",
			value: data.today.checkins,
			tone: "bg-teal-50 text-teal-700 border-teal-100",
			action:
				data.today.checkins > 0
					? "Prepare as acomodações e confirme horários."
					: "Nenhuma chegada prevista para hoje.",
		},
		{
			label: "Check-outs hoje",
			value: data.today.checkouts,
			tone: "bg-slate-50 text-slate-700 border-slate-200",
			action:
				data.today.checkouts > 0
					? "Organize limpeza e vistoria após saída."
					: "Nenhuma saída prevista para hoje.",
		},
		{
			label: "Reservas pendentes",
			value: data.today.pendingBookings,
			tone: "bg-amber-50 text-amber-700 border-amber-100",
			action:
				data.today.pendingBookings > 0
					? "Revise solicitações para não perder conversões."
					: "Sem pendências de reserva agora.",
		},
	];
	const totalTodayActions =
		data.today.checkins + data.today.checkouts + data.today.pendingBookings;
	const todayStatusText =
		totalTodayActions > 0
			? `${totalTodayActions} ponto${totalTodayActions > 1 ? "s" : ""} para acompanhar`
			: "Nenhuma ação imediata";
	const decisionSummary =
		urgentAlerts.length > 0
			? `${urgentAlerts.length} alerta${urgentAlerts.length > 1 ? "s" : ""} precisa${urgentAlerts.length > 1 ? "m" : ""} de atenção.`
			: data.today.checkins +
						data.today.checkouts +
						data.today.pendingBookings >
				  0
				? "Há movimentos operacionais para acompanhar hoje."
				: "Operação sem urgências no momento.";

	return (
		<div className="min-h-screen bg-slate-50">
			<div className="max-w-7xl mx-auto w-full px-4 py-6 lg:px-6">
				<section className="mb-6">
					<div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
								Central do anfitrião
							</p>
							<h1 className="mt-1 text-3xl font-semibold text-slate-950">
								O que precisa da sua atenção agora
							</h1>
						</div>
						<p className="max-w-xl text-sm text-slate-600">
							{decisionSummary} Os indicadores abaixo ajudam a decidir o que
							fazer primeiro.
						</p>
					</div>
				</section>

				<section className="mb-8 grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
					<div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
						<div className="mb-5 flex items-start justify-between gap-4">
							<div>
								<p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
									Painel de hoje
								</p>
								<h2 className="mt-1 text-lg font-semibold text-slate-950">
									{todayStatusText}
								</h2>
							</div>
							<span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500">
								Hoje
							</span>
						</div>

						<div className="rounded-xl border border-slate-200">
							{todayTasks.map((task) => (
								<div
									key={task.label}
									className="flex items-center justify-between gap-4 border-t border-slate-100 px-4 py-4 first:border-t-0"
								>
									<p className="text-sm font-medium text-slate-600">
										{task.label}
									</p>
									<span
										className={`shrink-0 text-2xl font-semibold tabular-nums ${
											task.value > 0 ? "text-slate-950" : "text-slate-300"
										}`}
									>
										{task.value}
									</span>
								</div>
							))}
						</div>
					</div>

					<div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
						<div className="mb-4 flex items-center justify-between">
							<div>
								<h2 className="text-lg font-semibold text-slate-950">
									Alertas urgentes
								</h2>
								<p className="text-sm text-slate-500">
									Sinais que podem afetar receita, operação ou experiência.
								</p>
							</div>
							<AlertTriangle className="h-5 w-5 text-amber-600" />
						</div>
						{currentUrgentAlerts.length > 0 ? (
							<div>
								<div className="space-y-3">
									{currentUrgentAlerts.map((alert) => (
										<AlertCard
											key={alert.id}
											title={alert.title}
											description={alert.description}
											type={alert.severity}
											time={alert.time}
											footer={alert.footer}
										/>
									))}
								</div>

								{totalUrgentAlertPages > 1 && (
									<Pagination className="mt-4 list-none justify-center">
										<PaginationContent className="!list-none">
											<PaginationItem>
												<PaginationPrevious
													onClick={() =>
														setUrgentAlertPage(Math.max(1, urgentAlertPage - 1))
													}
													className={
														urgentAlertPage === 1
															? "pointer-events-none opacity-50"
															: "cursor-pointer"
													}
												/>
											</PaginationItem>

											{[...Array(totalUrgentAlertPages)].map((_, index) => {
												const pageNumber = index + 1;
												return (
													<PaginationItem key={pageNumber}>
														<PaginationLink
															onClick={() => setUrgentAlertPage(pageNumber)}
															isActive={urgentAlertPage === pageNumber}
															className="cursor-pointer"
														>
															{pageNumber}
														</PaginationLink>
													</PaginationItem>
												);
											})}

											<PaginationItem>
												<PaginationNext
													onClick={() =>
														setUrgentAlertPage(
															Math.min(
																totalUrgentAlertPages,
																urgentAlertPage + 1,
															),
														)
													}
													className={
														urgentAlertPage === totalUrgentAlertPages
															? "pointer-events-none opacity-50"
															: "cursor-pointer"
													}
												/>
											</PaginationItem>
										</PaginationContent>
									</Pagination>
								)}
							</div>
						) : (
							<div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
								<p className="text-sm font-medium text-slate-700">
									Nenhum alerta urgente agora.
								</p>
								<p className="mt-1 text-xs text-slate-500">
									Continue acompanhando reservas e mensagens.
								</p>
							</div>
						)}
					</div>
				</section>

				<section className="mb-8">
					<div className="mb-4 flex items-end justify-between gap-4">
						<div>
							<h2 className="text-xl font-semibold text-slate-950">Saúde do mês</h2>
							<p className="text-sm text-slate-500">
								Indicadores estratégicos para preço, ocupação e receita.
							</p>
						</div>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<KPICard
							label="Receita do Mês"
							value={formatCurrency(data.finance.monthlyEarnings)}
							icon={DollarSign}
							subtext={`${formatCurrency(data.finance.monthlyEarnings)} de ${formatCurrency(monthlyRevenueGoal)}`}
							details={[
								{
									label: "Meta mensal",
									value: (
										<input
											value={monthlyRevenueGoalInput}
											onChange={handleMonthlyRevenueGoalChange}
											onBlur={handleMonthlyRevenueGoalBlur}
											className="h-7 w-28 rounded-md border border-slate-200 bg-white px-2 text-right text-xs font-semibold text-slate-900 outline-none focus:border-teal-500"
											inputMode="decimal"
											aria-label="Meta mensal de receita"
										/>
									),
								},
								{
									label: "Meta atingida",
									value: `${monthlyRevenueProgress.toFixed(0)}%`,
								},
								{
									label: "Faltam",
									value:
										remainingMonthlyRevenue > 0
											? formatCurrency(remainingMonthlyRevenue)
											: "Meta batida",
								},
							]}
							description="A receita do mês representa o total de ganhos gerados pelas suas acomodações durante o mês atual. Ela é calculada somando todas as receitas provenientes de reservas, incluindo diárias, taxas e outros encargos relacionados às acomodações ocupadas."
							color="emerald"
							progress={monthlyRevenueProgress}
							progressLabel="Progresso da meta mensal"
						/>

						<KPICard
							label="Ganho Médio por Noite"
							value={formatCurrency(data.rentalKPIs.adr)}
							icon={DollarSign}
							subtext="Média recebida por noite ocupada"
							details={[
								{
									label: "Noites ocupadas",
									value: data.rentalKPIs.bookedNights,
								},
								{
									label: "Referência",
									value: averageListedNightPrice
										? formatCurrency(averageListedNightPrice)
										: "Sem preço",
								},
							]}
							description="Ganho Médio por Noite, também conhecido como ADR, mostra quanto você recebe em média por cada noite ocupada."
							color="amber"
							progress={adrProgress}
							progressLabel="Comparado ao preço médio anunciado"
						/>

						<KPICard
							label="Taxa de Ocupação"
							value={`${data.rentalKPIs.occupancyRate.toFixed(1)}%`}
							icon={BarChart3}
							subtext="Noites ocupadas no mês atual"
							details={[
								{
									label: "Ocupadas",
									value: data.rentalKPIs.bookedNights,
								},
								{
									label: "Disponíveis",
									value: data.rentalKPIs.availableNights,
								},
							]}
							description="Percentual real de noites ocupadas sobre todas as noites disponíveis das suas acomodações no período."
							color="blue"
							progress={data.rentalKPIs.occupancyRate}
							progressLabel="Ocupação da capacidade"
						/>

						<KPICard
							label="Receita por Noite Disponível"
							value={formatCurrency(data.rentalKPIs.revPAR)}
							icon={TrendingUp}
							subtext="Receita média considerando noites livres e ocupadas"
							details={[
								{
									label: "Receita analisada",
									value: formatCurrency(data.rentalKPIs.revenue),
								},
								{
									label: "Noites disponíveis",
									value: data.rentalKPIs.availableNights,
								},
							]}
							description="Mostra quanto cada noite disponível gera em média. Ajuda a entender o impacto conjunto de preço e ocupação."
							color="emerald"
							progress={revPARProgress}
							progressLabel="Equivale à ocupação aplicada ao ganho médio"
						/>

						<KPICard
							label="Total de Reservas"
							value={data.metrics.totalBookings.toString().padStart(2, "0")}
							icon={Calendar}
							subtext={bookingComparisonText}
							details={[
								{
									label: "Últimos 7 dias",
									value: currentWeekBookings,
								},
								{
									label: "Semana anterior",
									value: previousWeekBookings,
								},
							]}
							description="O total de reservas é a contagem de todas as reservas confirmadas para suas acomodações durante o mês atual. Ele inclui todas as reservas que foram efetivamente confirmadas pelos hóspedes, independentemente de terem sido concluídas ou canceladas posteriormente."
							color="purple"
							progress={bookingProgress}
							progressLabel="Comparação semanal"
						/>

						<KPICard
							label="Avaliação Média"
							value={
								data.metrics.averageRating > 0
									? `${data.metrics.averageRating.toFixed(1)}`
									: "—"
							}
							icon={Star}
							subtext={
								data.metrics.averageRating > 0 ? "de 5.0" : "Sem avaliações"
							}
							description="A avaliação média é calculada somando todas as avaliações recebidas dos hóspedes e dividindo pelo número total de avaliações. Ela reflete a satisfação geral dos hóspedes com suas acomodações."
							color="amber"
							progress={(data.metrics.averageRating / 5) * 100}
							progressLabel="Progresso até 5 estrelas"
						/>
					</div>
				</section>

				<AccommodationLogbook />

				<section className="mb-8">
					<div className="mb-4">
						<h2 className="text-xl font-bold text-slate-950">
							Análise para decidir próximos ajustes
						</h2>
						<p className="text-sm text-slate-500">
							Gráficos para entender tendência, ocupação e metas por
							propriedade.
						</p>
					</div>
					<div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
						{/* Revenue Chart */}
						<div className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
							<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
								<div>
									<h3 className="text-lg font-semibold text-slate-900">
										Evolução da Receita Mensal
									</h3>
									<p className="mt-1 max-w-xl text-sm text-slate-500">
										Acompanhe o crescimento e a variação da sua receita ao longo
										dos meses
									</p>
								</div>
								<div
									className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${
										revenueTrend >= 0
											? "border-teal-200 bg-teal-50 text-teal-700"
											: "border-red-200 bg-red-50 text-red-700"
									}`}
								>
									{revenueTrendLabel}
								</div>
							</div>
							{hasRevenueChartData ? (
								<ResponsiveContainer width="100%" height={300}>
									<LineChart
										data={data.revenueData}
										margin={{ top: 12, right: 18, left: 4, bottom: 8 }}
									>
										<CartesianGrid
											strokeDasharray="4 4"
											stroke="#e2e8f0"
											vertical={false}
										/>
										<XAxis
											dataKey="mes"
											stroke="#64748b"
											tickLine={false}
											axisLine={false}
											tick={{ fontSize: 12 }}
										/>
										<YAxis
											stroke="#64748b"
											tickLine={false}
											axisLine={false}
											tick={{ fontSize: 12 }}
											tickFormatter={(value) => formatCurrency(value)}
										/>
										<RechartsTooltip
											formatter={(value, name) => [
												formatCurrency(value || 0),
												name,
											]}
											labelFormatter={(label) => `Mês: ${label}`}
											contentStyle={{
												borderRadius: 8,
												border: "1px solid #e2e8f0",
												boxShadow: "0 12px 24px rgba(15, 23, 42, 0.08)",
											}}
										/>
										<Line
											type="monotone"
											dataKey="receita"
											name="Receita realizada"
											stroke="#0f766e"
											strokeWidth={3}
											dot={{ r: 4, strokeWidth: 2, fill: "#ffffff" }}
											activeDot={{ r: 6, strokeWidth: 2 }}
											connectNulls={false}
										/>
										<Line
											type="monotone"
											dataKey="projecao"
											name="Projeção"
											stroke="#475569"
											strokeWidth={2.5}
											strokeDasharray="6 6"
											dot={{ r: 3, strokeWidth: 2, fill: "#ffffff" }}
											connectNulls
										/>
									</LineChart>
								</ResponsiveContainer>
							) : (
								<div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center">
									<p className="max-w-xs text-sm text-slate-500">
										Ainda não há receita confirmada para exibir neste gráfico.
									</p>
								</div>
							)}
							<div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
								<span className="inline-flex items-center gap-2">
									<span className="h-2 w-6 rounded-full bg-teal-700" />
									Receita realizada
								</span>
								<span className="inline-flex items-center gap-2">
									<span className="h-0.5 w-6 border-t-2 border-dashed border-slate-600" />
									Projeção futura
								</span>
							</div>
						</div>

						{/* Painel de Insights e Ações */}
						<div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
							<div className="mb-8">
								<h3 className="text-lg font-semibold text-slate-900 mb-2">
									Insights & Ações
								</h3>
								<p className="text-slate-600 text-sm">
									Recomendações para melhorar operação, preço e receita.
								</p>
							</div>

							{allAlerts.length > 0 ? (
								<div className="flex flex-col gap-4">
									<div className="space-y-3">
										{currentAlerts.map((alert) => (
											<AlertCard
												key={alert.id}
												title={alert.title}
												description={alert.description}
												type={alert.severity}
												time={alert.time}
												footer={alert.footer}
											/>
										))}
									</div>

									{/* Paginação */}
									<Pagination className="mt-6 list-none justify-center">
										<PaginationContent className="!list-none">
											<PaginationItem>
												<PaginationPrevious
													onClick={() =>
														setCurrentAlertPage(
															Math.max(1, currentAlertPage - 1),
														)
													}
													className={
														currentAlertPage === 1
															? "pointer-events-none opacity-50"
															: "cursor-pointer"
													}
												/>
											</PaginationItem>

											{[...Array(totalAlertPages)].map((_, index) => {
												const pageNumber = index + 1;
												return (
													<PaginationItem key={pageNumber}>
														<PaginationLink
															onClick={() => setCurrentAlertPage(pageNumber)}
															isActive={currentAlertPage === pageNumber}
															className="cursor-pointer"
														>
															{pageNumber}
														</PaginationLink>
													</PaginationItem>
												);
											})}

											<PaginationItem>
												<PaginationNext
													onClick={() =>
														setCurrentAlertPage(
															Math.min(totalAlertPages, currentAlertPage + 1),
														)
													}
													className={
														currentAlertPage === totalAlertPages
															? "pointer-events-none opacity-50"
															: "cursor-pointer"
													}
												/>
											</PaginationItem>
										</PaginationContent>
									</Pagination>
								</div>
							) : (
								<div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-10 text-center">
									<p className="text-slate-600 text-sm">
										Tudo corre bem! Nenhum alerta no momento.
									</p>
								</div>
							)}
						</div>

						{/* Occupancy Chart */}
						<div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
							<div className="mb-6">
								<h3 className="text-lg font-semibold text-slate-900">
									Taxa de Ocupação por Dia
								</h3>
								<p className="mt-1 text-sm text-slate-500">
									Veja quais dias da semana possuem maior potencial de reserva
								</p>
							</div>
							{hasOccupancyChartData ? (
								<ResponsiveContainer width="100%" height={300}>
									<BarChart
										data={data.occupancyData}
										margin={{ top: 12, right: 18, left: 4, bottom: 8 }}
									>
										<CartesianGrid
											strokeDasharray="4 4"
											stroke="#e2e8f0"
											vertical={false}
										/>
										<XAxis
											dataKey="dia"
											stroke="#64748b"
											tickLine={false}
											axisLine={false}
											tick={{ fontSize: 12 }}
										/>
										<YAxis
											stroke="#64748b"
											tickLine={false}
											axisLine={false}
											tick={{ fontSize: 12 }}
											tickFormatter={(value) => `${value}%`}
											domain={[0, 100]}
										/>
										<RechartsTooltip
											formatter={(value, name) => [`${value}%`, name]}
											labelFormatter={(label) => `Dia: ${label}`}
											contentStyle={{
												borderRadius: 8,
												border: "1px solid #e2e8f0",
												boxShadow: "0 12px 24px rgba(15, 23, 42, 0.08)",
											}}
										/>
										<Bar
											dataKey="taxaOcupacao"
											name="Taxa de ocupação"
											radius={[8, 8, 0, 0]}
										>
											{data.occupancyData.map((entry) => (
												<Cell
													key={entry.dia}
													fill={entry.baixaOcupacao ? "#d97706" : "#0f766e"}
												/>
											))}
										</Bar>
									</BarChart>
								</ResponsiveContainer>
							) : (
								<div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center">
									<p className="max-w-xs text-sm text-slate-500">
										Ainda não há ocupações confirmadas para comparar por dia da
										semana.
									</p>
								</div>
							)}
							<div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
								<span className="inline-flex items-center gap-2">
									<span className="h-2.5 w-2.5 rounded-full bg-teal-700" />
									Ocupação saudável
								</span>
								<span className="inline-flex items-center gap-2">
									<span className="h-2.5 w-2.5 rounded-full bg-amber-600" />
									Baixa ocupação
								</span>
							</div>
						</div>

						{/* Property Revenue Goal Chart */}
						<div className="rounded-xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
							<div className="mb-6 flex flex-col gap-4">
								<div>
									<h3 className="text-lg font-semibold text-slate-900">
										Meta de Receita por Propriedade
									</h3>
									<p className="mt-1 text-sm text-slate-500">
										Compare a receita de cada acomodação com a meta definida
									</p>
								</div>

								<div className="flex flex-wrap items-center gap-2">
									<div className="flex h-9 items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
										<span className="border-r border-slate-200 px-3 text-xs font-semibold text-slate-500">
											R$
										</span>
										<input
											value={propertyRevenueGoalInput}
											onChange={handlePropertyRevenueGoalChange}
											onBlur={handlePropertyRevenueGoalBlur}
											className="h-full w-32 bg-white px-3 text-center text-sm font-semibold text-slate-900 outline-none"
											inputMode="decimal"
											aria-label="Meta de receita por propriedade"
										/>
									</div>
									<button
										type="button"
										onClick={() =>
											updatePropertyRevenueGoal(propertyRevenueGoal + 100)
										}
										className="inline-flex cursor-pointer h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg font-semibold text-slate-700 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50"
										aria-label="Aumentar meta em 100 reais"
									>
										<Plus className="w-4 h-4" />
									</button>
									<button
										type="button"
										onClick={() =>
											updatePropertyRevenueGoal(propertyRevenueGoal - 100)
										}
										className="inline-flex cursor-pointer h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg font-semibold text-slate-700 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50"
										aria-label="Reduzir meta em 100 reais"
									>
										<Minus className="w-4 h-4" />
									</button>
									<button
										type="button"
										onClick={() =>
											updatePropertyRevenueGoal(propertyRevenueGoal + 500)
										}
										className="h-9 cursor-pointer rounded-lg border border-teal-200 bg-teal-50 px-3 text-xs font-semibold text-teal-700 transition-colors duration-200 hover:bg-teal-100"
									>
										+500
									</button>
									<button
										type="button"
										onClick={() =>
											updatePropertyRevenueGoal(propertyRevenueGoal + 1000)
										}
										className="h-9 cursor-pointer rounded-lg border border-teal-200 bg-teal-50 px-3 text-xs font-semibold text-teal-700 transition-colors duration-200 hover:bg-teal-100"
									>
										+1.000
									</button>
									<button
										type="button"
										onClick={resetPropertyRevenueGoal}
										className="h-9 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50"
									>
										Resetar
									</button>
								</div>
							</div>

							{hasPropertyGoalData ? (
								<ResponsiveContainer width="100%" height={300}>
									<BarChart
										data={propertyGoalData}
										margin={{ top: 12, right: 18, left: 4, bottom: 8 }}
									>
										<CartesianGrid
											strokeDasharray="4 4"
											stroke="#e2e8f0"
											vertical={false}
										/>
										<XAxis
											dataKey="name"
											stroke="#64748b"
											tickLine={false}
											axisLine={false}
											tick={{ fontSize: 12 }}
										/>
										<YAxis
											stroke="#64748b"
											tickLine={false}
											axisLine={false}
											tick={{ fontSize: 12 }}
											tickFormatter={(value) => `${value}%`}
											domain={[0, 120]}
										/>
										<RechartsTooltip
											formatter={(value, name, item) => {
												const payload = item.payload;
												return [
													`${payload.percentualMeta}% (${formatCurrency(payload.revenue)} de ${formatCurrency(payload.meta)})`,
													name,
												];
											}}
											labelFormatter={(label) => `Propriedade: ${label}`}
											contentStyle={{
												borderRadius: 8,
												border: "1px solid #e2e8f0",
												boxShadow: "0 12px 24px rgba(15, 23, 42, 0.08)",
											}}
										/>
										<Bar
											dataKey="percentualExibido"
											name="Meta atingida"
											radius={[8, 8, 0, 0]}
										>
											{propertyGoalData.map((entry) => (
												<Cell
													key={entry.id}
													fill={
														entry.metaBatida
															? "#0f766e"
															: entry.baixaReceita
																? "#f59e0b"
																: "#334155"
													}
												/>
											))}
										</Bar>
									</BarChart>
								</ResponsiveContainer>
							) : (
								<div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center">
									<p className="max-w-xs text-sm text-slate-500">
										{propertyRevenueGoal > 0
											? "Ainda não há receita por propriedade para comparar com a meta."
											: "Defina uma meta maior que zero para comparar a receita por propriedade."}
									</p>
								</div>
							)}

							<div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
								<span className="inline-flex items-center gap-2">
									<span className="h-2.5 w-2.5 rounded-full bg-teal-700" />
									Meta batida
								</span>
								<span className="inline-flex items-center gap-2">
									<span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
									Em andamento
								</span>
								<span className="inline-flex items-center gap-2">
									<span className="h-2.5 w-2.5 rounded-full bg-amber-600" />
									Abaixo de 50%
								</span>
							</div>
						</div>
					</div>
				</section>

				<section className="mb-8">
					<div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
						<div>
							<h2 className="text-xl font-semibold text-slate-950">
								Agenda de reservas
							</h2>
							<p className="text-sm text-slate-500">
								Calendário completo e lista operacional das próximas movimentações.
							</p>
						</div>
					</div>

					<div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
						<CalendarGridMonth calendar={data.calendar} />
					</div>

					<div className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
						<div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<h3 className="font-semibold text-slate-950">
									Movimentações próximas
								</h3>
								<p className="text-sm text-slate-500">
									Entradas e saídas organizadas por data.
								</p>
							</div>
							<div className="flex items-center gap-2 text-xs font-medium text-slate-500">
								<span className="inline-flex items-center gap-1.5">
									<CalendarCheck2 className="h-4 w-4 text-teal-700" />
									Entrada
								</span>
								<span className="h-4 w-px bg-slate-200" />
								<span className="inline-flex items-center gap-1.5">
									<CalendarClock className="h-4 w-4 text-slate-700" />
									Saída
								</span>
							</div>
						</div>

						{upcomingMovements.length > 0 ? (
							<div className="divide-y divide-slate-100">
								{currentMovements.map((event) => (
									<div
										key={`${event.movementType}-${event.id}`}
										className="grid min-h-[72px] gap-3 px-5 py-4 sm:grid-cols-[92px_96px_minmax(0,1fr)_96px] sm:items-center"
									>
										<div className={`text-sm font-semibold ${event.dateClass}`}>
											{formatShortDate(event.date)}
										</div>
										<div>
											<span
												className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${event.badgeClass}`}
											>
												{event.movementType}
											</span>
										</div>
										<div className="min-w-0">
											<p className="truncate text-sm font-semibold text-slate-950">
												{event.placeTitle}
											</p>
											<p className="truncate text-xs text-slate-500">
												{event.guest}
											</p>
										</div>
										<div className="text-sm font-medium text-slate-600 sm:text-right">
											{formatGuestCount(event.guestCount)}
										</div>
									</div>
								))}
								{emptyMovementRows.map((_, index) => (
									<div
										key={`empty-movement-${index}`}
										className="min-h-[72px] px-5 py-4"
										aria-hidden="true"
									/>
								))}
							</div>
						) : (
							<div className="divide-y divide-slate-100">
								<div className="flex min-h-[72px] items-center px-5 py-4 text-sm text-slate-500">
									Sem entradas ou saídas próximas registradas.
								</div>
								{emptyMovementRows.slice(1).map((_, index) => (
									<div
										key={`empty-movement-${index}`}
										className="min-h-[72px] px-5 py-4"
										aria-hidden="true"
									/>
								))}
							</div>
						)}

						<div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
							<p className="text-xs font-medium text-slate-500">
								Mostrando {movementStart}-{movementEnd} de{" "}
								{upcomingMovements.length}
							</p>
							<Pagination className="mx-0 w-fit justify-start sm:justify-end">
								<PaginationContent className="!list-none">
									<PaginationItem>
										<PaginationPrevious
											onClick={() =>
												setMovementPage(Math.max(1, boundedMovementPage - 1))
											}
											className={
												boundedMovementPage === 1
													? "pointer-events-none opacity-50"
													: "cursor-pointer"
											}
										/>
									</PaginationItem>

									{[...Array(totalMovementPages)].map((_, index) => {
										const pageNumber = index + 1;
										return (
											<PaginationItem key={pageNumber}>
												<PaginationLink
													onClick={() => setMovementPage(pageNumber)}
													isActive={boundedMovementPage === pageNumber}
													className="cursor-pointer"
												>
													{pageNumber}
												</PaginationLink>
											</PaginationItem>
										);
									})}

									<PaginationItem>
										<PaginationNext
											onClick={() =>
												setMovementPage(
													Math.min(totalMovementPages, boundedMovementPage + 1),
												)
											}
											className={
												boundedMovementPage === totalMovementPages
													? "pointer-events-none opacity-50"
													: "cursor-pointer"
											}
										/>
									</PaginationItem>
								</PaginationContent>
							</Pagination>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}

export default HostDashboard;
