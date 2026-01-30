import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Home, Briefcase, User, Mail, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import { useAuthModalContext } from "@/components/contexts/AuthModalContext";

import logo__primary from "@/assets/logo__primary.png";
import { useUserContext } from "@/components/contexts/UserContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function MenuBar({ active }) {
	const navigate = useNavigate();
	const { user, setUser } = useUserContext();
	const location = useLocation();
	const [activeSection, setActiveSection] = useState("Home");
	const [redirect, setRedirect] = useState(false);
	const [scrolled, setScrolled] = useState(false);
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
							<motion.button className="">
								<Link
									to={"/"}
									className={`flex items-center  gap-2  rounded-2xl  justify-between  `}
								>
									<motion.div
										onClick={(e) => {
											e.preventDefault();
											showAuthModal("login");
										}}
										className="hover:bg-primary-100/50  px-4 py-2 rounded-xl transition-all duration-300"
									>
										Torne-se um anfitrião
									</motion.div>
								</Link>
							</motion.button>
							<DropdownMenu modal={false}>
								<DropdownMenuTrigger className={`outline-none `}>
									<div className="badge__user flex items-center text-primary-800 gap-2 cursor-pointer hover:bg-gray-200 transition-colors bg-primary-100 p-4 rounded-xl">
										<MenuIcon size={18} />
									</div>
								</DropdownMenuTrigger>

								<DropdownMenuContent
									align="end"
									className="p-2 bg-white rounded-xl shadow-xl flex flex-col gap-2"
								>
									<span
										onClick={(e) => {
											e.preventDefault();
											showAuthModal("login");
										}}
										className={`flex group justify-between cursor-pointer hover:bg-gray-100 transition-colors items-center gap-2 px-4 py-2 rounded-xl`}
									>
										Entre ou Cadastre-se
									</span>
								</DropdownMenuContent>
							</DropdownMenu>
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
						<DropdownMenu modal={false}>
							<DropdownMenuTrigger className={`outline-none`}>
								<div className="badge__user bg-primary-100 flex items-center gap-2 cursor-pointer hover:bg-gray-200 transition-colors  pr-3 py-1.5 px-2 rounded-2xl">
									<img
										src={user.photo}
										className="w-8 h-8 aspect-square rounded-full object-cover"
										alt="Foto do Usuário"
									/>
									<ChevronDown size={18} className="text-gray-500" />
								</div>
							</DropdownMenuTrigger>

							<DropdownMenuContent
								align="end"
								className="p-2 bg-white rounded-xl shadow-xl flex flex-col gap-2"
							>
								{/* Perfil */}
								<Link
									to={"/account/profile"}
									className="flex items-center group hover:bg-gray-100 transition-all rounded-2xl cursor-pointer gap-2 px-4 py-2"
								>
									<img
										src={user.photo}
										className="w-12 h-12 aspect-square rounded-full object-cover"
										alt="Foto do Usuário"
									/>
									<div className="flex flex-col text-gray-700 ">
										<h4>{user.name}</h4>
										<small>{user.email}</small>
									</div>
									<ChevronRight
										size={15}
										className="opacity-0 group-hover:opacity-100 text-gray-500 "
									/>
								</Link>

								<DropdownMenuSeparator />

								{/* Navegação */}
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
								{!user && (
									<span
										onClick={(e) => {
											e.preventDefault();
											showAuthModal("login");
										}}
										className="text-white bg-primary-500 px-5 border-1 rounded-xl py-2"
									>
										Entre ou Cadastre-se
									</span>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
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
