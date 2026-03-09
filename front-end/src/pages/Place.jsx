import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { Navigate, useParams, Link } from "react-router-dom";
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

	if (loading || !place) {
		return (
			<div className="container__infos mx-auto max-sm:max-w-full md:max-w-7xl flex flex-col gap-2 p-4">
				<Skeleton className="h-64 w-full rounded-xl" />
				<Skeleton className="h-64 w-full rounded-xl" />
			</div>
		);
	}

	return (
		<AnimatePresence>
			<motion.div
				className="container__infos mx-auto max-sm:max-w-full md:max-w-7xl"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
			>
				{/* GALERIA */}

				<div className="px-4">
					<PlaceGallery photos={place.photos || []} />
				</div>

				{/* BARRA MOBILE */}

				{showFixedBar && (
					<motion.div
						className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between md:hidden"
						initial={{ y: 80 }}
						animate={{ y: 0 }}
					>
						<div>
							<span className="text-xl font-bold">R$ {place.price}</span>
							<span className="text-gray-500 text-sm"> /noite</span>
						</div>

						<button
							className="bg-gray-900 text-white px-6 py-2 rounded-xl"
							onClick={() =>
								formRef.current?.scrollIntoView({ behavior: "smooth" })
							}
						>
							Reservar
						</button>
					</motion.div>
				)}

				{/* GRID */}

				<motion.div
					className="sm:grid sm:grid-cols-5 gap-5 mt-2"
					variants={stagger}
					initial="hidden"
					whileInView="visible"
				>
					{/* COLUNA ESQUERDA */}

					<motion.div className="col-span-3" variants={fadeUp}>
						<PlaceHeader place={place} />

						{owner && (
							<PlaceOwner owner={owner} experienceTime={experienceTime} />
						)}

						{place.description && (
							<PlaceDescription description={place.description} />
						)}

						{place.perks?.length > 0 && <PlacePerks perks={place.perks} />}

						{place.city && <PlaceLocation city={place.city} />}

						<PlaceRules place={place} refundPolicy={refundPolicy} />

						{reviews.length > 0 && <PlaceReviews reviews={reviews} />}
					</motion.div>

					{/* COLUNA DIREITA */}

					<motion.div className="col-span-2" variants={fadeUp}>
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
			</motion.div>
		</AnimatePresence>
	);
};

export default Place;
