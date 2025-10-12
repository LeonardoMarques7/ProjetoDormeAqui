import axios from "axios";
import {
	BrowserRouter,
	Routes,
	Route,
	useLocation,
	useParams,
} from "react-router-dom";

import { UserContextProvider } from "./components/contexts/UserContext";
import { MessageProvider } from "./components/contexts/MessageContext";

import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import Place from "./pages/Place";

import "@mantine/core/styles.css";

import { MantineProvider } from "@mantine/core";
import { useState } from "react";
import { set } from "date-fns";
import { MoblieContextProvider } from "./components/contexts/MoblieContext";

axios.defaults.baseURL =
	import.meta.env.MODE === "development"
		? "http://localhost:3000/api"
		: "https://projetodormeaqui-production.up.railway.app/api";
axios.defaults.withCredentials = true;

function App() {
	const location = useLocation();
	const isComponentActive =
		location.pathname === "/login" || location.pathname === "/register";
	return (
		<MantineProvider>
			<MoblieContextProvider>
				<UserContextProvider>
					<MessageProvider>
						<Header active={isComponentActive} />
						<Routes>
							<Route path="/" element={<Home />} />
							<Route path="/login" element={<Login />} />
							<Route path="/register" element={<Register />} />
							<Route
								path="/account/:subpage/:action?/:id?"
								element={<Account />}
							/>
							<Route path="/places/:id" element={<Place />} />
						</Routes>
					</MessageProvider>
				</UserContextProvider>
			</MoblieContextProvider>
		</MantineProvider>
	);
}

export default App;
