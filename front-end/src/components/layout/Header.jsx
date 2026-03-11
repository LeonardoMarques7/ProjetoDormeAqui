import CardNav from "./CardNav";

const Header = ({ active }) => {
	return (
		<header className="relative w-full min-h-24">
			<CardNav active={active} />
		</header>
	);
};

export default Header;
