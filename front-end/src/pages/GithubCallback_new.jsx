import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useUserContext } from "@/components/contexts/UserContext";
import { useMessage } from "@/components/contexts/MessageContext";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const GithubCallback = () => {
	const [searchParams] = useSearchParams();
	const { setUser } = useUserContext();
	const { showMessage } = useMessage();

	useEffect(() => {
		let isMounted = true;
		let hasExecuted = false;

		const handleCallback = async () => {
			if (hasExecuted) return;
			hasExecuted = true;

			try {
				const code = searchParams.get("code");

				if (!code) {
					if (isMounted) {
						showMessage("Erro ao autenticar com GitHub", "error");
						// Fechar aba se foi aberta como popup
						setTimeout(() => {
							if (window.opener) {
								window.close();
							}
						}, 2000);
					}
					return;
				}

				const response = await axios.post(
					`${API_URL}/users/oauth/github`,
					{ code },
					{ withCredentials: true },
				);

				if (isMounted && response.data && response.data.token) {
					localStorage.setItem("token", response.data.token);
					axios.defaults.headers.common["Authorization"] =
						`Bearer ${response.data.token}`;

					if (response.data._id) {
						setUser(response.data);
						localStorage.setItem("user", JSON.stringify(response.data));
					}

					showMessage("Login realizado com sucesso!", "success");

					// Fechar aba se foi aberta como popup
					setTimeout(() => {
						if (window.opener) {
							window.close();
						}
					}, 1500);
				}
			} catch (err) {
				console.error("Erro no GithubCallback:", err);
				if (isMounted) {
					showMessage("Erro ao autenticar com GitHub", "error");
					// Fechar aba se foi aberta como popup
					setTimeout(() => {
						if (window.opener) {
							window.close();
						}
					}, 2000);
				}
			}
		};

		handleCallback();

		return () => {
			isMounted = false;
		};
	}, []);

	return null;
};

export default GithubCallback;
