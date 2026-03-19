/**
 * DatePickerSearch — variante específica para a SearchBar.
 * Usa DatePickerAirbnb com search={true} e exibe datas selecionadas
 * no próprio trigger (abaixo do "Quando?") sem interferir no modo booking.
 */
import DatePickerAirbnb from "./DatePickerAirbnb";

const DatePickerSearch = ({ onDateSelect, initialCheckin, initialCheckout, datePickerKey }) => {
	return (
		<DatePickerAirbnb
			key={datePickerKey}
			search={true}
			onDateSelect={onDateSelect}
			initialCheckin={initialCheckin}
			initialCheckout={initialCheckout}
		/>
	);
};

export default DatePickerSearch;
