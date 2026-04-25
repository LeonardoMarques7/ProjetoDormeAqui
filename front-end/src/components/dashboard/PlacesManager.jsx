import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updatePlaceStatus } from "@/services/dashboardService";

const PlacesManager = ({ places = [], onPlaceStatusChanged }) => {
  const [loadingId, setLoadingId] = useState("");

  const handleToggle = async (place) => {
    setLoadingId(place._id);
    try {
      const updated = await updatePlaceStatus(place._id, !Boolean(place.isActive));
      onPlaceStatusChanged?.(updated);
    } catch (error) {
      console.error("Erro ao atualizar status do anúncio:", error);
    } finally {
      setLoadingId("");
    }
  };

  return (
    <section className="host-dashboard-section">
      <h2 className="text-xl font-bold text-[#0F172B]">Gestão de anúncios</h2>
      <div className="mt-4 space-y-3">
        {places.length === 0 && (
          <p className="rounded-2xl border border-dashed border-gray-300 p-4 text-sm text-gray-500">
            Nenhum anúncio cadastrado.
          </p>
        )}

        {places.map((place) => {
          const isActive = place.isActive !== false;
          const isLoading = loadingId === place._id;

          return (
            <article
              key={place._id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm"
            >
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-gray-900">{place.title}</h3>
                <p className="text-xs text-gray-500">{place.city || "Cidade não informada"}</p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {isActive ? "ativo" : "desativado"}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggle(place)}
                  disabled={isLoading}
                >
                  {isLoading ? "Atualizando..." : isActive ? "Desativar" : "Ativar"}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default PlacesManager;

