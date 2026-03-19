import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { Navigate, useParams, Link } from "react-router-dom";
import { useMessage } from "../components/contexts/MessageContext";
import { useMobileContext } from "@/components/contexts/MobileContext";
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
import PlaceHolder from "../components/places/placeholder/PlaceHolder";

const fadeUp = {
	hidden: { opacity: 0, y: 32 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
	},
};

const stagger = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const Place = () => {
	const { id } = useParams();
	const { showMessage } = useMessage();
	const { mobile } = useMobileContext();

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

	/* FETCH PLACE */

	useEffect(() => {
		if (!id) return;

		setLoading(true);

		axios
			.get(`/places/${id}`)
			.then(({ data }) => {
				setPlace(data);
				setPlaceNotFound(false);
			})
			.catch(() => setPlaceNotFound(true))
			.finally(() => setTimeout(() => setLoading(false), 50));
	}, [id]);

	/* OWNER */

	useEffect(() => {
		if (!place?.owner?._id) return;

		axios
			.get(`/places/owner/${place.owner._id}`)
			.then(({ data }) => {
				setOwner(data);

				const days = Math.ceil(
					(Date.now() - new Date(data?.createdAt)) / 86400000,
				);

				if (days < 30) setExperienceTime(`${days} dias`);
				else if (days < 365)
					setExperienceTime(`${Math.floor(days / 30)} meses`);
				else setExperienceTime(`${Math.floor(days / 365)} anos`);
			})
			.catch(() => setOwner(null));
	}, [place]);

	/* USER BOOKING */

	useEffect(() => {
		if (!place) return;

		axios
			.get("/bookings/owner")
			.then(({ data }) => {
				const found = data.find((b) => b.place._id === place._id);

				if (found) {
					setBooking(found);
					showMessage("Você possui uma reserva nesta acomodação!", "info");
				}
			})
			.catch(() => {});
	}, [place]);

	/* BOOKINGS */

	useEffect(() => {
		if (!id) return;

		axios
			.get(`/bookings/place/${id}`)
			.then(({ data }) => setBookingsPlace(data))
			.catch(() => {});
	}, [id]);

	/* REVIEWS */

	useEffect(() => {
		if (!id) return;

		axios
			.get(`/reviews/place/${id}`)
			.then(({ data }) => setReviews(data))
			.catch(() => {});
	}, [id]);

	useEffect(() => {
		const handleScroll = () => {
			const form = document.getElementById("bookingForm");
			if (!form) return;

			const rect = form.getBoundingClientRect();

			// se o formulário estiver visível na tela
			if (rect.top < window.innerHeight && rect.bottom > 0) {
				setshowFixedBar(false);
			} else {
				setshowFixedBar(true);
			}
		};

		window.addEventListener("scroll", handleScroll);
		handleScroll();

		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	/* FIXED BAR */

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

	if (!place) {
		return <></>;
	}

	return (
		<AnimatePresence className="relative">
			{loading == true ? (
				<motion.div
					className=" relative mx-auto h-full max-sm:max-w-full md:max-w-7xl"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
				>
					<PlaceHolder />
				</motion.div>
			) : (
				<motion.div
					className=" relative mx-auto h-full max-sm:max-w-full md:max-w-7xl"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
				>
					{/* GALERIA */}

					<div>
						<PlaceGallery photos={place.photos || []} />
					</div>

					{/* BARRA MOBILE */}

					{showFixedBar && (
						// <motion.div className="fixed bottom-4 shadow-2xl z-100 my-4 mx-6 rounded-full left-0 right-0 bg-white p-4 px-6 items-center flex justify-between">
						// 	<div>
						// 		<span className="text-xl font-bold">R$ {place.price}</span>
						// 		<span className="text-gray-500 text-sm"> /noite</span>
						// 	</div>

						// 	<button
						// 		className="bg-gray-900 text-white px-6 py-2 rounded-2xl"
						// 		onClick={() =>
						// 			document.getElementById("bookingForm")?.scrollIntoView({
						// 				behavior: "smooth",
						// 			})
						// 		}
						// 	>
						// 		Reservar
						// 	</button>
						// </motion.div>
						<motion.div
							initial={{ y: 100, opacity: 0 }}
							animate={{
								y: showFixedBar ? 0 : 100,
								opacity: showFixedBar ? 1 : 0,
							}}
							transition={{ duration: 0.35, ease: "easeOut" }}
							className="fixed bottom-4 shadow-2xl z-100 my-4 mx-4 rounded-full left-0 right-0 bg-white p-4 px-6 items-center flex justify-between"
						>
							<div>
								<span className="text-xl font-bold">R$ {place.price}</span>
								<span className="text-gray-500 text-sm"> /noite</span>
							</div>

							<button
								className="bg-gray-900 text-white px-6 py-2 rounded-2xl"
								onClick={() =>
									document.getElementById("bookingForm")?.scrollIntoView({
										behavior: "smooth",
									})
								}
							>
								Reservar
							</button>
						</motion.div>
					)}

					{/* GRID */}

					<motion.div
						className="sm:grid sm:grid-cols-5 md:ml-5 gap-5 mt-2"
						variants={stagger}
						initial="hidden"
						whileInView="visible"
					>
						{/* COLUNA ESQUERDA */}

						<motion.div
							className="col-span-3 max-sm:flex max-sm:flex-col max-sm:gap-5"
							variants={fadeUp}
						>
							<PlaceHeader place={place} />

							{owner && <PlaceOwner owner={place.owner} />}

							{place.description && (
								<PlaceDescription description={place.description} />
							)}

							{place.perks?.length > 0 && <PlacePerks perks={place.perks} />}

							{place.city && <PlaceLocation city={place.city} />}

							<PlaceRules place={place} refundPolicy={refundPolicy} />

							{reviews.length > 0 && <PlaceReviews reviews={reviews} />}
						</motion.div>

						{/* COLUNA DIREITA */}

						<motion.div
							id="bookingForm"
							className="col-span-2 w-full  md:-ml-5"
							variants={fadeUp}
						>
							{/* COLE AQUI TODO O BLOCO GRANDE QUE VOCÊ ENVIOU */}
							{/* booking card + calendario + checkout + dialog */}

							<PlaceBookingForm
								place={place}
								placeId={id}
								bookingsPlace={bookingsPlace}
								formRef={formRef}
							/>
						</motion.div>
					</motion.div>
					{/* {mobile && (
					<a
						href="#bookingForm"
						className="fixed bottom-0 w-full h-10 rounded-2xl m-2"
						ref={formRef}
					>
						Reservar agora
					</a>
				)} */}
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default Place;
