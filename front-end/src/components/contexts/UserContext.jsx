import axios from "axios";
import { useEffect, useState } from "react";
import { createContext, useContext } from "react";

export const userContext = createContext(null);

export const useUserContext = () => useContext(userContext);

import React from "react";

export const UserContextProvider = ({ children }) => {
	const [user, setUser] = useState(null);

	useEffect(() => {
		const axiosGet = async () => {
			const { data } = await axios.get("/users/profile");

			setUser(data);
		};
		axiosGet();
	}, []);

	return (
		<userContext.Provider value={{ user, setUser }}>
			{children}
		</userContext.Provider>
	);
};

export default UserContextProvider;
