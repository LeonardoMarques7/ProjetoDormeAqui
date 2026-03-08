import CardNav from "./CardNav";

const Header = ({ active }) => {
	return (
		<header className="relative w-full h-24 z-50">
			<CardNav active={active} />
		</header>
	);
};

export default Header;
