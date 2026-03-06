import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
	TooltipProvider,
} from "@/components/ui/tooltip";

const SidebarItem = ({ item, isCollapsed, onClick }) => {
	const location = useLocation();
	const isActive = location.pathname === item.path;
	const Icon = isActive && item.iconActive ? item.iconActive : item.icon;

	const linkEl = (
		<Link
			to={item.path}
			onClick={onClick}
			className={`
				relative flex items-center rounded-xl transition-all duration-200
				${isCollapsed ? "justify-center w-11 h-11 mx-auto" : "gap-3 px-3 py-2.5 w-full"}
				${
					isActive
						? "bg-primary-900 text-white shadow-sm"
						: "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
				}
			`}
		>
			<Icon className="w-5 h-5 flex-shrink-0" />

			<AnimatePresence initial={false}>
				{!isCollapsed && (
					<motion.span
						key="label"
						initial={{ opacity: 0, x: -6 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -6 }}
						transition={{ duration: 0.15 }}
						className={`text-sm whitespace-nowrap overflow-hidden ${
							isActive ? "font-semibold" : "font-medium"
						}`}
					>
						{item.label}
					</motion.span>
				)}
			</AnimatePresence>

			{(item.notifications ?? 0) > 0 && (
				<motion.span
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					className={`flex items-center justify-center font-bold rounded-full ${
						isCollapsed
							? "absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px]"
							: "ml-auto w-5 h-5 text-xs bg-white text-gray-700 shadow-sm"
					}`}
				>
					{item.notifications}
				</motion.span>
			)}
		</Link>
	);

	if (isCollapsed) {
		return (
			<TooltipProvider delayDuration={0}>
				<Tooltip>
					<TooltipTrigger asChild>
						<motion.div whileTap={{ scale: 0.93 }}>{linkEl}</motion.div>
					</TooltipTrigger>
					<TooltipContent side="right" sideOffset={10}>
						<p className="text-sm font-medium">{item.label}</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	return (
		<motion.div
			whileHover={{ x: 2 }}
			whileTap={{ scale: 0.97 }}
			transition={{ duration: 0.1 }}
		>
			{linkEl}
		</motion.div>
	);
};

export default SidebarItem;
