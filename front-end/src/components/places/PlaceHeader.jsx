import { MapPin, Minus, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useMobileContext } from "../contexts/MobileContext";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

const stagger = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
	hidden: { opacity: 0, y: 28 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
	},
};

const notification = {
	title: "Reserva confirmada!",
	message: "Sua reserva para 'Casa na Praia' foi confirmada.",
	read: false,
};

const config = {
	icon: CheckCircleIcon,
	primaryColor: "#3b82f6",
	bgColor: "#dbeafe",
};

export default function PlaceHeader({ place }) {
	const { mobile } = useMobileContext();
	const IconComponent = config.icon;
	const timeAgo = "Agora mesmo";

	return (
		<div className="max-sm:py-0 w-full ">
			{/* Mobile info pills */}
			<div className="flex sm:hidden  max-sm:visible my-2 !flex-nowrap items-center !text-xs gap-2 w-full justify-start max-w-auto">
				<span>{place.guests} hóspedes</span>
				<Dot />
				<span>
					{place.rooms} {place.rooms > 1 ? "quartos" : "quarto"}
				</span>
				<Dot />
				<span>
					{place.beds} {place.beds > 1 ? "camas" : "cama"}
				</span>
				<Dot />
				<span>
					{place.bathrooms} {place.bathrooms > 1 ? "banheiros" : "banheiro"}
				</span>
			</div>

			{/* Title + rating + city */}
			<motion.div
				className="flex flex-col flex-1 gap-2"
				variants={stagger}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true }}
			>
				<motion.div
					variants={fadeUp}
					className="text-3xl font-bold max-sm:text-[1.5rem] text-gray-700"
				>
					{place.title}
				</motion.div>

				{place.averageRating > 0 && (
					<motion.div
						variants={fadeUp}
						className="flex gap-2 rounded-2xl items-center"
					>
						<div className="flex items-center gap-2">
							<div className="flex items-center gap-1">
								{[...Array(5)].map((_, i) => (
									<Star
										key={i}
										size={15}
										className={
											i < Math.floor(place.averageRating)
												? "text-yellow-500 fill-current"
												: i < place.averageRating
													? "text-yellow-500 fill-current opacity-50"
													: "text-gray-300"
										}
									/>
								))}
							</div>
							<div>{place.averageRating.toFixed(1)} estrelas</div>
						</div>
					</motion.div>
				)}

				<motion.div
					variants={fadeUp}
					className="flex items-center max-sm:text-sm text-gray-600 gap-2"
				>
					<MapPin size={13} />
					<span>{place.city}</span>
				</motion.div>
			</motion.div>

			{/* Desktop info pills */}
			{!mobile && (
				<motion.div
					className="flex gap-4 w-full !flex-nowrap items-center justify-start mt-4 max-w-auto"
					variants={fadeUp}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
				>
					<span>{place.guests} hóspedes</span>
					<Dot />
					<span>
						{place.rooms} {place.rooms > 1 ? "quartos" : "quarto"}
					</span>
					<Dot />
					<span>
						{place.beds} {place.beds > 1 ? "camas" : "cama"}
					</span>
					<Dot />
					<span>
						{place.bathrooms} {place.bathrooms > 1 ? "banheiros" : "banheiro"}
					</span>
				</motion.div>
			)}
		</div>
	);
}

function Dot() {
	return <div className="w-1 rounded-full h-1 bg-gray-500" />;
}
