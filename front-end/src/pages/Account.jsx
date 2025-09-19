import React from "react";
import { Link, useParams } from "react-router-dom";
import AccProfile from "../components/AccProfile";

const Account = () => {
	const { subpage } = useParams();

	const buttonClass = (button) => {
		let finalClass =
			"border-1 w-50 h-12 flex items-center justify-center cursor-pointer ease-in-out duration-300 bg-gray-100  border-gray-300 text-gray-600";
		if (button === subpage) {
			finalClass +=
				" text-white font-bold !bg-primary-300 scale-[1.01] border-transparent";
		}

		return finalClass;
	};

	return (
		<section className="p-8 text-center max-w-7xl mx-auto">
			<div className="flex flex-col gap-4">
				<div className="flex">
					<Link
						to="/account/profile"
						className={`${buttonClass("profile")} rounded-l-full`}
					>
						Perfil
					</Link>
					<Link to="/account/bookings" className={buttonClass("bookings")}>
						Reservas
					</Link>
					<Link
						to="/account/places"
						className={`${buttonClass("places")} rounded-r-full`}
					>
						Acomodações
					</Link>
				</div>
				{subpage === "profile" && <AccProfile />}
			</div>
		</section>
	);
};

export default Account;
