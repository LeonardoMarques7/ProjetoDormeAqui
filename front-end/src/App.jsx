import axios from "axios";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { UserContextProvider } from "./components/contexts/UserContext";
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";

axios.defaults.baseURL = import.meta.env.VITE_AXIOS_BASE_URL;
axios.defaults.withCredentials = true;

function App() {
	return (
		<UserContextProvider>
			<BrowserRouter>
				<Header />
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route path="/account/:subpage/:action?" element={<Account />} />
				</Routes>
			</BrowserRouter>
		</UserContextProvider>
	);
}

export default App;
