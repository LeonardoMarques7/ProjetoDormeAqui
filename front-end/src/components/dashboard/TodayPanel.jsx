import { CalendarCheck2, CalendarClock, ClipboardList } from "lucide-react";

const TodayPanel = ({ today }) => {
  const cards = [
    {
      key: "checkins",
      label: "Entradas hoje",
      value: today?.checkins ?? 0,
      icon: CalendarCheck2,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      key: "checkouts",
      label: "Saídas hoje",
      value: today?.checkouts ?? 0,
      icon: CalendarClock,
      tone: "bg-sky-50 text-sky-700",
    },
    {
      key: "pendingBookings",
      label: "Reservas pendentes",
      value: today?.pendingBookings ?? 0,
      icon: ClipboardList,
      tone: "bg-amber-50 text-amber-700",
    },
  ];

  return (
    <section className="host-dashboard-section">
      <h2 className="text-xl font-bold text-[#0F172B]">Resumo de hoje</h2>
      <div className="host-stat-grid mt-3">
        {cards.map((card, index) => (
          <article
            key={card.key}
            className={`host-stat-card transition hover:-translate-y-0.5 hover:shadow-md ${
              index === 0 ? "host-stat-card--highlight" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <p
                className={`text-xs font-medium uppercase tracking-wide ${
                  index === 0 ? "text-white/80" : "text-gray-500"
                }`}
              >
                {card.label}
              </p>
              <span
                className={`rounded-xl p-2 ${
                  index === 0 ? "bg-white/15 text-white" : card.tone
                }`}
              >
                <card.icon size={16} />
              </span>
            </div>
            <p className={`mt-2 text-4xl font-bold ${index === 0 ? "text-white" : "text-[#0F172B]"}`}>
              {card.value}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default TodayPanel;

