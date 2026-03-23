import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { LogOut, LogIn, UserPlus } from "lucide-react";

import { useUserContext } from "@/components/contexts/UserContext";
import { useAuthModalContext } from "@/components/contexts/AuthModalContext";
import { useNotification } from "@/components/contexts/NotificationContext";
import NotificationBell from "@/components/common/NotificationBell";
import logoPrimary from "@/assets/logos/logo__primary.png";

const SimpleNavbar = ({ isAbsolute }) => {
	const { user, setUser } = useUserContext();
	const { showAuthModal } = useAuthModalContext();
	const { addNotification } = useNotification();
	const navigate = useNavigate();
	const location = useLocation();
	const [userMenuOpen, setUserMenuOpen] = useState(false);

	const logout = async () => {
		try {
			await axios.post("/users/logout", {}, { withCredentials: true });
			delete axios.defaults.headers.common["Authorization"];
			localStorage.clear();
			sessionStorage.clear();
			setUser(null);
			setUserMenuOpen(false);
			addNotification({
				title: "Até logo 👋",
				message:
					"Esperamos que tenha curtido sua experiência no DormeAqui. Volte sempre que precisar de um lugar para descansar.",
				type: "goodbye",
				icon: "👋",
			});
			navigate("/");
		} catch {
			addNotification({
				title: "❌ Erro",
				message: "Erro ao sair. Tente novamente.",
				type: "error",
				icon: "❌",
			});
		}
	};

	// Check if path is active - exact match only
	const isActive = (href) => {
		if (href === "/") {
			return location.pathname === "/";
		}
		return location.pathname === href;
	};

	return (
		<nav
			className={`${
				isAbsolute
					? "absolute top-0 left-0 right-0 z-50 text-white"
					: "relative "
			} w-full hidden md:block`}
		>
			<div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
				{/* Logo */}
				{isAbsolute ? (
					<></>
				) : (
					<Link to="/" className="flex-shrink-0">
						<img
							src={logoPrimary}
							alt="Logo DormeAqui"
							className="h-12 object-contain"
						/>
					</Link>
				)}

				{/* Center Navigation Items */}
				<div className="flex items-center gap-8 flex-1 justify-center">
					{/* Home */}
					{user && (
						<Link
							to="/"
							className={
								isActive("/")
									? "font-bold text-white"
									: "text-gray-700  text-sm"
							}
						>
							Home
						</Link>
					)}

					{/* Reservas - Only for logged in users */}
					{user && (
						<Link
							to="/account/bookings"
							className={`${
								isActive("/account/bookings")
									? "font-bold text-gray-900"
									: "text-gray-700  text-sm"
							} ${isAbsolute && "text-white text-sm"}`}
						>
							Reservas
						</Link>
					)}

					{/* Acomodações - Only for logged in users */}
					{user && (
						<Link
							to="/account/places"
							className={`${
								isActive("/account/places")
									? "font-bold text-gray-900"
									: "text-gray-700  text-sm"
							} ${isAbsolute && "text-white  text-sm"}`}
						>
							Acomodações
						</Link>
					)}
				</div>

				{/* Right Section - Notifications and User Menu */}
				<div className="flex items-center gap-4">
					{/* Notification Bell - Only for logged in users */}
					{user && <NotificationBell isAbsolute={isAbsolute} />}

					{/* User Menu */}
					{user ? (
						<div className="relative">
							<button
								onClick={() => setUserMenuOpen(!userMenuOpen)}
								className="w-10 h-10 rounded-full bg-gray-300 hover:bg-gray-400 transition-colors overflow-hidden flex items-center justify-center"
							>
								{user.photo ? (
									<img
										src={user.photo}
										alt={user.name}
										className="w-full h-full object-cover"
									/>
								) : (
									<span className="text-gray-700 font-bold">
										{user.name?.charAt(0).toUpperCase()}
									</span>
								)}
							</button>

							{/* Dropdown Menu */}
							{userMenuOpen && (
								<div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
									<Link
										to="/account/profile"
										onClick={() => setUserMenuOpen(false)}
										className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
									>
										Meu Perfil
									</Link>
									<Link
										to="/account/profile/edit"
										onClick={() => setUserMenuOpen(false)}
										className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
									>
										Editar Perfil
									</Link>
									<div className="border-t border-gray-200" />
									<button
										onClick={logout}
										className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium flex items-center gap-2"
									>
										<LogOut size={16} />
										Sair
									</button>
								</div>
							)}
						</div>
					) : (
						/* Login/Register Buttons */
						<div className="flex items-center gap-4">
							<Link
								to="/"
								className={
									isActive("/")
										? "flex items-center gap-2 px-4 py-2  text-white rounded-full hover:bg-white/20 font-medium transition-colors"
										: "text-gray-700  text-sm"
								}
							>
								Home
							</Link>
							<button
								onClick={() => showAuthModal("login")}
								className="flex items-center gap-2 px-4 py-2 bg-primary-900 text-white cursor-pointer hover:bg-primary-900/80 rounded-full font-medium transition-colors"
							>
								<span>Entre ou Cadastra-se</span>
							</button>
						</div>
					)}
				</div>
			</div>
		</nav>
	);
};

export default SimpleNavbar;
