import React, { useState } from "react";
import photoDefault from "../assets/photoDefault.jpg";
import axios from "axios";
import { Link, Navigate, useParams } from "react-router-dom";
import { useUserContext } from "./contexts/UserContext";
import {
	ArrowLeft,
	ArrowRight,
	Cog,
	EllipsisVertical,
	Globe,
	Heart,
	Loader,
	LogOut,
	Mail,
	MapPin,
	Pen,
	Phone,
	PhoneCall,
	Star,
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
	const [imageErrors, setImageErrors] = useState({});
	const [totalGuestsSatisfied, setTotalGuestsSatisfied] = useState(0);
	const [experienceTime, setExperienceTime] = useState("");

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
		const fetchTotalGuestsSatisfied = async () => {
			let total = 0;
			for (const place of places) {
				try {
					const { data: bookings } = await axios.get(
						`/bookings/place/${place._id}`,
					);
					total += bookings.reduce((sum, booking) => sum + booking.guests, 0);
				} catch (error) {
					console.error(
						"Erro ao buscar bookings para place:",
						place._id,
						error,
					);
				}
			}
			setTotalGuestsSatisfied(total);
		};

		if (places.length > 0) {
			fetchTotalGuestsSatisfied();
		}
	}, [places]);

	useEffect(() => {
		const calculateExperienceTime = () => {
			if (!profileUser?.createdAt) return;

			const createdDate = new Date(profileUser.createdAt);
			const now = new Date();
			const diffTime = Math.abs(now - createdDate);
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

			if (diffDays < 30) {
				setExperienceTime(`${diffDays} dia${diffDays !== 1 ? "s" : ""}`);
			} else if (diffDays < 365) {
				const months = Math.floor(diffDays / 30);
				setExperienceTime(`${months} ${months !== 1 ? "meses" : "mês"}`);
			} else {
				const years = Math.floor(diffDays / 365);
				setExperienceTime(`${years} ano${years !== 1 ? "s" : ""}`);
			}
		};

		if (profileUser) {
			calculateExperienceTime();
		}
	}, [profileUser]);

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

	const nameUser = displayUser.name.split(" ");

	const handleImageError = (index) => {
		setImageErrors((prev) => ({ ...prev, [index]: true }));
	};

	const getImageSrc = (item, index) => {
		if (imageErrors[`${item._id}_${index}`]) {
			return photoDefault;
		}
		return item.photos?.[index];
	};

	return (
		<>
			{!isEditingProfile ? (
				<>
					<img
						className="mt-20 max-w-7xl mx-auto w-full object-cover bg-center rounded-4xl h-[40svh] relative overflow-hidden"
						src={displayUser.banner}
					/>

					{/* Container do conteúdo */}
					<div className="container__profile mx-auto w-full lg:max-w-7xl px-8 max-sm:px-3.5 max-sm:mt-0 relative -mt-35">
						<div className="flex flex-col gap-5 max-sm:gap-2 relative mb-10">
							{/* Header do perfil (avatar + botão) */}
							<div className="avatar__btn flex  max-sm:gap-2 gap-5 items-center justify-start relative">
								{/* Avatar sobreposto */}
								<div className=" relative w-60 h-60 rounded-full border-2 bg-gradient-to-bl from-primary-200 to-primary-500 shadow-lg flex justify-center items-center text-4xl font-bold text-white">
									{displayUser.photo ? (
										<img
											src={displayUser.photo}
											className="w-full h-full object-cover object-center rounded-full"
											alt={displayUser.name}
										/>
									) : (
										displayUser.name.charAt(0)
									)}
								</div>
								<div className="flex absolute gap-2.5 right-0 top-35">
									<Link
										to="/account/profile/edit"
										className={` cursor-pointer px-5 py-2.5 hover:bg-primary-100 rounded-2xl text-end justify-end font-light text-primary-900`}
									>
										Editar perfil
									</Link>
									<span className="cursor-pointer px-5 py-2.5 hover:bg-primary-100 rounded-2xl text-primary-900">
										<Cog />
									</span>
								</div>

								{/* Botão de editar - só mostra se for o próprio perfil E estiver logado */}
							</div>
							<div className="flex gap-0 flex-col">
								<div className="">
									<p className="text-primary-700 uppercase font-mono">
										{displayUser.occupation}
									</p>
								</div>
								<span className="flex text-7xl leading-20 flex-col font-bold">
									<p>{nameUser[0]}</p>
									{nameUser[1]}
								</span>
							</div>
							<div className="flex gap-5 items-center">
								<span className="flex gap-1.5 text-black">
									{[...Array(5)].map((_, index) => (
										<Star fill="black"></Star>
									))}
									<p className="font-bold ml-2 ">4.97</p>
								</span>
								<span className="w-1 h-1 rounded-full bg-primary-500"></span>
								<p className="">7 Avaliações</p>
							</div>
							{displayUser.bio && (
								<div className="text__bio max-w-xl flex flex-col gap-2 leading-relaxed text-gray-600 my-2">
									{displayUser.bio}
								</div>
							)}{" "}
							{/* Informações de contato */}
							<div className="flex flex-wrap max-sm:flex-col max-sm:gap-1 gap-4 text-gray-600 mt-0">
								{displayUser.city && (
									<span className="flex items-center gap-2">
										<MapPin size={18} className="max-sm:hidden" />
										{displayUser.city}
									</span>
								)}
							</div>
							<div className="flex items-center gap-5 my-5 p-0 list-none">
								<span className="flex flex-col gap-2.5">
									<span className="font-bold text-5xl">{places.length}</span>
									<p>Acomodações Exclusivas</p>
								</span>
								<span className="flex flex-col gap-2.5">
									<span className="font-bold text-5xl">
										{totalGuestsSatisfied}
									</span>
									<p>Hóspedes Satisfeitos</p>
								</span>
								<span className="flex flex-col gap-2.5">
									<span className="font-bold text-5xl">{experienceTime}</span>
									<p>De Experiência</p>
								</span>
							</div>
							{/* Meus anúncios */}
							<div>
								<p className="text-primary-500 uppercase font-light">Seleção</p>
								<div className="flex items-center mb-15 justify-between">
									<div className="">
										<p className="text-4xl font-bold">
											Acomodações em Destaque
										</p>
									</div>
									<span className="text-primary-700 cursor-pointer uppercase font-mono">
										Ver tudo
									</span>
								</div>
								<div className="flex flex-col gap-20">
									{places.length > 0 ? (
										places.map((item, index) => (
											<div
												className={`item__projeto rounded-xl relative flex gap-5 ${
													index % 2 === 0
														? "item__left "
														: "item__right flex-row-reverse"
												}`}
												key={item._id}
											>
												<div className="grid gap-2 grid-cols-4 max-sm:col-span-4 max-sm:row-span-2 ">
													<img
														src={getImageSrc(item, 0)}
														onError={() => handleImageError(`${item._id}_0`)}
														className="aspect-square w-80 col-span-2 row-span-2 object-cover rounded-2xl"
														alt={item.title}
													/>
													<img
														src={getImageSrc(item, 1)}
														onError={() => handleImageError(`${item._id}_1`)}
														className="aspect-square w-40 col-span-1 row-span-1 object-cover rounded-2xl"
														alt={item.title}
													/>
													<img
														src={getImageSrc(item, 2)}
														onError={() => handleImageError(`${item._id}_2`)}
														className="aspect-square  col-span-1 row-span-1 w-40 object-cover rounded-2xl"
														alt={item.title}
													/>
													<img
														src={getImageSrc(item, 3)}
														onError={() => handleImageError(`${item._id}_3`)}
														className="aspect-square w-40  col-span-1 row-span-1 object-cover rounded-2xl"
														alt={item.title}
													/>
													<img
														src={getImageSrc(item, 4)}
														onError={() => handleImageError(`${item._id}_4`)}
														className="aspect-square w-40  col-span-1 row-span-1 object-cover rounded-2xl"
														alt={item.title}
													/>
												</div>
												<div className="relative flex flex-col justify-between gap-10">
													<div className="flex flex-col">
														<p className="absolute -top-6 text-primary-700 cursor-pointer uppercase font-light">
															{item.city}
														</p>
														<p className=" font-bold text-3xl text-[#0F172B] text-wrap max-w-md overflow-hidden">
															{item.title}
														</p>
														<span className="flex items-center gap-1">
															<Star
																fill="black"
																stroke="black"
																size={20}
															></Star>
															5.0{" "}
															<span className="w-1 h-1 rounded-full bg-primary-500 mx-2"></span>
															<Heart
																fill="red"
																stroke="red"
																size={20}
																className="mr-2"
															/>
															Favorito
														</span>
													</div>
													<div className="flex items-center justify-between">
														<div className="relative font-bold text-3xl text-[#0F172B]">
															R$ {item.price}
															<span className="absolute font-normal text-sm pl-1 top-4">
																/noite
															</span>
														</div>

														<Link
															className="flex items-center group hover:px-5 hover:bg-primary-100 transition-all rounded-2xl px-5 py-2.5 gap-4"
															to={`/places/${item._id}`}
														>
															Acessar acomodação
															<ArrowRight className="group-hover:translate-x-1 transition-transform" />
														</Link>
													</div>
												</div>
											</div>
										))
									) : (
										<p className="text-gray-500">
											{isOwnProfile
												? "Você ainda não tem anúncios"
												: "Este usuário não tem anúncios públicos"}
										</p>
									)}
									<div className="flex flex-col">
										<p className="text-primary-500 uppercase font-light">
											Testemunhos
										</p>
										<div className="flex items-center mb-15 justify-between">
											<div className="">
												<p className="text-4xl font-bold">O Que Dizem</p>
											</div>
										</div>
									</div>
								</div>
							</div>
							{/* {isOwnProfile && <DeleteAccountDialog onDelete={handleDelete} />} */}
						</div>
					</div>
				</>
			) : (
				<>
					{/* Só permite editar se for o próprio perfil */}
					{isOwnProfile ? (
						<>
							<div className="banner__home max-sm:h-[25svh] h-[50vh]  bg-primar-700  w-full relative">
								<img
									src={displayUser.banner || Banner}
									alt=""
									className="object-cover pointer-events-none h-full w-full  shadow-2xl"
								/>
								<div className="absolute inset-0 bg-gradient-to-b from-primary-500/50 via-primary-500/30 to-transparent"></div>
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
