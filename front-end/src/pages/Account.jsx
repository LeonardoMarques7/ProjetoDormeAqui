import React, { useEffect, useState } from "react";
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
	const [shouldRedirect, setShouldRedirect] = useState(false);
	const { user, ready } = useUserContext();

	useEffect(() => {
		if (!ready) {
			// Após 4.5 segundos, marca para redirecionar
			const timer = setTimeout(() => {
				setShouldRedirect(true);
			}, 4500);

			return () => clearTimeout(timer);
		}
	}, [ready]);

	if (!ready && !shouldRedirect) {
		return <Loading />;
	}

	return (
		<div className="flex flex-col gap-4">
			{subpage === "profile" && <AccProfile />}
			{subpage === "places" && <AccPlaces />}
			{subpage === "bookings" && <AccBookings />}
		</div>
	);
};

export default Account;
