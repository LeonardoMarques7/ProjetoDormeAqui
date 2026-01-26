import axios from "axios";
import React, { useEffect, useState } from "react";
import BookingAll from "./BookingAll";
import { Skeleton } from "@/components/ui/skeleton";
import "./Booking.css";
import { useParams } from "react-router-dom";
import { useUserContext } from "./contexts/UserContext";

const AccBookings = ({ bookingId }) => {
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
			}, 100);
		};

		axiosGet();
	}, []);

	return (
		<>
			{/* Conteúdo */}

			<div className="flex w-full my-10 mx-auto max-w-full max-h-full lg:max-w-7xl h-full flex-col gap-8 relative justify-start items-start px-8  max-sm:my-0 max-sm:px-3.5">
				<div className="mt-20 flex border-l-3 pl-4 justify-between items-center w-full ">
					<span className="text-gray-500 flex-col gap-3 flex text-sm font-light pl-0.5">
						<span className=" text-3xl max-sm:text-xl text-black">
							Minhas reservas{" "}
							<small className="text-lg">({bookings.length} Reservas)</small>
						</span>
						Visualize suas reservas
					</span>
				</div>
				{bookings.length === 0 && (
					<p className="text-gray-500 text-center py-8">
						Você não possue reservas.
					</p>
				)}

				{!readyBookings ? (
					<>
						<div className=" max-sm:flex-col bg-white/80 border border-primary-100 h-fit relative w-full flex-1 flex rounded-3xl   gap-5 ">
							<div className="w-85 h-90 max-sm:aspect-square max-sm:w-full max-sm:h-full ">
								<Skeleton className="w-full rounded-r-none h-full max-sm:rounded-3xl max-sm:rounded-b-none rounded-l-3xl" />
							</div>
							<div className="p-4 mr-4 max-sm:py-0 flex flex-col justify-between w-full">
								<div className="">
									<div className="flex justify-between w-full max-sm:mb-3 leading-5">
										<Skeleton className="h-4 w-[250px]" />
										<Skeleton className="px-14 max-sm:hidden py-3 h-full rounded-md" />
									</div>
									<Skeleton className="h-4 mt-2 w-[200px]" />
									<div className="mt-5 ">
										<div className="flex justify-start gap-8 flex-1 w-full">
											<span className="flex flex-col gap-1">
												<Skeleton className="h-4 w-25" />
												<Skeleton className="h-4 w-30" />
											</span>
											<span className="flex flex-col gap-1">
												<Skeleton className="h-4 w-25" />
												<Skeleton className="h-4 w-30" />
											</span>
											<span className="flex flex-col gap-1">
												<Skeleton className="h-4 w-25" />
												<Skeleton className="h-4 w-30" />
											</span>
										</div>
									</div>
								</div>
								<div className="mt-4 border-t flex max-sm:flex-col max-sm:items-start items-center py-4">
									<div className="flex flex-col max-sm:pb-4 flex-1">
										<div className="flex items-baseline flex-col gap-2">
											<Skeleton className="text-2xl h-7 w-25 font-normal text-gray-900"></Skeleton>
											<div className="flex items-center gap-2">
												<Skeleton className="font-light w-15 h-5 text-gray-700"></Skeleton>
												<Skeleton className="w-1 h-1 bg-primary-400 rounded-full"></Skeleton>
												<Skeleton className="font-light w-20 h-5 text-gray-700"></Skeleton>
											</div>
										</div>
									</div>
									<Skeleton className="w-35 h-7 rounded-xl max-sm:w-full text-center font-medium"></Skeleton>
								</div>
							</div>
						</div>
						<div className=" max-sm:flex-col bg-white/80 border border-primary-100 h-fit relative w-full flex-1 flex rounded-3xl   gap-5 ">
							<div className="w-85 h-90 max-sm:aspect-square max-sm:w-full max-sm:h-full ">
								<Skeleton className="w-full rounded-r-none h-full max-sm:rounded-3xl max-sm:rounded-b-none rounded-l-3xl" />
							</div>
							<div className="p-4 mr-4 max-sm:py-0 flex flex-col justify-between w-full">
								<div className="">
									<div className="flex justify-between w-full max-sm:mb-3 leading-5">
										<Skeleton className="h-4 w-[250px]" />
										<Skeleton className="px-14 max-sm:hidden py-3 h-full rounded-md" />
									</div>
									<Skeleton className="h-4 mt-2 w-[200px]" />
									<div className="mt-5 ">
										<div className="flex justify-start gap-8 flex-1 w-full">
											<span className="flex flex-col gap-1">
												<Skeleton className="h-4 w-25" />
												<Skeleton className="h-4 w-30" />
											</span>
											<span className="flex flex-col gap-1">
												<Skeleton className="h-4 w-25" />
												<Skeleton className="h-4 w-30" />
											</span>
											<span className="flex flex-col gap-1">
												<Skeleton className="h-4 w-25" />
												<Skeleton className="h-4 w-30" />
											</span>
										</div>
									</div>
								</div>
								<div className="mt-4 border-t flex max-sm:flex-col max-sm:items-start items-center py-4">
									<div className="flex flex-col max-sm:pb-4 flex-1">
										<div className="flex items-baseline flex-col gap-2">
											<Skeleton className="text-2xl h-7 w-25 font-normal text-gray-900"></Skeleton>
											<div className="flex items-center gap-2">
												<Skeleton className="font-light w-15 h-5 text-gray-700"></Skeleton>
												<Skeleton className="w-1 h-1 bg-primary-400 rounded-full"></Skeleton>
												<Skeleton className="font-light w-20 h-5 text-gray-700"></Skeleton>
											</div>
										</div>
									</div>
									<Skeleton className="w-35 h-7 rounded-xl max-sm:w-full text-center font-medium"></Skeleton>
								</div>
							</div>
						</div>
					</>
				) : bookings.length == 0 ? (
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
