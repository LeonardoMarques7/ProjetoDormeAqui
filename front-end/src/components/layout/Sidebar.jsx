import React from "react";
import logoPrimary from "@/assets/logo__primary.png";
import logoPrimaryIcon from "@/assets/logo__primary__icon.png";
import { Link, useLocation } from "react-router-dom";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	ArrowRight,
	ChevronRight,
	ChevronRightIcon,
	ChevronsUpDown,
	ChevronsUpDownIcon,
	LogIn,
	LogOut,
	UserPlus,
} from "lucide-react";
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
	UserIcon as UserIconSolid,
	Cog6ToothIcon as Cog6ToothIconSolid,
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

import { useAuthModalContext } from "@/components/contexts/AuthModalContext";

import { useUserContext } from "@/components/contexts/UserContext";
import axios from "axios";
import {
	Sidebar as ShadcnSidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
	useSidebar,
} from "@/components/ui/sidebar";

const AppSidebar = () => {
	const { user, setUser } = useUserContext();
	const location = useLocation();
	const { showAuthModal } = useAuthModalContext();
	const { state } = useSidebar();

	const navItems = [
		{ path: "/", icon: HomeIconSolid, iconRegular: HomeIcon, label: "Home" },
		{
			path: "/account/bookings",
			icon: CalendarDaysIconSolid,
			iconRegular: CalendarDaysIcon,
			label: "Reservas",
		},
		{
			path: "/account/places",
			icon: BuildingOfficeIconSolid,
			iconRegular: BuildingOfficeIcon,
			label: "Acomodações",
		},
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
			label: "Página Inicial",
			function: () => {
				window.scrollTo({ top: 0, behavior: "smooth" });
			},
		},
		{
			function: () => {
				showAuthModal("login");
			},
			label: "Torne-se um anfitrião",
		},
	];

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
		} catch (error) {
			alert(JSON.stringify(error));
		}
	};

	const nameUser = user?.name ? user.name.split(" ") : ["", ""];

	return (
		<ShadcnSidebar variant="inset" collapsible="icon">
			<SidebarHeader className="w-full">
				<Link to="/" className="flex items-center justify-start px-1 pt-4">
					<img
						src={logoPrimary}
						alt="Logo DormeAqui"
						className="h-8 transition-all duration-300 group-data-[collapsible=icon]:hidden"
					/>
					<img
						src={logoPrimaryIcon}
						alt="Logo DormeAqui"
						className="h-full transition-all object-cover w-full duration-300 hidden group-data-[collapsible=icon]:block"
					/>
				</Link>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{navItems.map((item) => {
								const isActive = location.pathname === item.path;
								return (
									<SidebarMenuItem key={item.path}>
										<SidebarMenuButton
											asChild
											isActive={isActive}
											tooltip={item.label}
											className="p-2 h-fit"
										>
											<Link
												className="w-full flex items-center justify-start gap-4 py-4  px-2 p-4 text-gray-700 hover:bg-primary-100/50 rounded-2xl transition-all [&:hover_.chevron]:opacity-100"
												to={item.path}
											>
												{React.createElement(
													isActive ? item.icon : item.iconRegular,
													{
														className: "w-6 h-6",
													},
												)}
												<span>{item.label}</span>
												<ChevronRightIcon
													size={18}
													className={`chevron ml-auto mr-2 transition-opacity size-5! ${
														isActive
															? "opacity-100 text-primary-900"
															: "opacity-0"
													}`}
												/>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{/* {user && (
					<SidebarGroup className=" group-data-[collapsible=icon]:hidden">
						<SidebarGroupLabel>Conta</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{navItemsPerfil.map((item, index) => (
									<SidebarMenuItem key={item.path || index}>
										<SidebarMenuButton asChild tooltip={item.label}>
											<Link to={item.path} onClick={item.function}>
												<span>{item.label}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				)} */}

				{!user && (
					<SidebarGroup>
						<SidebarGroupLabel>Menu</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{navItemsNOPerfil.map((item) => (
									<SidebarMenuItem key={item.path}>
										<SidebarMenuButton asChild tooltip={item.label}>
											<Link to={item.path} onClick={item.function}>
												<span>{item.label}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				)}
			</SidebarContent>
			<SidebarFooter>
				{user ? (
					<DropdownMenu>
						<DropdownMenuTrigger className="!p-0 !m-0">
							<SidebarMenuButton className="px-2!  group-data-[collapsible=icon]:bg-transparent! hover:bg-accent h-fit gap-3 rounded-2xl cursor-pointer">
								<div className="flex aspect-square size-9 group-data-[collapsible=icon]:-ml-1 items-center justify-center rounded-full">
									<img
										src={user.photo}
										className="w-9 h-9 aspect-square rounded-full object-cover"
										alt="Foto do Usuário"
									/>
								</div>
								<div className="grid flex-1 text-left text-sm  leading-tight">
									<span className="truncate font-semibold ">{nameUser[0]}</span>
									<span className="truncate text-xs">{nameUser[1]}</span>
								</div>
								<ChevronsUpDownIcon size={18} className="size-4!" />
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
							side={state === "collapsed" ? "right" : "bottom"}
							align="end"
							sideOffset={4}
						>
							<Link to="/account/profile">
								<DropdownMenuItem className=" text-primary-700  hover:bg-primary-100/50 cursor-pointer py-2">
									<UserIcon className="w-4 h-4 mr-1" />
									<span>Acessar perfil</span>
								</DropdownMenuItem>
							</Link>
							<Link>
								<DropdownMenuItem className=" text-primary-700  hover:bg-primary-100/50 cursor-pointer py-2">
									<Cog6ToothIcon className="w-4 h-4 mr-1" />
									<span>Configurações</span>
								</DropdownMenuItem>
							</Link>
							<DropdownMenuSeparator />
							<Link onClick={() => logout()}>
								<DropdownMenuItem className="text-red-500  hover:bg-red-100/50 cursor-pointer py-2">
									<LogOut className="text-red-500 mr-1" />
									<span>Sair</span>
								</DropdownMenuItem>
							</Link>
						</DropdownMenuContent>
					</DropdownMenu>
				) : (
					<div className=" space-y-2 group-data-[collapsible=icon]:hidden">
						<button
							onClick={() => showAuthModal("login")}
							className="w-full cursor-pointer flex items-center gap-2.5 bg-primary-900 text-white px-4 py-3 border-primary-900 border rounded-lg hover:bg-black transition-colors"
						>
							<LogIn size={18} />
							Entrar na conta
						</button>
						<button
							onClick={() => showAuthModal("register")}
							className="w-full cursor-pointer flex items-center gap-2.5 bg-white text-primary-500 border border-primary-500 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
						>
							<UserPlus size={18} />
							Criar nova conta
						</button>
					</div>
				)}
			</SidebarFooter>
		</ShadcnSidebar>
	);
};

export default AppSidebar;
