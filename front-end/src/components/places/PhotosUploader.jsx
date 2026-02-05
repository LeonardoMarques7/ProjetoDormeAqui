import axios from "axios";
import { useState } from "react";
import photoDefault from "@/assets/photoDefault.jpg";
import { ArrowUpFromLine, Camera, Star, Trash } from "lucide-react";

const PhotosUploader = ({
	photolink,
	setPhotoLink,
	setPhotos,
	photos,
	showMessage,
}) => {
	const [draggedIndex, setDraggedIndex] = useState(null);
	const [dragOverIndex, setDragOverIndex] = useState(null);
	const [imageErrors, setImageErrors] = useState({});

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
		const validExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff|jfif)$/i;
		const maxSize = 5 * 1024 * 20000; // 5MB

		if (!file) return false;

		// Check file type first
		if (validTypes.includes(file.type)) {
			if (file.size > maxSize) {
				showMessage("Arquivo muito grande! Tamanho máximo: 5MB", "error");
				return false;
			}
			return true;
		}

		// Fallback: check file extension if type is not recognized
		if (validExtensions.test(file.name)) {
			if (file.size > maxSize) {
				showMessage("Arquivo muito grande! Tamanho máximo: 5MB", "error");
				return false;
			}
			return true;
		}

		showMessage(
			"Formato de arquivo inválido! Use: JPG, PNG, GIF, WEBP ou SVG",
			"error",
		);
		return false;
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
		}
	};

	const uploadPhoto = async (files) => {
		if (!files || files.length === 0) {
			showMessage("Nenhum arquivo selecionado!", "warning");
			return;
		}

		// Convert FileList to array if needed
		const filesArray = Array.from(files);
		const formData = new FormData();
		let validFilesCount = 0;

		filesArray.forEach((file) => {
			if (isValidImageFile(file)) {
				formData.append("files", file);
				validFilesCount++;
			}
		});

		// Se nenhum arquivo válido foi encontrado
		if (validFilesCount === 0) {
			return;
		}

		try {
			const { data: urlArray } = await axios.post("/places/upload", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			if (urlArray && urlArray.length > 0) {
				setPhotos((prevValue) => [...prevValue, ...urlArray]);
				showMessage(
					`${urlArray.length} imagem(ns) enviada(s) com sucesso!`,
					"success",
				);
			} else {
				throw new Error("Nenhuma URL retornada");
			}
		} catch (error) {
			showMessage("Erro ao enviar imagem!", "error");
			console.error("Erro ao enviar imagem para o S3:", error);
		}
	};

	const deletePhoto = (index) => {
		const newPhotos = photos.filter((_, i) => i !== index);
		setPhotos(newPhotos);
		showMessage("Imagem removida!", "info");
	};

	const promotePhoto = (fileUrl) => {
		if (!fileUrl || !photos.includes(fileUrl)) return;

		const newPhotos = [fileUrl, ...photos.filter((photo) => photo !== fileUrl)];
		setPhotos(newPhotos);
		showMessage("Imagem definida como principal!", "success");
	};

	const handleDragStart = (e, index) => {
		setDraggedIndex(index);
		e.dataTransfer.effectAllowed = "move";
		e.dataTransfer.setDragImage(new Image(), 0, 0);
	};

	const handleDragOver = (e, index) => {
		e.preventDefault();
		setDragOverIndex(index);
	};

	const handleDrop = (e, dropIndex) => {
		e.preventDefault();
		const dragIndex = draggedIndex;

		if (dragIndex === null || dragIndex === dropIndex) return;

		const newPhotos = [...photos];
		const draggedPhoto = newPhotos[dragIndex];
		newPhotos.splice(dragIndex, 1);
		newPhotos.splice(dropIndex, 0, draggedPhoto);

		// Update imageErrors to match the new photo positions
		const newImageErrors = {};
		newPhotos.forEach((photo, index) => {
			const oldIndex = photos.findIndex((p) => p === photo);
			if (imageErrors[oldIndex]) {
				newImageErrors[index] = true;
			}
		});

		setPhotos(newPhotos);
		setImageErrors(newImageErrors);
		setDraggedIndex(null);
		setDragOverIndex(null);
		showMessage("Ordem das fotos atualizada!", "success");
	};

	const handleDragEnd = () => {
		setDraggedIndex(null);
		setDragOverIndex(null);
	};

	const handleImageError = (index) => {
		setImageErrors((prev) => ({ ...prev, [index]: true }));
	};

	const getImageSrc = (index) => {
		return imageErrors[index] ? photoDefault : photos[index] || photoDefault;
	};

	return (
		<div className="label__input text-start flex flex-col gap-4 w-full">
			<label
				htmlFor="photos"
				className="text-2xl ml-2 font-medium text-gray-600"
			>
				Fotos
				<div className="text-sm font-normal">
					Envie fotos por link ou arquivo. Arraste para ordenar.
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
			<p className="text-gray-500 -mt-1 text-xs ml-1">SVG, PNG, JPG or GIF</p>
			<div className="mt-2 grid grid-cols-3  gap-5">
				{photos.length > 0 &&
					photos.map((photo, idx) => (
						<div
							key={idx}
							className={`relative rounded-2xl cursor-grab w-full ${draggedIndex === idx ? "opacity-50 cursor-grabbing" : ""} ${dragOverIndex === idx ? "cursor-grabbing border-2 border-primary-500" : ""}`}
							draggable
							onDragStart={(e) => handleDragStart(e, idx)}
							onDragOver={(e) => handleDragOver(e, idx)}
							onDrop={(e) => handleDrop(e, idx)}
							onDragEnd={handleDragEnd}
						>
							<img
								src={getImageSrc(idx)}
								alt={`Imagem ${idx + 1} do lugar`}
								className="aspect-square object-cover flex gap-2 justify-center items-center rounded-xl border border-gray-300 hover:border-solid ease-in-out duration-300 hover:border-primary-300"
								onError={() => handleImageError(idx)}
							/>

							<div className="actions__image absolute bottom-1 gap-1 flex right-1">
								<button
									onClick={(e) => {
										e.preventDefault();
										deletePhoto(idx);
									}}
									className="badge__action bg-white/70 rounded-[10px] p-1 cursor-pointer hover:bg-red-200 transition-all duration-300 ease-in-out"
									title="Remover foto"
								>
									<Trash size={25} />
								</button>
							</div>
						</div>
					))}
				<div
					className="aspect-square min-w-40 flex gap-2 justify-center items-center rounded-xl border-dashed border border-gray-300 cursor-pointer hover:border-solid ease-in-out duration-300 hover:border-primary-300"
					onDragOver={(e) => {
						e.preventDefault();
					}}
					onDrop={(e) => {
						e.preventDefault();
						const files = e.dataTransfer.files;
						console.log("Drag and drop files:", files);
						if (files.length > 0) {
							uploadPhoto(files);
						}
					}}
				>
					<label htmlFor="file">
						<ArrowUpFromLine className="opacity-80" />
						Upload
					</label>
					<input
						type="file"
						id="file"
						className="hidden"
						onChange={(e) => uploadPhoto(e.target.files)}
						multiple
						accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
					/>
				</div>
			</div>
		</div>
	);
};

export default PhotosUploader;
