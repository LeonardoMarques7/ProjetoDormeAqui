import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
	HomeIcon,
	BuildingOfficeIcon,
	CalendarDaysIcon,
	UserIcon,
	HomeModernIcon,
} from "@heroicons/react/24/outline";
import {
	HomeIcon as HomeIconSolid,
	BuildingOfficeIcon as BuildingOfficeIconSolid,
	CalendarDaysIcon as CalendarDaysIconSolid,
	UserIcon as UserIconSolid,
	HomeModernIcon as HomeModernIconSolid,
} from "@heroicons/react/24/solid";
import { useUserContext } from "@/components/contexts/UserContext";
import { useAuthModalContext } from "@/components/contexts/AuthModalContext";

const MobileBottomNavigation = () => {
	const location = useLocation();
	const { user } = useUserContext();
	const { showAuthModal } = useAuthModalContext();
	const [activeTab, setActiveTab] = useState("home");

	// Atualizar tab ativo baseado na rota
	useEffect(() => {
		if (location.pathname === "/") {
			setActiveTab("home");
		} else if (location.pathname.includes("/places")) {
			setActiveTab("places");
		} else if (location.pathname.includes("/account/bookings")) {
			setActiveTab("bookings");
		} else if (location.pathname.includes("/account/profile")) {
			setActiveTab("profile");
		}
	}, [location.pathname]);

	const handlePlacesClick = (href) => {
		// Se não houver usuário logado, mostra login para places
		if (!user && href === "/account/places") {
			showAuthModal("login");
		} else {
			setActiveTab("places");
		}
	};

	const handleBookingsClick = (href) => {
		if (!user) {
			showAuthModal("login");
		} else {
			setActiveTab("bookings");
		}
	};

	const handleProfileClick = (href) => {
		if (!user) {
			showAuthModal("login");
		} else {
			setActiveTab("profile");
		}
	};

	const navItems = [
		{
			id: "home",
			label: "Tela Inicial",
			href: "/",
			icon: HomeIcon,
			solidIcon: HomeIconSolid,
			onClick: () => setActiveTab("home"),
		},
		{
			id: "places",
			label: "Acomodações",
			href: user ? "/account/places" : "#",
			icon: HomeModernIcon,
			solidIcon: HomeModernIconSolid,
			onClick: handlePlacesClick,
		},
		{
			id: "bookings",
			label: "Reservas",
			href: "/account/bookings",
			icon: CalendarDaysIcon,
			solidIcon: CalendarDaysIconSolid,
			onClick: handleBookingsClick,
		},
		{
			id: "profile",
			label: "Perfil",
			href: "/account/profile",
			icon: UserIcon,
			solidIcon: UserIconSolid,
			onClick: handleProfileClick,
		},
	];

	return (
		<nav
			className="fixed bottom-2 left-0 right-0 mx-6 rounded-full md:hidden z-40 bg-white border  border-gray-200 shadow-lg"
			aria-label="Navegação principal móvel"
		>
			<div className="flex items-center rounded-full justify-around h-20 max-w-full">
				{navItems.map((item) => {
					const isActive = activeTab === item.id;
					const Icon = isActive ? item.solidIcon : item.icon;

					const itemContent = (
						<div
							className={`flex flex-col items-center justify-center rounded-full gap-1 flex-1 py-2 px-1 transition-all duration-200 ${
								isActive ? "scale-100" : "scale-95 hover:scale-100"
							}`}
						>
							<Icon
								className={`w-6 h-6 transition-all duration-300 ${
									isActive
										? "text-primary-600 scale-110"
										: "text-gray-600 group-hover:text-gray-900 group-active:scale-90"
								}`}
							/>
							{/* <span
								className={`text-xs font-medium transition-all duration-300 ${
									isActive
										? "text-primary-600 font-semibold opacity-100"
										: "text-gray-600 opacity-75 group-hover:opacity-100"
								}`}
							>
								{item.label}
							</span> */}
							<span
								className={`${isActive ? "block" : "hidden"} w-1 h-1 rounded-full bg-primary-600`}
							></span>
						</div>
					);

					if (item.href && item.href !== "#") {
						return (
							<Link
								key={item.id}
								to={item.href}
								onClick={item.onClick}
								className={`flex-1 flex flex-col items-center rounded-full justify-center gap-1 py-2 px-1 transition-all duration-200 group h-full no-underline active:bg-primary-50 ${
									isActive ? "bg-primary-50" : "hover:bg-gray-50"
								}`}
								aria-current={isActive ? "page" : undefined}
							>
								{itemContent}
							</Link>
						);
					}

					return (
						<button
							key={item.id}
							type="button"
							onClick={() => item.onClick(item.href)}
							className={`flex-1 flex flex-col items-center rounded-full justify-center gap-1 py-2 px-1 transition-all duration-200 group h-full bg-transparent border-0 cursor-pointer  active:bg-primary-50 ${
								isActive
									? "bg-primary-50"
									: "hover:bg-gray-50 active:bg-primary-50"
							}`}
							aria-label={item.label}
						>
							{itemContent}
						</button>
					);
				})}
			</div>
		</nav>
	);
};

export default MobileBottomNavigation;
