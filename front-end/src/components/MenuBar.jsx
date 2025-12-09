import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Calendar,
	ChevronDown,
	ChevronRight,
	Hotel,
	HotelIcon,
	Menu,
	MenuIcon,
	TicketCheck,
} from "lucide-react";
import { Home, Briefcase, User, Mail, Settings } from "lucide-react";
import React, { useState } from "react";
import { motion } from "framer-motion";

import ImageMail from "../assets/mailMinimal.png";
import ImageGithub from "../assets/githubMinimal.png";
import ImageLinkedin from "../assets/linkedinMinimal.png";

import logo__primary from "../assets/logo__primary.png";
import { useUserContext } from "./contexts/UserContext";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios";

function MenuBar({ active }) {
	const { user, setUser } = useUserContext();
	const location = useLocation();
	const [activeSection, setActiveSection] = useState("Home");
	const [redirect, setRedirect] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [moblie, setIsMoblie] = useState(window.innerWidth <= 768);

	const navItems = [
		{ path: "/", icon: Home, label: "Home" },
		{ path: "/account/bookings", icon: Calendar, label: "Reservas" },
		{ path: "/account/places", icon: HotelIcon, label: "Acomodações" },
	];

	const navItemsPerfil = [
		{ path: "/account/profile/edit", label: "Editar perfil" },
		{
			path: "/login",
			label: "Sair",
			function: () => {
				logout();
			},
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
		const handleResize = () => setIsMoblie(window.innerWidth <= 768);
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

	const isActiveHome = location.pathname === "Home";

	return (
		<>
			{!moblie ? (
				<motion.nav
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.5 }}
					className="flex items-center gap-4"
				>
					{!user && (
						<>
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								<Link
									to={"/"}
									className={`flex items-center gap-2  rounded-2xl px-4 justify-between py-2 text-gray-700 transition-colors`}
								>
									<motion.div
										transition={{
											type: "spring",
											bounce: 0.25,
											duration: 0.5,
										}}
									>
										Torne-se um anfitrião
									</motion.div>
								</Link>
							</motion.button>
							<DropdownMenu modal={false}>
								<DropdownMenuTrigger className={`outline-none`}>
									<div className="badge__user flex items-center text-white gap-2 cursor-pointer hover:bg-gray-800 transition-colors bg-primary-900 p-4 rounded-full">
										<MenuIcon size={18} />
									</div>
								</DropdownMenuTrigger>

								<DropdownMenuContent
									align="end"
									className="p-2 bg-white rounded-xl shadow-xl flex flex-col gap-2"
								>
									<Link
										to={"/login"}
										className={`flex group justify-between hover:bg-gray-100 transition-colors items-center gap-2 px-4 py-2 rounded-xl`}
									>
										Entre ou Cadastre-se
									</Link>
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
								<div className="badge__user flex items-center gap-2 cursor-pointer hover:bg-gray-200 transition-colors bg-white pr-3 py-1.5 px-2 rounded-2xl">
									<img
										src={user.photo}
										className="w-8 h-8 aspect-square rounded-full object-cover"
										alt="Foto do Usuário"
									/>
									<ChevronDown size={18} />
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
									<Link
										to={"/login"}
										className="text-white bg-primary-500 px-5 border-1 rounded-xl py-2"
									>
										Entre ou Cadastre-se
									</Link>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</motion.nav>
			) : (
				<motion.nav
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.5 }}
					className="flex items-center gap-2 "
				>
					<DropdownMenu>
						<DropdownMenuTrigger
							className={`absolute z-50  ${
								scrolled ? "bg-transparent border-0 " : "bg-white border-2"
							}  p-3 rounded-full hover:scale-105 transition-transform duration-200`}
						>
							<Menu className="w-5 h-5" />
						</DropdownMenuTrigger>

						<DropdownMenuContent className="mx-4 p-2 bg-white rounded-xl shadow-xl flex flex-col gap-2">
							{/* Perfil */}
							<div className="flex flex-col items-center gap-2 px-4 py-2">
								<img
									src={logo__primary}
									alt="Logo do DormeAqui"
									className="w-40"
								/>
							</div>

							<DropdownMenuSeparator />

							{/* Navegação */}
							{navItems.map((item) => {
								const isActive = location.pathname === item.path;
								return (
									<Link
										key={item.path}
										to={item.path}
										className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
											isActive
												? "bg-primary-300 text-white"
												: "hover:bg-primary-200"
										}`}
									>
										<item.icon className="w-5 h-5" />
										{item.label}
									</Link>
								);
							})}
							{!user && (
								<Link
									to={"/login"}
									className="text-white bg-primary-500 px-5 border-1 rounded-xl py-2"
								>
									Entre ou Cadastre-se
								</Link>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</motion.nav>
			)}
		</>
	);
}

export default MenuBar;
