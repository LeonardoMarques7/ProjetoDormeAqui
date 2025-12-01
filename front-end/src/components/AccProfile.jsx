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
import Banner from "../assets/banner.png";

const AccProfile = () => {
	const { user, setUser } = useUserContext();
	const { state } = useLocation();
	const params = useParams();

	// Quando a URL é /account/profile/:id, o :id vai para params.action
	// Quando a URL é /account/profile/edit, o "edit" vai para params.action
	// Precisamos verificar qual é qual
	const isEditMode = params.action === "edit";
	const paramId = isEditMode ? params.id : params.action;

	const [profileUser, setProfileUser] = useState(null);
	const [moblie, setIsMoblie] = useState(window.innerWidth <= 768);
	const [redirect, setRedirect] = useState(false);
	const [api, setApi] = useState(null);
	const [current, setCurrent] = useState(0);
	const [count, setCount] = useState(0);
	const [isPlaying, setIsPlaying] = useState(true);
	const [places, setPlaces] = useState([]);
	const [ready, setReady] = useState(false);
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
		const fetchProfile = async () => {
			try {
				// Se tem paramId, usa ele. Senão, usa o ID do usuário logado
				const userId = paramId || user?._id;
				if (!userId) return;

				console.log("Buscando perfil para userId:", userId);
				console.log("paramId:", paramId);
				console.log("user._id:", user?._id);

				const { data } = await axios.get(`/users/${userId}`);

				console.log("Dados recebidos:", data);
				setProfileUser(data);
				setReady(true);
			} catch (error) {
				console.error("Erro ao buscar perfil:", error);
				setReady(true);
			}
		};

		fetchProfile();
	}, [paramId, user?._id, state?.updated]);

	useEffect(() => {
		if (!api) return;

		setCount(api.scrollSnapList().length);
		setCurrent(api.selectedScrollSnap() + 1);

		api.on("select", () => {
			setCurrent(api.selectedScrollSnap() + 1);
		});
	}, [api]);

	useEffect(() => {
		const fetchPlaces = async () => {
			try {
				const userId = paramId || user?._id;

				if (!userId || userId === "false") {
					return;
				}

				console.log("Buscando places para userId:", userId); // Comparação de strings para garantir que o endpoint é montado corretamente

				const isOwnProfile = !paramId || String(paramId) === String(user?._id);
				const endpoint = isOwnProfile
					? "/places/owner"
					: `/places/user/${userId}`; // Endpoint para o perfil de outro usuário

				console.log("Endpoint usado:", endpoint);
				const { data } = await axios.get(endpoint);
				setPlaces(data);
			} catch (error) {
				console.error("Erro ao buscar anúncios:", error);
			}
		};

		if (ready && profileUser) {
			fetchPlaces();
		}
	}, [paramId, user?._id, ready, profileUser]);

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

	// Precisa definir isEditMode antes dos returns condicionais
	const isEditingProfile = params.action === "edit";

	if (!ready) return <Loading />;
	if (redirect) return <Navigate to="/" state={{ updated: true }} />;
	if (!profileUser && !isEditingProfile) return <Loading />;

	const displayUser = profileUser;
	// Verifica se está visualizando o próprio perfil
	const isOwnProfile = !paramId || String(paramId) === String(user?._id);

	return (
		<>
			{!isEditingProfile ? (
				<>
					<div
						className="bg-cover bg-primar-700 xl:max-w-11/12 max-w-7xl mx-auto w-full rounded-b-2xl bg-center h-[50svh] relative overflow-hidden"
						style={{
							backgroundImage: `url(${Banner})`,
							rotate: "10",
						}}
					>
						<div className="absolute inset-0 backdrop-blur-sm bg-gradient-to-b from-primary-500/70 via-primary-700/25 to-primary-900/35"></div>
						{/* Conteúdo */}
					</div>

					{/* Container do conteúdo */}
					<div className="container__profile mx-auto xl:max-w-11/12 w-full lg:max-w-7xl px-8 relative -mt-28">
						<div className="flex flex-col gap-5 relative mb-10">
							{/* Header do perfil (avatar + botão) */}
							<div className="avatar__btn flex gap-5 items-center justify-start relative">
								{/* Avatar sobreposto */}
								<div className="icon__perfil relative w-40 h-40 rounded-full border-8 bg-gradient-to-bl from-primary-200 to-primary-500 shadow-lg flex justify-center items-center text-4xl font-bold text-white">
									{displayUser.photo ? (
										<img
											src={displayUser.photo}
											className="w-full h-full object-cover rounded-full"
											alt={displayUser.name}
										/>
									) : (
										displayUser.name.charAt(0)
									)}
								</div>
								<h1 className="container__name flex-1 mb-10 text-4xl font-bold text-white flex justify-start items-end gap-3">
									{displayUser.name}
									<span className="text-lg font-normal text-white">
										{displayUser.pronouns}
									</span>
								</h1>

								{/* Botão de editar - só mostra se for o próprio perfil */}
								{isOwnProfile && (
									<div className="flex items-center mb-10  gap-5 text-white">
										<Link
											to="/account/profile/edit"
											className={`group flex cursor-pointer  justify-between hover:text-primary-500 hover:bg-white transition-colors items-center gap-2 py-2 px-4 rounded-full`}
										>
											<Pen size={18} />
											<span className="hidden group-hover:inline pl-2">
												Editar perfil
											</span>
										</Link>
										<button
											onClick={logout}
											className=" group flex cursor-pointer  justify-between hover:text-primary-500 hover:bg-white transition-colors items-center gap-2 py-2 px-4 rounded-full"
										>
											<LogOut size={18} />
											<span className="hidden group-hover:inline pl-2">
												Sair
											</span>
										</button>
									</div>
								)}
							</div>

							{moblie ? (
								<span className="text-3xl bg-red text-nowrap font-bold truncate flex-col flex justify-center items-center gap-3">
									<h1>{displayUser.name}</h1>
									<span className="text-lg font-normal text-gray-300">
										Ele/Dele
									</span>
								</span>
							) : (
								<></>
							)}

							{/* Informações de contato */}
							<div className="flex flex-wrap gap-4 text-gray-500 mt-4">
								<span className="flex items-center gap-2">
									<MapPin size={18} /> {displayUser.city}
								</span>
								<span className="flex items-center gap-2">
									<Mail size={18} /> {displayUser.email}
								</span>
								<span className="flex items-center gap-2">
									<Phone size={18} /> {displayUser.phone}
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
									{displayUser.bio}
								</div>
							</div>

							{/* Meus anúncios */}
							<div>
								<h2 className="text-2xl my-5 font-medium">
									{isOwnProfile ? "Meus Anúncios" : "Anúncios"} ({places.length}
									)
								</h2>
								<div className="grid__anuncios  grid grid-cols-[repeat(auto-fit,minmax(250px,250px))] gap-8 md:max-w-7xl xl:max-w-11/12 mx-auto xl:mx-0">
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
							{isOwnProfile && <DeleteAccountDialog onDelete={handleDelete} />}
						</div>
					</div>
				</>
			) : (
				<>
					<div
						className="bg-cover bg-primar-700 max-w-7xl mx-auto w-full rounded-b-2xl bg-center h-[50svh] relative overflow-hidden"
						style={{
							backgroundImage: `url(${Banner})`,
							rotate: "10",
						}}
					>
						<div className="absolute inset-0 backdrop-blur-sm bg-gradient-to-b from-primary-500/70 via-primary-700/25 to-primary-900/35"></div>
						{/* Conteúdo */}
					</div>
					<EditProfile user={user} />
				</>
			)}
		</>
	);
};

export default AccProfile;
