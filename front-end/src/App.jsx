import axios from "axios";
import {
	BrowserRouter,
	Routes,
	Route,
	useLocation,
	useParams,
} from "react-router-dom";

import { UserContextProvider } from "./components/contexts/UserContext";
import { NotificationProvider } from "./components/contexts/NotificationContext";
import { MessageProvider } from "./components/contexts/MessageContext";

import Header from "./components/layout/Header";
import NotificationToast from "./components/common/NotificationToast";
import Home from "./pages/Home";
import Account from "./pages/Account";
import Place from "./pages/Place";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentPending from "./pages/PaymentPending";
import PaymentFailure from "./pages/PaymentFailure";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

import Footer from "@/components/layout/Footer";
import StaggeredMenu from "@/components/layout/StaggeredMenu";
import AppSidebar from "@/components/layout/Sidebar";
import MobileTopBar from "@/components/layout/MobileTopBar";
import MobileBottomNavigation from "@/components/layout/MobileNavBar";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
	SidebarFooter,
} from "@/components/ui/sidebar";

import "@mantine/core/styles.css";

import GithubCallback from "./pages/GithubCallback";
import GoogleCallback from "./pages/GoogleCallback";

import { useEffect, useContext } from "react";
import {
	MobileContextProvider,
	MobileContext, // ← exportar isso do seu MobileContext.jsx
} from "./components/contexts/MobileContext";

import { AuthModalContextProvider } from "./components/contexts/AuthModalContext";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./components/common/PageTransition";
import SnackbarUndo from "./components/SnackbarUndo";
import { MantineProvider } from "@mantine/core";

axios.defaults.baseURL =
	import.meta.env.MODE === "development"
		? "http://localhost:3000/api"
		: "https://zk8kgskg4cwg80osgckokowo.46.62.153.177.sslip.io/api";
axios.defaults.withCredentials = true;

function ScrollToTop() {
	const { pathname } = useLocation();

	useEffect(() => {
		window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
	}, [pathname]);

	return null;
}

// AppContent fica dentro do MobileContextProvider para ter acesso ao contexto
function AppContent() {
	const { mobile } = useContext(MobileContext); // ← aqui consome o contexto
	const location = useLocation();

	const isComponentActive =
		location.pathname === "/login" || location.pathname === "/register";
	const isHome = location.pathname === "/";

	return (
		<MantineProvider>
			<UserContextProvider>
				<AuthModalContextProvider>
					<NotificationProvider>
						<MessageProvider>
							{/* <MobileTopBar /> */}
							{!mobile && <Header isAbsolute={isHome} />}
							<NotificationToast />
							<ScrollToTop />

							<div
								className={`${
									isHome && !mobile ? "h-screen" : "min-h-screen"
								} relative max-sm:justify-center! flex flex-1 flex-col ${
									isHome ? "" : "p-4"
								} h-full w-full ${isHome ? "" : "justify-between"} md:pb-0 pb-24 md:pt-0`}
							>
								<PageTransition>
									<Routes>
										<Route path="/" element={<Home />} />
										<Route path="/about" element={<About />} />
										<Route path="/contact" element={<Contact />} />
										<Route path="/privacy" element={<Privacy />} />
										<Route path="/terms" element={<Terms />} />
										<Route path="/reset-password" element={<ResetPassword />} />
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
								</PageTransition>
								{!isHome && <Footer active={isComponentActive} />}
							</div>
							<MobileBottomNavigation />
						</MessageProvider>
					</NotificationProvider>
				</AuthModalContextProvider>
			</UserContextProvider>
		</MantineProvider>
	);
}

function App() {
	return (
		<MobileContextProvider>
			<AppContent />
		</MobileContextProvider>
	);
}

export default App;
