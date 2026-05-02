import { useEffect } from "react";
import SimpleNavbar from "./SimpleNavbar";

const Header = ({
	active,
	isAbsolute,
	dashboardNavItems,
	activeDashboardSection,
	onDashboardSectionChange,
}) => {
	useEffect(() => {
		isAbsolute == true;
	}, [active, isAbsolute]);

	return (
		<header
			className={`${isAbsolute ? "absolute top-0 left-0 right-0 z-50 text-white!" : "relative"} w-full min-h-20 max-h-full`}
		>
			<SimpleNavbar
				isAbsolute={isAbsolute}
				dashboardNavItems={dashboardNavItems}
				activeDashboardSection={activeDashboardSection}
				onDashboardSectionChange={onDashboardSectionChange}
			/>
		</header>
	);
};

export default Header;
