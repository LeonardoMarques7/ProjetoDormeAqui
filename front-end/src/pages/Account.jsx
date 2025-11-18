import React, { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import AccProfile from "../components/AccProfile";
import AccPlaces from "../components/AccPlaces";
import AccBookings from "../components/AccBookings";
import { useUserContext } from "../components/contexts/UserContext";
import { Calendar, House, User } from "lucide-react";
import Loading from "../components/Loading";

const Account = () => {
	const { subpage } = useParams();
	const { id } = useParams();
	const [ready, setReady] = useState();
	const { user } = useUserContext();

	setTimeout(() => {
		setReady(true);
	}, 4500);

	if (!user && ready) return <Navigate to="/login" />;

	if (!ready) return <Loading category="bookings" />;

	return (
		<div className="flex flex-col gap-4">
			{subpage === "profile" && <AccProfile />}
			{subpage === "places" && <AccPlaces />}
			{subpage === "bookings" && <AccBookings />}
		</div>
	);
};

export default Account;
