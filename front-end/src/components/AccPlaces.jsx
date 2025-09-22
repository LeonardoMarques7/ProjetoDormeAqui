import { HousePlus } from "lucide-react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import NewPlace from "./NewPlace";
import Places from "./Places";

const AccPlaces = () => {
	const { action } = useParams();
	const [places, setPlaces] = useState([]);

	useEffect(() => {
		const axiosGet = async () => {
			const { data } = await axios.get("/places/owner");
			setPlaces(data);
		};

		axiosGet();
	}, []);

	return (
		<>
			{action !== "new" ? (
				<>
					<Link
						to="/account/places/new"
						className=" flex w-fit gap-4 bg-primary-600 cursor-pointer hover:bg-primary-700 ease-in-out duration-300 text-white px-10 py-2.5 rounded-full"
					>
						<HousePlus /> Adicionar acomodação
					</Link>

					<Places places={places} />
				</>
			) : (
				<NewPlace />
			)}
		</>
	);
};

export default AccPlaces;
