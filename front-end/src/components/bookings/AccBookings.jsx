import axios from "axios";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import BookingAll from "@/components/bookings/BookingAll";
import { Skeleton } from "@/components/ui/skeleton";
import "@/components/bookings/Booking.css";
import { useParams } from "react-router-dom";
import { useUserContext } from "@/components/contexts/UserContext";
import photoDefault from "@/assets/photoDefault.jpg";
import { ArrowRight, Trash2, MessageSquare, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

// Badge Status Component
function BadgeStatus({ status = "confirmada" }) {
	const getBadgeConfig = (status) => {
		const configs = {
			avaliacao: {
				bg: "bg-yellow-500",
				text: "Avaliação",
			},
			cancelada: {
				bg: "bg-red-500",
				text: "Cancelada",
			},
			andamento: {
				bg: "bg-blue-500",
				text: "Em andamento",
			},
			confirmada: {
				bg: "bg-green-500",
				text: "Confirmada",
			},
		};
		return configs[status] || configs.confirmada;
	};

	const config = getBadgeConfig(status);

	return (
		<div
			className={`${config.bg} rounded-full px-6 py-3 text-white font-medium flex items-center gap-2 w-fit absolute top-4 left-4 z-10`}
		>
			<span className="text-lg">•</span>
			<span className="text-base">{config.text}</span>
		</div>
	);
}

// Booking Card Component
function BookingCard({ booking, index }) {
	const [imageErrors, setImageErrors] = useState({});

	const handleImageError = (photoIndex) => {
		setImageErrors((prev) => ({ ...prev, [photoIndex]: true }));
	};

	const getImageSrc = (photoIndex) => {
		if (imageErrors[photoIndex]) {
			return photoDefault;
		}
		return booking.place?.photos?.[photoIndex] || photoDefault;
	};

	const photos = [getImageSrc(0), getImageSrc(1), getImageSrc(2)];

	const getStatusColor = (status) => {
		const colors = {
			confirmada: "text-green-600",
			cancelada: "text-red-600",
			andamento: "text-blue-600",
			avaliacao: "text-yellow-600",
		};
		return colors[status] || colors.confirmada;
	};

	const formatDate = (date) => {
		if (!date) return "—";
		const d = new Date(date);
		return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: index * 0.1 }}
			className="relative flex gap-[10px] rounded-[25px] overflow-hidden bg-white shadow-lg max-md:flex-col mb-8 w-full"
		>
			{/* Seção de Imagens */}
			<div className="grid grid-cols-[1fr_200px] grid-rows-2 gap-[10px] h-[410px] w-[707px] max-md:w-full max-md:h-[300px] flex-shrink-0">
				{/* Imagem Principal Grande - ocupa toda a coluna esquerda */}
				<div className="relative row-span-2 rounded-[25px] overflow-hidden">
					<img
						src={photos[0]}
						onError={() => handleImageError(0)}
						alt={booking.place?.title}
						className="w-full h-full object-cover"
					/>
					{/* Badge de Status */}
					<div className="absolute top-2 left-2 z-10">
						<BadgeStatus status={booking.status || "confirmada"} />
					</div>
				</div>

				{/* Imagem Menor Superior */}
				<div className="rounded-[25px] overflow-hidden max-md:hidden">
					<img
						src={photos[1]}
						onError={() => handleImageError(1)}
						alt={`${booking.place?.title} - 2`}
						className="w-full h-full object-cover"
					/>
				</div>

				{/* Imagem Menor Inferior */}
				<div className="rounded-[25px] overflow-hidden max-md:hidden">
					<img
						src={photos[2]}
						onError={() => handleImageError(2)}
						alt={`${booking.place?.title} - 3`}
						className="w-full h-full object-cover"
					/>
				</div>
			</div>

			{/* Seção de Informações */}
			<div className="relative flex flex-col justify-between p-6 flex-1 max-md:p-4">
				{/* Título e Localização */}
				<div className="flex flex-col gap-3 mb-4">
					<div className="flex flex-col gap-2">
						<Link
							to={`/places/${booking.place?._id}`}
							className="font-bold text-3xl max-md:text-2xl text-[#0F172B] hover:underline cursor-pointer break-words"
						>
							{booking.place?.title}
						</Link>
						<div className="flex items-center gap-1 text-xs text-gray-600">
							<MapPin size={14} />
							<span>{booking.place?.city}</span>
						</div>
					</div>
				</div>

				{/* Datas e Detalhes */}
				<div className="flex flex-col gap-3 mb-4 max-md:gap-2">
					<div className="grid grid-cols-3 gap-4 max-md:gap-2">
						<div className="flex flex-col gap-1">
							<small className="text-xs uppercase font-semibold text-gray-600">
								Check-In
							</small>
							<span className="text-sm max-md:text-xs font-medium text-gray-900">
								{formatDate(booking.checkin)} às {booking.place?.checkin}
							</span>
						</div>
						<div className="flex flex-col gap-1">
							<small className="text-xs uppercase font-semibold text-gray-600">
								Check-out
							</small>
							<span className="text-sm max-md:text-xs font-medium text-gray-900">
								{formatDate(booking.checkout)} às {booking.place?.checkout}
							</span>
						</div>
						<div className="flex flex-col gap-1">
							<small className="text-xs uppercase font-semibold text-gray-600">
								Hóspedes
							</small>
							<span className="text-sm max-md:text-xs font-medium text-gray-900">
								{booking.guests || "—"}
							</span>
						</div>
					</div>
				</div>

				{/* Status */}
				<div className="flex flex-col gap-1 mb-4 pb-4 border-t border-b border-gray-200 py-3">
					<span className="text-xs uppercase font-semibold text-gray-600">
						Situação
					</span>
					<span
						className={`text-sm font-semibold ${getStatusColor(booking.status || "confirmada")}`}
					>
						{booking.status === "confirmada"
							? "Confirmada"
							: booking.status === "cancelada"
								? "Cancelada"
								: booking.status === "andamento"
									? "Em andamento"
									: "Avaliação"}
					</span>
				</div>

				{booking._id}
				{/* Botões de Ação */}
				<div className="flex flex-col gap-2 max-md:flex-col">
					<div className="flex items-center gap-2">
						<button
							className="p-2.5 rounded-xl text-blue-600 hover:bg-blue-100 transition-colors"
							title="Mensagem"
						>
							<MessageSquare size={18} />
						</button>
						{booking.status === "cancelada" && (
							<button
								className="p-2.5 rounded-xl text-red-600 hover:bg-red-100 transition-colors"
								title="Cancelada"
							>
								<Trash2 size={18} />
							</button>
						)}
					</div>

					{booking.status === "avaliacao" ? (
						<button className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm">
							Publicar avaliação
							<ArrowRight size={16} />
						</button>
					) : booking.status === "confirmada" ? (
						<button className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium text-sm">
							Cancelar reserva
							<Trash2 size={16} />
						</button>
					) : (
						<div className="text-gray-600 text-sm font-medium text-center py-2">
							Reserva {booking.status}
						</div>
					)}
				</div>
			</div>
		</motion.div>
	);
}

// Loading Skeleton
function BookingCardSkeleton() {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="flex flex-col gap-6 mb-8 w-full"
		>
			<div className="flex gap-8 max-md:flex-col max-md:gap-4">
				<Skeleton className="flex-1 h-[410px] rounded-[25px]" />
				<div className="flex flex-col gap-6 flex-1">
					<div className="grid grid-cols-2 gap-2.5 h-[200px]">
						<Skeleton className="rounded-[25px]" />
						<Skeleton className="rounded-[25px]" />
					</div>
					<div className="flex flex-col gap-4">
						<Skeleton className="h-8 w-3/4" />
						<Skeleton className="h-4 w-1/2" />
						<Skeleton className="h-24 w-full" />
						<Skeleton className="h-6 w-1/3" />
					</div>
				</div>
			</div>
			<Skeleton className="h-16 w-full rounded-lg" />
		</motion.div>
	);
}

const AccBookings = ({ bookingId }) => {
	const [bookings, setBookings] = useState([]);
	const [readyBookings, setReadyBookings] = useState(false);
	const { user, ready: userReady } = useUserContext();

	const fetchBookings = async () => {
		const { data } = await axios.get("/bookings/owner");
		setBookings(data);
		setReadyBookings(true);
	};

	useEffect(() => {
		if (!user) {
			setBookings([]);
			setReadyBookings(false);
			return;
		}
		fetchBookings();
	}, [user?._id]);

	return (
		<section className="min-h-[70vh] w-full bg-[#f7f7f4]">
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
				<div>
					<h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
						Minhas reservas
					</h1>
				</div>
			</div>

			{/* Content */}
			<div className="max-w-7xl mx-auto px-6 pb-16 max-md:px-4">
				{!readyBookings ? (
					<div className="space-y-8">
						<BookingCardSkeleton />
						<BookingCardSkeleton />
					</div>
				) : bookings.length === 0 ? (
					<motion.div
						className="text-center py-16"
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ type: "spring", stiffness: 200, damping: 20 }}
					>
						<div className="mb-4 text-6xl">📅</div>
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							Nenhuma reserva encontrada
						</h2>
						<p className="text-gray-600 mb-6">
							{user
								? "Você não possue reservas. Explore nossos lugares e faça uma reserva!"
								: "Você precisa estar logado para ver suas reservas."}
						</p>
						{user && (
							<Link
								to="/places"
								className="inline-block px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
							>
								Explorar lugares
							</Link>
						)}
					</motion.div>
				) : (
					<div className="space-y-0">
						{bookings.map((booking, index) => (
							<BookingCard key={booking._id} booking={booking} index={index} />
						))}
					</div>
				)}
			</div>
		</section>
	);
};

export default AccBookings;
