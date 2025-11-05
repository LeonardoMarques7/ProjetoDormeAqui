import React, { useState, useEffect } from "react";
import { isBefore } from "date-fns";

const Status = ({ booking }) => {
	const [status, setStatus] = useState(null);

	useEffect(() => {
		const dataAtual = new Date().toLocaleDateString("pt-br");
		const dataCheckin = new Date(booking.checkin).toLocaleDateString("pt-br");

		console.log(dataAtual);
		console.log(dataCheckin);

		if (isBefore(dataAtual, dataCheckin)) {
			setStatus(3);
		}
	}, [booking.checkIn]); // Só executa quando checkIn mudar

	return (
		<div>
			{status == 3 && (
				<div className="backdrop-blur-xs bg-white/25 flex justify-center items-center h-full z-2 rounded-t-2xl p-2.5 text-gray-500 text-2xl absolute w-full">
					<p className="">
						Essa reserva <strong>não</strong> está mais disponível.
					</p>
				</div>
			)}
		</div>
	);
};

export default Status;
