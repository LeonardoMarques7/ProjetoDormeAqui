import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import PremiumSidebar from "@/components/layout/PremiumSidebar";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import {
	Calendar,
	ChevronDown,
	ChevronRight,
	Hotel,
	HotelIcon,
	Menu,
	MenuIcon,
	Sidebar,
	TicketCheck,
	Sparkles,
	LogOut,
	Bell,
	Heart,
	Settings,
	HelpCircle,
	User as LucideUser,
} from "lucide-react";
import {
	HomeIcon,
	CalendarDaysIcon,
	BuildingOfficeIcon,
	UserIcon,
	Cog6ToothIcon,
	ChatBubbleLeftIcon,
	ChatBubbleOvalLeftIcon,
} from "@heroicons/react/24/outline";
import {
	HomeIcon as HomeIconSolid,
	CalendarDaysIcon as CalendarDaysIconSolid,
	BuildingOfficeIcon as BuildingOfficeIconSolid,
	UserIcon as UserIconSolid,
	Cog6ToothIcon as Cog6ToothIconSolid,
	ChatBubbleOvalLeftIcon as ChatBubbleOvalLeftIconSolid,
} from "@heroicons/react/24/solid";

import { Home, Briefcase, User, Mail } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

import menu from "@/assets/menu-icon.png";

import { useAuthModalContext } from "@/components/contexts/AuthModalContext";

import { useMessage } from "@/components/contexts/MessageContext";

import logo__primary from "@/assets/logos/logo__primary.png";
import { useUserContext } from "@/components/contexts/UserContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function MenuBar({ active }) {
	const navigate = useNavigate();
	const { user, setUser } = useUserContext();
	const location = useLocation();
	const { showMessage } = useMessage();
	const [activeSection, setActiveSection] = useState("Home");
	const [redirect, setRedirect] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [logoutActive, setLogoutActive] = useState(false);
	const [bookings, setBookings] = useState([]);
	const [readyBookings, setReadyBookings] = useState(false);
	const [qtdBookings, setQtdBookings] = useState(0);
	const menuTriggerRef = useRef(null);
	const [mobile, setIsMobile] = useState(window.innerWidth <= 768);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [premiumSidebarOpen, setPremiumSidebarOpen] = useState(false);
	const { showAuthModal } = useAuthModalContext();

	const navItems = [
		{ path: "/", icon: Home, label: "Home" },
		{ path: "/account/bookings", icon: Calendar, label: "Reservas" },
		{ path: "/account/places", icon: HotelIcon, label: "Acomodações" },
	];

	const navItemsPerfil = [
		{ path: "/account/profile/edit", label: "Editar perfil" },
		{
			label: "Sair",
			function: () => {
				logout();
			},
		},
	];

	const navItemsNOPerfil = [
		{
			path: "/",
			label: "Página Incial",
			function: () => {
				window.scrollTo({ top: 0, behavior: "smooth" });
			},
		},
		{
			path: "/login",
			label: "Torne-se um anfitrião",
		},
	];
	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 200); // ativa quando rola 10px
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth <= 768);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	useEffect(() => {
		if (!user) {
			setBookings([]);
			setReadyBookings(false);
			return;
		}

		const axiosGet = async () => {
			const { data } = await axios.get("/bookings/owner");
			setTimeout(() => {
				setBookings(data);
				setReadyBookings(true);
			}, 100);
		};

		axiosGet();
	}, [user?._id]);

	useEffect(() => {
		setQtdBookings(bookings.length);
	}, [bookings.updateAt, bookings.length]);

	const logout = async () => {
		try {
			const { data } = await axios.post(
				"/users/logout",
				{},
				{
					withCredentials: true,
				},
			);

			delete axios.defaults.headers.common["Authorization"];

			localStorage.clear();
			sessionStorage.clear();

			console.log(data);
			setUser(null);
			setPremiumSidebarOpen(false);
			showMessage("Logout realizado com sucesso!", "success");
		} catch (error) {
			alert(JSON.stringify(error));
		}
	};

	const handleNavClick = () => {
		setSidebarOpen(false);
	};

	const isActiveHome = location.pathname === "Home";

	return (
		<>
			{!mobile ? (
				<>
					{/* Desktop Premium Sidebar */}
					<PremiumSidebar
						open={premiumSidebarOpen}
						onClose={() => setPremiumSidebarOpen(false)}
						user={user}
						onLogout={() => setUser(null)}
					/>

					{/* Desktop Trigger Button */}
					<motion.button
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.5, delay: 0.6 }}
						onClick={() => setPremiumSidebarOpen(true)}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className="relative p-3 rounded-full cursor-pointer hover:bg-gray-100 transition-colors group"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="size-6"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25"
							/>
						</svg>

						{user && qtdBookings > 0 && (
							<motion.span
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
							>
								{qtdBookings}
							</motion.span>
						)}
					</motion.button>
				</>
			) : (
				<div className="flex items-center gap-2">
					<Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
						<SheetTrigger className={`absolute z-50 right-8`}>
							<motion.div
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.95 }}
							>
								<Sidebar className="w-6 h-6 text-gray-700" />
							</motion.div>
						</SheetTrigger>

						<SheetContent className="w-80 p-0 bg-gradient-to-b from-white to-gray-50">
							<SheetHeader className="p-6 pb-4">
								<SheetTitle className="text-left">
									{user ? (
										<Link to={"/account/profile"} onClick={handleNavClick}>
											<motion.div
												whileHover={{ y: -2 }}
												className="flex items-center gap-3 py-4 px-3 rounded-2xl hover:bg-primary-100 transition-colors"
											>
												<div className="relative">
													<img
														src={user.photo}
														className="w-16 h-16 aspect-square rounded-2xl object-cover border-4 border-primary-200 shadow-lg"
														alt="Foto do Usuário"
													/>
													<div className="absolute -bottom-1 -right-1 bg-primary-500 rounded-full p-1">
														<Sparkles className="w-3 h-3 text-white" />
													</div>
												</div>
												<div className="flex flex-col">
													<span className="font-bold text-lg text-gray-900 line-clamp-1 overflow-ellipsis">
														{user.name}
													</span>
													<span className="text-xs text-gray-500 font-normal">
														{user.email}
													</span>
												</div>
											</motion.div>
										</Link>
									) : (
										<div className="flex flex-col items-start gap-4 pt-8">
											<img
												src={logo__primary}
												alt="Logo do DormeAqui"
												className="w-40"
											/>
											<p className="text-sm text-gray-600 font-medium">
												Bem-vindo ao DormeAqui!
											</p>
										</div>
									)}
								</SheetTitle>
							</SheetHeader>

							<div className="px-4 py-4 flex flex-col gap-2 max-h-[calc(100vh-200px)] overflow-y-auto">
								{/* Navegação Principal */}
								{user && (
									<div className="mb-4">
										<p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 mb-3">
											📍 Principal
										</p>
										{navItems.map((item) => {
											const isActive = location.pathname === item.path;
											return (
												<motion.div
													key={item.path}
													whileHover={{ x: 4 }}
													whileTap={{ scale: 0.98 }}
												>
													<Link
														to={item.path}
														onClick={handleNavClick}
														className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium ${
															isActive
																? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-200"
																: "hover:bg-primary-50 text-gray-700 hover:text-primary-900"
														}`}
													>
														<item.icon className="w-5 h-5 flex-shrink-0" />
														<span className="flex-1">{item.label}</span>
														{isActive && (
															<motion.div
																layoutId="indicator"
																className="w-1 h-1 rounded-full bg-white"
															/>
														)}
													</Link>
												</motion.div>
											);
										})}
									</div>
								)}

								{/* Perfil e Configurações */}
								{user && (
									<>
										<div className="my-2 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
										<div>
											<p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 mb-3">
												⚙️ Conta
											</p>
											<motion.div
												whileHover={{ x: 4 }}
												whileTap={{ scale: 0.98 }}
											>
												<Link
													to="/account/profile/edit"
													onClick={handleNavClick}
													className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 text-gray-700 transition-all group font-medium"
												>
													<div className="flex items-center gap-3">
														<LucideUser className="w-4 h-4" />
														<span>Editar perfil</span>
													</div>
													<ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
												</Link>
											</motion.div>
											<motion.div
												whileHover={{ x: 4 }}
												whileTap={{ scale: 0.98 }}
											>
												<Link
													to="/account/settings"
													onClick={handleNavClick}
													className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 text-gray-700 transition-all group font-medium"
												>
													<div className="flex items-center gap-3">
														<Settings className="w-4 h-4" />
														<span>Configurações</span>
													</div>
													<ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
												</Link>
											</motion.div>
											<motion.button
												whileHover={{ x: 4 }}
												whileTap={{ scale: 0.98 }}
												onClick={() => {
													logout();
													handleNavClick();
												}}
												className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-gray-700 transition-all group font-medium mt-2"
											>
												<div className="flex items-center gap-3">
													<LogOut className="w-4 h-4 text-red-500" />
													<span className="text-red-600">Sair</span>
												</div>
												<ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
											</motion.button>
										</div>
									</>
								)}

								{/* Botão de Login (sem usuário) */}
								{!user && (
									<>
										<div>
											<motion.div
												whileHover={{ y: -2 }}
												className="flex mb-4 flex-col gap-3 p-5 bg-gradient-to-br from-blue-50 to-primary-100 rounded-2xl border-2 border-primary-300 shadow-sm"
											>
												<div className="flex items-center gap-2">
													<Sparkles className="w-5 h-5 text-primary-600" />
													<span className="text-lg font-bold text-gray-900">
														Bem-vindo!
													</span>
												</div>
												<span className="font-light text-gray-700 text-sm leading-relaxed">
													Faça login para acessar suas reservas, acomodações e
													muito mais
												</span>
												<motion.button
													whileHover={{ scale: 1.02 }}
													whileTap={{ scale: 0.98 }}
													onClick={(e) => {
														e.preventDefault();
														setSidebarOpen(false);
														showAuthModal("login");
													}}
													className="flex text-sm items-center bg-gradient-to-r from-primary-900 to-primary-800 cursor-pointer justify-between gap-3 w-full h-11 px-4 rounded-xl hover:from-primary-800 hover:to-primary-700 text-white transition-all group font-medium shadow-md hover:shadow-lg"
												>
													<span className="">Entrar</span>
													<ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
												</motion.button>
												<motion.button
													whileHover={{ scale: 1.02 }}
													whileTap={{ scale: 0.98 }}
													onClick={(e) => {
														e.preventDefault();
														setSidebarOpen(false);
														showAuthModal("register");
													}}
													className="flex text-sm items-center bg-white cursor-pointer justify-between gap-3 w-full h-11 px-4 rounded-xl hover:bg-gray-100 text-primary-900 transition-all group font-medium border-2 border-primary-300"
												>
													<span className="">Criar Conta</span>
													<ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
												</motion.button>
											</motion.div>
											<p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 mb-3">
												🔗 Links
											</p>
											{navItemsNOPerfil.map((item) => {
												return (
													<motion.div
														key={item.path}
														whileHover={{ x: 4 }}
														whileTap={{
															scale: 0.98,
														}}
													>
														<Link
															to={item.path}
															onClick={() => {
																if (item.function) item.function();
																handleNavClick();
															}}
															className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 text-gray-700 transition-all group font-medium"
														>
															<span>{item.label}</span>
															<ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
														</Link>
													</motion.div>
												);
											})}
										</div>
									</>
								)}
							</div>
							<div className="absolute bottom-0 left-0 right-0 max-h-24 bg-gradient-to-t from-white via-white to-transparent p-4 flex flex-col gap-3 border-t">
								{/* Footer da Sidebar */}
								{user && (
									<motion.div whileHover={{ y: -2 }}>
										<Link
											to={"/account/profile"}
											onClick={handleNavClick}
											className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary-50 transition-all group"
										>
											<div className="flex flex-col flex-1">
												<span className="text-sm font-bold text-gray-800">
													Ver perfil
												</span>
												<span className="text-xs text-gray-500">
													Suas informações
												</span>
											</div>
											<ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600" />
										</Link>
									</motion.div>
								)}
								<div className="text-center">
									<p className="text-xs text-gray-500 font-medium">
										© 2025 DormeAqui
									</p>
								</div>
							</div>
						</SheetContent>
					</Sheet>
				</div>
			)}
		</>
	);
}

export default MenuBar;
