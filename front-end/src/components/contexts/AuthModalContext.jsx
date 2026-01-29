import axios from "axios";
import {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
	useMemo,
} from "react";
import { AuthDialog } from "../AuthDialog";

export const AuthModalContext = createContext({ showAuthModal: () => {} });

export const useAuthModalContext = () => useContext(AuthModalContext);

export const AuthModalContextProvider = ({ children }) => {
	const [mode, setMode] = useState("");
	const [open, setOpen] = useState(false);

	const showAuthModal = useCallback((mode) => {
		setMode(mode);
		setOpen(true);
	}, []);

	const value = useMemo(() => ({ showAuthModal }), [showAuthModal]);

	return (
		<AuthModalContext.Provider value={value}>
			{children}

			<AuthDialog open={open} mode={mode} setMode={setMode} setOpen={setOpen} />
		</AuthModalContext.Provider>
	);
};
