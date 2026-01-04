import { HousePlus, Plus, PlusCircle, PlusSquare, Trash2 } from "lucide-react";
import { Navigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { use, useEffect, useState } from "react";
import axios from "axios";
import NewPlace from "./NewPlace";
import Places from "./Places";
import "./Places.css";
import { useMobileContext } from "./contexts/MobileContext";
import Loading from "./Loading";
import { useUserContext } from "./contexts/UserContext";
import image from "../assets/image.png";
import { Skeleton } from "@/components/ui/skeleton";

const AccPlaces = () => {
	const { action } = useParams();
	const { mobile } = useMobileContext();
	const { user, ready } = useUserContext();
	const [login, setLogin] = useState(false);
	const [places, setPlaces] = useState([]);
	const [redirect, setRedirect] = useState(false);
	const [loadingPlaces, setLoadingPlaces] = useState(true);
	const [imagePlace, setImagePlace] = useState("");
	const { id } = useParams();

	const { edit } = useParams();

	useEffect(() => {
		const axiosGet = async () => {
			const { data } = await axios.get("/places/owner");
			setTimeout(() => {
				setPlaces(data);
				setLoadingPlaces(false);
			}, 50);
		};

		axiosGet();
	}, [action]);

	if (redirect) return <Navigate to="/account/places" />;

	return (
		<>
			<div className="flex w-full mt-10 mx-auto max-w-full max-h-full lg:max-w-7xl h-full flex-col gap-8 relative justify-start items-start max-sm:my-0 max-sm:px-3.5 px-8">
				<div className="mt-20 flex border-l-3 pl-4 justify-between items-center w-full ">
					<span className="text-gray-500 flex-col gap-3 flex text-sm font-light pl-0.5">
						<span className=" text-3xl max-sm:text-xl text-nowrap flex items-end gap-3 text-black">
							{edit
								? "Editando acomodação"
								: action !== "new"
								? "Meus lugares"
								: "Adicionando acomodação"}{" "}
							<span className="text-lg max-sm:text-sm flex items-center gap-3">
								({places.length} Acomodações)
								<Link
									to="/account/places/new"
									className=" text-sm underline max-sm:hidden"
									title="Anuncie seu espaço"
								>
									Anuncie seu espaço
								</Link>
							</span>
						</span>
						Visualize suas acomodações
					</span>

					{edit && (
						<Link
							to="/account/places/new"
							className="flex w-fit bg-white/95 backdrop-blur-md gap-2 cursor-pointer border-red-500 border-2 ease-in-out duration-500 text-red-500 px-5 hover:scale-110 hover:shadow-xl py-2.5 rounded-full"
						>
							<Trash2 /> Deletar acomodação
						</Link>
					)}
				</div>

				<div className="grid mb-10 max-w-full relative transition-transform grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-8 lg:max-w-7xl">
					{loadingPlaces ? (
						<>
							{[...Array(2)].map((_, index) => (
								<div
									key={index}
									className="flex-col bg-white/80 w-[350px] h-fit relative flex-1 flex rounded-3xl gap-5"
								>
									<Skeleton className="aspect-square w-full rounded-none rounded-t-2xl" />
									<div className="space-y-2">
										<Skeleton className="h-5 w-50 mt-1" />
										<Skeleton className="h-4 w-1/4" />
										<div className="mt-2 flex items-center gap-2">
											<Skeleton className="h-5 w-5" />
											<Skeleton className="h-5 w-5" />
											<Skeleton className="h-5 w-5" />
											<Skeleton className="ml-auto h-5 w-15" />
										</div>
									</div>
								</div>
							))}
						</>
					) : action !== "new" ? (
						<Places places={places} />
					) : (
						<NewPlace />
					)}
				</div>
				<div className="bg-primary-500 z-100 shadow-2xl shadow-gray-500 p-4 flex justify-center items-center fixed right-9 bottom-5 h-fit w-fit rounded-full">
					<Link
						to="/account/places/new"
						className="group flex justify-center items-center transition-all duration-500 hover:gap-5"
						title="Nova acomodação"
					>
						<HousePlus color="#fff" fontWeight={"light"} size={40} />
						<p className="w-0 opacity-0 font-light text-white uppercase overflow-hidden text-nowrap transition-all duration-500 group-hover:w-48 group-hover:opacity-100">
							Nova acomodação
						</p>
					</Link>
				</div>
			</div>
		</>
	);
};

export default AccPlaces;
