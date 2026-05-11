import { Link } from "react-router-dom";
import { MapPin, MoveUpRight, Star, Users, BedDouble } from "lucide-react";
import { PlaceImageFallback } from "@/components/ui/figma/ImageWithFallback";

const formatPrice = (value) =>
	new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
		maximumFractionDigits: 0,
	}).format(Number(value || 0));

const PlaceDiscoveryCard = ({
	place,
	isActive = false,
	onSelect,
	onHover,
}) => {
	const locationLabel =
		place.addressCity || place.city || place.addressNeighborhood || "Localização";

	return (
	<article
		role="button"
		tabIndex={0}
		onClick={() => onSelect?.(place)}
		onMouseEnter={() => onHover?.(place)}
		onKeyDown={(event) => {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				onSelect?.(place);
			}
		}}
		className={[
			"group relative overflow-hidden rounded-[1.75rem] border bg-white p-3 text-left shadow-[0_14px_40px_rgba(15,23,42,0.08)] transition-all duration-300",
			isActive
				? "border-primary-500 ring-2 ring-primary-100"
				: "border-slate-200 hover:-translate-y-1 hover:border-primary-200 hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)]",
		].join(" ")}
	>
		<div className="relative overflow-hidden rounded-[1.25rem]">
			<PlaceImageFallback
				src={place.primaryPhoto || place.photos?.[0]}
				alt={`Imagem de ${place.title}`}
				className="aspect-[1.15/1] w-full rounded-[1.25rem] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
			/>
			<div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/92 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm">
				<Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
				{place.averageRating ? Number(place.averageRating).toFixed(1) : "Novo"}
			</div>
		</div>

		<div className="mt-4 space-y-3 px-1">
			<div className="space-y-1.5">
				<p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
					<MapPin className="h-3.5 w-3.5 text-primary-500" />
					<span className="line-clamp-1">{locationLabel}</span>
				</p>
				<h3 className="line-clamp-1 text-lg font-semibold text-slate-900">
					{place.title}
				</h3>
			</div>

			<div className="flex items-center gap-3 text-xs text-slate-500">
				<span className="inline-flex items-center gap-1">
					<Users className="h-3.5 w-3.5" />
					{place.guests} hóspedes
				</span>
				<span className="inline-flex items-center gap-1">
					<BedDouble className="h-3.5 w-3.5" />
					{place.rooms} quartos
				</span>
			</div>

			<div className="flex items-end justify-between gap-4">
				<div>
					<p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-primary-500">
						Diária
					</p>
					<p className="text-lg font-bold text-slate-900">
						{formatPrice(place.price)}
					</p>
				</div>

				<Link
					to={`/places/${place._id}`}
					onClick={(event) => event.stopPropagation()}
					className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-primary-200 hover:text-primary-700"
				>
					Ver place
					<MoveUpRight className="h-4 w-4" />
				</Link>
			</div>
		</div>
	</article>
	);
};

export default PlaceDiscoveryCard;
