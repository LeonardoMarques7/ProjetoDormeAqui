import { useEffect } from "react";
import { useParams } from "react-router-dom";
import AccProfile from "@/components/profile/AccProfile";
import AccPlaces from "@/components/places/AccPlaces";
import AccBookings from "@/components/bookings/AccBookings";
import HostDashboard from "@/components/dashboard/HostDashboard";
import { useUserContext } from "../components/contexts/UserContext";
import { useAuthModalContext } from "../components/contexts/AuthModalContext";
import NotFound from "./NotFound";

const Account = ({ dashboardSection }) => {
	const { subpage, id, action } = useParams();
	const { user, ready } = useUserContext();
	const { showAuthModal } = useAuthModalContext();

	const bookingId = action || id;

	const validSubpages = ["profile", "places", "bookings", "dashboard"];

	useEffect(() => {
		if (
			ready &&
			!user &&
			(subpage === "places" || subpage === "bookings" || subpage === "dashboard")
		) {
			showAuthModal("login");
		}
	}, [ready, user, subpage, showAuthModal]);

	if (!validSubpages.includes(subpage)) {
		return <NotFound />;
	}

	return (
		<div className="flex flex-col gap-4">
			{subpage === "profile" && <AccProfile userId={id} />}
			{subpage === "places" && <AccPlaces />}
			{subpage === "bookings" && <AccBookings bookingId={bookingId} />}
			{subpage === "dashboard" && (
				<HostDashboard activeSection={dashboardSection} />
			)}
		</div>
	);
};

export default Account;
