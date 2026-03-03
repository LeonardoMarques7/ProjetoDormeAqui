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

import Header from "./components/layout/Header";
import Home from "./pages/Home";
import Account from "./pages/Account";
import Place from "./pages/Place";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentPending from "./pages/PaymentPending";
import PaymentFailure from "./pages/PaymentFailure";

import Footer from "@/components/layout/Footer";
import AppSidebar from "@/components/layout/Sidebar";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
	SidebarFooter,
} from "@/components/ui/sidebar";

import "@mantine/core/styles.css";

import GithubCallback from "./pages/GithubCallback";
import GoogleCallback from "./pages/GoogleCallback";

import { MantineProvider } from "@mantine/core";
import { useEffect } from "react";
import { MobileContextProvider } from "./components/contexts/MobileContext";

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
							<Header />
							<ScrollToTop />

							<div className="min-h-screen relative flex flex-1 flex-col p-4 h-full w-full justify-between">
								<Routes>
									<Route path="/" element={<Home />} />
									<Route path="/reset-password" element={<ResetPassword />} />
									<Route
										path="/account/:subpage/:action?/:id?"
										element={<Account />}
									/>
									<Route path="/places/:id" element={<Place />} />
									<Route path="/payment/success" element={<PaymentSuccess />} />
									<Route path="/payment/pending" element={<PaymentPending />} />
									<Route path="/payment/failure" element={<PaymentFailure />} />
									<Route path="/*" element={<NotFound />} />

									<Route
										path="/auth/github/callback"
										element={<GithubCallback />}
									/>
									<Route
										path="/auth/google/callback"
										element={<GoogleCallback />}
									/>
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
