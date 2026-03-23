import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
	HomeIcon,
	CalendarDaysIcon,
	UserIcon,
	HomeModernIcon,
} from "@heroicons/react/24/outline";
import {
	HomeIcon as HomeIconSolid,
	CalendarDaysIcon as CalendarDaysIconSolid,
	UserIcon as UserIconSolid,
	HomeModernIcon as HomeModernIconSolid,
} from "@heroicons/react/24/solid";
import { useUserContext } from "@/components/contexts/UserContext";
import { useAuthModalContext } from "@/components/contexts/AuthModalContext";

const RippleEffect = ({ x, y }) => (
	<motion.div
		className="absolute w-10 h-10 bg-primary-600 rounded-full pointer-events-none"
		initial={{ scale: 0, opacity: 0.5 }}
		animate={{ scale: 4, opacity: 0 }}
		transition={{ duration: 0.6, ease: "easeOut" }}
		style={{
			left: x,
			top: y,
			translateX: "-50%",
			translateY: "-50%",
		}}
	/>
);

const MobileBottomNavigation = () => {
	const location = useLocation();
	const { user } = useUserContext();
	const { showAuthModal } = useAuthModalContext();
	const [activeTab, setActiveTab] = useState("home");
	const [ripples, setRipples] = useState([]); // ✅ corrigido
	const [scrollY, setScrollY] = useState(0);

	useEffect(() => {
		const handleScroll = () => setScrollY(window.scrollY);
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	useEffect(() => {
		if (location.pathname === "/") setActiveTab("home");
		else if (location.pathname.includes("/places")) setActiveTab("places");
		else if (location.pathname.includes("/account/bookings"))
			setActiveTab("bookings");
		else if (location.pathname.includes("/account/profile"))
			setActiveTab("profile");
	}, [location.pathname]);

	const parallaxY = scrollY > 100 ? (scrollY - 100) * 0.05 : 0;

	const handlePlacesClick = () => {
		if (!user) showAuthModal("login");
		else setActiveTab("places");
	};

	const handleBookingsClick = () => {
		if (!user) showAuthModal("login");
		else setActiveTab("bookings");
	};

	const handleProfileClick = () => {
		if (!user) showAuthModal("login");
		else setActiveTab("profile");
	};

	const handleMouseDown = (e, itemId) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const newRipple = {
			id: Date.now(),
			itemId,
			x: rect.width / 2, // ✅ sempre centralizado
			y: rect.height / 2, // ✅ sempre centralizado
		};
		setRipples((prev) => [...prev, newRipple]);
		setTimeout(() => {
			setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
		}, 600);
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
		<motion.nav
			className="fixed bottom-2 left-0 right-0 mx-6 rounded-full md:hidden z-40 bg-white border border-gray-200 shadow-lg"
			aria-label="Navegação principal móvel"
			initial={{ y: 100, opacity: 0 }}
			animate={{ y: parallaxY, opacity: 1 }}
			transition={{ type: "spring", stiffness: 100, damping: 15 }}
		>
			<div className="flex items-center rounded-full justify-around h-20 max-w-full">
				{navItems.map((item, index) => {
					const isActive = activeTab === item.id;
					const Icon = isActive ? item.solidIcon : item.icon;

					const containerVariants = {
						hidden: { opacity: 0, y: 10 },
						visible: {
							opacity: 1,
							y: 0,
							transition: {
								delay: index * 0.1,
								duration: 0.4,
								type: "spring",
								stiffness: 100,
							},
						},
					};

					const itemContent = (
						<motion.div
							className="flex flex-col items-center justify-center rounded-full gap-1 flex-1 py-2 px-1 relative"
							animate={{ scale: isActive ? 1 : 0.95 }}
							transition={{ duration: 0.3, type: "spring" }}
						>
							<div className="relative flex items-center justify-center w-8 h-8">
								{/* Ripple fora do AnimatePresence do ícone, com overflow hidden para não vazar */}
								<div className="absolute inset-0 overflow-hidden rounded-full">
									<AnimatePresence>
										{ripples
											.filter((ripple) => ripple.itemId === item.id)
											.map((ripple) => (
												<RippleEffect
													key={ripple.id}
													x={ripple.x}
													y={ripple.y}
												/>
											))}
									</AnimatePresence>
								</div>

								{/* Ícone separado, sem interferência do AnimatePresence */}
								<motion.div
									animate={{
										y: isActive ? -2 : 0,
										scale: isActive ? 1.15 : 1,
									}}
									transition={{
										duration: 0.3,
										type: "spring",
										stiffness: 200,
									}}
								>
									<Icon
										className={`w-6 h-6 transition-colors duration-300 ${
											isActive
												? "text-primary-600"
												: "text-gray-600 group-hover:text-gray-900"
										}`}
									/>
								</motion.div>
							</div>

							<AnimatePresence>
								{isActive && (
									<motion.span
										className="w-1.5 h-1.5 rounded-full bg-primary-600"
										initial={{ scale: 0, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										exit={{ scale: 0, opacity: 0 }}
										transition={{
											type: "spring",
											stiffness: 300,
											damping: 20,
										}}
									/>
								)}
							</AnimatePresence>
						</motion.div>
					);

					if (item.href && item.href !== "#") {
						return (
							<motion.div
								key={item.id}
								variants={containerVariants}
								initial="hidden"
								animate="visible"
								className="flex-1"
								onMouseDown={(e) => handleMouseDown(e, item.id)}
								whileHover={{ y: -2 }}
								whileTap={{ scale: 0.95 }}
							>
								<Link
									to={item.href}
									onClick={item.onClick}
									className={`flex-1 flex flex-col items-center rounded-full justify-center gap-1 py-2 px-1 group h-full no-underline transition-all duration-200 ${
										isActive ? "bg-primary-50" : "hover:bg-gray-50"
									}`}
									aria-current={isActive ? "page" : undefined}
								>
									{itemContent}
								</Link>
							</motion.div>
						);
					}

					return (
						<motion.button
							key={item.id}
							variants={containerVariants}
							initial="hidden"
							animate="visible"
							type="button"
							onClick={item.onClick}
							className={`flex-1 flex flex-col items-center rounded-full justify-center gap-1 py-2 px-1 group h-full bg-transparent border-0 cursor-pointer transition-all duration-200 ${
								isActive
									? "bg-primary-50"
									: "hover:bg-gray-50 active:bg-primary-50"
							}`}
							aria-label={item.label}
							onMouseDown={(e) => handleMouseDown(e, item.id)}
							whileHover={{ y: -2 }}
							whileTap={{ scale: 0.95 }}
						>
							{itemContent}
						</motion.button>
					);
				})}
			</div>
		</motion.nav>
	);
};

export default MobileBottomNavigation;
