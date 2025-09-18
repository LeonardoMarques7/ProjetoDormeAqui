import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { use } from "react";
import { useState } from "react";

axios.defaults.baseURL = import.meta.env.VITE_AXIOS_BASE_URL;

function App() {
	const [user, setUser] = useState(null);

	return (
		<BrowserRouter>
			<Header user={user} />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route
					path="/login"
					element={<Login setUser={setUser} user={user} />}
				/>
				<Route path="/register" element={<Register setUser={setUser} />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
