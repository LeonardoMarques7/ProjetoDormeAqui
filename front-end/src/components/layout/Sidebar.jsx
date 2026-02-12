import React, { useEffect, useState } from "react";
import logoPrimary from "@/assets/logo__primary.png";
import logoPrimaryIcon from "@/assets/logo__primary__mobile.png";
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
	Tooltip,
	TooltipTrigger,
	TooltipContent,
	TooltipProvider,
} from "@/components/ui/tooltip";

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
	ChatBubbleLeftIcon,
	ChatBubbleOvalLeftIcon,
} from "@heroicons/react/24/outline";
import {
	HomeIcon as HomeIconSolid,
	CalendarDaysIcon as CalendarDaysIconSolid,
	BuildingOfficeIcon as BuildingOfficeIconSolid,
	UserIcon as UserIconSolid,
	Cog6ToothIcon as Cog6ToothIconSolid,
	ChatBubbleOvalLeftIcon as ChatBubbleOvalLeftIconSolid,
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

import { useAuthModalContext } from "@/components/contexts/AuthModalContext";
import { useMessage } from "@/components/contexts/MessageContext";
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
	const { showMessage } = useMessage();
	const [logoutActive, setLogoutActive] = useState(false);
	const { showAuthModal } = useAuthModalContext();
	const { state } = useSidebar();
	const [bookings, setBookings] = useState([]);
	const [readyBookings, setReadyBookings] = useState(false);

	useEffect(() => {
		if (!user) {
			setBookings([]);
			setReadyBookings(false);
			return;
		}

		const axiosGet = async () => {
			const { data } = await axios.get("/bookings/owner");
			setTimeout(() => {
				setBookings(data);
				setReadyBookings(true);
			}, 100);
		};

		axiosGet();
	}, [user?._id]);

	const qtdBookings = bookings.length;

	const navItems = [
		{ path: "/", icon: HomeIconSolid, iconRegular: HomeIcon, label: "Home" },
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
		{
			path: "/account/message",
			icon: ChatBubbleOvalLeftIconSolid,
			iconRegular: ChatBubbleOvalLeftIcon,
			label: "Mensagens",
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
			setLogoutActive(true);
		} catch (error) {
			alert(JSON.stringify(error));
		}
	};

	const nameUser = user?.name ? user.name.split(" ") : ["", ""];

	if (logoutActive) {
		showMessage("Logout realizado com sucesso!", "info");
		setLogoutActive(false);
	}

	return (
		<ShadcnSidebar variant="inset" collapsible="icon">
			<SidebarHeader className="w-full">
				<Link
					to="/"
					className="flex items-center justify-start px-2 py-4 group-data-[collapsible=icon]:py-0"
				>
					<Tooltip>
						<TooltipTrigger asChild>
							<img
								src={logoPrimaryIcon}
								alt="Logo DormeAqui"
								className="h-20 object-contain transition-all w-full duration-300 hidden group-data-[collapsible=icon]:flex"
							/>
						</TooltipTrigger>
						<TooltipContent side="right" className="ml-2" align="center">
							<p>Página inicial</p>
						</TooltipContent>
					</Tooltip>
					<img
						src={logoPrimary}
						alt="Logo DormeAqui"
						className="h-8 transition-all duration-300 group-data-[collapsible=icon]:hidden"
					/>
				</Link>
			</SidebarHeader>
			<SidebarContent className=" py-6">
				<SidebarMenu className="space-y-1">
					{navItems.map((item) => {
						const isActive = location.pathname === item.path;
						const Icon = isActive ? item.icon : item.iconRegular;

						return (
							<SidebarMenuItem key={item.path}>
								<SidebarMenuButton
									asChild
									isActive={isActive}
									tooltip={item.label}
									className="group/item py-2!"
								>
									<Link
										className={`
											w-full flex h-15 items-center rounded-2xl! gap-4 p-5!
											transition-all duration-200
										
										`}
										to={item.path}
									>
										<Icon className="w-5 h-5 flex-shrink-0" />

										<span
											className={`text-sm group-data-[collapsible=icon]:hidden ${isActive && "font-medium "}`}
										>
											{item.label}
										</span>
										{item.notifications && (
											<div
												className={`ml-auto text-xs font-light text-primary-500 flex justify-center items-center bg-white h-5 w-5 rounded-full ${isActive && "font-light"}`}
											>
												{item.notifications}
											</div>
										)}
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						);
					})}
				</SidebarMenu>
			</SidebarContent>
			<SidebarFooter>
				{user ? (
					<DropdownMenu>
						<DropdownMenuTrigger className="!p-0 !m-0 rounded-2xl!">
							<SidebarMenuButton className="px-4!  group-data-[collapsible=icon]:bg-transparent! hover:bg-accent h-fit gap-3 rounded-2xl! cursor-pointer">
								<div className="flex aspect-square size-9 group-data-[collapsible=icon]:-ml-1 items-center justify-center rounded-full">
									<img
										src={user.photo}
										className="w-9 h-9 aspect-square rounded-full object-cover"
										alt="Foto do Usuário"
									/>
								</div>
								<div className="grid flex-1 text-left text-sm  leading-tight">
									<span className="truncate font-semibold ">{nameUser[0]}</span>
									<span className="truncate text-xs ">{user.pronouns}</span>
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
								<DropdownMenuItem className="text-red-500  hover:bg-red-100/50! hover:text-red-600! cursor-pointer py-2">
									<LogOut className="text-red-500 mr-1" />
									<span>Sair</span>
								</DropdownMenuItem>
							</Link>
						</DropdownMenuContent>
					</DropdownMenu>
				) : (
					<div className=" space-y-2">
						<button
							onClick={() => showAuthModal("login")}
							className="w-full justify-center group-data-[collapsible=icon]:flex hidden  cursor-pointer  items-center gap-2.5 transition-colors"
						>
							<LogIn size={18} />
						</button>
						<button
							onClick={() => showAuthModal("login")}
							className="w-full  cursor-pointer group-data-[collapsible=icon]:hidden flex items-center gap-2.5 bg-primary-900 text-white px-4 py-3 border-primary-900 border rounded-lg hover:bg-black transition-colors"
						>
							<LogIn size={18} />
							Entrar na conta
						</button>
						<button
							onClick={() => showAuthModal("register")}
							className=" group-data-[collapsible=icon]:hidden w-full cursor-pointer flex items-center gap-2.5 bg-white text-primary-500 border border-primary-500 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
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
