import React, { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import AccProfile from "../components/AccProfile";
import AccPlaces from "../components/AccPlaces";
import AccBookings from "@/components/bookings/AccBookings";
import { useUserContext } from "../components/contexts/UserContext";
import { useAuthModalContext } from "../components/contexts/AuthModalContext";
import { Calendar, House, User } from "lucide-react";
import Loading from "../components/Loading";
import Teste2 from "./Teste2";
import NotFound from "./NotFound";

const Account = () => {
	const { subpage, id, action } = useParams();
	const [shouldRedirect, setShouldRedirect] = useState(false);
	const { user, ready } = useUserContext();
	const { showAuthModal } = useAuthModalContext();

	const bookingId = action || id;

	const validSubpages = ["profile", "places", "bookings"];

	useEffect(() => {
		if (ready && !user && (subpage === "places" || subpage === "bookings")) {
			showAuthModal("login");
		}
	}, [ready, user, subpage, showAuthModal]);

	if (!validSubpages.includes(subpage)) {
		return <NotFound />;
	}

	return (
		<div className="flex flex-col gap-4">
			{subpage === "profile" && <AccProfile />}
			{subpage === "places" && <AccPlaces />}
			{subpage === "bookings" && <AccBookings bookingId={bookingId} />}
		</div>
	);
};

export default Account;
