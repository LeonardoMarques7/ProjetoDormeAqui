import axios from "axios";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import { Toaster } from "sonner";

import { UserContextProvider } from "./components/contexts/UserContext";
import { MessageProvider } from "./components/contexts/MessageContext";

import Home from "./pages/Home";
import Account from "./pages/Account";
import Place from "./pages/Place";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentPending from "./pages/PaymentPending";
import PaymentFailure from "./pages/PaymentFailure";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import AppSidebar from "@/components/layout/Sidebar";
import {
	SidebarProvider,
	SidebarInset,
	useSidebar,
} from "@/components/ui/sidebar";
import { ChevronRight } from "lucide-react";

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

function SidebarToggleButton() {
	const { state, toggleSidebar, isMobile } = useSidebar();
	if (isMobile) return null;
	return (
		<button
			onClick={toggleSidebar}
			className="z-50 h-10 w-5 bg-[#f5f5f5] rounded-r-xl shadow-sm flex items-center justify-center hover:bg-gray-200 transition-colors duration-200 border border-gray-200/60 border-l-0"
			style={{
				left:
					state === "collapsed"
						? "calc(var(--sidebar-width-icon) + 0.5rem)"
						: "calc(var(--sidebar-width) + 0.5rem)",
				transition: "left 200ms ease",
			}}
		>
			<ChevronRight
				className={`w-3 h-3 text-gray-500 transition-transform duration-200 ${
					state !== "collapsed" ? "rotate-180" : ""
				}`}
			/>
		</button>
	);
}

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
							<SidebarProvider>
								<AppSidebar />

								<SidebarInset>
									<ScrollToTop />
									<Header active={isComponentActive} />
									<div className="flex flex-1 flex-col p-4">
										<Routes>
											<Route path="/" element={<Home />} />
											<Route
												path="/reset-password"
												element={<ResetPassword />}
											/>
											<Route
												path="/account/:subpage/:action?/:id?"
												element={<Account />}
											/>
											<Route path="/places/:id" element={<Place />} />
											<Route
												path="/payment/success"
												element={<PaymentSuccess />}
											/>
											<Route
												path="/payment/pending"
												element={<PaymentPending />}
											/>
											<Route
												path="/payment/failure"
												element={<PaymentFailure />}
											/>
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
								</SidebarInset>
							</SidebarProvider>
						</MessageProvider>
					</AuthModalContextProvider>
				</UserContextProvider>
			</MobileContextProvider>
		</MantineProvider>
	);
}

export default App;
