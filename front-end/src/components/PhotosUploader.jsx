import axios from "axios";
import photoDefault from "../assets/photoDefault.jpg";
import { ArrowUpFromLine, Camera, Star, Trash } from "lucide-react";

const PhotosUploader = ({
	photolink,
	setPhotoLink,
	setPhotos,
	photos,
	showMessage,
}) => {
	// Função para validar se é uma imagem
	const isValidImageFile = (file) => {
		const validTypes = [
			"image/jpeg",
			"image/jpg",
			"image/png",
			"image/gif",
			"image/webp",
			"image/svg+xml",
		];
		const maxSize = 5 * 1024 * 1024; // 5MB

		if (!file) return false;

		if (!validTypes.includes(file.type)) {
			showMessage(
				"Formato de arquivo inválido! Use: JPG, PNG, GIF, WEBP ou SVG",
				"error"
			);
			return false;
		}

		if (file.size > maxSize) {
			showMessage("Arquivo muito grande! Tamanho máximo: 5MB", "error");
			return false;
		}

		return true;
	};

	// Função para validar URL de imagem
	const isValidImageUrl = (url) => {
		const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
		return imageExtensions.test(url);
	};

	const uploadByLink = async (e) => {
		e.preventDefault();

		if (!photolink || photolink.trim() === "") {
			showMessage("Por favor, insira um link válido!", "error");
			return;
		}

		if (!isValidImageUrl(photolink)) {
			showMessage("O link não parece ser uma imagem válida!", "warning");
		}

		try {
			const { data: filename } = await axios.post("/places/upload/link", {
				link: photolink,
			});

			if (filename) {
				setPhotos((prevValue) => [...prevValue, filename]);
				setPhotoLink(""); // Limpa o input após sucesso
				showMessage("Imagem adicionada com sucesso!", "success");
			} else {
				throw new Error("Nenhum arquivo retornado");
			}
		} catch (error) {
			showMessage("Erro ao enviar imagem!", "error");
			console.error("Erro ao enviar imagem:", error);

			// Usa foto padrão em caso de erro
			setPhotos((prevValue) => [...prevValue, photoDefault]);
		}
	};

	const uploadPhoto = async (e) => {
		const { files } = e.target;

		if (!files || files.length === 0) {
			showMessage("Nenhum arquivo selecionado!", "warning");
			return;
		}

		const filesArray = [...files];
		const formData = new FormData();
		let validFilesCount = 0;

		filesArray.forEach((file) => {
			if (isValidImageFile(file)) {
				formData.append("files", file);
				validFilesCount++;
			}
		});

		// Se nenhum arquivo válido foi encontrado, usa a foto padrão
		if (validFilesCount === 0) {
			showMessage(
				"Nenhuma imagem válida encontrada. Usando imagem padrão.",
				"warning"
			);
			setPhotos((prevValue) => [...prevValue, photoDefault]);
			return;
		}

		try {
			const { data: urlArray } = await axios.post("/places/upload", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			if (urlArray && urlArray.length > 0) {
				console.log("Imagens enviadas:", urlArray);
				setPhotos((prevValue) => [...prevValue, ...urlArray]);
				showMessage(
					`${urlArray.length} imagem(ns) enviada(s) com sucesso!`,
					"success"
				);
			} else {
				throw new Error("Nenhuma URL retornada");
			}

			// Limpa o input após o upload
			e.target.value = "";
		} catch (error) {
			showMessage("Erro ao enviar imagem!", "error");
			console.error("Erro ao enviar imagem para o S3:", error);

			// Usa foto padrão em caso de erro
			setPhotos((prevValue) => [...prevValue, photoDefault]);
		}
	};

	const deletePhoto = (fileUrl) => {
		if (!fileUrl) return;

		const newPhotos = photos.filter((photo) => photo !== fileUrl);
		setPhotos(newPhotos);
		showMessage("Imagem removida!", "info");
	};

	const promotePhoto = (fileUrl) => {
		if (!fileUrl || !photos.includes(fileUrl)) return;

		const newPhotos = [fileUrl, ...photos.filter((photo) => photo !== fileUrl)];
		setPhotos(newPhotos);
		showMessage("Imagem definida como principal!", "success");
	};

	return (
		<div className="label__input text-start flex flex-col gap-4 w-full">
			<label
				htmlFor="photos"
				className="text-2xl ml-2 font-medium text-gray-600"
			>
				Fotos
				<div className="text-sm font-normal">
					Envie as fotos da acomodação por links ou arquivos do seu dispositivo.
				</div>
			</label>
			<div className="group__input relative flex justify-center items-center group__link">
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
			<div className="mt-2 grid grid-cols-[repeat(auto-fit,_minmax(150px,_.3fr))] gap-5">
				{photos.length > 0 &&
					photos.map((photo, idx) => (
						<div key={idx} className="relative ">
							<img
								src={photo}
								alt={`Imagem ${idx + 1} do lugar`}
								className="aspect-square min-w-40 object-cover flex gap-2 justify-center items-center rounded-xl border border-gray-300 cursor-pointer hover:border-solid ease-in-out duration-300 hover:border-primary-300"
							/>

							<div className="actions__image absolute bottom-1 gap-1 flex right-1">
								<button
									onClick={(e) => {
										e.preventDefault();
										promotePhoto(photo);
									}}
									className="badge__action bg-white/70 rounded-[10px] p-1 cursor-pointer hover:bg-primary-200 transition-all duration-300 ease-in-out"
									title="Definir como foto principal"
								>
									<Star
										size={25}
										className={
											idx === 0 ? "fill-yellow-400 text-yellow-400" : ""
										}
									/>
								</button>
								<button
									onClick={(e) => {
										e.preventDefault();
										deletePhoto(photo);
									}}
									className="badge__action bg-white/70 rounded-[10px] p-1 cursor-pointer hover:bg-red-200 transition-all duration-300 ease-in-out"
									title="Remover foto"
								>
									<Trash size={25} />
								</button>
							</div>
						</div>
					))}
				<label
					htmlFor="file"
					className="aspect-square min-w-40 flex gap-2 justify-center items-center rounded-xl border-dashed border border-gray-300 cursor-pointer hover:border-solid ease-in-out duration-300 hover:border-primary-300"
				>
					<input
						type="file"
						id="file"
						className="hidden"
						onChange={uploadPhoto}
						multiple
						accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
					/>
					<ArrowUpFromLine className="opacity-80" />
					Upload
				</label>
			</div>
		</div>
	);
};

export default PhotosUploader;
