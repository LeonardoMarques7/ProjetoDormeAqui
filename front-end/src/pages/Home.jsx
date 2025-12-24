import { useEffect, useState } from "react";
import Item from "../components/Item";
import axios from "axios";
import {
	CalendarArrowDownIcon,
	CalendarArrowUp,
	CalendarIcon,
	DeleteIcon,
	Eraser,
	MapPin,
	Search,
	Trash,
	Users,
	X,
} from "lucide-react";
import { format, isBefore, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import logoPrimary from "../assets/logo__primary.png";
import { Calendar } from "@/components/ui/calendar";
import RotatingText from "@/components/RotatingText";
import { cn } from "@/lib/utils";
import GridMotion from "@/components/GridMotion";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import Banner from "../assets/image.png";
import { ptBR } from "date-fns/locale";

import "./Home.css";
import { GuestsInput } from "../components/ui/GuestsInput";
import DatePickerAirbnb from "../components/DatePickerAirbnb";

const Home = () => {
	const [searchInput, setSearchInput] = useState("");
	const [searchGuests, setSearchGuests] = useState("");
	const [city, setCity] = useState("");
	const [places, setPlaces] = useState([]);
	const [placesSearch, setPlacesSearch] = useState([]);
	const [price, setPrice] = useState("");
	const [checkin, setCheckin] = useState("");
	const [checkout, setCheckout] = useState("");
	const [placeholder, setPlaceHolder] = useState([1, 2, 3, 4]);

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

	const handleDateSelect = ({ checkin: newCheckin, checkout: newCheckout }) => {
		setCheckin(newCheckin);
		setCheckout(newCheckout);
	};

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
			<div className="relative flex justify-center mb-12">
				<div className="banner__home  max-sm:hidden bg-primar-700 shadow-2xl  max-w-7xl mx-auto w-full object-cover bg-center rounded-4xl h-[50svh] relative overflow-hidden">
					<div className=" absolute inset-0 backdrop-blur-[5px] z-0">
						<img src={Banner} alt="" />
					</div>

					{/* Conteúdo */}
				</div>
				<div className="container__bg__form z-20 bg-white absolute flex justify-center -bottom-12 p-4 pl-8 px-4 shadow-xl rounded-2xl mt-4">
					<form onSubmit={handleSearch}>
						<div className="form__container flex items-center justify-start">
							<div className="group__input relative px-4 border-r flex justify-center items-center">
								<MapPin className="absolute left-0 text-gray-400 size-5" />
								<input
									id="city"
									type="text"
									placeholder="Para onde você vai?"
									className="ml-5 outline-none"
									value={searchInput}
									onChange={(e) => setSearchInput(e.target.value)}
								/>
							</div>
							{/* Checkin */}
							<div className="w-fit h-fit  border-r px-8">
								<DatePickerAirbnb
									onDateSelect={handleDateSelect}
									initialCheckin={checkin}
									search={true}
									initialCheckout={checkout}
								/>
							</div>
							<div className="group__input relative  !pl-8 w-fit pr-4 flex justify-center items-center">
								<Users className=" left-0           text-gray-400 size-5" />
								<input
									id="guests"
									type="number"
									className="ml-5 max-w-fit outline-none"
									placeholder="Hópedes"
									value={searchGuests}
									onChange={(e) => setSearchGuests(e.target.value)}
								/>
							</div>
							{/* Check-out */}
							<Button
								type="submit"
								variant="outline"
								className="justify-center  !px-5 !py-5 font-normal border bg-primary-900 hover:bg-primary-800/90 cursor-pointer hover:text-white border-gray-200 h-full rounded-2xl text-white outline-primary-400"
							>
								<Search className="h-5 w-5" />
							</Button>
						</div>
					</form>
				</div>
			</div>
			{city ? (
				placesSearch.length > 0 ? (
					// Caso 3: pesquisou e encontrou
					<div className="mx-auto mb-5  font-medium max-w-full gap-2 w-full flex justify-between items-center px-8 lg:max-w-7xl text-2xl text-start pt-5">
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
							className=" ml-auto flex items-center cursor-pointer border border-transparent  hover:bg-red-50 transition-all gap-2 !text-lg  text-red-500  p-2.5 px-5 rounded-2xl"
						>
							<Eraser /> Limpar pesquisa
						</button>
					</div>
				) : (
					// Caso 2: pesquisou mas não encontrou
					<>
						<div className="my-8 max-w-7xl mx-auto text-start w-full overflow-hidden">
							{/* Conteúdo */}
							<div className="text-center flex-col mx-8 flex gap-2 items-start justify-start transition-all">
								<h1>
									<strong className="text-red-500">Ops!</strong> Não encontramos
									acomodações que correspondam à sua busca.
								</h1>
								<p className="text-primary-700 mb-5">
									Não encontramos acomodações que correspondam aos seus
									critérios de busca.
								</p>
								<button
									onClick={limparPesquisa}
									className="edit__btn outline-none  cursor-pointer  flex items-center justify-center transition-all duration-300 ease-in-out hover:px-2 hover:bg-red-700 gap-2 bg-red-500 text-white px-2 rounded-md text-center py-2.5"
								>
									<p className="!text-sm  transition-all duration-300 ease-in-out whitespace-nowrap">
										Limpar Todos os Filtros
									</p>
								</button>
							</div>
						</div>
						<div className="mx-auto mb-5 font-medium max-w-full text-gray-700 gap-2 w-full flex justify-start items-start px-8 lg:max-w-7xl text-2xl text-start ">
							<strong>Mas não se preocupe!</strong> Confira abaixo outras opções
							disponíveis:
						</div>
					</>
				)
			) : (
				// Caso 1: sem pesquisa
				<span className="mx-auto text__section font-medium max-w-full mb-5 w-full flex justify-start items-start px-8 lg:max-w-7xl text-2xl text-start pt-5">
					Acomodações disponíveis
				</span>
			)}
			{/* GRID DE RESULTADOS */}
			{city && placesSearch.length > 0 && (
				<div className="grid mb-10 max-w-full relative transition-transform grid-cols-[repeat(auto-fit,minmax(225px,1fr))] mx-auto gap-8 px-8 py-4 lg:max-w-7xl">
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
					<div className="grid max-w-full transition-transform mx-auto relative grid-cols-[repeat(auto-fit,minmax(225px,1fr))] gap-8 px-8  lg:max-w-7xl">
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
