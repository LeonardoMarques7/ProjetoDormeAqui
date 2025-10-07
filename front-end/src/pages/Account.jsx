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

	if (!user && ready) return <Navigate to="/login" />;

	return (
		<section className="">
			<div className="flex flex-col gap-4">
				{subpage === "profile" && <AccProfile />}
				{subpage === "places" && <AccPlaces />}
				{subpage === "bookings" && <AccBookings />}
			</div>
		</section>
	);
};

export default Account;
