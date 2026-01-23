import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Check, X } from "lucide-react";
import logo__primary from "../assets/logo__primary.png";

function PasswordRequirement({ meets, label }) {
	return (
		<div
			className={`flex items-center gap-2 transition-colors duration-300 ${
				meets ? "text-green-600" : "text-red-500"
			}`}
		>
			<span className="flex items-center gap-2">
				{meets ? <Check size={15} /> : <X size={15} />}
				<span className="ml-2">{label}</span>
			</span>
		</div>
	);
}

export default function ResetPassword() {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");

	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [message, setMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	useEffect(() => {
		if (!token) {
			setMessage("Token de redefinição inválido ou ausente.");
		}
	}, [token]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!token) {
			setMessage("Token de redefinição inválido.");
			return;
		}

		if (newPassword !== confirmPassword) {
			setMessage("As senhas não coincidem!");
			return;
		}

		if (newPassword.length < 6) {
			setMessage("A senha deve ter pelo menos 6 caracteres!");
			return;
		}

		setIsLoading(true);
		setMessage("");

		try {
			await axios.post("/users/reset-password", {
				token,
				newPassword,
			});

			setIsSuccess(true);
			setMessage(
				"Senha redefinida com sucesso! Você será redirecionado para o login.",
			);

			// Redirecionar após 3 segundos
			setTimeout(() => {
				window.location.href = "/";
			}, 3000);
		} catch (error) {
			setMessage(
				error.response?.data?.error ||
					"Erro ao redefinir senha. Tente novamente.",
			);
		} finally {
			setIsLoading(false);
		}
	};

	if (!token) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="max-w-md w-full space-y-8 p-8">
					<div className="text-center">
						<img
							src={logo__primary}
							className="mx-auto h-12 w-auto"
							alt="Logo"
						/>
						<h2 className="mt-6 text-3xl font-extrabold text-gray-900">
							Link Inválido
						</h2>
						<p className="mt-2 text-sm text-gray-600">
							O link de redefinição de senha é inválido ou expirou.
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (isSuccess) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="max-w-md w-full space-y-8 p-8">
					<div className="text-center">
						<img
							src={logo__primary}
							className="mx-auto h-12 w-auto"
							alt="Logo"
						/>
						<h2 className="mt-6 text-3xl font-extrabold text-green-600">
							Senha Redefinida!
						</h2>
						<p className="mt-2 text-sm text-gray-600">
							Sua senha foi alterada com sucesso. Você será redirecionado para
							fazer login.
						</p>
						<div className="mt-4">
							<div className="bg-green-50 border border-green-200 text-green-600 text-sm py-3 px-4 rounded-lg">
								{message}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<img src={logo__primary} className="mx-auto h-12 w-auto" alt="Logo" />
					<h2 className="mt-6 text-3xl font-extrabold text-gray-900">
						Redefinir Senha
					</h2>
					<p className="mt-2 text-sm text-gray-600">
						Digite sua nova senha abaixo
					</p>
				</div>

				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div className="space-y-4">
						<div>
							<Label
								htmlFor="newPassword"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Nova Senha
							</Label>
							<div className="relative">
								<Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
								<Input
									id="newPassword"
									type={showPassword ? "text" : "password"}
									className="pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
									placeholder="••••••••"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									required
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
								>
									{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
								</button>
							</div>
						</div>

						<div>
							<Label
								htmlFor="confirmPassword"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Confirmar Nova Senha
							</Label>
							<div className="relative">
								<Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
								<Input
									id="confirmPassword"
									type={showConfirmPassword ? "text" : "password"}
									className="pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
									placeholder="••••••••"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									required
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
								>
									{showConfirmPassword ? (
										<EyeOff size={20} />
									) : (
										<Eye size={20} />
									)}
								</button>
							</div>
						</div>

						{newPassword && (
							<div className="text-sm space-y-1">
								<PasswordRequirement
									label="Pelo menos 6 caracteres"
									meets={newPassword.length >= 6}
								/>
								<PasswordRequirement
									label="Senhas coincidem"
									meets={
										newPassword === confirmPassword && newPassword.length > 0
									}
								/>
							</div>
						)}
					</div>

					{message && (
						<div
							className={`text-sm py-3 px-4 rounded-lg ${
								message.includes("sucesso")
									? "bg-green-50 border border-green-200 text-green-600"
									: "bg-red-50 border border-red-200 text-red-600"
							}`}
						>
							{message}
						</div>
					)}

					<Button
						type="submit"
						disabled={isLoading || !newPassword || !confirmPassword}
						className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-primary-200 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isLoading ? "Redefinindo..." : "Redefinir Senha"}
					</Button>
				</form>
			</div>
		</div>
	);
}
