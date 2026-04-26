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
import Masonry from "@mui/lab/Masonry";
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
			bg: "from-emerald-50 to-white",
			border: "border-emerald-100 hover:border-emerald-300",
			label: "text-emerald-700",
			accent: "bg-emerald-600",
			dot: "bg-emerald-100",
		},
		blue: {
			bg: "from-blue-50 to-white",
			border: "border-blue-100 hover:border-blue-300",
			label: "text-blue-700",
			accent: "bg-blue-600",
			dot: "bg-blue-100",
		},
		amber: {
			bg: "from-amber-50 to-white",
			border: "border-amber-100 hover:border-amber-300",
			label: "text-amber-700",
			accent: "bg-amber-600",
			dot: "bg-amber-100",
		},
		purple: {
			bg: "from-purple-50 to-white",
			border: "border-purple-100 hover:border-purple-300",
			label: "text-purple-700",
			accent: "bg-purple-600",
			dot: "bg-purple-100",
		},
	};

	const colors = colorMap[color];

	return (
		<div
			className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors.bg} border ${colors.border} px-6 py-6 shadow-sm hover:shadow-lg transition-all duration-300`}
		>
			<div
				className={`absolute -right-8 -top-8 w-24 h-24 ${colors.dot} rounded-full opacity-20 group-hover:scale-110 transition-transform duration-300`}
			/>

			<div className="relative z-10">
				<div className="flex items-start justify-between mb-3">
					<span
						className={`text-xs font-semibold flex items-start gap-2 ${colors.label} uppercase tracking-widest`}
					>
						{label}
						<Tooltip>
							<TooltipTrigger asChild>
								<span className={`${colors.label} ${colors.border}`}>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth="1.5"
										stroke="currentColor"
										className={`size-5 transition-all -mt-0.5 duration-700 ${colors.label}`}
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
								className="bg-white border border-gray-200 shadow-lg rounded px-3 py-2 text-xs text-gray-700 w-56"
								align="center"
							>
								{description}
							</TooltipContent>
						</Tooltip>
					</span>

					{trend && trendValue !== 0 && (
						<div
							className={`flex items-center gap-1 text-xs font-semibold ${
								trend === "up" ? "text-emerald-600" : "text-red-600"
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
					<p className="text-4xl font-bold text-slate-900 font-mono">{value}</p>
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
						<div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
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
					className={`absolute bottom-4 right-4 p-3 ${colors.label} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}
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
	const [monthlyRevenueGoal, setMonthlyRevenueGoal] = useState(10000);
	const [monthlyRevenueGoalInput, setMonthlyRevenueGoalInput] =
		useState("10.000,00");
	const [propertyRevenueGoal, setPropertyRevenueGoal] = useState(10000);
	const [propertyRevenueGoalInput, setPropertyRevenueGoalInput] =
		useState("10.000,00");
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
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
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
						className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
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
			? data.places.reduce((total, place) => total + Number(place.price || 0), 0) /
				data.places.length
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
	const getBookingDate = (booking) => new Date(booking.checkin || booking.checkIn);
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

	return (
		<div className="min-h-screen">
			<div className="max-w-7xl mx-auto w-full">
				{/* Hero KPI */}
				<section className="mb-8">
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
											className="h-7 w-28 rounded-md border border-emerald-100 bg-white px-2 text-right text-xs font-semibold text-slate-900 outline-none focus:border-emerald-300"
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
								data.metrics.averageRating > 0 ? "⭐ de 5.0" : "Sem avaliações"
							}
							description="A avaliação média é calculada somando todas as avaliações recebidas dos hóspedes e dividindo pelo número total de avaliações. Ela reflete a satisfação geral dos hóspedes com suas acomodações."
							color="amber"
							progress={(data.metrics.averageRating / 5) * 100}
							progressLabel="Progresso até 5 estrelas"
						/>
					</div>
				</section>

				{/* Dashboard Completo com Masonry */}
				<Masonry columns={2} spacing={2}>
					{/* Revenue Chart */}
					<div className="h-fit bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
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
										? "border-emerald-200 bg-emerald-50 text-emerald-700"
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
											boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
										}}
									/>
									<Line
										type="monotone"
										dataKey="receita"
										name="Receita realizada"
										stroke="#16a34a"
										strokeWidth={3}
										dot={{ r: 4, strokeWidth: 2, fill: "#ffffff" }}
										activeDot={{ r: 6, strokeWidth: 2 }}
										connectNulls={false}
									/>
									<Line
										type="monotone"
										dataKey="projecao"
										name="Projeção"
										stroke="#0f766e"
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
								<span className="h-2 w-6 rounded-full bg-emerald-600" />
								Receita realizada
							</span>
							<span className="inline-flex items-center gap-2">
								<span className="h-0.5 w-6 border-t-2 border-dashed border-teal-700" />
								Projeção futura
							</span>
						</div>
					</div>

					{/* Painel de Insights e Ações */}
					<div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
						<div className="mb-8">
							<h3 className="text-2xl font-bold text-slate-900 mb-2">
								Insights & Ações
							</h3>
							<p className="text-slate-600 text-sm">
								Informações importantes para o seu negócio
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
													setCurrentAlertPage(Math.max(1, currentAlertPage - 1))
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
							<div className="text-center py-12">
								<div className="text-4xl mb-3">😌</div>
								<p className="text-slate-600 text-sm">
									Tudo corre bem! Nenhum alerta no momento.
								</p>
							</div>
						)}
					</div>

					{/* Occupancy Chart */}
					<div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
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
											boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
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
												fill={entry.baixaOcupacao ? "#f59e0b" : "#2563eb"}
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
								<span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
								Ocupação saudável
							</span>
							<span className="inline-flex items-center gap-2">
								<span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
								Baixa ocupação
							</span>
						</div>
					</div>

					{/* Property Revenue Goal Chart */}
					<div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
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
								<div className="flex h-9 items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-sm">
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
									className="inline-flex cursor-pointer h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg font-semibold text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50"
									aria-label="Aumentar meta em 100 reais"
								>
									<Plus className="w-4 h-4" />
								</button>
								<button
									type="button"
									onClick={() =>
										updatePropertyRevenueGoal(propertyRevenueGoal - 100)
									}
									className="inline-flex cursor-pointer h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg font-semibold text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50"
									aria-label="Reduzir meta em 100 reais"
								>
									<Minus className="w-4 h-4" />
								</button>
								<button
									type="button"
									onClick={() =>
										updatePropertyRevenueGoal(propertyRevenueGoal + 500)
									}
									className="h-9 cursor-pointer rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
								>
									+500
								</button>
								<button
									type="button"
									onClick={() =>
										updatePropertyRevenueGoal(propertyRevenueGoal + 1000)
									}
									className="h-9 cursor-pointer rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
								>
									+1.000
								</button>
								<button
									type="button"
									onClick={resetPropertyRevenueGoal}
									className="h-9 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm hover:border-slate-300 hover:bg-slate-50"
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
											boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
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
														? "#16a34a"
														: entry.baixaReceita
															? "#f59e0b"
															: "#2563eb"
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
								<span className="h-2.5 w-2.5 rounded-full bg-green-600" />
								Meta batida
							</span>
							<span className="inline-flex items-center gap-2">
								<span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
								Em andamento
							</span>
							<span className="inline-flex items-center gap-2">
								<span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
								Abaixo de 50%
							</span>
						</div>
					</div>
				</Masonry>
				{/* Calendar Section */}
				{data.calendar && (
					<div className="bg-white rounded-2xl  border border-slate-200 p-6 shadow-sm">
						<CalendarGridMonth calendar={data.calendar} />
					</div>
				)}
			</div>
		</div>
	);
}

export default HostDashboard;
