import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useMessage } from "../components/contexts/MessageContext";
import { Skeleton } from "@/components/ui/skeleton";
import photoDefaultLoading from "../assets/loadingGif2.gif";
import NotFound from "./NotFound";
import { motion, AnimatePresence } from "framer-motion";
import PlaceGallery from "../components/places/PlaceGallery";
import PlaceHeader from "../components/places/PlaceHeader";
import PlaceOwner from "../components/places/PlaceOwner";
import PlaceDescription from "../components/places/PlaceDescription";
import PlacePerks from "../components/places/PlacePerks";
import PlaceLocation from "../components/places/PlaceLocation";
import PlaceRules from "../components/places/PlaceRules";
import PlaceReviews from "../components/places/PlaceReviews";
import PlaceExistingBooking from "../components/places/PlaceExistingBooking";
import PlaceBookingForm from "../components/places/PlaceBookingForm";

const fadeUp = {
	hidden: { opacity: 0, y: 32 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

const stagger = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const Place = () => {
	const { id } = useParams();
	const { showMessage } = useMessage();
	const [place, setPlace] = useState(null);
	const [owner, setOwner] = useState(null);
	const [booking, setBooking] = useState(null);
	const [bookingsPlace, setBookingsPlace] = useState(null);
	const [reviews, setReviews] = useState([]);
	const [loading, setLoading] = useState(false);
	const [placeNotFound, setPlaceNotFound] = useState(false);
	const [experienceTime, setExperienceTime] = useState("");
	const [refundPolicy, setRefundPolicy] = useState(null);
	const [showFixedBar, setShowFixedBar] = useState(false);
	const formRef = useRef(null);

	const navigate = (url) => window.location.assign(url);

	// Fetch place
	useEffect(() => {
		if (!id) return;
		setLoading(true);
		axios.get(`/places/${id}`)
			.then(({ data }) => { setPlace(data); setPlaceNotFound(false); })
			.catch(() => setPlaceNotFound(true))
			.finally(() => setTimeout(() => setLoading(false), 50));
	}, [id]);

	// Fetch owner + experience time
	useEffect(() => {
		if (!place?.owner?._id) return;
		axios.get(`/places/owner/${place.owner._id}`)
			.then(({ data }) => {
				setOwner(data);
				const days = Math.ceil((Date.now() - new Date(data?.createdAt)) / 86400000);
				if (days < 30) setExperienceTime(`${days} dia${days !== 1 ? "s" : ""}`);
				else if (days < 365) { const m = Math.floor(days / 30); setExperienceTime(`${m} ${m !== 1 ? "meses" : "mês"}`); }
				else { const y = Math.floor(days / 365); setExperienceTime(`${y} ano${y !== 1 ? "s" : ""}`); }
			})
			.catch(() => setOwner(null));
	}, [place]);

	// Fetch user's existing booking
	useEffect(() => {
		if (!place) return;
		axios.get("/bookings/owner")
			.then(({ data }) => {
				const found = data.find((b) => b.place._id === place._id);
				if (found) { setBooking(found); showMessage("Você possui uma reserva nesta acomodação!", "info"); }
			})
			.catch(() => {});
	}, [place]);

	// Fetch all bookings for date blocking
	useEffect(() => {
		if (!id) return;
		axios.get(`/bookings/place/${id}`).then(({ data }) => setBookingsPlace(data)).catch(() => {});
	}, [id]);

	// Fetch reviews
	useEffect(() => {
		if (!id) return;
		axios.get(`/reviews/place/${id}`).then(({ data }) => setReviews(data)).catch(() => {});
	}, [id]);

	// IntersectionObserver: show fixed bar when booking form is out of view
	useEffect(() => {
		if (!place || !formRef.current) return;
		const observer = new IntersectionObserver(
			([entry]) => setShowFixedBar(!entry.isIntersecting),
			{ threshold: 0 },
		);
		observer.observe(formRef.current);
		return () => observer.disconnect();
	}, [place]);

	if (placeNotFound) return <NotFound />;

	if (loading || !place) {
		return (
			<div className="container__infos mx-auto max-sm:max-w-full md:max-w-7xl flex flex-col gap-2 p-4">
				<div className="grid relative grid-cols-5 grid-rows-2 h-100 gap-2">
					<Skeleton className="col-span-3 row-span-2 rounded-2xl" />
					<Skeleton className="col-span-1 row-span-1 rounded-2xl" />
					<Skeleton className="col-span-1 row-span-1 rounded-2xl" />
					<Skeleton className="col-span-1 row-span-1 rounded-2xl" />
					<Skeleton className="col-span-1 row-span-1 rounded-2xl" />
				</div>
				<div className="grid grid-cols-5 gap-5 mt-4">
					<div className="col-span-3 flex flex-col gap-4">
						<Skeleton className="h-9 w-2/3 rounded-lg" />
						<Skeleton className="h-5 w-1/3 rounded-lg" />
						<Skeleton className="h-5 w-1/2 rounded-lg" />
						<Skeleton className="h-24 w-full rounded-lg" />
					</div>
					<div className="col-span-2">
						<Skeleton className="h-64 w-full rounded-2xl" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<AnimatePresence>
			<motion.div
				className="container__infos mx-auto max-sm:max-w-full md:max-w-7xl"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.4 }}
			>
				{/* Gallery */}
				<div className="max-sm:mt-15 px-2 md:px-4">
					<PlaceGallery photos={place.photos || []} />
				</div>

				{/* Fixed bottom bar for mobile */}
				{showFixedBar && (
					<motion.div
						className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between shadow-lg md:hidden"
						initial={{ y: 80 }}
						animate={{ y: 0 }}
						transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
					>
						<div>
							<span className="text-xl font-bold text-gray-900">R$ {place.price}</span>
							<span className="text-gray-500 text-sm"> /noite</span>
						</div>
						<button
							className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-medium text-sm"
							onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth" })}
						>
							Reservar
						</button>
					</motion.div>
				)}

				{/* Main content */}
				<motion.div
					className="sm:grid sm:grid-cols-5 max-sm:flex max-sm:flex-col mt-2 gap-5 max-sm:mx-2 max-sm:mt-0 md:ml-4"
					variants={stagger}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.05 }}
				>
					{/* Left column */}
					<motion.div className="leading-relaxed col-span-3 order-1 w-full" variants={fadeUp}>
						<PlaceHeader place={place} />
						{owner && <PlaceOwner owner={owner} experienceTime={experienceTime} />}
						{place.description && <PlaceDescription description={place.description} />}
						{place.perks?.length > 0 && <PlacePerks perks={place.perks} />}
						{place.city && <PlaceLocation city={place.city} />}
						<PlaceRules place={place} refundPolicy={refundPolicy} />
						{reviews.length > 0 && <PlaceReviews reviews={reviews} />}
					</motion.div>

					{/* Right column */}
					<motion.div className="col-span-2 order-2" variants={fadeUp}>
						{booking && <PlaceExistingBooking booking={booking} place={place} />}
						<PlaceBookingForm
							place={place}
							placeId={id}
							bookingsPlace={bookingsPlace}
							formRef={formRef}
						/>
					</motion.div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
};

export default Place;


					
					<div className="order-2 col-span-2 flex-1 w-full max-w-full  ml-auto">
						{/* Booking - New Collapsible Card Style */}
						{booking && (
							<div className="mb-4 w-full transition-all duration-700 mx-auto max-sm:mb-5 ">
								<div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
									{/* Collapsed View */}
									<div
										className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
										onClick={() => setIsBookingExpanded(!isBookingExpanded)}
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<div
													className={`w-3 h-3 rounded-full bg-green-500`}
												></div>
												<div>
													<div className="text-sm font-semibold text-gray-900">
														Reserva Confirmada
													</div>
													<div className="text-xs text-gray-500">
														#{booking._id.slice(-6).toUpperCase()}
													</div>
												</div>
											</div>
											<div className="flex items-center gap-3">
												<div className="text-right">
													<div className="text-sm font-semibold text-gray-900">
														{formatDate(booking.checkin)}
													</div>
													<div className="text-xs text-gray-500">Check-in</div>
												</div>
												<ChevronDown
													className={`w-5 h-5 text-gray-400 transition-transform ${isBookingExpanded ? "rotate-180" : ""}`}
												/>
											</div>
										</div>
									</div>

									{/* Expanded View */}
									{isBookingExpanded && (
										<div className="px-4 pb-4 transition-all duration-700 border-t border-gray-100">
											{/* Detailed Dates */}
											<div className="grid grid-cols-2 gap-4 my-4">
												<div className="bg-gray-50 rounded-lg p-3">
													<div className="flex items-center gap-2 mb-2">
														<span className="text-xs text-gray-500 uppercase">
															Check-in
														</span>
													</div>
													<div className="text-base font-semibold text-gray-900 mb-1">
														{formatDate(booking.checkin)}
													</div>
													<div className="text-sm text-gray-600 flex items-center gap-1">
														{place.checkin}
													</div>
												</div>

												<div className="bg-gray-50 rounded-lg p-3">
													<div className="flex items-center gap-2 mb-2">
														<Calendar className="w-4 h-4 text-gray-500" />
														<span className="text-xs text-gray-500 uppercase">
															Check-out
														</span>
													</div>
													<div className="text-base font-semibold text-gray-900 mb-1">
														{formatDate(booking.checkout)}
													</div>
													<div className="text-sm text-gray-600 flex items-center gap-1">
														<Clock className="w-3 h-3" />
														{place.checkout}
													</div>
												</div>
											</div>

											{/* Action Button */}
											<Link
												to={`../account/bookings/${booking._id}`}
												className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
											>
												Acessar Reserva
											</Link>
										</div>
									)}
								</div>
							</div>
						)}
						<form
							ref={formRef}
							className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-6"
						>
							{/* Preço */}
							<div className="mb-6">
								<div className="flex items-baseline gap-1">
									<span className="text-4xl font-bold text-gray-900">
										R$ {place?.price}
									</span>
									<span className="text-gray-600">por noite</span>
								</div>
							</div>

							{/* NOVO CALENDÁRIO AIRBNB STYLE */}
							<div className="w-full mb-6" ref={datePickerRef}>
								<DatePickerAirbnb
									onDateSelect={handleDateSelect}
									initialCheckin={checkin}
									initialCheckout={checkout}
									price={place?.price}
									placeId={id}
									bookings={bookingsPlace}
								/>
							</div>

							{/* Hóspedes */}
							<div className="mb-6">
								<div className="text-sm font-semibold text-gray-900 mb-3">
									Hóspedes
								</div>
								<div className="text-sm text-gray-600 mb-3">
									Hospedagem para até 2 pessoas.
								</div>
								<div className="flex items-center justify-between border rounded-xl p-3">
									<button
										onClick={() => setGuests(Math.max(1, guests - 1))}
										className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
										disabled={guests <= 1}
									>
										<Minus className="w-4 h-4" />
									</button>
									<span className="text-lg font-medium">{guests}</span>
									<button
										onClick={() => setGuests(Math.min(10, guests + 1))}
										className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
									>
										<Plus className="w-4 h-4" />
									</button>
								</div>
							</div>

							{/* Botão */}
							<button
								className="w-full bg-gray-900 text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-colors"
								onClick={
									user
										? handleBooking
										: (e) => {
												e.preventDefault();
												showAuthModal("login");
											}
								}
							>
								{user ? "Reservar Agora" : "Faça login para reservar"}
							</button>
						</form>
						{showTransparentCheckout && transparentBookingData && (
							<>
								<Dialog
									open={showTransparentCheckout}
									onOpenChange={setShowTransparentCheckout}
								>
									<DialogContent className="!max-w-7xl w-full p-0 lg:p-6">
										<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
											{/* Left: payment form */}
											<div className="border-r border-gray-100 w-full p-6">
												<PaymentMethodSelector
													selected={paymentMethod}
													onChange={setPaymentMethod}
												/>
												{paymentMethod === "pix" ? (
													<PixPayment
														bookingData={transparentBookingData}
														onSuccess={(data) => {
															handlePaymentSuccess(data);
															setShowTransparentCheckout(false);
														}}
														onError={handlePaymentError}
													/>
												) : (
													<TransparentCheckoutForm
														bookingData={transparentBookingData}
														amountValue={
															transparentBookingData?.totalPrice || 1
														}
														paymentMethod={paymentMethod}
														onSuccess={(data) => {
															handlePaymentSuccess(data);
															setShowTransparentCheckout(false);
														}}
														onError={handlePaymentError}
													/>
												)}
											</div>
											{/* Right: booking preview */}
											<div className="p-6 bg-gray-50 rounded-2xl">
												<div className="max-w-md mx-auto w-full">
													<h3 className="text-lg font-semibold text-gray-900 mb-2">
														Resumo da Reserva
													</h3>
													<p className="text-sm text-gray-600 mb-4">
														Confira os detalhes antes de confirmar o pagamento.
													</p>
													<div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
														<div className="text-gray-800 font-medium">
															{place?.title}
														</div>
														<div className="text-sm text-gray-600">
															{place?.city}
														</div>
														<div className="mt-3 text-sm text-gray-700">
															<div>
																Check-in:{" "}
																<span className="font-medium">
																	{formatDate(transparentBookingData.checkIn)}
																</span>
															</div>
															<div>
																Check-out:{" "}
																<span className="font-medium">
																	{formatDate(transparentBookingData.checkOut)}
																</span>
															</div>
															<div>
																Hóspedes:{" "}
																<span className="font-medium">
																	{transparentBookingData.guests}
																</span>
															</div>
															<div>
																Noites:{" "}
																<span className="font-medium">{nights}</span>
															</div>
														</div>
													</div>
													<div className="bg-white rounded-xl border border-gray-200 p-4">
														<div className="flex justify-between text-sm text-gray-600 mb-2">
															<span>Preço por noite</span>
															<span>R$ {place?.price?.toFixed(2)}</span>
														</div>
														<div className="flex justify-between text-lg font-semibold text-gray-900">
															<span>Total</span>
															<span>
																R$ {(place?.price * nights)?.toFixed(2)}
															</span>
														</div>
													</div>
													<div className="mt-4 text-center">
														<button
															type="button"
															className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 mr-2"
															onClick={() => {
																setShowTransparentCheckout(false);
																setTransparentBookingData(null);
															}}
														>
															Voltar
														</button>
														<button
															type="button"
															className="px-4 py-2 rounded-lg bg-gray-900 text-white"
															onClick={() => {
																/* focus form confirm */ (function () {
																	const pixContinue = document.getElementById(
																		"transparent-pix-continue",
																	);
																	if (pixContinue) {
																		pixContinue.click();
																	} else {
																		document
																			.getElementById("transparent-confirm-btn")
																			?.click();
																	}
																})();
															}}
														>
															Pagar
														</button>
													</div>
												</div>
											</div>
										</div>
									</DialogContent>
								</Dialog>
							</>
						)}
					</div>
				</div>
			</div>

