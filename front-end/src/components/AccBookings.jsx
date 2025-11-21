import axios from "axios";
import React, { useEffect, useState } from "react";
import BookingAll from "./BookingAll";
import "./Booking.css";
import { useParams } from "react-router-dom";
import Loading from "./Loading";
import { useUserContext } from "./contexts/UserContext";

const AccBookings = () => {
	const [bookings, setBookings] = useState([]);
	const { action } = useParams();
	const [readyBookings, setReadyBookings] = useState(false);
	const { user, ready: userReady } = useUserContext();

	useEffect(() => {
		const axiosGet = async () => {
			const { data } = await axios.get("/bookings/owner");
			setTimeout(() => {
				setBookings(data);
				setReadyBookings(true);
			}, 4500);
		};

		axiosGet();
	}, []);

	if (!readyBookings) {
		return <Loading />;
	}

	return (
		<>
			<div className="bg-primary-500 relative flex flex-col justify-center items-center h-[50svh] ">
				<h2 className="title__booking font-bold pt-10 text-4xl text-white text-center">
					Mingas Reservas
				</h2>
			</div>
			<div className="flex w-full mb-10 mx-auto max-w-full max-h-full lg:max-w-7xl h-full flex-col gap-8 relative justify-center items-center">
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
