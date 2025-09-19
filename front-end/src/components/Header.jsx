import { Menu, Search } from "lucide-react";
import logoPrimary from "../assets/logo__primary.png";
import { Link } from "react-router-dom";
import { useUserContext } from "./contexts/UserContext";

const Header = () => {
	const { user } = useUserContext();

	return (
		<header className="shadow-md">
			<div className="flex items-center justify-between px-4 sm:px-8 py-4 max-w-7xl mx-auto">
				<Link to="/" className="flex items-center">
					<img
						src={logoPrimary}
						alt="Logo primária do DormeAqui"
						className="h-6 md:h-10"
					/>
				</Link>

				<Link
					to="/"
					className="lg:flex items-center border border-gray-200 px-4 pl-5 py-2 rounded-full hidden"
				>
					<p className="pr-4 border-r border-r-gray-200">Qualquer lugar</p>
					<p className="px-4 border-r border-r-gray-200">Qualquer semana</p>
					<p className="px-4">Hóspedes?</p>

					<div className="bg-primary-400 rounded-full p-2 text-white">
						<Search className="size-4" />
					</div>
				</Link>

				<Link
					to={user ? "/account/profile" : "/login"}
					className="flex items-center border border-gray-200 px-4 py-2 rounded-full gap-2"
				>
					<Menu className="size-5 text-gray-600" />
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						className="size-6"
					>
						<path
							fillRule="evenodd"
							d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
							clipRule="evenodd"
						/>
					</svg>
					{user ? (
						<p className="max-w-20 truncate sm:max-w-32">{user.name}</p>
					) : (
						<></>
					)}
				</Link>
			</div>
		</header>
	);
};

export default Header;
