import axios from "axios";

import { ArrowUpFromLine, Camera, Star, Trash } from "lucide-react";

const PhotosUploader = ({
	photolink,
	setPhotoLink,
	setPhotos,
	photos,
	showMessage,
}) => {
	const uploadByLink = async (e) => {
		e.preventDefault();

		if (photolink) {
			const { data: filename } = await axios.post("/places/upload/link", {
				link: photolink,
			});

			setPhotos((prevValue) => [...prevValue, filename]);
		} else {
			showMessage("Erro ao enviar imagem!", "error");
			console.error("Erro ao enviar imagem para o S3", JSON.stringify(e));
		}
	};

	const uploadPhoto = async (e) => {
		const { files } = e.target;
		const filesArray = [...files];

		const formData = new FormData();

		filesArray.forEach((file) => formData.append("files", file));

		try {
			const { data: urlArray } = await axios.post("/places/upload", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			console.log(urlArray);
			setPhotos((prevValue) => [...prevValue, ...urlArray]);
		} catch (error) {
			showMessage("Erro ao enviar imagem!", "error");
			console.error("Erro ao enviar imagem para o S3", JSON.stringify(e));
		}
	};

	const deletePhoto = (fileUrl) => {
		const newPhotos = photos.filter((photo) => photo !== fileUrl);

		setPhotos(newPhotos);
	};

	const promotePhoto = (fileUrl) => {
		const newPhotos = [fileUrl, ...photos.filter((photo) => photo !== fileUrl)];

		setPhotos(newPhotos);
	};

	return (
		<div className="label__input text-start flex flex-col gap-2 w-full">
			<label
				htmlFor="photos"
				className="text-2xl ml-2 font-medium text-gray-600"
			>
				Fotos
			</label>
			<div className="group__input   relative flex justify-center items-center group__link">
				<Camera className="camera__icon absolute left-4 text-gray-400 size-6" />
				<input
					type="text"
					id="photoLink"
					placeholder="Adicione a(s) foto(s)"
					className="border border-gray-300 px-14 py-4 rounded-2xl min-w-full outline-primary-400"
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
				{photos.map((photo, idx) => (
					<div className="relative">
						<img
							key={idx}
							src={`${photo}`}
							alt="Imagem do Lugar"
							className="aspect-square min-w-40 flex gap-2 justify-center items-center rounded-xl border-dashed border-1 border-gray-300 cursor-pointer hover:border-solid ease-in-out duration-300 hover:border-primary-300"
						/>

						<div className="actions__image absolute bottom-1 gap-1 flex right-1">
							<span
								onClick={() => promotePhoto(photo)}
								className="badge__action bg-white/70 rounded-[10px] p-1 cursor-pointer hover:bg-primary-200  transition-all duration-300 ease-in-out"
							>
								<Star size={25} />
							</span>
							<span
								onClick={() => deletePhoto(photo)}
								className="badge__action bg-white/70 rounded-[10px] p-1 cursor-pointer hover:bg-primary-200  transition-all duration-300 ease-in-out"
							>
								<Trash size={25} />
							</span>
						</div>
					</div>
				))}
				<label
					htmlFor="file"
					className="aspect-square min-w-40 flex gap-2 justify-center items-center rounded-xl border-dashed border-1 border-gray-300 cursor-pointer hover:border-solid ease-in-out duration-300 hover:border-primary-300"
				>
					<input
						type="file"
						id="file"
						className="hidden"
						onChange={uploadPhoto}
						multiple
					/>
					<ArrowUpFromLine className="opacity-80" />
					Upload
				</label>
			</div>
		</div>
	);
};

export default PhotosUploader;
