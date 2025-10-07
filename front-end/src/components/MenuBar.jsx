import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, Hotel, HotelIcon, Menu, TicketCheck } from "lucide-react";
import { Home, Briefcase, User, Mail, Settings } from "lucide-react";
import React, { useState } from "react";
import { motion } from "framer-motion";

import ImageMail from "../assets/mailMinimal.png";
import ImageGithub from "../assets/githubMinimal.png";
import ImageLinkedin from "../assets/linkedinMinimal.png";

import logo__primary from "../assets/logo__primary.png";
import { useUserContext } from "./contexts/UserContext";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

function MenuBar() {
	const { user } = useUserContext();
	const location = useLocation();
	const [activeSection, setActiveSection] = useState("Home");
	const [scrolled, setScrolled] = useState(false);

	const navItems = [
		{ path: "/", icon: Home, label: "Home" },
		{ path: "/account/profile", icon: User, label: "Perfil" },
		{ path: "/account/bookings", icon: Calendar, label: "Reservas" },
		{ path: "/account/places", icon: HotelIcon, label: "Acomodações" },
	];

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 200); // ativa quando rola 10px
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<motion.nav
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8, delay: 0.5 }}
			className="flex items-center gap-2"
		>
			{/* Navegação */}
			{navItems.map((item) => {
				const isActive = location.pathname === item.path;
				return (
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						key={item.path}
					>
						<Link
							to={item.path}
							className={`flex items-center gap-2  rounded-full px-4 justify-between py-2 transition-colors  ${
								scrolled
									? isActive
										? "bg-primary-500 text-white border-primary-500 border-1"
										: ""
									: isActive
									? "bg-white text-primary-500 border-primary-500 border-1"
									: "hover:bg-primary-200 text-white"
							}`}
						>
							<motion.div
								transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
							/>
							<item.icon className="w-5 h-5" />
							{item.label}
						</Link>
					</motion.button>
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
		</motion.nav>
	);
}

export default MenuBar;
