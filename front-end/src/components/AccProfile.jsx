import React, { useState } from "react";
import axios from "axios";
import { Link, Navigate, useParams } from "react-router-dom";
import { useUserContext } from "./contexts/UserContext";
import {
	Globe,
	Mail,
	MapPin,
	Pen,
	Phone,
	PhoneCall,
	Sunrise,
} from "lucide-react";
import verify from "../assets/verify.png";
import "./AccProfile.css";
import Autoplay from "embla-carousel-autoplay";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { Progress } from "@/components/ui/progress"; // Importe o componente Progress do shadcn/ui
import { Button } from "@/components/ui/button"; // Importe o componente Button do shadcn/ui
import { Play, Pause } from "lucide-react"; // Importe os ícones de play e pause
import { useRef } from "react";
import { useEffect } from "react";

const AccProfile = () => {
	const { user, setUser } = useUserContext();
	const { action } = useParams();
	const [moblie, setIsMoblie] = useState(window.innerWidth <= 768);
	const [redirect, setRedirect] = useState(false);
	const [api, setApi] = useState(null);
	const [current, setCurrent] = useState(0);
	const [count, setCount] = useState(0);
	const [isPlaying, setIsPlaying] = useState(true);
	const [places, setPlaces] = useState([]);
	const plugin = useRef(
		Autoplay({
			delay: 20000,
			stopOnInteraction: false,
			stopOnMouseEnter: false,
		})
	);

	useEffect(() => {
		if (!api) return;

		setCount(api.scrollSnapList().length);
		setCurrent(api.selectedScrollSnap() + 1);

		api.on("select", () => {
			setCurrent(api.selectedScrollSnap() + 1);
		});
	}, [api]);

	useEffect(() => {
		const axiosGet = async () => {
			const { data } = await axios.get("/places/owner");
			setPlaces(data);
		};
		axiosGet();
	}, [action]);

	useEffect(() => {
		const handleResize = () => setIsMoblie(window.innerWidth <= 768);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const logout = async () => {
		try {
			const { data } = await axios.post("/users/logout");
			console.log(data);
			setUser(null);
			setRedirect(true);
		} catch (error) {
			alert(JSON.stringify(error));
		}
	};

	const toggleAutoplay = () => {
		if (!api) return;

		if (isPlaying) {
			plugin.current.stop();
		} else {
			plugin.current.play();
		}
		setIsPlaying(!isPlaying);
	};

	if (redirect) return <Navigate to="/" />;

	if (!user) return null;

	return (
		<>
			{/* Banner — apenas nome e pronome */}
			<div
				id="Perfil"
				className="w-full bg-primary-500 relative h-[40svh] text-white flex flex-col justify-end"
			>
				{/* Nome e pronome dentro do mesmo container centralizado */}
				{!moblie ? (
					<div className="mx-auto lg:max-w-7xl w-full px-8 pb-5">
						<h1 className="container__name ml-45 text-4xl font-bold flex justify-start items-end gap-3">
							Leonardo Marques
							<span className="text-lg font-normal text-gray-300">
								Ele/Dele
							</span>
						</h1>
					</div>
				) : (
					<></>
				)}
			</div>

			{/* Container do conteúdo */}
			<div className="container__profile mx-auto w-full lg:max-w-7xl px-8 relative -mt-28">
				<div className="flex flex-col gap-5 relative">
					{/* Header do perfil (avatar + botão) */}
					<div className="avatar__btn flex items-center justify-between relative">
						{/* Avatar sobreposto */}
						<div className="icon__perfil relative w-40 h-40 rounded-full border-8 bg-gradient-to-bl from-primary-200 to-primary-500 shadow-lg flex justify-center items-center text-4xl font-bold text-white">
							L
							<img
								src={verify}
								alt="Verificado"
								className="w-10 absolute bottom-0 right-0 bg-white rounded-full"
							/>
						</div>

						{/* Botão de editar */}
						<Link
							className={`hover:bg-white/50 ${
								!moblie ? "mb-15" : "hidden"
							} text-white hover:text-primary-700 transition-all ease-in-out duration-500 border border-white flex items-center px-5 py-2.5 rounded-md gap-3 mt-4`}
						>
							<Pen /> Editar Perfil
						</Link>
					</div>

					{moblie ? (
						<span className="text-3xl bg-red text-nowrap font-bold truncate flex-col flex justify-center items-center gap-3">
							<h1>Leonardo Marques</h1>
							<span className="text-lg font-normal text-gray-300">
								Ele/Dele
							</span>
						</span>
					) : (
						<></>
					)}

					{/* Informações de contato */}
					<div className="flex flex-wrap gap-4 ${} text-gray-500 mt-4">
						<span className="flex items-center gap-2">
							<MapPin size={18} /> Sorocaba, SP
						</span>
						<span className="flex items-center gap-2">
							<Mail size={18} /> leonardo@teste.com
						</span>
						<span className="flex items-center gap-2">
							<Phone size={18} /> (12) 12121-1212
						</span>
					</div>

					{/* Sobre mim */}
					<div className="profile mt-5">
						<h2 className="text-2xl font-medium mb-2">Sobre mim</h2>
						<span className="flex gap-2 flex-col text-gray-500">
							<span className="flex items-end gap-2 font-bold">
								Anfitrião desde 10/04/2025
							</span>
						</span>
						<div className="text__bio max-w-xl flex flex-col gap-2 leading-relaxed text-gray-600 mt-4">
							<p className="w-full flex flex-col gap-2">
								<strong>E aí! Eu sou o Leonardo 👋</strong>
								<span>
									Sou estudante de Ciência da Computação e adoro transformar
									ideias em lugares incríveis.
								</span>
							</p>
							<p>
								Curto ambientes aconchegantes, boa companhia e um café passado
								na hora ☕. Meu objetivo é fazer você se sentir em casa, mesmo
								estando longe dela.
							</p>
						</div>
					</div>

					{/* Meus anúncios */}
					<div>
						<h2 className="text-2xl my-5 font-medium">
							Meus Anúncios ({places.length})
						</h2>
						<div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8 md:max-w-7xl mx-auto">
							{places.map((item) => (
								<div
									key={item._id}
									className="relative hover:scale-105 transition-all ease-in-out duration-500 hover:saturate-125"
								>
									<Link to={`/places/${item._id}`}>
										<div className="relative flex flex-col gap-2">
											<img
												src={item.photos[0]}
												className=" aspect-square object-cover rounded-2xl"
												alt={item.title}
											/>

											<div className="">
												<p className="text-gray-700 font-normal overflow-hidden">
													{item.title}
												</p>
												<strong className="w-fit rounded-full text-black">
													R$ {item.price}/noite
												</strong>
											</div>
										</div>
									</Link>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default AccProfile;
