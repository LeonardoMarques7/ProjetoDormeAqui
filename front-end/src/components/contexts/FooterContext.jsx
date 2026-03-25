import {
	createContext,
	useContext,
	useRef,
	useCallback,
	useState,
} from "react";

export const FooterContext = createContext(null);

export const useFooterHeight = () => {
	const context = useContext(FooterContext);
	if (!context) {
		throw new Error("useFooterHeight must be used within FooterProvider");
	}
	return context;
};

export const FooterProvider = ({ children }) => {
	const footerRef = useRef(null);
	const [footerHeight, setFooterHeight] = useState(0);

	const observeFooterHeight = useCallback((element) => {
		if (!element) return;

		footerRef.current = element;

		// ResizeObserver para detectar mudanças de altura
		const resizeObserver = new ResizeObserver((entries) => {
			for (let entry of entries) {
				const height = entry.target.offsetHeight;
				setFooterHeight(height);
			}
		});

		resizeObserver.observe(element);

		// Também medir altura inicial
		const initialHeight = element.offsetHeight;
		if (initialHeight > 0) {
			setFooterHeight(initialHeight);
		}

		return () => resizeObserver.disconnect();
	}, []);

	const value = {
		footerHeight,
		observeFooterHeight,
		footerRef,
	};

	return (
		<FooterContext.Provider value={value}>{children}</FooterContext.Provider>
	);
};
