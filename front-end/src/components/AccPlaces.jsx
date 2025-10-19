import { HousePlus, Trash2 } from "lucide-react";
import { Navigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import NewPlace from "./NewPlace";
import Places from "./Places";
import "./Places.css";
import { useMoblieContext } from "./contexts/MoblieContext";

const AccPlaces = () => {
	const { action } = useParams();
	const { moblie } = useMoblieContext();
	const [places, setPlaces] = useState([]);
	const [redirect, setRedirect] = useState(false);
	const { id } = useParams();

	const { edit } = useParams();

	useEffect(() => {
		const axiosGet = async () => {
			const { data } = await axios.get("/places/owner");
			setPlaces(data);
		};

		axiosGet();
	}, [action]);

	if (redirect) return <Navigate to="/account/places" />;

	return (
		<>
			<div className="bg-primary-500 relative flex flex-col justify-center items-center h-[50svh] ">
				<span className="">
					<h2 className="font-bold text-4xl text-white">
						{edit
							? "Editando acomodação"
							: action !== "new"
							? "Meus lugares"
							: "Adicionando acomodação"}
					</h2>
					{!edit ||
						!moblie ||
						action !==
							"new"(
								<Link
									to="/account/places/new"
									className=" flex w-fit bg-white gap-2 cursor-pointer ease-in-out duration-500 text-primary-500 px-5 hover:scale-110 py-2.5 rounded-full"
								>
									<HousePlus /> Nova acomodação
								</Link>
							)}
					{edit && (
						<Link
							to="/account/places/new"
							className=" flex w-fit bg-white gap-2 cursor-pointer border-red-500 border-2 ease-in-out duration-500 text-red-500 px-5 hover:scale-110 py-2.5 rounded-full"
						>
							<Trash2 /> Deletar acomodação
						</Link>
					)}
				</span>
			</div>

			<div className="h-full">
				{action !== "new" ? <Places places={places} /> : <NewPlace />}
			</div>
		</>
	);
};

export default AccPlaces;
