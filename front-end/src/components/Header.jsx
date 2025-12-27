import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import logoPrimary from "../assets/logo__primary.png";
import logoSecondary from "../assets/logo__secondary.png";
import { Link, useLocation } from "react-router-dom";
import { useUserContext } from "./contexts/UserContext";
import MenuBar from "./MenuBar";

const Header = ({ active }) => {
	const [scrolled, setScrolled] = useState(false);
	const location = useLocation();
	const secondaryLogoRoutes = [
		"/", // home
		"/places/", // exemplo
		// Adicione aqui as rotas que precisam da logo clara
	];

	// Verifica se a rota atual precisa da logo secondary
	const useSecondaryLogo = secondaryLogoRoutes.includes(location.pathname);

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 200);
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
			className={`fixed z-50 w-full mb-3 transition-all duration-500 delay-0 ${
				scrolled
					? "bg-white  duration-75 !text-gray-900  backdrop-blur-2xl shadow-md shadow-white/10"
					: "bg-transparent"
			} ${getTextColor()}`}
		>
			<div className="max-w-full flex max-sm:px-3.5 items-center mx-auto justify-between px-10 sm:px-8 py-5 lg:max-w-7xl">
				<Link to="/" className="flex items-center transition-all">
					<img
						src={getLogoSrc()}
						alt="Logo DormeAqui"
						className="h-6 md:h-10 transition-all duration-300"
					/>
				</Link>
				<MenuBar active={active} />
			</div>
		</header>
	);
};

export default Header;
