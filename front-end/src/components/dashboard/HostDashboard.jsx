import { useEffect, useMemo, useState } from "react";
import { BellRing, LayoutDashboard, Search, Sparkles, UserCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CalendarGridMonth from "./CalendarGridMonth";
import TodayPanel from "./TodayPanel";
import FinanceCard from "./FinanceCard";
import MetricsCard from "./MetricsCard";
import PlacesManager from "./PlacesManager";
import { getHostDashboard } from "@/services/dashboardService";
import "./hostDashboardTheme.css";

const HostDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const data = await getHostDashboard();
      setDashboard(data);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Não foi possível carregar a dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const alerts = useMemo(() => dashboard?.alerts || [], [dashboard?.alerts]);

  const handlePlaceStatusChanged = (updatedPlace) => {
    setDashboard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        places: prev.places.map((place) =>
          String(place._id) === String(updatedPlace._id) ? updatedPlace : place
        ),
      };
    });
  };

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-2 py-4">
        <div className="h-28 animate-pulse rounded-[25px] bg-gray-100" />
        <div className="h-72 animate-pulse rounded-[25px] bg-gray-100" />
        <div className="h-48 animate-pulse rounded-[25px] bg-gray-100" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl px-2 py-4">
        <Alert variant="destructive">
          <AlertTitle>Erro ao carregar dashboard</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-2 py-4">
      <div className="host-dashboard-shell flex flex-col gap-3">
        <div className="host-dashboard-topbar">
          <label className="relative flex w-full max-w-[460px] items-center">
            <Search size={14} className="pointer-events-none absolute left-4 text-gray-400" />
            <input
              className="host-dashboard-search pl-9"
              placeholder="Buscar reservas, tarefas ou anúncios"
              readOnly
            />
          </label>
          <div className="flex items-center gap-2">
            <span className="host-dashboard-chip hidden sm:inline-flex">Notificações</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700">
              <UserCircle2 size={16} />
              Host
            </span>
          </div>
        </div>

        <header className="host-dashboard-header">
          <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <LayoutDashboard size={14} />
              Painel do anfitrião
            </p>
            <h1 className="text-4xl font-bold text-[#0F172B]">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Acompanhe reservas, desempenho, tarefas e status dos seus anúncios.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="host-dashboard-chip host-dashboard-chip--primary inline-flex items-center gap-2">
              <Sparkles size={14} />
              Nova ação
            </span>
            <span className="host-dashboard-chip">Exportar dados</span>
          </div>
          </div>
        </header>

        {alerts.length > 0 && (
          <section className="space-y-2">
            {alerts.map((alert) => (
              <Alert key={alert.id} className="rounded-2xl border border-amber-200 bg-amber-50/60">
                <AlertTitle className="flex items-center gap-2 text-amber-900">
                  <BellRing size={16} />
                  {alert.title}
                </AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            ))}
          </section>
        )}

        <TodayPanel today={dashboard?.today} />
        <CalendarGridMonth calendar={dashboard?.calendar} />

        <div className="grid gap-3 xl:grid-cols-2">
          <FinanceCard finance={dashboard?.finance} />
          <MetricsCard metrics={dashboard?.metrics} />
        </div>

        <div className="grid gap-3">
          <PlacesManager
            places={dashboard?.places || []}
            onPlaceStatusChanged={handlePlaceStatusChanged}
          />
        </div>
      </div>
    </div>
  );
};

export default HostDashboard;

