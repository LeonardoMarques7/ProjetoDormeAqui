import axios from "axios";
import React, { useEffect, useState } from "react";
import BookingAll from "./BookingAll";

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
				{bookings.map((booking) => (
					<BookingAll booking={booking} key={booking._id} />
				))}
			</div>
		</div>
	);
};

export default AccBookings;
