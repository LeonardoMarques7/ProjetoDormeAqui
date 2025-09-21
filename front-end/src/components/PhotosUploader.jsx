import axios from "axios";
import React from "react";

import { ArrowUpFromLine, Camera } from "lucide-react";

const PhotosUploader = ({ photolink, setPhotoLink, setPhotos, photos }) => {
	const uploadByLink = async (e) => {
		e.preventDefault();

		if (photolink) {
			const { data: filename } = await axios.post("/places/upload/link", {
				link: photolink,
			});

			setPhotos((prevValue) => [...prevValue, filename]);
		} else {
			alert("Não existe nenhum link a ser enviado!");
		}
	};

	return (
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
					id="photoLink"
					placeholder="Adicione a(s) foto(s)"
					className="border border-gray-200 px-14 py-4 rounded-2xl w-full outline-primary-400"
					value={photolink}
					onChange={(e) => setPhotoLink(e.target.value)}
				/>
				<button
					onClick={uploadByLink}
					className="absolute right-2 w-fit bg-primary-400 rounded-xl px-5 py-2.5 text-white cursor-pointer hover:bg-primary-500 ease-in-out duration-300"
				>
					Enviar foto
				</button>
			</div>
			<div className="mt-2 grid grid-cols-[repeat(auto-fit,_minmax(150px,_1fr))] gap-5">
				{photos.map((photo) => (
					<img
						key={photo}
						src={`${axios.defaults.baseURL}/tmp/${photo}`}
						alt="Imagem do Lugar"
						className="aspect-square min-w-40 flex gap-2 justify-center items-center rounded-xl border-dashed border-1 border-gray-300 cursor-pointer hover:border-solid ease-in-out duration-300 hover:border-primary-300"
					/>
				))}
				<label
					htmlFor="file"
					className="aspect-square min-w-40 flex gap-2 justify-center items-center rounded-xl border-dashed border-1 border-gray-300 cursor-pointer hover:border-solid ease-in-out duration-300 hover:border-primary-300"
				>
					<input type="file" id="file" className="hidden" />
					<ArrowUpFromLine className="opacity-80" />
					Upload
				</label>
			</div>
		</div>
	);
};

export default PhotosUploader;
