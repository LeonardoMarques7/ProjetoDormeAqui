import axios from "axios";
import {
	BrowserRouter,
	Routes,
	Route,
	useLocation,
	useParams,
} from "react-router-dom";

import { Toaster } from "sonner";

import { UserContextProvider } from "./components/contexts/UserContext";
import { MessageProvider } from "./components/contexts/MessageContext";

import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import Place from "./pages/Place";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

import "@mantine/core/styles.css";

import { MantineProvider } from "@mantine/core";
import { useEffect } from "react";
import { useState } from "react";
import { set } from "date-fns";
import { MobileContextProvider } from "./components/contexts/MobileContext";
import Footer from "./components/Footer";
import Teste from "./pages/Teste";
import { AuthModalContextProvider } from "./components/contexts/AuthModalContext";
axios.defaults.baseURL =
	import.meta.env.MODE === "development"
		? "http://localhost:3000/api"
		: "https://projetodormeaqui.onrender.com/api";
axios.defaults.withCredentials = true;

function ScrollToTop() {
	const { pathname } = useLocation();

	useEffect(() => {
		window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
	}, [pathname]);

	return null;
}

function App() {
	const location = useLocation();
	const isComponentActive =
		location.pathname === "/login" || location.pathname === "/register";
	return (
		<MantineProvider>
			<MobileContextProvider>
				<UserContextProvider>
					<AuthModalContextProvider>
						<MessageProvider>
							<Toaster position="top-right" />
							<div className="flex flex-col ">
								<ScrollToTop />
								<Header active={isComponentActive} />
								<Routes>
									<Route path="/" element={<Home />} />
									<Route path="/teste" element={<Teste />} />
									<Route path="/reset-password" element={<ResetPassword />} />
									<Route
										path="/account/:subpage/:action?/:id?"
										element={<Account />}
									/>
									<Route path="/places/:id" element={<Place />} />
									<Route path="/*" element={<NotFound />} />
								</Routes>
								<Footer active={isComponentActive} />
							</div>
						</MessageProvider>
					</AuthModalContextProvider>
				</UserContextProvider>
			</MobileContextProvider>
		</MantineProvider>
	);
}

export default App;
