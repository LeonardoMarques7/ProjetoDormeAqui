import {
	ArrowUpFromLine,
	Camera,
	Home,
	MapPin,
	NotepadTextDashed,
	Wifi,
} from "lucide-react";

import { useState } from "react";
import Perks from "./Perks";

const NewPlace = () => {
	const [title, setTitle] = useState("");
	const [city, setCity] = useState("");
	const [photos, setPhotos] = useState("");
	const [description, setDescription] = useState("");
	const [message, setMessage] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();
	};

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
								if (message) setMessage("");
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
								if (message) setMessage("");
							}}
						/>
					</div>
				</div>
				<div className="label__input text-start flex flex-col gap-2 w-full">
					<label
						htmlFor="photos"
						className="text-2xl ml-2 font-medium text-gray-600"
					>
						Fotos
					</label>
					<div className="group__input relative flex justify-center items-center">
						<Camera className="absolute left-4 text-gray-400 size-6" />
						<input
							type="text"
							id="photos"
							placeholder="Adicione a(s) foto(s)"
							className="border border-gray-200 px-14 py-4 rounded-2xl w-full outline-primary-400"
							value={photos}
							onChange={(e) => {
								setPhotos(e.target.value);
								if (message) setMessage("");
							}}
						/>
						<button className="absolute right-2 w-fit bg-primary-400 rounded-xl px-5 py-2.5 text-white cursor-pointer hover:bg-primary-500 ease-in-out duration-300">
							Enviar foto
						</button>
					</div>
					<div className="mt-2 grid grid-cols-4 gap-5">
						<label
							htmlFor="file"
							className="aspect-square flex gap-2 justify-center items-center rounded-xl border-dashed border-1 border-gray-300 cursor-pointer hover:border-solid ease-in-out duration-300 hover:border-primary-300"
						>
							<input type="file" id="file" className="hidden" />
							<ArrowUpFromLine className="opacity-80" />
							Upload
						</label>
					</div>
				</div>
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
								if (message) setMessage("");
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
					<Perks />
				</div>
				{message && (
					<div className="text-red-500 text-center mt-2">{message}</div>
				)}
			</form>
		</>
	);
};

export default NewPlace;
