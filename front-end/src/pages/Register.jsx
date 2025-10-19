import {
	CircleUserRound,
	Lock,
	Mail,
	X,
	Check,
	Eye,
	EyeOff,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useState } from "react";
import logo__secondary from "../assets/plano__fundo__3.png";
import { useUserContext } from "../components/contexts/UserContext";
import { useMessage } from "../components/contexts/MessageContext";
import axios from "axios";
import { motion } from "framer-motion";

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

const requirements = [
	{ re: /[0-9]/, label: "Pelo menos um número" },
	{ re: /[a-z]/, label: "Uma letra minúscula" },
	{ re: /[A-Z]/, label: "Uma letra maiúscula" },
	{ re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: "Um caractere especial" },
];

const Register = () => {
	const { setUser } = useUserContext();
	const { showMessage } = useMessage();
	const [redirect, setRedirect] = useState(false);

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPasswordPopover, setShowPasswordPopover] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (email && password && name) {
			try {
				const { data: userDoc } = await axios.post("/users", {
					name,
					email,
					password,
				});

				setUser(userDoc);
				setRedirect(true);
			} catch (error) {
				showMessage(`Erro ao cadastrar: ${error}`, "error");
			}
		} else {
			showMessage(
				"Você precisa preencher o e-mail, o nome e a senha!",
				"warning"
			);
		}
	};

	const checks = requirements.map((requirement, index) => (
		<PasswordRequirement
			key={index}
			label={requirement.label}
			meets={requirement.re.test(password)}
		/>
	));

	if (redirect) return <Navigate to="/account/profile" />;

	return (
		<section className="flex flex-row-reverse  w-full h-svh items-center justify-between sm:px-8 py-4 max-w-7xl mx-auto ease-in-out duration-500 transition-all">
			<div className=" flex  items-center relative justify-center ease-in-out container__image duration-500 transition-all">
				<motion.img
					src={logo__secondary}
					initial={{ opacity: 0.5 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.8, ease: "easeInOut" }}
					className="w-[35svw] h-full object-cover image__login"
					alt=""
				/>
			</div>
			<motion.div
				initial={{ x: "100%", opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				exit={{ x: "-100%", opacity: 0 }}
				transition={{ duration: 0.8, ease: "easeInOut" }}
				className="max-w-96 mx-auto gap-4 flex flex-col items-center w-full"
			>
				<h1 className="text-3xl font-bold">Cadastre-se e descubra</h1>
				<h3>Crie uma conta para continuar</h3>
				<form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
					<div className="group__input relative flex justify-center items-center">
						<CircleUserRound className="absolute left-4 text-gray-400 size-6" />
						<input
							type="text"
							className="border border-gray-200 px-14 py-4 rounded-full w-full outline-primary-400"
							placeholder="Digite seu Nome"
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
							className="border border-gray-200 px-14 py-4 rounded-full w-full outline-primary-400"
							placeholder="Digite seu Email"
							value={email}
							onChange={(e) => {
								setEmail(e.target.value);
							}}
						/>
					</div>

					<div className="relative">
						<div className="relative flex flex-col gap-2">
							<div className="group__input relative flex justify-center items-center">
								<Lock className="absolute left-4 text-gray-400 size-6" />

								<input
									type={showPassword ? "text" : "password"}
									className="border border-gray-200 px-14 py-4 rounded-full w-full outline-primary-400"
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
							{showPasswordPopover && (
								<div className="text-sm text-center mt-2 flex justify-start flex-col items-start mx-auto">
									<PasswordRequirement
										label="Pelo menos 6 caracteres"
										meets={password.length > 5}
									/>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-4 ">
										{checks}
									</div>
								</div>
							)}
						</div>
					</div>
					<button
						type="submit"
						className="font-bold rounded-full text-xl cursor-pointer w-full py-2 bg-primary-600 text-white mt-4 hover:bg-primary-700 transition-all ease-in-out duration-300"
					>
						Entrar
					</button>
				</form>

				<p>
					Já possui uma conta?{" "}
					<Link to="/login" className="underline font-semibold">
						Logue Aqui!
					</Link>
				</p>
			</motion.div>
		</section>
	);
};

export default Register;
