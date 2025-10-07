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
		<section className="mb-20">
			<div
				id="Perfil"
				className=" p-8 w-full bg-primary-500 mb-15 relative h-[50svh] text-white flex justify-center items-center text-center"
			>
				<div className="profile  lg:max-w-7xl w-full">
					<div className="card absolute shadow-lg -bottom-20 left-20 bg-gradient-to-bl to-primary-500 from-primary-200 border-8 w-40 h-40 rounded-full flex justify-center items-center text-4xl font-bold">
						L
						<img
							src={verify}
							alt="Simbolo de Verificado"
							className="w-10 absolute bottom-0 right-0 bg-white rounded-full"
						/>
					</div>
					<div className="absolute left-65 bottom-5 text-4xl flex gap-2 items-end font-bold">
						Leonardo Marques
						<span className="flex items-center gap-2 text-lg font-normal">
							Ele/Dele
						</span>
					</div>
					<Link className="hover:bg-white/50 hover:text-primary-700 transition-all ease-in-out duration-500 absolute right-25 bottom-5 border-1 flex items-center w-fit px-5 py-2.5 rounded-md gap-4">
						<Pen /> Editar Perfil
					</Link>
				</div>
			</div>
			<div className="relative w-fit left-65 -top-10 text-gray-500 content__card flex items-center gap-4">
				<span className="flex items-center gap-2">
					<MapPin size={18} /> Sorocaba, SP{" "}
				</span>
				<span className="flex items-center gap-2">
					<Mail size={18} /> leonardo@teste.com
				</span>
				<span className="flex items-center gap-2">
					<Phone size={18} /> (12) 12121-1212
				</span>
			</div>
			<div className="flex flex-col w-fit mb-10">
				<div className="profile relative left-22 top-5 lg:max-w-7xl min-w-full">
					<span className="flex gap-2 flex-col mb-4">
						<span className="flex items-end gap-2">
							<span className="scale-150">🪴</span> Anfitrião desde 10/04/20255
						</span>
					</span>
					<h2 className="text-2xl font-medium mb-1">Sobre mim</h2>
					<div className="text__bio max-w-xl flex flex-col gap-2 leading-relaxed">
						<p className="w-full flex flex-col gap-2 mt-2">
							<strong>E aí! Eu sou o Leonardo 👋</strong>
							<p>
								Sou estudante de Ciência da Computação e adoro transformar
								ideias em lugares incríveis.
							</p>
						</p>
						<p>
							Curto ambientes aconchegantes, boa companhia e um café passado na
							hora ☕. Meu objetivo é fazer você se sentir em casa, mesmo
							estando longe dela.
						</p>
					</div>
				</div>
				<div className="profile relative left-22 top-5 lg:max-w-7xl min-w-full">
					<h2 className="text-2xl my-5 font-medium ">
						Meus Anúncios ({places.length})
					</h2>
					<div className="mx-auto grid max-w-full pr-22 grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8 lg:max-w-7xl">
						{places.map((item, idx) => (
							<div className="relative hover:scale-105 transition-all ease-in-out duration-500 hover:saturate-125 not-hover:grayscale-25">
								<Link to={`/places/${item._id}`}>
									<img
										src={item.photos[0]}
										className=" w-300 h-60 object-cover !z-9 rounded-2xl before:rounded-2xl after:rounded-2xl"
										alt=""
									/>

									<div className="absolute rounded-2xl inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
									<div className="absolute bottom-2.5 flex gap-2  left-4 flex-col ">
										<p className="  text-white font-bold truncate w-85 text-nowrap">
											{item.title}
										</p>
										<strong className="w-fit rounded-full bg-primary-500 text-white px-2.5 py-1">
											R$ {item.price}/noite
										</strong>
									</div>
								</Link>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
};

export default AccProfile;
