import { BedDouble, CornerDownLeft, MapPin, Users } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import "./Places.css";

const Places = ({ places }) => {
	return (
		<div className="container__places mx-auto max-w-full relative top-5 max-h-full flex flex-col gap-50 p-8 lg:max-w-7xl">
			{places.map((place) => (
				<div
					key={place._id}
					className="item__place flex items-center gap-5 top-[5svh] w-full lg:max-w-7xl  "
				>
					<div className="relative w-full flex items-center justify-center">
						<img
							src={place.photos[0]}
							className="image__place h-100 aspect-video absolute left-0 top-0 object-cover rounded-2xl shadow-xl shadow-primary-200/80"
							alt="Foto da acomodação"
						/>
					</div>
					<CornerDownLeft size={50} className="relative top-10 icon__place" />
					<div className="flex w-fit flex-col items-start gap-4 bg-white/80  p-5  backdrop-blur-sm shadow-xl shadow-primary-200/50 rounded-2xl">
						<div className="flex gap-2 items-center text-gray-500">
							<MapPin size={18} /> {place.city}
						</div>
						<h2 className="text-4xl font-bold">{place.title}</h2>
						<p className="text-gray-500 text-start overflow-hidden line-clamp-4">
							{place.description}
						</p>
						<div className="flex items-center gap-4">
							<div className="flex gap-2 items-center text-gray-500">
								<Users size={18} /> {place.guests}
							</div>
							<div className="flex gap-2 items-center text-gray-500">
								<BedDouble size={18} /> 2
							</div>
						</div>
						<Link
							to={`/account/places/new/${place._id}`}
							className="cursor-pointer bg-primary-500 text-white rounded-2xl w-full text-center py-2.5"
						>
							Ver mais
						</Link>
					</div>
				</div>
			))}
		</div>
	);
};

export default Places;
