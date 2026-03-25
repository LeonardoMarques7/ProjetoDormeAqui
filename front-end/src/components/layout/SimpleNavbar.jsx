import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
	LogOut,
	User,
	CreditCard,
	Settings,
	HelpCircle,
	Users,
	Plus,
	Zap,
	ChevronRight,
	Search,
	CircleQuestionMarkIcon,
} from "lucide-react";

import { useUserContext } from "@/components/contexts/UserContext";
import { useAuthModalContext } from "@/components/contexts/AuthModalContext";
import { useNotification } from "@/components/contexts/NotificationContext";
import NotificationBell from "@/components/common/NotificationBell";
import logoPrimary from "@/assets/logos/logo__primary.png";
import {
	ArrowRightStartOnRectangleIcon,
	BuildingLibraryIcon,
	BuildingStorefrontIcon,
	Cog6ToothIcon,
	HomeModernIcon,
	TicketIcon,
} from "@heroicons/react/24/outline";

const SimpleNavbar = ({ isAbsolute }) => {
	const { user, setUser } = useUserContext();
	const { showAuthModal } = useAuthModalContext();
	const { addNotification } = useNotification();
	const navigate = useNavigate();
	const location = useLocation();
	const [userMenuOpen, setUserMenuOpen] = useState(false);
	const menuRef = useRef(null);

	// Close on outside click
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (menuRef.current && !menuRef.current.contains(e.target)) {
				setUserMenuOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

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

	const isActive = (href) => {
		if (href === "/") return location.pathname === "/";
		return location.pathname === href;
	};

	const initials = user?.name
		?.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<nav
			className={`${
				isAbsolute
					? "absolute top-0 left-0 right-0 z-50 text-white"
					: "relative"
			} w-full hidden md:block`}
		>
			<div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
				{/* Logo */}
				{!isAbsolute && (
					<Link to="/" className="flex-shrink-0">
						<img
							src={logoPrimary}
							alt="Logo DormeAqui"
							className="h-12 object-contain"
						/>
					</Link>
				)}

				{/* Center Navigation */}
				<div className="flex items-center gap-8 flex-1 justify-center">
					{user && (
						<Link
							to="/"
							className={
								isActive("/") ? "font-bold text-white" : "text-gray-700 text-sm"
							}
						>
							Home
						</Link>
					)}
					{user && (
						<Link
							to="/account/bookings"
							className={`${
								isActive("/account/bookings")
									? "font-bold text-gray-900"
									: "text-gray-700 text-sm"
							} ${isAbsolute && "text-white text-sm"}`}
						>
							Reservas
						</Link>
					)}
					{user && (
						<Link
							to="/account/places"
							className={`${
								isActive("/account/places")
									? "font-bold text-gray-900"
									: "text-gray-700 text-sm"
							} ${isAbsolute && "text-white text-sm"}`}
						>
							Acomodações
						</Link>
					)}
				</div>

				{/* Right Section */}
				<div className="flex items-center gap-4">
					{user && <NotificationBell isAbsolute={isAbsolute} />}

					{user ? (
						<div className="relative" ref={menuRef}>
							{/* Avatar Button */}
							<button
								onClick={() => setUserMenuOpen(!userMenuOpen)}
								className={`w-10 h-10  cursor-pointer rounded-full transition-all duration-200 overflow-hidden flex items-center justify-center ring-2 ring-offset-1 ${
									userMenuOpen
										? "ring-primary-400"
										: "ring-transparent hover:ring-gray-300"
								}`}
								style={{
									background: !user.photo
										? "linear-gradient(135deg, #a78bfa, #ec4899)"
										: undefined,
									backgroundColor: user.photo ? undefined : undefined,
								}}
							>
								{user.photo ? (
									<img
										src={user.photo}
										alt={user.name}
										className="w-full h-full object-cover"
									/>
								) : (
									<span className="text-white font-semibold text-sm">
										{initials}
									</span>
								)}
							</button>

							{/* Dropdown Menu */}
							{userMenuOpen && (
								<div
									className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
									style={{ animation: "dropIn 0.15s ease-out" }}
								>
									<style>{`
										@keyframes dropIn {
											from { opacity: 0; transform: translateY(-6px) scale(0.97); }
											to   { opacity: 1; transform: translateY(0) scale(1); }
										}
									`}</style>

									{/* User Info Header */}
									<Link
										to="/account/profile"
										onClick={() => setUserMenuOpen(false)}
										className="flex items-center hover:bg-gray-50 gap-3 px-4 py-3.5"
									>
										<div
											className="w-10 h-10  rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
											style={{
												background: !user.photo
													? "linear-gradient(135deg, #a78bfa, #ec4899)"
													: undefined,
											}}
										>
											{user.photo ? (
												<img
													src={user.photo}
													alt={user.name}
													className="w-full h-full object-cover"
												/>
											) : (
												<span className="text-white font-semibold text-sm">
													{initials}
												</span>
											)}
										</div>
										<div className="min-w-0">
											<p className="text-sm font-semibold text-gray-900 truncate">
												{user.name}
											</p>
											<p className="text-xs text-gray-400 truncate">
												{user.email}
											</p>
										</div>
										<ChevronRight size={15} className="ml-auto text-gray-500" />
									</Link>

									<div className="mx-3 border-t border-gray-100" />

									{/* Main Menu Items */}
									<div className="py-1.5">
										{/* Community */}
										<div className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors group cursor-pointer">
											<HomeModernIcon
												width={16}
												height={16}
												className="text-gray-400 group-hover:text-gray-600 flex-shrink-0"
											/>
											<Link
												to="/account/places"
												onClick={() => setUserMenuOpen(false)}
												className="text-sm text-gray-700 font-medium flex-1"
											>
												Acomodações
											</Link>
											<Link
												to="/account/places/new"
												onClick={() => setUserMenuOpen(false)}
												title="Criar acomodação"
												className="w-5 h-5 rounded-full bg-violet-300 hover:bg-violet-500 flex items-center justify-center transition-colors"
											>
												<Plus size={12} className="text-white!" />
											</Link>
										</div>

										{/* Subscription */}
										<Link
											to="/account/bookings"
											onClick={() => setUserMenuOpen(false)}
											className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors group"
										>
											<TicketIcon
												width={16}
												height={16}
												className="text-gray-400 group-hover:text-gray-600 flex-shrink-0"
											/>
											<span className="text-sm text-gray-700 font-medium flex-1">
												Reservas
											</span>
										</Link>

										{/* Settings */}
										<Link
											to="/account/settings"
											onClick={() => setUserMenuOpen(false)}
											className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors group"
										>
											<Cog6ToothIcon
												width={16}
												height={16}
												className="text-gray-400 group-hover:text-gray-600 flex-shrink-0"
											/>
											<span className="text-sm text-gray-700 font-medium">
												Configurações
											</span>
										</Link>
									</div>

									<div className="mx-3 border-t border-gray-100" />

									{/* Bottom Items */}
									<div className="pt-1.5">
										<Link
											to="/help"
											onClick={() => setUserMenuOpen(false)}
											className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors group"
										>
											<CircleQuestionMarkIcon
												width={16}
												height={16}
												className="text-gray-400 group-hover:text-gray-600 flex-shrink-0"
											/>
											<span className="text-sm text-gray-700 font-medium">
												Central de ajuda
											</span>
										</Link>

										<button
											onClick={logout}
											className="w-full cursor-pointer flex items-center hover:bg-red-50 gap-3 px-4 py-2 transition-colors group"
										>
											<ArrowRightStartOnRectangleIcon
												width={16}
												height={16}
												className="text-gray-400 group-hover:text-red-500 flex-shrink-0"
											/>
											<span className="text-sm text-gray-700 group-hover:text-red-600 font-medium">
												Sair
											</span>
										</button>
									</div>
								</div>
							)}
						</div>
					) : (
						<div className="flex items-center gap-4">
							<Link
								to="/"
								className={
									isActive("/")
										? "flex items-center gap-2 px-4 py-2 text-white rounded-full hover:bg-white/20 font-medium transition-colors"
										: "text-gray-700 text-sm"
								}
							>
								Home
							</Link>
							<button
								onClick={() => showAuthModal("login")}
								className="flex items-center gap-2 px-4 py-2 bg-primary-900 text-white cursor-pointer hover:bg-primary-900/80 rounded-full font-medium transition-colors"
							>
								<span>Entre ou Cadastre-se</span>
							</button>
						</div>
					)}
				</div>
			</div>
		</nav>
	);
};

export default SimpleNavbar;
