import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Navigate, useParams } from "react-router-dom";
import { useMessage } from "./contexts/MessageContext";
import { MilkdownProvider } from "@milkdown/react";
import { nord } from "@milkdown/theme-nord";

import "./EditProfile.css";

import {
	ArrowUpFromLine,
	CalendarArrowDown,
	CalendarArrowUp,
	Camera,
	DollarSign,
	Home,
	ImagePlus,
	Mail,
	MapPin,
	NotepadTextDashed,
	Phone,
	Search,
	User,
	Users,
	Wifi,
} from "lucide-react";

const EditProfile = ({ user }) => {
	const id = user._id;
	const { showMessage } = useMessage();
	const [name, setName] = useState(user.name);
	const [email, setEmail] = useState(user.email);
	const [phone, setPhone] = useState(user.phone);
	const [city, setCity] = useState(user.city);
	const [bio, setBio] = useState(user.bio);
	const [redirect, setRedirect] = useState(false);

	useEffect(() => {
		if (id) {
			console.log(id);
			const axiosGet = async () => {
				const { data } = await axios.get(`/users/${id}`);

				console.log(data);

				setName(data.name);
				setEmail(data.email);
				setPhone(data.phone);
				setCity(data.city);
				setBio(data.bio);
			};

			axiosGet();
		}
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (name && email && phone && city && bio) {
			if (id) {
				try {
					const modifiedUser = await axios.put(`/users/${id}`, {
						name,
						email,
						phone,
						city,
						bio,
					});
					showMessage(
						"Suas informações foram atualizadas com sucesso!",
						"success"
					);
				} catch (error) {
					console.log("Erro ao enviar o formulário: ", JSON.stringify(error));
					showMessage("Deu erro ao atualizar suas informações!", "error");
				}
			} else {
			}

			setRedirect(true);
		} else {
			showMessage("Preencha todas as informações!", "warning");
		}
	};

	if (redirect) return <Navigate to="/account/profile" />;

	return (
		<div className="container__prev__form flex p-10 bg-white/80  rounded-2xl backdrop-blur-xl max-w-7xl mx-auto flex-1 justify-between gap-5 h-full w-full">
			<form
				onSubmit={handleSubmit}
				className="container__form pb-30 flex grow flex-col gap-4 w-full max-w-2xl"
			>
				<div className="label__input text-start flex flex-col gap-2 w-full">
					<label
						htmlFor="name"
						className="text-2xl ml-2 font-medium text-gray-600"
					>
						Nome
					</label>
					<div className="group__input relative flex justify-center items-center">
						<User className="absolute left-4 text-gray-400 size-6" />
						<input
							id="name"
							type="text"
							placeholder="Digite o seu nome"
							className="border border-gray-300 px-14 py-4 rounded-2xl w-full outline-primary-400"
							value={name}
							onChange={(e) => {
								setName(e.target.value);
							}}
						/>
					</div>
				</div>
				<div className="label__input text-start flex flex-col gap-2 w-full">
					<label
						htmlFor="email"
						className="text-2xl ml-2 font-medium text-gray-600"
					>
						E-mail
					</label>
					<div className="group__input relative flex justify-center items-center">
						<Mail className="absolute left-4 text-gray-400 size-6" />
						<input
							id="email"
							type="email"
							placeholder="Digite seu e-mail"
							className="border border-gray-300 px-14 py-4 rounded-2xl w-full outline-primary-400"
							value={email}
							onChange={(e) => {
								setEmail(e.target.value);
							}}
						/>
					</div>
				</div>
				{/* Telefone */}
				<div className="label__input text-start flex flex-col gap-2 w-full">
					<label
						htmlFor="phone"
						className="text-2xl ml-2 font-medium text-gray-600"
					>
						Telefone
					</label>
					<div className="group__input relative flex justify-center items-center">
						<Phone className="absolute left-4 text-gray-400 size-6" />
						<input
							id="phone"
							type="phone"
							placeholder="Digite seu telefone"
							className="border border-gray-300 px-14 py-4 rounded-2xl w-full outline-primary-400"
							value={phone}
							onChange={(e) => {
								setPhone(e.target.value);
							}}
						/>
					</div>
				</div>
				<div className="label__input text-start flex flex-col gap-2 w-full">
					<label
						htmlFor="city"
						className="text-2xl ml-2 font-medium text-gray-600"
					>
						Cidade e País
					</label>
					<div className="group__input relative flex justify-center items-center">
						<MapPin className="absolute left-4 text-gray-400 size-6" />
						<input
							id="city"
							type="text"
							placeholder="Digite a sua cidade e país"
							className="border border-gray-300 px-14 py-4 rounded-2xl w-full outline-primary-400"
							value={city}
							onChange={(e) => {
								setCity(e.target.value);
							}}
						/>
					</div>
				</div>

				<div className="label__input text-start flex flex-col gap-2 w-full">
					<label
						htmlFor="bio"
						className="text-2xl ml-2 font-medium text-gray-600"
					>
						Bio
					</label>
					<div className="group__input relative flex justify-center items-center">
						<NotepadTextDashed className="absolute top-4.5 left-4 text-gray-400 size-6" />
						<textarea
							id="bio"
							maxLength={5000}
							placeholder="Digite a sua bio"
							className="border border-gray-300 px-14 min-h-50 py-4 rounded-2xl w-full outline-primary-400 resize-none"
							value={bio}
							onChange={(e) => {
								setBio(e.target.value);
							}}
						/>
					</div>
				</div>
				<button className="flex w-fit gap-4 bg-primary-600 cursor-pointer hover:bg-primary-700 ease-in-out duration-300 text-white px-10 py-2.5 rounded-full">
					Salvar alterações
				</button>
			</form>
		</div>
	);
};

export default EditProfile;
