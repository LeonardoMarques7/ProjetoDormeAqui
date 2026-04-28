import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";

axios.defaults.withCredentials = true;

// Configurar uma vez no início
axios.defaults.baseURL =
	import.meta.env.MODE === "development"
		? "http://localhost:3000/api"
		: "https://zk8kgskg4cwg80osgckokowo.46.62.153.177.sslip.io/api";

const readCookie = (name) => {
	const match = document.cookie
		.split("; ")
		.find((row) => row.startsWith(`${name}=`));
	return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : "";
};

axios.interceptors.request.use((config) => {
	const csrfToken =
		readCookie("prod_csrf_token") || readCookie("dev_csrf_token");
	if (csrfToken) {
		config.headers["X-CSRF-Token"] = csrfToken;
	}
	return config;
});

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</GoogleOAuthProvider>
	</StrictMode>,
);
