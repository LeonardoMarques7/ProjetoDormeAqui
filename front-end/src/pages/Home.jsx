import { useEffect, useState } from "react";
import Item from "../components/Item";
import axios from "axios";
import { CalendarIcon, MapPin, Search } from "lucide-react";
import { format, isBefore, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

const Home = () => {
	const [places, setPlaces] = useState([]);
	const [city, setCity] = useState("");
	const [price, setPrice] = useState("");
	const [checkin, setCheckin] = useState("");
	const [checkout, setCheckout] = useState("");

	useEffect(() => {
		const axiosGet = async () => {
			const { data } = await axios.get("/places");
			setPlaces(data);
		};

		axiosGet();
	}, []);

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

	return (
		<section>
			<div className="p-8 w-full bg-primary-500 mb-15 relative h-[50svh] flex-col text-white flex justify-center items-center text-center">
				<div className="titles flex flex-col gap-5">
					<h1 className="text-5xl font-bold">Encontre seu lugar perfeito</h1>
					<p className="text-lg">
						Descubra acomodações únicas para sua próxima viagem
					</p>
				</div>
				<div className="bg-white absolute -bottom-12 p-4 px-8 shadow-xl rounded-2xl mt-4">
					<form>
						<div className="flex items-center gap-2">
							<div className="group__input relative flex justify-center items-center">
								<MapPin className="absolute left-4 text-gray-400 size-6" />
								<input
									id="city"
									type="text"
									placeholder="Cidade ou Estado"
									className="border border-gray-200 px-14 py-4 rounded-2xl w-full text-gray-400 outline-primary-400"
									value={city}
									onChange={(e) => {
										setCity(e.target.value);
									}}
								/>
							</div>
							{/* Checkin */}
							<div className=" ">
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn(
												"justify-start text-left font-normal relative border border-gray-200 !px-14 !py-4 h-full rounded-2xl text-gray-400 outline-primary-400 ",
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
												"justify-start text-left font-normal relative border border-gray-200 !px-14 !py-4 h-full rounded-2xl text-gray-400 outline-primary-400",
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
								variant="outline"
								className="justify-start text-left font-normal border bg-primary-500 hover:bg-primary-600/90 cursor-pointer hover:text-white border-gray-200 !px-14 !py-4 h-full rounded-2xl text-white outline-primary-400"
							>
								<Search className="mr-2 h-4 w-4" />
								<span>Buscar</span>
							</Button>
						</div>
					</form>
				</div>
			</div>
			<div className="mx-auto grid max-w-full grid-cols-[repeat(auto-fit,minmax(225px,1fr))] gap-8 p-8 lg:max-w-7xl">
				{places.map((place) => (
					<Item {...{ place }} key={place._id} />
				))}
			</div>
		</section>
	);
};

export default Home;
