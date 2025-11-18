import axios from "axios";
import React, { useEffect, useState } from "react";
import BookingAll from "./BookingAll";
import "./Booking.css";
import { useParams } from "react-router-dom";
import Loading from "./Loading";

const AccBookings = () => {
	const [bookings, setBookings] = useState([]);
	const { action } = useParams();
	const [ready, setReady] = useState();

	useEffect(() => {
		const axiosGet = async () => {
			const { data } = await axios.get("/bookings/owner");
			setTimeout(() => {
				setBookings(data);
				setReady(true);
			}, 2000000);
		};

		axiosGet();
	}, []);

	if (!ready) {
		return <Loading category="bookings" />;
	}

	return (
		<>
			<div className="bg-primary-500 relative flex flex-col justify-center items-center h-[50svh] ">
				<h2 className="title__booking font-bold pt-10 text-4xl text-white text-center">
					Mingas Reservas
				</h2>
			</div>
			<div className="flex w-full mx-auto max-w-full max-h-full lg:max-w-7xl h-full flex-col gap-8 relative justify-center items-center">
				{bookings.length == 0 ? (
					<h2 className="text-3xl font-bold text-white/50">
						Seu diário de viagens está vazio.
					</h2>
				) : (
					<BookingAll bookingsArray={bookings} />
				)}
			</div>
		</>
	);
};

export default AccBookings;
