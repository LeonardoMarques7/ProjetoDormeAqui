import { useState } from "react";
import {
	BoomBox,
	CircleParking,
	Dog,
	ShieldCheck,
	Tv,
	TvMinimal,
	Wifi,
} from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import Perk from "./Perk";

const Perks = ({ perks, setPerks }) => {
	return (
		<div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
			<label
				htmlFor="wifi"
				className={`flex items-center gap-2 cursor-pointer px-3 hover:bg-primary-300 hover:text-white py-2 rounded-xl border-1 border-gray-300 transition-colors ${
					perks.includes("wifi")
						? "bg-primary-500 text-white border-transparent"
						: "bg-white text-gray-800"
				}`}
			>
				<Checkbox
					id="Wifi"
					name="Wifi"
					value="Wifi"
					checked={perks.includes("Wifi")}
					onCheckedChange={(checked) => {
						setPerks((prevValue) =>
							checked
								? [...prevValue, "Wifi"]
								: prevValue.filter((perk) => perk !== "Wifi")
						);
					}}
				/>
				<Perk perk={"wifi"}></Perk>
			</label>
			<label
				htmlFor="parking"
				className={`flex items-center gap-2 cursor-pointer px-3 hover:bg-primary-300 hover:text-white py-2 rounded-xl border-1 border-gray-300 transition-colors ${
					perks.includes("parking")
						? "bg-primary-500 text-white border-transparent"
						: "bg-white text-gray-800"
				}`}
			>
				<Checkbox
					id="parking"
					name="parking"
					value="parking"
					checked={perks.includes("parking")}
					onCheckedChange={(checked) => {
						setPerks((prevValue) =>
							checked
								? [...prevValue, "parking"]
								: prevValue.filter((perk) => perk !== "parking")
						);
					}}
				/>
				<Perk perk={"parking"}></Perk>
			</label>
			<label
				htmlFor="tv"
				className={`flex items-center gap-2 cursor-pointer px-3 hover:bg-primary-300 hover:text-white py-2 rounded-xl border-1 border-gray-300 transition-colors ${
					perks.includes("tv")
						? "bg-primary-500 text-white border-transparent"
						: "bg-white text-gray-800"
				}`}
			>
				<Checkbox
					id="tv"
					name="tv"
					value="tv"
					checked={perks.includes("tv")}
					onCheckedChange={(checked) => {
						setPerks((prevValue) =>
							checked
								? [...prevValue, "tv"]
								: prevValue.filter((perk) => perk !== "tv")
						);
					}}
				/>
				<Perk perk={"tv"}></Perk>
			</label>
			<label
				htmlFor="radio"
				className={`flex items-center gap-2 cursor-pointer px-3 hover:bg-primary-300 hover:text-white py-2 rounded-xl border-1 border-gray-300 transition-colors ${
					perks.includes("radio")
						? "bg-primary-500 text-white border-transparent"
						: "bg-white text-gray-800"
				}`}
			>
				<Checkbox
					id="radio"
					name="radio"
					value="radio"
					checked={perks.includes("radio")}
					onCheckedChange={(checked) => {
						setPerks((prevValue) =>
							checked
								? [...prevValue, "radio"]
								: prevValue.filter((perk) => perk !== "radio")
						);
					}}
				/>
				<Perk perk={"radio"}></Perk>
			</label>
			<label
				htmlFor="pet"
				className={`flex items-center gap-2 cursor-pointer px-3 hover:bg-primary-300 hover:text-white py-2 rounded-xl border-1 border-gray-300 transition-colors ${
					perks.includes("pet")
						? "bg-primary-500 text-white border-transparent"
						: "bg-white text-gray-800"
				}`}
			>
				<Checkbox
					id="pet"
					name="pet"
					value="pet"
					checked={perks.includes("pet")}
					onCheckedChange={(checked) => {
						setPerks((prevValue) =>
							checked
								? [...prevValue, "pet"]
								: prevValue.filter((perk) => perk !== "pet")
						);
					}}
				/>
				<Perk perk={"pet"}></Perk>
			</label>
			<label
				htmlFor="entrance"
				className={`flex items-center gap-2 cursor-pointer px-3 hover:bg-primary-300 hover:text-white py-2 rounded-xl border-1 border-gray-300 transition-colors ${
					perks.includes("entrance")
						? "bg-primary-500 text-white border-transparent"
						: "bg-white text-gray-800"
				}`}
			>
				<Checkbox
					id="entrance"
					name="entrance"
					value="entrance"
					checked={perks.includes("entrance")}
					onCheckedChange={(checked) => {
						setPerks((prevValue) =>
							checked
								? [...prevValue, "entrance"]
								: prevValue.filter((perk) => perk !== "entrance")
						);
					}}
				/>
				<Perk perk={"entrance"}></Perk>
			</label>
		</div>
	);
};

export default Perks;
