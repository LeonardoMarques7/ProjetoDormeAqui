import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { UserImageFallback } from "@/components/ui/figma/ImageWithFallback";
import { ReservationModal } from "@/components/dashboard/ReservationModal.jsx";

const COLORS = [
	"#3b82f6",
	"#10b981",
	"#f59e0b",
	"#ef4444",
	"#8b5cf6",
	"#ec4899",
	"#06b6d4",
	"#f97316",
	"#14b8a6",
	"#a855f7",
	"#f43f5e",
	"#84cc16",
	"#0ea5e9",
	"#fb923c",
	"#e879f9",
	"#22c55e",
	"#6366f1",
	"#eab308",
	"#64748b",
	"#d946ef",
	"#0891b2",
	"#b45309",
	"#dc2626",
	"#15803d",
];

const shortGuestName = (name = "") => {
	const parts = String(name).trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "Hóspede";
	if (parts.length === 1) return parts[0];
	return `${parts[0]} ${parts[parts.length - 1][0]}.`;
};

const guestInitials = (name = "") => {
	const parts = String(name).trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "H";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const STATUS_STYLES = {
	confirmed: { label: "Confirmada", className: "status-confirmed" },
	pending: { label: "Pendente", className: "status-pending" },
	canceled: { label: "Cancelada", className: "status-canceled" },
	rejected: { label: "Cancelada", className: "status-canceled" },
	in_progress: { label: "Em andamento", className: "status-in-progress" },
	evaluation: { label: "Avaliação", className: "status-evaluation" },
	review: { label: "Revisão", className: "status-review" },
	completed: { label: "Finalizada", className: "status-completed" },
};

const getStatusLabel = (status) =>
	STATUS_STYLES[status]?.label || STATUS_STYLES.pending.label;

const CalendarGridMonth = ({ calendar, compact = false }) => {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [selectedBooking, setSelectedBooking] = useState(null);
	const [showModal, setShowModal] = useState(false);

	const events = calendar?.events || [];

	// Atribuir cores às reservas (por bookingId, não por eventId)
	const bookingColors = useMemo(() => {
		const colors = new Map();
		const uniqueBookings = new Set();
		const bookingOrder = [];
		let colorIndex = 0;

		events.forEach((event) => {
			if (!uniqueBookings.has(event.bookingId)) {
				uniqueBookings.add(event.bookingId);
				bookingOrder.push(event.bookingId);
				colors.set(event.bookingId, COLORS[colorIndex % COLORS.length]);
				colorIndex++;
			}
		});
		return colors;
	}, [events]);

	// Mapa de reservas por data com informações de posição
	const bookingsByDate = useMemo(() => {
		const map = new Map();
		const processedBookings = new Set(); // Rastreia bookings já processados

		events.forEach((event) => {
			const bookingId = event.bookingId;
			const checkin = new Date(event.checkin);
			const checkout = new Date(event.checkout);

			// Evitar adicionar o mesmo booking múltiplas vezes
			const bookingKey = `${bookingId}-${checkin.toISOString().split("T")[0]}`;
			if (processedBookings.has(bookingKey)) {
				return;
			}
			processedBookings.add(bookingKey);

			// Adicionar o event em cada dia do período (incluindo o dia do checkout)
			for (
				let d = new Date(checkin);
				d <= checkout;
				d.setDate(d.getDate() + 1)
			) {
				const dateKey = d.toISOString().split("T")[0];
				if (!map.has(dateKey)) {
					map.set(dateKey, []);
				}

				// Verificar se é check-in, check-out ou stay
				const isCheckin = dateKey === checkin.toISOString().split("T")[0];
				const isCheckout = dateKey === checkout.toISOString().split("T")[0];

				map.get(dateKey).push({
					...event,
					eventType: isCheckin ? "checkin" : isCheckout ? "checkout" : "stay",
				});
			}
		});
		return map;
	}, [events]);

	// Obter todos os dias do mês
	const daysInMonth = useMemo(() => {
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const daysCount = lastDay.getDate();
		const startingDayOfWeek = firstDay.getDay();

		const days = [];

		// Dias vazios do mês anterior
		for (let i = 0; i < startingDayOfWeek; i++) {
			days.push(null);
		}

		// Dias do mês atual
		for (let i = 1; i <= daysCount; i++) {
			days.push(new Date(year, month, i));
		}

		return days;
	}, [currentDate]);

	const goToPreviousMonth = () => {
		setCurrentDate(
			new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
		);
	};

	const goToNextMonth = () => {
		setCurrentDate(
			new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
		);
	};

	const handleInfoClick = (event, e) => {
		e.stopPropagation();
		setSelectedBooking(event);
		setShowModal(true);
	};

	const monthName = currentDate.toLocaleString("pt-BR", {
		month: "long",
		year: "numeric",
	});

	return (
		<section className="w-full ">
			{!compact && (
				<div className="mb-6">
					<h2 className="text-2xl font-bold text-slate-900 mb-2">
						Agenda de Reservas
					</h2>
					<p className="text-sm text-gray-500">
						Visualize todas as suas reservas do mês
					</p>
				</div>
			)}

			<div
				className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${compact ? "p-3" : "p-6"}`}
			>
				{/* Cabeçalho com controles de navegação */}
				<div
					className={`flex items-center justify-between gap-4 ${compact ? "mb-3" : "mb-6"}`}
				>
					<h3
						className={`font-semibold text-slate-900 capitalize flex-1 ${compact ? "text-sm" : "text-xl"}`}
					>
						{monthName}
					</h3>
					<button
						onClick={goToPreviousMonth}
						className={`rounded-lg flex items-center justify-center cursor-pointer transition-all hover:bg-gray-200 hover:text-gray-700 text-gray-500 ${compact ? "h-7 w-7" : "w-9 h-9"}`}
						title="Mês anterior"
					>
						<ChevronLeft size={compact ? 16 : 20} />
					</button>
					<button
						onClick={goToNextMonth}
						className={`rounded-lg flex items-center justify-center cursor-pointer transition-all hover:bg-gray-200 hover:text-gray-700 text-gray-500 ${compact ? "h-7 w-7" : "w-9 h-9"}`}
						title="Próximo mês"
					>
						<ChevronRight size={compact ? 16 : 20} />
					</button>
				</div>

				{/* Grid do calendário */}
				<div className={`flex flex-col ${compact ? "gap-1.5" : "gap-3"}`}>
					{/* Cabeçalho com dias da semana */}
					<div
						className={`grid grid-cols-7 ${compact ? "mb-1 gap-1" : "gap-2 mb-3"}`}
					>
						{["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map((day) => (
							<div
								key={day}
								className={`font-semibold text-gray-500 text-center uppercase tracking-wide ${compact ? "p-1 text-[10px]" : "text-xs p-2"}`}
							>
								{day}
							</div>
						))}
					</div>

					{/* Dias do mês */}
					<div className={`grid grid-cols-7 ${compact ? "gap-1" : "gap-2"}`}>
						{daysInMonth.map((day, index) => {
							const dateKey = day ? day.toISOString().split("T")[0] : null;
							const bookingsForDay = dateKey
								? bookingsByDate.get(dateKey) || []
								: [];

							return (
								<div
									key={index}
									className={`aspect-square border rounded-[10px] transition-all relative flex flex-col ${compact ? "min-h-[96px] p-2" : "min-h-[100px] p-2"} ${
										!day
											? "bg-gray-50 border-gray-100"
											: "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
									}`}
									style={
										bookingsForDay.length > 0
											? {
													background: bookingColors.get(
														bookingsForDay[0].bookingId,
													),
													borderColor: bookingColors.get(
														bookingsForDay[0].bookingId,
													),
												}
											: {}
									}
								>
									{day && (
										<>
											<div
												className={`font-semibold ${compact ? "mb-1 text-xs" : "mb-1.5 text-sm"} ${bookingsForDay.length > 0 ? "text-white font-bold" : "text-slate-900"}`}
											>
												{day.getDate()}
											</div>

											{bookingsForDay.length > 0 && compact && (
												<div className="mt-auto flex flex-col gap-1">
													{bookingsForDay.slice(0, 2).map((booking) => (
														<div
															key={booking.id}
															className="flex items-center justify-between gap-1 text-white"
														>
															<div className="flex min-w-0 items-center gap-1">
																{booking.guestPhoto ? (
																	<UserImageFallback
																		type="avatar"
																		src={booking.guestPhoto}
																		alt={booking.guest}
																		className="h-4 w-4 shrink-0 rounded-full object-cover"
																	/>
																) : (
																	<span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white bg-white/25 text-[7px] font-bold">
																		{guestInitials(booking.guest)}
																	</span>
																)}
																<span className="truncate text-[9px] font-semibold leading-none">
																	{shortGuestName(booking.guest)}
																</span>
															</div>
															<button
																className="flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
																onClick={(e) => handleInfoClick(booking, e)}
																title="Ver detalhes"
																aria-label={`Ver detalhes de ${booking.guest}`}
															>
																<Info size={10} />
															</button>
														</div>
													))}
													{bookingsForDay.length > 2 && (
														<span className="w-fit rounded-full bg-white/25 px-1.5 py-0.5 text-[8px] font-bold text-white">
															+{bookingsForDay.length - 2}
														</span>
													)}
												</div>
											)}

											{bookingsForDay.length > 0 && !compact && (
												<div className="flex flex-col gap-1 justify-end flex-1 mt-auto">
													{bookingsForDay.map((booking) => (
														<div key={booking.id} className="text-white">
															<div className="flex items-center justify-between w-full gap-1">
																{booking.guestPhoto ? (
																	<UserImageFallback
																		type="avatar"
																		src={booking.guestPhoto}
																		alt={booking.guest}
																		className="rounded-full object-cover w-6 h-6 flex-shrink-0"
																	/>
																) : (
																	<span className="w-[18px] h-[18px] rounded-full border-[1.5px] border-white flex items-center justify-center bg-white/25 text-[8px] font-bold flex-shrink-0">
																		{guestInitials(booking.guest)}
																	</span>
																)}
																<button
																	className="cursor-pointer group flex items-center justify-center transition-all outline-none text-white flex-shrink-0"
																	onClick={(e) => handleInfoClick(booking, e)}
																	title="Ver detalhes"
																>
																	<div className="group">
																		{/* Outline — visível por padrão */}
																		<svg
																			xmlns="http://www.w3.org/2000/svg"
																			fill="none"
																			viewBox="0 0 24 24"
																			strokeWidth="1.5"
																			stroke="currentColor"
																			className="size-6 block group-hover:hidden transition-all duration-700"
																		>
																			<path
																				strokeLinecap="round"
																				strokeLinejoin="round"
																				d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
																			/>
																		</svg>

																		{/* Solid — visível no hover */}
																		<svg
																			xmlns="http://www.w3.org/2000/svg"
																			viewBox="0 0 24 24"
																			fill="currentColor"
																			className="size-6 hidden group-hover:block transition-all duration-700"
																		>
																			<path
																				fillRule="evenodd"
																				d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
																				clipRule="evenodd"
																			/>
																		</svg>
																	</div>
																</button>
															</div>
														</div>
													))}

													{/* {bookingsForDay.length > 1 && (
														<div className="text-[10px] text-gray-500 font-semibold p-0.5 bg-gray-100 rounded text-center">
															+{bookingsForDay.length - 1}
														</div>
													)} */}
												</div>
											)}
										</>
									)}
								</div>
							);
						})}
					</div>
				</div>
			</div>

			{/* Modal de detalhes da reserva */}
			<ReservationModal
				open={showModal}
				booking={selectedBooking}
				place={{
					title: selectedBooking?.placeTitle,
					city: selectedBooking?.placeCity,
					photos: selectedBooking?.placePhoto
						? [selectedBooking.placePhoto]
						: [],
					checkinTime: selectedBooking?.placeCheckin,
					checkoutTime: selectedBooking?.placeCheckout,
				}}
				onClose={() => setShowModal(false)}
				onViewDetails={() => setShowModal(false)}
				onSendMessage={() => setShowModal(false)}
			/>
		</section>
	);
};

export default CalendarGridMonth;
