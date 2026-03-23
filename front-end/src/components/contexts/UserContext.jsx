import axios from "axios";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

export const UserContext = createContext(null);

export const useUserContext = () => useContext(UserContext);

export const UserContextProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		const axiosGet = async () => {
			try {
				const { data } = await axios.get("/users/profile");
				setUser(data);
			} catch (error) {
				if (error.response?.status === 401) {
					// User is not authenticated, set user to null
					setUser(null);
				} else {
					console.error("Error fetching user profile:", error);
				}
			} finally {
				setReady(true);
			}
		};

		axiosGet();
	}, []);

	// Logout function - clears user and token
	const logout = useCallback(() => {
		setUser(null);
		localStorage.removeItem("token");
		axios.defaults.headers.common["Authorization"] = "";
	}, []);

	return (
		<UserContext.Provider value={{ user, setUser, ready, logout }}>
			{children}
		</UserContext.Provider>
	);
};
