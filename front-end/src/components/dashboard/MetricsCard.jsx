const MetricsCard = ({ metrics }) => {
  const items = [
    {
      key: "occupancyRate",
      label: "Taxa de ocupação",
      value: `${Number(metrics?.occupancyRate || 0).toFixed(1)}%`,
    },
    {
      key: "averageNightPrice",
      label: "Preço médio por diária",
      value: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(Number(metrics?.averageNightPrice || 0)),
    },
    { key: "totalBookings", label: "Total de reservas", value: metrics?.totalBookings ?? 0 },
    {
      key: "averageRating",
      label: "Avaliação média",
      value:
        metrics?.averageRating == null
          ? "—"
          : `${Number(metrics.averageRating).toFixed(1)} / 5`,
    },
  ];

  return (
    <section className="host-dashboard-section">
      <h2 className="text-xl font-bold text-[#0F172B]">Métricas de desempenho</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <article
            key={item.key}
            className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {item.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-[#0F172B]">{item.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default MetricsCard;

