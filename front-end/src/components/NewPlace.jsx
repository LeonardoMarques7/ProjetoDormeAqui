import { useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";

import { useUserContext } from "./contexts/UserContext";
import { useMessage } from "./contexts/MessageContext";

import Perks from "./Perks";

import {
	ArrowUpFromLine,
	CalendarArrowDown,
	CalendarArrowUp,
	Camera,
	DollarSign,
	Home,
	MapPin,
	NotepadTextDashed,
	Users,
	Wifi,
} from "lucide-react";
import PhotosUploader from "./PhotosUploader";

const NewPlace = () => {
	const { user } = useUserContext();
	const { showMessage } = useMessage();
	const [title, setTitle] = useState("");
	const [city, setCity] = useState("");
	const [photos, setPhotos] = useState([]);
	const [photolink, setPhotoLink] = useState("");
	const [description, setDescription] = useState("");
	const [extras, setExtras] = useState("");
	const [price, setPrice] = useState("");
	const [perks, setPerks] = useState([]);
	const [checkin, setCheckin] = useState("");
	const [checkout, setCheckout] = useState("");
	const [guests, setGuests] = useState("");
	const [redirect, setRedirect] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();

		// photos.length > 0 &&
		if (
			(title && city, description && price && checkin && checkout && guests)
		) {
			try {
				const newPlace = await axios.post("/places", {
					owner: user._id,
					title,
					city,
					photos,
					description,
					extras,
					perks,
					price,
					checkin,
					checkout,
					guests,
				});
				showMessage("Sua acomodação foi adicionada com sucesso!", "success");
				setRedirect(true);

				console.log(newPlace);
			} catch (error) {
				console.log("Erro ao enviar o formulário: ", JSON.stringify(error));
				showMessage("Deu erro ao enviar formulário de novo lugar!", "error");
			}
		} else {
			showMessage("Preencha todas as informações!", "warning");
		}
	};

	if (redirect) return <Navigate to="/account/places" />;

	return (
		<>
			<form
				onSubmit={handleSubmit}
				className="container__form flex flex-col gap-4 w-1/2"
			>
				<div className="label__input text-start flex flex-col gap-2 w-full">
					<label
						htmlFor="title"
						className="text-2xl ml-2 font-medium text-gray-600"
					>
						Título
					</label>
					<div className="group__input relative flex justify-center items-center">
						<Home className="absolute left-4 text-gray-400 size-6" />
						<input
							id="title"
							type="text"
							placeholder="Digite o título do seu anúncio"
							className="border border-gray-200 px-14 py-4 rounded-2xl w-full outline-primary-400"
							value={title}
							onChange={(e) => {
								setTitle(e.target.value);
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
							placeholder="Digite o cidade e país do seu anúncio"
							className="border border-gray-200 px-14 py-4 rounded-2xl w-full outline-primary-400"
							value={city}
							onChange={(e) => {
								setCity(e.target.value);
							}}
						/>
					</div>
				</div>

				<PhotosUploader
					{...{ photolink, setPhotoLink, photos, setPhotos, showMessage }}
				/>

				<div className="label__input text-start flex flex-col gap-2 w-full">
					<label
						htmlFor="description"
						className="text-2xl ml-2 font-medium text-gray-600"
					>
						Descrição
					</label>
					<div className="group__input relative flex justify-center items-center">
						<NotepadTextDashed className="absolute top-4.5 left-4 text-gray-400 size-6" />
						<textarea
							id="description"
							maxLength={3000}
							placeholder="Digite a descrição do seu anúncio"
							className="border border-gray-200 px-14 min-h-50 py-4 rounded-2xl w-full outline-primary-400 resize-none"
							value={description}
							onChange={(e) => {
								setDescription(e.target.value);
							}}
						/>
					</div>
				</div>
				<div className="label__input text-start flex flex-col gap-2 w-full">
					<label
						htmlFor="perks"
						className="text-2xl ml-2 font-medium text-gray-600"
					>
						Comodidades
					</label>
					<Perks perks={perks} setPerks={setPerks} />
				</div>
				<div className="label__input text-start flex flex-col gap-2 w-full">
					<label
						htmlFor="extras"
						className="text-2xl ml-2 font-medium text-gray-600"
					>
						Informações Extras
					</label>
					<div className="group__input relative flex justify-center items-center">
						<NotepadTextDashed className="absolute top-4.5 left-4 text-gray-400 size-6" />
						<textarea
							id="extras"
							maxLength={3000}
							placeholder="Digite a informação extras do seu anúncio"
							className="border border-gray-200 px-14 min-h-50 py-4 rounded-2xl w-full outline-primary-400 resize-none"
							value={extras}
							onChange={(e) => {
								setExtras(e.target.value);
							}}
						/>
					</div>
				</div>
				<h2 className="text-2xl text-start ml-2 font-medium text-gray-600">
					Restrições e Preço
				</h2>
				<div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
					<div className="label__input text-start flex flex-col gap-2 w-full">
						<label
							htmlFor="price"
							className="text-[1rem] ml-2  font-medium text-gray-600"
						>
							Preço
						</label>
						<div className="group__input relative flex justify-center items-center">
							<DollarSign className="absolute left-4 text-gray-400 size-6" />
							<input
								id="price"
								type="number"
								placeholder="R$ 250,00"
								className="border border-gray-200 px-14 py-4 rounded-2xl w-full outline-primary-400"
								value={price}
								onChange={(e) => {
									setPrice(e.target.value);
								}}
							/>
						</div>
					</div>
					<div className="label__input text-start flex flex-col gap-2 w-full">
						<label
							htmlFor="checkin"
							className="text-[1rem] ml-2  font-medium text-gray-600"
						>
							Check-in
						</label>
						<div className="group__input relative flex justify-center items-center">
							<CalendarArrowUp className="absolute left-4 text-gray-400 size-6" />
							<input
								id="checkin"
								type="text"
								placeholder="16:00"
								className="border border-gray-200 px-14 py-4 rounded-2xl w-full outline-primary-400"
								value={checkin}
								onChange={(e) => {
									setCheckin(e.target.value);
								}}
							/>
						</div>
					</div>
					<div className="label__input text-start flex flex-col gap-2 w-full">
						<label
							htmlFor="checkout"
							className="text-[1rem] ml-2  font-medium text-gray-600"
						>
							Check-out
						</label>
						<div className="group__input relative flex justify-center items-center">
							<CalendarArrowDown className="absolute left-4 text-gray-400 size-6" />
							<input
								id="checkout"
								type="text"
								placeholder="19:00"
								className="border border-gray-200 px-14 py-4 rounded-2xl w-full outline-primary-400"
								value={checkout}
								onChange={(e) => {
									setCheckout(e.target.value);
								}}
							/>
						</div>
					</div>
					<div className="label__input text-start flex flex-col gap-2 w-full">
						<label
							htmlFor="guests"
							className="text-[1rem] ml-2  font-medium text-gray-600"
						>
							Nº Convidados
						</label>
						<div className="group__input relative flex justify-center items-center">
							<Users className="absolute left-4 text-gray-400 size-6" />
							<input
								id="guests"
								type="number"
								placeholder="4"
								className="border border-gray-200 px-14 py-4 rounded-2xl w-full outline-primary-400"
								value={guests}
								onChange={(e) => {
									setGuests(e.target.value);
								}}
							/>
						</div>
					</div>
				</div>
				<button className="flex w-fit gap-4 bg-primary-600 cursor-pointer hover:bg-primary-700 ease-in-out duration-300 text-white px-10 py-2.5 rounded-full">
					Salvar acomodação
				</button>
			</form>
		</>
	);
};

export default NewPlace;
