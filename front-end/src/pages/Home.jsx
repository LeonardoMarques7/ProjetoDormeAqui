import { useEffect, useState } from "react";
import Item from "../components/Item";
import axios from "axios";

const Home = () => {
	const [places, setPlaces] = useState([]);

	useEffect(() => {
		const axiosGet = async () => {
			const { data } = await axios.get("/places");
			setPlaces(data);
		};

		axiosGet();
	}, []);

	return (
		<section>
			<div className="p-8 max-w-7xl mx-auto grid grid-cols-[repeat(auto-fit,_minmax(225px,_1fr))] gap-8">
				{places.map((place) => (
					<Item {...{ place }} key={place._id} />
				))}
			</div>
		</section>
	);
};

export default Home;
