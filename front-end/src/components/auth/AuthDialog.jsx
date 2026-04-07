import { Info } from "lucide-react";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";

import { registerSchema } from "../schemas/authSchema";

const photoDefault =
	"https://projeto-dorme-aqui.s3.us-east-2.amazonaws.com/1769633448464-848631051.png";

// Função para calcular força da senha
function getPasswordStrength(pw) {
	let score = 0;
	if (pw.length >= 6) score++;
	if (/[A-Z]/.test(pw)) score++;
	if (/[a-z]/.test(pw)) score++;
	if (/\d/.test(pw)) score++;
	if (/[@$!%*?&]/.test(pw)) score++;
	return score;
}

function getStrengthLabel(score) {
	if (score <= 2) return { label: "Fraca", color: "bg-red-400 text-red-700" };
	if (score === 3 || score === 4)
		return { label: "Média", color: "bg-yellow-300 text-yellow-800" };
	if (score === 5)
		return { label: "Forte", color: "bg-green-400 text-green-800" };
	return { label: "", color: "" };
}
import { motion, AnimatePresence } from "framer-motion";
import { Check, Eye, EyeOff, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useUserContext } from "@/components/contexts/UserContext";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const INPUT_CLS =
	"w-full px-4 py-3.5 border border-gray-200 rounded-xl outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-gray-800 placeholder:text-gray-400";

function GoogleIcon() {
	return (
		<svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
	);
}

function OrDivider() {
	return (
		<div className="relative flex items-center justify-center">
			<div className="absolute inset-x-0 h-px bg-gray-200" />
			<span className="relative bg-white px-3 text-sm text-gray-400">ou</span>
		</div>
	);
}

function PasswordRequirement({ meets, label }) {
	return (
		<div
			className={`flex items-center gap-2 transition-colors duration-300 ${meets ? "text-primary-500" : "text-red-500"}`}
		>
			<span className="flex items-center gap-2">
				{meets ? <Check size={15} /> : <X size={15} />}
				<span className="ml-2">{label}</span>
			</span>
		</div>
	);
}

function LeftPanel() {
	const autoplay = useRef(Autoplay({ delay: 4000, stopOnInteraction: false }));
	const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
		autoplay.current,
	]);
	const [photos, setPhotos] = useState([]);

	useEffect(() => {
		axios
			.get("/places")
			.then(({ data }) => {
				const all = data
					.flatMap((p) => p.photos || [])
					.filter(Boolean)
					.slice(0, 12);
				if (all.length > 0) setPhotos(all);
			})
			.catch(() => {});
	}, []);

	const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
	const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

	const slides =
		photos.length > 0
			? photos
			: [
					"https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80",
				];

	return (
		<div className="hidden md:block md:w-1/2 rounded-l-2xl border-white border-8 relative flex-shrink-0">
			<div
				className="absolute inset-0 overflow-hidden rounded-l-2xl"
				style={{ clipPath: "polygon(0 0, 100% 0, 84% 100%, 0 100%)" }}
			>
				<div className="overflow-hidden h-full rounded-l-2xl" ref={emblaRef}>
					<div className="flex h-full touch-pan-y">
						{slides.map((src, i) => (
							<div key={i} className="flex-none w-full h-full relative">
								<img
									src={src}
									alt=""
									className="absolute inset-0 rounded-l-2xl w-full h-full object-cover select-none"
									draggable="false"
								/>
							</div>
						))}
					</div>
				</div>
				<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
				<div className="absolute bottom-7 left-7 right-22 z-10 flex items-end justify-between">
					<div>
						<p className="text-white text-lg font-bold leading-tight">
							DormeAqui
						</p>
						<p className="text-white/60 text-xs mt-0.5">
							Encontre o lugar perfeito
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

// ─── ProfileForm ────────────────────────────────────────────────────────────

function ProfileForm({ onSuccess, mode, setMode }) {
	// Tooltip real
	function PasswordHelpTooltip() {
		return (
			<Tooltip>
				<TooltipTrigger asChild>
					<span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-gray-500 align-middle">
						<Info size={14} />
					</span>
				</TooltipTrigger>
				<TooltipContent
					className="bg-white border border-gray-200 shadow-lg rounded px-3 py-2 text-xs text-gray-700 w-56"
					align="center"
				>
					<p>Para uma senha segura, utilize:</p>
					<ul className="list-disc pl-4 mt-1 space-y-0.5">
						<li>Mais de 6 caracteres</li>
						<li>Uma letra maiúscula</li>
						<li>Uma letra minúscula</li>
						<li>Um número</li>
						<li>Um caractere especial (ex: @$!%*?&)</li>
					</ul>
				</TooltipContent>
			</Tooltip>
		);
	}
	const { user, setUser } = useUserContext();
	const [email, setEmail] = useState("");
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [redirect, setRedirect] = useState(false);
	const [message, setMessage] = useState("");
	const [showPasswordPopover, setShowPasswordPopover] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [emailError, setEmailError] = useState("");
	const [isCheckingEmail, setIsCheckingEmail] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [loadingOAuth, setLoadingOAuth] = useState(false);
	const [acceptedTerms, setAcceptedTerms] = useState(false);
	const [errors, setErrors] = useState({});
	const [registerStep, setRegisterStep] = useState(0);

	const steps = ["Dados pessoais", "Senha", "Termos", "Revisão"];

	// ── helpers ──────────────────────────────────────────────────────────────

	function validateField(field, value) {
		let error;
		switch (field) {
			case "name":
				error = !value.trim()
					? "Nome é obrigatório"
					: value.trim().length < 3
						? "Nome muito curto"
						: undefined;
				break;
			case "email":
				error = !value.trim()
					? "Email é obrigatório"
					: !/^\S+@\S+\.\S+$/.test(value)
						? "Email inválido"
						: undefined;
				break;
			case "password":
				error = !value
					? "Senha é obrigatória"
					: value.length < 6
						? "Senha muito curta"
						: undefined;
				break;
			case "confirmPassword":
				error = !value
					? "Confirme a senha"
					: value !== password
						? "As senhas não coincidem"
						: undefined;
				break;
			default:
				error = undefined;
		}
		setErrors((prev) => ({ ...prev, [field]: error }));
	}

	async function checkEmailExists(value) {
		if (!value) return;
		setIsCheckingEmail(true);
		try {
			const { data } = await axios.get(`/auth/check-email?email=${value}`);
			if (data.exists) setEmailError("Este email já está em uso.");
		} catch {
			// silencioso
		} finally {
			setIsCheckingEmail(false);
		}
	}

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
					console.error("Login error:", error);
					setMessage(`Email ou senha incorretos. Tente novamente.`);
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
			try {
				// CRITICAL SECURITY: Revalidate everything with Zod
				const validatedData = registerSchema.parse({
					name: name.trim(),
					email: email.trim(),
					password: password.trim(),
					confirmPassword: confirmPassword.trim(),
					acceptedTerms,
				});

				if (emailError) {
					throw new Error("Email já cadastrado");
				}

				const photo = photoDefault;
				setIsLoading(true);
				const { data: userDoc } = await axios.post("/users", {
					name: validatedData.name,
					email: validatedData.email,
					password: validatedData.password,
					photo,
				});

				setUser(userDoc);
				setRedirect(true);
			} catch (error) {
				if (error.name === "ZodError") {
					setMessage("Corrija os erros nos campos");
				} else if (
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
		}
	};

	// ── Google OAuth ──────────────────────────────────────────────────────────

	async function handleGoogleLogin() {
		if (mode === "register" && !acceptedTerms) {
			setMessage(
				"Você deve aceitar os Termos de Serviço e Política de Privacidade",
			);
			return;
		}

		setLoadingOAuth(true);
		setMessage("");

		try {
			if (!window.google) throw new Error("Google Sign-In library not loaded");

			if (mode === "register") {
				localStorage.setItem("acceptedTermsForOAuth", "true");
			}

			const result = await window.google.accounts.oauth2.initCodeClient({
				client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
				scope: "openid email profile",
				ux_mode: "redirect",
				redirect_uri: `${window.location.origin}/auth/google/callback`,
				callback: (response) => {
					console.log("✅ Google OAuth Code received:", response.code);
				},
				error_callback: (error) => {
					console.error("❌ Google OAuth Error:", error);
					localStorage.removeItem("acceptedTermsForOAuth");
					setMessage("Erro ao conectar com Google");
					setLoadingOAuth(false);
				},
			});

			result.requestCode();
		} catch (error) {
			console.error("❌ Erro ao fazer login com Google:", error);
			localStorage.removeItem("acceptedTermsForOAuth");
			setMessage("Erro ao conectar com Google: " + error.message);
			setLoadingOAuth(false);
		}
	}

	// ── Register step helpers ─────────────────────────────────────────────────

	function isStepValid() {
		if (registerStep === 0)
			return (
				name.trim() &&
				email.trim() &&
				!errors.name &&
				!errors.email &&
				!emailError
			);
		if (registerStep === 1)
			return (
				password.trim() &&
				confirmPassword.trim() &&
				!errors.password &&
				!errors.confirmPassword
			);
		if (registerStep === 2) return acceptedTerms;
		if (registerStep === 3) return true;
		return false;
	}

	function handleNext(e) {
		e.preventDefault();
		if (registerStep < steps.length - 1 && isStepValid()) {
			setRegisterStep((s) => s + 1);
		}
	}

	function handleBack(e) {
		e.preventDefault();
		if (registerStep > 0) setRegisterStep((s) => s - 1);
	}

	async function handleRegisterSubmit(e) {
		e.preventDefault();
		if (!isStepValid()) return;
		await handleSubmit(e);
	}

	// ── Sub-components (defined inside ProfileForm to access state) ───────────

	function Stepper() {
		return (
			<div className="flex flex-col items-start gap-0 mb-8">
				{steps.map((label, idx) => (
					<div
						key={label}
						className="flex items-center gap-3 relative min-h-[44px]"
					>
						<div
							className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-200 
							${
								registerStep === idx
									? "bg-primary-600 text-white border-primary-600"
									: idx < registerStep
										? "bg-primary-100 text-primary-600 border-primary-400"
										: "bg-white text-gray-400 border-gray-200"
							}`}
						>
							{idx + 1}
						</div>
						<span
							className={`text-base font-medium transition-colors duration-200 ${registerStep === idx ? "text-primary-700" : "text-gray-400"}`}
						>
							{label}
						</span>
						{idx < steps.length - 1 && (
							<span className="absolute left-1/2 top-8 -translate-x-1/2 w-1 h-6 bg-gray-200 z-0" />
						)}
					</div>
				))}
			</div>
		);
	}

	function renderRegisterStep() {
		switch (registerStep) {
			case 0:
				return (
					<>
						<h1 className="text-3xl font-bold text-gray-900 mb-1">
							Dados pessoais
						</h1>
						<p className="text-gray-400 mb-8 text-sm">
							Preencha seu nome e email
						</p>
						<div className="space-y-4">
							<input
								type="text"
								placeholder="Nome completo"
								className={`${INPUT_CLS} ${errors.name ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
								value={name}
								onChange={(e) => {
									setName(e.target.value);
									validateField("name", e.target.value);
									if (message) setMessage("");
								}}
								onBlur={(e) => validateField("name", e.target.value)}
							/>
							{errors.name && (
								<p className="text-xs text-red-500 mt-1 ml-1">{errors.name}</p>
							)}
							<input
								type="email"
								placeholder="Email"
								className={`${INPUT_CLS} ${errors.email || emailError ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
								value={email}
								onChange={(e) => {
									setEmail(e.target.value);
									validateField("email", e.target.value);
									setEmailError("");
									if (message) setMessage("");
								}}
								onBlur={(e) => {
									validateField("email", e.target.value);
									checkEmailExists(e.target.value);
								}}
							/>
							{isCheckingEmail && (
								<p className="text-xs text-gray-400 mt-1 ml-1">
									Verificando...
								</p>
							)}
							{emailError && (
								<p className="text-xs text-red-500 mt-1 ml-1">{emailError}</p>
							)}
						</div>
					</>
				);

			case 1: {
				const strengthScore = getPasswordStrength(password);
				const { label: strengthLabel, color: strengthColor } =
					getStrengthLabel(strengthScore);
				return (
					<>
						<h1 className="text-3xl font-bold text-gray-900 mb-1">Senha</h1>
						<p className="text-gray-400 mb-8 text-sm">Crie uma senha segura</p>
						<div className="space-y-4">
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									placeholder="Senha"
									className={`${INPUT_CLS} pr-12 ${errors.password ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
									value={password}
									onChange={(e) => {
										setPassword(e.target.value);
										validateField("password", e.target.value);
										validateField("confirmPassword", confirmPassword); // Atualiza confirmação
										setShowPasswordPopover(true);
									}}
									onBlur={() => {
										validateField("password", password);
										validateField("confirmPassword", confirmPassword);
										setShowPasswordPopover(false);
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

							{/* Barra de progresso de força */}
							<div className="flex items-center gap-3 mt-2">
								<div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
									<div
										className={`h-2 rounded-full transition-all duration-300 ${
											strengthScore <= 2
												? "bg-red-400"
												: strengthScore === 3 || strengthScore === 4
													? "bg-yellow-300"
													: "bg-green-400"
										}`}
										style={{ width: `${(strengthScore / 5) * 100}%` }}
									/>
								</div>
								{password && (
									<>
										<span
											className={`px-2 py-0.5 rounded text-xs font-semibold ${strengthColor}`}
										>
											{strengthLabel}
										</span>
										<PasswordHelpTooltip />
									</>
								)}
							</div>

							{/* {showPasswordPopover && (
								<div className="space-y-3">
									<div className="grid grid-cols-2 gap-1.5">
										<PasswordRequirement
											label="6+ caracteres"
											meets={password.length >= 6}
										/>
										<PasswordRequirement
											label="Letra maiúscula"
											meets={/[A-Z]/.test(password)}
										/>
										<PasswordRequirement
											label="Letra minúscula"
											meets={/[a-z]/.test(password)}
										/>
										<PasswordRequirement
											label="Número"
											meets={/\d/.test(password)}
										/>
										<PasswordRequirement
											className="col-span-2"
											label="Caractere especial"
											meets={/[@$!%*?&]/.test(password)}
										/>
									</div>
								</div>
							)} */}

							<div className="relative">
								<input
									type={showConfirmPassword ? "text" : "password"}
									placeholder="Confirmar senha"
									className={`${INPUT_CLS} pr-12 ${errors.confirmPassword ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
									value={confirmPassword}
									onChange={(e) => {
										setConfirmPassword(e.target.value);
										validateField("confirmPassword", e.target.value);
										if (message) setMessage("");
									}}
									onBlur={(e) =>
										validateField("confirmPassword", e.target.value)
									}
								/>
								{errors.confirmPassword && (
									<p className="text-xs text-red-500 mt-1 ml-1">
										{errors.confirmPassword}
									</p>
								)}
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
					</>
				);
			}

			case 2:
				return (
					<>
						<h1 className="text-3xl font-bold text-gray-900 mb-1">Termos</h1>
						<p className="text-gray-400 mb-8 text-sm">
							Aceite os termos para continuar
						</p>
						<div className="flex items-start gap-3">
							<input
								type="checkbox"
								id="acceptTerms"
								checked={acceptedTerms}
								onChange={(e) => setAcceptedTerms(e.target.checked)}
								className="w-5 h-5 rounded border-gray-200 text-primary-600 focus:ring-2 focus:ring-primary-100 cursor-pointer mt-0.5 flex-shrink-0"
							/>
							<label
								htmlFor="acceptTerms"
								className="text-sm text-gray-600 cursor-pointer"
							>
								Eu aceito os{" "}
								<Link
									to="/terms"
									target="_blank"
									className="text-primary-600 hover:underline font-medium"
								>
									Termos de Serviço
								</Link>{" "}
								e a{" "}
								<Link
									to="/privacy"
									target="_blank"
									className="text-primary-600 hover:underline font-medium"
								>
									Política de Privacidade
								</Link>
							</label>
						</div>
					</>
				);

			case 3:
				return (
					<>
						<h1 className="text-3xl font-bold text-gray-900 mb-1">Revisão</h1>
						<p className="text-gray-400 mb-8 text-sm">
							Confira seus dados antes de criar a conta
						</p>
						<div className="space-y-2 text-gray-700">
							<div>
								<b>Nome:</b> {name}
							</div>
							<div>
								<b>Email:</b> {email}
							</div>
						</div>
						<p className="text-xs text-gray-400 mt-2">
							Ao clicar em Criar Conta, você confirma que seus dados estão
							corretos.
						</p>
					</>
				);

			default:
				return null;
		}
	}

	// ── Render ────────────────────────────────────────────────────────────────

	return (
		<AnimatePresence mode="wait">
			{/* ── LOGIN ── */}
			{mode === "login" && (
				<motion.div
					key="login"
					className="w-full"
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: -20 }}
					transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
				>
					<motion.h1
						className="text-4xl font-bold text-gray-900 mb-1"
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}
					>
						Olá, Viajante!
					</motion.h1>
					<p className="text-gray-400 mb-8 text-sm">Bem-vindo ao DormeAqui</p>

					<form className="space-y-4" onSubmit={handleSubmit}>
						<motion.div
							initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0 * 0.07, duration: 0.4 }}
						>
							<input
								type="email"
								placeholder="Email"
								className={INPUT_CLS}
								value={email}
								onChange={(e) => {
									setEmail(e.target.value);
									if (message) setMessage("");
								}}
							/>
						</motion.div>

						<motion.div
							className="relative"
							initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 1 * 0.07, duration: 0.4 }}
						>
							<input
								type={showPassword ? "text" : "password"}
								placeholder="Senha"
								className={INPUT_CLS + " pr-12"}
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
						</motion.div>

						<div className="text-right -mt-1">
							<button
								type="button"
								onClick={() => setMode("forgotPassword")}
								className="text-sm text-primary-600 hover:text-primary-700 font-medium"
							>
								Esqueceu a senha?
							</button>
						</div>

						{message && (
							<div className="bg-red-50 border border-red-200 text-red-600 text-sm py-3 px-4 rounded-lg">
								{message}
							</div>
						)}

						<OrDivider />

						<button
							type="button"
							onClick={handleGoogleLogin}
							disabled={loadingOAuth}
							className="w-full flex items-center justify-center gap-3 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700 disabled:opacity-50 cursor-pointer"
						>
							<GoogleIcon />
							Continuar com Google
						</button>

						<motion.button
							type="submit"
							className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-full transition-all duration-300 shadow-lg shadow-primary-200 cursor-pointer"
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							Entrar
						</motion.button>
					</form>

					<p className="text-center text-gray-400 text-sm mt-2">
						Não tem uma conta?{" "}
						<button
							onClick={() => setMode("register")}
							className="text-primary-600 font-semibold hover:underline"
						>
							Criar conta
						</button>
					</p>
				</motion.div>
			)}

			{/* ===== FORGOT PASSWORD ===== */}
			{mode === "forgotPassword" && (
				<motion.div
					key="forgotPassword"
					className="w-full"
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: -20 }}
					transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
				>
					<motion.h1
						className="text-4xl font-bold text-gray-900 mb-1"
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}
					>
						Recuperar senha
					</motion.h1>
					<p className="text-gray-400 mb-8 text-sm">
						Digite seu email para receber as instruções
					</p>

					<form className="space-y-4" onSubmit={handleSubmit}>
						<motion.div
							initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0, duration: 0.4 }}
						>
							<input
								type="email"
								placeholder="Email"
								className={INPUT_CLS}
								value={email}
								onChange={(e) => {
									setEmail(e.target.value);
									if (message) setMessage("");
								}}
							/>
						</motion.div>

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

						<motion.button
							type="submit"
							disabled={isLoading}
							className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-full transition-all duration-300 shadow-lg shadow-primary-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							{isLoading ? "Enviando..." : "Enviar instruções"}
						</motion.button>
					</form>

					<p className="text-center text-gray-400 text-sm mt-2">
						Lembrou da senha?{" "}
						<button
							onClick={() => setMode("login")}
							className="text-primary-600 font-semibold hover:underline"
						>
							Voltar ao login
						</button>
					</p>
				</motion.div>
			)}

			{/* ── REGISTER (step-by-step) ── */}
			{mode === "register" && (
				<motion.div
					key="register"
					className="w-full"
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: -20 }}
					transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
				>
					<form
						className="space-y-4"
						onSubmit={
							registerStep === steps.length - 1
								? handleRegisterSubmit
								: handleNext
						}
					>
						{renderRegisterStep()}

						{message && (
							<div className="bg-red-50 border border-red-200 text-red-600 text-sm py-3 px-4 rounded-lg">
								{message}
							</div>
						)}

						<div className="flex gap-2 mt-4s">
							{registerStep > 0 && (
								<button
									type="button"
									onClick={handleBack}
									className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-full transition-all duration-300 shadow cursor-pointer"
								>
									Voltar
								</button>
							)}
							{registerStep < steps.length - 1 ? (
								<button
									type="submit"
									disabled={!isStepValid()}
									className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-full transition-all duration-300 shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Próximo
								</button>
							) : (
								<button
									type="submit"
									disabled={
										!isStepValid() || loadingOAuth || isLoading || !!emailError
									}
									className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-full transition-all duration-300 shadow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isLoading ? "Criando..." : "Criar Conta"}
								</button>
							)}
						</div>

						{/* <div className="mt-2">
							<OrDivider />
							<button
								type="button"
								onClick={handleGoogleLogin}
								disabled={loadingOAuth}
								className="w-full flex items-center justify-center gap-3 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700 disabled:opacity-50 cursor-pointer mt-2"
							>
								<GoogleIcon />
								{loadingOAuth ? "Redirecionando..." : "Continuar com Google"}
							</button>
						</div> */}
					</form>

					<p className="text-center text-gray-400 text-sm mt-8">
						Já tem uma conta?{" "}
						<button
							onClick={() => setMode("login")}
							className="text-primary-600 font-semibold hover:underline"
						>
							Entrar
						</button>
					</p>
				</motion.div>
			)}
		</AnimatePresence>
	);
}

// ─── AuthDialog ──────────────────────────────────────────────────────────────

export function AuthDialog({ mode, setMode, open, setOpen }) {
	const [desktop, setDesktop] = useState(window.innerWidth >= 768);

	useEffect(() => {
		const handleResize = () => setDesktop(window.innerWidth >= 768);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	useEffect(() => {
		document.body.style.overflow = open ? "hidden" : "unset";
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
				<Dialog open={open} onOpenChange={setOpen} modal={false}>
					<DialogContent className="p-0 overflow-hidden rounded-3xl w-full max-w-5xl! border-0 shadow-2xl bg-white">
						<button
							onClick={() => setOpen(false)}
							className="cursor-pointer absolute top-4 right-4 z-50 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors outline-none"
						>
							<X className="w-5 h-5 text-gray-700" />
						</button>

						<div className="flex flex-row min-h-[570px]">
							<LeftPanel />
							<motion.div
								className="flex-1 flex items-center justify-center px-10 py-10"
								initial={{ opacity: 0, x: 30 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
							>
								<ProfileForm
									mode={mode}
									setMode={setMode}
									onSuccess={handleLoginSuccess}
								/>
							</motion.div>
						</div>
					</DialogContent>
				</Dialog>
			</>
		);
	}

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerContent className="!rounded-none !rounded-tl-4xl p-0">
				<div className="p-10">
					<ProfileForm
						onSuccess={handleLoginSuccess}
						mode={mode}
						setMode={setMode}
					/>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
