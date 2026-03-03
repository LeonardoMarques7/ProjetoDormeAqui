import { useEffect, useState } from "react";
import logoPrimary from "@/assets/logos/logo__primary.png";
import logoSecondary from "@/assets/logos/logo__secondary.png";
import { Link, useLocation } from "react-router-dom";
import MenuBar from "./MenuBar";
import SearchBar from "./SearchBar";

const Header = ({ active }) => {
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
		// Se active está definido, usa logo primary
		if (active === true) {
			return logoPrimary;
		}

		// Se scrolled, usa logo primary (escura)
		if (scrolled) {
			return logoPrimary;
		}

		// Se está em uma rota que precisa de logo clara, usa secondary
		return useSecondaryLogo ? logoSecondary : logoPrimary;
	};

	// Lógica para cor do texto
	const getTextColor = () => {
		// Se scrolled, texto fica preto
		if (scrolled) {
			return "text-gray-900";
		}

		// Se active está definido, texto preto
		if (active === true) {
			return "text-gray-900";
		}

		// Se usa logo secondary (clara), texto branco
		// Se usa logo primary (escura), texto preto
		return useSecondaryLogo ? "text-white" : "text-gray-900";
	};

	return (
		<header
			className={`sticky top-0 z-50 w-full bg-white mb-3 max-sm:shadow-2xl transition-all max-w-7xl duration-500 delay-0 mx-auto max-sm:max-w-full `}
		>
			<div
				className={`max-w-full flex  max-sm:gap-3 max-sm:px-3.5   max-sm:h-20 items-center mx-auto justify-between  py-5 `}
			>
				<Link to="/" className="flex items-center transition-all flex-shrink-0">
					<img
						src={getLogoSrc()}
						alt="Logo DormeAqui"
						className=" transition-all h-25 max-sm:h-15 object-cover duration-300"
					/>
				</Link>

				{/* SearchBar no Header - visível apenas na Home e em desktop */}
				{isHomePage && (
					<div className="hidden md:flex flex-1 mx-8 max-md:hidden">
						<SearchBar compact={true} />
					</div>
				)}

				<MenuBar active={active} />
			</div>
		</header>
	);
};

export default Header;
