import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import logoPrimary from "../assets/logo__primary.png";
import logoSecondary from "../assets/logo__secondary.png";
import { Link } from "react-router-dom";
import { useUserContext } from "./contexts/UserContext";
import MenuBar from "./MenuBar";

const Header = ({ active }) => {
	const { user } = useUserContext();
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 200);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<header
			className={`fixed z-50 top-0 w-full transition-all duration-300 text-black ${
				scrolled ? "bg-white shadow-md shadow-white/10" : "bg-transparent"
			}`}
		>
			<div className="max-w-full flex items-center mx-auto justify-between px-10 sm:px-8 py-4 lg:max-w-7xl ">
				<Link to="/" className="flex items-center transition-all">
					<img
						src={logoPrimary}
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
