import { motion, AnimatePresence } from "framer-motion";
import {
	Home,
	Compass,
	LogOut,
	Settings,
	MessageCircle,
	Calendar,
	ChevronDown,
	HandshakeIcon,
	X,
	HomeIcon,
} from "lucide-react";
import { useState } from "react";
import logo__primary from "@/assets/logos/logo__primary.png";
import { useAuthModalContext } from "@/components/contexts/AuthModalContext";
import { useMessage } from "@/components/contexts/MessageContext";
import { useUserContext } from "@/components/contexts/UserContext";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { HomeModernIcon, SparklesIcon } from "@heroicons/react/24/outline";

const PremiumSidebar = ({ open, onClose, user, onLogout }) => {
	const { showAuthModal } = useAuthModalContext();
	const { showMessage } = useMessage();
	const location = useLocation();
	const [language, setLanguage] = useState("pt-BR");
	const [currency, setCurrency] = useState("BRL");
	const [darkMode, setDarkMode] = useState(false);
	const [profileOpen, setProfileOpen] = useState(false);

	const sidebarVariants = {
		hidden: {
			x: 500,
			opacity: 0,
		},
		visible: {
			x: 0,
			opacity: 1,
			transition: {
				duration: 0.4,
				ease: [0.22, 1, 0.36, 1],
			},
		},
		exit: {
			x: 500,
			opacity: 0,
			transition: {
				duration: 0.3,
			},
		},
	};

	const containerVariants = {
		visible: {
			transition: {
				staggerChildren: 0.05,
				delayChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 10 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.3,
				ease: "easeOut",
			},
		},
	};

	const handleLogout = async () => {
		try {
			await axios.post("/users/logout", {}, { withCredentials: true });
			delete axios.defaults.headers.common["Authorization"];
			localStorage.clear();
			onLogout();
			showMessage("Logout realizado com sucesso!", "success");
			onClose();
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	return (
		<AnimatePresence>
			{open && (
				<>
					{/* Blur Background */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
					/>

					{/* Sidebar */}
					<motion.div
						variants={sidebarVariants}
						initial="hidden"
						animate="visible"
						exit="exit"
						className="fixed right-0 top-0 h-screen w-96 bg-[#FAFAF9] shadow-2xl z-50 overflow-y-auto flex flex-col"
					>
						{/* ============ AUTHENTICATED STATE ============ */}
						{user ? (
							<>
								{/* HEADER */}
								<motion.div
									variants={itemVariants}
									className="p-8 border-b border-gray-200"
								>
									<div className="flex items-center justify-between">
										<motion.p
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: 0.2 }}
											className="text-gray-600 text-xl font-light"
										>
											Olá, {user.name.split(" ")[0]} 👋
										</motion.p>
										{/* <img
											src={logo__primary}
											alt="DormeAqui"
											className="w-32 mb-2"
										/> */}
										<X
											size={20}
											className="text-gray-400 cursor-pointer"
											onClick={onClose}
										/>
									</div>
								</motion.div>

								{/* SECTIONS */}
								<motion.div
									variants={containerVariants}
									initial="hidden"
									animate="visible"
									className="flex-1 px-6 py-6 space-y-8"
								>
									{/* EXPLORE SECTION */}
									<motion.div variants={itemVariants} className="space-y-3">
										<p className="text-xs font-light text-gray-400 uppercase tracking-widest">
											Explorar
										</p>
										<div className="space-y-2">
											{[
												{
													path: "/",
													label: "Home",
													icon: () => {
														return <Home className="w-5 h-5" />;
													},
												},
												{
													path: "/account/places",
													label: "Acomodações",
													icon: () => {
														return <HomeModernIcon className="w-5 h-5" />;
													},
												},
											].map((item, idx) => {
												const isActive = location.pathname === item.path;
												return (
													<motion.div
														key={item.path}
														whileHover={{ x: 2 }}
														whileTap={{ scale: 0.98 }}
													>
														<Link
															to={item.path}
															onClick={onClose}
															className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
																isActive
																	? "bg-gradient-to-r from-primary-900 to-primary-800 text-white shadow-lg shadow-primary-200"
																	: "hover:bg-gray-100 text-gray-700"
															}`}
														>
															<motion.div
																className="relative"
																whileHover={{
																	x: 2,
																}}
															>
																{item.icon()}
															</motion.div>
															<span className="font-medium text-sm">
																{item.label}
															</span>
															{isActive && (
																<motion.div
																	layoutId="indicator"
																	className="ml-auto w-1 h-4 bg-white rounded-full"
																/>
															)}
														</Link>
													</motion.div>
												);
											})}
										</div>
									</motion.div>

									{/* MY ACTIVITY SECTION */}
									<motion.div variants={itemVariants} className="space-y-3">
										<p className="text-xs font-light text-gray-400 uppercase tracking-widest">
											Minha Atividade
										</p>
										<div className="space-y-2">
											{[
												{
													path: "/account/bookings",
													label: "Reservas",
													icon: Calendar,
												},
												{
													path: "/account/message",
													label: "Mensagens",
													icon: MessageCircle,
												},
											].map((item, idx) => {
												const isActive = location.pathname === item.path;
												return (
													<motion.div
														key={item.path}
														whileHover={{ x: 2 }}
														whileTap={{ scale: 0.98 }}
													>
														<Link
															to={item.path}
															onClick={onClose}
															className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
																isActive
																	? "bg-gradient-to-r from-primary-900 to-primary-800 text-white shadow-lg shadow-primary-200"
																	: "hover:bg-gray-100 text-gray-700"
															}`}
														>
															<motion.div
																whileHover={{
																	x: 2,
																}}
															>
																<item.icon
																	size={18}
																	strokeWidth={isActive ? 2.5 : 2}
																/>
															</motion.div>
															<span className="font-medium text-sm">
																{item.label}
															</span>
															{isActive && (
																<motion.div
																	layoutId="indicator"
																	className="ml-auto w-1 h-4 bg-white rounded-full"
																/>
															)}
														</Link>
													</motion.div>
												);
											})}
										</div>
									</motion.div>
								</motion.div>

								{/* USER PROFILE BLOCK */}
								<motion.div
									variants={itemVariants}
									className="p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white"
								>
									<button
										onClick={() => setProfileOpen(!profileOpen)}
										className="w-full flex items-center gap-3 group"
									>
										<div className="relative flex-shrink-0">
											<img
												src={user.photo}
												alt={user.name}
												className="w-12 h-12 rounded-full object-cover border-2 border-primary-200 shadow-md"
											/>
											<motion.div
												className="absolute -bottom-1 -right-1 bg-primary-500 rounded-full p-0.5"
												animate={{
													scale: [1, 1.1, 1],
												}}
												transition={{
													duration: 2,
													repeat: Infinity,
												}}
											>
												<SparklesIcon size={10} className="text-white" />
											</motion.div>
										</div>
										<div className="flex-1 text-left">
											<p className="font-semibold text-gray-900 text-sm">
												{user.name}
											</p>
											<p className="text-xs text-gray-500 truncate">
												{user.email}
											</p>
										</div>
										<motion.div
											animate={{
												rotate: profileOpen ? 180 : 0,
											}}
											transition={{
												duration: 0.3,
											}}
										>
											<ChevronDown size={18} className="text-gray-400" />
										</motion.div>
									</button>

									{/* Dropdown Menu */}
									<AnimatePresence>
										{profileOpen && (
											<motion.div
												initial={{
													opacity: 0,
													y: -10,
												}}
												animate={{
													opacity: 1,
													y: 0,
												}}
												exit={{
													opacity: 0,
													y: -10,
												}}
												className="mt-4 pt-4 border-t border-gray-200 space-y-2"
											>
												<motion.div whileHover={{ x: 2 }}>
													<Link
														to="/account/profile"
														onClick={() => {
															onClose();
															setProfileOpen(false);
														}}
														className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-100 text-gray-700 transition-all text-sm font-medium"
													>
														<Home size={16} />
														Meu Perfil
													</Link>
												</motion.div>
												<motion.div whileHover={{ x: 2 }}>
													<Link
														to="/account/settings"
														onClick={() => {
															onClose();
															setProfileOpen(false);
														}}
														className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-100 text-gray-700 transition-all text-sm font-medium"
													>
														<Settings size={16} />
														Configurações
													</Link>
												</motion.div>
												<motion.div whileHover={{ x: 2 }}>
													<button
														onClick={() => {
															handleLogout();
															setProfileOpen(false);
														}}
														className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-red-50 text-red-600 transition-all text-sm font-medium"
													>
														<LogOut size={16} />
														Sair
													</button>
												</motion.div>
											</motion.div>
										)}
									</AnimatePresence>
								</motion.div>
							</>
						) : (
							<>
								{/* ============ UNAUTHENTICATED STATE ============ */}

								{/* HEADER */}
								<motion.div
									variants={itemVariants}
									className="p-8 border-b border-gray-200"
								>
									<img
										src={logo__primary}
										alt="DormeAqui"
										className="w-32 mb-3"
									/>
									<motion.p
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 0.2 }}
										className="text-gray-600 text-sm font-light"
									>
										Descubra as melhores acomodações, reserve com facilidade e
										aproveite sua viagem!
									</motion.p>
								</motion.div>

								{/* SECTIONS */}
								{/* <motion.div
									variants={containerVariants}
									initial="hidden"
									animate="visible"
									className="flex-1 px-6 py-6 space-y-8"
								>
									<motion.div variants={itemVariants} className="space-y-3">
										<p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
											Explorar
										</p>
										<div className="space-y-2">
											{[
												{
													label: "Explorar Acomodações",
													icon: Compass,
													path: "/",
												},
											].map((item, idx) => (
												<Link key={idx} to={item.path} onClick={onClose}>
													<motion.div
														variants={itemVariants}
														whileHover={{ x: 2 }}
														whileTap={{ scale: 0.98 }}
														className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 text-gray-700 transition-all duration-300 group text-left font-medium text-sm"
													>
														<motion.div whileHover={{ x: 2 }}>
															<item.icon size={18} strokeWidth={2} />
														</motion.div>
														<span>{item.label}</span>
													</motion.div>
												</Link>
											))}
										</div>
									</motion.div>

									<motion.div variants={itemVariants} className="space-y-3">
										<p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
											Torne-se Anfitrião
										</p>
										<div className="space-y-2">
											{[
												{
													label: "Suas acomodações",
													icon: Home,
													path: "/account/places",
												},
											].map((item, idx) => (
												<Link key={idx} to={item.path} onClick={onClose}>
													<motion.div
														variants={itemVariants}
														whileHover={{ x: 2 }}
														whileTap={{ scale: 0.98 }}
														className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 text-gray-700 transition-all duration-300 group text-left font-medium text-sm"
													>
														<motion.div whileHover={{ x: 2 }}>
															<item.icon size={18} strokeWidth={2} />
														</motion.div>
														<span>{item.label}</span>
													</motion.div>
												</Link>
											))}
										</div>
									</motion.div> */}

								{/* <motion.div
										variants={itemVariants}
										className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl border border-indigo-200 space-y-3"
									>
										<p className="text-xs font-semibold text-indigo-900 uppercase tracking-widest">
											✨ Por Que Confiar
										</p>
										<div className="space-y-2.5 text-sm text-indigo-900">
											<div className="flex items-start gap-2">
												<Lock size={16} className="mt-0.5 flex-shrink-0" />
												<span className="font-medium">Pagamentos seguros</span>
											</div>
											<div className="flex items-start gap-2">
												<Clock size={16} className="mt-0.5 flex-shrink-0" />
												<span className="font-medium">Suporte 24/7</span>
											</div>
											<div className="flex items-start gap-2">
												<Star size={16} className="mt-0.5 flex-shrink-0" />
												<span className="font-medium">
													Avaliações verificadas
												</span>
											</div>
										</div>
									</motion.div>
								</motion.div>
                                 */}

								{/* CTA SECTION */}
								<motion.div
									variants={itemVariants}
									className="p-6 space-y-3 border-t border-gray-200"
								>
									<motion.button
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										onClick={() => {
											showAuthModal("register");
											onClose();
										}}
										className="w-full bg-gradient-to-r from-primary-900 to-primary-800 hover:from-primary-800 hover:to-primary-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl"
									>
										Criar Conta
									</motion.button>
									<motion.button
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										onClick={() => {
											showAuthModal("login");
											onClose();
										}}
										className="w-full bg-white hover:bg-gray-50 text-primary-900 border-2 border-primary-900 font-semibold py-3 px-4 rounded-xl transition-all"
									>
										Entrar
									</motion.button>
								</motion.div>

								{/* FOOTER */}
								<motion.div
									variants={itemVariants}
									className="p-6 border-t border-gray-200 space-y-3 bg-gradient-to-t from-gray-50 to-transparent"
								>
									{/* <div className="grid grid-cols-2 gap-3">
										<select
											value={language}
											onChange={(e) => setLanguage(e.target.value)}
											className="text-xs px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:border-gray-300 transition-all cursor-pointer"
										>
											<option value="pt-BR">🇧🇷 Português</option>
											<option value="en-US">🇺🇸 English</option>
											<option value="es-ES">🇪🇸 Español</option>
										</select>

										<select
											value={currency}
											onChange={(e) => setCurrency(e.target.value)}
											className="text-xs px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:border-gray-300 transition-all cursor-pointer"
										>
											<option value="BRL">BRL</option>
											<option value="USD">USD</option>
											<option value="EUR">EUR</option>
										</select>
									</div>

									<motion.button
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										onClick={() => setDarkMode(!darkMode)}
										className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-white border border-gray-200 hover:border-gray-300 transition-all text-sm font-medium text-gray-700"
									>
										<span className="flex items-center gap-2">
											{darkMode ? (
												<>
													<Moon size={16} />
													Escuro
												</>
											) : (
												<>
													<Sun size={16} />
													Claro
												</>
											)}
										</span>
										<motion.div
											animate={{
												rotate: darkMode ? 180 : 0,
											}}
											className={`w-5 h-3 rounded-full transition-colors ${
												darkMode ? "bg-gray-700" : "bg-gray-300"
											}`}
										/>
									</motion.button> */}

									<p className="text-xs text-gray-500 text-center pt-2">
										© 2025 DormeAqui. Todos direitos reservados.
									</p>
								</motion.div>
							</>
						)}
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
};

export default PremiumSidebar;
