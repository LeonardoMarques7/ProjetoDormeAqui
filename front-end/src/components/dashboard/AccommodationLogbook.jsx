import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	AlertTriangle,
	BookOpen,
	CalendarDays,
	CheckCircle2,
	Download,
	Filter,
	Home,
	RefreshCw,
	Search,
	UserRound,
	XCircle,
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import DatePickerAirbnb from "@/components/places/DatePickerAirbnb";
import { getAccommodationLogbook } from "@/services/logbookService";

const emptyPayload = {
	logs: [],
	summary: {
		total: 0,
		lastSevenDays: 0,
		bookingUpdates: 0,
		accommodationUpdates: 0,
	},
	options: {
		names: [],
		actions: [],
		contexts: [],
	},
	total: 0,
};

const formatDateTime = (value) =>
	new Intl.DateTimeFormat("pt-BR", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(value));

const parseLocalDate = (value) => {
	if (!value) return null;
	const [year, month, day] = String(value).split("-").map(Number);
	if (!year || !month || !day) return null;
	return new Date(year, month - 1, day);
};

const formatDateForFilter = (date) => {
	if (!date) return "";
	const resolvedDate = date instanceof Date ? date : new Date(date);
	if (Number.isNaN(resolvedDate.getTime())) return "";
	const year = resolvedDate.getFullYear();
	const month = String(resolvedDate.getMonth() + 1).padStart(2, "0");
	const day = String(resolvedDate.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

const SelectFilter = ({ label, value, onChange, options }) => (
	<label className="flex min-w-0 flex-col gap-1 text-[11px] font-medium text-slate-500">
		{label}
		<Select
			value={value}
			onValueChange={onChange}
		>
			<SelectTrigger
				size="sm"
				className="h-9 w-full min-w-0 border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-none focus:ring-slate-200"
			>
				<SelectValue placeholder="Todos" />
			</SelectTrigger>
			<SelectContent className="z-[9999]">
				<SelectItem value="all">Todos</SelectItem>
				{options.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	</label>
);

const DateRangeFilter = ({ startDate, endDate, onChange, resetKey }) => (
	<div className="min-w-0">
		<p className="mb-1 text-[11px] font-medium text-slate-500">Período</p>
		<div className="rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700">
			<DatePickerAirbnb
				key={resetKey}
				initialCheckin={parseLocalDate(startDate)}
				initialCheckout={parseLocalDate(endDate)}
				disablePastDates={false}
				startLabel="De"
				endLabel="Até"
				price={0}
				showPriceSummary={false}
				onDateSelect={({ checkin, checkout }) => {
					onChange({
						startDate: formatDateForFilter(checkin),
						endDate: formatDateForFilter(checkout),
					});
				}}
			/>
		</div>
	</div>
);

const getInitials = (name) =>
	String(name || "Sistema")
		.split(" ")
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0])
		.join("")
		.toUpperCase();

const getEventIcon = (log) => {
	const key = `${log.contextKey || ""} ${log.actionKey || ""}`.toLowerCase();

	if (key.includes("payment") || key.includes("approved")) return CheckCircle2;
	if (key.includes("cancel") || key.includes("reject")) return XCircle;
	if (key.includes("status") || key.includes("warning")) return AlertTriangle;
	if (key.includes("calendar") || key.includes("check")) return CalendarDays;
	if (key.includes("place") || key.includes("accommodation")) return Home;
	return BookOpen;
};

const getEventTone = (log) => {
	const key = `${log.contextKey || ""} ${log.actionKey || ""}`.toLowerCase();

	if (key.includes("cancel") || key.includes("reject")) return "text-red-600";
	if (key.includes("payment") || key.includes("approved"))
		return "text-emerald-600";
	if (key.includes("status") || key.includes("warning"))
		return "text-amber-600";
	if (key.includes("calendar") || key.includes("check")) return "text-sky-600";
	return "text-slate-500";
};

const csvEscape = (value) => `"${String(value || "").replace(/"/g, '""')}"`;

function AccommodationLogbook({
	limit = 80,
	refreshIntervalMs = 45000,
	itemsPerPage = 10,
}) {
	const [filters, setFilters] = useState({
		search: "",
		startDate: "",
		endDate: "",
		name: "all",
		action: "all",
		context: "all",
	});
	const [payload, setPayload] = useState(emptyPayload);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState("");
	const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [showFilters, setShowFilters] = useState(false);
	const [dateFilterResetKey, setDateFilterResetKey] = useState(0);
	const loadingRef = useRef(false);

	const requestFilters = useMemo(
		() => ({
			...filters,
			limit,
		}),
		[filters, limit],
	);

	const loadLogbook = useCallback(
		async ({ fullLoading = false } = {}) => {
			if (loadingRef.current) return;

			try {
				loadingRef.current = true;
				if (fullLoading) {
					setLoading(true);
				} else {
					setRefreshing(true);
				}
				setError("");

				const data = await getAccommodationLogbook(requestFilters);
				setPayload({
					...emptyPayload,
					...data,
					summary: {
						...emptyPayload.summary,
						...(data.summary || {}),
					},
					options: {
						...emptyPayload.options,
						...(data.options || {}),
					},
				});
				setLastUpdatedAt(new Date());
			} catch (err) {
				console.error("Erro ao carregar histórico:", err);
				setError("Não foi possível carregar o histórico agora.");
			} finally {
				loadingRef.current = false;
				setLoading(false);
				setRefreshing(false);
			}
		},
		[requestFilters],
	);

	useEffect(() => {
		loadLogbook({ fullLoading: true });
	}, [loadLogbook]);

	useEffect(() => {
		const intervalId = window.setInterval(() => {
			if (document.visibilityState === "visible") {
				loadLogbook();
			}
		}, refreshIntervalMs);

		return () => window.clearInterval(intervalId);
	}, [loadLogbook, refreshIntervalMs]);

	const updateFilter = (key, value) => {
		setFilters((current) => ({
			...current,
			[key]: value,
		}));
	};

	const clearFilters = () => {
		setFilters({
			search: "",
			startDate: "",
			endDate: "",
			name: "all",
			action: "all",
			context: "all",
		});
		setDateFilterResetKey((key) => key + 1);
	};

	const exportCsv = () => {
		const rows = [
			["Data", "Usuario", "Evento", "Origem", "Registro"],
			...payload.logs.map((log) => [
				formatDateTime(log.date),
				log.actorName,
				log.action,
				log.placeName,
				log.bookingCode || log.context,
			]),
		];
		const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "logbook-acomodacoes.csv";
		link.click();
		URL.revokeObjectURL(url);
	};

	const hasActiveFilters = Object.entries(filters).some(([key, value]) =>
		key === "search" ? value.trim() : value && value !== "all",
	);
	const totalPages = Math.max(1, Math.ceil(payload.logs.length / itemsPerPage));
	const paginatedLogs = payload.logs.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);
	const emptyLogRows = Array.from({
		length: Math.max(0, itemsPerPage - paginatedLogs.length),
	});
	const pageStart = payload.logs.length
		? (currentPage - 1) * itemsPerPage + 1
		: 0;
	const pageEnd = Math.min(currentPage * itemsPerPage, payload.logs.length);

	useEffect(() => {
		setCurrentPage(1);
	}, [filters]);

	useEffect(() => {
		setCurrentPage((page) => Math.min(page, totalPages));
	}, [totalPages]);

	return (
		<section className="mb-8">
			<div className="rounded-lg border border-slate-200 bg-white shadow-sm">
				<div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
					<div className="min-w-0">
						<div className="flex items-center gap-2">
							<h2 className="text-sm font-semibold text-slate-950">
								Histórico de atividades
							</h2>
							<span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
								{payload.summary.total} registros
							</span>
						</div>
						<p className="mt-1 text-xs text-slate-500">
							{lastUpdatedAt
								? `Atualizado às ${new Intl.DateTimeFormat("pt-BR", {
										hour: "2-digit",
										minute: "2-digit",
									}).format(lastUpdatedAt)}`
								: "Aguardando atualização"}
						</p>
					</div>

					<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
						<div className="relative sm:w-64">
							<Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
							<input
								value={filters.search}
								onChange={(event) => updateFilter("search", event.target.value)}
								placeholder="Buscar"
								className="h-9 w-full rounded-md border border-slate-200 bg-white pl-8 pr-3 text-xs font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
							/>
						</div>

						<button
							type="button"
							onClick={() => setShowFilters((visible) => !visible)}
							className={`inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-xs font-semibold transition ${
								showFilters || hasActiveFilters
									? "border-slate-900 bg-slate-900 text-white"
									: "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
							}`}
						>
							<Filter className="h-3.5 w-3.5" />
							Filtros
						</button>

						<button
							type="button"
							onClick={() => loadLogbook()}
							disabled={refreshing || loading}
							className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-2.5 text-slate-600 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
							aria-label="Atualizar histórico"
							title="Atualizar"
						>
							<RefreshCw
								className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
							/>
						</button>

						<button
							type="button"
							onClick={exportCsv}
							disabled={payload.logs.length === 0}
							className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-slate-950 px-3 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-50"
						>
							<Download className="h-3.5 w-3.5" />
							Exportar
						</button>
					</div>
				</div>

				{showFilters && (
					<div className="grid grid-cols-1 gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3 md:grid-cols-2 xl:grid-cols-[1.35fr_1fr_1fr_1fr_auto]">
						<DateRangeFilter
							startDate={filters.startDate}
							endDate={filters.endDate}
							resetKey={dateFilterResetKey}
							onChange={({ startDate, endDate }) => {
								setFilters((current) => ({
									...current,
									startDate,
									endDate,
								}));
							}}
						/>
						<label className="hidden min-w-0 flex-col gap-1 text-[11px] font-medium text-slate-500">
							De
							<input
								type="date"
								value={filters.startDate}
								onChange={(event) =>
									updateFilter("startDate", event.target.value)
								}
								className="h-9 min-w-0 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 outline-none transition focus:border-slate-400"
							/>
						</label>

						<label className="hidden min-w-0 flex-col gap-1 text-[11px] font-medium text-slate-500">
							Até
							<input
								type="date"
								value={filters.endDate}
								onChange={(event) =>
									updateFilter("endDate", event.target.value)
								}
								className="h-9 min-w-0 rounded-md border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 outline-none transition focus:border-slate-400"
							/>
						</label>

						<SelectFilter
							label="Nome"
							value={filters.name}
							onChange={(value) => updateFilter("name", value)}
							options={payload.options.names}
						/>
						<SelectFilter
							label="Ação"
							value={filters.action}
							onChange={(value) => updateFilter("action", value)}
							options={payload.options.actions}
						/>
						<SelectFilter
							label="Contexto"
							value={filters.context}
							onChange={(value) => updateFilter("context", value)}
							options={payload.options.contexts}
						/>

						<button
							type="button"
							onClick={clearFilters}
							disabled={!hasActiveFilters}
							className="h-9 self-end rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-50"
						>
							Limpar
						</button>
					</div>
				)}

				{error && (
					<div className="border-b border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
						{error}
					</div>
				)}

				<div className="overflow-x-auto">
					<table className="w-full min-w-[900px] border-collapse text-left">
						<thead>
							<tr className="border-b border-slate-100 bg-white text-[11px] font-medium text-slate-400">
								<th className="w-10 px-4 py-3">
									<input
										type="checkbox"
										disabled
										className="h-3.5 w-3.5 rounded border-slate-200"
										aria-label="Selecionar todos"
									/>
								</th>
								<th className="px-2 py-3">Data e hora</th>
								<th className="px-2 py-3">Usuário</th>
								<th className="px-2 py-3">Atividade</th>
								<th className="px-2 py-3">Origem</th>
								<th className="px-2 py-3">Registro</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{loading ? (
								<tr>
									<td
										colSpan={6}
										className="h-[340px] px-4 text-center text-xs font-medium text-slate-500"
									>
										Carregando histórico...
									</td>
								</tr>
							) : paginatedLogs.length > 0 ? (
								paginatedLogs.map((log) => {
									const EventIcon = getEventIcon(log);

									return (
										<tr
											key={log.id}
											className="h-[68px] bg-white text-xs text-slate-700 transition hover:bg-slate-50"
										>
											<td className="px-4 py-3">
												<input
													type="checkbox"
													className="h-3.5 w-3.5 rounded border-slate-200"
													aria-label={`Selecionar ${log.title}`}
												/>
											</td>
											<td className="whitespace-nowrap px-2 py-3 font-medium tabular-nums text-slate-700">
												{formatDateTime(log.date)}
											</td>
											<td className="px-2 py-3">
												<div className="flex items-center gap-2">
													<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-500">
														{getInitials(log.actorName) || (
															<UserRound className="h-3 w-3" />
														)}
													</span>
													<div className="min-w-0">
														<p className="truncate font-medium text-slate-800">
															{log.actorName}
														</p>
														<p className="truncate text-[11px] text-slate-400">
															{log.actorRole}
														</p>
													</div>
												</div>
											</td>
											<td className="px-2 py-3">
												<div className="flex min-w-0 items-center gap-2">
													<EventIcon
														className={`h-3.5 w-3.5 shrink-0 ${getEventTone(log)}`}
													/>
													<div className="min-w-0">
														<p className="truncate font-medium text-slate-800">
															{log.action}
														</p>
														<p className="truncate text-[11px] text-slate-400">
															{log.context}
														</p>
													</div>
												</div>
											</td>
											<td className="max-w-[240px] px-2 py-3">
												<p className="truncate font-medium text-slate-700">
													{log.placeName}
												</p>
												<p className="truncate text-[11px] text-slate-400">
													{log.placeCity || "Sem cidade informada"}
												</p>
											</td>
											<td className="whitespace-nowrap px-2 py-3 font-medium tabular-nums text-slate-600">
												{log.bookingCode
													? `#${log.bookingCode}`
													: log.contextKey}
											</td>
										</tr>
									);
								})
							) : (
								<tr>
									<td colSpan={6} className="h-[340px] px-4 text-center">
										<BookOpen className="mx-auto h-6 w-6 text-slate-300" />
										<p className="mt-2 text-sm font-semibold text-slate-800">
											Nenhum registro encontrado.
										</p>
										<p className="mt-1 text-xs text-slate-500">
											Ajuste os filtros ou aguarde novas atualizações.
										</p>
									</td>
								</tr>
							)}
							{!loading &&
								paginatedLogs.length > 0 &&
								emptyLogRows.map((_, index) => (
									<tr
										key={`empty-log-row-${index}`}
										className="h-[68px] bg-white"
										aria-hidden="true"
									>
										<td colSpan={6} className="px-4 py-3" />
									</tr>
								))}
						</tbody>
					</table>
				</div>

				{!loading && payload.logs.length > 0 && (
					<div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
						<p className="text-xs font-medium text-slate-500">
							Mostrando {pageStart}-{pageEnd} de {payload.logs.length}
						</p>
						{totalPages > 1 && (
							<Pagination className="mx-0 w-fit justify-start sm:justify-end">
								<PaginationContent className="!list-none">
									<PaginationItem>
										<PaginationPrevious
											onClick={() =>
												setCurrentPage(Math.max(1, currentPage - 1))
											}
											className={
												currentPage === 1
													? "pointer-events-none opacity-50"
													: "cursor-pointer"
											}
										/>
									</PaginationItem>

									{[...Array(totalPages)].map((_, index) => {
										const pageNumber = index + 1;
										return (
											<PaginationItem key={pageNumber}>
												<PaginationLink
													onClick={() => setCurrentPage(pageNumber)}
													isActive={currentPage === pageNumber}
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
												setCurrentPage(Math.min(totalPages, currentPage + 1))
											}
											className={
												currentPage === totalPages
													? "pointer-events-none opacity-50"
													: "cursor-pointer"
											}
										/>
									</PaginationItem>
								</PaginationContent>
							</Pagination>
						)}
					</div>
				)}
			</div>
		</section>
	);
}

export default AccommodationLogbook;
