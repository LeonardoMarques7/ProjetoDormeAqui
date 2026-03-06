import React, { useCallback, useLayoutEffect, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";
import { ChevronRight, X } from "lucide-react";
import logoPrimary from "@/assets/logos/logo__primary.png";

import "./StaggeredMenu.css";
const StaggeredMenu = ({
	open = false,
	onClose,
	triggerRef,
	position = "right",
	colors = ["#94a3b8", "#1e293b"],
	items = [],
	socialItems = [],
	displaySocials = false,
	accentColor = "#1e293b",
	closeOnClickAway = true,
	userProfile = null,
}) => {
	const panelRef = useRef(null);
	const preLayersRef = useRef(null);
	const preLayerElsRef = useRef([]);
	const openTlRef = useRef(null);
	const closeTweenRef = useRef(null);
	const busyRef = useRef(false);
	const prevOpenRef = useRef(false);

	const normalItems = items.filter((i) => i.variant !== "danger");
	const dangerItems = items.filter((i) => i.variant === "danger");

	useLayoutEffect(() => {
		const ctx = gsap.context(() => {
			const panel = panelRef.current;
			const preContainer = preLayersRef.current;
			if (!panel) return;

			let preLayers = [];
			if (preContainer) {
				preLayers = Array.from(preContainer.querySelectorAll(".sm-prelayer"));
			}
			preLayerElsRef.current = preLayers;

			const offscreen = position === "left" ? -100 : 100;
			gsap.set([panel, ...preLayers], { xPercent: offscreen });
		});
		return () => ctx.revert();
	}, [position]);

	const buildOpenTimeline = useCallback(() => {
		const panel = panelRef.current;
		const layers = preLayerElsRef.current;
		if (!panel) return null;

		openTlRef.current?.kill();
		closeTweenRef.current?.kill();

		const itemLinks = Array.from(panel.querySelectorAll(".sm-panel-item-link"));
		const profileCard = panel.querySelector(".sm-profile-card");
		const divider = panel.querySelector(".sm-divider");

		const layerStates = layers.map((el) => ({
			el,
			start: Number(gsap.getProperty(el, "xPercent")),
		}));
		const panelStart = Number(gsap.getProperty(panel, "xPercent"));

		if (itemLinks.length) gsap.set(itemLinks, { y: 40, opacity: 0 });
		if (profileCard) gsap.set(profileCard, { y: 25, opacity: 0 });
		if (divider)
			gsap.set(divider, {
				scaleX: 0,
				opacity: 0,
				transformOrigin: "left center",
			});

		const tl = gsap.timeline({ paused: true });

		layerStates.forEach((ls, i) => {
			tl.fromTo(
				ls.el,
				{ xPercent: ls.start },
				{ xPercent: 0, duration: 0.5, ease: "power4.out" },
				i * 0.07,
			);
		});

		const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
		const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
		const panelDuration = 0.65;

		tl.fromTo(
			panel,
			{ xPercent: panelStart },
			{ xPercent: 0, duration: panelDuration, ease: "power4.out" },
			panelInsertTime,
		);

		if (itemLinks.length) {
			const itemsStart = panelInsertTime + panelDuration * 0.2;
			tl.to(
				itemLinks,
				{
					y: 0,
					opacity: 1,
					duration: 0.7,
					ease: "power3.out",
					stagger: { each: 0.08, from: "start" },
				},
				itemsStart,
			);
		}

		const footerStart = panelInsertTime + panelDuration * 0.55;
		if (divider) {
			tl.to(
				divider,
				{ scaleX: 1, opacity: 1, duration: 0.4, ease: "power2.out" },
				footerStart,
			);
		}
		if (profileCard) {
			tl.to(
				profileCard,
				{ y: 0, opacity: 1, duration: 0.55, ease: "power3.out" },
				footerStart + 0.1,
			);
		}

		openTlRef.current = tl;
		return tl;
	}, []);

	const playOpen = useCallback(() => {
		busyRef.current = true;
		const tl = buildOpenTimeline();
		if (tl) {
			tl.eventCallback("onComplete", () => {
				busyRef.current = false;
			});
			tl.play(0);
		} else {
			busyRef.current = false;
		}
	}, [buildOpenTimeline]);

	const playClose = useCallback(() => {
		openTlRef.current?.kill();
		const panel = panelRef.current;
		const layers = preLayerElsRef.current;
		if (!panel) return;

		const offscreen = position === "left" ? -100 : 100;
		closeTweenRef.current = gsap.to([...layers, panel], {
			xPercent: offscreen,
			duration: 0.32,
			ease: "power3.in",
			overwrite: "auto",
			onComplete: () => {
				const itemLinks = Array.from(
					panel.querySelectorAll(".sm-panel-item-link"),
				);
				if (itemLinks.length) gsap.set(itemLinks, { y: 40, opacity: 0 });
				const profileCard = panel.querySelector(".sm-profile-card");
				if (profileCard) gsap.set(profileCard, { y: 25, opacity: 0 });
				busyRef.current = false;
			},
		});
	}, [position]);

	useEffect(() => {
		if (open && !prevOpenRef.current) {
			playOpen();
		} else if (!open && prevOpenRef.current) {
			playClose();
		}
		prevOpenRef.current = open;
	}, [open, playOpen, playClose]);

	useEffect(() => {
		if (!closeOnClickAway || !open) return;
		const handleClickOutside = (event) => {
			if (triggerRef?.current && triggerRef.current.contains(event.target))
				return;
			if (panelRef.current && !panelRef.current.contains(event.target)) {
				onClose?.();
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [closeOnClickAway, open, onClose, triggerRef]);

	const rawColors =
		colors && colors.length ? colors.slice(0, 4) : ["#1e1e22", "#35353c"];
	let layerColors = [...rawColors];
	if (layerColors.length >= 3) {
		const mid = Math.floor(layerColors.length / 2);
		layerColors.splice(mid, 1);
	}

	const renderItem = (item, idx) => {
		const isDanger = item.variant === "danger";
		const textClass = isDanger
			? "text-4xl font-bold text-gray-400 mb-2 transition-all duration-300 group-hover:text-red-500 group-hover:translate-x-4 leading-tight tracking-tight"
			: "text-4xl font-bold text-gray-900 mb-2 transition-all duration-300 group-hover:text-purple-600 group-hover:translate-x-4 leading-tight tracking-tight";
		const barClass = isDanger
			? "sm-underline-bar bg-red-500"
			: "sm-underline-bar bg-purple-600";
		const sharedClass = "sm-panel-item-link block w-full text-left group py-1";

		const isActive = location.pathname === item.path;
		const Icon = isActive ? item.icon : item.iconRegular;

		return item.path ? (
			<Link
				key={item.label + idx}
				className={sharedClass}
				to={item.path}
				isActive={isActive}
				onClick={() => onClose?.()}
			>
				<div className="flex items-center flex-1 justify-between group">
					<div className="flex items-center gap-5">
						<Icon className="w-5 h-5 flex-shrink-0" />
						<h3 className="font-light!">{item.label}</h3>
					</div>
					{/* textClass */}
					<ChevronRight
						className="sm-profile-arrow group-hover:text-purple-600!"
						size={18}
					/>
				</div>

				<div className={barClass} />
			</Link>
		) : (
			<button
				key={item.label + idx}
				className={sharedClass}
				onClick={() => {
					item.onClick?.();
					onClose?.();
				}}
				type="button"
			>
				<div className="flex items-center flex-1 cursor-pointer justify-between group">
					<h2
						className={`${textClass} hover:text-red-500 group-hover:text-red-500 `}
					>
						{item.label}
					</h2>
					<ChevronRight
						className="sm-profile-arrow group-hover:text-red-500!"
						size={18}
					/>
				</div>
				<div className={barClass} />
			</button>
		);
	};

	return (
		<div
			className="staggered-menu-wrapper  fixed-wrapper items-start!"
			style={{
				pointerEvents: open ? undefined : "none",
				...(accentColor ? { "--sm-accent": accentColor } : {}),
			}}
			data-position={position}
			data-open={open || undefined}
		>
			<aside
				id="staggered-menu-panel"
				ref={panelRef}
				className="staggered-menu-panel "
				aria-hidden={!open}
			>
				{/* Close button */}
				<div className="flex justify-between  ">
					<img src={logoPrimary} className="h-25 object-cover" alt="" />
					<button
						onClick={onClose}
						aria-label="Fechar menu"
						type="button"
						className="w-11 h-11 rounded-full m-6 bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
					>
						<X size={20} className="text-gray-700" />
					</button>
				</div>

				{/* Nav items */}
				<nav className="flex-1 px-8 py-8 flex flex-col gap-2">
					<span className="uppercase text-sm">Navegação</span>
					{normalItems.map((item, idx) => renderItem(item, idx))}
					{dangerItems.length > 0 && (
						<>
							<div className="sm-divider" />
							{dangerItems.map((item, idx) =>
								renderItem(item, normalItems.length + idx),
							)}
						</>
					)}
					{displaySocials && socialItems && socialItems.length > 0 && (
						<div className="sm-socials mt-auto" aria-label="Social links">
							<h3 className="sm-socials-title">Social</h3>
							<ul className="sm-socials-list" role="list">
								{socialItems.map((s, i) => (
									<li key={s.label + i} className="sm-socials-item">
										<a
											href={s.link}
											target="_blank"
											rel="noopener noreferrer"
											className="sm-socials-link"
										>
											{s.label}
										</a>
									</li>
								))}
							</ul>
						</div>
					)}
				</nav>

				{/* Profile footer */}
				{userProfile && (
					<div className="px-8 pb-8 pt-0">
						<Link
							to={userProfile.to || "/account/profile"}
							onClick={() => onClose?.()}
							className="flex  items-center gap-5 group"
						>
							<img
								src={userProfile.photo}
								alt="Foto do usuário"
								className="sm-profile-avatar"
							/>
							<div className="sm-profile-info">
								<span className="sm-profile-name">{userProfile.name}</span>
								<span className="sm-profile-email">{userProfile.email}</span>
							</div>
							<ChevronRight
								className="sm-profile-arrow group-hover:text-primary-900!"
								size={18}
							/>
						</Link>
					</div>
				)}
			</aside>
		</div>
	);
};

export default StaggeredMenu;
