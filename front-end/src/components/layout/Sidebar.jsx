import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, LogIn, LogOut, User, UserPlus } from "lucide-react";
import {
	HomeIcon,
	CalendarDaysIcon,
	BuildingOfficeIcon,
	UserIcon,
	Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import {
	HomeIcon as HomeIconSolid,
	CalendarDaysIcon as CalendarDaysIconSolid,
	BuildingOfficeIcon as BuildingOfficeIconSolid,
} from "@heroicons/react/24/solid";

import logoPrimary from "@/assets/logos/logo__primary__min.png";
import { useAuthModalContext } from "@/components/contexts/AuthModalContext";
import { useMessage } from "@/components/contexts/MessageContext";
import { useUserContext } from "@/components/contexts/UserContext";

import axios from "axios";
import {
	Sidebar as ShadcnSidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
	useSidebar,
} from "@/components/ui/sidebar";

const NavItems = ({ items }) => {
	const { state } = useSidebar();
	const location = useLocation();
	const isCollapsed = state === "collapsed";

	return (
		<SidebarMenu className="gap-1 px-2">
			{items.map((item) => {
				const isActive = location.pathname === item.path;
				const Icon = isActive ? item.icon : item.iconRegular;
				return (
					<SidebarMenuItem key={item.path}>
						<SidebarMenuButton
							asChild
							tooltip={item.label}
							className={`
								h-11! rounded-full! px-3! gap-3! transition-all duration-200
								${
									isActive
										? "bg-white! text-gray-900! hover:bg-white! shadow-sm!"
										: "text-gray-600! hover:bg-white/70! hover:text-gray-900!"
								}
							`}
						>
							<Link to={item.path}>
								<div className="relative flex-shrink-0 p-1">
									<Icon className="w-[18px] h-[18px]" />
								</div>
								<span className="group-data-[collapsible=icon]:hidden text-sm font-medium flex-1">
									{item.label}
								</span>
								{item.notifications > 0 && !isCollapsed && (
									<span className="ml-auto min-w-[22px] h-[22px] bg-gray-900 text-white text-xs font-medium rounded-full flex items-center justify-center px-1">
										{item.notifications}
									</span>
								)}
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				);
			})}
		</SidebarMenu>
	);
};

const AppSidebar = () => {
	const { user, setUser } = useUserContext();
	const { showMessage } = useMessage();
	const { showAuthModal } = useAuthModalContext();
	const [bookings, setBookings] = useState([]);
	const [qtdBookings, setQtdBookings] = useState(0);
	const [logoutActive, setLogoutActive] = useState(false);

	useEffect(() => {
		if (!user) {
			setBookings([]);
			return;
		}
		const fetchBookings = async () => {
			const { data } = await axios.get("/bookings/owner");
			setBookings(data);
		};
		fetchBookings();
	}, [user?._id]);

	useEffect(() => {
		setQtdBookings(bookings.length);
	}, [bookings.length]);

	const navItems = [
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
	];

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
		showMessage("Logout realizado com sucesso!", "success");
		setLogoutActive(false);
	}

	const nameUser = user?.name ? user.name.split(" ") : ["", ""];

	return (
		<ShadcnSidebar
			variant="floating"
			collapsible="icon"
			style={{
				"--sidebar-background": "#f5f5f5",
				"--sidebar-border": "transparent",
				"--sidebar-width": "220px",
				"--sidebar-width-icon": "68px",
			}}
			className="border-0 shadow-sm"
		>
			{/* Header: Logo + Bell + User Avatar */}
			<SidebarHeader className="px-3 pt-3 pb-2">
				<div className="flex items-center gap-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
					{/* Logo */}
					<Link
						to="/"
						className="flex-1 flex items-center min-w-0 group-data-[collapsible=icon]:hidden"
					>
						<img
							src={logoPrimary}
							alt="DormeAqui"
							className="h-9 object-contain max-w-[130px]"
						/>
					</Link>

					{/* Notification Bell */}
					<Link
						to="/account/bookings"
						className="relative w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0"
					>
						<Bell className="w-4 h-4 text-gray-700" />
						{qtdBookings > 0 && (
							<span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-gray-900 text-white text-[10px] font-medium rounded-full flex items-center justify-center px-0.5">
								{qtdBookings}
							</span>
						)}
					</Link>

					{/* User Avatar / Login Icon - only visible when expanded */}
					<div className="group-data-[collapsible=icon]:hidden flex items-center">
						{user ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-sm hover:opacity-90 transition-opacity flex-shrink-0 cursor-pointer">
										<img
											src={user.photo}
											alt={nameUser[0]}
											className="w-full h-full object-cover"
										/>
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									className="min-w-52 rounded-xl p-1.5"
									side="bottom"
									align="end"
									sideOffset={6}
								>
									<div className="px-3 py-2 mb-1">
										<p className="text-sm font-semibold text-gray-900">
											{nameUser[0]}
										</p>
										<p className="text-xs text-gray-500 truncate">
											{user.email}
										</p>
									</div>
									<DropdownMenuSeparator />
									<Link to="/account/profile">
										<DropdownMenuItem className="cursor-pointer py-2 rounded-lg gap-2">
											<UserIcon className="w-4 h-4" />
											Acessar perfil
										</DropdownMenuItem>
									</Link>
									<Link to="/account/profile/edit">
										<DropdownMenuItem className="cursor-pointer py-2 rounded-lg gap-2">
											<Cog6ToothIcon className="w-4 h-4" />
											Configurações
										</DropdownMenuItem>
									</Link>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={logout}
										className="text-red-500 focus:bg-red-50 focus:text-red-600 cursor-pointer py-2 rounded-lg gap-2"
									>
										<LogOut className="w-4 h-4" />
										Sair
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<button
								onClick={() => showAuthModal("login")}
								className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0 cursor-pointer"
							>
								<User className="w-4 h-4 text-gray-700" />
							</button>
						)}
					</div>
				</div>
			</SidebarHeader>

			<SidebarSeparator className="mx-3 opacity-30" />

			{/* Nav items */}
			<SidebarContent className="py-3">
				<NavItems items={navItems} />
			</SidebarContent>

			{/* Info section - visível apenas quando expandido */}
			<div className="group-data-[collapsible=icon]:hidden px-5 pb-4 mt-auto space-y-3">
				<SidebarSeparator className="opacity-20" />
				<div className="space-y-1">
					<p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
						DormeAqui
					</p>
					<p className="text-[11px] text-gray-400 leading-relaxed">
						Encontre o lugar perfeito para sua próxima estadia.
					</p>
				</div>
				<div className="flex flex-col gap-1">
					<Link
						to="/sobre"
						className="text-[11px] text-gray-400 hover:text-gray-700 transition-colors"
					>
						Sobre nós
					</Link>
					<Link
						to="/ajuda"
						className="text-[11px] text-gray-400 hover:text-gray-700 transition-colors"
					>
						Central de ajuda
					</Link>
					<a
						href="mailto:projeto.dormeaqui@gmail.com"
						className="text-[11px] text-gray-400 hover:text-gray-700 transition-colors"
					>
						projeto.dormeaqui@gmail.com
					</a>
				</div>
				<p className="text-[10px] text-gray-300">© 2025 DormeAqui</p>
			</div>

			{/* Footer: avatar quando fechado / login quando não logado */}
			<SidebarFooter className="px-3 pb-3">
				{user ? (
					/* Avatar no footer - aparece apenas quando collapsed */
					<div className="hidden group-data-[collapsible=icon]:flex justify-center">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm hover:opacity-90 cursor-pointer">
									<img
										src={user.photo}
										alt={nameUser[0]}
										className="w-full h-full object-cover"
									/>
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="min-w-52 rounded-xl p-1.5"
								side="right"
								align="end"
								sideOffset={6}
							>
								<div className="px-3 py-2 mb-1">
									<p className="text-sm font-semibold text-gray-900">
										{nameUser[0]}
									</p>
									<p className="text-xs text-gray-500 truncate">{user.email}</p>
								</div>
								<DropdownMenuSeparator />
								<Link to="/account/profile">
									<DropdownMenuItem className="cursor-pointer py-2 rounded-lg gap-2">
										<UserIcon className="w-4 h-4" />
										Acessar perfil
									</DropdownMenuItem>
								</Link>
								<Link to="/account/profile/edit">
									<DropdownMenuItem className="cursor-pointer py-2 rounded-lg gap-2">
										<Cog6ToothIcon className="w-4 h-4" />
										Configurações
									</DropdownMenuItem>
								</Link>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={logout}
									className="text-red-500 focus:bg-red-50 focus:text-red-600 cursor-pointer py-2 rounded-lg gap-2"
								>
									<LogOut className="w-4 h-4" />
									Sair
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				) : (
					<>
						{/* Ícone de login - quando collapsed */}
						<div className="hidden group-data-[collapsible=icon]:flex justify-center">
							<button
								onClick={() => showAuthModal("login")}
								className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
							>
								<User className="w-4 h-4 text-gray-700" />
							</button>
						</div>
						{/* Botões expandidos */}
						<div className="flex flex-col gap-1.5 group-data-[collapsible=icon]:hidden">
							<button
								onClick={() => showAuthModal("login")}
								className="w-full flex items-center gap-3 h-11 px-3 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors cursor-pointer"
							>
								<LogIn size={18} className="flex-shrink-0" />
								<span className="text-sm font-medium">Entrar na conta</span>
							</button>
							<button
								onClick={() => showAuthModal("register")}
								className="w-full flex items-center gap-3 h-11 px-3 rounded-full border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
							>
								<UserPlus size={18} className="flex-shrink-0" />
								<span className="text-sm font-medium">Criar nova conta</span>
							</button>
						</div>
					</>
				)}
			</SidebarFooter>
		</ShadcnSidebar>
	);
};

export default AppSidebar;
