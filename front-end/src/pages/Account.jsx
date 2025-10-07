import React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import AccProfile from "../components/AccProfile";
import AccPlaces from "../components/AccPlaces";
import AccBookings from "../components/AccBookings";
import { useUserContext } from "../components/contexts/UserContext";
import { Calendar, House, User } from "lucide-react";

const Account = () => {
	const { subpage } = useParams();
	const { user, ready } = useUserContext();

	const buttonClass = (button) => {
		let finalClass =
			" w-40 py-2.5 flex items-center gap-2 justify-center cursor-pointer ease-in-out duration-300 transtion-all text-gray-600";
		if (button === subpage) {
			finalClass +=
				" text-white rounded-full font-bold bg-primary-300 !border-primary-300 scale-[1.01] transition-all";
		}

		return finalClass;
	};

	if (!user && ready) return <Navigate to="/login" />;

	return (
		<section className="">
			<div className="flex flex-col gap-4">
				<div className="w-full mx-auto justify-center items-center hidden">
					<Link to="/account/profile" className={`${buttonClass("profile")}`}>
						<User /> Perfil
					</Link>
					<Link to="/account/bookings" className={buttonClass("bookings")}>
						<Calendar /> Reservas
					</Link>
					<Link to="/account/places" className={`${buttonClass("places")}`}>
						<House /> Acomodações
					</Link>
				</div>
				{subpage === "profile" && <AccProfile />}
				{subpage === "places" && <AccPlaces />}
				{subpage === "bookings" && <AccBookings />}
			</div>
		</section>
	);
};

export default Account;
