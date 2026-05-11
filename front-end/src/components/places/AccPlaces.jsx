import { Navigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import NewPlace from "@/components/places/NewPlace";
import Places from "@/components/places/Places";
import DeletePlaceDialog from "@/components/places/DeletePlaceDialog";
import "@/components/places/Places.css";
import { useUserContext } from "@/components/contexts/UserContext";
import { Skeleton } from "@/components/ui/skeleton";

const AccPlaces = () => {
	const { action, id } = useParams();
	const { user } = useUserContext();
	const [places, setPlaces] = useState([]);
	const [redirect, setRedirect] = useState(false);
	const [loadingPlaces, setLoadingPlaces] = useState(true);
	const [showDeletePlaceDialog, setShowDeletePlaceDialog] = useState(false);
	const [selectedPlace, setSelectedPlace] = useState(null);

	const isWizardRoute = action === "new" || action === "edit";
	const isEditMode = action === "edit" && Boolean(id);

	useEffect(() => {
		if (!user) {
			setPlaces([]);
			setLoadingPlaces(false);
			return;
		}

		const fetchPlaces = async () => {
			const { data } = await axios.get("/places/owner");
			setTimeout(() => {
				setPlaces(data);
				setLoadingPlaces(false);
			}, 50);
		};

		fetchPlaces();
	}, [action, user?._id]);

	useEffect(() => {
		if (action === "r" && id && user && places.length > 0) {
			const place = places.find((item) => String(item._id) === String(id));
			if (place) {
				setSelectedPlace(place);
				setShowDeletePlaceDialog(true);
			}
		}
	}, [action, id, user, places]);

	const handleDeletePlace = (place) => {
		setSelectedPlace(place);
		setShowDeletePlaceDialog(true);
	};

	const handleConfirmDelete = async () => {
		if (!selectedPlace) return;

		try {
			await axios.delete(`/places/${selectedPlace._id}`);
			setShowDeletePlaceDialog(false);
			setSelectedPlace(null);
			setRedirect(true);
		} catch (error) {
			console.error("Erro ao deletar acomodação:", error);
			setShowDeletePlaceDialog(false);
			setSelectedPlace(null);
		}
	};

	if (redirect) return <Navigate to="/account/places" />;

	return (
		<>
			<div className="relative mx-auto flex h-full max-h-full w-full flex-col items-start justify-start gap-8 md:max-w-7xl md:px-5 max-sm:my-0 max-sm:max-w-full max-sm:px-3.5">
				<div className="flex w-full items-center justify-between border-l-3 pl-4">
					<span className="flex flex-col gap-3 pl-0.5 text-sm font-light text-gray-500">
						<span className="flex items-end gap-3 text-nowrap text-3xl text-black max-sm:text-xl">
							<span className="text-3xl text-black max-sm:text-xl">
								{isEditMode
									? "Editar acomodação"
									: action === "new"
										? "Nova acomodação"
										: "Meus lugares"}{" "}
								{!isWizardRoute && (
									<span className="text-sm text-gray-500">({places.length})</span>
								)}
							</span>
							<span className="flex items-center gap-3 text-lg max-sm:text-sm">
								{!isWizardRoute && (
									<Link
										to="/account/places/new"
										className="text-sm underline max-sm:hidden"
										title="Anuncie seu espaço"
									>
										Anuncie seu espaço
									</Link>
								)}
							</span>
						</span>
					</span>
				</div>

				{places.length === 0 && !isWizardRoute ? (
					user ? (
						<p className="py-8 text-center text-gray-500">
							Você não possui acomodações.
						</p>
					) : (
						<p className="py-8 text-center text-gray-500">
							Você precisa estar logado para ver suas acomodações.
						</p>
					)
				) : null}

				{isWizardRoute ? (
					<div className="w-full">
						<NewPlace />
					</div>
				) : (
					<div className="relative grid max-w-full transition-transform gap-8 lg:max-w-7xl grid-cols-[repeat(auto-fit,minmax(400px,1fr))] max-sm:grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
						{loadingPlaces ? (
						<div className="relative grid max-w-full transition-transform gap-8 lg:max-w-7xl grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
							{[...Array(2)].map((_, index) => (
								<div
									key={index}
									className="relative flex h-fit w-[350px] flex-1 flex-col gap-5 rounded-3xl bg-white/80"
								>
									<Skeleton className="aspect-square w-full rounded-none rounded-t-2xl" />
									<div className="space-y-2">
										<Skeleton className="mt-1 h-5 w-50" />
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
						</div>
						) : (
							<Places places={places} onDelete={handleDeletePlace} />
						)}
					</div>
				)}
			</div>

			<DeletePlaceDialog
				open={showDeletePlaceDialog}
				onOpenChange={setShowDeletePlaceDialog}
				onDelete={handleConfirmDelete}
				placeName={selectedPlace?.title}
			/>
		</>
	);
};

export default AccPlaces;
