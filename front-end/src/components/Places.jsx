import React from "react";
import { Link } from "react-router-dom";

const Places = ({ places }) => {
	return (
		<div>
			{places.map((place) => (
				<Link
					to={`/account/places/new/${place._id}`}
					key={place._id}
					className="cursor-pointer flex rounded-2xl bg-primary-100 gap-5 p-5"
				>
					<img
						src={place.photos[0]}
						className="w-40 h-40 aspect-square rounded-xl"
						alt="Foto da acomodação"
					/>
					<div className="flex flex-col items-start gap-2">
						<h2 className="text-2xl font-medium">{place.title}</h2>
						<p className="text-gray-500 text-start overflow-hidden line-clamp-4">
							{place.description}
						</p>
					</div>
				</Link>
			))}
		</div>
	);
};

export default Places;
