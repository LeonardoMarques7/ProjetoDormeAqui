import { useEffect } from "react";
import { useParams } from "react-router-dom";
import AccProfile from "@/components/profile/AccProfile";
import AccPlaces from "@/components/places/AccPlaces";
import AccBookings from "@/components/bookings/AccBookings";
import { useUserContext } from "../components/contexts/UserContext";
import { useAuthModalContext } from "../components/contexts/AuthModalContext";
import NotFound from "./NotFound";

const Account = () => {
	const { subpage, id, action } = useParams();
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
