import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import "./calendarGridMonth.css";

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

const CalendarGridMonth = ({ calendar }) => {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [selectedBooking, setSelectedBooking] = useState(null);
	const [showModal, setShowModal] = useState(false);

	const events = calendar?.events || [];

	// Atribuir cores às reservas
	const bookingColors = useMemo(() => {
		const colors = new Map();
		let colorIndex = 0;
		events.forEach((event) => {
			colors.set(event.id, COLORS[colorIndex % COLORS.length]);
			colorIndex++;
		});
		return colors;
	}, [events]);

	// Mapa de reservas por data com informações de posição
	const bookingsByDate = useMemo(() => {
		const map = new Map();
		events.forEach((event) => {
			const checkin = new Date(event.checkin);
			const checkout = new Date(event.checkout);

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
		<section className="calendar-grid-section">
			<div className="calendar-grid-header">
				<h2 className="calendar-grid-title">Agenda de Reservas</h2>
				<p className="calendar-grid-subtitle">
					Visualize todas as suas reservas do mês
				</p>
			</div>

			<div className="calendar-grid-container">
				{/* Cabeçalho com controles de navegação */}
				<div className="calendar-grid-nav">
					<button
						onClick={goToPreviousMonth}
						className="calendar-nav-btn"
						title="Mês anterior"
					>
						<ChevronLeft size={20} />
					</button>
					<h3 className="calendar-month-title">{monthName}</h3>
					<button
						onClick={goToNextMonth}
						className="calendar-nav-btn"
						title="Próximo mês"
					>
						<ChevronRight size={20} />
					</button>
				</div>

				{/* Grid do calendário */}
				<div className="calendar-grid-wrapper">
					{/* Cabeçalho com dias da semana */}
					<div className="calendar-grid-weekdays">
						{["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map((day) => (
							<div key={day} className="calendar-weekday">
								{day}
							</div>
						))}
					</div>

					{/* Dias do mês */}
					<div className="calendar-grid-days">
						{daysInMonth.map((day, index) => {
							const dateKey = day ? day.toISOString().split("T")[0] : null;
							const bookingsForDay = dateKey
								? bookingsByDate.get(dateKey) || []
								: [];

							return (
								<div
									key={index}
									className={`calendar-day ${
										!day ? "calendar-day-empty" : "calendar-day-active"
									}`}
									style={
										bookingsForDay.length > 0
											? {
													background: bookingColors.get(bookingsForDay[0].id),
													borderColor: bookingColors.get(bookingsForDay[0].id),
												}
											: {}
									}
								>
									{day && (
										<>
											<div
												className={`calendar-day-number ${bookingsForDay.length > 0 ? "has-booking" : ""}`}
											>
												{day.getDate()}
											</div>

											{bookingsForDay.length > 0 && (
												<div className="calendar-day-bookings">
													{bookingsForDay.slice(0, 1).map((booking) => (
														<div
															key={booking.id}
															className="text-white mt-auto"
														>
															<div className="booking-header">
																{selectedBooking.guestPhoto ? (
																	<img
																		src={selectedBooking.guestPhoto}
																		alt={selectedBooking.guest}
																		className="rounded-full object-cover  w-7 h-7"
																	/>
																) : (
																	<span className="modal-avatar-fallback">
																		{guestInitials(selectedBooking.guest)}
																	</span>
																)}
																<button
																	className="cursor-pointer group"
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
			{showModal && selectedBooking && (
				<div
					className="calendar-modal-overlay"
					onClick={() => setShowModal(false)}
				>
					<div className="calendar-modal" onClick={(e) => e.stopPropagation()}>
						<button
							className="calendar-modal-close"
							onClick={() => setShowModal(false)}
						>
							✕
						</button>

						<div className="modal-header">
							{selectedBooking.guestPhoto ? (
								<img
									src={selectedBooking.guestPhoto}
									alt={selectedBooking.guest}
									className="modal-avatar"
								/>
							) : (
								<span className="modal-avatar-fallback">
									{guestInitials(selectedBooking.guest)}
								</span>
							)}
							<div className="modal-title-section">
								<h2 className="modal-guest-name">{selectedBooking.guest}</h2>
								<p className="modal-place-name">{selectedBooking.placeTitle}</p>
							</div>
						</div>

						<div className="modal-content">
							<div className="modal-section">
								<h3 className="modal-section-title">Status</h3>
								<span
									className={`modal-status-badge ${selectedBooking.rawStatus || "pending"}`}
								>
									{getStatusLabel(selectedBooking.rawStatus)}
								</span>
							</div>

							<div className="modal-section">
								<h3 className="modal-section-title">Datas</h3>
								<div className="modal-date-range">
									<div>
										<p className="modal-label">Check-in</p>
										<p className="modal-value">
											{new Date(selectedBooking.checkin).toLocaleDateString(
												"pt-BR",
											)}
										</p>
									</div>
									<span className="modal-arrow">→</span>
									<div>
										<p className="modal-label">Check-out</p>
										<p className="modal-value">
											{new Date(selectedBooking.checkout).toLocaleDateString(
												"pt-BR",
											)}
										</p>
									</div>
								</div>
							</div>

							<div className="modal-section">
								<h3 className="modal-section-title">Horários</h3>
								<div className="modal-time-range">
									<div>
										<p className="modal-label">Entrada</p>
										<p className="modal-value">
											{selectedBooking.placeCheckin || "14:00"}
										</p>
									</div>
									<span className="modal-arrow">→</span>
									<div>
										<p className="modal-label">Saída</p>
										<p className="modal-value">
											{selectedBooking.placeCheckout || "11:00"}
										</p>
									</div>
								</div>
							</div>

							<div className="modal-section">
								<h3 className="modal-section-title">
									Informações da Acomodação
								</h3>
								<p className="modal-value">{selectedBooking.placeCity}</p>
							</div>

							{selectedBooking.paymentStatus && (
								<div className="modal-section">
									<h3 className="modal-section-title">Pagamento</h3>
									<span
										className={`modal-payment-badge ${selectedBooking.paymentStatus}`}
									>
										{selectedBooking.paymentStatus === "approved"
											? "Aprovado"
											: selectedBooking.paymentStatus === "pending"
												? "Pendente"
												: "Rejeitado"}
									</span>
								</div>
							)}
						</div>

						<div className="modal-actions">
							<button className="modal-btn modal-btn-secondary">
								Ver Detalhes Completos
							</button>
							<button className="modal-btn modal-btn-primary">
								Enviar Mensagem
							</button>
						</div>
					</div>
				</div>
			)}
		</section>
	);
};

export default CalendarGridMonth;
