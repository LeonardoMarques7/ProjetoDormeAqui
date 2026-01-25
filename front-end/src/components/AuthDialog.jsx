import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Check,
	CircleUserRound,
	Eye,
	EyeOff,
	Lock,
	Mail,
	X,
} from "lucide-react";
import logo__primary from "../assets/logo__primary.png";
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

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import { useUserContext } from "./contexts/UserContext";
import photoDefault from "../assets/user__default.png";

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
					className="fixed inset-0 bg-black backdrop-blur-sm z-50"
					onClick={() => setOpen(false)}
				/>

				<Dialog
					open={open}
					className="min-w-full w-full"
					onOpenChange={setOpen}
					modal={false}
				>
					<DialogContent className="h-full rounded-none xl:h-fit xl:rounded-3xl">
						<div className="flex justify-between items-center xl:mb-5 -mb-10">
							<img src={logo__primary} className="w-90" alt="" />
							<button
								onClick={() => setOpen(false)}
								className="cursor-pointer z-50 w-10 outline-none mt-2 h-10 flex items-center justify-center rounded-full hover:bg-primary-100 transition-colors"
							>
								<X className="w-6 h-6 text-black" />
							</button>
						</div>

						<ProfileForm mode={mode} onSuccess={handleLoginSuccess} />
					</DialogContent>
				</Dialog>
			</>
		);
	}

	// Mobile

	return (
		<>
			<Drawer open={open} onOpenChange={setOpen}>
				<DrawerContent className="!rounded-none !rounded-tl-4xl  p-10">
					<ProfileForm />
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

function ProfileForm({ onSuccess }) {
	const { user, setUser } = useUserContext();
	const [mode, setMode] = useState("login");
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
		desktop ? (
			<section className="flex w-full">
				<div className="flex-1 bg-white flex items-center justify-center">
					<div className="w-full max-w-md text-start">
						<p className="text-3xl font-medium text-gray-900 mb-2">
							Bem-vindo de volta!
						</p>
						<p className="text-gray-600 mb-8">
							Entre para continuar sua jornada
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
						</form>

						<p className="text-center text-gray-600 mt-6">
							Não tem uma conta?{" "}
							<button
								onClick={(e) => {
									e.preventDefault();
									setMode("register");
								}}
								className="text-primary-600 hover:text-primary-700 font-semibold"
							>
								Criar conta
							</button>
						</p>
					</div>
				</div>
			</section>
		) : (
			<section className="flex w-full">
				<div className="flex-1 bg-white flex items-center justify-center">
					<div className="w-full max-w-md text-start">
						<p className="text-3xl font-medium text-gray-900 mb-2">Login</p>
						<p className="text-gray-600 mb-8">
							Entre para continuar sua jornada
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
						</form>

						<p className="text-center text-gray-600 mt-6">
							Não tem uma conta?{" "}
							<button
								onClick={(e) => {
									e.preventDefault();
									setMode("register");
								}}
								className="text-primary-600 hover:text-primary-700 font-semibold"
							>
								Criar conta
							</button>
						</p>
					</div>
				</div>
			</section>
		)
	) : (
		<section className="flex items-center justify-between flex-1  py-4">
			<div className="max-w-125 mx-auto gap-0  rounded-4xl py-2.5  right-0 flex flex-col items-start w-full ">
				<h1 className="text-3xl font-bold y-0">Cadastre-se e descubra</h1>
				<p className="mb-5">Crie uma conta para continuar</p>
				<form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
					<div className="group__input relative flex justify-center items-center">
						<CircleUserRound className="absolute left-4 text-gray-400 size-6" />
						<input
							type="text"
							className="border border-gray-200 px-14 py-4 rounded-2xl w-full outline-primary-400"
							placeholder="Digite seu nome"
							value={name}
							onChange={(e) => {
								setName(e.target.value);
							}}
						/>
					</div>
					<div className="group__input relative flex justify-center items-center">
						<Mail className="absolute left-4 text-gray-400 size-6" />
						<input
							type="email"
							className={`border ${
								emailError ? "border-red-400" : "border-gray-200"
							} px-14 py-4 rounded-2xl w-full outline-primary-400`}
							placeholder="Digite seu email"
							value={email}
							onChange={(e) => {
								setEmail(e.target.value);
								setEmailError("");
								if (message) setMessage("");
							}}
							onBlur={(e) => checkEmailExists(e.target.value)}
						/>
						{isCheckingEmail && (
							<span className="absolute right-4 text-gray-400 text-sm">
								Verificando...
							</span>
						)}
					</div>
					{emailError && (
						<div className="text-red-500 text-sm -mt-1 ml-1">{emailError}</div>
					)}
					<div className="group__input relative flex justify-center items-center">
						<Lock className="absolute left-4 text-gray-400 size-6" />

						<input
							type={showPassword ? "text" : "password"}
							className="border border-gray-200 px-14 py-4 rounded-2xl w-full outline-primary-400"
							placeholder="Digite sua senha"
							value={password}
							onChange={(e) =>
								setPassword(e.target.value) || setShowPasswordPopover(true)
							}
							onBlur={() => setShowPasswordPopover(false)}
						/>

						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="cursor-pointer absolute right-5 text-gray-400 hover:text-gray-600 transition-colors z-10"
						>
							{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
						</button>
					</div>
					<div className="group__input relative flex justify-center items-center">
						<Lock className="absolute left-4 text-gray-400 size-6" />

						<input
							type={showConfirmPassword ? "text" : "password"}
							className="border border-gray-200 px-14 py-4 rounded-2xl w-full outline-primary-400"
							placeholder="Confirme sua senha"
							value={confirmPassword}
							onChange={(e) => {
								setConfirmPassword(e.target.value);
								if (message) setMessage("");
							}}
						/>

						<button
							type="button"
							onClick={() => setShowConfirmPassword(!showConfirmPassword)}
							className="cursor-pointer absolute right-5 text-gray-400 hover:text-gray-600 transition-colors z-10"
						>
							{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
						</button>
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
						<div className="bg-red-50 border border-red-200 text-red-600 text-sm py-3 px-4 rounded-lg mt-2">
							{message}
						</div>
					)}
					<button className="font-bold rounded-2xl text-xl cursor-pointer w-full px-14 py-4 bg-primary-600 text-white mt-4 hover:bg-primary-700 transition-all ease-in-out duration-300">
						Criar Conta
					</button>
				</form>

				<p className="mt-5">
					Já possue uma conta?{" "}
					<button
						onClick={(e) => {
							e.preventDefault();
							setMode("login");
						}}
						className="underline font-semibold"
					>
						Entre Aqui!
					</button>{" "}
				</p>
			</div>
		</section>
	);
}
