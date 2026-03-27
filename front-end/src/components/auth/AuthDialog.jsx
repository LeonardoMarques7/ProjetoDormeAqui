import { motion, AnimatePresence } from "framer-motion";
import { registerSchema } from "../schemas/authSchema";
import { Check, Eye, EyeOff, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";

import { useEffect, useState, useCallback, useRef } from "react";
import { Navigate, Link } from "react-router-dom";
import axios from "axios";
import { useUserContext } from "@/components/contexts/UserContext";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const photoDefault =
	"https://projeto-dorme-aqui.s3.us-east-2.amazonaws.com/1769633448464-848631051.png";

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
			{/* diagonal cut on the right edge — "quebradinha cortado de lado" */}
			<div
				className="absolute inset-0 overflow-hidden rounded-l-2xl"
				style={{ clipPath: "polygon(0 0, 100% 0, 84% 100%, 0 100%)" }}
			>
				{/* Embla carousel */}
				<div className="overflow-hidden h-full rounded-l-2xl" ref={emblaRef}>
					<div className="flex h-full touch-pan-y">
						{slides.map((src, i) => (
							<div key={i} className="flex-none w-full h-full relative">
								<img
									src={src}
									alt=""
									className="absolute inset-0 rounded-l-2xl rounded-bl-2xl! w-full h-full object-cover select-none"
									draggable="false"
								/>
							</div>
						))}
					</div>
				</div>

				{/* Dark gradient overlay */}
				<div className="absolute inset-0 bg-gradient-to-t rounded-l-2xl rounded-bl-2xl! from-black/80 via-black/20 to-transparent pointer-events-none" />

				{/* Bottom content: branding + arrows */}
				<div className="absolute bottom-7 left-7 right-22 z-10 rounded-l-2xl flex items-end justify-between">
					<div>
						<p className="text-white text-lg font-bold leading-tight">
							DormeAqui
						</p>
						<p className="text-white/60 text-xs mt-0.5">
							Encontre o lugar perfeito
						</p>
					</div>

					{/* Minimalist arrow buttons — like the reference image */}
					{/* <div className="flex gap-2 items-center">
						<button
							onClick={scrollPrev}
							className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 border border-white/25 flex items-center justify-center backdrop-blur-sm transition-all duration-200 cursor-pointer"
						>
							<ChevronLeft size={14} className="text-white" />
						</button>
						<button
							onClick={scrollNext}
							className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 border border-white/25 flex items-center justify-center backdrop-blur-sm transition-all duration-200 cursor-pointer"
						>
							<ChevronRight size={14} className="text-white" />
						</button>
					</div> */}
				</div>
			</div>
		</div>
	);
}

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
					onOpenChange={setOpen}
					modal={false}
					className="w-full! max-w-full!"
				>
					<DialogContent className="p-0 overflow-hidden rounded-3xl w-full max-w-5xl! border-0 shadow-2xl bg-white">
						{/* Close button — dark since it sits over white panel */}
						<button
							onClick={() => setOpen(false)}
							className="cursor-pointer absolute top-4 right-4 z-50 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors outline-none"
						>
							<X className="w-5 h-5 text-gray-700" />
						</button>

						<div className="flex flex-row min-h-[570px]">
							<LeftPanel />
							{/* Right panel — white form */}
							<motion.div
								className="flex-1  flex items-center justify-center px-10 py-10"
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

	// Mobile
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
	const [acceptedTerms, setAcceptedTerms] = useState(false);
	const [errors, setErrors] = useState({});
	const [isFormValid, setIsFormValid] = useState(false);

	// ========== GOOGLE LOGIN ==========
	const handleGoogleLogin = async () => {
		if (mode === "register" && !acceptedTerms) {
			setMessage(
				"Você deve aceitar os Termos de Serviço e Política de Privacidade",
			);
			return;
		}

		setLoadingOAuth(true);
		setMessage("");

		try {
			if (!window.google) {
				throw new Error("Google Sign-In library not loaded");
			}

			// Salvar flag para validar no callback
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
	};

	// ========== GITHUB LOGIN ==========
	const handleGithubLogin = () => {
		if (mode === "register" && !acceptedTerms) {
			setMessage(
				"Você deve aceitar os Termos de Serviço e Política de Privacidade",
			);
			return;
		}

		setLoadingOAuth(true);
		setMessage("");
		const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
		const redirectUri = `${window.location.origin}/auth/github/callback`;

		if (!clientId) {
			setMessage("GitHub Client ID não configurado");
			setLoadingOAuth(false);
			return;
		}

		// Salvar flag para validar no callback
		if (mode === "register") {
			localStorage.setItem("acceptedTermsForOAuth", "true");
		}

		window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
	};

	const validateField = (field, value) => {
		try {
			registerSchema.pick({ [field]: true }).parse({ [field]: value.trim() });
			setErrors((prev) => ({ ...prev, [field]: "" }));
		} catch (err) {
			setErrors((prev) => ({
				...prev,
				[field]: err.errors?.message || "Erro de validação",
			}));
		}
		checkFormValidity();
	};

	const checkFormValidity = useCallback(() => {
		setIsFormValid(
			Object.values(errors).every((e) => !e) &&
				name.trim() &&
				email.trim() &&
				password.trim() &&
				confirmPassword.trim() &&
				acceptedTerms &&
				!emailError,
		);
	}, [
		errors,
		name,
		email,
		password,
		confirmPassword,
		acceptedTerms,
		emailError,
	]);

	const checkEmailExists = async (emailToCheck) => {
		if (!emailToCheck || mode === "login") return;

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(emailToCheck)) {
			setEmailError("Email inválido");
			return;
		}

		setIsCheckingEmail(true);
		setEmailError("");

		try {
			const { data: users } = await axios.get("/users");
			const emailsList = users.map((user) => user.email.toLowerCase());
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

	if (redirect) return <Navigate to="/account/profile" />;

	return (
		<AnimatePresence mode="wait">
			{/* ===== LOGIN ===== */}
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

					<p className="text-center text-gray-400 text-sm mt-6">
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

					<p className="text-center text-gray-400 text-sm mt-6">
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

			{/* ===== REGISTER ===== */}
			{mode === "register" && (
				<motion.div
					key="register"
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
						Crie sua conta
					</motion.h1>
					<p className="text-gray-400 mb-8 text-sm">Junte-se ao DormeAqui</p>

					<form className="space-y-4" onSubmit={handleSubmit}>
						<motion.div
							initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0 * 0.07, duration: 0.4 }}
						>
							<input
								type="text"
								placeholder="Nome completo"
								className={`${INPUT_CLS} ${errors.name ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
								value={name}
								onChange={(e) => {
									const val = e.target.value;
									setName(val);
									validateField("name", val);
									if (message) setMessage("");
								}}
							/>
							{errors.name && (
								<p className="text-xs text-red-500 mt-1 ml-1">{errors.name}</p>
							)}
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 1 * 0.07, duration: 0.4 }}
						>
							<input
								type="email"
								placeholder="Email"
								className={`${INPUT_CLS} ${errors.email || emailError ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
								value={email}
								onChange={(e) => {
									const val = e.target.value;
									setEmail(val);
									validateField("email", val);
									setEmailError("");
									if (message) setMessage("");
								}}
								onBlur={(e) => {
									checkEmailExists(e.target.value);
									validateField("email", e.target.value);
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
						</motion.div>

						<motion.div
							className="relative"
							initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 2 * 0.07, duration: 0.4 }}
						>
							<input
								type={showPassword ? "text" : "password"}
								placeholder="Senha"
								className={`${INPUT_CLS} pr-12 ${errors.password ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
								value={password}
								onChange={(e) => {
									const val = e.target.value;
									setPassword(val);
									validateField("password", val);
									setShowPasswordPopover(true);
								}}
								onBlur={() => {
									validateField("password", password);
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
						</motion.div>

						{showPasswordPopover && (
							<div className="ml-1">
								<PasswordRequirement
									label="6+ caracteres"
									meets={password.length >= 6}
								/>
								<PasswordRequirement
									label="1 maiúscula"
									meets={/[A-Z]/.test(password)}
								/>
								<PasswordRequirement
									label="1 minúscula"
									meets={/[a-z]/.test(password)}
								/>
								<PasswordRequirement
									label="1 número"
									meets={/\d/.test(password)}
								/>
								<PasswordRequirement
									label="1 especial"
									meets={/[@$!%*?&]/.test(password)}
								/>
							</div>
						)}

						<motion.div
							className="relative"
							initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 3 * 0.07, duration: 0.4 }}
						>
							<input
								type={showConfirmPassword ? "text" : "password"}
								placeholder="Confirmar senha"
								className={`${INPUT_CLS} pr-12 ${errors.confirmPassword ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
								value={confirmPassword}
								onChange={(e) => {
									const val = e.target.value;
									setConfirmPassword(val);
									validateField("confirmPassword", val);
									if (message) setMessage("");
								}}
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
								{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
							</button>
						</motion.div>

						{message && (
							<div className="bg-red-50 border border-red-200 text-red-600 text-sm py-3 px-4 rounded-lg">
								{message}
							</div>
						)}

						{/* Terms and Privacy Checkbox */}
						<motion.div
							className="flex items-start gap-3"
							initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 4 * 0.07, duration: 0.4 }}
						>
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
						</motion.div>

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
							disabled={!isFormValid || loadingOAuth || isLoading || emailError}
							className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-full transition-all duration-300 shadow-lg shadow-primary-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							Criar Conta
						</motion.button>
					</form>

					<p className="text-center text-gray-400 text-sm mt-6">
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
