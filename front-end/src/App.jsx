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
							<SidebarProvider>
								<AppSidebar active={isComponentActive} />
								<SidebarInset>
									<ScrollToTop />
									<div className="flex flex-col min-h-screen">
										<header
											className="flex shrink-0 absolute group transition-all  rounded-tl-2xl bg-white top-0 left-0 rounded-r-3xl p-4 z-50 items-center gap-2 
  before:content-[''] before:absolute before:bottom-6 before:-right-5  before:rotate-90 before:w-5 before:h-5 before:bg-transparent before:rounded-bl-[10px] before:shadow-[-10px_10px_0_0_white]
  after:content-[''] after:absolute after:-bottom-5 after:left-4 after:w-5 after:h-5 after:bg-transparent after:rounded-tl-[10px] after:shadow-[-10px_-10px_0_0_white]"
										>
											<SidebarTrigger className="cursor-pointer hover:text-gray-900 text-gray-700" />
										</header>
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
