import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { AuthDialog } from "../AuthDialog";

export const AuthModalContext = createContext(null);

export const useAuthModalContext = () => useContext(AuthModalContext);

export const AuthModalContextProvider = ({ children }) => {
	const [mode, setMode] = useState("");
	const [open, setOpen] = useState(false);

	const showAuthModal = (mode) => {
		setMode(mode);
		setOpen(true);
	};

	return (
		<AuthModalContext.Provider value={{ showAuthModal }}>
			{children}

			<AuthDialog open={open} mode={mode} setMode={setMode} setOpen={setOpen} />
		</AuthModalContext.Provider>
	);
};
