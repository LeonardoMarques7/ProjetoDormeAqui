import React, { useState } from "react";
import {
	ChevronLeft,
	ChevronRight,
	X,
	Calendar,
	Check,
	ArrowRight,
	ScissorsLineDashed,
	LineSquiggle,
	LineChart,
	Spline,
	Minus,
	SearchCheck,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

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
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [checkinDate, setCheckinDate] = useState(initialCheckin || null);
	const [checkoutDate, setCheckoutDate] = useState(initialCheckout || null);
	const [selectingCheckout, setSelectingCheckout] = useState(false);

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
		return isBefore(checkDate, today);
	};

	const getDayClassName = (date) => {
		let classes =
			"h-10 w-10 md:h-12 md:w-12 text-sm md:text-base flex items-center justify-center rounded-full cursor-pointer transition-all font-medium ";

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
				"text-primary-700 hover:bg-primary-100 border-2 border-transparent hover:border-primary-300";
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

	return (
		<div className="w-full mx-auto ">
			{/* Botão para abrir o modal */}
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className={`w-full group cursor-pointer ${
					!search &&
					"border-2 shadow-sm hover:shadow-md border-gray-300 rounded-2xl p-4 md:p-5 hover:border-primary-500"
				} transition-all !text-left bg-white flex !justify-start`}
			>
				{search ? (
					<div className="flex group-hover:text-primary-700   items-center text-gray-400 gap-2 justify-center">
						{!checkinDate && !checkoutDate && (
							<Calendar className=" left-0 size-5" />
						)}
						{checkinDate ? (
							<div className="group__input relative w-full px-4 flex justify-center items-center">
								<p className="text-sm md:text-base flex gap-2 ">
									<span className="text-primary-700">
										{checkinDate
											? formatDate(checkinDate, "dd de MMM")
											: "Adicionar data"}
										.
									</span>
								</p>
							</div>
						) : (
							"Quando?"
						)}
						{checkinDate && checkoutDate && (
							<span className="w-5 h-0.5 bg-primary-300"></span>
						)}
						{checkoutDate ? (
							<div className="group__input relative px-4 flex justify-center items-center">
								<p className="text-sm md:text-base flex gap-2">
									<span className="text-primary-700">
										{formatDate(checkoutDate, "dd de MMM")}.
									</span>
								</p>
							</div>
						) : null}
					</div>
				) : (
					<div className="flex items-center w-full justify-between">
						<div className="flex items-center mx-8 md:mx-6 gap-5">
							<Calendar className=" text-primary-500" size={24} />
						</div>

						<div className="flex items-center mx-6 gap">
							<div className="flex-1">
								<p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">
									Check-in
								</p>
								<p className="text-sm md:text-base text-gray-800">
									{checkinDate
										? formatDate(checkinDate, "dd de MMM")
										: "Adicionar data"}
								</p>
							</div>

							<div className="w-px h-12 md:h-14 bg-gray-300 mx-4 md:mx-6" />

							<div className="flex-1">
								<p className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">
									Checkout
								</p>
								<p className="text-sm md:text-base text-gray-800">
									{checkoutDate
										? formatDate(checkoutDate, "dd de MMM")
										: "Adicionar data"}
								</p>
							</div>
						</div>
					</div>
				)}
			</button>

			{/* Modal com Calendário */}
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent
					className="max-w-[95vw] sm:max-w-3xl lg:max-w-3xl p-0 gap-0 overflow-hidden"
					hideCloseButton
				>
					<DialogHeader className="border-b border-gray-200 px-4 md:px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
						<div className="flex items-center justify-between">
							<DialogTitle className="text-lg md:text-xl font-bold text-gray-900">
								Selecione as datas
							</DialogTitle>

							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={handleClear}
									className="text-sm font-semibold cursor-pointer text-red-500 hover:text-red-700 hover:bg-red-100 px-3 py-2 rounded-lg transition-all"
								>
									Limpar
								</button>
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
							<div className="hidden lg:block flex-1 max-w-[340px]">
								{renderMonth(addMonths(currentMonth, 1), daysInNextMonth)}
							</div>
						</div>
					</div>

					{/* Footer do Modal */}
					<div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white px-4 md:px-6 py-4 md:py-5">
						<div className="flex flex-col md:flex-row items-center justify-between gap-4">
							{/* Info das datas */}
							<div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
								<div className="flex-1 md:flex-initial">
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
								<div className="flex-1 md:flex-initial">
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

							{/* Total e botão */}
							<div className="flex items-center gap-4 w-full md:w-auto">
								{totalPrice > 0 && (
									<div className="text-center md:text-right flex-1 md:flex-initial">
										<p className="text-xs text-gray-500 font-medium mb-1">
											Total da estadia
										</p>
										<p className="text-xl md:text-2xl font-bold text-primary-900">
											R$ {totalPrice.toFixed(2).replace(".", ",")}
										</p>
									</div>
								)}
								<InteractiveHoverButton
									type="button"
									icon={Check}
									onClick={handleConfirm}
									disabled={!checkinDate || !checkoutDate}
									className="bg-primary-900 cursor-pointer text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-primary-800 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap shadow-md hover:shadow-lg disabled:shadow-none"
								>
									Confirmar datas
								</InteractiveHoverButton>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Preview das datas selecionadas */}
			{(checkinDate || checkoutDate) && !search && (
				<div className="mt-4 p-4 border-2 border-primary-200 rounded-xl">
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
				</div>
			)}
		</div>
	);
};

export default DatePickerAirbnb;
