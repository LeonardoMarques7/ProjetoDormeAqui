import { useState, useMemo } from "react";
import {
	TrendingUp,
	TrendingDown,
	Calendar,
	DollarSign,
	Users,
	Star,
	Home,
	ArrowUpRight,
	ArrowDownRight,
	MoreVertical,
	Eye,
	Edit,
	Trash2,
	ChevronLeft,
	ChevronRight,
	Download,
	Filter,
	Search,
	Settings,
	Bell,
	Clock,
	MapPin,
	Activity,
	ArrowLeft,
} from "lucide-react";
import {
	ResponsiveContainer,
	AreaChart,
	Area,
	BarChart,
	Bar,
	PieChart,
	Pie,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Cell,
} from "recharts";
import { ImageWithFallback } from "../ImageWithFallback";
import CalendarGridMonth from "./CalendarGridMonth";
import { useEffect } from "react";
import { getHostDashboard } from "@/services/dashboardService";

function HostDashboard() {
	const [dashboard, setDashboard] = useState(null);
	const [loading, setLoading] = useState(true);
	const [selectedMonth, setSelectedMonth] = useState(3); // Abril 2026
	const [selectedPeriod, setSelectedPeriod] = useState("30d");

	useEffect(() => {
		const fetchData = async () => {
			try {
				const data = await getHostDashboard();
				setDashboard(data);
			} catch (err) {
				console.error("Erro ao carregar dashboard:", err);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
					<p className="text-gray-600">Carregando dashboard...</p>
				</div>
			</div>
		);
	}

	// Dados da API ou mock
	const mockReservations = dashboard?.calendar?.events || [];
	const mockProperties = dashboard?.places || [];

	// Mock data para gráficos
	const revenueData = [
		{ name: "Jan", valor: 12400, reservas: 8 },
		{ name: "Fev", valor: 15200, reservas: 10 },
		{ name: "Mar", valor: 18600, reservas: 12 },
		{ name: "Abr", valor: 24500, reservas: 16 },
		{ name: "Mai", valor: 19800, reservas: 13 },
		{ name: "Jun", valor: 22100, reservas: 14 },
	];

	const occupancyData = [
		{ name: "Seg", ocupacao: 65 },
		{ name: "Ter", ocupacao: 75 },
		{ name: "Qua", ocupacao: 85 },
		{ name: "Qui", ocupacao: 90 },
		{ name: "Sex", ocupacao: 95 },
		{ name: "Sab", ocupacao: 100 },
		{ name: "Dom", ocupacao: 88 },
	];

	const propertyRevenueData = mockProperties.slice(0, 3).map((prop, idx) => ({
		name: prop.title?.split(" ")[0] || `Propriedade ${idx + 1}`,
		value: Math.random() * 10000,
		color: ["#10b981", "#3b82f6", "#f59e0b"][idx % 3],
	}));

	const formatCurrency = (value) => {
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value || 0);
	};

	const formatDate = (dateStr) => {
		return new Intl.DateFormat("pt-BR", {
			day: "2-digit",
			month: "short",
		}).format(new Date(dateStr));
	};

	// Métricas
	const todayCheckins = dashboard?.today?.checkins || 0;
	const todayCheckouts = dashboard?.today?.checkouts || 0;
	const pendingReservations = dashboard?.today?.pendingBookings || 0;
	const totalRevenue = dashboard?.finance?.monthlyEarnings || 24500;
	const expectedRevenue = dashboard?.finance?.averagePerNight || 0;
	const futureRevenue = dashboard?.finance?.futureEarnings || 1624.24;
	const occupancyRate = dashboard?.metrics?.occupancyRate || 85.0;
	const avgDailyRate = dashboard?.finance?.averagePerNight || 1624.24;
	const totalReservations = dashboard?.metrics?.totalBookings || 16;
	const avgRating = dashboard?.metrics?.averageRating || 4.8;

	return (
		<div>
			<div className="px-8 max-w-7xl mx-auto py-6">
				{/* Resumo de Hoje */}
				<div className="mb-8">
					<h2 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
						<Clock className="w-5 h-5 text-gray-400" />
						Resumo de Hoje
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{/* Check-ins */}
						<div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
							<div className="flex items-start justify-between mb-4">
								<div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
									<Users className="w-6 h-6 text-emerald-600" />
								</div>
								<span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full">
									Hoje
								</span>
							</div>
							<div className="mb-2">
								<div className="text-3xl text-gray-900 mb-1">
									{todayCheckins}
								</div>
								<p className="text-sm text-gray-500">Check-ins de Hoje</p>
							</div>
						</div>

						{/* Check-outs */}
						<div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
							<div className="flex items-start justify-between mb-4">
								<div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
									<Calendar className="w-6 h-6 text-blue-600" />
								</div>
								<span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
									Hoje
								</span>
							</div>
							<div className="mb-2">
								<div className="text-3xl text-gray-900 mb-1">
									{todayCheckouts}
								</div>
								<p className="text-sm text-gray-500">Check-outs de Hoje</p>
							</div>
						</div>

						{/* Pendentes */}
						<div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
							<div className="flex items-start justify-between mb-4">
								<div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
									<Activity className="w-6 h-6 text-amber-600" />
								</div>
								<span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-full">
									Ação necessária
								</span>
							</div>
							<div className="mb-2">
								<div className="text-3xl text-gray-900 mb-1">
									{pendingReservations}
								</div>
								<p className="text-sm text-gray-500">Reservas Pendentes</p>
							</div>
						</div>
					</div>
				</div>

				{/* Main Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
					{/* Left Column - Charts */}
					<div className="lg:col-span-2 space-y-6">
						{/* Revenue Chart */}
						<div className="bg-white rounded-xl border border-gray-200 p-6">
							<div className="flex items-center justify-between mb-6">
								<div>
									<h3 className="text-lg text-gray-900 mb-1">
										Receita ao Longo do Tempo
									</h3>
									<p className="text-sm text-gray-500">
										Evolução mensal da sua receita
									</p>
								</div>
								<div className="text-right">
									<div className="text-2xl text-gray-900 mb-1">
										{formatCurrency(totalRevenue)}
									</div>
									<div className="flex items-center gap-1 text-sm text-emerald-600">
										<TrendingUp className="w-4 h-4" />
										<span>+18.2%</span>
									</div>
								</div>
							</div>
							<ResponsiveContainer width="100%" height={300}>
								<AreaChart data={revenueData}>
									<defs>
										<linearGradient
											id="colorRevenue"
											x1="0"
											y1="0"
											x2="0"
											y2="1"
										>
											<stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
											<stop offset="95%" stopColor="#10b981" stopOpacity={0} />
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
									<XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
									<YAxis
										stroke="#9ca3af"
										fontSize={12}
										tickFormatter={(value) => `R$ ${value / 1000}k`}
									/>
									<Tooltip
										formatter={(value) => formatCurrency(value)}
										contentStyle={{
											backgroundColor: "white",
											border: "1px solid #e5e7eb",
											borderRadius: "8px",
											fontSize: "12px",
										}}
									/>
									<Area
										type="monotone"
										dataKey="valor"
										stroke="#10b981"
										strokeWidth={2}
										fillOpacity={1}
										fill="url(#colorRevenue)"
									/>
								</AreaChart>
							</ResponsiveContainer>
						</div>

						{/* Occupancy Chart */}
						<div className="bg-white rounded-xl border border-gray-200 p-6">
							<div className="flex items-center justify-between mb-6">
								<div>
									<h3 className="text-lg text-gray-900 mb-1">
										Taxa de Ocupação Semanal
									</h3>
									<p className="text-sm text-gray-500">
										Porcentagem de ocupação por dia
									</p>
								</div>
								<div className="text-right">
									<div className="text-2xl text-gray-900 mb-1">
										{occupancyRate.toFixed(1)}%
									</div>
									<div className="flex items-center gap-1 text-sm text-emerald-600">
										<TrendingUp className="w-4 h-4" />
										<span>+5.3%</span>
									</div>
								</div>
							</div>
							<ResponsiveContainer width="100%" height={250}>
								<BarChart data={occupancyData}>
									<CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
									<XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
									<YAxis
										stroke="#9ca3af"
										fontSize={12}
										tickFormatter={(value) => `${value}%`}
									/>
									<Tooltip
										formatter={(value) => `${value}%`}
										contentStyle={{
											backgroundColor: "white",
											border: "1px solid #e5e7eb",
											borderRadius: "8px",
											fontSize: "12px",
										}}
									/>
									<Bar
										dataKey="ocupacao"
										fill="#3b82f6"
										radius={[8, 8, 0, 0]}
									/>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>

					{/* Right Column - Stats & Distribution */}
					<div className="space-y-6">
						{/* Financial Summary */}
						<div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
							<h3 className="text-lg mb-6 flex items-center gap-2">
								<DollarSign className="w-5 h-5" />
								Financeiro (MVP)
							</h3>
							<div className="space-y-4">
								<div>
									<p className="text-emerald-100 text-sm mb-1">
										Ganhos Esperados
									</p>
									<div className="text-3xl">{formatCurrency(totalRevenue)}</div>
								</div>
								<div className="h-px bg-white/20"></div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<p className="text-emerald-100 text-sm mb-1">
											Ganhos Futuros
										</p>
										<div className="text-xl">
											{formatCurrency(futureRevenue)}
										</div>
									</div>
									<div>
										<p className="text-emerald-100 text-sm mb-1">
											Próximos 30 dias
										</p>
										<div className="text-xl">
											{formatCurrency(expectedRevenue)}
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Metrics */}
						<div className="bg-white rounded-xl border border-gray-200 p-6">
							<h3 className="text-lg text-gray-900 mb-4">
								Métricas de Desempenho
							</h3>
							<div className="space-y-4">
								<div>
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm text-gray-600">
											Taxa de Ocupação
										</span>
										<span className="text-sm text-gray-900">
											{occupancyRate.toFixed(1)}%
										</span>
									</div>
									<div className="h-2 bg-gray-100 rounded-full overflow-hidden">
										<div
											className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
											style={{ width: `${occupancyRate}%` }}
										></div>
									</div>
								</div>

								<div className="h-px bg-gray-100"></div>

								<div>
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm text-gray-600">
											Preço Médio Diário
										</span>
										<span className="text-sm text-gray-900">
											{formatCurrency(avgDailyRate)}
										</span>
									</div>
								</div>

								<div className="h-px bg-gray-100"></div>

								<div>
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm text-gray-600">
											Total de Reservas
										</span>
										<span className="text-sm text-gray-900">
											{totalReservations}
										</span>
									</div>
								</div>

								<div className="h-px bg-gray-100"></div>

								<div>
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm text-gray-600">
											Avaliação Média
										</span>
										<div className="flex items-center gap-1">
											<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
											<span className="text-sm text-gray-900">
												{avgRating} / 5
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Revenue Distribution */}
						{propertyRevenueData.length > 0 && (
							<div className="bg-white rounded-xl border border-gray-200 p-6">
								<h3 className="text-lg text-gray-900 mb-4">
									Receita por Propriedade
								</h3>
								<div className="mb-4">
									<ResponsiveContainer width="100%" height={180}>
										<PieChart>
											<Pie
												data={propertyRevenueData}
												cx="50%"
												cy="50%"
												innerRadius={50}
												outerRadius={80}
												paddingAngle={5}
												dataKey="value"
											>
												{propertyRevenueData.map((entry, index) => (
													<Cell key={`cell-${index}`} fill={entry.color} />
												))}
											</Pie>
											<Tooltip
												formatter={(value) => formatCurrency(value)}
												contentStyle={{
													backgroundColor: "white",
													border: "1px solid #e5e7eb",
													borderRadius: "8px",
													fontSize: "12px",
												}}
											/>
										</PieChart>
									</ResponsiveContainer>
								</div>
								<div className="space-y-2">
									{propertyRevenueData.map((item) => (
										<div
											key={item.name}
											className="flex items-center justify-between"
										>
											<div className="flex items-center gap-2">
												<div
													className="w-3 h-3 rounded-full"
													style={{ backgroundColor: item.color }}
												></div>
												<span className="text-sm text-gray-600">
													{item.name}
												</span>
											</div>
											<span className="text-sm text-gray-900">
												{formatCurrency(item.value)}
											</span>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Calendar Section */}
				{dashboard?.calendar && (
					<div className="mb-8">
						<CalendarGridMonth calendar={dashboard?.calendar} />
					</div>
				)}

				{/* Properties Management */}
				{mockProperties.length > 0 && (
					<div className="bg-white rounded-xl border border-gray-200 p-6">
						<div className="flex items-center justify-between mb-6">
							<div>
								<h2 className="text-lg text-gray-900 mb-1">
									Gestão de Anúncios
								</h2>
								<p className="text-sm text-gray-500">
									Suas propriedades ativas na plataforma
								</p>
							</div>
							<div className="flex items-center gap-3">
								<div className="relative">
									<Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
									<input
										type="text"
										placeholder="Buscar propriedade..."
										className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
									/>
								</div>
								<button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors text-sm flex items-center gap-2">
									<Home className="w-4 h-4" />
									Nova Propriedade
								</button>
							</div>
						</div>

						<div className="space-y-4">
							{mockProperties.map((property) => (
								<div
									key={property._id}
									className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all group"
								>
									<div className="flex items-center gap-4">
										{/* Image */}
										<div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
											<ImageWithFallback
												src={property.photos?.[0]}
												alt={property.title}
												className="w-full h-full object-cover group-hover:scale-105 transition-transform"
											/>
										</div>

										{/* Info */}
										<div className="flex-1 min-w-0">
											<div className="flex items-start justify-between mb-2">
												<div>
													<h3 className="text-gray-900 mb-1 line-clamp-1">
														{property.title}
													</h3>
													<div className="flex items-center gap-2 text-sm text-gray-500">
														<MapPin className="w-4 h-4" />
														<span>
															{property.city || "Localização não especificada"}
														</span>
													</div>
												</div>
												<div className="flex items-center gap-1">
													<button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
														<Eye className="w-4 h-4 text-gray-600" />
													</button>
													<button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
														<Edit className="w-4 h-4 text-gray-600" />
													</button>
													<button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
														<Trash2 className="w-4 h-4 text-red-600" />
													</button>
												</div>
											</div>

											{/* Stats */}
											<div className="grid grid-cols-4 gap-4 mt-4">
												<div className="bg-gray-50 rounded-lg p-3">
													<div className="flex items-center gap-2 mb-1">
														<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
														<span className="text-sm text-gray-900">
															{property.averageRating || 0}
														</span>
													</div>
													<p className="text-xs text-gray-500">avaliações</p>
												</div>

												<div className="bg-gray-50 rounded-lg p-3">
													<div className="flex items-center gap-2 mb-1">
														<Activity className="w-4 h-4 text-blue-600" />
														<span className="text-sm text-gray-900">80%</span>
													</div>
													<p className="text-xs text-gray-500">Ocupação</p>
												</div>

												<div className="bg-gray-50 rounded-lg p-3">
													<div className="flex items-center gap-2 mb-1">
														<DollarSign className="w-4 h-4 text-emerald-600" />
														<span className="text-sm text-gray-900">
															{formatCurrency(property.price || 0)}
														</span>
													</div>
													<p className="text-xs text-gray-500">Preço/noite</p>
												</div>

												<div
													className={`rounded-lg p-3 ${property.isActive ? "bg-emerald-50" : "bg-gray-50"}`}
												>
													<div className="flex items-center gap-2 mb-1">
														<div
															className={`w-2 h-2 rounded-full ${property.isActive ? "bg-emerald-500" : "bg-gray-400"}`}
														></div>
														<span
															className={`text-sm ${property.isActive ? "text-emerald-700" : "text-gray-700"}`}
														>
															{property.isActive ? "Ativa" : "Inativa"}
														</span>
													</div>
													<p
														className={`text-xs ${property.isActive ? "text-emerald-600" : "text-gray-600"}`}
													>
														Status
													</p>
												</div>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default HostDashboard;
