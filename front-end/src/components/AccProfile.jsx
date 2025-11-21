import React, { useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";
import { Link, Navigate, useParams } from "react-router-dom";
import { useUserContext } from "./contexts/UserContext";
import {
	Cog,
	EllipsisVertical,
	Globe,
	Loader,
	LogOut,
	Mail,
	MapPin,
	Pen,
	Phone,
	PhoneCall,
	Sunrise,
	Trash2,
} from "lucide-react";
import verify from "../assets/verify.png";
import "./AccProfile.css";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import { useEffect } from "react";
import DeleteAccountDialog from "@/components/DeleteAccountDialog";
import EditProfile from "./EditProfile";
import { LoadingOverlay } from "@mantine/core";
import Loading from "./Loading";
import { useTimeout } from "@mantine/hooks";
import { useLocation } from "react-router-dom";

const AccProfile = () => {
	const { user, setUser } = useUserContext();
	const { state } = useLocation();
	const [id, setId] = useState(user ? user.id || user._id : null);
	const { action } = useParams();
	const [userID, setUserId] = useState([]);
	const [moblie, setIsMoblie] = useState(window.innerWidth <= 768);
	const [redirect, setRedirect] = useState(false);
	const [api, setApi] = useState(null);
	const [current, setCurrent] = useState(0);
	const [count, setCount] = useState(0);
	const [isPlaying, setIsPlaying] = useState(true);
	const [places, setPlaces] = useState([]);
	const [ready, setReady] = useState();
	const [onDelete, setOnDelete] = useState(false);
	const [initialValues, setInitialValues] = useState(null);

	const plugin = useRef(
		Autoplay({
			delay: 20000,
			stopOnInteraction: false,
			stopOnMouseEnter: false,
		})
	);

	useEffect(() => {
		if (user?._id) {
			const axiosGet = async () => {
				const { data } = await axios.get(`/users/${user._id}`);

				setUser(data);
				setReady(true);
			};

			axiosGet();
		}
	}, [state?.updated]);

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
	}, []); // só executa uma vez no mount

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

	const handleDelete = async () => {
		try {
			const { data } = await axios.delete(`/users/${user._id}`);
			console.log("Conta deletada!", data);
			setRedirect(true); // redireciona após excluir
		} catch (error) {
			console.error("Erro ao deletar:", error);
		}
	};

	if (!ready) return <Loading />;
	if (redirect) return <Navigate to="/" />;

	return (
		<>
			{action !== "edit" ? (
				<>
					<div
						id="Perfil"
						className="w-full bg-primary-500 relative h-[40svh] text-white flex flex-col justify-end"
					>
						{/* Nome e pronome dentro do mesmo container centralizado */}
						{!moblie ? (
							<div className="mx-auto lg:max-w-7xl w-full px-8 pb-5">
								<h1 className="container__name ml-45 text-4xl font-bold flex justify-start items-end gap-3">
									{user.name}
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
						<div className="flex flex-col gap-5 relative mb-10">
							{/* Header do perfil (avatar + botão) */}
							<div className="avatar__btn flex items-center justify-between relative">
								{/* Avatar sobreposto */}
								<div className="icon__perfil relative w-40 h-40 rounded-full border-8 bg-gradient-to-bl from-primary-200 to-primary-500 shadow-lg flex justify-center items-center text-4xl font-bold text-white">
									{user.photo ? (
										<img
											src={user.photo}
											className="w-full h-full object-cover rounded-full"
										></img>
									) : (
										user.name.charAt(0)
									)}
									<img
										src={verify}
										alt="Verificado"
										className="w-10 absolute bottom-0 right-0 bg-white rounded-full"
									/>
								</div>

								{/* Botão de editar */}
								<div>
									<DropdownMenu>
										<DropdownMenuTrigger
											className={`outline-none text-white cursor-pointer hover:text-gray-100 mb-5`}
										>
											<EllipsisVertical />
										</DropdownMenuTrigger>

										<DropdownMenuContent
											align="end"
											className="p-2 mt-5 bg-white text-gray-500 ounded-xl shadow-xl flex flex-col gap-2"
										>
											{/* Perfil */}
											<p className="text-sm">Configurações</p>

											<DropdownMenuSeparator />

											<Link
												to="/account/profile/edit"
												className={`flex group justify-between hover:bg-gray-100 transition-colors items-center gap-2 px-4 py-2 rounded-xl`}
											>
												Editar Perfil
											</Link>
											<button
												onClick={logout}
												className="flex group justify-between hover:bg-gray-100 transition-colors items-center gap-2 px-4 py-2 rounded-xl"
											>
												Sair
											</button>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
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
									<MapPin size={18} /> {user.city}
								</span>
								<span className="flex items-center gap-2">
									<Mail size={18} /> {user.email}
								</span>
								<span className="flex items-center gap-2">
									<Phone size={18} /> {user.phone}
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
									{user.bio}
								</div>
							</div>

							{/* Meus anúncios */}
							<div>
								<h2 className="text-2xl my-5 font-medium">
									Meus Anúncios ({places.length})
								</h2>
								<div className="grid__anuncios grid grid-cols-[repeat(auto-fit,minmax(250px,250px))] gap-8 md:max-w-7xl mx-auto">
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
							<DeleteAccountDialog onDelete={handleDelete} />
						</div>
					</div>
				</>
			) : (
				<>
					<div
						id="Perfil"
						className="w-full bg-primary-500 relative h-[40svh] text-white flex flex-col justify-end items-start"
					>
						<h1 className="header__places flex items-center max-w-dvw font-bold  text-4xl px-8 lg:max-w-7xl mb-10 mx-auto w-full justify-between">
							Editando perfil
						</h1>
					</div>
					<EditProfile user={user} />
				</>
			)}
		</>
	);
};

export default AccProfile;
