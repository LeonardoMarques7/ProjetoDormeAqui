import { Link, useNavigate } from "react-router-dom";
import { useUserContext } from "@/components/contexts/UserContext";
import { useAuthModalContext } from "@/components/contexts/AuthModalContext";
import NotificationBell from "@/components/common/NotificationBell";
import logoPrimaryMobile from "@/assets/logo__primary__mobile.png";
import { ArrowLongUpIcon } from "@heroicons/react/24/outline";
import { LogInIcon } from "lucide-react";

const MobileTopBar = () => {
	const { user } = useUserContext();
	const { showAuthModal } = useAuthModalContext();
	const navigate = useNavigate();

	const handleAvatarClick = () => {
		if (!user) {
			showAuthModal("login");
		} else {
			navigate("/account/profile");
		}
	};

	return (
		<div className="fixed top-0 left-0 rounded-b-none py-4 right-0 md:hidden z-40 bg-white border-b border-gray-200 shadow-sm">
			<div className="flex items-center justify-between px-8 py-2 h-16 max-w-full">
				{/* Logo - Left */}
				<Link
					to="/"
					className="flex-shrink-0 hover:opacity-80 transition-opacity duration-200"
					aria-label="Página inicial"
				>
					<img
						src={logoPrimaryMobile}
						alt="Logo DormeAqui"
						className="h-10 w-auto object-contain"
					/>
				</Link>

				{/* Notification Bell - Center */}
				<div className="flex items-center">
					<div className="flex-1 flex justify-center items-center">
						<div className="transform hover:scale-110 transition-transform duration-200">
							<NotificationBell />
						</div>
					</div>

					{/* Avatar - Right */}
					<button
						type="button"
						onClick={handleAvatarClick}
						className="flex-shrink-0 ml-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
						aria-label="Perfil do usuário"
					>
						{user ? (
							<img
								src={user.photo}
								alt={user.name}
								className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 hover:border-primary-400 transition-colors duration-200"
							/>
						) : (
							<div className="w-10 h-10 rounded-full bg-primary-900 flex items-center justify-center text-white font-semibold text-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-md">
								<LogInIcon size={16} />
							</div>
						)}
					</button>
				</div>
			</div>
		</div>
	);
};

export default MobileTopBar;
