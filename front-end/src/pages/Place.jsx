import axios from "axios";
import { Expand, ImagePlus, LocateIcon, MapPin } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Place = () => {
	const { id } = useParams();
	const [place, setPlace] = useState(null);
	useEffect(() => {
		if (id) {
			const axiosGet = async () => {
				const { data } = await axios.get(`/places/${id}`);

				console.log(data);
				setPlace(data);
			};

			axiosGet();
		}
	}, [id]);

	if (!place) return <></>;
	return (
		<section>
			<div className="p-8 max-w-7xl mx-auto grid grid-cols-[repeat(auto-fit,_minmax(225px,_1fr))] gap-8">
				<div className="flex flex-col gap-2">
					<div className="text-2xl font-bold">{place.title}</div>
					<div className="flex gap-2">
						<MapPin />
						<span>{place.city}</span>
					</div>
					<div className="relative grid grid-cols-[2fr_1fr] grid-rows-2 aspect-[3/2] gap-5 overflow-hidden rounded-2xl transtions hover:opacity-95 cursor-pointer">
						{place.photos
							.filter((photo, index) => index < 3)
							.map((photo, index) => (
								<img
									className={`${
										index === 0 ? "row-span-2 h-full" : ""
									} aspect-square w-full object-cover`}
									src={photo}
									alt="Imagem da acomodação"
								/>
							))}
						<span className="absolute bottom-2 items-center right-2 flex px-2 py-2 rounded-[10px] gap-2 bg-white/70 hover:scale-105 hover:-translate-x-1 ease-in-out duration-300 hover:bg-primary-300">
							<ImagePlus /> Mostrar mais fotos
						</span>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Place;
