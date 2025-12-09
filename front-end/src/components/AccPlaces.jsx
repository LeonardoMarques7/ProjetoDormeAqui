import { HousePlus, PlusCircle, Trash2 } from "lucide-react";
import { Navigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { use, useEffect, useState } from "react";
import axios from "axios";
import NewPlace from "./NewPlace";
import Places from "./Places";
import "./Places.css";
import { useMoblieContext } from "./contexts/MoblieContext";
import Loading from "./Loading";
import { useUserContext } from "./contexts/UserContext";
import image from "../assets/image.png";

const AccPlaces = () => {
	const { action } = useParams();
	const { moblie } = useMoblieContext();
	const { user, ready } = useUserContext();
	const [login, setLogin] = useState(false);
	const [places, setPlaces] = useState([]);
	const [redirect, setRedirect] = useState(false);
	const [loadingPlaces, setLoadingPlaces] = useState(false);
	const [imagePlace, setImagePlace] = useState("");
	const { id } = useParams();

	const { edit } = useParams();

	useEffect(() => {
		const axiosGet = async () => {
			const { data } = await axios.get("/places/owner");
			setTimeout(() => {
				setPlaces(data);
				setLoadingPlaces(true);
			}, 4500);
		};

		axiosGet();
	}, [action]);

	if (!loadingPlaces) {
		return <Loading />;
	}

	if (redirect) return <Navigate to="/account/places" />;

	return (
		<>
			<div
				className="bg-primar-700 shadow-2xl mt-20 max-w-7xl mx-auto w-full object-cover bg-center rounded-4xl h-[50svh] relative overflow-hidden"
				style={{
					backgroundImage: `url(${image})`,
				}}
			>
				<div className="absolute inset-0 backdrop-blur-[5px]"></div>

				{/* Conteúdo */}
				<div className="relative flex flex-col justify-center items-center h-full gap-4">
					<h1 className="font-bold text-5xl text-white drop-shadow-lg">
						{edit
							? "Editando acomodação"
							: action !== "new"
							? "Meus lugares"
							: "Adicionando acomodação"}
					</h1>
					{edit && (
						<Link
							to="/account/places/new"
							className="flex w-fit bg-white/95 backdrop-blur-md gap-2 cursor-pointer border-red-500 border-2 ease-in-out duration-500 text-red-500 px-5 hover:scale-110 hover:shadow-xl py-2.5 rounded-full"
						>
							<Trash2 /> Deletar acomodação
						</Link>
					)}
				</div>
			</div>
			<div className="h-full">
				{action !== "new" ? <Places places={places} /> : <NewPlace />}
			</div>
			<div className="bg-primary-500 z-100 shadow-2xl shadow-gray-500 p-4 flex justify-center items-center fixed right-5 bottom-5 h-fit w-fit rounded-full">
				<Link
					to="/account/places/new"
					className="group flex justify-center items-center transition-all duration-500 hover:gap-5"
					title="Nova acomodação"
				>
					<HousePlus color="#fff" size={40} />
					<p className="w-0 opacity-0 font-bold text-white uppercase overflow-hidden text-nowrap transition-all duration-500 group-hover:w-48 group-hover:opacity-100">
						Nova acomodação
					</p>
				</Link>
			</div>
		</>
	);
};

export default AccPlaces;
