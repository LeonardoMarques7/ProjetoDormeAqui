import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bars3BottomRightIcon } from "@heroicons/react/24/outline";
import {
	AltArrowRight as ArrowRight,
	Book,
	Buildings,
	CallChatRounded as Contact,
	ChatRoundDots as AboutIcon,
	CloseCircle as CloseIcon,
	Home2 as HomeIcon,
	Login3 as LoginIcon,
	Logout3 as LogoutIcon,
	NotebookBookmark as TermsIcon,
	ShieldCheck as PrivacyIcon,
	Signpost2 as ExploreIcon,
	UserCircle as ProfileIcon,
	Widget5 as DashboardIcon,
} from "@solar-icons/react";

import logoPrimaryMobile from "@/assets/logo__primary__mobile.png";
import { useUserContext } from "@/components/contexts/UserContext";
import { useAuthModalContext } from "@/components/contexts/AuthModalContext";
import { UserImageFallback } from "@/components/ui/figma/ImageWithFallback";

const menuGroups = {
	guest: [
		{
			title: "Acesso rápido",
			items: [
				{ label: "Início", to: "/", icon: HomeIcon },
				{ label: "Explorar", to: "/", icon: ExploreIcon },
				{ label: "Anunciar", action: "register", icon: Buildings },
				{ label: "Sobre", to: "/about", icon: AboutIcon },
			],
		},
		{
			title: "Suporte",
			items: [
				{ label: "Contato", to: "/contact", icon: Contact },
				{ label: "Entrar", action: "login", icon: LoginIcon },
			],
		},
		{
			title: "Informações",
			items: [
				{ label: "Privacidade", to: "/privacy", icon: PrivacyIcon },
				{ label: "Termos", to: "/terms", icon: TermsIcon },
			],
		},
	],
	user: [
		{
			title: "Acesso rápido",
			items: [
				{ label: "Início", to: "/", icon: HomeIcon },
				{ label: "Explorar", to: "/", icon: ExploreIcon },
				{ label: "Anunciar", to: "/account/places/new", icon: Buildings },
				{ label: "Sobre", to: "/about", icon: AboutIcon },
			],
		},
		{
			title: "Conta",
			items: [
				{ label: "Reservas", to: "/account/bookings", icon: Book },
				{ label: "Acomodações", to: "/account/places", icon: Buildings },
				{ label: "Perfil", to: "/account/profile", icon: ProfileIcon },
				{
					label: "Editar perfil",
					to: "/account/profile/edit",
					icon: AboutIcon,
				},
				{ label: "Painel", to: "/account/dashboard", icon: DashboardIcon },
			],
		},
		{
			title: "Informações",
			items: [
				{ label: "Contato", to: "/contact", icon: Contact },
				{ label: "Privacidade", to: "/privacy", icon: PrivacyIcon },
				{ label: "Termos", to: "/terms", icon: TermsIcon },
			],
		},
	],
};

const MobileTopBar = () => {
	const { user, setUser } = useUserContext();
	const { showAuthModal } = useAuthModalContext();
	const location = useLocation();
	const navigate = useNavigate();
	const [menuOpen, setMenuOpen] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		document.body.style.overflow = menuOpen ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [menuOpen]);

	useEffect(() => {
		setMenuOpen(false);
	}, [location.pathname]);

	useEffect(() => {
		const handleEscape = (event) => {
			if (event.key === "Escape") {
				setMenuOpen(false);
			}
		};

		window.addEventListener("keydown", handleEscape);
		return () => window.removeEventListener("keydown", handleEscape);
	}, []);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 12);
		};

		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const cta = useMemo(() => {
		if (!user) {
			return {
				label: "Entrar",
				onClick: () => showAuthModal("login"),
			};
		}

		if (
			location.pathname === "/" ||
			location.pathname.startsWith("/places") ||
			location.pathname.startsWith("/about")
		) {
			return {
				label: "Reservar",
				onClick: () => navigate("/account/bookings"),
			};
		}

		return {
			label: "Anuncie",
			onClick: () => navigate("/account/places/new"),
		};
	}, [location.pathname, navigate, showAuthModal, user]);

	const groups = user ? menuGroups.user : menuGroups.guest;

	const isItemActive = (to) => {
		if (!to) return false;
		if (to === "/") return location.pathname === "/";
		return location.pathname.startsWith(to);
	};

	const handleActionItem = (action) => {
		setMenuOpen(false);
		if (action === "login") showAuthModal("login");
		if (action === "register") showAuthModal("register");
	};

	const handleLogout = async () => {
		try {
			await axios.post("/users/logout", {}, { withCredentials: true });
			delete axios.defaults.headers.common["Authorization"];
			localStorage.clear();
			sessionStorage.clear();
			setUser(null);
			setMenuOpen(false);
			navigate("/");
		} catch (error) {
			console.error("Erro ao sair", error);
		}
	};

	const renderMenuItem = (item) => {
		const Icon = item.icon;
		const active = item.to && isItemActive(item.to);
		const className = `group flex min-h-24 flex-col justify-between rounded-[1.5rem] border p-4 text-left transition-all duration-200 ${
			active
				? "border-slate-900 bg-slate-900 text-white "
				: "border-white/80 bg-white/88 text-slate-900 "
		}`;

		const content = (
			<>
				<span
					className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${
						active ? "bg-white/14 text-white" : "bg-slate-100 text-slate-700"
					}`}
				>
					<Icon size={22} />
				</span>
				<span className="mt-5 flex items-center justify-between gap-2">
					<span className="text-sm font-semibold">{item.label}</span>
					<ArrowRight
						size={16}
						className={active ? "text-white" : "text-slate-400"}
					/>
				</span>
			</>
		);

		if (item.to) {
			return (
				<Link key={item.label} to={item.to} className={className}>
					{content}
				</Link>
			);
		}

		return (
			<button
				key={item.label}
				type="button"
				onClick={() => handleActionItem(item.action)}
				className={className}
			>
				{content}
			</button>
		);
	};

	return (
		<>
			<div
				className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 md:hidden ${
					isScrolled || menuOpen
						? "bg-slate-50 "
						: "border-b border-transparent bg-transparent"
				}`}
			>
				<div className="mx-auto flex h-18 items-center gap-3 px-4">
					<Link
						to="/"
						className="flex min-w-0 flex-1 items-center"
						aria-label="Página inicial"
					>
						<img
							src={logoPrimaryMobile}
							alt="Logo DormeAqui"
							className="h-8 w-auto object-contain"
						/>
					</Link>

					<button
						type="button"
						onClick={cta.onClick}
						className="inline-flex h-10 items-center justify-center rounded-full bg-[#0f172a] px-4 text-sm font-semibold text-white  transition-transform duration-200 active:scale-95"
					>
						{cta.label}
					</button>

					<button
						type="button"
						onClick={() => setMenuOpen((open) => !open)}
						aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
						aria-expanded={menuOpen}
						className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-200 active:scale-95 ${
							isScrolled || menuOpen
								? " text-slate-900 "
								: "border border-white/20 bg-white/12  backdrop-blur-md"
						}`}
					>
						{menuOpen ? (
							<CloseIcon size={22} />
						) : (
							<Bars3BottomRightIcon className="h-5 w-5" />
						)}
					</button>
				</div>
			</div>

			<AnimatePresence>
				{menuOpen && (
					<>
						<motion.section
							initial={{ opacity: 0, y: -32 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.24, ease: "easeOut" }}
							className="fixed top-[4.5rem] right-0 bottom-0 left-0 z-50 bg-slate-50 w-full  md:hidden"
						>
							<div className="mx-auto flex h-full  flex-col overflow-hidden px-4 pb-6 pt-4">
								{user && (
									<div className="mb-4 rounded-[1.5rem] border border-white/80 bg-white/92 p-3 ">
										<div className="flex items-center gap-3">
											<UserImageFallback
												type="avatar"
												src={user.photo}
												alt={user.name}
												className="h-14 w-14 rounded-2xl object-cover ring-1 ring-slate-200"
											/>
											<div className="min-w-0 flex-1">
												<p className="truncate text-sm font-semibold text-slate-900">
													{user.name}
												</p>
												<p className="truncate text-xs text-slate-500">
													{user.email}
												</p>
											</div>
											<Link
												to="/account/profile"
												className="inline-flex h-10 items-center rounded-full bg-slate-100 px-3 text-xs font-medium text-slate-700"
											>
												Perfil
											</Link>
										</div>
									</div>
								)}

								<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]">
									<div className="space-y-5 pb-10">
										{groups.map((group) => (
											<section key={group.title} className="space-y-3">
												<div className="px-1">
													<p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
														{group.title}
													</p>
												</div>

												<div className="grid grid-cols-2 gap-3">
													{group.items.map(renderMenuItem)}
												</div>
											</section>
										))}
									</div>
								</div>

								{user && (
									<div className="mt-4 rounded-[1.75rem] p-3 ">
										<button
											type="button"
											onClick={handleLogout}
											className="flex w-full items-center justify-between rounded-[1.25rem] px-3 py-3 text-left text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50"
										>
											<span className="flex items-center gap-3">
												<span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50">
													<LogoutIcon size={20} />
												</span>
												Sair da conta
											</span>
											<ArrowRight size={16} />
										</button>
									</div>
								)}
							</div>
						</motion.section>
					</>
				)}
			</AnimatePresence>
		</>
	);
};

export default MobileTopBar;
