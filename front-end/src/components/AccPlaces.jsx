import {
	ExternalLink,
	HousePlus,
	Plus,
	PlusCircle,
	PlusSquare,
	Trash2,
} from "lucide-react";
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

import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
	TooltipProvider,
} from "@/components/ui/tooltip";

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
		if (!user) {
			setPlaces([]);
			setLoadingPlaces(false);
			return;
		}

		const axiosGet = async () => {
			const { data } = await axios.get("/places/owner");
			setTimeout(() => {
				setPlaces(data);
				setLoadingPlaces(false);
			}, 50);
		};

		axiosGet();
	}, [action, user?._id]);

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
								{action !== "new" && (
									<>
										{places.length} Acomodações
										<Link
											to="/account/places/new"
											className=" text-sm underline max-sm:hidden"
											title="Anuncie seu espaço"
										>
											Anuncie seu espaço
										</Link>
									</>
								)}
							</span>
						</span>
						{action !== "new" ? (
							<>Visualize suas acomodações</>
						) : (
							<>
								Informe os dados abaixo para começar a receber hóspedes e
								oferecer experiências inesquecíveis.{" "}
							</>
						)}
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
				{places.length === 0 && action !== "new" ? (
					user ? (
						<p className="text-gray-500 text-center py-8">
							Você não possue acomodações.
						</p>
					) : (
						<p className="text-gray-500 text-center py-8">
							Você precisa estar logado para ter informações das acomodações.
						</p>
					)
				) : (
					<></>
				)}
				<div className="flex gap-5">
					<div className="grid mb-10 max-w-full relative transition-transform grid-cols-[repeat(auto-fit,minmax(225px,1fr))] max-sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]  gap-5 lg:max-w-7xl">
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
							<>
								<Tooltip>
									<TooltipTrigger asChild>
										<Link
											// title="Anuncie uma acomodação"
											className="flex flex-col h-full gap-2"
											to="/account/places/new"
										>
											<div className="aspect-square w-full cursor-pointer h-fit hover:bg-primary-100 transition-all rounded-2xl border-dashed border text-primary-300 bg-primary-100/50 text-center text-2xl flex justify-center items-center ">
												<HousePlus size={50} />
											</div>
											<div className=" w-full cursor-pointer h-full hover:bg-primary-100 transition-all rounded-2xl border-dashed border text-primary-300 bg-primary-100/50 text-center uppercase flex justify-center items-center ">
												Anuncie Aqui!
											</div>
										</Link>
									</TooltipTrigger>
									<TooltipContent className="bg-primary-600">
										<p>Anuncie uma acomodação</p>
									</TooltipContent>
								</Tooltip>
								<Places places={places} />
							</>
						) : (
							<NewPlace />
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default AccPlaces;
