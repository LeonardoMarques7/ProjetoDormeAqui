import React, { useState } from "react";
import axios from "axios";
import { Link, Navigate } from "react-router-dom";
import { useUserContext } from "./contexts/UserContext";
import {
	Globe,
	Mail,
	MapPin,
	Pen,
	Phone,
	PhoneCall,
	Sunrise,
} from "lucide-react";
import verify from "../assets/verify.png";

const AccProfile = () => {
	const { user, setUser } = useUserContext();
	const [redirect, setRedirect] = useState(false);

	const logout = async () => {
		try {
			const { data } = await axios.post("/users/logout");
			console.log(data);

			setUser(null);
			setRedirect(true);
		} catch (error) {
			alert(JSON.stringify(error));
		}
	};

	if (redirect) return <Navigate to="/" />;

	if (!user) return <></>;

	return (
		<section>
			<div
				id="Perfil"
				className="p-8 w-full bg-primary-500 mb-15 relative h-[50svh] flex-col text-white flex justify-center items-center text-center"
			>
				<div className="profile  lg:max-w-7xl w-full">
					<div className="card absolute shadow-lg -bottom-20 left-20 bg-gradient-to-bl to-primary-500 from-primary-200 border-8 w-40 h-40 rounded-full flex justify-center items-center text-4xl font-bold">
						L
						<img
							src={verify}
							alt="Simbolo de Verificado"
							className="w-10 absolute bottom-0 right-0 bg-white rounded-full"
						/>
					</div>
					<div className="absolute left-65 bottom-5 text-4xl flex gap-2 items-end font-bold">
						Leonardo Marques
						<span className="flex items-center gap-2 text-lg font-normal">
							Ele/Dele
						</span>
					</div>
					<Link className="hover:bg-white/50 hover:text-primary-700 transition-all ease-in-out duration-500 absolute right-25 bottom-5 border-1 flex items-center w-fit px-5 py-2.5 rounded-md gap-4">
						<Pen /> Editar Perfil
					</Link>
				</div>
			</div>
			<div className="relative left-65 -top-10 text-gray-500 content__card flex items-center gap-4">
				<span className="flex items-center gap-2">
					<MapPin size={18} /> Sorocaba, SP{" "}
				</span>
				<span className="flex items-center gap-2">
					<Mail size={18} /> leonardo@teste.com
				</span>
				<span className="flex items-center gap-2">
					<Phone size={18} /> (12) 12121-1212
				</span>
			</div>
			<div className="flex gap-2 justify-between">
				<div className="profile relative left-22 top-5  lg:max-w-7xl w-full">
					<span className="flex gap-2 flex-col mb-4">
						<span className="flex items-end gap-2">
							<span className="scale-150">🪴</span> Anfitrião desde 10/04/20255
						</span>
					</span>
					<h2 className="text-2xl font-medium mb-1">Sobre mim</h2>
					<div className="text__bio max-w-xl flex flex-col leading-relaxed">
						<p className="w-full">
							E aí! Eu sou o Leonardo 👋 Sou estudante de Ciência da Computação
							e adoro transformar ideias em lugares incríveis.
						</p>
						<p>
							Curto ambientes aconchegantes, boa companhia e um café passado na
							hora ☕. Meu objetivo é fazer você se sentir em casa, mesmo
							estando longe dela.
						</p>
					</div>
				</div>
				<div className="profile relative left-22 top-5  lg:max-w-7xl w-full">
					<div className="grid grid-cols-2 gap-x-0 gap-y-2 items-start relative">
						{/* Coluna 1 */}
						<div className="space-y-2 w-full">
							<div className="card py-2.5 px-4 w-fit border-1 border-primary-300 text-primary-300 flex justify-center items-center">
								<div className="flex items-center w-full gap-4 justify-between">
									<span className="font-bold text-3xl">5</span>
									<p>Acomodações Ativas</p>
								</div>
							</div>

							<div className="card py-2.5 px-4 w-full border-1 border-primary-300 text-primary-300 flex justify-center items-center">
								<div className="flex items-center w-full justify-between">
									<span className="font-bold text-3xl">15</span>
									<p>Reservas Concluídas</p>
								</div>
							</div>
						</div>

						{/* Coluna 2 */}
						<div className="space-y-2 w-full max-w-60 absolute left-55">
							<div className="card py-2.5 px-4 w-full border-1 border-primary-300 text-primary-300 flex justify-center items-center">
								<div className="flex items-center w-full justify-between">
									<span className="font-bold text-3xl">1h</span>
									<p>Tempo de Resposta</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default AccProfile;
