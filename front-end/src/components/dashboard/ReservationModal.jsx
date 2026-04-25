import {
	Clock,
	MessageSquare,
	CheckCircle2,
	Info,
	X,
	CalendarDays,
	MapPin,
	Users,
	Wallet,
} from "lucide-react";
import { UserImageFallback } from "@/components/ui/figma/ImageWithFallback";
import user__default from "@/assets/user__default.png";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";

const getStatusColor = (status) => {
	const normalizedStatus = String(status).toLowerCase().trim();

	if (normalizedStatus === "confirmed" || normalizedStatus === "approved") {
		return "bg-emerald-50 text-emerald-700 border-emerald-200";
	}
	if (normalizedStatus === "pending") {
		return "bg-amber-50 text-amber-700 border-amber-200";
	}
	if (
		normalizedStatus === "cancelled" ||
		normalizedStatus === "rejected" ||
		normalizedStatus === "failed"
	) {
		return "bg-red-50 text-red-700 border-red-200";
	}
	return "bg-gray-50 text-gray-700 border-gray-200";
};

const getStatusLabel = (status) => {
	const normalizedStatus = String(status).toLowerCase().trim();

	if (normalizedStatus === "confirmed" || normalizedStatus === "approved") {
		return "Reserva Confirmada";
	}
	if (normalizedStatus === "pending") {
		return "Reserva Pendente";
	}
	if (
		normalizedStatus === "cancelled" ||
		normalizedStatus === "rejected" ||
		normalizedStatus === "failed"
	) {
		return "Reserva Cancelada";
	}
	return "Status Desconhecido";
};

const getStatusIcon = (status) => {
	const normalizedStatus = String(status).toLowerCase().trim();

	if (normalizedStatus === "confirmed" || normalizedStatus === "approved") {
		return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
	}
	if (normalizedStatus === "pending") {
		return <Info className="w-5 h-5 text-amber-600" />;
	}
	if (
		normalizedStatus === "cancelled" ||
		normalizedStatus === "rejected" ||
		normalizedStatus === "failed"
	) {
		return <X className="w-5 h-5 text-red-600" />;
	}
	return <CheckCircle2 className="w-5 h-5 text-gray-600" />;
};

const calculateNights = (checkin, checkout) => {
	try {
		const start = new Date(checkin);
		const end = new Date(checkout);
		const nights = Math.ceil(
			(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
		);
		return nights > 0 ? nights : 1;
	} catch {
		return 1;
	}
};

export function ReservationModal({
	open,
	booking,
	place,
	onClose,
	onViewDetails,
	onSendMessage,
}) {
	if (!booking) return null;

	const guestId = booking?.user?._id || booking?.guestId || "Não identificado";
	const guestName = booking?.user?.name || booking?.guest || "Hóspede";
	const guestEmail = booking?.user?.email || booking?.guestEmail || "";
	const guestPhoto = booking?.user?.photo || booking?.guestPhoto || "";
	const guestCount = booking?.guests || booking?.guestCount || 1;

	const placeTitle = place?.title || booking?.placeTitle || "Acomodação";
	const placeCity =
		place?.city || booking?.placeCity || "Localização não especificada";
	const checkinTime = place?.checkinTime || booking?.placeCheckin || "14:00";
	const checkoutTime = place?.checkoutTime || booking?.placeCheckout || "11:00";

	const nights = calculateNights(booking?.checkin, booking?.checkout);
	const value = booking?.value || booking?.total || 0;
	const status = booking?.rawStatus || booking?.paymentStatus || "pending";
	const bookingId = booking?.id || 1;

	const formattedCheckin = new Date(booking?.checkin).toLocaleDateString(
		"pt-BR",
		{
			day: "2-digit",
			month: "long",
			year: "numeric",
		},
	);
	const formattedCheckout = new Date(booking?.checkout).toLocaleDateString(
		"pt-BR",
		{
			day: "2-digit",
			month: "long",
			year: "numeric",
		},
	);

	return (
		<Dialog
			className="!min-w-7xl sm:min-w-7xl!  !w-full"
			open={open}
			onOpenChange={(v) => !v && onClose?.()}
		>
			<DialogContent className=" w-full p-0 sm:max-w-5xl overflow-hidden gap-0">
				<div className="grid grid-cols-7 sm:max-w-7xl w-full">
					{/* Coluna Esquerda — Imagem + Info da propriedade + Período */}
					<div className="relative col-span-3 h-64 md:h-auto">
						<img
							src={place.photos[0]}
							alt={placeTitle}
							className="absolute inset-0 w-full h-full object-cover"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
						<div className="absolute bottom-0 left-0 right-0 p-6 text-white">
							<div className="text-xs font-medium uppercase tracking-wider opacity-80 mb-1">
								Acomodação
							</div>
							<h3 className="text-xl font-bold mb-1">{placeTitle}</h3>
							<div className="flex items-center gap-1.5 text-sm opacity-90">
								<MapPin className="w-4 h-4" />
								{placeCity}
							</div>
						</div>
					</div>

					{/* Coluna Direita — Status + Hóspede + Datas detalhadas + Pagamento + Ações */}
					<div className="p-6 md:p-8 flex-1 w-full col-span-4 flex flex-col gap-6">
						<DialogHeader className="text-left gap-1">
							<DialogDescription className="text-xs text-gray-400 uppercase tracking-wider">
								Reserva #{bookingId}
							</DialogDescription>
							<DialogTitle className="text-2xl font-bold text-gray-900">
								Confirmação
							</DialogTitle>
						</DialogHeader>

						{/* Status Badge */}
						<div
							className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${getStatusColor(
								status,
							)}`}
						>
							{getStatusIcon(status)}
							<span className="font-semibold text-sm">
								{getStatusLabel(status)}
							</span>
						</div>

						{/* Hóspede */}
						<div className="space-y-3">
							<div className="flex items-center gap-1">
								<span className="text-[11px] text-gray-500 uppercase tracking-wide">
									Hóspede
								</span>
								<span className="text-xs text-gray-500 flex items-center gap-1">
									({guestCount} pessoa{{ guestCount } > 1 ? "s" : ""})
								</span>
							</div>
							<div className="flex items-center gap-3">
								<div className="flex items-center">
									<UserImageFallback
										src={guestPhoto}
										className="w-10 h-10 z-11 object-cover rounded-full ring-2 ring-white"
										alt={`${guestName} - Foto de perfil`}
									/>
									<div className="flex items-center -ml-2 ">
										{guestCount > 1 &&
											Array.from({ length: guestCount - 1 }).map((_, index) => (
												<UserImageFallback
													key={index}
													src={user__default}
													className="w-10 h-10 object-cover z-10 rounded-full ring-2 ring-white -ml-2"
													alt={`Hóspede ${index + 2}`}
												/>
											))}
									</div>
								</div>

								<div className="flex-1 min-w-0">
									<Link
										to={`/account/profile/${guestId}`}
										className="group block"
										onClick={() => onClose?.()}
									>
										<div className="font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
											{guestName}
										</div>
										{guestEmail && (
											<div className="text-sm text-gray-500 truncate">
												{guestEmail}
											</div>
										)}
										<div className="text-xs text-primary-600 mt-0.5 flex items-center transition-all hover:underline">
											<span>Ver perfil do hóspede</span>
										</div>
									</Link>
								</div>
							</div>
						</div>

						{/* Período */}
						<div className="space-y-3">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-1">
									<div className="text-[11px] text-gray-500 uppercase tracking-wide">
										Check-in
									</div>
									<div className="font-semibold text-gray-900 leading-tight">
										{formattedCheckin}
									</div>
									<div className="flex items-center gap-1 text-xs text-gray-500">
										<Clock className="w-3.5 h-3.5" />
										<span>{checkinTime}</span>
									</div>
								</div>
								<div className="space-y-1">
									<div className="text-[11px] text-gray-500 uppercase tracking-wide">
										Check-out
									</div>
									<div className="font-semibold text-gray-900  leading-tight">
										{formattedCheckout}
									</div>
									<div className="flex items-center gap-1 text-xs text-gray-500">
										<Clock className="w-3.5 h-3.5" />
										<span>{checkoutTime}</span>
									</div>
								</div>
							</div>
							{/* <div className="py-2.5 px-4 bg-gray-50 rounded-lg flex items-center justify-between">
								<span className="text-sm text-gray-600 flex items-center gap-2">
									<CalendarDays className="w-4 h-4 text-gray-400" />
									Duração
								</span>
								<span className="font-semibold text-gray-900 text-sm">
									{nights} {nights === 1 ? "noite" : "noites"}
								</span>
							</div> */}
						</div>

						{/* Pagamento */}
						<div className="space-y-2 pt-1">
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-600 flex items-center gap-2">
									<Wallet className="w-4 h-4 text-gray-400" />
									Valor total
								</span>
								<span className="text-xl font-bold text-gray-900">
									R${" "}
									{value.toLocaleString("pt-BR", {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</span>
							</div>
							<div className="flex items-center justify-between text-sm">
								<span className="text-gray-500">Valor por noite</span>
								<span className="text-gray-900">
									R${" "}
									{Math.round(value / nights).toLocaleString("pt-BR", {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</span>
							</div>
						</div>

						{/* Ações */}
						{/* <DialogFooter className="flex-col sm:flex-row gap-3 pt-2">
							<button
								onClick={onSendMessage}
								className="flex-1 py-3 px-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 active:bg-gray-700 transition-colors flex items-center justify-center gap-2"
							>
								<MessageSquare className="w-5 h-5" />
								Enviar Mensagem
							</button>
							<button
								onClick={onViewDetails}
								className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center gap-2"
							>
								<Info className="w-5 h-5" />
								Ver Mais Detalhes
							</button>
						</DialogFooter> */}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
