import StaggeredMenu from "./StaggeredMenu";

/**
 * UserMenu — substitui o DropdownMenu antigo pelo StaggeredMenu do React Bits.
 *
 * Prop:
 *   showAuthModal: função que abre o modal de login (ex: showAuthModal("login"))
 */
export default function UserMenu({ showAuthModal }) {
	// O StaggeredMenu navega via <a href={link}>, então usamos uma âncora
	// identificável e interceptamos o clique via event delegation no container.
	const menuItems = [
		{
			label: "Entre ou Cadastre-se",
			ariaLabel: "Entrar ou criar uma conta",
			link: "#login",
		},
	];

	const handleClick = (e) => {
		const anchor = e.target.closest('a[href="#login"]');
		if (anchor) {
			e.preventDefault();
			showAuthModal("login");
		}
	};

	return (
		<div onClick={handleClick}>
			<StaggeredMenu
				position="right"
				items={menuItems}
				displaySocials={false}
				displayItemNumbering={false}
				menuButtonColor="#ffffff"
				openMenuButtonColor="#fff"
				changeMenuColorOnOpen={true}
				colors={["#B19EEF", "#5227FF"]}
				accentColor="#5227FF"
				onMenuOpen={() => console.log("Menu opened")}
				onMenuClose={() => console.log("Menu closed")}
			/>
		</div>
	);
}
