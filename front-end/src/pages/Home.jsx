import { useEffect, useState } from "react";
import Item from "../components/Item";
import axios from "axios";
import { CalendarIcon, Eraser, MapPin, Search, X } from "lucide-react";
import { format, isBefore, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";

import "./Home.css";

const Home = () => {
	const [searchInput, setSearchInput] = useState("");
	const [city, setCity] = useState("");
	const [places, setPlaces] = useState([]);
	const [placesSearch, setPlacesSearch] = useState([]);
	const [price, setPrice] = useState("");
	const [checkin, setCheckin] = useState("");
	const [checkout, setCheckout] = useState("");

	const handleCheckin = (date) => {
		setCheckin(date);
		// Se já tinha checkout selecionado mas é antes do novo checkin → reseta checkout
		if (checkout && isBefore(checkout, date)) {
			setCheckout(null);
			showMessage("Insira uma data válida!", "error");
		} else {
		}
	};

	const handleCheckout = (date) => {
		if (checkin && isBefore(date, checkin)) {
			showMessage("Insira uma data válida!", "error");
			return;
		}
		setCheckout(date);
	};

	// state separado para o texto digitado e para o termo que realmente pesquisa

	const fetchPlaces = async () => {
		const { data } = await axios.get("/places");
		setPlaces(data);
	};

	useEffect(() => {
		// carrega todos inicialmente
		fetchPlaces();
	}, []);

	const normalize = (str) =>
		str
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.toLowerCase();

	const handleSearch = async (e) => {
		e.preventDefault();
		setCity(searchInput); // só atualiza a label exibida

		try {
			const { data } = await axios.get(
				`/places?city=${normalize(searchInput)}`
			);
			setPlacesSearch(data);
		} catch (err) {
			console.error("Erro na busca:", err);
		}
	};

	const limparPesquisa = (e) => {
		e.preventDefault();
		setCity("");
	};

	return (
		<>
			<div className="container__header p-8 w-full bg-primary-500 mb-15 relative h-[50svh] flex-col text-white flex justify-center items-center text-center">
				<div className="titles flex flex-col gap-5">
					<h1 className="text-5xl font-bold">Encontre seu lugar perfeito</h1>
					<p className="text-lg">
						Descubra acomodações únicas para sua próxima viagem
					</p>
				</div>
				<div className="container__bg__form bg-white absolute -bottom-12 p-4 px-8 shadow-xl rounded-2xl mt-4">
					<form onSubmit={handleSearch}>
						<div className="form__container flex items-center gap-2">
							<div className="group__input relative flex justify-center items-center">
								<MapPin className="absolute left-4 text-gray-400 size-6" />
								<input
									id="city"
									type="text"
									placeholder="Cidade ou Estado"
									className="border border-gray-200 px-14 py-4 rounded-2xl w-full text-gray-400 outline-primary-400"
									value={searchInput}
									onChange={(e) => setSearchInput(e.target.value)}
								/>
							</div>
							{/* Checkin */}
							<div className=" ">
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn(
												"btn__date justify-start text-left font-normal relative border border-gray-200 !px-14 !py-4 h-full rounded-2xl text-gray-400 outline-primary-400 ",
												!checkin && "text-muted-foreground"
											)}
										>
											<CalendarIcon className="absolute left-4 text-gray-400 size-6" />
											{checkin ? (
												format(checkin, "dd/MM/yyyy")
											) : (
												<span className="text-sm">Check-in</span>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={checkin}
											onSelect={handleCheckin}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
							</div>
							{/* Check-out */}
							<div className="py-2">
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn(
												"btn__date justify-start text-left font-normal relative border border-gray-200 !px-14 !py-4 h-full rounded-2xl text-gray-400 outline-primary-400",
												!checkout && "text-muted-foreground"
											)}
										>
											<CalendarIcon className="absolute left-4 text-gray-400 size-6" />
											{checkout ? (
												format(checkout, "dd/MM/yyyy")
											) : (
												<span>Check-out</span>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={checkout}
											onSelect={handleCheckout}
											initialFocus
										/>
									</PopoverContent>
								</Popover>
							</div>
							<Button
								type="submit"
								variant="outline"
								className="btn__submit justify-start text-left font-normal border bg-primary-500 hover:bg-primary-600/90 cursor-pointer hover:text-white border-gray-200 !px-14 !py-4 h-full rounded-2xl text-white outline-primary-400"
							>
								<Search className="mr-2 h-4 w-4" />
								<span>Buscar</span>
							</Button>
						</div>
					</form>
				</div>
			</div>
			{city ? (
				placesSearch.length > 0 ? (
					// Caso 3: pesquisou e encontrou
					<div className="mx-auto mb-5 font-medium max-w-full gap-2 w-full flex justify-between items-center px-8 lg:max-w-7xl text-2xl text-start pt-5">
						<span>
							Buscando por <strong className="text-primary-500">{city}</strong>{" "}
							e foi encontrado{" "}
							{placesSearch.length > 1
								? `${placesSearch.length} resultados`
								: `${placesSearch.length} resultado`}
							.
						</span>
						<button
							onClick={limparPesquisa}
							className=" flex items-center cursor-pointer border border-transparent hover:border-red-500  transition-all gap-2 !text-lg  text-red-500  p-2.5 px-5 rounded-2xl"
						>
							<Eraser /> Limpar pesquisa
						</button>
					</div>
				) : (
					// Caso 2: pesquisou mas não encontrou
					<>
						<div className="mx-auto  max-w-full w-full gap-2 flex justify-between items-center px-8 lg:max-w-7xl text-2xl text-start pt-5">
							<span>
								Buscando por {city} e foram{" "}
								<strong className="text-primary-500">
									0 acomodações encontradas
								</strong>
								.
							</span>
							<button
								onClick={limparPesquisa}
								className=" flex items-center cursor-pointer border border-transparent hover:border-red-500  transition-all gap-2 !text-lg  text-red-500  p-2.5 px-5 rounded-2xl"
							>
								<Eraser /> Limpar pesquisa
							</button>
						</div>
						<div className="mx-auto mb-5	 font-medium max-w-full gap-2 w-full flex justify-start items-start px-8 lg:max-w-7xl text-2xl text-start ">
							Outras acomodações
						</div>
					</>
				)
			) : (
				// Caso 1: sem pesquisa
				<h1 className="mx-auto font-medium max-w-full mb-5 w-full flex justify-start items-start px-8 lg:max-w-7xl text-2xl text-start pt-5">
					Acomodações disponíveis
				</h1>
			)}

			{/* GRID DE RESULTADOS */}
			{city && placesSearch.length > 0 && (
				<div className="grid mb-10 max-w-full relative grid-cols-[repeat(auto-fit,minmax(225px,1fr))] mx-auto gap-8 px-8 py-4 lg:max-w-7xl">
					<>
						{placesSearch.map((place) => (
							<Item {...{ place }} key={place._id} />
						))}
						<div className="min-w-full col-span-full columns-auto"></div>
					</>
				</div>
			)}

			{/* Se não tiver resultados OU não tiver pesquisa → mostrar acomodações padrão */}
			{(!city || placesSearch.length === 0) && (
				<div className="relative mb-10">
					<div className="grid max-w-full mx-auto relative grid-cols-[repeat(auto-fit,minmax(225px,1fr))] gap-8 px-8  lg:max-w-7xl">
						{places.map((place) => (
							<Item {...{ place }} key={place._id} />
						))}
					</div>
				</div>
			)}
		</>
	);
};

// <span className="flex  relative top-0 mr-10 w-full text-center  justify-start items-center  tracking-widest">
// 						<p className="z-1 bg-white px-5 text-primary-900">Fim da busca</p>
// 						<span className="w-full h-fit border-2 border-dashed border-primary-300 absolute "></span>
// 					</span>
export default Home;
