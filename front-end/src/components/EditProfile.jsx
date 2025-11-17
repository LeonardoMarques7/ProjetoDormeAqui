import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, Navigate, useParams } from "react-router-dom";
import { useMessage } from "./contexts/MessageContext";
import { MilkdownProvider } from "@milkdown/react";
import { nord } from "@milkdown/theme-nord";
import { useUserContext } from "../components/contexts/UserContext";
import verify from "../assets/verify.png";

import "./EditProfile.css";

import {
	ArrowBigLeft,
	ArrowLeft,
	ArrowLeftSquare,
	ArrowUpFromLine,
	CalendarArrowDown,
	CalendarArrowUp,
	Camera,
	ChevronLeft,
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
	const { updateUser } = useUserContext();
	const { showMessage } = useMessage();
	const [name, setName] = useState(user.name);
	const [email, setEmail] = useState(user.email);
	const [phone, setPhone] = useState(user.phone);
	const [city, setCity] = useState(user.city);
	const [bio, setBio] = useState(user.bio);
	const [photo, setPhoto] = useState(user.photo);
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
				setPhoto(data.photo);
				setCity(data.city);
				setBio(data.bio);
			};

			axiosGet();
		}
	}, []);

	const uploadPhoto = async (e) => {
		const { files } = e.target;
		const file = files[0];

		if (!file) return;

		const formData = new FormData();
		formData.append("files", file);

		try {
			const { data: photoUrl } = await axios.post("/users/upload", formData);

			console.log("✅ Sucesso:", photoUrl);

			// Agora photoUrl já é a string da URL
			setPhoto(photoUrl);
			showMessage("Foto atualizada com sucesso!", "success");
		} catch (error) {
			showMessage("Erro ao enviar imagem!", "error");
			console.error("❌ Erro:", error);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (name && email && phone && city && bio) {
			if (id) {
				try {
					const modifiedUser = await axios.put(`/users/${id}`, {
						name,
						email,
						photo,
						phone,
						city,
						bio,
					});
					await updateUser();
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

	const handlePageChange = () => {
		setRedirect(true);
	};

	if (redirect) return <Navigate to="/account/profile" />;

	return (
		<div className="container__prev__form flex p-10 bg-white/80  rounded-2xl backdrop-blur-xl max-w-7xl mx-auto flex-1 justify-between gap-5 h-full w-full">
			{/* Avatar sobreposto */}

			<form
				onSubmit={handleSubmit}
				className="container__form pb-30 flex grow flex-col gap-4 w-full max-w-2xl"
			>
				<div className="flex flex-col items-start justify-center gap-5">
					<div className="icon__perfil relative w-40 h-40 top-0 rounded-full border-8 bg-gradient-to-bl from-primary-200 to-primary-500 shadow-lg flex justify-center items-center text-4xl font-bold text-white">
						{photo ? (
							<img
								src={photo}
								alt="Foto de perfil"
								className="w-full h-full object-cover rounded-full"
							/>
						) : (
							name[0]
						)}
					</div>
					<label htmlFor="file" className="">
						<div className="border border-dashed  hover:bg-primary-100 hover:border-solid cursor-pointer  gap-2 border-gray-300 px-14 py-4 rounded-2xl w-full outline-primary-400 group__input relative flex justify-center items-center transition-all">
							<Camera className="absolute left-4 text-gray-400 size-6" />
							<input
								type="file"
								id="file"
								className="hidden"
								onChange={uploadPhoto}
								accept="image/*"
							/>
							Enviar foto
						</div>
					</label>
				</div>
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
				<Link
					to="../account/profile"
					className="flex items-center gap-5 group hover:text-primary-500 transition-all"
					onClick={handlePageChange}
				>
					<ArrowLeft size={18} className="" /> Voltar
				</Link>
			</form>
		</div>
	);
};

export default EditProfile;
