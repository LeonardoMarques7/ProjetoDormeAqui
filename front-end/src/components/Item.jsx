import image1 from "../assets/lugares/image__1.jpg";

const Item = ({ place }) => {
	return (
		<a href="/">
			<div className="flex flex-col gap-2">
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
		</a>
	);
};

export default Item;
