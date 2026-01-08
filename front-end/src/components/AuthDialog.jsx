import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock, Mail, X } from "lucide-react";
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

		// Destravar ao desmontar o componente
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [open]); // ← Adicione 'open' como dependência

	function handleLoginSuccess() {
		setOpen(false);
	}

	if (desktop && open) {
		return (
			<>
				<div
					className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
					onClick={() => setOpen(false)} // Fecha ao clicar fora
				/>

				<Dialog
					open={open}
					className="min-w-full w-full"
					onOpenChange={setOpen}
					modal={false}
				>
					<DialogTrigger asChild>
						<Button variant="outline">Edit Profile</Button>
					</DialogTrigger>
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

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger asChild>
				<Button variant="outline">Edit Profile</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader className="text-left">
					<DrawerTitle>Edit profile</DrawerTitle>
					<DrawerDescription>
						Make changes to your profile here. Click save when you&apos;re done.
					</DrawerDescription>
				</DrawerHeader>
				<ProfileForm className="px-4" />
				<DrawerFooter className="pt-2">
					<DrawerClose asChild>
						<Button variant="outline">Cancel</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

function ProfileForm({ onSuccess }) {
	const { user, setUser } = useUserContext();
	const [mode, setMode] = useState("login");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	const [redirect, setRedirect] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (mode == "login") {
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
		} else {
			setMessage("Erro ao fazer login. Verifique seus dados.");
		}
	};

	return mode == "login" ? (
		<section className="flex w-full">
			{/* Right Section - White Form */}
			<div className="flex-1 bg-white flex items-center justify-center">
				<div className="w-full max-w-md text-start">
					<p className="text-3xl font-medium text-gray-900 mb-2">
						Bem-vindo de volta!
					</p>
					<p className="text-gray-600 mb-8">Entre para continuar sua jornada</p>

					<form className="space-y-5 text-start" onSubmit={handleSubmit}>
						{/* Email Field */}
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

						{/* Password Field */}
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

						{/* Forgot Password */}
						<div className="text-right">
							<button
								type="button"
								className="text-sm text-primary-600 hover:text-primary-700 font-medium"
							>
								Esqueceu a senha?
							</button>
						</div>

						{/* Error Message */}
						{message && (
							<div className="bg-red-50 border border-red-200 text-red-600 text-sm py-3 px-4 rounded-lg">
								{message}
							</div>
						)}

						{/* Submit Button */}
						<button
							type="submit"
							className="w-full cursor-pointer py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-primary-200"
						>
							Entrar
						</button>
					</form>

					{/* Sign Up Link */}
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
		<section className="flex items-center justify-between flex-1  py-4">
			<div className="max-w-125 mx-auto gap-0  rounded-4xl py-2.5  right-0 flex flex-col items-start w-full ">
				<h1 className="text-3xl font-bold y-0">Bem-vindo de voltassss</h1>
				<p className="mb-5">Entre na sua conta para continuar</p>
				<form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
					<div className="group__input relative flex justify-center items-center">
						<Mail className="absolute left-4 text-gray-400 size-6" />
						<input
							type="email"
							className="border border-gray-200 px-14 py-4 rounded-2xl w-full outline-primary-400"
							placeholder="Digite seu Email"
							value={email}
							onChange={(e) => {
								setEmail(e.target.value);
								if (message) setMessage("");
							}}
						/>
					</div>
					<div className="group__input relative flex justify-center items-center">
						<Lock className="absolute left-4 text-gray-400 size-6" />
						<input
							type={showPassword ? "text" : "password"}
							className="border border-gray-200 px-14 py-4 rounded-2xl w-full outline-primary-400"
							placeholder="Digite sua senha"
							value={password}
							onChange={(e) => {
								setPassword(e.target.value);
								if (message) setMessage("");
							}}
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="cursor-pointer absolute right-5 text-gray-400 hover:text-gray-600 transition-colors z-10"
						>
							{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
						</button>
					</div>
					{message && (
						<div className="text-red-500 text-center mt-2">{message}</div>
					)}
					<button className="font-bold rounded-2xl text-xl cursor-pointer w-full px-14 py-4 bg-primary-600 text-white mt-4 hover:bg-primary-700 transition-all ease-in-out duration-300">
						Entrar
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
