import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, MapPinned, Navigation } from "lucide-react";
import { getGoogleMapsApiKey, loadGoogleMapsScript } from "@/lib/googleMaps";

const DEFAULT_CENTER = { lat: -14.235, lng: -51.9253 };

const mapStyles = [
	{
		featureType: "poi",
		stylers: [{ visibility: "off" }],
	},
	{
		featureType: "transit",
		stylers: [{ visibility: "off" }],
	},
	{
		featureType: "administrative",
		elementType: "geometry.stroke",
		stylers: [{ color: "#d7d2c8" }],
	},
	{
		featureType: "road",
		elementType: "geometry",
		stylers: [{ color: "#ffffff" }],
	},
	{
		featureType: "landscape",
		elementType: "geometry",
		stylers: [{ color: "#f5f1ea" }],
	},
	{
		featureType: "water",
		elementType: "geometry",
		stylers: [{ color: "#dbe6f6" }],
	},
];

const hasCoordinates = (latitude, longitude) =>
	latitude !== "" &&
	longitude !== "" &&
	latitude !== null &&
	longitude !== null &&
	latitude !== undefined &&
	longitude !== undefined &&
	Number.isFinite(Number(latitude)) &&
	Number.isFinite(Number(longitude));

const AccommodationLocationMap = ({
	latitude,
	longitude,
	addressLabel,
	className = "",
}) => {
	const mapRef = useRef(null);
	const mapInstanceRef = useRef(null);
	const markerRef = useRef(null);
	const [mapAvailable, setMapAvailable] = useState(Boolean(getGoogleMapsApiKey()));
	const [mapReady, setMapReady] = useState(false);

	const coordinates = useMemo(() => {
		if (!hasCoordinates(latitude, longitude)) return null;
		return {
			lat: Number(latitude),
			lng: Number(longitude),
		};
	}, [latitude, longitude]);

	useEffect(() => {
		let isMounted = true;

		loadGoogleMapsScript({ libraries: ["places"] }).then((loaded) => {
			if (!isMounted) return;
			setMapAvailable(loaded);

			if (!loaded || !mapRef.current || mapInstanceRef.current) {
				return;
			}

			mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
				center: coordinates || DEFAULT_CENTER,
				zoom: coordinates ? 15 : 4,
				disableDefaultUI: true,
				zoomControl: true,
				fullscreenControl: true,
				styles: mapStyles,
				backgroundColor: "#f6f1ea",
			});
			setMapReady(true);
		});

		return () => {
			isMounted = false;
		};
	}, [coordinates]);

	useEffect(() => {
		if (!mapReady || !mapInstanceRef.current) return;

		if (!coordinates) {
			if (markerRef.current) {
				markerRef.current.setMap(null);
				markerRef.current = null;
			}
			mapInstanceRef.current.setCenter(DEFAULT_CENTER);
			mapInstanceRef.current.setZoom(4);
			return;
		}

		mapInstanceRef.current.setCenter(coordinates);
		mapInstanceRef.current.setZoom(15);

		if (!markerRef.current) {
			markerRef.current = new window.google.maps.Marker({
				position: coordinates,
				map: mapInstanceRef.current,
				title: addressLabel || "Acomodação",
			});
			return;
		}

		markerRef.current.setPosition(coordinates);
		markerRef.current.setTitle(addressLabel || "Acomodação");
	}, [addressLabel, coordinates, mapReady]);

	if (!mapAvailable) {
		return (
			<div
				className={[
					"flex min-h-[320px] flex-col items-center justify-center rounded-[22px] border border-[#ebe4d8] bg-[linear-gradient(180deg,#fcfaf7_0%,#f5f0e8_100%)] px-6 text-center",
					className,
				].join(" ")}
			>
				<AlertCircle className="mb-4 h-8 w-8 text-amber-500" />
				<p className="text-sm font-medium text-slate-700">Mapa indisponível</p>
				<p className="mt-2 max-w-xs text-sm text-slate-500">
					Configure a chave <code>VITE_GOOGLE_MAPS_API_KEY</code> para usar o mapa
					interativo nesta etapa.
				</p>
			</div>
		);
	}

	return (
		<div
			className={[
				"overflow-hidden rounded-[22px] border border-[#ebe4d8] bg-white shadow-[0_18px_40px_rgba(31,24,18,0.06)]",
				className,
			].join(" ")}
		>
			<div className="relative h-[320px] w-full bg-[#f6f1ea]">
				<div ref={mapRef} className="h-full w-full" />
				{!coordinates && (
					<div className="pointer-events-none absolute inset-x-5 bottom-5 rounded-[18px] border border-white/60 bg-white/90 px-4 py-3 shadow-[0_10px_25px_rgba(31,24,18,0.08)] backdrop-blur">
						<div className="flex items-start gap-3">
							<MapPinned className="mt-0.5 h-4 w-4 text-primary-700" />
							<div>
								<p className="text-sm font-medium text-slate-800">
									Adicione latitude e longitude para posicionar o marcador
								</p>
								<p className="mt-1 text-xs leading-relaxed text-slate-500">
									O mapa continua navegável e será centralizado automaticamente
									quando as coordenadas forem informadas.
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
			<div className="flex items-center gap-3 border-t border-[#efe8dc] bg-[#fcfaf7] px-4 py-3">
				<div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1ece4] text-slate-700">
					<Navigation className="h-4 w-4" />
				</div>
				<div className="min-w-0">
					<p className="truncate text-sm font-medium text-slate-800">
						{addressLabel || "Localização da acomodação"}
					</p>
					<p className="text-xs text-slate-500">
						Arraste, aproxime e confira a região antes de salvar.
					</p>
				</div>
			</div>
		</div>
	);
};

export default AccommodationLocationMap;
