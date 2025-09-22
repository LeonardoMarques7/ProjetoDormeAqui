import React from "react";

const Places = ({ places }) => {
	return (
		<div>
			{places.map((place) => (
				<div className="flex rounded-2xl bg-[#f8f8f8] gap-5 p-5">
					<img
						src={place.photos[0]}
						className="w-40 h-40 aspect-square rounded-xl"
						alt="Foto da acomodação"
					/>
					<div className="flex flex-col items-start gap-2">
						<h2 className="text-2xl">{place.title}</h2>
						<p className="text-gray-500 text-start overflow-hidden line-clamp-4">
							{place.description}
						</p>
					</div>
				</div>
			))}
		</div>
	);
};

export default Places;
