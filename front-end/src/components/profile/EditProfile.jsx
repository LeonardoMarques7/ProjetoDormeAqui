import { useState, useEffect } from "react";
import axios from "axios";
import { Link, Navigate } from "react-router-dom";
import { useMessage } from "@/components/contexts/MessageContext";
import { withMask } from "use-mask-input";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

import {
	ArrowLeft,
	Camera,
	ImagePlus,
	Mail,
	MapPin,
	Phone,
	Upload,
	User,
	Users,
} from "lucide-react";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";

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
	const [banner, setBanner] = useState(user.banner);
	const [occupation, setOccupation] = useState(user.occupation);
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
				setBanner(data.banner);
				setOccupation(data.occupation);
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

	const uploadBanner = async (e) => {
		const { files } = e.target;
		const file = files[0];

		if (!file) return;

		const formData = new FormData();
		formData.append("files", file);

		try {
			const { data: bannerUrl } = await axios.post(
				"/users/upload-banner",
				formData,
			);

			console.log("✅ Banner atualizado:", bannerUrl);

			setBanner(bannerUrl);
			showMessage("Banner atualizado com sucesso!", "success");
		} catch (error) {
			showMessage("Erro ao enviar banner!", "error");
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
						banner,
						phone,
						pronouns,
						city,
						bio,
						occupation,
					});
					setRedirect(true);
					showMessage(
						"Suas informações foram atualizadas com sucesso!",
						"success",
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
		<div className="bg-neutral-50 min-h-screen py-10">
			<div className="max-w-5xl mx-auto px-4">
				<div className="bg-white border border-neutral-200 shadow-sm rounded-3xl p-6 md:p-8 space-y-8">
					<div className="flex flex-col gap-2">
						<p className="text-xs uppercase tracking-[0.18em] text-primary-700">
							Conta
						</p>
						<h1 className="text-2xl md:text-3xl font-semibold text-neutral-900">
							Editar perfil
						</h1>
						<p className="text-neutral-600 text-sm md:text-base max-w-2xl">
							Atualize suas informações com um layout limpo, focado em
							legibilidade e rapidez para preencher.
						</p>
					</div>

					<form
						onSubmit={handleSubmit}
						className="space-y-8"
					>
						<div className="grid gap-4 md:gap-6 md:grid-cols-[1.2fr,1fr] items-start">
							<div className="flex flex-col gap-3">
								<p className="text-sm font-medium text-neutral-800">Foto</p>
								<p className="text-sm text-neutral-500">
									Use uma imagem nítida e centrada. Formatos JPG ou PNG.
								</p>
								<div className="flex items-center gap-4">
									<div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100">
										{photo ? (
											<img
												src={photo}
												className="w-full h-full object-cover"
												alt={name}
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center text-lg font-semibold text-neutral-500">
												{name?.charAt(0)}
											</div>
										)}
									</div>
									<label className="flex-1">
										<input
											type="file"
											id="file"
											className="hidden"
											onChange={uploadPhoto}
											accept="image/*"
										/>
										<div className="w-full inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-800 hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer">
											<Camera size={18} className="text-neutral-500" />
											<span>Selecionar nova foto</span>
											<Upload size={16} className="ml-auto text-neutral-400" />
										</div>
									</label>
								</div>
							</div>

							<div className="flex flex-col gap-3">
								<p className="text-sm font-medium text-neutral-800">Banner</p>
								<p className="text-sm text-neutral-500">
									Adicione um banner panorâmico. Tamanho recomendado 1600x600.
								</p>
								<div className="space-y-2">
									<div className="relative rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 aspect-[16/6]">
										{banner ? (
											<img
												src={banner}
												className="w-full h-full object-cover"
												alt="Banner do perfil"
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center text-sm text-neutral-500">
												Prévia do banner
											</div>
										)}
									</div>
									<label className="w-full inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-800 hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer">
										<input
											type="file"
											id="banner"
											className="hidden"
											onChange={uploadBanner}
											accept="image/*"
										/>
										<ImagePlus size={18} className="text-neutral-500" />
										<span>Enviar novo banner</span>
										<Upload size={16} className="ml-auto text-neutral-400" />
									</label>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
							<div className="flex flex-col gap-2">
								<label className="text-sm font-semibold text-neutral-800">
									Nome completo
								</label>
								<input
									id="name"
									type="text"
									placeholder="Digite o seu nome"
									className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100 transition"
									value={name}
									onChange={(e) => setName(e.target.value)}
								/>
							</div>

							<div className="flex flex-col gap-2">
								<label className="text-sm font-semibold text-neutral-800">
									Pronomes <span className="text-neutral-400">(Opcional)</span>
								</label>
								<div className="relative">
									<select
										value={pronouns}
										onChange={(e) => setPronouns(e.target.value)}
										className="w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 pr-10 text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100 transition cursor-pointer"
									>
										<option value="" disabled>
											Selecione uma opção
										</option>
										<option value="Ele/Dele">Ele/Dele</option>
										<option value="Ela/Dela">Ela/Dela</option>
										<option value="Elu/Delu">Elu/Delu</option>
										<option value="Outro">Outro</option>
										<option value="Prefiro não dizer">Prefiro não dizer</option>
									</select>
									<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
										<svg
											className="h-5 w-5 text-neutral-400"
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

							<div className="flex flex-col gap-2">
								<label className="text-sm font-semibold text-neutral-800">
									Ocupação <span className="text-neutral-400">(Opcional)</span>
								</label>
								<input
									id="occupation"
									type="text"
									placeholder="Ex.: Designer, Estudante de TI"
									className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100 transition"
									value={occupation}
									onChange={(e) => setOccupation(e.target.value)}
								/>
							</div>

							<div className="flex flex-col gap-2">
								<label className="text-sm font-semibold text-neutral-800">
									E-mail
								</label>
								<div className="relative">
									<Mail className="absolute left-3 top-3 text-neutral-400" size={18} />
									<input
										id="email"
										type="email"
										placeholder="Digite seu e-mail"
										className="w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100 transition"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
									/>
								</div>
							</div>

							<div className="flex flex-col gap-2">
								<label className="text-sm font-semibold text-neutral-800">
									Telefone
								</label>
								<div className="relative">
									<Phone className="absolute left-3 top-3 text-neutral-400" size={18} />
									<input
										id="phone"
										type="phone"
										placeholder="(99) 99999-9999"
										className="w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100 transition"
										value={phone}
										ref={withMask("(99) 99999-9999")}
										onChange={(e) => setPhone(e.target.value)}
									/>
								</div>
							</div>

							<div className="flex flex-col gap-2">
								<label className="text-sm font-semibold text-neutral-800">
									Cidade e estado
								</label>
								<div className="relative">
									<MapPin className="absolute left-3 top-3 text-neutral-400" size={18} />
									<input
										id="city"
										type="text"
										placeholder="Ex.: São Paulo, SP"
										className="w-full rounded-xl border border-neutral-200 bg-neutral-50 pl-10 pr-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100 transition"
										value={city}
										onChange={(e) => setCity(e.target.value)}
									/>
								</div>
							</div>
						</div>

						<div className="space-y-3">
							<label className="text-sm font-semibold text-neutral-800">
								Bio
							</label>
							<p className="text-sm text-neutral-500">
								Conte quem você é, interesses e o que seus hóspedes podem
								esperar. Seja claro e objetivo.
							</p>
							<div className="rounded-2xl border border-neutral-200 overflow-hidden bg-neutral-50">
								<MarkdownEditor
									onChange={(BioText) => setBio(BioText)}
									initialValue={bio}
								/>
							</div>
						</div>

						<div className="flex items-center gap-4">
							<Link
								to="../account/profile"
								className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 transition-colors"
								onClick={handlePageChange}
							>
								<ArrowLeft size={16} /> Cancelar
							</Link>
							<InteractiveHoverButton className="w-fit flex px-5 py-2 text-sm font-semibold">
								Salvar alterações
							</InteractiveHoverButton>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default EditProfile;
