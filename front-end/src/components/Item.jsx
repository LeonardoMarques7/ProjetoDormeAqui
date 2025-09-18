import image1 from "../assets/lugares/image__1.jpg";

const Item = () => {
	return (
		<a href="/">
			<div className="flex flex-col gap-2">
				<img
					src={image1}
					alt="Imagem da acomodação"
					className="aspect-square object-cover rounded-2xl"
				/>
				<div className="">
					<h3 className="text-xl font-semibold">Rio de Janeiro</h3>
					<p className="truncate text-gray-600">
						Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quibusdam,
						nihil!
					</p>
				</div>
				<p>
					<span className="font-semibold">R$ 550</span> por noite
				</p>
			</div>
		</a>
	);
};

export default Item;
