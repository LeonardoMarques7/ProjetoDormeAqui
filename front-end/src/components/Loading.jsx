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
export default function Loading({ category }) {
	const currentPlaces = [1, 2, 3, 4];

	return (
		category == "places" && (
			<>
				<div className="bg-primary-500 relative flex flex-col justify-center items-center h-[50svh] ">
					<h2 className="font-bold text-4xl text-white">Meus lugares</h2>
				</div>
				<div className="container__places mx-auto max-w-full max-h-full h-full overflow-x-clip  flex flex-col gap-50 p-8 lg:max-w-7xl">
					{currentPlaces.map((place, id) => (
						<div
							id={id}
							className="headline item__place flex items-center gap-5 top-[5svh] w-full lg:max-w-7xl"
						>
							<div className="relative h-fit w-full flex items-center justify-center">
								<Skeleton className="sr-fade-1 image__place h-100 aspect-video relative left-0 top-0 object-cover rounded-2xl shadow-xl shadow-primary-200/80" />
							</div>
							<CornerDownLeft
								size={50}
								className="relative top-10 icon__place"
							/>
							<Skeleton className="flex w-fit flex-col items-start gap-4 bg-white/80 p-5 backdrop-blur-sm shadow-xl shadow-primary-200/50 rounded-2xl">
								<div className="flex gap-2 items-center text-gray-500">
									<MapPin size={18} /> Cidade/Estado da acomodação
								</div>
								<Skeleton className="text-4xl font-bold w-full">
									Título da acomodação
								</Skeleton>
								<Skeleton className="text-gray-500 text-start overflow-hidden line-clamp-4">
									Lorem ipsum dolor sit, amet consectetur adipisicing elit.
									Architecto blanditiis dolore laborum ipsa praesentium sequi
									voluptas odit, eligendi iste libero. Minus repudiandae cum
									unde quae odit? Id cum accusamus repellat.
								</Skeleton>
								<div className="flex items-center gap-4">
									<div className="flex gap-2 items-center text-gray-500">
										<Users size={18} /> 2
									</div>
									<div className="flex gap-2 items-center text-gray-500">
										<BedDouble size={18} /> 2
									</div>
								</div>
								<div className="item__place__actions flex items-center gap-2 w-full">
									<a className="cursor-pointer hover:bg-primary-600 ease-in-out grow duration-500 w-full bg-primary-500 text-white rounded-2xl flex-1 text-center py-2.5">
										Ver mais
									</a>
									<a className="edit__btn cursor-pointer justify-center flex items-center grow-0 px-5 hover:bg-gray-600 ease-in-out duration-500 gap-4 bg-gray-500 text-white rounded-2xl text-center py-2.5">
										<Edit2 size={18} />
										Editar
									</a>
								</div>
							</Skeleton>
						</div>
					))}
				</div>
			</>
		)
	);
}
