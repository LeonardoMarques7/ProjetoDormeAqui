import { HousePlus, Trash2 } from "lucide-react";
import { Navigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import NewPlace from "@/components/places/NewPlace";
import Places from "@/components/places/Places";
import "@/components/places/Places.css";
import { useMobileContext } from "@/components/contexts/MobileContext";
import { useUserContext } from "@/components/contexts/UserContext";
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
	const { user } = useUserContext();
	const [places, setPlaces] = useState([]);
	const [redirect, setRedirect] = useState(false);
	const [loadingPlaces, setLoadingPlaces] = useState(true);
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
			<div className="flex w-full mx-auto max-w-full max-h-full h-full flex-col gap-8 relative justify-start items-start max-sm:my-0 max-sm:px-3.5">
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

				<div className="flex gap-5 items-start">
					{!action && !mobile && (
						<Tooltip>
							<TooltipTrigger asChild>
								<Link
									// title="Anuncie uma acomodação"
									className="grid gap-2 grid-cols-8 justify-center items-center grid-rows-3 h-50 max-sm:col-span-4 max-sm:row-span-2"
									to="/account/places/new"
								>
									<div className="row-span-4 hover:bg-primary-100/50 col-span-5 justify-center border border-dashed border-primary-900 flex items-center flex-1 text-center h-full w-40 object-cover rounded-2xl">
										<HousePlus size={45} className="text-primary-900" />
									</div>
								</Link>
							</TooltipTrigger>
							<TooltipContent className="bg-primary-900">
								<p>Anuncie uma acomodação</p>
							</TooltipContent>
						</Tooltip>
					)}
					<div className="grid max-w-full relative transition-transform grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-8 lg:max-w-7xl">
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
