import { useEffect, useState } from "react";
import logoPrimary from "@/assets/logos/logo__primary.png";
import logoSecondary from "@/assets/logos/logo__secondary.png";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import SearchBar from "./SearchBar";

const Header = ({ active, onMobileMenuOpen }) => {
	const [scrolled, setScrolled] = useState(false);
	const location = useLocation();
	const isHomePage = location.pathname === "/";
	const secondaryLogoRoutes = [
		"/", // home
		"/places/",
	];

	// Verifica se a rota atual precisa da logo secondary
	const useSecondaryLogo = secondaryLogoRoutes.includes(location.pathname);

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 25);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Lógica para escolher a logo
	const getLogoSrc = () => {
		if (active === true) return logoPrimary;
		if (scrolled) return logoPrimary;
		return useSecondaryLogo ? logoSecondary : logoPrimary;
	};

	return (
		<header
			className={`sticky top-0 z-20 w-full bg-white transition-all duration-500 max-sm:shadow-sm`}
		>
			<div className="max-w-full flex items-center mx-auto justify-between max-sm:px-3.5 max-sm:h-16 py-3 px-4">
				{/* Logo — visível apenas no mobile (desktop usa a da sidebar) */}
				<Link
					to="/"
					className="flex items-center flex-shrink-0 lg:hidden"
				>
					<img
						src={getLogoSrc()}
						alt="Logo DormeAqui"
						className="transition-all h-12 object-cover duration-300"
					/>
				</Link>

				{/* SearchBar — apenas na Home e no desktop */}
				{isHomePage && (
					<div className="hidden md:flex flex-1 mx-8 max-md:hidden">
						<SearchBar compact={true} />
					</div>
				)}

				{/* Hamburger — apenas mobile */}
				<button
					onClick={onMobileMenuOpen}
					className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors cursor-pointer"
					aria-label="Abrir menu"
				>
					<Menu className="w-5 h-5" />
				</button>
			</div>
		</header>
	);
};

export default Header;
