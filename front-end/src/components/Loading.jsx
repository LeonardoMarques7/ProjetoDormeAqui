import ProgressSpiner from "@/components/ui/ProgressSpinner";
import Banner from "../assets/image.png";

export default function Loading() {
	window.scrollTo({ top: 0, behavior: "smooth" });

	return (
		<>
			<div
				className="absolute flex justify-center items-center bg-cover mb-10 bg-primar-700  mx-auto w-full rounded-b-2xl h-dvh bg-center z-99 overflow-hidden"
				style={{
					backgroundImage: `url(${Banner})`,
					rotate: "10",
				}}
			>
				<div className="absolute inset-0 backdrop-blur-[5px]"></div>
			</div>
			<div className="absolute w-full z-100 text-white	 flex flex-col h-dvh  justify-center items-center">
				<ProgressSpiner />
				<h2 className="text-primay-500 text-2xl">Carregando</h2>
			</div>
		</>
	);
}
