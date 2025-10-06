import axios from "axios";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { UserContextProvider } from "./components/contexts/UserContext";
import { MessageProvider } from "./components/contexts/MessageContext";

import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import Place from "./pages/Place";

axios.defaults.baseURL =
	import.meta.env.MODE === "development"
		? "http://localhost:3000/api"
		: "https://projetodormeaqui-production.up.railway.app/api";
axios.defaults.withCredentials = true;

function App() {
	return (
		<UserContextProvider>
			<MessageProvider>
				<BrowserRouter>
					<Header />
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
				</BrowserRouter>
			</MessageProvider>
		</UserContextProvider>
	);
}

export default App;
