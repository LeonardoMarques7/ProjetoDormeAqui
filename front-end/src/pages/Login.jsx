import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import logo__secondary from "../assets/banner3.jpg";
import { useState } from "react";
import axios from "axios";
import { useUserContext } from "../components/contexts/UserContext";
import { motion } from "framer-motion";

const Login = () => {
	const { user, setUser } = useUserContext();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	const [redirect, setRedirect] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (email && password) {
			try {
				const { data: userDoc } = await axios.post("/users/login", {
					email,
					password,
				});

				setUser(userDoc);
				setRedirect(true);
			} catch (error) {
				setMessage(`Ops, erro ao logar.. ${error.response.data}`);
			}
		} else {
			setMessage("Erro ao fazer login. Verifique seus dados.");
		}
	};

	if (redirect) return <Navigate to="/" />;

	return (
		<div className="!overflow-y-hidden flex justify-evenly">
			<div className="absolute left-0 container__image w-1/2 h-full ease-in-out duration-500 transition-all">
				<img
					src={logo__secondary}
					className="w-full object-cover shadow-2xl shadow-[#dcd3c1] image__login"
					alt=""
				/>
			</div>
			<section className="flex items-center h-svh justify-between flex-1 sm:px-8 py-4 max-w-7xl ml-[50%] ease-in-out duration-500 transition-all">
				<motion.div
					initial={{ x: "-100%", opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					exit={{ x: "-100%", opacity: 0 }}
					transition={{ duration: 1, ease: "easeInOut" }}
					className="max-w-125 mx-auto gap-4  rounded-4xl p-5 right-0 flex flex-col items-center w-full "
				>
					<h1 className="text-3xl font-bold">Bem-vindo de volta</h1>
					<p className="mb-4">Entre na sua conta para continuar</p>
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

					<p>
						Ainda não tem uma conta?{" "}
						<Link to="/register" className="underline font-semibold">
							Registre-se Aqui!
						</Link>{" "}
					</p>
				</motion.div>
			</section>
		</div>
	);
};

export default Login;
