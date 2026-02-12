import {
	Check,
	CircleUserRound,
	Eye,
	EyeOff,
	Lock,
	Mail,
	X,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";

import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { useUserContext } from "@/components/contexts/UserContext";
const photoDefault =
	"https://projeto-dorme-aqui.s3.us-east-2.amazonaws.com/1769633448464-848631051.png";

export function AuthDialog({ mode, setMode, open, setOpen }) {
	const [desktop, setDesktop] = useState(window.innerWidth >= 768);

	useEffect(() => {
		const handleResize = () => setDesktop(window.innerWidth >= 768);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	useEffect(() => {
		if (open) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}

		return () => {
			document.body.style.overflow = "unset";
		};
	}, [open]);

	function handleLoginSuccess() {
		setOpen(false);
	}

	if (desktop && open) {
		return (
			<>
				<div
					className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
					onClick={() => setOpen(false)}
				/>

				<Dialog
					open={open}
					className="min-w-full w-full"
					onOpenChange={setOpen}
					modal={false}
				>
					<DialogContent className="h-full flex rounded-none xl:h-fit xl:rounded-3xl">
						<button
							onClick={() => setOpen(false)}
							className="cursor-pointer mt-5 absolute right-5 z-50 w-10 outline-none h-10 flex items-center justify-center rounded-full hover:bg-primary-100 transition-colors"
						>
							<X className="w-6 h-6 text-black" />
						</button>
						<ProfileForm
							mode={mode}
							setMode={setMode}
							onSuccess={handleLoginSuccess}
						/>
					</DialogContent>
				</Dialog>
			</>
		);
	}

	// Mobile

	return (
		<>
			<Drawer open={open} onOpenChange={setOpen}>
				<DrawerContent className="!rounded-none !rounded-tl-4xl p-0">
					<div className="p-10 ">
						<ProfileForm
							onSuccess={handleLoginSuccess}
							mode={mode}
							setMode={setMode}
						/>
					</div>
				</DrawerContent>
			</Drawer>
		</>
	);
}

function PasswordRequirement({ meets, label }) {
	return (
		<div
			className={`flex items-center gap-2 transition-colors duration-300 ${
				meets ? "text-primary-500" : "text-red-500"
			}`}
		>
			<span className="flex items-center gap-2">
				{meets ? <Check size={15} /> : <X size={15} />}
				<span className="ml-2">{label}</span>
			</span>
		</div>
	);
}

function ProfileForm({ onSuccess, mode, setMode }) {
	const { user, setUser } = useUserContext();
	const [desktop, setDesktop] = useState(window.innerWidth >= 768);
	const [email, setEmail] = useState("");
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [message, setMessage] = useState("");
	const [redirect, setRedirect] = useState(false);
	const [showPasswordPopover, setShowPasswordPopover] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [emailError, setEmailError] = useState("");
	const [isCheckingEmail, setIsCheckingEmail] = useState(false);
	const [resetToken, setResetToken] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [loadingOAuth, setLoadingOAuth] = useState(false);

	// ========== GOOGLE LOGIN ==========
	const handleGoogleLogin = async () => {
		setLoadingOAuth(true);
		setMessage("");

		try {
			// Usar a biblioteca Google Sign-In do Google diretamente
			if (!window.google) {
				throw new Error('Google Sign-In library not loaded');
			}

			// Obter o cliente OAuth
			const result = await window.google.accounts.oauth2.initCodeClient({
				client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
				scope: 'openid email profile',
				ux_mode: 'redirect',
				redirect_uri: `${window.location.origin}/auth/google/callback`,
				callback: (response) => {
					console.log("✅ Google OAuth Code received:", response.code);
				},
				error_callback: (error) => {
					console.error("❌ Google OAuth Error:", error);
					setMessage('Erro ao conectar com Google');
					setLoadingOAuth(false);
				}
			});

			result.requestCode();
		} catch (error) {
			console.error("❌ Erro ao fazer login com Google:", error);
			setMessage('Erro ao conectar com Google: ' + error.message);
			setLoadingOAuth(false);
		}
	};

	// ========== GITHUB LOGIN ==========
	const handleGithubLogin = () => {
		setLoadingOAuth(true);
		setMessage("");
		const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
		const redirectUri = `${window.location.origin}/auth/github/callback`;

		if (!clientId) {
			setMessage("GitHub Client ID não configurado");
			setLoadingOAuth(false);
			return;
		}

		// Redirecionar para GitHub OAuth
		window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
	};

	// Função para verificar se o email já existe
	const checkEmailExists = async (emailToCheck) => {
		if (!emailToCheck || mode === "login") return;

		// Validação básica de formato de email
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(emailToCheck)) {
			setEmailError("Email inválido");
			return;
		}

		setIsCheckingEmail(true);
		setEmailError("");

		try {
			// Busca todos os usuários
			const { data: users } = await axios.get("/users");

			// Extrai todos os emails em um array
			const emailsList = users.map((user) => user.email.toLowerCase());

			// Verifica se o email digitado existe no array
			const emailExists = emailsList.includes(emailToCheck.toLowerCase());

			if (emailExists) {
				setEmailError("Este email já está cadastrado");
			}
		} catch (error) {
			console.log("Erro ao verificar email:", error);
		} finally {
			setIsCheckingEmail(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (mode === "login") {
			if (email && password) {
				try {
					const { data: userDoc } = await axios.post("/users/login", {
						email,
						password,
					});

					const success = true;

					if (success) {
						onSuccess();
					}
					setUser(userDoc);
				} catch (error) {
					setMessage(`Ops, erro ao logar.. ${error.response.data}`);
				}
			} else {
				setMessage("Erro ao fazer login. Verifique seus dados.");
			}
		} else if (mode === "forgotPassword") {
			if (email) {
				setIsLoading(true);
				try {
					await axios.post("/users/forgot-password", { email });
					setMessage(
						"Email de recuperação enviado! Verifique sua caixa de entrada.",
					);
				} catch (error) {
					setMessage(
						"Erro ao enviar email de recuperação. Verifique se o email está correto.",
					);
				} finally {
					setIsLoading(false);
				}
			} else {
				setMessage("Digite seu email para recuperar a senha.");
			}
		} else {
			if (email && password && name) {
				if (emailError) {
					setMessage("Corrija os erros antes de continuar");
					return;
				}

				if (password !== confirmPassword) {
					setMessage("As senhas não coincidem!");
					return;
				}

				if (password.length < 6) {
					setMessage("A senha deve ter pelo menos 6 caracteres");
					return;
				}

				const photo = photoDefault;

				try {
					const { data: userDoc } = await axios.post("/users", {
						name,
						email,
						password,
						photo,
					});

					setUser(userDoc);
					setRedirect(true);
				} catch (error) {
					if (
						error.response?.data?.includes("email") ||
						error.response?.data?.includes("já existe")
					) {
						setEmailError("Este email já está cadastrado");
						setMessage("Este email já está em uso");
					} else {
						setMessage(
							`Erro ao cadastrar: ${error.response?.data || error.message}`,
						);
					}
				}
			} else {
				setMessage("Você precisa preencher o e-mail, o nome e a senha!");
			}
		}
	};

	if (redirect) return <Navigate to="/account/profile" />;

	return mode === "forgotPassword" ? (
		<section className="flex w-full">
			<div className="flex-1 bg-white flex items-center justify-center">
				<div className="w-full max-w-md text-start">
					<p className="text-3xl font-medium text-gray-900 mb-2">
						Recuperar senha
					</p>
					<p className="text-gray-600 mb-8">
						Digite seu email para receber instruções de recuperação de senha
					</p>

					<form className="space-y-5 text-start" onSubmit={handleSubmit}>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Email
							</label>
							<div className="relative">
								<Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
								<input
									type="email"
									className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
									placeholder="seu@email.com"
									value={email}
									onChange={(e) => {
										setEmail(e.target.value);
										if (message) setMessage("");
									}}
								/>
							</div>
						</div>

						{message && (
							<div
								className={`text-sm py-3 px-4 rounded-lg ${
									message.includes("enviado")
										? "bg-green-50 border border-green-200 text-green-600"
										: "bg-red-50 border border-red-200 text-red-600"
								}`}
							>
								{message}
							</div>
						)}

						<button
							type="submit"
							disabled={isLoading}
							className="w-full cursor-pointer py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-primary-200 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? "Enviando..." : "Enviar email de recuperação"}
						</button>
					</form>

					<p className="text-center text-gray-600 mt-6">
						Lembrou da senha?{" "}
						<button
							onClick={(e) => {
								e.preventDefault();
								setMode("login");
							}}
							className="text-primary-600 hover:text-primary-700 font-semibold"
						>
							Voltar ao login
						</button>
					</p>
				</div>
			</div>
		</section>
	) : mode === "login" ? (
		<section className="flex w-full">
			<div className="flex-1 bg-white flex items-center justify-center">
				<div className="w-full max-w-md text-start">
					<p className="text-3xl font-medium text-gray-900 mb-2">Login</p>
					<p className="text-gray-600 mb-8">Entre para continuar sua jornada</p>

					<form className="space-y-5 text-start" onSubmit={handleSubmit}>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Email
							</label>
							<div className="relative">
								<Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
								<input
									type="email"
									className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
									placeholder="seu@email.com"
									value={email}
									onChange={(e) => {
										setEmail(e.target.value);
										if (message) setMessage("");
									}}
								/>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Senha
							</label>
							<div className="relative">
								<Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
								<input
									type={showPassword ? "text" : "password"}
									className="w-full pl-12 pr-12 py-3.5 border border-gray-300 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
									placeholder="••••••••"
									value={password}
									onChange={(e) => {
										setPassword(e.target.value);
										if (message) setMessage("");
									}}
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

						<div className="text-right">
							<button
								type="button"
								className="text-sm text-primary-600 hover:text-primary-700 font-medium"
								onClick={() => setMode("forgotPassword")}
							>
								Esqueceu a senha?
							</button>
						</div>

						{message && (
							<div className="bg-red-50 border border-red-200 text-red-600 text-sm py-3 px-4 rounded-lg">
								{message}
							</div>
						)}

						<button
							type="submit"
							className="w-full cursor-pointer py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-primary-200"
						>
							Entrar
						</button>

						{/* OAuth BUTTONS */}
						<div className="w-full mt-6">
							<div className="relative flex items-center justify-center mb-4">
								<div className="absolute inset-x-0 h-px bg-gray-300"></div>
								<div className="relative px-2 text-sm text-gray-500 bg-white">
									OU
								</div>
							</div>

							<div className="flex gap-3 w-full">
								{/* Google */}
								<button
									type="button"
									onClick={() => handleGoogleLogin()}
									disabled={loadingOAuth}
									className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
								>
									<svg
										className="w-5 h-5"
										viewBox="0 0 24 24"
										fill="currentColor"
									>
										<path
											d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
											fill="#4285F4"
										/>
										<path
											d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
											fill="#34A853"
										/>
										<path
											d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
											fill="#FBBC05"
										/>
										<path
											d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
											fill="#EA4335"
										/>
									</svg>
									Google
								</button>

								{/* GitHub */}
								<button
									type="button"
									onClick={handleGithubLogin}
									disabled={loadingOAuth}
									className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
								>
									<svg
										className="w-5 h-5"
										viewBox="0 0 24 24"
										fill="currentColor"
									>
										<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
									</svg>
									GitHub
								</button>
							</div>

							{loadingOAuth && (
								<div className="text-center text-sm text-gray-500 mt-3">
									⏳ Conectando...
								</div>
							)}
						</div>
					</form>

					<p className="text-center text-gray-600 mt-6">
						Não tem uma conta?{" "}
						<button
							onClick={(e) => {
								e.preventDefault();
								setMode("register");
							}}
							className="text-primary-900 underline hover:text-primary-800 font-semibold"
						>
							Criar conta
						</button>
					</p>
				</div>
			</div>
		</section>
	) : (
		<section className="flex items-center justify-between flex-1 ">
			<div className="max-w-125 maxs-m:max-w-full mx-auto gap-0  rounded-4xl py-2.5  right-0 flex flex-col items-start w-full ">
				{desktop ? (
					<h1 className="text-3xl font-bold y-0">Cadastre-se e descubra </h1>
				) : (
					<h1 className="text-3xl font-bold y-0">Cadastro</h1>
				)}

				<p className="mb-5">Crie uma conta para continuar</p>
				<form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Nome
						</label>
						<div className="relative">
							<CircleUserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 size-6" />
							<input
								type="text"
								className="border border-gray-200 px-14 py-4 rounded-2xl w-full outline-primary-400"
								placeholder="Leonardo Emanuel"
								value={name}
								onChange={(e) => {
									setName(e.target.value);
								}}
							/>
						</div>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Email
						</label>
						<div className="relative">
							<Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 size-6" />
							<input
								type="email"
								className={`border ${
									emailError ? "border-red-400" : "border-gray-200"
								} px-14 py-4 rounded-2xl w-full outline-primary-400`}
								placeholder="seu@email.com"
								value={email}
								onChange={(e) => {
									setEmail(e.target.value);
									setEmailError("");
									if (message) setMessage("");
								}}
								onBlur={(e) => checkEmailExists(e.target.value)}
							/>
							{isCheckingEmail && (
								<span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
									Verificando...
								</span>
							)}
						</div>
					</div>
					{emailError && (
						<div className="text-red-500 text-sm -mt-1 ml-1">{emailError}</div>
					)}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Senha
						</label>
						<div className="relative">
							<Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 size-6" />

							<input
								type={showPassword ? "text" : "password"}
								className="border border-gray-200 px-14 py-4 rounded-2xl w-full outline-primary-400"
								placeholder="••••••••"
								value={password}
								onChange={(e) =>
									setPassword(e.target.value) || setShowPasswordPopover(true)
								}
								onBlur={() => setShowPasswordPopover(false)}
							/>

							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="cursor-pointer absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
							>
								{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
							</button>
						</div>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Confirmar Senha
						</label>
						<div className="relative">
							<Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 size-6" />

							<input
								type={showConfirmPassword ? "text" : "password"}
								className="border border-gray-200 px-14 py-4 rounded-2xl w-full outline-primary-400"
								placeholder="••••••••"
								value={confirmPassword}
								onChange={(e) => {
									setConfirmPassword(e.target.value);
									if (message) setMessage("");
								}}
							/>

							<button
								type="button"
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								className="cursor-pointer absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
							>
								{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
							</button>
						</div>
					</div>
					{showPasswordPopover && (
						<div className="text-sm text-center mt-2 flex justify-start flex-col items-start mx-auto">
							<PasswordRequirement
								label="Pelo menos 6 caracteres"
								meets={password.length > 5}
							/>
						</div>
					)}
					{message && (
						<div className="bg-red-50 border border-red-200 text-red-600 text-sm py-3 px-4 rorunded-lg mt-2">
							{message}
						</div>
					)}
					<button className="font-bold rounded-2xl text-xl cursor-pointer w-full px-14 py-4 bg-primary-600 text-white mt-4 hover:bg-primary-700 transition-all ease-in-out duration-300">
						Criar Conta
					</button>
					<p className="text-center text-gray-600 mt-6">
						Já tem uma conta?{" "}
						<button
							onClick={(e) => {
								e.preventDefault();
								setMode("login");
							}}
							className="text-primary-900 underline hover:text-primary-800 font-semibold"
						>
							Entrar
						</button>
					</p>
				</form>
			</div>
		</section>
	);
}
