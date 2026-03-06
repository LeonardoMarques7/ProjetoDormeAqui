import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
	ChevronLeft,
	ChevronRight,
	LogIn,
	LogOut,
	UserPlus,
	ChevronsUpDown,
	X,
} from "lucide-react";
import {
	HomeIcon,
	CalendarDaysIcon,
	BuildingOfficeIcon,
	ChatBubbleOvalLeftIcon,
	UserIcon,
	Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import {
	HomeIcon as HomeIconSolid,
	CalendarDaysIcon as CalendarDaysIconSolid,
	BuildingOfficeIcon as BuildingOfficeIconSolid,
	ChatBubbleOvalLeftIcon as ChatBubbleOvalLeftIconSolid,
} from "@heroicons/react/24/solid";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
	TooltipProvider,
} from "@/components/ui/tooltip";
import axios from "axios";
import { useUserContext } from "@/components/contexts/UserContext";
import { useAuthModalContext } from "@/components/contexts/AuthModalContext";
import { useMessage } from "@/components/contexts/MessageContext";
import logoPrimary from "@/assets/logos/logo__primary.png";
import logoIcon from "@/assets/logo__primary__icon.png";
import SidebarItem from "./SidebarItem";

const EXPANDED_W = 240;
const COLLAPSED_W = 72;

/** Conteúdo interno compartilhado entre desktop e mobile */
const SidebarContent = ({
	isCollapsed,
	navItems,
	user,
	nameUser,
	logout,
	showAuthModal,
	onClose,
	showToggle,
	onToggle,
}) => (
	<div className="flex flex-col h-full py-5">
		{/* Logo + botão toggle/fechar */}
		<div
			className={`flex items-center mb-8 px-4 ${
				isCollapsed ? "justify-center" : "justify-between"
			}`}
		>
			<Link to="/" onClick={onClose}>
				<AnimatePresence mode="wait" initial={false}>
					{isCollapsed ? (
						<motion.img
							key="icon"
							src={logoIcon}
							alt="DormeAqui"
							className="h-8 object-contain"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.15 }}
						/>
					) : (
						<motion.img
							key="logo"
							src={logoPrimary}
							alt="DormeAqui"
							className="h-9 object-contain"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.15 }}
						/>
					)}
				</AnimatePresence>
			</Link>

			{showToggle && (
				<motion.button
					onClick={onToggle}
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.9 }}
					className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors cursor-pointer"
					title={isCollapsed ? "Expandir" : "Recolher"}
				>
					{isCollapsed ? (
						<ChevronRight className="w-4 h-4" />
					) : (
						<ChevronLeft className="w-4 h-4" />
					)}
				</motion.button>
			)}

			{!showToggle && onClose && (
				<button
					onClick={onClose}
					className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 cursor-pointer"
				>
					<X className="w-4 h-4" />
				</button>
			)}
		</div>

		{/* Itens de navegação */}
		<nav className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto">
			{navItems.map((item) => (
				<SidebarItem
					key={item.path}
					item={item}
					isCollapsed={isCollapsed}
					onClick={onClose}
				/>
			))}
		</nav>

		{/* Footer: perfil / login */}
		<div className="px-3 pt-4 mt-4 border-t border-gray-100">
			{user ? (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<motion.button
							whileTap={{ scale: 0.97 }}
							className={`w-full flex items-center rounded-xl p-2 hover:bg-gray-100 transition-colors cursor-pointer outline-none ${
								isCollapsed ? "justify-center" : "gap-2.5"
							}`}
						>
							<img
								src={user.photo}
								alt="Avatar"
								className="w-9 h-9 rounded-full object-cover flex-shrink-0"
							/>
							<AnimatePresence initial={false}>
								{!isCollapsed && (
									<motion.div
										key="user-info"
										initial={{ opacity: 0, x: -6 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: -6 }}
										transition={{ duration: 0.15 }}
										className="flex-1 text-left overflow-hidden"
									>
										<p className="text-sm font-semibold text-gray-800 truncate">
											{nameUser[0]}
										</p>
										<p className="text-xs text-gray-500 truncate">
											{user.pronouns || user.email}
										</p>
									</motion.div>
								)}
							</AnimatePresence>
							{!isCollapsed && (
								<ChevronsUpDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
							)}
						</motion.button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						side={isCollapsed ? "right" : "top"}
						align="end"
						sideOffset={8}
						className="w-52"
					>
						<Link to="/account/profile" onClick={onClose}>
							<DropdownMenuItem className="cursor-pointer py-2 gap-2">
								<UserIcon className="w-4 h-4" />
								Acessar perfil
							</DropdownMenuItem>
						</Link>
						<DropdownMenuItem className="cursor-pointer py-2 gap-2">
							<Cog6ToothIcon className="w-4 h-4" />
							Configurações
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => {
								logout();
								onClose?.();
							}}
							className="cursor-pointer py-2 gap-2 text-red-500 focus:text-red-600 focus:bg-red-50"
						>
							<LogOut className="w-4 h-4" />
							Sair
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			) : (
				<div className={`flex flex-col gap-2 ${isCollapsed ? "items-center" : ""}`}>
					{isCollapsed ? (
						<TooltipProvider delayDuration={0}>
							<Tooltip>
								<TooltipTrigger asChild>
									<motion.button
										whileTap={{ scale: 0.93 }}
										onClick={() => {
											showAuthModal("login");
											onClose?.();
										}}
										className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
									>
										<LogIn className="w-5 h-5" />
									</motion.button>
								</TooltipTrigger>
								<TooltipContent side="right" sideOffset={10}>
									Entrar
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					) : (
						<>
							<button
								onClick={() => {
									showAuthModal("login");
									onClose?.();
								}}
								className="w-full flex items-center justify-center gap-2 bg-primary-900 text-white px-4 py-2.5 rounded-xl hover:bg-black transition-colors text-sm font-medium cursor-pointer"
							>
								<LogIn className="w-4 h-4" />
								Entrar na conta
							</button>
							<button
								onClick={() => {
									showAuthModal("register");
									onClose?.();
								}}
								className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium cursor-pointer"
							>
								<UserPlus className="w-4 h-4" />
								Criar conta
							</button>
						</>
					)}
				</div>
			)}
		</div>
	</div>
);

const AppSidebar = ({ mobileOpen = false, onMobileClose = () => {} }) => {
	const { user, setUser } = useUserContext();
	const { showAuthModal } = useAuthModalContext();
	const { showMessage } = useMessage();
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [bookings, setBookings] = useState([]);
	const [qtdBookings, setQtdBookings] = useState(0);
	const [logoutActive, setLogoutActive] = useState(false);

	useEffect(() => {
		if (!user) {
			setBookings([]);
			return;
		}
		axios
			.get("/bookings/owner")
			.then(({ data }) => setTimeout(() => setBookings(data), 100));
	}, [user?._id]);

	useEffect(() => setQtdBookings(bookings.length), [bookings.length]);

	const logout = async () => {
		try {
			await axios.post("/users/logout", {}, { withCredentials: true });
			delete axios.defaults.headers.common["Authorization"];
			localStorage.clear();
			sessionStorage.clear();
			setUser(null);
			setLogoutActive(true);
		} catch (error) {
			alert(JSON.stringify(error));
		}
	};

	if (logoutActive) {
		showMessage("Logout realizado com sucesso!", "info");
		setLogoutActive(false);
	}

	const navItems = [
		{ path: "/", icon: HomeIcon, iconActive: HomeIconSolid, label: "Home" },
		{
			path: "/account/bookings",
			icon: CalendarDaysIcon,
			iconActive: CalendarDaysIconSolid,
			label: "Reservas",
			notifications: qtdBookings,
		},
		{
			path: "/account/places",
			icon: BuildingOfficeIcon,
			iconActive: BuildingOfficeIconSolid,
			label: "Acomodações",
		},
		{
			path: "/account/message",
			icon: ChatBubbleOvalLeftIcon,
			iconActive: ChatBubbleOvalLeftIconSolid,
			label: "Mensagens",
		},
	];

	const nameUser = user?.name ? user.name.split(" ") : ["", ""];
	const sharedProps = { navItems, user, nameUser, logout, showAuthModal };

	return (
		<>
			{/* ── Desktop sidebar ─────────────────────────────────── */}
			<motion.aside
				animate={{ width: isCollapsed ? COLLAPSED_W : EXPANDED_W }}
				transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
				className="hidden lg:flex flex-col h-screen sticky top-0 bg-white border-r border-gray-100 flex-shrink-0 overflow-hidden z-30 shadow-sm"
			>
				<SidebarContent
					{...sharedProps}
					isCollapsed={isCollapsed}
					showToggle
					onToggle={() => setIsCollapsed((v) => !v)}
					onClose={() => {}}
				/>
			</motion.aside>

			{/* ── Mobile: backdrop ────────────────────────────────── */}
			<AnimatePresence>
				{mobileOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
						onClick={onMobileClose}
					/>
				)}
			</AnimatePresence>

			{/* ── Mobile: sidebar drawer ──────────────────────────── */}
			<motion.aside
				initial={false}
				animate={{ x: mobileOpen ? 0 : -300 }}
				transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
				className="fixed top-0 left-0 h-screen w-72 bg-white border-r border-gray-100 shadow-2xl z-50 flex flex-col lg:hidden"
			>
				<SidebarContent
					{...sharedProps}
					isCollapsed={false}
					showToggle={false}
					onClose={onMobileClose}
				/>
			</motion.aside>
		</>
	);
};

export default AppSidebar;
