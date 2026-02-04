import { useState, useMemo } from "react";
import photoDefault from "@/assets/photoDefault.jpg";
import userDefault from "@/assets/user__default.png";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select } from "@mantine/core";
import axios from "axios";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useUserContext } from "@/components/contexts/UserContext";
import {
	ArrowRight,
	Heart,
	MapPin,
	Star,
	ChevronRight,
	Ellipsis,
	Filter,
} from "lucide-react";

import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
	TooltipProvider,
} from "@/components/ui/tooltip";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";

import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
import { useEffect } from "react";
import DeleteAccountDialog from "@/components/auth/DeleteAccountDialog";
import EditProfile from "@/components/profile/EditProfile";
import { useLocation } from "react-router-dom";
import Banner from "@/assets/banner.jpg";
import bannerDefault from "@/assets/banner__default2.jpg";

const AccProfile = () => {
	const { user, setUser, ready: userContextReady } = useUserContext();
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
	const [places, setPlaces] = useState([]);
	const [ready, setReady] = useState(false);
	const [imageErrors, setImageErrors] = useState({});
	const [totalGuestsSatisfied, setTotalGuestsSatisfied] = useState(0);
	const [experienceTime, setExperienceTime] = useState("");
	const [reviews, setReviews] = useState([]);
	const [averageRating, setAverageRating] = useState(0);
	const [totalReviews, setTotalReviews] = useState(0);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [sortBy, setSortBy] = useState("recent");
	const [ratingFilter, setRatingFilter] = useState("all");
	const [commentFilter, setCommentFilter] = useState("all");
	const [sheetRating, setSheetRating] = useState(0);
	const [sheetOpen, setSheetOpen] = useState(false);
	const [sortByTemp, setSortByTemp] = useState("recent");
	const [tempRating, setTempRating] = useState(0);
	const [tempHoverRating, setTempHoverRating] = useState(0);
	const [tempCommentFilter, setTempCommentFilter] = useState("all");

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
		const fetchReviews = async () => {
			let allReviews = [];
			for (const place of places) {
				try {
					const { data: placeReviews } = await axios.get(
						`/reviews/place/${place._id}`,
					);
					allReviews = [...allReviews, ...placeReviews];
				} catch (error) {
					console.error("Erro ao buscar reviews para place:", place._id, error);
				}
			}
			setReviews(allReviews);
		};

		if (places.length > 0) {
			fetchReviews();
		}
	}, [places]);

	useEffect(() => {
		const calculateAverageRating = () => {
			if (reviews.length === 0) {
				setAverageRating(0);
				setTotalReviews(0);
				return;
			}

			const totalRating = reviews.reduce(
				(sum, review) => sum + review.rating,
				0,
			);
			const average = totalRating / reviews.length;

			setAverageRating(average);
			setTotalReviews(reviews.length);
		};

		calculateAverageRating();
	}, [reviews]);

	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth <= 768);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	useEffect(() => {
		if (sheetOpen) {
			setSortByTemp(sortBy);
			setTempRating(parseInt(ratingFilter) || 0);
			setTempCommentFilter(commentFilter);
		}
	}, [sheetOpen, sortBy, ratingFilter, commentFilter]);

	useEffect(() => {
		if (sheetOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [sheetOpen]);

	const filteredReviews = useMemo(() => {
		let filtered = [...reviews];

		// Filter by rating
		if (ratingFilter !== "all") {
			filtered = filtered.filter(
				(review) => review.rating === parseInt(ratingFilter),
			);
		}

		// Filter by comment presence
		if (commentFilter === "with") {
			filtered = filtered.filter(
				(review) => review.comment && review.comment.trim() !== "",
			);
		} else if (commentFilter === "without") {
			filtered = filtered.filter(
				(review) => !review.comment || review.comment.trim() === "",
			);
		}

		// Sort by date
		filtered.sort((a, b) => {
			const dateA = new Date(a.createdAt || 0);
			const dateB = new Date(b.createdAt || 0);
			return sortBy === "recent" ? dateB - dateA : dateA - dateB;
		});

		return filtered;
	}, [reviews, sortBy, ratingFilter, commentFilter]);

	const logout = async () => {
		try {
			const { data } = await axios.post("/users/logout");
			console.log(data);
			setUser(null);
		} catch (error) {
			alert(JSON.stringify(error));
		}
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

	const SkeletonProfile = () => (
		<>
			{!mobile ? (
				<div>
					{/* Banner skeleton */}
					<div className="bg-gray-200 animate-pulse mt-20 max-w-7xl mx-auto w-full h-[40svh] rounded-4xl" />
					{/* Container */}
					<div className="container__profile mx-auto w-full lg:max-w-7xl px-8 max-sm:px-3.5 max-sm:mt-0 relative -mt-35">
						<div className="flex flex-col gap-5 max-sm:gap-2 relative mb-10">
							{/* Header */}
							<div className="avatar__btn flex max-sm:gap-2 gap-5 items-center justify-start relative">
								<div className="bg-gray-200 animate-pulse w-60 h-60 rounded-full" />
							</div>
							<div className="flex gap-0 flex-col">
								<div className="bg-gray-200 animate-pulse h-4 w-32 mb-2" />
								<div className="bg-gray-200 animate-pulse h-16 w-64 mb-2" />
								<div className="bg-gray-200 animate-pulse h-16 w-48" />
							</div>
							<div className="bg-gray-200 animate-pulse h-5 w-40" />
							{/* Bio */}
							<div className="flex flex-col gap-2 max-w-xl">
								<div className="bg-gray-200 animate-pulse h-4 w-full" />
								<div className="bg-gray-200 animate-pulse h-4 w-3/4" />
							</div>
							{/* Contact */}
							<div className="bg-gray-200 animate-pulse h-4 w-32" />
							{/* Stats */}
							<div className="flex items-center gap-5 my-5 p-0 list-none">
								<div className="flex flex-col gap-2.5">
									<div className="bg-gray-200 animate-pulse h-12 w-16" />
									<div className="bg-gray-200 animate-pulse h-4 w-24" />
								</div>
								<div className="flex flex-col gap-2.5">
									<div className="bg-gray-200 animate-pulse h-12 w-16" />
									<div className="bg-gray-200 animate-pulse h-4 w-24" />
								</div>
								<div className="flex flex-col gap-2.5">
									<div className="bg-gray-200 animate-pulse h-12 w-16" />
									<div className="bg-gray-200 animate-pulse h-4 w-24" />
								</div>
							</div>
							{/* Places section */}
							<div>
								<div className="bg-gray-200 animate-pulse h-4 w-16 mb-2" />
								<div className="flex items-center mb-15 justify-between">
									<div className="bg-gray-200 animate-pulse h-10 w-64" />
									<div className="bg-gray-200 animate-pulse h-4 w-16" />
								</div>
								<div className="grid max-w-full relative transition-transform grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-8 lg:max-w-7xl">
									{Array(2)
										.fill()
										.map((_, i) => (
											<div
												key={i}
												className="item__projeto rounded-xl w-full  flex gap-10"
											>
												<div className="flex-1 grid gap-2 grid-cols-8  grid-rows-3 h-50 max-sm:col-span-4 max-sm:row-span-2 ">
													<div className="row-span-4 col-span-5 bg-gray-200 animate-pulse h-full w-40 object-cover rounded-2xl"></div>
													<div className="row-span-2 col-span-3 bg-gray-200 animate-pulse h-full w-30 object-cover rounded-2xl"></div>
													<div className="row-span-2 col-span-3 bg-gray-200 animate-pulse  h-full w-30 object-cover rounded-2xl"></div>
												</div>
												<div className="relative flex flex-col flex-1 justify-between gap-2">
													<div className="flex flex-col">
														<div className="bg-gray-200 animate-pulse h-4 w-16 -top-6 absolute" />
														<div className="bg-gray-200 animate-pulse h-8 w-48 mb-2" />
														<div className="bg-gray-200 animate-pulse h-5 w-32" />
													</div>
													<div className="flex items-end gap-10 w-full justify-between">
														<div className="bg-gray-200 animate-pulse h-6 w-20" />
														<div className="bg-gray-200 animate-pulse w-10 h-10 rounded-2xl" />
													</div>
												</div>
											</div>
										))}
								</div>
							</div>
							{/* Reviews section */}
							<div className="flex flex-col">
								<div className="bg-gray-200 animate-pulse h-4 w-20 mb-2" />
								<div className="flex items-center justify-between">
									<div className="bg-gray-200 animate-pulse h-10 w-50" />
								</div>
								<div className="flex gap-6 mt-5 mb-15">
									{Array(3)
										.fill()
										.map((_, i) => (
											<div
												key={i}
												className="flex flex-col gap-4 p-6 w-fit bg-white rounded-2xl border border-gray-200 shadow-sm"
											>
												<div className="flex items-center gap-4">
													<div className="flex flex-col gap-4">
														<div className="bg-gray-200 animate-pulse h-5 w-32" />
														<div className="bg-gray-200 animate-pulse h-4 w-64" />
														<div className="bg-gray-200 animate-pulse h-4 w-48" />
														<div className="flex items-center gap-2">
															<div className="bg-gray-200 animate-pulse w-12 h-12 rounded-full" />
															<div className="flex flex-col gap-1">
																<div className="bg-gray-200 animate-pulse h-4 w-24" />
																<div className="bg-gray-200 animate-pulse h-3 w-32" />
															</div>
														</div>
													</div>
												</div>
											</div>
										))}
								</div>
							</div>
						</div>
					</div>
				</div>
			) : (
				<div>
					{/* Banner skeleton mobile */}
					<div className="bg-gray-200 animate-pulse mt-20 max-w-7xl mx-auto w-full h-[25svh]" />
					{/* Container mobile */}
					<div className="container__profile mx-auto w-full lg:max-w-7xl px-8 max-sm:px-3.5 relative -mt-30">
						<div className="flex flex-col gap-5 max-sm:gap-2 relative mb-10 max-sm:mb-0">
							{/* Header mobile */}
							<div className="avatar__btn flex max-sm:gap-2 gap-5 items-center justify-start relative">
								<div className="bg-gray-200 animate-pulse w-50 h-50 rounded-full" />
							</div>
							<div className="flex gap-0 flex-col">
								<div className="bg-gray-200 animate-pulse h-16 w-64 mb-2" />
								<div className="bg-gray-200 animate-pulse h-16 w-48" />
							</div>
							<div className="flex items-center gap-2 5">
								<div className="bg-gray-200 animate-pulse h-5 w-30" />
								<div className="bg-gray-200 animate-pulse h-5 w-50" />
							</div>
							{/* Bio */}
							<div className="flex flex-col gap-2 max-w-xl">
								<div className="bg-gray-200 animate-pulse h-4 w-full" />
								<div className="bg-gray-200 animate-pulse h-4 w-3/4" />
							</div>
							{/* Contact */}
							<div className="bg-gray-200 animate-pulse h-4 w-32" />
							{/* Stats mobile */}
							<div className="flex items-center max-sm:items-start max-sm:flex-col gap-5 max-sm:gap-2 max-sm:mt-2.5 my-5 p-0 list-none">
								<div className="flex flex-col gap-2.5 max-sm:gap-0">
									<div className="bg-gray-200 animate-pulse h-12 w-16" />
									<div className="bg-gray-200 animate-pulse h-4 w-24" />
								</div>
								<div className="flex flex-col gap-2.5 max-sm:gap-0">
									<div className="bg-gray-200 animate-pulse h-12 w-16" />
									<div className="bg-gray-200 animate-pulse h-4 w-24" />
								</div>
								<div className="flex flex-col gap-2.5 max-sm:gap-0">
									<div className="bg-gray-200 animate-pulse h-12 w-16" />
									<div className="bg-gray-200 animate-pulse h-4 w-24" />
								</div>
							</div>
							{/* Places section mobile */}
							<div>
								<div className="bg-gray-200 animate-pulse h-4 w-16 mb-2" />
								<div className="flex items-center mb-15 justify-between">
									<div className="bg-gray-200 animate-pulse h-10 w-64" />
								</div>
								<div className="grid max-w-full relative transition-transform grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-8 lg:max-w-7xl">
									{Array(2)
										.fill()
										.map((_, i) => (
											<div
												key={i}
												className="item__projeto rounded-xl max-sm:flex-col relative flex gap-5 max-sm:gap-2"
											>
												<div className="grid gap-2 max-sm:gap-x-2 grid-cols-8 grid-rows-3 h-50 max-sm:col-span-4 max-sm:row-span-2">
													<div className="row-span-4 col-span-5 max-sm:col-span-5 bg-gray-200 animate-pulse h-full max-sm:w-full w-50 object-cover rounded-2xl"></div>
													<div className="row-span-2 col-span-3 bg-gray-200 animate-pulse h-full w-40 object-cover rounded-2xl"></div>
													<div className="row-span-2 col-span-3 bg-gray-200 animate-pulse h-full w-40 object-cover rounded-2xl"></div>
												</div>
												<div className="relative flex flex-col w-full justify-between gap-2">
													<div className="flex flex-col">
														<div className="bg-gray-200 animate-pulse h-4 w-16 max-sm:static -top-6 absolute" />
														<div className="bg-gray-200 animate-pulse h-8 w-48 mb-2" />
														<div className="bg-gray-200 animate-pulse h-5 w-32" />
													</div>
													<div className="flex items-end gap-10 w-full justify-between">
														<div className="bg-gray-200 animate-pulse h-6 w-20" />
														<div className="bg-gray-200 animate-pulse w-10 h-10 rounded-2xl" />
													</div>
												</div>
											</div>
										))}
								</div>
							</div>
							{/* Reviews section mobile */}
							<div className="flex scroll-m-25 flex-col w-full relative">
								<div className="bg-gray-200 animate-pulse h-4 w-20 mb-2" />
								<div className="flex items-center justify-between">
									<div className="bg-gray-200 animate-pulse h-10 w-50" />
								</div>
								<div className="flex gap-6 mt-5 mb-15 max-sm:mb-0 flex-wrap">
									{Array(3)
										.fill()
										.map((_, i) => (
											<div
												key={i}
												className="flex flex-col min-w-60 max-sm:w-full gap-4 p-6 w-fit bg-white rounded-2xl border border-gray-200 shadow-sm"
											>
												<div className="flex items-center gap-4">
													<div className="flex flex-col gap-4">
														<div className="bg-gray-200 animate-pulse h-5 w-32" />
														<div className="bg-gray-200 animate-pulse h-4 w-64" />
														<div className="bg-gray-200 animate-pulse h-4 w-48" />
														<div className="flex items-center gap-2">
															<div className="bg-gray-200 animate-pulse w-12 h-12 rounded-full" />
															<div className="flex flex-col gap-1">
																<div className="bg-gray-200 animate-pulse h-4 w-24" />
																<div className="bg-gray-200 animate-pulse h-3 w-32" />
															</div>
														</div>
													</div>
												</div>
											</div>
										))}
								</div>
								{/* Mobile filter button skeleton */}
								<div className="sticky bottom-2.5 ml-auto text-center -mt-7.5 justify-center text-xl p-4 shadow-sm flex flex-1 items-center gap-2 bg-gray-200 animate-pulse rounded-full h-12 w-32" />
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);

	if (redirect) return <Navigate to="/" state={{ updated: true }} />;

	if (!ready || !userContextReady) return <SkeletonProfile />;

	const displayUser = profileUser;
	// Verifica se está visualizando o próprio perfil
	// Só é próprio perfil se o usuário está logado E o ID bate
	const isOwnProfile =
		user && (!paramId || String(paramId) === String(user._id));

	const nameUser = displayUser?.name ? displayUser.name.split(" ") : ["", ""];

	const handleImageError = (index) => {
		setImageErrors((prev) => ({ ...prev, [index]: true }));
	};

	const getImageSrc = (item, index) => {
		if (imageErrors[`${item._id}_${index}`]) {
			return photoDefault;
		}
		return item.photos?.[index];
	};

	const navItemsPerfil = [
		{ path: "/account/profile/edit", label: "Editar perfil" },
	];

	const navItemsActions = [
		{
			label: "Sair",
			function: () => {
				logout();
			},
		},
		{
			label: "Deletar conta",
			function: () => {
				setShowDeleteDialog(true);
			},
		},
	];

	const isDeactivated = displayUser?.deactivated;

	// Se o perfil estiver desativado, mostrar mensagem especial
	if (isDeactivated) {
		return (
			<>
				<div className="mt-20 max-w-7xl mx-auto w-full bg-gray-100 rounded-4xl h-[40svh] relative overflow-hidden flex items-center justify-center">
					<div className="text-center">
						<h1 className="text-6xl font-bold text-gray-500 mb-4">
							Perfil Desativado
						</h1>
						<p className="text-xl text-gray-400">
							Este usuário desativou sua conta.
						</p>
						<p className="text-lg text-gray-400 mt-2">
							Suas reservas e avaliações anteriores permanecem no site.
						</p>
					</div>
				</div>
				<div className="container__profile mx-auto w-full lg:max-w-7xl px-8 max-sm:px-3.5 max-sm:mt-0 relative -mt-35">
					<div className="flex flex-col gap-5 max-sm:gap-2 relative mb-10">
						{/* Espaço vazio para manter layout */}
						<div className="h-60"></div>
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			{!isEditingProfile ? (
				<>
					<img
						className="mt-0 mx-auto w-full object-cover bg-center max-sm:h-[25svh] max-sm:rounded-none rounded-4xl h-[40svh] relative overflow-hidden"
						src={displayUser?.banner || bannerDefault}
					/>

					{/* Container do conteúdo */}
					<div className="container__profile mx-auto w-full px-8 max-sm:px-3.5  relative max-sm:-mt-30 -mt-35">
						<div className="flex flex-col gap-5 max-sm:gap-2 relative mb-10 max-sm:mb-0">
							{/* Header do perfil (avatar + botão) */}
							<div className="avatar__btn flex  max-sm:gap-2 gap-5 items-center justify-start relative">
								{/* Avatar sobreposto */}
								<div className=" relative w-60 h-60 max-sm:w-50 max-sm:h-50 rounded-full border-2 bg-gradient-to-bl from-primary-200 to-primary-500 shadow-lg flex justify-center items-center text-4xl font-bold text-white">
									<img
										src={displayUser?.photo || userDefault}
										className="w-full h-full object-cover object-center rounded-full"
										alt={displayUser?.name}
									/>
								</div>
								{isOwnProfile && (
									<div className="flex absolute gap-2.5 max-sm:top-30 max-sm:right-5 right-0 top-35">
										<DropdownMenu modal={false}>
											{mobile ? (
												<DropdownMenuTrigger
													className={`outline-none bg-primary-100/50 p-2 px-5 cursor-pointer hover:bg-primary-100 transition-all rounded-2xl`}
												>
													Editar perfil
												</DropdownMenuTrigger>
											) : (
												<DropdownMenuTrigger
													className={`outline-none bg-primary-100/50 p-2 cursor-pointer hover:bg-primary-100 transition-all rounded-full`}
												>
													<Ellipsis size={20} />
												</DropdownMenuTrigger>
											)}

											<DropdownMenuContent
												align="end"
												className="p-2 bg-white rounded-xl shadow-xl flex flex-col gap-2"
											>
												{navItemsPerfil.map((item) => {
													return (
														<Link
															key={item.path}
															to={item.path}
															onClick={item.function}
															className={`flex group justify-between hover:bg-gray-100 transition-colors items-center gap-2 px-4 py-2 rounded-xl`}
														>
															{item.label}
															<ChevronRight
																size={15}
																className="opacity-0 group-hover:opacity-100 text-gray-500"
															/>
														</Link>
													);
												})}
												{/* Perfil */}
												<DropdownMenuSeparator />

												{/* Navegação */}
												{navItemsActions.map((item) => {
													if (item.label === "Deletar conta") {
														return (
															<div
																key={item.label}
																onClick={item.function}
																className={`flex group justify-between hover:bg-gray-100 transition-colors items-center gap-2 px-4 py-2 rounded-xl cursor-pointer`}
															>
																{item.label}
																<ChevronRight
																	size={15}
																	className="opacity-0 group-hover:opacity-100 text-gray-500"
																/>
															</div>
														);
													}
													return (
														<Link
															key={item.path}
															to={item.path}
															onClick={item.function}
															className={`flex group justify-between hover:bg-gray-100 transition-colors items-center gap-2 px-4 py-2 rounded-xl`}
														>
															{item.label}
															<ChevronRight
																size={15}
																className="opacity-0 group-hover:opacity-100 text-gray-500"
															/>
														</Link>
													);
												})}
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								)}

								{/* Botão de editar - só mostra se for o próprio perfil E estiver logado */}
							</div>
							<div className="flex gap-0 flex-col">
								<div className="">
									<p className="text-primary-700 uppercase font-light">
										{displayUser?.occupation}
									</p>
								</div>
								<span className="flex text-7xl max-sm:text-5xl max-sm:leading-none leading-20 flex-col font-bold">
									<p>{nameUser[0]}</p>
									{nameUser[1]}
								</span>
							</div>
							<div className="flex gap-5 items-center">
								<span className="flex gap-1.5 text-black">
									{[...Array(5)].map((_, index) => (
										<Star
											key={index}
											fill={
												index < Math.floor(averageRating) ? "black" : "none"
											}
											stroke="black"
											size={20}
										/>
									))}
									<p className="font-bold ml-2">{averageRating.toFixed(1)}</p>
								</span>
								<span className="w-1 h-1 rounded-full bg-primary-500"></span>
								<p className="">
									{totalReviews} Avaliaç{totalReviews !== 1 ? "ões" : "ão"}
								</p>
							</div>
							{displayUser?.bio && (
								<div className="text__bio max-w-xl flex flex-col gap-2 leading-relaxed text-gray-600 my-2">
									{displayUser.bio}
								</div>
							)}{" "}
							{/* Informações de contato */}
							<div className="flex flex-wrap max-sm:flex-col max-sm:gap-1 gap-4 text-gray-600 mt-0">
								{displayUser?.city && (
									<div className="flex  items-center gap-2">
										<MapPin size={18} />
										{displayUser.city}
									</div>
								)}
							</div>
							<div className="flex items-center max-sm:items-start max-sm:flex-col gap-5 max-sm:gap-2 max-sm:mt-2.5  my-5 p-0 list-none">
								<span className="flex flex-col gap-2.5 max-sm:gap-0 ">
									<span className="font-bold max-sm:font-medium text-5xl  ">
										{places.length}
									</span>
									<p>Acomodações Exclusivas</p>
								</span>
								<span className="flex flex-col gap-2.5 max-sm:gap-0 ">
									<span className="font-bold max-sm:font-medium text-5xl ">
										{totalGuestsSatisfied}
									</span>
									<p>Hóspedes Satisfeitos</p>
								</span>
								<span className="flex flex-col gap-2.5 max-sm:gap-0 ">
									<span className="font-bold max-sm:font-medium text-5xl ">
										{experienceTime}
									</span>
									<p>De Experiência</p>
								</span>
							</div>
							{/* Meus anúncios */}
							<div>
								<p className="text-primary-500 uppercase font-light">Seleção</p>
								<div className="flex items-center mb-15 justify-between">
									<div className="">
										<p className="text-4xl max: font-bold">
											Acomodações em Destaque
										</p>
									</div>
									<span className="max-sm:hidden text-primary-700 cursor-pointer font-light hover:bg-primary-100 rounded-2xl px-4 py-1.5 transition-all">
										Ver tudo
									</span>
								</div>
								<div className="flex flex-col gap-10">
									<div className="grid max-w-full relative transition-transform grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-8 lg:max-w-7xl">
										{places.length > 0 ? (
											places.map((item, index) => (
												<div
													className={`item__projeto rounded-xl max-sm:flex-col relative flex gap-5 max-sm:gap-2 ${
														index % 2 === 0 ? "item__left " : "item__right"
													}`}
													key={item._id}
												>
													<div className="grid gap-2 max-sm:gap-x-2 grid-cols-8  grid-rows-3 h-50 max-sm:col-span-4 max-sm:row-span-2 ">
														<img
															src={getImageSrc(item, 0)}
															onError={() => handleImageError(`${item._id}_0`)}
															className="row-span-4 col-span-5 max-sm:col-span-5  h-full max-sm:w-full w-50 object-cover rounded-2xl"
															alt={item.title}
														/>
														<img
															src={getImageSrc(item, 1)}
															onError={() => handleImageError(`${item._id}_1`)}
															className="row-span-2 col-span-3  h-full w-40 object-cover rounded-2xl"
															alt={item.title}
														/>
														<img
															src={getImageSrc(item, 2)}
															onError={() => handleImageError(`${item._id}_2`)}
															className="row-span-2 col-span-3  h-full w-40 object-cover rounded-2xl"
															alt={item.title}
														/>
													</div>
													<div className="relative flex flex-col w-full justify-between gap-2">
														<div className="flex flex-col">
															<p className="absolute -top-6 max-sm:static text-primary-700 cursor-pointer uppercase font-light">
																{item.city}
															</p>
															<Link
																to={`/places/${item._id}`}
																className="cursor-pointer hover:underline font-bold text-3xl text-[#0F172B] text-wrap max-w-md overflow-hidden"
															>
																{item.title}
															</Link>
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
														<div className="flex items-end gap-10 w-full justify-between">
															<div className="relative font-medium text-2xl flex-1  text-[#0F172B]">
																R$ {item.price}
																<span className="absolute font-normal text-sm pl-1 top-2">
																	/noite
																</span>
															</div>
															<Tooltip>
																<TooltipTrigger asChild>
																	<Link
																		to={`/places/${item._id}`}
																		className="cursor-pointer group p-2 hover:bg-primary-100/50 rounded-2xl transition-all flex items-center gap-2 font-medium"
																	>
																		<ArrowRight
																			size={18}
																			className="group-hover:-rotate-12"
																		/>
																	</Link>
																</TooltipTrigger>
																<TooltipContent className="bg-primary-600">
																	<p>Acessar acomodação</p>
																</TooltipContent>
															</Tooltip>
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
									</div>
									<div
										id="o-que-dizem"
										className="flex scroll-m-25 flex-col w-full relative "
									>
										<p className="text-primary-500 uppercase font-light">
											Testemunhos
										</p>
										<div className="flex items-center justify-between">
											<div className="">
												<p className="text-4xl font-bold">O Que Dizem</p>
											</div>
											{/* Mobile Filter Button */}
											{mobile && (
												<Drawer
													open={sheetOpen}
													onOpenChange={setSheetOpen}
													modal={true}
												>
													<DrawerContent className="rounded-tl-3xl h-auto p-5 py-6 max-h-[80vh]">
														<p className="text-xl font-medium text-gray-900 mb-2">
															Filtros de Avaliações
														</p>
														<div className="flex flex-col gap-6 mt-6">
															<div className="flex flex-col gap-2">
																<label className="text-sm font-medium text-gray-700">
																	Ordenar por:
																</label>
																<div className="flex flex-col gap-4">
																	<label
																		htmlFor="recent"
																		className={`flex items-center gap-2 cursor-pointer px-3 py-2 border-l-1 text-primary-600 border-transparent transition-colors ${
																			sortByTemp === "recent"
																				? "border-l-primary-900 text-primary-900 bg-primary-100/50"
																				: " text-gray-800 hover:bg-primary-100/50 hover:border-l-primary-300"
																		}`}
																	>
																		<input
																			type="checkbox"
																			id="recent"
																			name="sortBy"
																			value="recent"
																			checked={sortByTemp === "recent"}
																			onChange={(e) => {
																				if (e.target.checked) {
																					setSortByTemp("recent");
																				}
																			}}
																			className="hidden"
																		/>
																		Mais recente
																		<span
																			className={`w-2 h-2 ml-auto rounded-full bg-transparent ${sortByTemp === "recent" && "!bg-primary-900"}`}
																		></span>
																	</label>
																	<label
																		htmlFor="oldest"
																		className={`flex items-center gap-2 cursor-pointer px-3 py-2 border-l-1 text-primary-600 border-transparent transition-colors ${
																			sortByTemp === "oldest"
																				? "border-l-primary-900 text-primary-900 bg-primary-100/50"
																				: " text-gray-800 hover:bg-primary-100/50 hover:border-l-primary-300"
																		}`}
																	>
																		<input
																			type="checkbox"
																			id="oldest"
																			name="sortBy"
																			value="oldest"
																			checked={sortByTemp === "oldest"}
																			onChange={(e) => {
																				if (e.target.checked) {
																					setSortByTemp("oldest");
																				}
																			}}
																			className="hidden"
																		/>
																		Mais antigo
																		<span
																			className={`w-2 h-2 ml-auto rounded-full bg-transparent ${sortByTemp === "oldest" && "!bg-primary-900"}`}
																		></span>
																	</label>
																</div>
															</div>
															<div className="flex flex-col gap-2">
																<label className="text-sm font-medium text-gray-700">
																	Estrelas:
																</label>
																<div className="flex gap-1">
																	{[1, 2, 3, 4, 5].map((star) => (
																		<button
																			key={star}
																			type="button"
																			className={`p-3 hover:scale-110 rounded-2xl bg-primary-100/50 transition-all ${
																				star <=
																					(tempHoverRating || tempRating) &&
																				"bg-primary-900"
																			}`}
																			onMouseEnter={() =>
																				setTempHoverRating(star)
																			}
																			onMouseLeave={() => setTempHoverRating(0)}
																			onClick={() => {
																				setTempRating(star);
																			}}
																		>
																			<Star
																				size={24}
																				className={`${
																					star <=
																					(tempHoverRating || tempRating)
																						? "fill-white cursor-pointer text-white"
																						: "text-gray-300"
																				} transition-colors`}
																			/>
																		</button>
																	))}
																</div>
															</div>
															<div className="flex flex-col gap-2">
																<label className="text-sm font-medium text-gray-700">
																	Comentários:
																</label>
																<div className="flex flex-col gap-4">
																	<label
																		htmlFor="all_comments"
																		className={`flex items-center gap-2 cursor-pointer px-3 py-2 border-l-1 text-primary-600 border-transparent transition-colors ${
																			tempCommentFilter === "all"
																				? "border-l-primary-900 text-primary-900 bg-primary-100/50"
																				: " text-gray-800 hover:bg-primary-100/50 hover:border-l-primary-300"
																		}`}
																	>
																		<input
																			type="checkbox"
																			id="all_comments"
																			name="commentFilter"
																			value="all"
																			checked={tempCommentFilter === "all"}
																			onChange={(e) => {
																				if (e.target.checked) {
																					setTempCommentFilter("all");
																				}
																			}}
																			className="hidden"
																		/>
																		Todos
																		<span
																			className={`w-2 h-2 ml-auto rounded-full bg-transparent ${tempCommentFilter === "all" && "!bg-primary-900"}`}
																		></span>
																	</label>
																	<label
																		htmlFor="with_comments"
																		className={`flex items-center gap-2 cursor-pointer px-3 py-2 border-l-1 text-primary-600 border-transparent transition-colors ${
																			tempCommentFilter === "with"
																				? "border-l-primary-900 text-primary-900 bg-primary-100/50"
																				: " text-gray-800 hover:bg-primary-100/50 hover:border-l-primary-300"
																		}`}
																	>
																		<input
																			type="checkbox"
																			id="with_comments"
																			name="commentFilter"
																			value="with"
																			checked={tempCommentFilter === "with"}
																			onChange={(e) => {
																				if (e.target.checked) {
																					setTempCommentFilter("with");
																				}
																			}}
																			className="hidden"
																		/>
																		Com comentário
																		<span
																			className={`w-2 h-2 ml-auto rounded-full bg-transparent ${tempCommentFilter === "with" && "!bg-primary-900"}`}
																		></span>
																	</label>
																	<label
																		htmlFor="without_comments"
																		className={`flex items-center gap-2 cursor-pointer px-3 py-2 border-l-1 text-primary-600 border-transparent transition-colors ${
																			tempCommentFilter === "without"
																				? "border-l-primary-900 text-primary-900 bg-primary-100/50"
																				: " text-gray-800 hover:bg-primary-100/50 hover:border-l-primary-300"
																		}`}
																	>
																		<input
																			type="checkbox"
																			id="without_comments"
																			name="commentFilter"
																			value="without"
																			checked={tempCommentFilter === "without"}
																			onChange={(e) => {
																				if (e.target.checked) {
																					setTempCommentFilter("without");
																				}
																			}}
																			className="hidden"
																		/>
																		Sem comentário
																		<span
																			className={`w-2 h-2 ml-auto rounded-full bg-transparent ${tempCommentFilter === "without" && "!bg-primary-900"}`}
																		></span>
																	</label>
																</div>
															</div>
														</div>
														<div className="flex justify-end gap-4 mt-6">
															<button
																type="button"
																onClick={(e) => {
																	e.preventDefault();
																	// Clear filters
																	setSortBy("recent");
																	setRatingFilter("all");
																	setCommentFilter("all");
																	setSheetRating(0);
																	setSortByTemp("recent");
																	setTempRating(0);
																	setTempCommentFilter("all");
																}}
																className="px-4 py-2 cursor-pointer hover:bg-primary-100 rounded-lg border hover:text-primary-900 transition-colors font-medium"
															>
																Limpar
															</button>
															<button
																type="button"
																onClick={() => {
																	// Apply filters and close sheet
																	setSortBy(sortByTemp);
																	setRatingFilter(
																		tempRating > 0
																			? tempRating.toString()
																			: "all",
																	);
																	setCommentFilter(tempCommentFilter);
																	setSheetOpen(false);
																	// Scroll to "O Que Dizem" section
																	document
																		.getElementById("o-que-dizem")
																		?.scrollIntoView({ behavior: "smooth" });
																}}
																className="px-6 py-2 bg-primary-900 cursor-pointer text-white rounded-lg hover:bg-primary-800 transition-colors font-medium"
															>
																Aplicar Filtros
															</button>
														</div>
													</DrawerContent>
												</Drawer>
											)}
										</div>
										{/* External Filter Button */}

										{/* Desktop Filter Controls */}
										{!mobile && (
											<div className="flex flex-wrap gap-4 mt-5 mb-5">
												<div className="flex flex-col gap-2">
													<label className="text-sm font-medium text-gray-700">
														Ordenar por:
													</label>
													<Select
														value={sortBy}
														onChange={setSortBy}
														data={[
															{ value: "recent", label: "Mais recente" },
															{ value: "oldest", label: "Mais antigo" },
														]}
														placeholder="Ordenar por"
														className="w-[180px]"
														styles={{
															input: {
																borderRadius: "12px",
															},
															dropdown: {
																borderRadius: "12px",
															},
														}}
													/>
												</div>
												<div className="flex flex-col gap-2">
													<label className="text-sm font-medium text-gray-700">
														Estrelas:
													</label>
													<Select
														value={ratingFilter}
														onChange={setRatingFilter}
														data={[
															{ value: "all", label: "Todas" },
															{ value: "5", label: "5 estrelas" },
															{ value: "4", label: "4 estrelas" },
															{ value: "3", label: "3 estrelas" },
															{ value: "2", label: "2 estrelas" },
															{ value: "1", label: "1 estrela" },
														]}
														placeholder="Estrelas"
														className="w-[180px]"
														styles={{
															input: {
																borderRadius: "12px",
															},
															dropdown: {
																borderRadius: "12px",
															},
														}}
													/>
												</div>
												<div className="flex flex-col gap-2">
													<label className="text-sm font-medium text-gray-700">
														Comentários:
													</label>
													<Select
														value={commentFilter}
														onChange={setCommentFilter}
														data={[
															{ value: "all", label: "Todos" },
															{ value: "with", label: "Com comentário" },
															{ value: "without", label: "Sem comentário" },
														]}
														placeholder="Comentários"
														className="w-[180px]"
														styles={{
															input: {
																borderRadius: "12px",
															},
															dropdown: {
																borderRadius: "12px",
															},
														}}
													/>
												</div>
											</div>
										)}
										<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 mb-15 max-sm:mb-0">
											{filteredReviews.length > 0 ? (
												(() => {
													const columns = mobile ? 2 : 4;
													const columnReviews = Array.from(
														{ length: columns },
														() => [],
													);
													filteredReviews.forEach((review, index) => {
														columnReviews[index % columns].push(review);
													});
													return columnReviews.map((column, colIndex) => (
														<div key={colIndex} className="grid gap-4">
															{column.map((review) => (
																<div
																	key={review._id}
																	className="flex flex-col gap-4 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm"
																>
																	<div className="flex items-center gap-2">
																		<div className="flex items-center gap-1">
																			{[...Array(5)].map((_, index) => (
																				<Star
																					key={index}
																					fill={
																						index < Math.floor(review.rating)
																							? "black"
																							: "none"
																					}
																					stroke="black"
																					size={20}
																				/>
																			))}
																		</div>
																	</div>
																	{review.comment ? (
																		<p className="text-gray-700 max-w-md leading-relaxed line-clamp-4">
																			"{review.comment}"
																		</p>
																	) : (
																		<p className=" max-w-md mt-auto items-center text-primary-500 leading-relaxed line-clamp-4">
																			Sem comentário
																		</p>
																	)}
																	<Link
																		to={`/account/profile/${review.user._id}`}
																		className="flex items-center mt-auto gap-2"
																	>
																		<img
																			src={review.user.photo || photoDefault}
																			alt={review.user.name}
																			className="w-12 h-12 rounded-full object-cover"
																		/>
																		<div className="flex flex-col text-sm">
																			<p className="font-semibold text-gray-900">
																				{review.user.name}
																			</p>
																			<p className="text-xs text-gray-500">
																				Hóspede Verificado
																			</p>
																		</div>
																	</Link>
																</div>
															))}
														</div>
													));
												})()
											) : (
												<p className="text-gray-500 text-center py-0 col-span-full">
													Ainda não há avaliações para este filtro.
												</p>
											)}
										</div>
										{mobile && (
											<button
												onClick={() => setSheetOpen(true)}
												className="sticky bottom-2.5 ml-auto text-center -mt-7.5 cursor-pointer justify-center text-xl p-4 w-fit shadow-sm flex flex-1 items-center gap-2 bg-primary-900 hover:bg-primary-black transition-colors rounded-full text-white font-medium"
											>
												<Filter size={18} />
											</button>
										)}
									</div>
								</div>
							</div>
							{isOwnProfile && (
								<DeleteAccountDialog
									open={showDeleteDialog}
									onOpenChange={setShowDeleteDialog}
									onDelete={handleDelete}
								/>
							)}
						</div>
					</div>
				</>
			) : (
				<>
					{/* Só permite editar se for o próprio perfil */}
					{isOwnProfile && displayUser ? (
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
