import { useEffect, useState } from "react";
import logoPrimary from "@/assets/logos/logo__primary.png";
import logoSecondary from "@/assets/logos/logo__secondary.png";
import { Link, useLocation } from "react-router-dom";
import MenuBar from "./MenuBar";

const Header = ({ active }) => {
	const [scrolled, setScrolled] = useState(false);
	const location = useLocation();
	const secondaryLogoRoutes = ["/", "/places/"];
	const useSecondaryLogo = secondaryLogoRoutes.includes(location.pathname);

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 25);
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const getLogoSrc = () => {
		if (active === true) return logoPrimary;
		if (scrolled) return logoPrimary;
		return useSecondaryLogo ? logoSecondary : logoPrimary;
	};

	return (
		/* Mobile: header fixo com logo e sheet */
		<header className="md:hidden fixed z-50 w-full transition-all duration-500">
			<div className="flex max-sm:px-3.5 items-center justify-between px-6 py-5">
				<Link to="/" className="flex items-center transition-all">
					<img
						src={getLogoSrc()}
						alt="Logo DormeAqui"
						className="transition-all object-cover duration-300"
					/>
				</Link>
				<MenuBar active={active} />
			</div>
		</header>
	);
};

export default Header;
