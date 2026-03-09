import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { GoArrowUpRight } from "react-icons/go";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";

import { useUserContext } from "@/components/contexts/UserContext";
import { useAuthModalContext } from "@/components/contexts/AuthModalContext";
import { useMessage } from "@/components/contexts/MessageContext";
import logoPrimary from "@/assets/logos/logo__primary.png";
import logoSecondary from "@/assets/logos/logo__secondary.png";

const EASE = "power3.out";

const CardNav = ({ active, className = "" }) => {
	const { user, setUser } = useUserContext();
	const { showAuthModal } = useAuthModalContext();
	const { showMessage } = useMessage();
	const navigate = useNavigate();
	const location = useLocation();

	const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const navRef = useRef(null);
	const cardsRef = useRef([]);
	const tlRef = useRef(null);

	const logout = async () => {
		try {
			await axios.post("/users/logout", {}, { withCredentials: true });
			delete axios.defaults.headers.common["Authorization"];
			localStorage.clear();
			sessionStorage.clear();
			setUser(null);
			showMessage("Logout realizado com sucesso!", "success");
			navigate("/");
		} catch {
			showMessage("Erro ao sair. Tente novamente.", "error");
		}
	};

	const getItems = () => [
		{
			label: "Explorar",
			bgColor: "#fff",
			textColor: "#333333",
			border: "2px solid #e5e7eb",
			links: [
				{ label: "Página Inicial", href: "/" },
				{ label: "Ver Acomodações", href: "/#places" },
			],
		},
		{
			label: "Reservas",
			bgColor: "#f8f8f8",
			border: "2px solid #e5e7eb",
			textColor: "#333333",
			links: user
				? [
						{ label: "Minhas Reservas", href: "/account/bookings" },
						{ label: "Acomodações", href: "/account/places" },
					]
				: [
						{
							label: "Faça Login para ver",
							action: () => {
								closeMenu();
								showAuthModal("login");
							},
						},
					],
		},
		{
			label: "Conta",
			bgColor: "#eeee",
			textColor: "#333333",
			border: "2px solid #e5e7eb",
			links: user
				? [
						{ label: "Meu Perfil", href: "/account/profile" },
						{ label: "Editar Perfil", href: "/account/profile/edit" },
						{
							label: "Sair",
							action: () => {
								closeMenu();
								logout();
							},
						},
					]
				: [
						{
							label: "Entrar",
							action: () => {
								closeMenu();
								showAuthModal("login");
							},
						},
						{
							label: "Criar Conta",
							action: () => {
								closeMenu();
								showAuthModal("register");
							},
						},
					],
		},
	];

	const calculateHeight = () => {
		const navEl = navRef.current;
		if (!navEl) return 260;

		const isMobile = window.matchMedia("(max-width: 768px)").matches;
		if (isMobile) {
			const contentEl = navEl.querySelector(".card-nav-content");
			if (contentEl) {
				const wasVisibility = contentEl.style.visibility;
				const wasPointerEvents = contentEl.style.pointerEvents;
				const wasPosition = contentEl.style.position;
				const wasHeight = contentEl.style.height;

				contentEl.style.visibility = "visible";
				contentEl.style.pointerEvents = "auto";
				contentEl.style.position = "static";
				contentEl.style.height = "auto";

				contentEl.offsetHeight;

				const topBar = 60;
				const padding = 16;
				const contentHeight = contentEl.scrollHeight;

				contentEl.style.visibility = wasVisibility;
				contentEl.style.pointerEvents = wasPointerEvents;
				contentEl.style.position = wasPosition;
				contentEl.style.height = wasHeight;

				return topBar + contentHeight + padding;
			}
		}
		return 260;
	};

	const createTimeline = () => {
		const navEl = navRef.current;
		if (!navEl) return null;

		gsap.set(navEl, { height: 60, overflow: "hidden" });
		gsap.set(cardsRef.current.filter(Boolean), { y: 50, opacity: 0 });

		const tl = gsap.timeline({ paused: true });

		tl.to(navEl, { height: calculateHeight, duration: 0.4, ease: EASE });
		tl.to(
			cardsRef.current.filter(Boolean),
			{ y: 0, opacity: 1, duration: 0.4, ease: EASE, stagger: 0.08 },
			"-=0.1",
		);

		return tl;
	};

	useLayoutEffect(() => {
		const tl = createTimeline();
		tlRef.current = tl;
		return () => {
			tl?.kill();
			tlRef.current = null;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [EASE, user]);

	useLayoutEffect(() => {
		const handleResize = () => {
			if (!tlRef.current) return;
			if (isExpanded) {
				const newHeight = calculateHeight();
				gsap.set(navRef.current, { height: newHeight });
				tlRef.current.kill();
				const newTl = createTimeline();
				if (newTl) {
					newTl.progress(1);
					tlRef.current = newTl;
				}
			} else {
				tlRef.current.kill();
				const newTl = createTimeline();
				if (newTl) tlRef.current = newTl;
			}
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isExpanded]);

	const toggleMenu = () => {
		const tl = tlRef.current;
		if (!tl) return;
		if (!isExpanded) {
			setIsHamburgerOpen(true);
			setIsExpanded(true);
			tl.play(0);
		} else {
			setIsHamburgerOpen(false);
			tl.eventCallback("onReverseComplete", () => setIsExpanded(false));
			tl.reverse();
		}
	};

	const closeMenu = () => {
		const tl = tlRef.current;
		if (!tl || !isExpanded) return;
		setIsHamburgerOpen(false);
		tl.eventCallback("onReverseComplete", () => setIsExpanded(false));
		tl.reverse();
	};

	const setCardRef = (i) => (el) => {
		if (el) cardsRef.current[i] = el;
	};

	const logoSrc =
		active === true
			? logoPrimary
			: location.pathname === "/"
				? logoSecondary
				: logoPrimary;

	const items = getItems();

	return (
		<div
			className={`card-nav-container absolute left-1/2 -translate-x-1/2 w-full max-w-7xl z-[99] top-[1.2em] md:top-[2em] ${className}`}
		>
			<nav
				ref={navRef}
				className={`card-nav ${isExpanded ? "open bg-white shadow-lg" : ""} block h-[60px] p-0 rounded-2xl relative overflow-hidden will-change-[height]`}
			>
				{/* Top bar */}
				<div className="card-nav-top absolute inset-x-0 top-0 h-[60px] flex items-center justify-between p-2 pl-[1.1rem] z-[2]">
					{/* Logo centralizada */}
					<div className="logo-container flex items-center">
						<Link to="/" onClick={closeMenu}>
							<img
								src={logoPrimary}
								alt="Logo DormeAqui"
								className="h-20 object-contain"
							/>
						</Link>
					</div>

					<div className="flex items-center gap-4 ">
						{/* CTA Button */}
						{!user ? (
							<button
								type="button"
								onClick={() => showAuthModal("login")}
								className="hidden md:inline-flex border-0 rounded-[calc(1rem-0.2rem)] px-5 items-center h-[44px] font-semibold text-sm cursor-pointer transition-colors duration-300 bg-gray-900 text-white hover:bg-gray-700"
							>
								Entrar
							</button>
						) : (
							<Link
								to="/account/profile"
								onClick={closeMenu}
								className="hidden md:inline-flex items-center gap-2  p-1 rounded-full hover:bg-gray-100 transition-colors duration-300"
							>
								<img
									src={user.photo}
									alt={user.name}
									className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
								/>
								{/* <span className="text-sm font-semibold text-gray-800 max-w-[100px] truncate">
								{user.name?.split(" ")[0]}
							</span> */}
							</Link>
						)}
						{/* Hamburger */}
						<div
							className={`hamburger-menu ${isHamburgerOpen ? "open" : ""} group h-full flex flex-col items-center justify-center cursor-pointer gap-[6px] md:order-none`}
							onClick={toggleMenu}
							role="button"
							aria-label={isExpanded ? "Fechar menu" : "Abrir menu"}
							tabIndex={0}
							onKeyDown={(e) => e.key === "Enter" && toggleMenu()}
						>
							<AnimatePresence mode="wait">
								{isHamburgerOpen ? (
									<motion.svg
										key="close"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth="1.5"
										stroke="currentColor"
										className="size-6"
										initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
										animate={{ rotate: 0, opacity: 1, scale: 1 }}
										exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
										transition={{ duration: 0.25 }}
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M6 18 18 6M6 6l12 12"
										/>
									</motion.svg>
								) : (
									<motion.svg
										key="menu"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth={1.5}
										stroke="currentColor"
										className="size-6"
										initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
										animate={{ rotate: 0, opacity: 1, scale: 1 }}
										exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
										transition={{ duration: 0.25 }}
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
										/>
									</motion.svg>
								)}
							</AnimatePresence>
						</div>
					</div>
				</div>

				{/* Cards content */}
				<div
					className={`card-nav-content absolute left-0 right-0 top-[60px] bottom-0 p-2 flex flex-col items-stretch gap-2 justify-start z-[1] ${
						isExpanded
							? "visible pointer-events-auto"
							: "invisible pointer-events-none"
					} md:flex-row md:items-end md:gap-3`}
					aria-hidden={!isExpanded}
				>
					{items.map((item, idx) => (
						<div
							key={`${item.label}-${idx}`}
							className="nav-card select-none relative flex flex-col gap-2 p-[12px_16px] rounded-[calc(1rem-0.2rem)] min-w-0 flex-[1_1_auto] h-auto min-h-[60px] md:h-full md:min-h-0 md:flex-[1_1_0%]"
							ref={setCardRef(idx)}
							style={{
								backgroundColor: item.bgColor,
								color: item.textColor,
								border: item.border || "none",
							}}
						>
							<div className="font-semibold tracking-tight text-[18px] md:text-[20px]">
								{item.label}
							</div>
							<div className="mt-auto flex flex-col gap-1">
								{item.links.map((lnk, i) =>
									lnk.href ? (
										<Link
											key={`${lnk.label}-${i}`}
											to={lnk.href}
											onClick={closeMenu}
											className="inline-flex items-center gap-[6px] no-underline cursor-pointer transition-opacity duration-200 hover:opacity-70 text-[14px] md:text-[15px]"
											style={{ color: item.textColor }}
										>
											<GoArrowUpRight className="shrink-0" aria-hidden="true" />
											{lnk.label}
										</Link>
									) : (
										<button
											key={`${lnk.label}-${i}`}
											type="button"
											onClick={lnk.action}
											className="inline-flex items-center gap-[6px] cursor-pointer transition-opacity duration-200 hover:opacity-70 text-[14px] md:text-[15px] bg-transparent border-0 p-0 text-left"
											style={{ color: item.textColor }}
										>
											<GoArrowUpRight className="shrink-0" aria-hidden="true" />
											{lnk.label}
										</button>
									),
								)}
							</div>
						</div>
					))}
				</div>
			</nav>
		</div>
	);
};

export default CardNav;
