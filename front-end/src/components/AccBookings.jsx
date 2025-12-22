import axios from "axios";
import React, { useEffect, useState } from "react";
import BookingAll from "./BookingAll";
import "./Booking.css";
import { useParams } from "react-router-dom";
import Loading from "./Loading";
import Banner from "../assets/image.png";
import { useUserContext } from "./contexts/UserContext";

const AccBookings = ({ bookingId }) => {
	const [bookings, setBookings] = useState([]);
	const { action } = useParams();
	const [readyBookings, setReadyBookings] = useState(false);
	const { user, ready: userReady } = useUserContext();

	useEffect(() => {
		const axiosGet = async () => {
			const { data } = await axios.get("/bookings/owner");
			setBookings(data);
			setReadyBookings(true);
		};

		axiosGet();
	}, []);

	return (
		<>
			{/* Conteúdo */}

			<div className="flex w-full my-10 mx-auto max-w-full max-h-full lg:max-w-7xl h-full flex-col gap-8 relative justify-start items-start px-8">
				<div className="mt-20 border-b-1 flex justify-between items-center w-full pb-4">
					<span className="text-gray-500 flex-col flex text-sm font-light pl-0.5">
						<span className="font-bold text-3xl max-sm:text-xl text-black">
							Minhas reservas
						</span>
						Visualize suas reservas
					</span>
					<span className="px-4 py-2 h-fit border rounded-md text-sm">
						{bookings.length} Reservas
					</span>
				</div>

				{bookings.length == 0 ? (
					<h2 className="text-3xl font-bold text-white/50">
						Seu diário de viagens está vazio.
					</h2>
				) : (
					<BookingAll bookingsArray={bookings} bookingId={bookingId} />
				)}
			</div>
		</>
	);
};

export default AccBookings;
