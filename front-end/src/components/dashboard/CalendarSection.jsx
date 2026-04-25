import { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import { CalendarDays, Clock3, MapPin, Plus } from "lucide-react";
import "./hostDashboardCalendar.css";

const formatMoney = (value = 0) =>
	new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
		Number(value) || 0,
	);

const formatDate = (value) =>
	new Date(value).toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
	});

const parseTimeParts = (timeString, fallbackHour, fallbackMinute = 0) => {
	const [h, m] = String(timeString || "")
		.split(":")
		.map((value) => Number(value));

	return {
		hour: Number.isFinite(h) ? h : fallbackHour,
		minute: Number.isFinite(m) ? m : fallbackMinute,
	};
};

const buildDateWithTime = (
	dateValue,
	timeString,
	fallbackHour,
	fallbackMinute = 0,
) => {
	const date = new Date(dateValue);
	const { hour, minute } = parseTimeParts(
		timeString,
		fallbackHour,
		fallbackMinute,
	);
	date.setHours(hour, minute, 0, 0);
	return date;
};

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

const paymentLabel = (status) => {
	if (status === "approved") return "Aprovado";
	if (status === "pending") return "Pendente";
	if (status === "rejected") return "Rejeitado";
	if (status === "canceled") return "Cancelado";
	return status || "Pendente";
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

const getStatusClass = (status) =>
	STATUS_STYLES[status]?.className || STATUS_STYLES.pending.className;

const getStatusLabel = (status) =>
	STATUS_STYLES[status]?.label || STATUS_STYLES.pending.label;

const CalendarSection = ({ calendar }) => {
	const [selectedEvent, setSelectedEvent] = useState(null);
	const events = calendar?.events || [];
	const emptyDays = calendar?.emptyDays || [];

	const emptyDaysSet = useMemo(
		() => new Set(emptyDays.map((d) => d.date)),
		[emptyDays],
	);

	const fullCalendarEvents = useMemo(
		() =>
			events.map((event) => {
				const isCheckin = event.type === "checkin";
				const isCheckout = event.type === "checkout";
				const isStay = event.type === "stay";

				const startDate = isCheckin
					? buildDateWithTime(event.startDate, event.placeCheckin, 14, 0)
					: isCheckout
						? buildDateWithTime(event.startDate, event.placeCheckout, 11, 0)
						: buildDateWithTime(event.startDate, "12:00", 12, 0);

				const endDate = new Date(startDate);
				endDate.setMinutes(endDate.getMinutes() + (isStay ? 45 : 75));

				return {
					id: event.id,
					title: event.title,
					start: startDate,
					end: endDate,
					allDay: false,
					classNames: [
						"host-calendar-event",
						getStatusClass(event.rawStatus),
						`host-event-type-${event.type}`,
					],
					extendedProps: {
						...event,
						statusLabel: getStatusLabel(event.rawStatus),
						shortGuestName: shortGuestName(event.guest),
						guestInitials: guestInitials(event.guest),
					},
				};
			}),
		[events],
	);

	const selectedEventData = useMemo(() => {
		if (selectedEvent) return selectedEvent;
		return fullCalendarEvents[0]?.extendedProps || null;
	}, [selectedEvent, fullCalendarEvents]);

	const selectedTypeLabel = selectedEventData
		? selectedEventData.type === "checkin"
			? "Check-in"
			: selectedEventData.type === "checkout"
				? "Check-out"
				: "Hospedagem"
		: "Reserva";

	return (
		<section className="host-dashboard-section">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 className="text-xl font-bold text-[#0F172B]">
						Agenda de Reservas
					</h2>
					<p className="text-sm text-gray-500">
						Check-ins, check-outs, status e detalhes completos das reservas.
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2 text-xs">
					<span className="rounded-full bg-green-100 px-2 py-1 font-medium text-green-700">
						Confirmada
					</span>
					<span className="rounded-full bg-yellow-100 px-2 py-1 font-medium text-yellow-700">
						Pendente
					</span>
					<span className="rounded-full bg-red-100 px-2 py-1 font-medium text-red-700">
						Cancelada
					</span>
					<span className="rounded-full bg-blue-100 px-2 py-1 font-medium text-blue-700">
						Em andamento
					</span>
					<span className="rounded-full bg-violet-100 px-2 py-1 font-medium text-violet-700">
						Avaliação
					</span>
					<span className="rounded-full bg-orange-100 px-2 py-1 font-medium text-orange-700">
						Revisão
					</span>
					<span className="rounded-full bg-slate-200 px-2 py-1 font-medium text-slate-700">
						Finalizada
					</span>
				</div>
			</div>

			<div className="host-agenda-layout mt-4">
				<div className="host-fullcalendar overflow-hidden rounded-2xl border border-gray-200 bg-white p-2">
					<FullCalendar
						plugins={[
							dayGridPlugin,
							timeGridPlugin,
							listPlugin,
							interactionPlugin,
						]}
						locale={ptBrLocale}
						initialView="timeGridWeek"
						height="auto"
						headerToolbar={{
							left: "prev,next today",
							center: "title",
							right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
						}}
						buttonText={{
							today: "Hoje",
							month: "Mês",
							week: "Semana",
							day: "Dia",
							list: "Lista",
						}}
						slotMinTime="05:00:00"
						slotMaxTime="23:00:00"
						slotDuration="00:30:00"
						eventDisplay="auto"
						events={fullCalendarEvents}
						eventClick={(info) => {
							setSelectedEvent(info.event.extendedProps);
						}}
						dayCellClassNames={(arg) => {
							const iso = arg.date.toISOString().slice(0, 10);
							if (emptyDaysSet.has(iso)) return ["host-empty-day"];
							return [];
						}}
						eventContent={(arg) => {
							const data = arg.event.extendedProps;
							const typeEmoji =
								data.type === "checkin"
									? "🔑"
									: data.type === "checkout"
										? "🚪"
										: "🏠";
							return (
								<div className="host-event-content">
									<div className="event-header">
										<span className="event-type">{typeEmoji}</span>
										<span className="event-status-badge">
											{data.statusLabel}
										</span>
									</div>
									<div className="event-main-row">
										{data.guestPhoto ? (
											<img
												src={data.guestPhoto}
												alt={data.shortGuestName}
												className="event-avatar"
											/>
										) : (
											<span className="event-avatar event-avatar-fallback">
												{data.guestInitials}
											</span>
										)}
										<div className="event-meta">
											<span className="event-guest">{data.shortGuestName}</span>
											<span className="event-title">{data.placeTitle}</span>
											<span className="event-time">
												{data.placeCheckin || "14:00"} → {data.placeCheckout || "11:00"}
											</span>
										</div>
									</div>
								</div>
							);
						}}
					/>
				</div>

				<aside className="host-agenda-details">
					{selectedEventData ? (
						<>
							<h3 className="host-agenda-title">
								{selectedTypeLabel} com {selectedEventData.shortGuestName}
							</h3>

							<div className="host-agenda-info-row">
								<CalendarDays size={14} />
								<span>
									{formatDate(selectedEventData.checkin)} -{" "}
									{formatDate(selectedEventData.checkout)}
								</span>
							</div>

							<div className="host-agenda-info-row">
								<Clock3 size={14} />
								<span>
									{selectedEventData.placeCheckin || "14:00"} -{" "}
									{selectedEventData.placeCheckout || "11:00"}
								</span>
							</div>

							<div className="host-agenda-info-row">
								<MapPin size={14} />
								<span>
									{selectedEventData.placeCity || selectedEventData.placeTitle}
								</span>
							</div>

							<div className="host-agenda-tags">
								<span className="host-agenda-tag">
									{selectedEventData.statusLabel}
								</span>
								<span className="host-agenda-tag">
									Pagamento: {paymentLabel(selectedEventData.paymentStatus)}
								</span>
								<span className="host-agenda-tag">
									{selectedEventData.placeTitle}
								</span>
							</div>

							<div className="host-agenda-guest">
								{selectedEventData.guestPhoto ? (
									<img
										src={selectedEventData.guestPhoto}
										alt={selectedEventData.shortGuestName}
										className="host-agenda-guest-avatar"
									/>
								) : (
									<span className="host-agenda-guest-avatar host-agenda-guest-fallback">
										{selectedEventData.guestInitials}
									</span>
								)}
								<div>
									<p className="host-agenda-guest-name">
										{selectedEventData.shortGuestName}
									</p>
									<p className="host-agenda-guest-subtitle">
										{selectedEventData.placeTitle}
									</p>
								</div>
							</div>

							<div className="host-agenda-actions">
								<button type="button" className="host-agenda-btn">
									<Plus size={14} />
									Nova reserva
								</button>
								<button
									type="button"
									className="host-agenda-btn host-agenda-btn-dark"
								>
									Ver detalhes
								</button>
							</div>
						</>
					) : (
						<p className="text-sm text-gray-500">
							Selecione um evento no calendário para ver os detalhes.
						</p>
					)}
				</aside>
			</div>

			<p className="mt-2 text-xs text-gray-500">
				Dias em destaque representam dias sem reservas no mês atual.
			</p>
		</section>
	);
};

export default CalendarSection;
