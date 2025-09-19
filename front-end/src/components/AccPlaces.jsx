import { HousePlus } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import NewPlace from "./NewPlace";

const AccPlaces = () => {
	const { action } = useParams();

	return (
		<>
			{action !== "new" ? (
				<Link
					to="/account/places/new"
					className=" flex w-fit gap-4 bg-primary-600 cursor-pointer hover:bg-primary-700 ease-in-out duration-300 text-white px-10 py-2.5 rounded-full"
				>
					<HousePlus /> Adicionar acomodação
				</Link>
			) : (
				<NewPlace />
			)}
		</>
	);
};

export default AccPlaces;
