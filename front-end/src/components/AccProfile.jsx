import { User } from "lucide-react";
import React from "react";
import axios from "axios";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useUserContext } from "./contexts/UserContext";

const AccProfile = () => {
	const { user, setUser } = useUserContext();
	const [redirect, setRedirect] = useState(false);
	const [message, setMessage] = useState("");

	const logout = async () => {
		try {
			const { data } = await axios.post("/users/logout");
			console.log(data);
			setRedirect(true);
		} catch (error) {
			setMessage("Error ao deslogar!!");
		}
	};

	if (redirect) return <Navigate to="/" />;

	return (
		<div>
			<div className="flex flex-col items-center gap-2">
				<p>
					Logado com {user?.name} ({user?.email})
				</p>
				{message && <h2 className="text-red-500">{message}</h2>}
				<button
					onClick={logout}
					className="bg-primary-600 cursor-pointer hover:opacity-95 ease-in-out duration-300 text-white px-10 py-2.5 rounded-full"
				>
					Sair
				</button>
			</div>
		</div>
	);
};

export default AccProfile;
