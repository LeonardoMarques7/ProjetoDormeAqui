import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUserContext } from "@/components/contexts/UserContext";
import { useAuthModalContext } from "@/components/contexts/AuthModalContext";

import { useMessage } from "@/components/contexts/MessageContext";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const GithubCallback = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { setUser } = useUserContext();
	const { showMessage } = useMessage();
	const { showAuthModal } = useAuthModalContext();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const hasProcessed = useRef(false);

	useEffect(() => {
		// Evita execução duplicada
		if (hasProcessed.current) return;
		hasProcessed.current = true;

		const handleCallback = async () => {
			try {
				const code = searchParams.get("code");
				const state = searchParams.get("state");

				if (!code) {
					setError("Código de autorização não encontrado");
					setLoading(false);
					return;
				}

				console.log("🔄 Processando callback do GitHub...");

				// Enviar código para o backend
				const response = await axios.post(
					`${API_URL}/users/oauth/github`,
					{ code },
					{ withCredentials: true },
				);

				if (response.data) {
					console.log("✅ Login GitHub bem-sucedido:", response.data);

					// Salvar token em localStorage (se fornecido)
					if (response.data.token) {
						localStorage.setItem("token", response.data.token);
					}

					// Salvar usuário no contexto e localStorage
					setUser(response.data);
					localStorage.setItem("user", JSON.stringify(response.data));

					// Redirecionar para home ou dashboard
					navigate("/", { replace: true });

					showMessage("Login com GitHub bem-sucedido!", "success");
				}
			} catch (err) {
				console.error("❌ Erro ao processar callback do GitHub:", err);
				console.error("   Status:", err.response?.status);
				console.error("   Dados:", err.response?.data);
				console.error("   API URL:", API_URL);
				setError(
					err.response?.data?.error ||
						"Erro ao fazer login com GitHub: " + err.message,
				);
				showAuthModal("login");
				showMessage("Erro ao fazer login com GitHub", "error");
			} finally {
				setLoading(false);
			}
		};

		handleCallback();
	}, [searchParams, navigate, setUser, showAuthModal]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
					<p className="text-gray-600">Autenticando com GitHub...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center text-red-600">
					<p>{error}</p>
				</div>
			</div>
		);
	}

	return null;
};

export default GithubCallback;
