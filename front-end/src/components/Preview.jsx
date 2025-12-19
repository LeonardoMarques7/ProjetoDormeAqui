import { useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserContext } from "./contexts/UserContext";

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

import { Button } from "@/components/ui/button";

import photoDefault from "../assets/photoDefault.png";

import {
	AlarmClockCheck,
	Bath,
	Bed,
	CalendarArrowDown,
	CalendarArrowUp,
	ChevronRight,
	Clock,
	Expand,
	HomeIcon,
	ImagePlus,
	MapPin,
	Search,
	Users,
	Users2,
} from "lucide-react";

const Preview = ({ data }) => {
	const lightGalleryRef = useRef(null);
	const [loaded, setLoaded] = useState([]);
	const { user } = useUserContext();

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
		rooms,
		beds,
		bathrooms,
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
		<div className="container__infos mx-auto !max-w-4xl h-full px-2 overflow-y-auto">
			<div className="bg-primary-900  max-sm:p-0 max-sm:shadow-none h-fit mt-5 max-sm:mt-15 py-5 max-sm:bg-transparent max-w-full mx-auto w-full object-cover bg-center rounded-4xl  relative overflow-hidden">
				<div className="bg-white max-sm:shadow-none p-2 max-sm:p-0 relative mx-4 max-sm:mx-0 max-sm:rounded-none rounded-2xl">
					{/* Container do grid principal */}
					<div className="grid relative  grid-cols-4 grid-rows-2 max-sm:grid-cols-3 h-full  max-sm:p-2 gap-2  max-sm:h-[50svh]">
						{/* Imagem principal - ocupa 2 colunas e 2 linhas */}
						<div className="col-span-2 row-span-2 max-sm:col-span-4 max-sm:row-span-2">
							<img
								className="w-full h-full rounded-2xl object-cover  hover:saturate-150 transition-all"
								src={photos[0] || photoDefault}
								alt="Imagem da acomodação"
								onClick={() => handleImageClick(0)}
							/>
						</div>

						{/* Imagem superior direita */}
						<div className="col-span-1 row-span-1 max-sm:col-span-2 ">
							<img
								className="w-full h-full rounded-2xl object-cover  hover:saturate-150 transition-all"
								src={photos[1] || photoDefault}
								alt="Imagem da acomodação"
								onClick={() => handleImageClick(1)}
							/>
						</div>

						{/* Imagem superior direita extrema */}
						<div className="col-span-1 row-span-1 max-sm:col-span-2">
							<img
								className="w-full h-full rounded-2xl object-cover  hover:saturate-150 transition-all"
								src={photos[2] || photoDefault}
								alt="Imagem da acomodação"
								onClick={() => handleImageClick(2)}
							/>
						</div>
						<>
							<div className="col-span-1 row-span-1 max-sm:col-span-4">
								<img
									className="w-full h-full rounded-2xl object-cover  hover:saturate-150 transition-all"
									src={photos[3] || photoDefault}
									alt="Imagem da acomodação"
									onClick={() => handleImageClick(3)}
								/>
							</div>

							<div className="col-span-1 row-span-1">
								<img
									className="w-full h-full rounded-2xl object-cover  hover:saturate-150 transition-all"
									src={photos[4] || photoDefault}
									alt="Imagem da acomodação"
									onClick={() => handleImageClick(4)}
								/>
							</div>
						</>
					</div>
				</div>
			</div>
			{/* Conteúdo da acomodação */}
			<div className="grid grid-cols-1.5 max-sm:gap-5 gap-2 mt-2 max-sm:mx-2 mx-4 ">
				<div className="leading-relaxed px-0 order-1 max-w-full description ">
					<div className="max-sm:py-0  w-full">
						<div className="flex sm:hidden mt-1 max-sm:visible !flex-nowrap items-center !text-xs gap-2 w-full justify-start max-w-auto">
							<div className="flex gap-2 rounded-2xl items-center ">
								<div className="flex items-center gap-2">
									<Users2 size={15} className="max-sm:hidden" />
									<div>{guests} hóspedes</div>
								</div>
							</div>
							<div className="w-1 rounded-full h-1 bg-gray-500"></div>
							<div className="flex gap-2  rounded-2xl items-center ">
								<div className="flex items-center gap-2">
									<HomeIcon size={15} className="max-sm:hidden" />
									{rooms || rooms > 1 ? (
										<p>
											<span>{rooms}</span> quartos
										</p>
									) : (
										<p>
											<span>{rooms}</span> quarto
										</p>
									)}
								</div>
							</div>
							<div className="w-1 rounded-full h-1 bg-gray-500"></div>
							<div className="flex gap-2 rounded-2xl items-center ">
								<div className="flex items-center gap-2">
									<Bed size={15} className="max-sm:hidden" />
									{beds || beds > 1 ? (
										<p>
											<span className="">{beds}</span> camas
										</p>
									) : (
										<p>
											<span className="">{beds}</span> cama
										</p>
									)}
								</div>
							</div>
							<div className="w-1 rounded-full h-1 bg-gray-500"></div>
							<div className="flex gap-2 rounded-2xl items-center ">
								<div className="flex items-center gap-2">
									<Bath size={15} className="max-sm:hidden" />
									{bathrooms || bathrooms > 1 ? (
										<p>
											<span>{bathrooms}</span> banheiros
										</p>
									) : (
										<p className="text-sm">
											<span>{bathrooms}</span> banheiro
										</p>
									)}
								</div>
							</div>
						</div>
						<div className="flex flex-col  gap-2">
							<div className="text-[2rem] max-sm:text-[1.5rem] font-bold text-gray-700 ">
								{title}
							</div>
							<div className="flex items-center max-sm:text-sm text-gray-600 gap-2">
								<MapPin size={13} />
								<span>{city}</span>
							</div>
						</div>
						<div className="flex gap-4  !flex-nowrap items-center max-sm:text-xs! max-sm:gap-2! max-sm:w-fit max-sm:justify-center justify-start mt-4 max-w-auto">
							<div className="flex gap-2 rounded-2xl items-center ">
								<div className="flex items-center gap-2">
									<Users2 size={15} className="max-sm:hidden" />
									<div>{guests} hóspedes</div>
								</div>
							</div>
							<div className="w-1 rounded-full h-1 bg-gray-500"></div>
							<div className="flex gap-2  rounded-2xl items-center ">
								<div className="flex items-center gap-2">
									<HomeIcon size={15} className="max-sm:hidden" />
									{rooms || rooms > 1 ? (
										<p>
											<span>{rooms}</span> quartos
										</p>
									) : (
										<p>
											<span>{rooms}</span> quarto
										</p>
									)}
								</div>
							</div>
							<div className="w-1 rounded-full h-1 bg-gray-500"></div>
							<div className="flex gap-2 rounded-2xl items-center ">
								<div className="flex items-center gap-2">
									<Bed size={15} className="max-sm:hidden" />
									{beds || beds > 1 ? (
										<p>
											<span className="">{beds}</span> camas
										</p>
									) : (
										<p>
											<span className="">{beds}</span> cama
										</p>
									)}
								</div>
							</div>
							<div className="w-1 rounded-full h-1 bg-gray-500"></div>
							<div className="flex gap-2 rounded-2xl items-center ">
								<div className="flex items-center gap-2">
									<Bath size={15} className="max-sm:hidden" />
									{bathrooms || bathrooms > 1 ? (
										<p>
											<span>{bathrooms}</span> banheiros
										</p>
									) : (
										<p className="text-sm">
											<span>{bathrooms}</span> banheiro
										</p>
									)}
								</div>
							</div>
						</div>
					</div>
					<div className="flex gap-2 flex-col mb-5 max-sm:mt-2  ">
						<div className="flex items-center gap-2 w-full">
							<div className="flex items-center group max-sm:w-full  py-5 transition-all w-full ransition-all rounded-2xl  gap-2.5 justify-between ">
								{" "}
								<div className="flex items-center font-normal  gap-2.5">
									<img
										src={user.photo}
										className="w-12 h-12  aspect-square rounded-full object-cover"
										alt="Foto do Usuário"
									/>
									<div className="flex flex-col text-gray-700 ">
										<p className="font-medium">{user.name}</p>
										<small>
											Anfitrião desde{" "}
											<span className="text-primary-600 font-medium">
												10/04/2025
											</span>
										</small>
									</div>
								</div>
								<ChevronRight size={15} className="text-primary-300 mr-1" />
							</div>
						</div>
					</div>
					<div className="border   border-r-0 py-5 mb-5 border-l-0">
						<p
							className=""
							dangerouslySetInnerHTML={{
								__html: md.render(description),
							}}
						></p>
					</div>
					<div className="my-4">
						<p className="sm:text-2xl text-large font-medium">
							O que esse lugar oferece
						</p>
						<div className="flex flex-wrap gap-3 mt-8 max-w-7xl mx-auto">
							{perks.map(
								(perk, index) =>
									perk && (
										<div
											key={index}
											className="flex border-gray-300 border w-fit items-center px-4 py-2 rounded-2xl gap-2.5"
										>
											<Perk perk={perk} />
										</div>
									)
							)}
						</div>
					</div>
					<div className="my-4">
						<p className="sm:text-2xl text-large font-medium">
							Horário e Restrições
						</p>
						<div className="my-2 flex w-full flex-1 max-sm:text-sm items-center gap-5 max-sm:gap-1">
							<div className="flex bg-gray-50 w-full flex-nowrap text-nowrap max-sm:p-3 items-center p-4 rounded-2xl gap-2.5">
								<Clock size={15} color="gray" /> Check-in: {checkin}
							</div>
							<div className="flex bg-gray-50 w-full flex-nowrap text-nowrap items-center max-sm:p-3  p-4  rounded-2xl gap-2.5">
								<AlarmClockCheck size={15} color="gray" />
								Check-out: {checkout}
							</div>
						</div>
					</div>
					<div className="border  border-r-0 border-b-0 py-5 mb-5 border-l-0">
						<p className="sm:text-2xl text-large mb-4 font-medium">
							Informações Extras
						</p>
						<p
							className=""
							dangerouslySetInnerHTML={{
								__html: md.render(extras),
							}}
						></p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Preview;
