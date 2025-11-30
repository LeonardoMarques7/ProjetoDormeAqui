import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, Navigate, useParams } from "react-router-dom";
import { useMessage } from "./contexts/MessageContext";
import { MilkdownProvider } from "@milkdown/react";
import { nord } from "@milkdown/theme-nord";
import { useUserContext } from "../components/contexts/UserContext";
import verify from "../assets/verify.png";
import { withMask } from "use-mask-input";
import { Select } from "@base-ui-components/react/select";

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
	SaveAllIcon,
	Search,
	Upload,
	User,
	Users,
	Wifi,
} from "lucide-react";
import Loading from "./Loading";
import { MarkdownEditor } from "./ui/MarkdownEditor";

const EditProfile = ({ user }) => {
	const id = user._id;
	const { showMessage } = useMessage();
	const [name, setName] = useState(user.name);
	const [email, setEmail] = useState(user.email);
	const [phone, setPhone] = useState(user.phone);
	const [city, setCity] = useState(user.city);
	const [bio, setBio] = useState(user.bio);
	const [pronouns, setPronouns] = useState(user.pronouns);
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
				setPronouns(data.pronouns);
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
					await axios.put(`/users/${id}`, {
						name,
						email,
						photo,
						phone,
						pronouns,
						city,
						bio,
					});
					setRedirect(true);
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
		} else {
			showMessage("Preencha todas as informações!", "warning");
		}
	};

	const handlePageChange = () => {
		setRedirect(true);
	};

	if (redirect)
		return <Navigate to="/account/profile" state={{ updated: true }} />;

	return (
		<div className="container__prev__form flex p-10 bg-white/80  rounded-2xl backdrop-blur-xl max-w-7xl mx-auto flex-1 justify-between gap-5 h-full w-full">
			{/* Avatar sobreposto */}

			<form
				onSubmit={handleSubmit}
				className="container__form pb-30 flex grow flex-col gap-5 w-full max-w-2xl"
			>
				<div className="container__profile mx-auto w-full lg:max-w-7xl  relative -mt-40">
					<div className="flex flex-col gap-5 relative">
						{/* Header do perfil (avatar + botão) */}
						<div className="avatar__btn flex gap-5 items-center justify-start relative">
							{/* Avatar sobreposto */}
							<div className="icon__perfil relative w-40 h-40 rounded-full border-8 bg-gradient-to-bl from-primary-200 to-primary-500 shadow-lg flex justify-center items-center text-4xl font-bold text-white">
								{photo ? (
									<img
										src={photo}
										className="w-full h-full object-cover rounded-full"
										alt={name}
									/>
								) : (
									name.charAt(0)
								)}
							</div>
						</div>
					</div>
				</div>
				<div className="flex flex-col items-start justify-center w-full gap-5">
					<label
						htmlFor="file"
						className="label__input text-start flex flex-col gap-2 w-full	"
					>
						<label
							htmlFor="name"
							className="text-2xl ml-2 font-medium text-gray-600"
						>
							Foto
							<div className="text-sm font-normal">Selecione sua foto.</div>
						</label>
						<div className="group__input flex-1 w-full relative border border-gray-300 cursor-pointer hover:border-primary-400 hover:bg-primary-100/25 pl-14 pr-5 py-4 rounded-2xl outline-primary-400  flex justify-center items-center">
							<input
								type="file"
								id="file"
								className="hidden"
								onChange={uploadPhoto}
								accept="image/*"
							/>
							<Camera className="absolute left-4 text-gray-400 size-6" />
							<div className="flex items-center w-full justify-start">
								<p className=" text-gray-500 transition-all duration-500  ">
									Selecionar a foto
								</p>
								<Upload className="ml-auto text-gray-400 size-6" />
							</div>
						</div>
					</label>
				</div>
				<div className="label__input text-start flex flex-col gap-2 w-full">
					<label
						htmlFor="name"
						className="text-2xl ml-2 font-medium text-gray-600"
					>
						Nome
						<div className="text-sm font-normal">Preencha seu nome.</div>
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
						htmlFor="name"
						className="text-2xl ml-2 font-medium text-gray-600"
					>
						Pronomes
						<div className="text-sm font-normal">
							Preencha seus pronomes. <strong>Campo Opcional</strong>
						</div>
					</label>
					<div className="group__input relative flex justify-start items-center">
						<div className="relative">
							<select
								value={pronouns}
								onChange={(e) => {
									setPronouns(e.target.value);
								}}
								className="w-full appearance-none rounded-xl border-2 border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 cursor-pointer"
							>
								<div className="!mt-2">
									<option value="" disabled selected className="text-slate-400">
										Escolha uma opção
									</option>

									<option value="Ele/Dele" className="py-2">
										Ele/Dele
									</option>
									<option value="Ela/Dela" className="py-2">
										Ela/Dela
									</option>
									<option value="Elu/Delu" className="py-2">
										Elu/Delu
									</option>
									<option value="Outro" className="py-2">
										Outro
									</option>
									<option value="Prefiro não dizer" className="py-2">
										Prefiro não dizer
									</option>
								</div>
							</select>

							<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
								<svg
									className="h-5 w-5 text-slate-400 transition-transform duration-200"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
						</div>
					</div>
				</div>

				<div className="label__input text-start flex flex-col gap-2 w-full">
					<label
						htmlFor="email"
						className="text-2xl ml-2 font-medium text-gray-600"
					>
						E-mail
						<div className="text-sm font-normal">Preencha seu e-mail.</div>
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
						<div className="text-sm font-normal">
							Preencha seu número de celular, com formato (XX) XXXXX-XXXX.
						</div>
					</label>
					<div className="group__input relative flex justify-center items-center">
						<Phone className="absolute left-4 text-gray-400 size-6" />

						<input
							id="phone"
							type="phone"
							placeholder="(99) 99999-9999"
							className="border border-gray-300 px-14 py-4 rounded-2xl w-full outline-primary-400"
							value={phone}
							ref={withMask("(99) 99999-9999")}
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
						Cidade e Estado
						<div className="text-sm font-normal">
							Preencha sua cidade, Estado, com formato Barubigança, PO.
						</div>
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
				<div className="label__input text-start justify-start flex flex-col  gap-5 w-full">
					<label
						htmlFor="bio"
						className="text-2xl ml-2 font-medium text-gray-600"
					>
						Bio
						<div className="text-sm font-normal">
							Descreva-se de forma clara, destacando seus interesses em
							acomodações/hobbis/lugares.
						</div>
					</label>
					<div classsame="group__input">
						<MarkdownEditor
							onChange={(BioText) => setBio(BioText)}
							initialValue={bio}
						/>
					</div>
				</div>
				<div className="flex items-center gap-5">
					<Link
						to="../account/profile"
						className="flex items-center gap-5 group hover:text-primary-500 transition-all"
						onClick={handlePageChange}
					>
						<ArrowLeft size={18} className="" /> Voltar
					</Link>
					<button className="flex w-fit gap-4 bg-primary-600 cursor-pointer hover:bg-primary-700 ease-in-out duration-300 text-white px-10 py-2.5 rounded-full">
						<SaveAllIcon /> Salvar alterações
					</button>
				</div>
			</form>
		</div>
	);
};

export default EditProfile;
