import { Lock, Mail } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import logo__secondary from "../assets/plano__fundo.png";
import { useState } from "react";
import axios from "axios";
import { useUserContext } from "../components/contexts/UserContext";
import "./Login.css";

const Login = () => {
	const { user, setUser } = useUserContext();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	const [redirect, setRedirect] = useState(false);

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

	if (redirect || user) return <Navigate to="/" />;

	return (
		<section className="flex items-center justify-between sm:px-8 py-4 max-w-7xl  mx-auto ease-in-out duration-500 transition-all">
			<div className="container__image w-1/2 h-full flex items-center relative justify-center ease-in-out duration-500 transition-all">
				<img
					src={logo__secondary}
					className="w-full object-cover image__login"
					alt=""
				/>
			</div>
			<div className="max-w-96 mx-auto gap-4 flex flex-col items-center w-full ">
				<h1 className="text-3xl font-bold">Bem-vindo de volta</h1>
				<h3>Entre na sua conta para continuar</h3>
				<form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
					<div className="group__input relative flex justify-center items-center">
						<Mail className="absolute left-4 text-gray-400 size-6" />
						<input
							type="email"
							className="border border-gray-200 px-14 py-4 rounded-full w-full outline-primary-400"
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
							type="password"
							className="border border-gray-200 px-14 py-4 rounded-full w-full outline-primary-400"
							placeholder="Digite sua senha"
							value={password}
							onChange={(e) => {
								setPassword(e.target.value);
								if (message) setMessage("");
							}}
						/>
					</div>
					{message && (
						<div className="text-red-500 text-center mt-2">{message}</div>
					)}
					<button className="font-bold rounded-full text-xl cursor-pointer w-full py-2 bg-primary-600 text-white mt-4 hover:bg-primary-700 transition-all ease-in-out duration-300">
						Entrar
					</button>
				</form>

				<p>
					Ainda não tem uma conta?{" "}
					<Link to="/register" className="underline font-semibold">
						Registre-se Aqui!
					</Link>{" "}
				</p>
			</div>
		</section>
	);
};

export default Login;
