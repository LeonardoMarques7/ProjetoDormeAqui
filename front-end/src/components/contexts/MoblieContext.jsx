import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

export const moblieContext = createContext(null);

export const useMoblieContext = () => useContext(moblieContext);

export const MoblieContextProvider = ({ children }) => {
	const [moblie, setIsMoblie] = useState(window.innerWidth <= 768);

	useEffect(() => {
		const handleResize = () => setIsMoblie(window.innerWidth <= 768);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return (
		<moblieContext.Provider value={{ moblie }}>
			{children}
		</moblieContext.Provider>
	);
};
