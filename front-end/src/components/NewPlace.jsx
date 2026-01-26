import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { PriceInput } from "./ui/PriceInput";

import { useMessage } from "./contexts/MessageContext";
import { GuestsInput } from "./ui/GuestsInput";

import { useMobileContext } from "./contexts/MobileContext";
import { useUserContext } from "./contexts/UserContext";

import MarkdownIt from "markdown-it";

import Perks from "./Perks";

import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import "lightgallery/css/lg-fullscreen.css";

import "./NewPlace.css";

import {
	ArrowLeft,
	CalendarArrowDown,
	CalendarArrowUp,
	Home,
	MapPin,
	SaveAllIcon,
} from "lucide-react";
import PhotosUploader from "./PhotosUploader";
import { MarkdownEditor, MarkdownEditor2 } from "./ui/MarkdownEditor";
import { PreviewToggle } from "./PreviewToggle";
import { TimePicker } from "./ui/TimePicker";

const NewPlace = () => {
	const { user } = useUserContext();
	const { id } = useParams();
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

	const photosPlaceholder = [
		{
			image: "https://placehold.co/600x400",
		},
		{
			image: "https://placehold.co/200x200",
		},
		{
			image: "https://placehold.co/200x200",
		},
	];

	console.log(id);

	useEffect(() => {
		if (id) {
			const axiosGet = async () => {
				const { data } = await axios.get(`/places/${id}`);

				setTitle(data.title);
				setCity(data.city);
				setPhotos(data.photos);
				setDescription(data.description);
				setExtras(data.extras);
				setPrice(data.price);
				setPerks(data.perks);
				setCheckin(data.checkin);
				setCheckout(data.checkout);
				setGuests(data.guests);
			};

			axiosGet();
		}
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (
			title &&
			city &&
			extras &&
			photos.length > 0 &&
			description &&
			price &&
			checkin &&
			checkout &&
			guests
		) {
			if (id) {
				try {
					const modifiedPlace = await axios.put(`/places/${id}`, {
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
					showMessage("Sua acomodação foi atualizada com sucesso!", "success");
				} catch (error) {
					console.log("Erro ao enviar o formulário: ", JSON.stringify(error));
					showMessage("Deu erro ao atualizar a acomodação!", "error");
				}
			} else {
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
				} catch (error) {
					console.log("Erro ao enviar o formulário: ", JSON.stringify(error));
					showMessage(
						"Deu erro ao enviar formulário de nova acomodação!",
						"error",
					);
				}
			}

			setRedirect(true);
		} else {
			showMessage("Preencha todas as informações!", "warning");
		}
	};

	if (redirect) return <Navigate to="/account/places" />;

	const handlePageChange = () => {
		setRedirect(true);
	};

	const formData = {
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
	};

	return (
		<div className="relative w-full ">
			<div className="container__prev__form relative flex  rounded-2xl max-sm:px-4 max-w-7xl mx-auto flex-1 justify-between gap-5 h-full w-full">
				<form
					onSubmit={handleSubmit}
					className="container__form max-w-3xl pb-5 min-w-auto flex grow flex-col gap-10 w-full"
				>
					<div className="label__input text-start flex flex-col gap-4 w-full">
						<label
							htmlFor="title"
							className="text-2xl ml-2 font-medium text-gray-600"
						>
							Título
							<div className="text-sm font-normal">
								Título Informe o título da acomodação.
							</div>
						</label>
						<div className="group__input relative flex w-full justify-center items-center">
							<Home className="absolute left-4 text-gray-400 size-6" />
							<input
								id="title"
								type="text"
								placeholder="Digite o título do seu anúncio"
								className="border border-gray-300 px-14  py-4 rounded-2xl min-w-full outline-primary-400"
								value={title}
								onChange={(e) => {
									setTitle(e.target.value);
								}}
							/>
						</div>
					</div>
					<div className="label__input text-start flex flex-col gap-4 w-full">
						<label
							htmlFor="city"
							className="text-2xl ml-2 font-medium text-gray-600"
						>
							Cidade e Estado
							<div className="text-sm font-normal">
								Informe a cidade e o estado da acomodação.
							</div>
						</label>
						<div className="group__input relative flex justify-center items-center">
							<MapPin className="absolute left-4 text-gray-400 size-6" />
							<input
								id="city"
								type="text"
								placeholder="Digite o cidade e país do seu anúncio"
								className="border border-gray-300 px-14 py-4 rounded-2xl min-w-full outline-primary-400"
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

					<div className="label__input text-start justify-start flex flex-col  gap-5 w-full">
						<label
							htmlFor="description"
							className="text-2xl ml-2 font-medium text-gray-600"
						>
							Descrição
							<div className="text-sm font-normal">
								Descreva o espaço de forma clara, destacando o que ele oferece e
								o que o torna especial.
							</div>
						</label>
						<div classsame="group__input">
							<MarkdownEditor
								onChange={(descriptionText) => setDescription(descriptionText)}
								initialValue={description}
							/>
						</div>
					</div>
					<div className="label__input text-start flex flex-col  gap-5 w-full">
						<label
							htmlFor="perks"
							className="text-2xl ml-2 font-medium text-gray-600"
						>
							Comodidades
							<p className="text-sm font-normal">
								Selecione os items da comodidade
							</p>
						</label>

						<Perks perks={perks} setPerks={setPerks} />
					</div>
					<div className="label__input text-start flex flex-col gap-5 w-full">
						<label
							htmlFor="extras"
							className="text-2xl ml-2 font-medium text-gray-600"
						>
							Informações Extras
							<p className="text-sm font-normal">
								Descreva as informações extras da acomodação
							</p>
						</label>
						<div className="group__input relative w-full flex justify-start items-center">
							<MarkdownEditor2
								onChange={(extrasText) => setExtras(extrasText)}
								initialValue={extras}
							/>
						</div>
					</div>
					<h2 className="text-2xl text-start  ml-2 font-medium text-gray-600">
						Restrições e Preço
						<p className="text-sm font-normal">
							Defina o preço, horários de check-in e check-out e também o número
							máximo de hóspedes.
						</p>
					</h2>
					<div className="flex-col flex gap-4">
						<div className="flex items-center max-sm:flex-wrap  gap-4">
							<PriceInput
								id="price"
								className="max-sm:w-full flex-1"
								label="Preço por noite"
								placeholder="130,00"
								value={price}
								onChange={(e) => setPrice(e.target.value)}
							/>
							<div className="label__input text-start w-full flex-1 flex flex-col  gap-2">
								<GuestsInput
									id="guests"
									label="Número máximo de hóspedes"
									min={1}
									className="max-sm:w-full"
									max={20}
									value={guests}
									onChange={(e) => {
										setGuests(e.target.value);
									}}
								/>
							</div>
						</div>
						<div className="flex items-center max-sm:flex-wrap gap-4">
							<div className="label__input text-start w-full flex flex-col gap-2">
								<label
									htmlFor="checkin"
									className="text-[1rem] ml-2  font-medium text-gray-600"
								>
									Check-in
								</label>
								<div className="group__input relative flex w-full  justify-center items-center">
									<CalendarArrowUp className="absolute left-4 text-gray-400 size-5" />
									<TimePicker
										defaultValue="14:00"
										className="border border-gray-300 pl-10 pr-2.5 w-full py-3 rounded-2xl outline-primary-400"
										value={checkin}
										onChange={(e) => {
											setCheckin(e.target.value);
										}}
									/>
								</div>
							</div>
							<div className="label__input text-start  w-full flex flex-col gap-2 ">
								<label
									htmlFor="checkout"
									className="text-[1rem] ml-2  font-medium text-gray-600"
								>
									Check-out
								</label>
								<div className="group__input relative flex w-full justify-center items-center">
									<CalendarArrowDown className="absolute left-4 text-gray-400 size-5" />
									<TimePicker
										defaultValue="14:00"
										className="border border-gray-300 pl-10 w-full pr-2.5 py-3 rounded-2xl outline-primary-400"
										value={checkout}
										onChange={(e) => {
											setCheckout(e.target.value);
										}}
									/>
								</div>
							</div>
						</div>
					</div>
					<div className="flex items-center max-sm:justify-center max-sm:text-sm gap-5">
						<Link
							to="../account/profile"
							className="flex items-center gap-5 group hover:text-primary-500 transition-all"
							onClick={handlePageChange}
						>
							<ArrowLeft size={18} className="max-sm:size-4" /> Cancelar
						</Link>
						<button className="flex w-fit gap-4 max-sm:py-3 bg-primary-600 cursor-pointer hover:bg-primary-700 ease-in-out duration-300 text-white px-10 py-2.5 rounded-full">
							<SaveAllIcon className="max-sm:hidden" /> Salvar acomodação
						</button>
					</div>
				</form>
				{/* Preview */}
				{/* Toggle do preview */}

				<PreviewToggle formData={formData} />

				{/* Preview aparece somente quando showPreview for true */}
			</div>
		</div>
	);
};

export default NewPlace;
