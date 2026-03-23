import { Navigate } from "react-router-dom";
import { useUserContext } from "@/components/contexts/UserContext";
import { useAuthModalContext } from "@/components/contexts/AuthModalContext";

/**
 * PrivateRoute Component - Protects routes that require authentication
 * 
 * Usage:
 * <Route path="/account/bookings" element={
 *   <PrivateRoute>
 *     <AccBookings />
 *   </PrivateRoute>
 * } />
 * 
 * Behavior:
 * - If user is logged in: renders the component normally
 * - If user is NOT logged in: shows login modal and navigates to home
 * - While checking auth status: shows nothing (ready state)
 */
export function PrivateRoute({ children }) {
	const { user, ready } = useUserContext();
	const { showAuthModal } = useAuthModalContext();

	// Still loading auth status, show nothing
	if (!ready) {
		return null;
	}

	// User is not authenticated, show modal and redirect
	if (!user) {
		showAuthModal("login");
		return <Navigate to="/" replace />;
	}

	// User is authenticated, render the protected component
	return children;
}

export default PrivateRoute;
