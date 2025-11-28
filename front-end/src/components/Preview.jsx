import { useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

import MarkdownIt from "markdown-it";
import Perk from "../components/Perk";

import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";
import lgFullscreen from "lightgallery/plugins/fullscreen";
import LightGallery from "lightgallery/react";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import "lightgallery/css/lg-fullscreen.css";

import {
	CalendarArrowDown,
	CalendarArrowUp,
	ImagePlus,
	MapPin,
	Search,
	Users,
} from "lucide-react";

const Preview = ({ data }) => {
	const lightGalleryRef = useRef(null);
	const [loaded, setLoaded] = useState([]);

	const handleImageClick = (index) => {
		if (lightGalleryRef.current) {
			lightGalleryRef.current.openGallery(index);
		}
	};

	const handleShowMoreClick = () => {
		if (lightGalleryRef.current) {
			lightGalleryRef.current.openGallery(0);
		}
	};

	const handleImageLoad = (index) => {
		setLoaded((prev) => [...prev, index]);
	};

	const {
		title,
		city,
		photos,
		description,
		extras,
		perks,
		price,
		checkin,
		checkout,
		guests,
	} = data;

	const md = new MarkdownIt({
		html: false,
		breaks: true,
		linkify: true,
	});
	return (
		<div className="mockup-browser h-fit w-full ">
			<div className="mockup-browser-toolbar pt-4 gap-4">
				<div className=" rounded-2xl w-full text-start px-5 flex py-2.5 items-center gap-5 text-gray-500 border-1">
					<Search size={20} />
					https://preview.com
				</div>
			</div>
			<div className="flex flex-col gap-2 p-4 pb-5">
				<div className="text-2xl font-bold text-start">
					{title ? title : <>Título da acomodação</>}
				</div>
				<div className="flex gap-2">
					<MapPin />
					<span>{city ? city : <>Cidade/País da acomodação</>}</span>
				</div>
				<div className="relative grid grid-cols-[2fr_1fr] grid-rows-2 aspect-[3/2] gap-5  overflow-hidden rounded-2xl transtions hover:opacity-95">
					{Array.from({ length: 3 }).map((_, index) => {
						const photo = photos[index]; // pega a imagem correspondente se existir

						return (
							<div
								key={index}
								className={`relative overflow-hidden ${
									index === 0 ? "row-span-2 h-full" : ""
								} aspect-square w-full `}
							>
								{photo ? (
									<>
										{!loaded.includes(index) && (
											<Skeleton
												className={` ${
													index == 0 ? "hidden" : ""
												} absolute inset-0 w-full h-full`}
											/>
										)}
										<img
											src={photo}
											alt="Imagem da acomodação"
											onLoad={() => handleImageLoad(index)}
											className={`w-full h-full hover:scale-120 transition-all object-cover cursor-pointer duration-500 ${
												loaded.includes(index) ? "opacity-100" : "opacity-0"
											}`}
											onClick={() => handleImageClick(index)}
										/>
									</>
								) : (
									<Skeleton className=" relative w-full h-full" />
								)}
							</div>
						);
					})}

					{/* Caso não tenha fotos, só mostra placeholders */}
					{photos.length === 0 &&
						Array.from({ length: 3 }).map((_, index) => (
							<Skeleton
								key={index}
								className={`${
									index === 0 ? "row-span-2 h-full" : ""
								} aspect-square w-full`}
							/>
						))}
					<span
						className="absolute bottom-2 items-center right-2 flex px-2 py-2 rounded-[10px] gap-2 bg-white/70 hover:scale-105 hover:-translate-x-1 ease-in-out duration-300 hover:bg-primary-300 cursor-pointer"
						onClick={handleShowMoreClick}
					>
						<ImagePlus /> Mostrar mais fotos
					</span>
				</div>
				<LightGallery
					onInit={(detail) => {
						lightGalleryRef.current = detail.instance;
					}}
					speed={500}
					plugins={[lgThumbnail, lgZoom, lgFullscreen]}
					dynamic={true}
					dynamicEl={photos.map((photo) => ({
						src: photo,
						thumb: photo,
						subHtml: `<h4>${title}</h4>`,
					}))}
					closable={true}
					showCloseIcon={true}
					counter={true}
				/>
				<span className="text-start">
					<h2 className="text-xl font-bold text-gray-500">Descrição</h2>
					{description ? (
						<div
							className="prose prose-lg prose-p:text-gray-700 prose-p:leading-relaxed prose-p:my-4  overflow-hidden w-fit"
							dangerouslySetInnerHTML={{ __html: md.render(description) }}
						/>
					) : (
						<>
							<Skeleton className="h-10 w-2/3 mb-5"></Skeleton>
							<Skeleton className="h-20 w-1/2"></Skeleton>
						</>
					)}
				</span>
				<span className="text-start flex flex-col">
					<h2 className="text-xl font-bold text-gray-500">
						Horários e Restrições
					</h2>
					<span className="flex gap-2 my-2">
						<span className="flex gap-2 items-center">
							<CalendarArrowUp className="text-primary-500" size={20} />
							Checki-in: {checkin ? <>{checkin}</> : "A definir"}
						</span>
						<span className="flex gap-2 items-center">
							<CalendarArrowDown color="gray" size={20} />
							Checki-out: {checkout ? <>{checkout}</> : "A definir"}
						</span>
					</span>
					<span className="flex gap-2 items-center">
						<Users color="gray" size={20} />
						Nº máximo de hóspedes: {guests ? <>{guests}</> : "A definir"}
					</span>
				</span>
				<span className="text-start flex flex-col">
					<h2 className="text-xl font-bold text-gray-500">Comodidades</h2>
					{perks.map(
						(perk, index) =>
							perk && (
								<div
									key={index}
									className="flex w-fit items-center gap-2 hover:scale-110 ease-in-out duration-500 transition-all px-3 py-2 rounded-xl border-1 border-gray-300"
								>
									{perk ? <Perk perk={perk} /> : <></>}
								</div>
							)
					)}
				</span>
				<span className="text-start">
					<h2 className="text-xl font-bold text-gray-500">
						Informações Extras
					</h2>
					<div
						className="prose prose-lg prose-p:text-gray-700 prose-p:leading-relaxed prose-p:my-4  overflow-hidden w-fit"
						dangerouslySetInnerHTML={{ __html: md.render(extras) }}
					/>
				</span>
				<span className="text-start flex flex-col">
					<h2 className="text-xl font-bold text-gray-500">Preço</h2>
					<span className=" w-fit mt-2 rounded-xl text-xl font-medium">
						<span className="text-primary-500 font-bold text-2xl">
							{price ? <>R$ {price},00</> : "R$ 0,00"}
						</span>{" "}
						por noite
					</span>
				</span>
			</div>
		</div>
	);
};

export default Preview;
