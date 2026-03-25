import { BOOKING_STATUS_CONFIG } from "../../lib/bookingStatuses.js";

const BookingStatusBadge = ({ status }) => {
	const config = BOOKING_STATUS_CONFIG[status] || BOOKING_STATUS_CONFIG.pending;
	const className = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bgClass} ${config.textClass} ${config.borderClass}`;

	return (
		<div title={config.description}>
			<span className={className}>
				{config.label}
			</span>
		</div>
	);
};

export default BookingStatusBadge;
