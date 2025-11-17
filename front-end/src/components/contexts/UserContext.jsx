import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";

export const UserContext = createContext(null);

export const useUserContext = () => useContext(UserContext);

export const UserContextProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		const axiosGet = async () => {
			const { data } = await axios.get("/users/profile");

			setUser(data);
			setReady(true);
		};

		axiosGet();
	}, []);

	// Função para atualizar o usuário
	const updateUser = async () => {
		try {
			const { data } = await axios.get("/users/profile");
			setUser(data);
		} catch (error) {
			console.error("Erro ao atualizar usuário:", error);
		}
	};

	return (
		<UserContext.Provider value={{ user, setUser, ready, updateUser }}>
			{children}
		</UserContext.Provider>
	);
};
