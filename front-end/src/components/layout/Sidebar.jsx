import logoPrimary from "@/assets/logo__primary.png";
import { Link, useLocation } from "react-router-dom";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, ChevronRight, HotelIcon } from "lucide-react";
import { Home, Briefcase, User, Mail, Settings } from "lucide-react";
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
} from "@/components/ui/sidebar";

const AppSidebar = () => {
	const { user, setUser } = useUserContext();
	const location = useLocation();
	const { showAuthModal } = useAuthModalContext();

	const navItems = [
		{ path: "/", icon: Home, label: "Home" },
		{ path: "/account/bookings", icon: Calendar, label: "Reservas" },
		{ path: "/account/places", icon: HotelIcon, label: "Acomodações" },
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
			path: "/login",
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

	return (
		<ShadcnSidebar variant="inset" collapsible="icon">
			<SidebarHeader>
				<Link to="/" className="flex items-center justify-start px-1 py-4">
					<img
						src={logoPrimary}
						alt="Logo DormeAqui"
						className="h-8 transition-all duration-300 group-data-[collapsible=icon]:hidden"
					/>
				</Link>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Navegação</SidebarGroupLabel>
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
											className="py-2"
										>
											<Link className="py-2" to={item.path}>
												<item.icon />
												<span>{item.label}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								);
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				{user && (
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
				)}

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
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton
								size="lg"
								className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
									<img
										src={user.photo}
										className="w-8 h-8 aspect-square rounded-full object-cover"
										alt="Foto do Usuário"
									/>
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">{user.name}</span>
									<span className="truncate text-xs">{user.bio}</span>
								</div>
								<ChevronRight className="ml-auto size-4" />
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
							side="bottom"
							align="end"
							sideOffset={4}
						>
							<DropdownMenuLabel className="p-0 font-normal">
								<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
									<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
										<img
											src={user.photo}
											className="w-8 h-8 aspect-square rounded-full object-cover"
											alt="Foto do Usuário"
										/>
									</div>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold">{user.name}</span>
									</div>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<Link to="/account/profile">
								<DropdownMenuItem>
									<span>Ver perfil completo</span>
								</DropdownMenuItem>
							</Link>
						</DropdownMenuContent>
					</DropdownMenu>
				) : (
					<div className="p-4 space-y-2 group-data-[collapsible=icon]:hidden">
						<button
							onClick={() => showAuthModal("login")}
							className="w-full bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
						>
							Entrar
						</button>
						<button
							onClick={() => showAuthModal("register")}
							className="w-full bg-white text-primary-500 border border-primary-500 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
						>
							Criar Conta
						</button>
					</div>
				)}
			</SidebarFooter>
		</ShadcnSidebar>
	);
};

export default AppSidebar;
