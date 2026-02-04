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

import Home from "./pages/Home";
import Account from "./pages/Account";
import Place from "./pages/Place";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Footer from "@/components/layout/Footer";
import AppSidebar from "@/components/layout/Sidebar";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";

import "@mantine/core/styles.css";

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
							<SidebarProvider>
								<AppSidebar active={isComponentActive} />
								<SidebarInset>
									<ScrollToTop />
									<div className="flex flex-col min-h-screen">
										<header className="flex shrink-0 absolute group transition-all hover:bg-sidebar bg-sidebar/90   top-3 left-3 rounded-xl p-2.5 z-50 items-center gap-2">
											<SidebarTrigger className="cursor-pointer hover:bg-transparent text-gray-800 " />
										</header>
										<div className="flex flex-1 flex-col gap-10 p-4">
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
												<Route path="/*" element={<NotFound />} />
											</Routes>
											<Footer active={isComponentActive} />
										</div>
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
