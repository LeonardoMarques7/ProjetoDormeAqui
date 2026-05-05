import { useEffect, useMemo, useState } from "react";
import {
	AddCircle as Plus,
	Banknote,
	Calendar as CalendarDays,
	CheckCircle as CheckCircle2,
	CloseCircle as X,
	Graph as FileBarChart,
	Refresh as RefreshCw,
	Ticket,
} from "@solar-icons/react";
import {
	createHostFinancialEntry,
	deleteHostFinancialEntry,
	getHostFinancialEntries,
	getHostFinancialSummary,
} from "@/services/dashboardService";

const CATEGORY_TABS = [
	{
		key: "recurring_expense",
		label: "Despesas recorrentes",
		description: "Condomínio, IPTU, água, luz e internet.",
		color: "amber",
		defaultCategory: "condominio",
		defaultTitle: "Despesa recorrente",
		defaultStatus: "paid",
	},
	{
		key: "operational_expense",
		label: "Despesas operacionais",
		description: "Limpeza, manutenção, reposição e outras despesas.",
		color: "slate",
		defaultCategory: "limpeza",
		defaultTitle: "Despesa operacional",
		defaultStatus: "paid",
	},
	{
		key: "refund",
		label: "Reembolsos",
		description: "Valor, data e reserva vinculada ao reembolso.",
		color: "red",
		defaultCategory: "reembolso",
		defaultTitle: "Reembolso",
		defaultStatus: "refunded",
	},
	{
		key: "payment_fee",
		label: "Taxas de pagamento",
		description: "Taxas reais por transação, quando o valor for conhecido.",
		color: "blue",
		defaultCategory: "taxa_pagamento",
		defaultTitle: "Taxa de pagamento",
		defaultStatus: "paid",
	},
	{
		key: "manual_revenue",
		label: "Receitas manuais",
		description: "Entradas extras que não vêm da reserva.",
		color: "green",
		defaultCategory: "receita_manual",
		defaultTitle: "Receita manual",
		defaultStatus: "confirmed",
	},
];

const ENTRY_STATUS_OPTIONS = [
	{ key: "draft", label: "Rascunho" },
	{ key: "pending", label: "Pendente" },
	{ key: "scheduled", label: "Agendado" },
	{ key: "confirmed", label: "Confirmado" },
	{ key: "paid", label: "Pago" },
	{ key: "processing", label: "Em processamento" },
	{ key: "refunded", label: "Reembolsado" },
	{ key: "failed", label: "Falhou" },
	{ key: "canceled", label: "Cancelado" },
	{ key: "void", label: "Anulado" },
];

const RECURRENT_CATEGORIES = [
	{ key: "condominio", label: "Condomínio" },
	{ key: "iptu", label: "IPTU" },
	{ key: "agua", label: "Água" },
	{ key: "luz", label: "Luz" },
	{ key: "internet", label: "Internet" },
];

const OPERATIONAL_CATEGORIES = [
	{ key: "limpeza", label: "Limpeza" },
	{ key: "manutencao", label: "Manutenção" },
	{ key: "reposicao", label: "Reposição" },
	{ key: "outras_despesas", label: "Outras despesas" },
];

const REIMBURSEMENT_CATEGORIES = [{ key: "reembolso", label: "Reembolso" }];
const PAYMENT_FEE_CATEGORIES = [{ key: "taxa_pagamento", label: "Taxa de pagamento" }];
const MANUAL_REVENUE_CATEGORIES = [{ key: "receita_manual", label: "Receita manual" }];

const CATEGORY_OPTIONS = {
	recurring_expense: RECURRENT_CATEGORIES,
	operational_expense: OPERATIONAL_CATEGORIES,
	refund: REIMBURSEMENT_CATEGORIES,
	payment_fee: PAYMENT_FEE_CATEGORIES,
	manual_revenue: MANUAL_REVENUE_CATEGORIES,
};

const formatCurrency = (value) =>
	new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(Number(value || 0));

const toMonthKey = (date = new Date()) => {
	const current = new Date(date);
	return `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
};

const toDateInputValue = (value = new Date()) =>
	new Date(value).toISOString().slice(0, 10);

const getDefaultFormState = (tabKey, placeId, monthKey) => {
	const tab = CATEGORY_TABS.find((item) => item.key === tabKey) || CATEGORY_TABS[0];
	return {
		entryType: tab.key,
		placeId: placeId || "",
		competenceMonth: monthKey || toMonthKey(),
		entryDate: toDateInputValue(),
		category: tab.defaultCategory,
		title: tab.defaultTitle,
		description: "",
		amount: "",
		status: tab.defaultStatus,
		source: "manual_form",
		provider: "",
		bookingId: "",
		paymentId: "",
		recurrenceId: "",
		fiscalCategory: "",
		accountingCategory: "",
		taxDeductible: tab.key === "manual_revenue" ? false : true,
		notes: "",
	};
};

const getSummaryCards = (summary = {}) => [
	{
		key: "grossRevenue",
		label: "Receita bruta",
		value: summary.totals?.grossRevenue ?? 0,
		helper: "Reservas aprovadas do mês",
		tone: "green",
	},
	{
		key: "manualRevenue",
		label: "Receitas manuais",
		value: summary.totals?.manualRevenue ?? 0,
		helper: "Entradas extras registradas pelo anfitrião",
		tone: "blue",
	},
	{
		key: "expenses",
		label: "Despesas totais",
		value:
			Number(summary.totals?.recurringExpenses || 0) +
			Number(summary.totals?.operationalExpenses || 0) +
			Number(summary.totals?.paymentFees || 0) +
			Number(summary.totals?.refunds || 0),
		helper: "Recorrentes, operacionais, taxas e reembolsos",
		tone: "amber",
	},
	{
		key: "accountingNetRevenue",
		label: "Receita líquida contábil",
		value: summary.totals?.accountingNetRevenue ?? 0,
		helper: "Cálculo consolidado pelo backend",
		tone: "green",
	},
	{
		key: "fiscalNetRevenue",
		label: "Receita líquida fiscal",
		value: summary.totals?.fiscalNetRevenue ?? 0,
		helper: "Aplicando as regras fiscais do backend",
		tone: "green",
	},
];

function SummaryCard({ item }) {
	return (
		<article className="rounded-[18px] border border-slate-200/70 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
			<p className="text-xs font-medium text-slate-500">{item.label}</p>
			<p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
				{formatCurrency(item.value)}
			</p>
			<p className="mt-2 text-xs leading-5 text-slate-500">{item.helper}</p>
		</article>
	);
}

function EntryRow({ item, onDelete, deletingId }) {
	return (
		<li className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-2">
						<p className="text-sm font-semibold text-slate-950">{item.title}</p>
						<span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">
							{item.entryTypeLabel}
						</span>
					</div>
					<p className="mt-1 text-xs text-slate-500">
						{item.place?.title || "Acomodação"} • {item.categoryLabel} • {item.competenceMonth}
					</p>
					{item.description ? (
						<p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
					) : null}
				</div>
				<div className="flex shrink-0 items-center gap-3">
					<div className="text-right">
						<p className="text-sm font-semibold text-slate-950">{formatCurrency(item.amount)}</p>
						<p className="text-xs text-slate-500">{item.status}</p>
					</div>
					<button
						type="button"
						onClick={() => onDelete(item.id)}
						disabled={deletingId === item.id}
						className="inline-flex h-10 items-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-wait disabled:opacity-60"
					>
						{deletingId === item.id ? "Excluindo..." : "Excluir"}
					</button>
				</div>
			</div>
		</li>
	);
}

export default function FinancialEntriesPanel({
	places = [],
	initialSummary = null,
	initialEntries = [],
	initialMonthKey = "",
}) {
	const [activeTab, setActiveTab] = useState(CATEGORY_TABS[0].key);
	const [selectedPlaceId, setSelectedPlaceId] = useState(places[0]?._id || "");
	const [selectedMonth, setSelectedMonth] = useState(initialMonthKey || toMonthKey());
	const [summary, setSummary] = useState(initialSummary);
	const [entries, setEntries] = useState(initialEntries);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [deletingId, setDeletingId] = useState("");
	const [error, setError] = useState("");
	const [form, setForm] = useState(() =>
		getDefaultFormState(CATEGORY_TABS[0].key, places[0]?._id || "", initialMonthKey || toMonthKey())
	);

	const activeTabConfig = useMemo(
		() => CATEGORY_TABS.find((item) => item.key === activeTab) || CATEGORY_TABS[0],
		[activeTab]
	);

	useEffect(() => {
		setForm((current) => ({
			...getDefaultFormState(activeTab, selectedPlaceId, selectedMonth),
			bookingId: current.bookingId || "",
			paymentId: current.paymentId || "",
			recurrenceId: current.recurrenceId || "",
			provider: current.provider || "",
			fiscalCategory: current.fiscalCategory || "",
			accountingCategory: current.accountingCategory || "",
			notes: current.notes || "",
		}));
	}, [activeTab, selectedPlaceId, selectedMonth]);

	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			setError("");
			try {
				const [summaryResponse, entriesResponse] = await Promise.all([
					getHostFinancialSummary({
						competenceMonth: selectedMonth,
						placeId: selectedPlaceId || undefined,
					}),
					getHostFinancialEntries({
						competenceMonth: selectedMonth,
						placeId: selectedPlaceId || undefined,
					}),
				]);
				setSummary(summaryResponse.data || summaryResponse);
				setEntries(entriesResponse.data || entriesResponse);
			} catch (loadError) {
				setError(loadError?.response?.data?.message || "Não foi possível carregar os lançamentos financeiros.");
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, [selectedMonth, selectedPlaceId]);

	const summaryCards = useMemo(() => getSummaryCards(summary || {}), [summary]);

	const handleChange = (field, value) => {
		setForm((current) => ({ ...current, [field]: value }));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setSaving(true);
		setError("");
		try {
			const payload = {
				...form,
				placeId: selectedPlaceId || form.placeId,
				competenceMonth: selectedMonth || form.competenceMonth,
				amount: Number(form.amount),
				taxDeductible: Boolean(form.taxDeductible),
				bookingId: form.bookingId || undefined,
				paymentId: form.paymentId || undefined,
				recurrenceId: form.recurrenceId || undefined,
				source: form.source || undefined,
				provider: form.provider || undefined,
				fiscalCategory: form.fiscalCategory || undefined,
				accountingCategory: form.accountingCategory || undefined,
				notes: form.notes || undefined,
			};
			await createHostFinancialEntry(payload);
			const [summaryResponse, entriesResponse] = await Promise.all([
				getHostFinancialSummary({
					competenceMonth: selectedMonth,
					placeId: selectedPlaceId || undefined,
				}),
				getHostFinancialEntries({
					competenceMonth: selectedMonth,
					placeId: selectedPlaceId || undefined,
				}),
			]);
			setSummary(summaryResponse.data || summaryResponse);
			setEntries(entriesResponse.data || entriesResponse);
			setForm(getDefaultFormState(activeTab, selectedPlaceId, selectedMonth));
		} catch (submitError) {
			setError(submitError?.response?.data?.message || "Não foi possível salvar o lançamento.");
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (entryId) => {
		setDeletingId(entryId);
		setError("");
		try {
			await deleteHostFinancialEntry(entryId);
			const [summaryResponse, entriesResponse] = await Promise.all([
				getHostFinancialSummary({
					competenceMonth: selectedMonth,
					placeId: selectedPlaceId || undefined,
				}),
				getHostFinancialEntries({
					competenceMonth: selectedMonth,
					placeId: selectedPlaceId || undefined,
				}),
			]);
			setSummary(summaryResponse.data || summaryResponse);
			setEntries(entriesResponse.data || entriesResponse);
		} catch (deleteError) {
			setError(deleteError?.response?.data?.message || "Não foi possível excluir o lançamento.");
		} finally {
			setDeletingId("");
		}
	};

	const categoryOptions = CATEGORY_OPTIONS[activeTab] || [];

	return (
		<section className="space-y-5 rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
			<div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
				<div className="min-w-0">
					<p className="text-xs font-semibold uppercase tracking-wide text-primary-700">
						Lançamentos financeiros
					</p>
					<h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
						Entrada manual por acomodação e competência
					</h3>
					<p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
						Cada lançamento é salvo pelo backend e consolidado no relatório mensal.
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<label className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600">
						<CalendarDays className="h-4 w-4" />
						<input
							type="month"
							value={selectedMonth}
							onChange={(event) => setSelectedMonth(event.target.value)}
							className="border-0 bg-transparent p-0 text-sm text-slate-800 outline-none focus:ring-0"
						/>
					</label>
					<select
						value={selectedPlaceId}
						onChange={(event) => setSelectedPlaceId(event.target.value)}
						className="min-h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-colors hover:border-slate-300 focus:border-primary-300"
					>
						<option value="">Todas as acomodações</option>
						{places.map((place) => (
							<option key={place._id || place.id} value={place._id || place.id}>
								{place.title || "Acomodação"}
							</option>
						))}
					</select>
					<button
						type="button"
						onClick={() => {
							setSelectedPlaceId(places[0]?._id || "");
							setSelectedMonth(initialMonthKey || toMonthKey());
						}}
						className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:border-primary-200 hover:bg-slate-50"
					>
						<RefreshCw className="h-4 w-4" />
						Recarregar
					</button>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
				{summaryCards.map((item) => (
					<SummaryCard key={item.key} item={item} />
				))}
			</div>

			{error ? (
				<div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
					{error}
				</div>
			) : null}

			<div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
				<div className="space-y-4 rounded-[20px] border border-slate-200/70 bg-slate-50/60 p-4">
					<div className="flex flex-wrap items-center gap-2">
						{CATEGORY_TABS.map((tab) => {
							const isActive = tab.key === activeTab;
							return (
								<button
									key={tab.key}
									type="button"
									onClick={() => setActiveTab(tab.key)}
									className={`inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold transition-colors ${
										isActive
											? "border-primary-300 bg-primary-50 text-primary-800"
											: "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
									}`}
								>
									{tab.label}
								</button>
							);
						})}
					</div>

					<div className="rounded-[18px] border border-slate-200/70 bg-white p-4">
						<div className="flex items-start justify-between gap-3">
							<div>
								<h4 className="text-base font-semibold text-slate-950">{activeTabConfig.label}</h4>
								<p className="mt-1 text-sm leading-6 text-slate-500">{activeTabConfig.description}</p>
							</div>
							<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
								{loading ? "Carregando..." : "Pronto"}
							</span>
						</div>

						<form className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
							<div className="space-y-1 md:col-span-2">
								<label className="text-sm font-medium text-slate-700">Título</label>
								<input
									type="text"
									value={form.title}
									onChange={(event) => handleChange("title", event.target.value)}
									className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors hover:border-slate-300 focus:border-primary-300"
									placeholder={activeTabConfig.defaultTitle}
								/>
							</div>

							<div className="space-y-1">
								<label className="text-sm font-medium text-slate-700">Categoria</label>
								<select
									value={form.category}
									onChange={(event) => handleChange("category", event.target.value)}
									className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors hover:border-slate-300 focus:border-primary-300"
								>
									{categoryOptions.map((option) => (
										<option key={option.key} value={option.key}>
											{option.label}
										</option>
									))}
								</select>
							</div>

							<div className="space-y-1">
								<label className="text-sm font-medium text-slate-700">Valor</label>
								<input
									type="number"
									min="0"
									step="0.01"
									value={form.amount}
									onChange={(event) => handleChange("amount", event.target.value)}
									className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors hover:border-slate-300 focus:border-primary-300"
									placeholder="0,00"
								/>
							</div>

							<div className="space-y-1">
								<label className="text-sm font-medium text-slate-700">Competência</label>
								<input
									type="month"
									value={form.competenceMonth}
									onChange={(event) => handleChange("competenceMonth", event.target.value)}
									className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors hover:border-slate-300 focus:border-primary-300"
								/>
							</div>

							<div className="space-y-1">
								<label className="text-sm font-medium text-slate-700">Data</label>
								<input
									type="date"
									value={form.entryDate}
									onChange={(event) => handleChange("entryDate", event.target.value)}
									className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors hover:border-slate-300 focus:border-primary-300"
								/>
							</div>

							<div className="space-y-1">
								<label className="text-sm font-medium text-slate-700">Status</label>
								<select
									value={form.status}
									onChange={(event) => handleChange("status", event.target.value)}
									className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors hover:border-slate-300 focus:border-primary-300"
								>
									{ENTRY_STATUS_OPTIONS.map((option) => (
										<option key={option.key} value={option.key}>
											{option.label}
										</option>
									))}
								</select>
							</div>

							<div className="space-y-1">
								<label className="text-sm font-medium text-slate-700">Acomodação</label>
								<select
									value={selectedPlaceId}
									onChange={(event) => setSelectedPlaceId(event.target.value)}
									className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors hover:border-slate-300 focus:border-primary-300"
								>
									<option value="">Selecione no filtro acima</option>
									{places.map((place) => (
										<option key={place._id || place.id} value={place._id || place.id}>
											{place.title || "Acomodação"}
										</option>
									))}
								</select>
							</div>

							<div className="space-y-1 md:col-span-2">
								<label className="text-sm font-medium text-slate-700">Descrição</label>
								<textarea
									value={form.description}
									onChange={(event) => handleChange("description", event.target.value)}
									rows={3}
									className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors hover:border-slate-300 focus:border-primary-300"
									placeholder="Observações curtas sobre o lançamento"
								/>
							</div>

							<details className="md:col-span-2 rounded-[18px] border border-slate-200 bg-slate-50 p-4">
								<summary className="cursor-pointer text-sm font-semibold text-slate-700">
									Campos avançados
								</summary>
								<div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
									<div className="space-y-1">
										<label className="text-sm font-medium text-slate-700">bookingId</label>
										<input
											type="text"
											value={form.bookingId}
											onChange={(event) => handleChange("bookingId", event.target.value)}
											className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors hover:border-slate-300 focus:border-primary-300"
											placeholder="Opcional"
										/>
									</div>
									<div className="space-y-1">
										<label className="text-sm font-medium text-slate-700">paymentId</label>
										<input
											type="text"
											value={form.paymentId}
											onChange={(event) => handleChange("paymentId", event.target.value)}
											className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors hover:border-slate-300 focus:border-primary-300"
											placeholder="Opcional"
										/>
									</div>
									<div className="space-y-1">
										<label className="text-sm font-medium text-slate-700">recurrenceId</label>
										<input
											type="text"
											value={form.recurrenceId}
											onChange={(event) => handleChange("recurrenceId", event.target.value)}
											className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors hover:border-slate-300 focus:border-primary-300"
											placeholder="Opcional"
										/>
									</div>
									<div className="space-y-1">
										<label className="text-sm font-medium text-slate-700">source</label>
										<input
											type="text"
											value={form.source}
											onChange={(event) => handleChange("source", event.target.value)}
											className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors hover:border-slate-300 focus:border-primary-300"
											placeholder="manual_form"
										/>
									</div>
									<div className="space-y-1">
										<label className="text-sm font-medium text-slate-700">fiscalCategory</label>
										<input
											type="text"
											value={form.fiscalCategory}
											onChange={(event) => handleChange("fiscalCategory", event.target.value)}
											className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors hover:border-slate-300 focus:border-primary-300"
											placeholder="Opcional"
										/>
									</div>
									<div className="space-y-1">
										<label className="text-sm font-medium text-slate-700">accountingCategory</label>
										<input
											type="text"
											value={form.accountingCategory}
											onChange={(event) => handleChange("accountingCategory", event.target.value)}
											className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors hover:border-slate-300 focus:border-primary-300"
											placeholder="Opcional"
										/>
									</div>
									<div className="flex items-center gap-3 md:col-span-2">
										<input
											id="taxDeductible"
											type="checkbox"
											checked={Boolean(form.taxDeductible)}
											onChange={(event) => handleChange("taxDeductible", event.target.checked)}
											className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
										/>
										<label htmlFor="taxDeductible" className="text-sm text-slate-700">
											Item dedutível para a receita fiscal
										</label>
									</div>
									<div className="space-y-1 md:col-span-2">
										<label className="text-sm font-medium text-slate-700">Notas</label>
										<textarea
											value={form.notes}
											onChange={(event) => handleChange("notes", event.target.value)}
											rows={2}
											className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-colors hover:border-slate-300 focus:border-primary-300"
											placeholder="Observações internas"
										/>
									</div>
								</div>
							</details>

							<div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-1">
								<p className="text-xs text-slate-500">
									O relatório mensal usa este lançamento sem recalcular valores no front-end.
								</p>
								<button
									type="submit"
									disabled={saving || !selectedPlaceId}
									className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60"
								>
									<Plus className="h-4 w-4" />
									{saving ? "Salvando..." : "Salvar lançamento"}
								</button>
							</div>
						</form>
					</div>
				</div>

				<div className="space-y-4 rounded-[20px] border border-slate-200/70 bg-white p-4">
					<div className="flex items-start justify-between gap-3">
						<div>
							<h4 className="text-base font-semibold text-slate-950">Lançamentos do mês</h4>
							<p className="mt-1 text-sm leading-6 text-slate-500">
								Últimos lançamentos salvos para a competência atual.
							</p>
						</div>
						<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
							{entries.length} itens
						</span>
					</div>

					{loading ? (
						<div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
							Carregando lançamentos...
						</div>
					) : entries.length > 0 ? (
						<ul className="space-y-3">
							{entries.map((item) => (
								<EntryRow key={item.id} item={item} onDelete={handleDelete} deletingId={deletingId} />
							))}
						</ul>
					) : (
						<div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
							<FileBarChart className="h-10 w-10 text-slate-300" />
							<h5 className="mt-3 text-sm font-semibold text-slate-900">Nenhum lançamento encontrado</h5>
							<p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
								Registre uma despesa, reembolso, taxa ou receita manual para que o resumo mensal seja consolidado.
							</p>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
