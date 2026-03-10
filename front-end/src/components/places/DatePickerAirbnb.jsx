import { useState, useEffect, useRef } from "react";
import {
	ChevronLeft,
	ChevronRight,
	X,
	Calendar,
	Check,
	ArrowRight,
	Trash,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { useMobileContext } from "@/components/contexts/MobileContext";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { CalendarDateRangeIcon, TrashIcon } from "@heroicons/react/24/outline";

// Funções auxiliares para datas
const formatDate = (date, format = "dd/MM/yyyy") => {
	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const year = date.getFullYear();

	const monthNames = [
		"Jan",
		"Fev",
		"Mar",
		"Abr",
		"Mai",
		"Jun",
		"Jul",
		"Ago",
		"Set",
		"Out",
		"Nov",
		"Dez",
	];
	const monthNamesFull = [
		"Janeiro",
		"Fevereiro",
		"Março",
		"Abril",
		"Maio",
		"Junho",
		"Julho",
		"Agosto",
		"Setembro",
		"Outubro",
		"Novembro",
		"Dezembro",
	];

	if (format === "dd/MM/yyyy") return `${day}/${month}/${year}`;
	if (format === "dd/MM") return `${day}/${month}`;
	if (format === "dd de MMM") return `${day} de ${monthNames[date.getMonth()]}`;
	if (format === "MMMM yyyy")
		return `${monthNamesFull[date.getMonth()]} ${year}`;
	return `${day}/${month}/${year}`;
};

const addMonths = (date, months) => {
	const newDate = new Date(date);
	newDate.setMonth(newDate.getMonth() + months);
	return newDate;
};

const isSameDay = (date1, date2) => {
	return (
		date1.getDate() === date2.getDate() &&
		date1.getMonth() === date2.getMonth() &&
		date1.getFullYear() === date2.getFullYear()
	);
};

const isAfter = (date1, date2) => date1.getTime() > date2.getTime();
const isBefore = (date1, date2) => date1.getTime() < date2.getTime();

const getDaysInMonth = (year, month) => {
	const firstDay = new Date(year, month, 1);
	const lastDay = new Date(year, month + 1, 0);
	const days = [];

	for (let i = 1; i <= lastDay.getDate(); i++) {
		days.push(new Date(year, month, i));
	}

	return days;
};

const differenceInDays = (date1, date2) => {
	const diffTime = Math.abs(date1.getTime() - date2.getTime());
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const DatePickerAirbnb = ({
	onDateSelect,
	initialCheckin,
	search,
	initialCheckout,
	price = 250,
	placeId,
	bookings,
	resetDates,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [checkinDate, setCheckinDate] = useState(initialCheckin || null);
	const [checkoutDate, setCheckoutDate] = useState(initialCheckout || null);
	const [selectingCheckout, setSelectingCheckout] = useState(false);
	const [bookedDates, setBookedDates] = useState([]);
	const [loadingDates, setLoadingDates] = useState(false);
	const { mobile } = useMobileContext();
	const containerRef = useRef(null);

	// Fechar o calendário inline ao clicar fora (apenas modo normal)
	useEffect(() => {
		if (search || !isOpen) return;
		const handleClickOutside = (e) => {
			if (containerRef.current && !containerRef.current.contains(e.target)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen, search]);

	// Buscar datas ocupadas quando o calendário abrir
	useEffect(() => {
		if (isOpen && placeId) {
			setLoadingDates(true);
			const fetchBookedDates = async () => {
				try {
					const response = await axios.get(
						`/bookings/place/${placeId}/booked-dates`,
					);
					setBookedDates(response.data);
				} catch (error) {
					console.error("Erro ao buscar datas ocupadas:", error);
					setBookedDates([]);
				} finally {
					setLoadingDates(false);
				}
			};
			fetchBookedDates();
		}
	}, [isOpen, placeId]);

	const year = currentMonth.getFullYear();
	const month = currentMonth.getMonth();
	const daysInMonth = getDaysInMonth(year, month);
	const daysInNextMonth = getDaysInMonth(year, month + 1);

	const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

	const handleDateClick = (date) => {
		if (!checkinDate || (checkinDate && checkoutDate)) {
			setCheckinDate(date);
			setCheckoutDate(null);
			setSelectingCheckout(true);
		} else if (selectingCheckout) {
			if (isAfter(date, checkinDate)) {
				setCheckoutDate(date);
				setSelectingCheckout(false);
			} else {
				setCheckinDate(date);
				setCheckoutDate(null);
			}
		}
	};

	const isInRange = (date) => {
		if (!checkinDate || !checkoutDate) return false;
		return isAfter(date, checkinDate) && isBefore(date, checkoutDate);
	};

	const isDisabled = (date) => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const checkDate = new Date(date);
		checkDate.setHours(0, 0, 0, 0);

		// Verificar se é uma data passada
		if (isBefore(checkDate, today)) return true;

		// Verificar se a data está ocupada
		return bookedDates.some((bookedDate) => {
			// bookedDate is now a string in YYYY-MM-DD format
			const [year, month, day] = bookedDate.split("-").map(Number);
			const booked = new Date(year, month - 1, day);
			booked.setHours(0, 0, 0, 0);
			return isSameDay(checkDate, booked);
		});
	};

	const getDayClassName = (date) => {
		let classes =
			"h-10 w-10 text-sm md:text-base flex items-center justify-center rounded-full cursor-pointer transition-all font-medium ";

		if (isDisabled(date)) {
			classes += "text-gray-300 cursor-not-allowed line-through";
		} else if (checkinDate && isSameDay(date, checkinDate)) {
			classes +=
				"bg-primary-800 text-white font-bold hover:bg-primary-700 scale-105 shadow-md";
		} else if (checkoutDate && isSameDay(date, checkoutDate)) {
			classes +=
				"bg-primary-800 text-white font-bold hover:bg-primary-700 scale-105 shadow-md";
		} else if (isInRange(date)) {
			classes += "bg-primary-100 text-primary-900 hover:bg-primary-100";
		} else {
			classes +=
				"text-primary-700 hover:bg-primary-100 border-2 border-transparent hover:border-primary-100";
		}

		return classes;
	};

	const renderMonth = (monthDate, days) => {
		const firstDayOfWeek = days[0].getDay();
		const emptyDays = Array(firstDayOfWeek).fill(null);

		return (
			<div className="w-full">
				<h3 className="text-center font-bold text-base md:text-lg mb-4 text-primary-800 capitalize">
					{formatDate(monthDate, "MMMM yyyy")}
				</h3>

				<div className="grid grid-cols-7 gap-2 mb-3">
					{weekDays.map((day, idx) => (
						<div
							key={day + idx}
							className="h-8 flex items-center justify-center text-xs font-semibold text-primary-500"
						>
							{day}
						</div>
					))}
				</div>

				<div className="grid grid-cols-7 gap-2">
					{emptyDays.map((_, index) => (
						<div key={`empty-${index}`} className="h-10 md:h-12" />
					))}
					{days.map((day, idx) => (
						<button
							key={day.toString() + idx}
							onClick={() => !isDisabled(day) && handleDateClick(day)}
							disabled={isDisabled(day)}
							type="button"
							className={getDayClassName(day)}
						>
							{day.getDate()}
						</button>
					))}
				</div>
			</div>
		);
	};

	const handleConfirm = () => {
		if (checkinDate && checkoutDate) {
			onDateSelect({ checkin: checkinDate, checkout: checkoutDate });
			setIsOpen(false);
		}
	};

	const handleClear = () => {
		setCheckinDate(null);
		setCheckoutDate(null);
		setSelectingCheckout(false);
	};

	const nights =
		checkinDate && checkoutDate
			? differenceInDays(checkoutDate, checkinDate)
			: 0;
	const totalPrice = price && nights > 0 ? price * nights : 0;

	// ── modo normal (PlaceBookingForm): calendário inline com collapse animado ──
	if (!search) {
		return (
			<div ref={containerRef} className="w-full mx-auto">
				{/* Trigger: botões Check-in / Check-out */}
				<div
					className={`w-full border rounded-t-xl overflow-hidden ${isOpen ? "rounded-b-0" : "rounded-b-xl"}`}
				>
					<div className="grid grid-cols-2 divide-x">
						{/* Check-in */}
						<button
							type="button"
							onClick={() => setIsOpen((v) => !v)}
							className="p-4 flex flex-col cursor-pointer items-start justify-start hover:bg-gray-50 transition-colors w-full text-left"
						>
							<div className="text-xs font-semibold text-gray-700 uppercase mb-1">
								Check-in
							</div>
							<div
								className={`text-sm font-medium ${!checkinDate ? "text-gray-400" : "text-gray-900"}`}
							>
								{checkinDate
									? formatDate(checkinDate, "dd de MMM")
									: "Adicionar data"}
							</div>
						</button>

						{/* Check-out */}
						<button
							type="button"
							onClick={() => setIsOpen((v) => !v)}
							className="p-4 flex flex-col cursor-pointer items-start justify-start hover:bg-gray-50 transition-colors w-full text-left"
						>
							<div className="text-xs font-semibold text-gray-700 uppercase mb-1">
								Check-out
							</div>
							<div
								className={`text-sm font-medium ${!checkoutDate ? "text-gray-400" : "text-gray-900"}`}
							>
								{checkoutDate
									? formatDate(checkoutDate, "dd de MMM")
									: "Adicionar data"}
							</div>
						</button>
					</div>
				</div>

				{/* Calendário inline com animação de colapso */}
				<AnimatePresence initial={false}>
					{isOpen && (
						<motion.div
							key="inline-calendar"
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
							style={{ overflow: "hidden" }}
							className="border rounded-b-xl border-t-0 border-gray-200 bg-white shadow-lg"
						>
							{/* Cabeçalho do inline: datas + fechar */}

							{/* Calendários */}
							<div className="p-4 md:p-6 relative">
								{loadingDates ? (
									<div className="flex items-center justify-center py-12">
										<div className="text-center">
											<div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-primary-800 rounded-full animate-spin mb-2" />
											<p className="text-sm text-gray-500">
												Carregando datas disponíveis...
											</p>
										</div>
									</div>
								) : (
									<>
										<button
											type="button"
											onClick={() =>
												setCurrentMonth(addMonths(currentMonth, -1))
											}
											className="p-2 absolute left-6 top-6 cursor-pointer hover:bg-gray-200 rounded-full transition-all z-10"
										>
											<ChevronLeft size={18} />
										</button>
										<button
											type="button"
											onClick={() =>
												setCurrentMonth(addMonths(currentMonth, 1))
											}
											className="p-2 absolute right-6 top-6 cursor-pointer hover:bg-gray-200 rounded-full transition-all z-10"
										>
											<ChevronRight size={18} />
										</button>

										<div className="flex flex-col gap-6 lg:gap-8 justify-center">
											<div className="flex-1 mx-auto lg:mx-0">
												{renderMonth(currentMonth, daysInMonth)}
											</div>
										</div>
									</>
								)}
							</div>

							{/* Footer inline: datas selecionadas + ações */}
							<div className="border-t border-gray-100 px-4 md:px-6 py-4 bg-gray-50">
								<div className="flex flex-col md:flex-row items-center justify-between gap-4">
									{/* Info datas */}
									<div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
										{nights > 0 && (
											<>
												<div>
													<p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
														Total
													</p>
													<p className="text-base font-bold text-primary-900">
														R$ {totalPrice.toFixed(2).replace(".", ",")}
													</p>
												</div>
											</>
										)}
									</div>

									{/* Botões */}
									<div className="flex items-center gap-2 w-full md:w-auto">
										<button
											type="button"
											disabled={!checkinDate && !checkoutDate}
											onClick={handleClear}
											className="bg-red-500 border-0 cursor-pointer text-white w-13 text-sm justify-center h-13  rounded-xl font-bold hover:bg-red-700 transition-all disabled:bg-red-100 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
										>
											<TrashIcon className="w-6 h-6" />
										</button>
										<InteractiveHoverButton
											type="button"
											icon={Check}
											onClick={handleConfirm}
											disabled={!checkinDate || !checkoutDate}
											className="bg-primary-900 cursor-pointer flex-1 md:flex-none text-white px-6 h-13 rounded-xl text-sm font-bold hover:bg-primary-800 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap shadow-md"
										>
											Confirmar datas
										</InteractiveHoverButton>
									</div>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Preview fora do collapse (quando fechado e há datas) */}
				<AnimatePresence>
					{!isOpen && (checkinDate || checkoutDate) && (
						<motion.div
							initial={{ opacity: 0, y: -4 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -4 }}
							transition={{ duration: 0.25 }}
							className="mt-3 rounded-xl"
						>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-semibold text-primary-900 mb-1">
										Datas selecionadas
									</p>
									<p className="text-xs text-primary-700">
										{checkinDate && formatDate(checkinDate, "dd de MMM")}
										{checkinDate && checkoutDate && " → "}
										{checkoutDate && formatDate(checkoutDate, "dd de MMM")}
									</p>
								</div>
								{nights > 0 && (
									<div className="text-right">
										<p className="text-lg font-bold text-primary-600">
											{nights} {nights === 1 ? "noite" : "noites"}
										</p>
										<p className="text-xs text-primary-700">
											R$ {totalPrice.toFixed(2).replace(".", ",")}
										</p>
									</div>
								)}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		);
	}

	// ── modo search: comportamento original com Dialog ──
	return (
		<div className="w-full mx-auto ">
			{/* Botão para abrir o modal */}
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className="border-none p-0 !text-gray-900 w-full border rounded-xl overflow-hidden cursor-pointer hover:bg-white! transition-all flex items-center gap-4"
			>
				<div className="flex items-center gap-4">
					<CalendarDateRangeIcon className="w-6 h-6" />
					Quando?
				</div>
			</button>

			{/* Modal com Calendário */}
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent
					className="max-w-[95vw] sm:max-w-3xl lg:max-w-3xl p-0 gap-0 overflow-hidden"
					hideCloseButton
				>
					<DialogHeader className="border-b border-gray-200 px-4 md:px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
						<div className="flex items-center justify-between">
							<DialogTitle className="text-lg md:text-xl max-sm:text-md! !font-medium text-gray-900">
								Selecione as datas
							</DialogTitle>
							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={() => setIsOpen(false)}
									className="p-2 hover:bg-primary-200 cursor-pointer rounded-full transition-all ml-2"
								>
									<X size={20} className="text-gray-600" />
								</button>
							</div>
						</div>
					</DialogHeader>

					{/* Calendários */}
					<div className="p-4 md:p-6 lg:p-8 max-h-[60vh] relative overflow-y-auto">
						{loadingDates ? (
							<div className="flex items-center justify-center py-16">
								<div className="text-center">
									<div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-primary-800 rounded-full animate-spin mb-2" />
									<p className="text-sm text-gray-500">Carregando datas disponíveis...</p>
								</div>
							</div>
						) : (
							<>
								<button
									type="button"
									onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
									className="p-2 absolute left-10 cursor-pointer hover:bg-gray-200 rounded-full transition-all"
								>
									<ChevronLeft size={20} />
								</button>
								<button
									type="button"
									onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
									className="p-2 absolute right-10 cursor-pointer hover:bg-gray-200 rounded-full transition-all"
								>
									<ChevronRight size={20} />
								</button>
								<div className="flex flex-col lg:flex-row gap-6 lg:gap-8 justify-center">
									<div className="flex-1 max-w-[340px] mx-auto lg:mx-0">
										{renderMonth(currentMonth, daysInMonth)}
									</div>
								</div>
							</>
						)}
					</div>

					{/* Footer do Modal */}
					<div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white px- md:px-6 py-4 md:py-5">
						<div className="flex flex-col md:flex-row max-sm:px-5 items-center justify-between gap-4">
							<div className="flex items-center max-sm:justify-between gap-4 md:gap-6 max-sm:gap-2 w-full md:w-auto">
								<div className="">
									<p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
										Check-in
									</p>
									<p className="text-md xl:text-xl text-gray-900">
										{checkinDate
											? formatDate(checkinDate, "dd/MM/YYYY")
											: "--/--/--"}
									</p>
								</div>
								<ArrowRight size={15} className="text-primary-500" />
								<div className="flex flex-col items-end">
									<p className="text-xs text-primary-500 mb-1 uppercase tracking-wide">
										Check-out
									</p>
									<p className="text-md xl:text-xl text-gray-900">
										{checkoutDate
											? formatDate(checkoutDate, "dd/MM/YYYY")
											: "--/--/--"}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-4 w-full md:w-auto">
								<InteractiveHoverButton
									type="button"
									icon={Check}
									onClick={handleConfirm}
									disabled={!checkinDate || !checkoutDate}
									className="bg-primary-900 cursor-pointer flex-1 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-primary-800 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap shadow-md hover:shadow-lg disabled:shadow-none"
								>
									Selecionar datas
								</InteractiveHoverButton>
								<button
									type="button"
									disabled={!checkinDate || !checkoutDate}
									onClick={handleClear}
									className="bg-red-500 cursor-pointer text-white p-3 rounded-xl text-sm font-bold hover:bg-red-700 transition-all disabled:bg-red-100 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap shadow-md hover:shadow-lg disabled:shadow-none"
								>
									<Trash />
								</button>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default DatePickerAirbnb;
