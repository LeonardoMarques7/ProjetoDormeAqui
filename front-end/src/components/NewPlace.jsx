import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link, Navigate, useParams } from "react-router-dom";

import { useUserContext } from "./contexts/UserContext";
import { useMessage } from "./contexts/MessageContext";

import { Skeleton } from "@/components/ui/skeleton";

import MarkdownIt from "markdown-it";

import Perks from "./Perks";

import lgThumbnail from "lightgallery/plugins/thumbnail";
import lgZoom from "lightgallery/plugins/zoom";
import lgFullscreen from "lightgallery/plugins/fullscreen";
import LightGallery from "lightgallery/react";
import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import "lightgallery/css/lg-fullscreen.css";

import "./NewPlace.css";

import {
	ArrowLeft,
	ArrowUpFromLine,
	CalendarArrowDown,
	CalendarArrowUp,
	Camera,
	ChevronLeftIcon,
	ChevronRight,
	DollarSign,
	Expand,
	ExternalLink,
	Eye,
	Home,
	ImagePlus,
	MapPin,
	Monitor,
	NotepadTextDashed,
	SaveAllIcon,
	Search,
	User,
	Users,
	Wifi,
} from "lucide-react";
import PhotosUploader from "./PhotosUploader";
import { useMoblieContext } from "./contexts/MoblieContext";
import { MarkdownEditor, MarkdownEditor2 } from "./ui/MarkdownEditor";
import Preview from "./Preview";
import { PreviewToggle } from "./PreviewToggle";

const NewPlace = () => {
	const { user } = useUserContext();
	const { moblie } = useMoblieContext();
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
	const lightGalleryRef = useRef(null);
	const [loaded, setLoaded] = useState([]);

	const handleImageLoad = (index) => {
		setLoaded((prev) => [...prev, index]);
	};

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
						"error"
					);
				}
			}

			setRedirect(true);
		} else {
			showMessage("Preencha todas as informações!", "warning");
		}
	};

	if (redirect) return <Navigate to="/account/places" />;

	const md = new MarkdownIt({
		html: false,
		breaks: true,
		linkify: true,
	});

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
			<div className="container__prev__form relative flex p-10 bg-white/80  rounded-2xl backdrop-blur-xl max-w-7xl mx-auto flex-1 justify-between gap-5 h-full w-full">
				<form
					onSubmit={handleSubmit}
					className="container__form pb-30 flex grow flex-col gap-10 w-full"
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
						<div className="group__input w-full relative flex justify-center items-center">
							<Home className="absolute left-4 text-gray-400 size-6" />
							<input
								id="title"
								type="text"
								placeholder="Digite o título do seu anúncio"
								className="border border-gray-300 px-14 py-4 rounded-2xl min-w-full outline-primary-400"
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
					<h2 className="text-2xl text-start ml-2 font-medium text-gray-600">
						Restrições e Preço
						<p className="text-sm font-normal">
							Defina o preço, horários de check-in e check-out e também o número
							máximo de hóspedes.
						</p>
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
									className="border border-gray-300 px-14 py-4 rounded-2xl min-w-full outline-primary-400"
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
									className="border border-gray-300 px-14 py-4 rounded-2xl min-w-full outline-primary-400"
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
									className="border border-gray-300 px-14 py-4 rounded-2xl min-w-full outline-primary-400"
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
								Nº Hóspedes
							</label>
							<div className="group__input relative flex justify-center items-center">
								<Users className="absolute left-4 text-gray-400 size-6" />
								<input
									id="guests"
									type="number"
									placeholder="4"
									className="border border-gray-300 px-14 py-4 rounded-2xl min-w-full outline-primary-400"
									value={guests}
									onChange={(e) => {
										setGuests(e.target.value);
									}}
								/>
							</div>
						</div>
					</div>
					<div className="flex items-center gap-5">
						<Link
							to="../account/profile"
							className="flex items-center gap-5 group hover:text-primary-500 transition-all"
							onClick={handlePageChange}
						>
							<ArrowLeft size={18} className="" /> Cancelar
						</Link>
						<button className="flex w-fit gap-4 bg-primary-600 cursor-pointer hover:bg-primary-700 ease-in-out duration-300 text-white px-10 py-2.5 rounded-full">
							<SaveAllIcon /> Salvar acomodação
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
