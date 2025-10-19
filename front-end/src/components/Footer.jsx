import React from "react";
import logoSecondary from "../assets/logo__secondary.png";
import logoGithub from "../assets/github.png";
import logoLinkedin from "../assets/linkedin.png";
import logoMail from "../assets/mail.png";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useUserContext } from "./contexts/UserContext";

const Footer = ({ active }) => {
	const { user } = useUserContext();

	const navItems = [
		{ path: "/", label: "Home" },
		{ path: "/account/profile", label: "Perfil" },
		{ path: "/account/bookings", label: "Reservas" },
		{ path: "/account/places", label: "Acomodações" },
		!user && { path: "/login", label: "Entrar/Cadastrar-se" },
	];

	return (
		<div className="bg-primary-500 relative justify-between px-8 flex items-center gap-5 bottom-0 h-60">
			<div className="flex-col flex h-full justify-between py-8">
				<img src={logoSecondary} className="w-70 mt-10" alt="" />
				<span className="text-sm text-white/50">
					@ 2025 DormeAqui. Sua plataforma de hospedagem
				</span>
			</div>
			<div className="flex flex-col gap-5">
				<div className="flex-col flex h-full justify-center">
					<motion.nav
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.5 }}
						className="flex items-center gap-5 text-white"
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
										className={`flex ${
											isActive &&
											"bg-white text-primary-500 border-primary-500 border-1"
										} flex items-center gap-2  rounded-full px-4 justify-between py-2 transition-colors  `}
									>
										{item.label}
									</Link>
								</motion.button>
							);
						})}
					</motion.nav>
				</div>
				<motion.nav
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.5 }}
					className="flex items-center  gap-5 text-white"
				>
					<motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
						<a
							href="https://github.com/LeonardoMarques7/"
							className={`flex  items-center gap-2  rounded-full justify-between py-2  `}
						>
							<img src={logoGithub} alt="Logo do Github" />
						</a>
					</motion.button>
					<motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
						<a
							href="mailto:leonardo.emcsantos@gmail.com"
							className={`flex  items-center gap-2  rounded-full justify-between py-2 text-white `}
						>
							<img src={logoMail} alt="Logo do Email" />
						</a>
					</motion.button>
					<motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
						<a
							href="https://www.linkedin.com/in/leonardo-emanuel-3695451a0"
							className={`flex  items-center gap-2  rounded-full justify-between py-2 text-white `}
						>
							<img src={logoLinkedin} alt="Logo do Linkedin" />
						</a>
					</motion.button>
				</motion.nav>
			</div>
		</div>
	);
};

export default Footer;
