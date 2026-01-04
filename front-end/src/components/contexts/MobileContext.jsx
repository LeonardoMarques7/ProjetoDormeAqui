import { createContext, useContext, useEffect, useState } from "react";

export const MobileContext = createContext(null);

export const useMobileContext = () => useContext(MobileContext);

export const MobileContextProvider = ({ children }) => {
	const [mobile, setIsMobile] = useState(window.innerWidth <= 768);

	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth <= 768);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return (
		<MobileContext.Provider value={{ mobile }}>
			{children}
		</MobileContext.Provider>
	);
};
