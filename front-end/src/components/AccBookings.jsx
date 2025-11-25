import axios from "axios";
import React, { useEffect, useState } from "react";
import BookingAll from "./BookingAll";
import "./Booking.css";
import { useParams } from "react-router-dom";
import Loading from "./Loading";
import Banner from "../assets/banner.png";
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
			<div
				className="bg-cover bg-primar-700 max-w-7xl mx-auto w-full rounded-b-2xl bg-center h-[50svh] relative overflow-hidden"
				style={{
					backgroundImage: `url(${Banner})`,
					rotate: "10",
				}}
			>
				<div className="absolute inset-0 backdrop-blur-sm bg-gradient-to-b from-primary-500/70 via-primary-500/50 to-transparent"></div>
				{/* Conteúdo */}
				<div className="relative flex flex-col justify-center items-center h-full gap-4">
					<h1 className="font-bold text-5xl text-white drop-shadow-lg">
						Minhas reservas
					</h1>
				</div>
			</div>
			<div className="flex w-full my-10 mx-auto max-w-full max-h-full lg:max-w-7xl h-full flex-col gap-8 relative justify-center items-center">
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
