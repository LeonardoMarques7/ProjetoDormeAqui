import { Link } from "react-router-dom";
import image1 from "../assets/lugares/image__1.jpg";
import { Skeleton } from "@mantine/core";

const Item = ({ place = null, placeHolder }) => {
	return (
		<>
			{placeHolder ? (
				<div className="flex flex-col gap-2 max-w-[350px]">
					<Skeleton className="aspect-square w-full rounded-2xl" />
					<div className="space-y-2">
						<Skeleton className="h-7 w-3/4" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-5/6" />
					</div>
					<Skeleton className="h-5 w-32" />
				</div>
			) : (
				<Link to={`/places/${place._id}`}>
					<div className="flex flex-col gap-2 max-w-[350px]">
						<img
							src={place.photos[0]}
							alt="Imagem da acomodação"
							className="aspect-square object-cover rounded-2xl"
						/>
						<div className="">
							<h3 className="text-xl font-semibold">{place.city}</h3>
							<p className="line-clamp-2 text-gray-600">{place.description}</p>
						</div>
						<p>
							<span className="font-semibold">{place.price}</span> por noite
						</p>
					</div>
				</Link>
			)}
		</>
	);
};

export default Item;
