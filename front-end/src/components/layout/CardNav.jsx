import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { GoArrowUpRight } from "react-icons/go";
import { Link } from "react-router-dom";
import logoPrimary from "@/assets/logos/logo__primary.png";
import { useUserContext } from "@/components/contexts/UserContext";
import { useAuthModalContext } from "@/components/contexts/AuthModalContext";
import { useMessage } from "@/components/contexts/MessageContext";
import axios from "axios";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CardNav = ({ className = "", ease = "power3.out" }) => {
	const { user, setUser } = useUserContext();
	const { showAuthModal } = useAuthModalContext();
	const { showMessage } = useMessage();

	const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const navRef = useRef(null);
	const cardsRef = useRef([]);
	const tlRef = useRef(null);

	const navItems = user
		? [
				{
					label: "Explorar",
					bgColor: "#f5f5f5",
					textColor: "#111111",
					links: [
						{ label: "Página Inicial", to: "/" },
						{ label: "Ver Acomodações", to: "/account/places" },
					],
				},
				{
					label: "Reservas",
					bgColor: "#eff6ff",
					textColor: "#1e40af",
					links: [{ label: "Minhas Reservas", to: "/account/bookings" }],
				},
				{
					label: "Perfil",
					bgColor: "#f0fdf4",
					textColor: "#166534",
					links: [
						{ label: "Meu Perfil", to: "/account/profile" },
						{ label: "Editar Perfil", to: "/account/profile/edit" },
					],
				},
			]
		: [
				{
					label: "Explorar",
					bgColor: "#f5f5f5",
					textColor: "#111111",
					links: [{ label: "Página Inicial", to: "/" }],
				},
				{
					label: "Hospedagem",
					bgColor: "#eff6ff",
					textColor: "#1e40af",
					links: [
						{
							label: "Torne-se um anfitrião",
							onClick: () => showAuthModal("login"),
						},
					],
				},
				{
					label: "Acesso",
					bgColor: "#fef3c7",
					textColor: "#92400e",
					links: [
						{ label: "Entrar", onClick: () => showAuthModal("login") },
						{ label: "Criar Conta", onClick: () => showAuthModal("register") },
					],
				},
			];

	const calculateHeight = () => 260;

	const createTimeline = () => {
		const navEl = navRef.current;
		if (!navEl) return null;

		gsap.set(navEl, { height: 60, overflow: "hidden" });
		gsap.set(cardsRef.current, { y: 50, opacity: 0 });

		const tl = gsap.timeline({ paused: true });
		tl.to(navEl, { height: calculateHeight(), duration: 0.4, ease });
		tl.to(
			cardsRef.current,
			{ y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 },
			"-=0.1",
		);

		return tl;
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useLayoutEffect(() => {
		const tl = createTimeline();
		tlRef.current = tl;
		return () => {
			tl?.kill();
			tlRef.current = null;
		};
	}, [ease, user]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useLayoutEffect(() => {
		const handleResize = () => {
			if (!tlRef.current) return;
			if (isExpanded) {
				gsap.set(navRef.current, { height: calculateHeight() });
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

	const logout = async () => {
		try {
			await axios.post("/users/logout", {}, { withCredentials: true });
			delete axios.defaults.headers.common["Authorization"];
			localStorage.clear();
			sessionStorage.clear();
			setUser(null);
			showMessage("Logout realizado com sucesso!", "success");
			if (isExpanded) toggleMenu();
		} catch (error) {
			alert(JSON.stringify(error));
		}
	};

	const setCardRef = (i) => (el) => {
		if (el) cardsRef.current[i] = el;
	};

	return (
		<div className={`absolute right-[2em] w-2xl top-[2em] z-[99] ${className}`}>
			<nav
				ref={navRef}
				className="block rounded-2xl w-full shadow-md relative min-h-20 overflow-hidden will-change-[height] bg-white border border-gray-100"
			>
				{/* Top bar */}
				<div className="absolute inset-x-0 top-0 h-fit flex items-center justify-between px-4 z-[2]">
					<div
						className="group min-h-20 max-h-full h-full flex flex-col items-center justify-center cursor-pointer gap-[6px]"
						onClick={toggleMenu}
						role="button"
						aria-label={isExpanded ? "Fechar menu" : "Abrir menu"}
						tabIndex={0}
						onKeyDown={(e) => e.key === "Enter" && toggleMenu()}
					>
						<div
							className={`w-[26px] h-[2px] bg-gray-800 transition-all duration-300 [transform-origin:50%_50%] group-hover:opacity-75 ${
								isHamburgerOpen ? "translate-y-[4px] rotate-45" : ""
							}`}
						/>
						<div
							className={`w-[26px] h-[2px] bg-gray-800 transition-all duration-300 [transform-origin:50%_50%] group-hover:opacity-75 ${
								isHamburgerOpen ? "-translate-y-[4px] -rotate-45" : ""
							}`}
						/>
					</div>
					{user ? (
						<DropdownMenu modal={false}>
							<DropdownMenuTrigger className="outline-none">
								<div className="flex items-center gap-2 bg-primary-100 hover:bg-gray-200 transition-colors p-1.5 pr-3 rounded-xl cursor-pointer">
									<img
										src={user.photo}
										className="w-7 h-7 rounded-full object-cover"
										alt="Foto do usuário"
									/>
									<ChevronDown size={14} className="text-gray-500" />
								</div>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								align="end"
								className="p-2 mt-4 z-100 bg-white rounded-xl shadow-xl flex flex-col gap-2"
							>
								<Link
									to="/account/profile"
									className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-xl group"
								>
									<img
										src={user.photo}
										className="w-10 h-10 rounded-full object-cover"
										alt="Foto do usuário"
									/>
									<div className="flex flex-col">
										<span className="text-sm font-medium">{user.name}</span>
										<span className="text-xs text-gray-500">{user.email}</span>
									</div>
									<ChevronRight
										size={14}
										className="opacity-0 group-hover:opacity-100 ml-auto text-gray-400"
									/>
								</Link>
								<DropdownMenuSeparator />
								<Link
									to="/account/profile/edit"
									className="flex justify-between items-center px-4 py-2 hover:bg-gray-100 rounded-xl text-sm group"
								>
									Editar perfil
									<ChevronRight
										size={14}
										className="opacity-0 group-hover:opacity-100 text-gray-400"
									/>
								</Link>
								<button
									onClick={logout}
									className="flex justify-between items-center px-4 py-2 hover:bg-red-50 rounded-xl text-sm text-red-500 group w-full text-left cursor-pointer"
								>
									Sair
									<ChevronRight
										size={14}
										className="opacity-0 group-hover:opacity-100"
									/>
								</button>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<button
							onClick={() => showAuthModal("login")}
							className="bg-gray-900 text-white text-sm font-medium px-4 h-[42px] rounded-xl hover:bg-black transition-colors cursor-pointer"
						>
							Entrar
						</button>
					)}
				</div>

				{/* Cards content */}
				<div
					className={`absolute left-0 right-0 top-[60px] bottom-0 p-2 pt-4 flex items-end gap-3 z-[1] ${
						isExpanded
							? "visible pointer-events-auto"
							: "invisible pointer-events-none"
					}`}
					aria-hidden={!isExpanded}
				>
					{navItems.map((item, idx) => (
						<div
							key={`${item.label}-${idx}`}
							className="h-full flex-1 min-w-0 rounded-[calc(0.75rem-0.2rem)] relative flex flex-col p-3 gap-2 select-none"
							ref={setCardRef(idx)}
							style={{ backgroundColor: item.bgColor, color: item.textColor }}
						>
							<div className="font-normal tracking-[-0.5px] text-[22px]">
								{item.label}
							</div>
							<div className="mt-auto flex flex-col gap-[2px]">
								{item.links?.map((lnk, i) =>
									lnk.to ? (
										<Link
											key={i}
											to={lnk.to}
											onClick={toggleMenu}
											className="inline-flex items-center gap-[6px] no-underline cursor-pointer transition-opacity duration-300 hover:opacity-75 text-[16px]"
										>
											<GoArrowUpRight className="shrink-0" />
											{lnk.label}
										</Link>
									) : (
										<button
											key={i}
											onClick={() => {
												lnk.onClick?.();
												toggleMenu();
											}}
											className="inline-flex items-center gap-[6px] cursor-pointer transition-opacity duration-300 hover:opacity-75 text-[16px] text-left"
										>
											<GoArrowUpRight className="shrink-0" />
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
