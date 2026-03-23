import { useEffect } from "react";
import CardNav from "./CardNav";

const Header = ({ active, isAbsolute }) => {
	useEffect(() => {
		isAbsolute == true;
	}, [active, isAbsolute]);

	return (
		<header
			className={`${isAbsolute ? "absolute top-0 left-0 right-0 z-50 text-white!" : "relative"} w-full min-h-24 max-h-full`}
		>
			<CardNav active={active} isAbsolute={isAbsolute} />
		</header>
	);
};

export default Header;
