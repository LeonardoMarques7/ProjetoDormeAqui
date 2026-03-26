import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useCallback } from "react";
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
import { AlertTriangle } from "lucide-react";

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
	const [placeInactive, setPlaceInactive] = useState(false);
	const [experienceTime, setExperienceTime] = useState("");
	const [refundPolicy, setRefundPolicy] = useState(null);
	const [showFixedBar, setShowFixedBar] = useState(false);
	const [bookingFormData, setBookingFormData] = useState(null);
	const [showBookingPopup, setShowBookingPopup] = useState(false);
	const [popupData, setPopupData] = useState(null);

	const formRef = useRef(null);

	const navigate = (url) => window.location.assign(url);

	/* FETCH PLACE */

	useEffect(() => {
		if (!id) return;

		setLoading(true);

		axios
			.get(`/places/${id}`)
			.then(({ data }) => {
				if (!data || !data.isActive) {
					setPlaceInactive(true);
				} else {
					setPlace(data);
					setPlaceNotFound(false);
					setPlaceInactive(false);
				}
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

	// Lógica para mostrar popup minimalista do booking
	useEffect(() => {
		const handleScroll = () => {
			const form = document.getElementById("bookingForm");
			if (!form) return;
			const rect = form.getBoundingClientRect();
			// Se o formulário não está visível, mostra popup
			if (rect.bottom < 0 || rect.top > window.innerHeight) {
				// Dados mínimos para popup
				setShowBookingPopup(true);
				// Pega dados do formulário se possível
				if (form && form.dataset) {
					try {
						const data = JSON.parse(form.dataset.bookingpopup || "{}");
						setPopupData(data);
					} catch {
						setPopupData(null);
					}
				}
			} else {
				setShowBookingPopup(false);
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

	// Função para abrir o formulário completo ao clicar no popup
	const handlePopupBook = useCallback(() => {
		const form = document.getElementById("bookingForm");
		if (form) {
			form.scrollIntoView({ behavior: "smooth" });
		}
	}, []);

	if (placeNotFound) return <NotFound />;

	if (placeInactive) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100"
			>
				<div className="text-center max-w-md mx-4">
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.2, duration: 0.4 }}
						className="flex justify-center mb-6"
					>
						<div className="p-4 bg-red-100 rounded-full">
							<AlertTriangle className="w-12 h-12 text-red-600" />
						</div>
					</motion.div>

					<motion.h1
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3, duration: 0.4 }}
						className="text-3xl font-bold text-gray-900 mb-3"
					>
						Acomodação Indisponível
					</motion.h1>

					<motion.p
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4, duration: 0.4 }}
						className="text-gray-600 mb-6 text-lg"
					>
						Desculpe, esta acomodação não está mais disponível. O anúncio pode
						ter sido removido ou está temporariamente indisponível.
					</motion.p>

					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5, duration: 0.4 }}
						className="flex gap-4 justify-center flex-col sm:flex-row"
					>
						<Link
							to="/"
							className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors inline-block"
						>
							← Voltar para Home
						</Link>
					</motion.div>
				</div>
			</motion.div>
		);
	}

	if (!place) {
		return <></>;
	}

	// Função para passar dados mínimos do booking para o popup
	const getMinimalBookingData = () => {
		if (!place || !bookingFormData) return null;
		return {
			price: place.price,
			nights: bookingFormData.nights,
			guests: bookingFormData.guests,
			totalPrice: bookingFormData.totalPrice,
		};
	};

	return (
		<>
			<AnimatePresence className="">
				{loading == true ? (
					<motion.div
						className="  mx-auto h-full max-sm:max-w-full md:max-w-7xl"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
					>
						<PlaceHolder />
					</motion.div>
				) : (
					<motion.div
						className="  mx-auto h-full max-sm:max-w-full md:max-w-7xl"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
					>
						{/* GALERIA */}
						<div>
							<PlaceGallery photos={place.photos || []} />
						</div>
						{/* GRID */}
						<motion.div
							className="grid relative max-sm:grid-cols-1  grid-cols-5 h-fit  gap-2 mt-2"
							variants={stagger}
							initial="hidden"
							whileInView="visible"
						>
							{/* COLUNA ESQUERDA */}
							<motion.div
								className="col-span-3  w-full max-w-2xl max-sm:flex max-sm:flex-col max-sm:gap-5"
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
							<div
								id="bookingForm"
								className="col-span-2 w-full "
								data-bookingpopup={JSON.stringify(getMinimalBookingData())}
							>
								<PlaceBookingForm
									place={place}
									placeId={id}
									bookingsPlace={bookingsPlace}
									formRef={formRef}
									onFormDataChange={setBookingFormData}
								/>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
			{/* Popup minimalista do booking */}
			{showBookingPopup && popupData && (
				<PlaceBookingForm
					asPopup
					minimalData={popupData}
					onPopupBook={handlePopupBook}
				/>
			)}
		</>
	);
};

export default Place;
