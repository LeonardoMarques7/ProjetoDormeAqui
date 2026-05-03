const formatMoney = (value = 0) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const FinanceCard = ({ finance }) => {
  const items = [
    { key: "monthlyEarnings", label: "Receita bruta do mês", value: finance?.monthlyEarnings ?? 0 },
    { key: "futureEarnings", label: "Receita futura", value: finance?.futureEarnings ?? 0 },
    { key: "totalFees", label: "Despesas operacionais", value: finance?.totalFees ?? 0 },
    { key: "averagePerNight", label: "Diária média", value: finance?.averagePerNight ?? 0 },
  ];

  return (
    <section className="host-dashboard-section">
      <h2 className="text-xl font-bold text-[#0F172B]">Financeiro (MVP)</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <article
            key={item.key}
            className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {item.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-[#0F172B]">{formatMoney(item.value)}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default FinanceCard;

