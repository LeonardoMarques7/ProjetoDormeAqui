import { useState, useEffect } from "react";
import {
	ResponsiveContainer,
	AreaChart,
	Area,
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
} from "recharts";
import {
	DollarSign,
	BarChart3,
	Calendar,
	Star,
	TrendingUp,
	TrendingDown,
} from "lucide-react";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
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
						className={`text-xs font-semibold ${colors.label} uppercase tracking-widest`}
					>
						{label}
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

				{progress !== null && (
					<div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
						<div
							className={`h-full ${colors.accent} rounded-full transition-all duration-500`}
							style={{ width: `${Math.min(progress, 100)}%` }}
						/>
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

	const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
			<div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
				{/* Hero KPI */}
				<section className="mb-8">
					<div className="grid grid-cols-1 md:grid-cols- lg:grid-cols-4 gap-6">
						<KPICard
							label="Receita do Mês"
							value={formatCurrency(data.finance.monthlyEarnings)}
							icon={DollarSign}
							trend="up"
							trendValue={18.2}
							subtext="vs. mês anterior"
							color="emerald"
							progress={Math.min(
								(data.finance.monthlyEarnings / 30000) * 100,
								100,
							)}
						/>

						<KPICard
							label="Taxa de Ocupação"
							value={`${data.metrics.occupancyRate.toFixed(1)}%`}
							icon={BarChart3}
							subtext="Semana atual"
							color="blue"
							progress={data.metrics.occupancyRate}
						/>

						<KPICard
							label="Total de Reservas"
							value={data.metrics.totalBookings.toString().padStart(2, "0")}
							icon={Calendar}
							subtext="Confirmadas este mês"
							color="purple"
							progress={(data.metrics.totalBookings / 30) * 100}
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
							color="amber"
							progress={(data.metrics.averageRating / 5) * 100}
						/>
					</div>
				</section>

				{/* Dashboard Completo com Masonry */}
				<Masonry columns={2} spacing={2}>
					{/* Revenue Chart */}
					<div className="h-fit bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
						<div className="mb-6">
							<h3 className="text-lg font-semibold text-slate-900">
								Receita ao Longo do Tempo
							</h3>
							<p className="text-sm text-slate-500">
								Evolução mensal da sua receita
							</p>
						</div>
						<ResponsiveContainer width="100%" height={300}>
							<AreaChart data={data.revenueData}>
								<defs>
									<linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
										<stop offset="95%" stopColor="#10b981" stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
								<XAxis dataKey="month" stroke="#94a3b8" />
								<YAxis stroke="#94a3b8" />
								<Tooltip formatter={(value) => formatCurrency(value)} />
								<Area
									type="monotone"
									dataKey="value"
									stroke="#16a34a"
									strokeWidth={2}
									fillOpacity={1}
									fill="url(#colorRevenue)"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>

					{/* Painel de Insights e Ações */}
					<div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
						<div className="mb-8">
							<h3 className="text-2xl font-bold text-slate-900 mb-2">
								✨ Insights & Ações
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
						<h3 className="text-lg font-semibold text-slate-900 mb-6">
							Ocupação Semanal
						</h3>
						<ResponsiveContainer width="100%" height={300}>
							<BarChart data={data.occupancyData}>
								<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
								<XAxis dataKey="day" stroke="#94a3b8" />
								<YAxis stroke="#94a3b8" />
								<Tooltip formatter={(value) => `${value}%`} />
								<Bar dataKey="occupancy" fill="#2563eb" radius={[8, 8, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>

					{/* Property Revenue Chart */}
					<div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
						<h3 className="text-lg font-semibold text-slate-900 mb-6">
							Receita por Propriedade
						</h3>
						<ResponsiveContainer width="100%" height={250}>
							<PieChart>
								<Pie
									data={data.propertyRevenue}
									cx="50%"
									cy="50%"
									innerRadius={60}
									outerRadius={100}
									paddingAngle={2}
									dataKey="revenue"
								>
									{data.propertyRevenue.map((entry, index) => (
										<Cell
											key={`cell-${index}`}
											fill={COLORS[index % COLORS.length]}
										/>
									))}
								</Pie>
								<Tooltip formatter={(value) => formatCurrency(value)} />
							</PieChart>
						</ResponsiveContainer>

						{/* Legend */}
						<div className="mt-6 space-y-2">
							{data.propertyRevenue.map((prop, idx) => (
								<div
									key={prop.id}
									className="flex items-center justify-between text-sm"
								>
									<div className="flex items-center gap-2">
										<div
											className="w-3 h-3 rounded-full"
											style={{ backgroundColor: COLORS[idx % COLORS.length] }}
										/>
										<span className="text-slate-700">{prop.name}</span>
									</div>
									<span className="font-semibold text-slate-900">
										{formatCurrency(prop.revenue)}
									</span>
								</div>
							))}
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
