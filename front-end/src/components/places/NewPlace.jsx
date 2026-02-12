import axios from "axios";
import { useState, useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { PriceInput } from "@/components/ui/PriceInput";

import { useMessage } from "@/components/contexts/MessageContext";
import { GuestsInput } from "@/components/ui/GuestsInput";

import { useUserContext } from "@/components/contexts/UserContext";

import Perks from "@/components/common/Perks";

import "lightgallery/css/lightgallery.css";
import "lightgallery/css/lg-zoom.css";
import "lightgallery/css/lg-thumbnail.css";
import "lightgallery/css/lg-fullscreen.css";

import "@/components/places/NewPlace.css";

import {
	ArrowLeft,
	CalendarArrowDown,
	CalendarArrowUp,
	Home,
	MapPin,
	SaveAllIcon,
} from "lucide-react";
import PhotosUploader from "@/components/places/PhotosUploader";
import {
	MarkdownEditor,
	MarkdownEditor2,
} from "@/components/ui/MarkdownEditor";
import { TimePicker } from "@/components/ui/TimePicker";
import { useAuthModalContext } from "@/components/contexts/AuthModalContext";
import Preview from "@/components/places/Preview";

const NewPlace = () => {
	const { user, ready } = useUserContext();
	const { id } = useParams();
	const { showMessage } = useMessage();
	const { showAuthModal } = useAuthModalContext();
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
	const [currentStep, setCurrentStep] = useState(1);
	const totalSteps = 7;

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

	if (ready && !user) {
		return <Navigate to="/" />;
	}

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

	const handleNext = () => {
		if (currentStep < totalSteps) {
			setCurrentStep(currentStep + 1);
		}
	};

	const handleBack = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		}
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
		<div className="min-h-screen bg-white flex flex-col pb-5">
			{/* Step Content */}
			<div className="flex-1 flex items-center justify-start px-4">
				<div className="max-w-2xl w-full">
					{currentStep === 1 && (
						<div className="space-y-8">
							<div className="text-start">
								<h1 className="text-3xl font-semibold text-gray-800 mb-2">
									Informações básicas
								</h1>
								<p className="text-gray-600">
									Dê um título atraente e informe a localização da sua
									acomodação.
								</p>
							</div>
							<div className="space-y-6">
								<div className="space-y-2">
									<label className="block text-lg font-medium text-gray-700">
										Título
									</label>
									<div className="relative">
										<Home className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 size-6" />
										<input
											type="text"
											placeholder="Digite o título do seu anúncio"
											className="w-full pl-14 pr-4 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400"
											value={title}
											onChange={(e) => setTitle(e.target.value)}
										/>
									</div>
								</div>
								<div className="space-y-2">
									<label className="block text-lg font-medium text-gray-700">
										Cidade e Estado
									</label>
									<div className="relative">
										<MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 size-6" />
										<input
											type="text"
											placeholder="Digite a cidade e estado"
											className="w-full pl-14 pr-4 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400"
											value={city}
											onChange={(e) => setCity(e.target.value)}
										/>
									</div>
								</div>
							</div>
						</div>
					)}

					{currentStep === 2 && (
						<div className="space-y-8">
							<div className="text-start">
								<h1 className="text-3xl font-semibold text-gray-800 mb-2">
									Fotos da acomodação
								</h1>
								<p className="text-gray-600">
									Adicione fotos de alta qualidade para atrair mais hóspedes.
								</p>
							</div>
							<PhotosUploader
								{...{ photolink, setPhotoLink, photos, setPhotos, showMessage }}
							/>
						</div>
					)}

					{currentStep === 3 && (
						<div className="space-y-8">
							<div className="text-start">
								<h1 className="text-3xl font-semibold text-gray-800 mb-2">
									Descrição do espaço
								</h1>
								<p className="text-gray-600">
									Descreva o espaço de forma clara, destacando o que ele
									oferece.
								</p>
							</div>
							<MarkdownEditor
								onChange={(descriptionText) => setDescription(descriptionText)}
								initialValue={description}
							/>
						</div>
					)}

					{currentStep === 4 && (
						<div className="space-y-8">
							<div className="text-start">
								<h1 className="text-3xl font-semibold text-gray-800 mb-2">
									Comodidades
								</h1>
								<p className="text-gray-600">
									Selecione as comodidades disponíveis na sua acomodação.
								</p>
							</div>
							<Perks perks={perks} setPerks={setPerks} />
						</div>
					)}

					{currentStep === 5 && (
						<div className="space-y-8">
							<div className="text-start">
								<h1 className="text-3xl font-semibold text-gray-800 mb-2">
									Informações extras
								</h1>
								<p className="text-gray-600">
									Adicione regras, horários e outras informações importantes.
								</p>
							</div>
							<MarkdownEditor2
								onChange={(extrasText) => setExtras(extrasText)}
								initialValue={extras}
							/>
						</div>
					)}

					{currentStep === 6 && (
						<div className="space-y-8">
							<div className="text-start">
								<h1 className="text-3xl font-semibold text-gray-800 mb-2">
									Preço e capacidade
								</h1>
								<p className="text-gray-600">
									Defina o preço, horários e número máximo de hóspedes.
								</p>
							</div>
							<div className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<PriceInput
										label="Preço por noite"
										placeholder="130,00"
										value={price}
										onChange={(e) => setPrice(e.target.value)}
									/>
									<GuestsInput
										label="Número máximo de hóspedes"
										min={1}
										max={20}
										value={guests}
										onChange={(e) => setGuests(e.target.value)}
									/>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<label className="block text-lg font-medium text-gray-700">
											Check-in
										</label>
										<div className="relative">
											<CalendarArrowUp className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
											<TimePicker
												className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400"
												value={checkin}
												onChange={(e) => setCheckin(e.target.value)}
											/>
										</div>
									</div>
									<div className="space-y-2">
										<label className="block text-lg font-medium text-gray-700">
											Check-out
										</label>
										<div className="relative">
											<CalendarArrowDown className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 size-5" />
											<TimePicker
												className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400"
												value={checkout}
												onChange={(e) => setCheckout(e.target.value)}
											/>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}

					{currentStep === 7 && (
						<div className="space-y-8">
							<div className="text-start">
								<h1 className="text-3xl font-semibold text-gray-800 mb-2">
									Revisão final
								</h1>
								<p className="text-gray-600">
									Confira todas as informações antes de publicar.
								</p>
							</div>
							<Preview data={formData} />
							<form onSubmit={handleSubmit} className="flex justify-center">
								<button
									type="submit"
									className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-full font-medium transition-colors"
								>
									<SaveAllIcon className="inline mr-2" />
									Salvar acomodação
								</button>
							</form>
						</div>
					)}
				</div>
			</div>

			{/* Progress Bar and Navigation */}
			<div className="">
				{/* Progress Bar */}
				<div className="flex w-full h-2 gap-2  mb-4">
					<div
						className={`h-full transition-all duration-300 ${currentStep >= 1 ? "bg-primary-600" : "bg-gray-100"}`}
						style={{ width: "33.33%" }}
					></div>
					<div
						className={`h-full transition-all duration-300 ${currentStep >= 3 ? "bg-primary-600" : "bg-gray-100"}`}
						style={{ width: "33.33%" }}
					></div>
					<div
						className={`h-full transition-all duration-300 ${currentStep >= 5 ? "bg-primary-600" : "bg-gray-100"}`}
						style={{ width: "33.34%" }}
					></div>
				</div>
				<div className="max-w-2xl mx-auto flex justify-between items-center">
					<button
						onClick={currentStep === 1 ? handlePageChange : handleBack}
						className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
					>
						{currentStep === 1 ? "Cancelar" : "Voltar"}
					</button>
					{currentStep < totalSteps && (
						<button
							onClick={handleNext}
							className="bg-primary-700 hover:bg-primary-900 cursor-pointer text-white px-6 py-2 rounded-full font-medium transition-colors"
						>
							Próximo
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default NewPlace;
