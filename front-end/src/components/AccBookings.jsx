import axios from "axios";
import React, { useEffect, useState } from "react";
import BookingAll from "./BookingAll";
import "./Booking.css";

const AccBookings = () => {
	const [bookings, setBookings] = useState([]);

	useEffect(() => {
		const axiosGet = async () => {
			const { data } = await axios.get("/bookings/owner");
			setBookings(data);
		};

		axiosGet();
	}, []);

	return (
		<>
			<div className="bg-primary-500 relative flex flex-col justify-center items-center h-[50svh] ">
				<h2 className="title__booking font-bold text-4xl text-white text-center">
					Mingas Reservas
				</h2>
			</div>
			<div className="flex w-full mx-auto max-w-full max-h-full lg:max-w-7xl flex-col -mt-25 gap-8 relative justify-center items-center">
				{bookings > 0 ? (
					<>
						{bookings.map((booking) => (
							<BookingAll booking={booking} key={booking._id} />
						))}
					</>
				) : (
					<h2 className="text-xl absolute top-[25svh]">
						Você não possue reservas
					</h2>
				)}
			</div>
		</>
	);
};

export default AccBookings;
