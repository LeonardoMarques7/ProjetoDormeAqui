import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import StaggeredMenu from "@/components/layout/StaggeredMenu";
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

import { Home, Briefcase, User, Mail, Settings } from "lucide-react";
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

			// Limpa qualquer cache do axios
			delete axios.defaults.headers.common["Authorization"];

			// Limpa estados locais
			localStorage.clear();
			sessionStorage.clear();

			console.log(data);
			setUser(null);
			setSidebarOpen(false);
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
				<motion.nav
					initial={{ opacity: 0, y: -50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.5 }}
					className="flex items-center gap-4"
				>
					{!user && (
						<>
							{/* <span className="bg-primary-800 w-[617px] absolute rounded-full h-[500px] rotate-[14deg]"></span> */}
							<svg
								width="500"
								height="171"
								className="right-0 absolute -z-10"
								viewBox="0 0 500 171"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M36.4791 -231.032C147.155 -446.553 623.341 -323.52 615.765 -81.3605C613.993 -24.6884 605.277 9.04315 579.376 59.4812C468.7 275.003 -7.48623 151.97 0.0895477 -90.1901C1.86249 -146.862 10.5778 -180.594 36.4791 -231.032Z"
									fill="#334155"
								/>
							</svg>

							<button
								ref={menuTriggerRef}
								onClick={() => setMenuOpen((prev) => !prev)}
								className="badge__user flex items-center gap-2 cursor-pointer transition-all p-4 bg-transparent border-none"
							>
								<img src={menu} className="w-5 h-5" alt="Menu" />
							</button>
							<StaggeredMenu
								open={menuOpen}
								onClose={() => setMenuOpen(false)}
								triggerRef={menuTriggerRef}
								colors={["#cbd5e1", "#334155"]}
								accentColor="#1e293b"
								items={[
									{
										label: "Entre ou Cadastre-se",
										onClick: () => showAuthModal("login"),
									},
								]}
							/>
						</>
					)}
					{user &&
						navItems.map((item) => {
							const isActive = location.pathname === item.path;
							return (
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									key={item.path}
								>
									<Link
										to={item.path}
										className={`flex items-center gap-2  rounded-2xl px-4 justify-between py-2 transition-colors 
											
									`}
									>
										<motion.div
											transition={{
												type: "spring",
												bounce: 0.25,
												duration: 0.5,
											}}
										>
											{item.label}
										</motion.div>
									</Link>
								</motion.button>
							);
						})}

					{user && (
						<>
							<button
								ref={menuTriggerRef}
								onClick={() => setMenuOpen((prev) => !prev)}
								className="badge__user bg-primary-100 flex items-center gap-2 cursor-pointer hover:bg-gray-200 transition-colors pr-3 py-1.5 px-2 rounded-2xl border-none"
							>
								<img
									src={user.photo}
									className="w-8 h-8 aspect-square rounded-full object-cover"
									alt="Foto do Usuário"
								/>
								<ChevronDown size={18} className="text-gray-500" />
							</button>
							<StaggeredMenu
								open={menuOpen}
								onClose={() => setMenuOpen(false)}
								triggerRef={menuTriggerRef}
								colors={["#cbd5e1", "#334155"]}
								accentColor="#1e293b"
								items={[
									{
										path: "/",
										icon: HomeIconSolid,
										iconRegular: HomeIcon,
										label: "Home",
									},
									{
										path: "/account/bookings",
										icon: CalendarDaysIconSolid,
										iconRegular: CalendarDaysIcon,
										label: "Reservas",
										notifications: qtdBookings,
									},
									{
										path: "/account/places",
										icon: BuildingOfficeIconSolid,
										iconRegular: BuildingOfficeIcon,
										label: "Acomodações",
									},
									{
										path: "/account/message",
										icon: ChatBubbleOvalLeftIconSolid,
										iconRegular: ChatBubbleOvalLeftIcon,
										label: "Mensagens",
									},
									{ label: "Sair", onClick: logout },
								]}
								userProfile={{
									photo: user.photo,
									name: user.name,
									email: user.email,
									to: "/account/profile",
								}}
							/>
						</>
					)}
				</motion.nav>
			) : (
				<div className="flex items-center gap-2 ">
					<Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
						<SheetTrigger className={`absolute z-50 right-8`}>
							<Sidebar className="w-5 h-5" />
						</SheetTrigger>

						<SheetContent className="w-80 p-0">
							<SheetHeader className="p-6 pb-0">
								<SheetTitle className="text-left">
									{user ? (
										<Link to={"/account/profile"} onClick={handleNavClick}>
											<div className="flex items-center gap-3 py-4">
												<img
													src={user.photo}
													className="w-16 h-16 aspect-square rounded-full object-cover border-4 border-primary-200"
													alt="Foto do Usuário"
												/>
												<div className="flex flex-col">
													<span className="font-semibold text-lg text-gray-800 line-clamp-1 overflow-ellipsis">
														{user.name}
													</span>
													<span className="text-sm text-gray-500 font-normal">
														{user.email}
													</span>
												</div>
											</div>
										</Link>
									) : (
										<div className="flex flex-col items-start gap-2 pt-8">
											<img
												src={logo__primary}
												alt="Logo do DormeAqui"
												className="w-40"
											/>
										</div>
									)}
								</SheetTitle>
							</SheetHeader>

							<div className="px-4 py-6 flex flex-col gap-1">
								{/* Navegação Principal */}
								{user && (
									<div className="mb-2">
										<p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
											Navegação
										</p>
										{navItems.map((item) => {
											const isActive = location.pathname === item.path;
											return (
												<Link
													key={item.path}
													to={item.path}
													onClick={handleNavClick}
													className={`flex items-center  gap-3 px-4 py-3 rounded-xl transition-all ${
														isActive
															? "bg-primary-500 text-white shadow-lg shadow-primary-200"
															: "hover:bg-primary-50 text-gray-700"
													} hover:bg-gray-100!`}
												>
													<item.icon className="w-5 h-5" />
													<span className="font-medium">{item.label}</span>
													{isActive && (
														<ChevronRight className="w-4 h-4 ml-auto" />
													)}
												</Link>
											);
										})}
									</div>
								)}
								{/* Perfil e Configurações */}
								{user && (
									<>
										<DropdownMenuSeparator className="my-4" />
										<div>
											<p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
												Conta
											</p>
											{navItemsPerfil.map((item) => {
												return (
													<Link
														key={item.path}
														to={item.path}
														onClick={() => {
															if (item.function) item.function();
															handleNavClick();
														}}
														className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 text-gray-700 transition-all group"
													>
														<span className="font-medium">{item.label}</span>
														<ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
													</Link>
												);
											})}
										</div>
									</>
								)}

								{/* Botão de Login (sem usuário) */}
								{!user && (
									<>
										<div>
											<div className="flex mb-4 flex-col gap-3 p-5 bg-primary-100 rounded-xl border">
												<span className="text-lg font-medium">Bem-vindo!</span>
												<span className="font-light">
													Faça login para acessar suas reservas e acomodações
												</span>
												<button
													onClick={(e) => {
														e.preventDefault();
														setSidebarOpen(false);
														showAuthModal("login");
													}}
													className="flex text-sm items-center bg-primary-900 cursor-pointer justify-between gap-3 w-full h-10 px-4 rounded-xl hover:bg-gray-800 text-white transition-all group"
												>
													<span className="">Entrar</span>
													<ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
												</button>
												<button
													onClick={(e) => {
														e.preventDefault();
														setSidebarOpen(false);
														showAuthModal("register");
													}}
													className="flex text-sm items-center bg-white cursor-pointer justify-between gap-3 w-full h-10 px-4 rounded-xl hover:bg-gray-200 text-primary-900 transition-all group"
												>
													<span className="">Criar Conta</span>
													<ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
												</button>
											</div>
											<p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
												Menu
											</p>
											{navItemsNOPerfil.map((item) => {
												return (
													<Link
														key={item.path}
														to={item.path}
														onClick={() => {
															if (item.function) item.function();
															handleNavClick();
														}}
														className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 text-gray-700 transition-all group"
													>
														<span className="font-medium">{item.label}</span>
														<ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
													</Link>
												);
											})}
										</div>
									</>
								)}
							</div>
							<div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-4 ">
								{/* Footer da Sidebar */}
								{user && (
									<Link
										to={"/account/profile"}
										onClick={handleNavClick}
										className="flex items-center gap-3 p-3  rounded-xl hover:bg-white transition-all group"
									>
										<div className="flex flex-col flex-1">
											<span className="text-sm font-semibold text-gray-800">
												Ver perfil completo
											</span>
											<span className="text-xs text-gray-500">
												Editar suas informações
											</span>
										</div>
										<ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
									</Link>
								)}
								<div
									className="border-t bg-gray-50 p-3"
									onClick={handleNavClick}
								>
									<div className="mt-auto">
										<div className="">
											<p className="text-gray-600 text-sm text-start">
												© 2025 DormeAqui. Todos os direitos reservados.
											</p>
										</div>
									</div>
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
