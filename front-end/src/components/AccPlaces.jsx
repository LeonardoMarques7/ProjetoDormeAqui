import { HousePlus } from "lucide-react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import NewPlace from "./NewPlace";
import Places from "./Places";
import "./Places.css";

const AccPlaces = () => {
	const { action } = useParams();
	const [places, setPlaces] = useState([]);

	useEffect(() => {
		const axiosGet = async () => {
			const { data } = await axios.get("/places/owner");
			setPlaces(data);
		};

		axiosGet();
	}, [action]);

	return (
		<>
			<div className="bg__places bg-primary-500  relative flex flex-col justify-end items-end h-[50svh] ">
				<span className="header__places flex items-center p-0 max-w-5xl mb-10 mx-auto w-full justify-between">
					<h2 className="font-bold text-4xl text-white">Meus Lugares</h2>
					<Link
						to="/account/places/new"
						className=" flex w-fit bg-white gap-2 cursor-pointer ease-in-out duration-500 text-primary-500 px-5 hover:scale-110 py-2.5 rounded-full"
					>
						<HousePlus /> Nova acomodação
					</Link>
				</span>
			</div>
			{action !== "new" ? (
				<>
					<Places places={places} />
				</>
			) : (
				<NewPlace />
			)}
		</>
	);
};

export default AccPlaces;
