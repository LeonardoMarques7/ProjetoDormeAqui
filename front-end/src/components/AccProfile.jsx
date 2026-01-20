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
import image from "../assets/image.png";
import Banner from "../assets/banner.jpg";

const AccProfile = () => {
	const { user, setUser } = useUserContext();
	const { state } = useLocation();
	const params = useParams();

	const isEditMode = params.action === "edit";
	const paramId = isEditMode ? params.id : params.action;

	const [profileUser, setProfileUser] = useState(null);
	const [mobile, setIsMobile] = useState(window.innerWidth <= 768);
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
		}),
	);

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				// Se tem paramId, busca o perfil público desse usuário
				// Senão, busca o perfil do usuário logado
				let userId;
				let endpoint;

				if (paramId) {
					// Perfil público de outro usuário
					userId = paramId;
					endpoint = `/users/${userId}`;
				} else if (user?._id) {
					// Perfil do próprio usuário logado
					userId = user._id;
					endpoint = `/users/${userId}`;
				} else {
					// Não tem ID e não está logado - não pode ver perfil
					setReady(true);
					return;
				}

				console.log("Buscando perfil para userId:", userId);
				const { data } = await axios.get(endpoint);

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

				console.log("Buscando places para userId:", userId);

				// Verifica se é o próprio perfil do usuário logado
				const isOwnProfile = user && String(user._id) === String(userId);

				const endpoint = isOwnProfile
					? "/places/owner" // Rota protegida - meus anúncios
					: `/places/user/${userId}`; // Rota pública - anúncios de outro usuário

				console.log("Endpoint usado:", endpoint);
				const { data } = await axios.get(endpoint);
				setPlaces(data);
			} catch (error) {
				console.error("Erro ao buscar anúncios:", error);
				// Se der erro 401, pode ser que a rota requer autenticação
				// mas o usuário não está logado - não é um problema fatal
				if (error.response?.status === 401) {
					console.log(
						"Não autenticado - mostrando perfil público sem anúncios privados",
					);
					setPlaces([]);
				}
			}
		};

		if (ready && profileUser) {
			fetchPlaces();
		}
	}, [paramId, user?._id, ready, profileUser]);

	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth <= 768);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const logout = async () => {
		try {
			const { data } = await axios.post("/users/logout");
			console.log(data);
			setUser(null);
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
			delete axios.defaults.headers.common["Authorization"];

			localStorage.clear();
			sessionStorage.clear();

			console.log(data);
			setUser(null);
			setRedirect(true);
		} catch (error) {
			console.error("Erro ao deletar:", error);
		}
	};

	const isEditingProfile = params.action === "edit";

	if (redirect) return <Navigate to="/" state={{ updated: true }} />;

	// Se não carregou ainda
	if (!ready || !profileUser) {
		return <Loading />; // ou seu componente de loading
	}

	const displayUser = profileUser;
	// Verifica se está visualizando o próprio perfil
	// Só é próprio perfil se o usuário está logado E o ID bate
	const isOwnProfile =
		user && (!paramId || String(paramId) === String(user._id));

	return (
		<>
			{!isEditingProfile ? (
				<>
					<div className="banner__home max-sm:h-[25svh] h-[50svh]  bg-primar-700  w-full relative">
						<img
							src={Banner}
							alt=""
							className="object-cover pointer-events-none h-full w-full  shadow-2xl"
						/>
						<div className="absolute inset-0 bg-gradient-to-b from-primary-500/50 via-primary-500/30 to-transparent"></div>
					</div>

					{/* Container do conteúdo */}
					<div className="container__profile mx-auto w-full lg:max-w-7xl px-8 max-sm:px-3.5 max-sm:mt-0 relative -mt-28">
						<div className="flex flex-col gap-5 max-sm:gap-2 relative mb-10">
							{/* Header do perfil (avatar + botão) */}
							<div className="avatar__btn flex  max-sm:gap-2 gap-5 items-center justify-start relative">
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
								<div className="container__name flex-1 mb-10 text-4xl max-sm:hidden font-bold text-white flex justify-start items-end gap-3">
									{displayUser.name}
									{displayUser.pronouns && (
										<span className="text-lg font-normal text-white">
											{displayUser.pronouns}
										</span>
									)}
								</div>

								{/* Botão de editar - só mostra se for o próprio perfil E estiver logado */}
								{isOwnProfile && (
									<div className="flex items-center mb-10 gap-5 max-sm:hidden text-white">
										<Link
											to="/account/profile/edit"
											className={`group flex cursor-pointer justify-between hover:text-primary-500 hover:bg-white transition-colors items-center gap-2 py-2 px-4 rounded-full`}
										>
											<Pen size={18} />
											<span className="hidden group-hover:inline pl-2">
												Editar perfil
											</span>
										</Link>
										<button
											onClick={logout}
											className="group flex cursor-pointer justify-between hover:text-primary-500 hover:bg-white transition-colors items-center gap-2 py-2 px-4 rounded-full"
										>
											<LogOut size={18} />
											<span className="hidden group-hover:inline pl-2">
												Sair
											</span>
										</button>
									</div>
								)}
							</div>

							{mobile ? (
								<span className="text-sm line-clamp-3 bg-red text-nowrap font-bold truncate flex-col flex justify-start items-start gap-1">
									<h1>{displayUser.name}</h1>
									{displayUser.pronouns && (
										<span className="text-lg font-light text-gray-300">
											{displayUser.pronouns}
										</span>
									)}
								</span>
							) : (
								<></>
							)}

							{/* Informações de contato */}
							<div className="flex flex-wrap max-sm:flex-col max-sm:gap-1 gap-4 text-gray-500 mt-0">
								{displayUser.city && (
									<span className="flex items-center gap-2">
										<MapPin size={18} className="max-sm:hidden" />
										{displayUser.city}
									</span>
								)}
							</div>

							{/* Sobre mim */}
							<div className="profile mt-5">
								<h2 className="text-2xl font-medium mb-2">Sobre mim</h2>
								<span className="flex gap-2 flex-col text-gray-500">
									<span className="flex items-end gap-2 font-bold">
										Anfitrião desde 10/04/2025
									</span>
								</span>
								{displayUser.bio && (
									<div className="text__bio max-w-xl flex flex-col gap-2 leading-relaxed text-gray-600 mt-4">
										{displayUser.bio}
									</div>
								)}
							</div>

							{/* Meus anúncios */}
							<div>
								<h2 className="text-2xl my-5 font-medium">
									{isOwnProfile ? "Meus Anúncios" : "Anúncios"} ({places.length}
									)
								</h2>
								<div className="grid__anuncios grid grid-cols-[repeat(auto-fit,minmax(250px,250px))] gap-8 md:max-w-7xl mx-auto">
									{places.length > 0 ? (
										places.map((item) => (
											<div
												key={item._id}
												className="relative hover:scale-105 transition-all ease-in-out duration-500 hover:saturate-125"
											>
												<Link to={`/places/${item._id}`}>
													<div className="relative flex flex-col gap-2">
														<img
															src={item.photos[0]}
															className="aspect-square object-cover rounded-2xl"
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
										))
									) : (
										<p className="text-gray-500">
											{isOwnProfile
												? "Você ainda não tem anúncios"
												: "Este usuário não tem anúncios públicos"}
										</p>
									)}
								</div>
							</div>
							{isOwnProfile && <DeleteAccountDialog onDelete={handleDelete} />}
						</div>
					</div>
				</>
			) : (
				<>
					{/* Só permite editar se for o próprio perfil */}
					{isOwnProfile ? (
						<>
							<div
								className="bg-primar-700 shadow-2xl mt-20 max-w-7xl mx-auto w-full object-cover bg-center rounded-4xl h-[50svh] relative overflow-hidden"
								style={{
									backgroundImage: `url(${image})`,
								}}
							>
								<div className="absolute inset-0 backdrop-blur-[5px]"></div>
							</div>
							<EditProfile user={user} />
						</>
					) : (
						<Navigate to={`/account/profile/${paramId}`} />
					)}
				</>
			)}
		</>
	);
};

export default AccProfile;
