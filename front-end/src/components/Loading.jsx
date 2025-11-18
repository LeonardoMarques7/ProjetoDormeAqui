import React, { useEffect } from "react";
import { motion } from "framer-motion";
import ScrollReveal from "scrollreveal";
import {
	Bed,
	Home,
	MapPin,
	Key,
	CornerDownLeft,
	Edit2,
	BedDouble,
	Users,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ProgressSpiner from "@/components/ui/ProgressSpinner";
export default function Loading({ category }) {
	const currentPlaces = [1, 2, 3];

	window.scrollTo({ top: 0, behavior: "smooth" });

	return (
		<>
			{category == "places" && (
				<>
					<div className="bg-primary-500 relative flex flex-col justify-center items-center h-[50svh] ">
						<h2 className="font-bold text-4xl text-white">Meus lugares</h2>
					</div>
					<div className="h-full  mb-50">
						<div className="container__places mx-auto max-w-full max-h-full h-full overflow-x-clip mt-[5svh] flex flex-col gap-50 p-8 lg:max-w-7xl">
							{currentPlaces.map((place, id) => (
								<div
									key={id}
									className="headline item__place flex items-center gap-5 top-[5svh] w-full lg:max-w-7xl"
								>
									<div className="relative w-full flex items-center justify-center">
										<Skeleton className="sr-fade-1 image__place h-100 aspect-video absolute left-0 top-0 rounded-2xl shadow-xl shadow-primary-200/80" />
									</div>
									<CornerDownLeft
										size={50}
										className="relative top-10 icon__place"
									/>
									<div className="flex w-1/2 flex-col items-start gap-4 bg-white/80 p-5 backdrop-blur-sm shadow-xl shadow-primary-200/50 rounded-2xl">
										<div className="flex gap-2 items-center text-gray-500">
											<MapPin size={18} /> <Skeleton className="h-4 w-24" />
										</div>
										<Skeleton className="h-10 w-64" />
										<div className="text-gray-500 text-start overflow-hidden line-clamp-4 space-y-2 w-full">
											<Skeleton className="h-4 w-full" />
											<Skeleton className="h-4 w-full" />
											<Skeleton className="h-4 w-3/4" />
										</div>
										<div className="flex items-center gap-4">
											<div className="flex gap-2 items-center text-gray-500">
												<Users size={18} /> <Skeleton className="h-4 w-8" />
											</div>
											<div className="flex gap-2 items-center text-gray-500">
												<BedDouble size={18} /> <Skeleton className="h-4 w-8" />
											</div>
										</div>
										<div className="item__place__actions flex items-center gap-2 w-full">
											<Skeleton className="cursor-pointer grow w-full rounded-2xl flex-1 h-10" />
											<Skeleton className="edit__btn cursor-pointer justify-center flex items-center grow-0 px-5 gap-4 rounded-2xl h-10 w-28" />
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</>
			)}

			{category == "bookings" && (
				<div className="h-dvh overflow-y-hidden flex gap-5 flex-col bg-primary-500 justify-center items-center">
					<ProgressSpiner />
					<h2 className="text-white text-2xl">Carregando</h2>
				</div>
			)}
		</>
	);
}
