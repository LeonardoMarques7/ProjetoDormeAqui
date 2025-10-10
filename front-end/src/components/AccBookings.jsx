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
		<div className="bg-primary-500 relative flex flex-col justify-center items-center h-[50svh] ">
			<div className="flex w-full max-w-full max-h-full mt-[50svh] lg:max-w-7xl flex-col gap-8">
				<h2 className="title__booking font-bold text-4xl text-white text-center">
					Mingas Reservas
				</h2>
				{bookings.map((booking) => (
					<BookingAll booking={booking} key={booking._id} />
				))}
			</div>
		</div>
	);
};

export default AccBookings;
