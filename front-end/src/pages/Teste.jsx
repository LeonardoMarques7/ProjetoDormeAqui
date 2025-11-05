import React from "react";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { color, motion } from "framer-motion";
import { useEffect, useState } from "react";
import frameTeste from "../assets/frame__teste.png";
import {
	ArrowRight,
	Drama,
	Guitar,
	Music,
	Palette,
	Search,
} from "lucide-react";

const Teste = () => {
	const [position, setPosition] = useState({ x: 100, y: 100 });
	const [velocity, setVelocity] = useState({ x: 2, y: 3 }); // velocidade em px por frame

	useEffect(() => {
		const update = () => {
			setPosition((prev) => {
				let newX = prev.x + velocity.x;
				let newY = prev.y + velocity.y;
				let newVx = velocity.x;
				let newVy = velocity.y;

				// Verifica colisão horizontal
				if (newX <= 0 || newX >= window.innerWidth - 150) {
					newVx = -newVx;
				}

				// Verifica colisão vertical
				if (newY <= 0 || newY >= window.innerHeight - 150) {
					newVy = -newVy;
				}

				setVelocity({ x: newVx, y: newVy });
				return { x: newX, y: newY };
			});
		};

		const interval = setInterval(update, 16); // ~60fps
		return () => clearInterval(interval);
	}, [velocity]);

	return (
		<>
			{/* <div className="fixed inset-0 pointer-events-none overflow-hidden">
				<div
					className="absolute bottom-20 right-20  w-[500px] h-[500px] bg-gradient-to-br from-rose-300/50 to-pink-300 rounded-full blur-3xl opacity-20 animate-pulse"
					style={{ animationDelay: "10s" }}
				/>
				<div
					className="absolute top-20 left-20 w-[400px] h-[400px] bg-gradient-to-br from-pink-400/50 to-rose-400/50 rounded-full blur-3xl opacity-25 animate-pulse"
					style={{ animationDelay: "5s" }}
				/>
			</div> */}
			{/* <div className="fixed inset-0 pointer-events-none overflow-hidden">
				<motion.div
					className="absolute bottom-10 right-20 w-[500px] h-[500px] bg-gradient-to-br from-rose-300/50 to-pink-300  rounded-full opacity-20"
					style={{ animationDelay: "15s" }}
					animate={{
						x: ["0px", "-1500px", "0px"],
						y: ["0px", "-250px", "0px"],
					}}
					transition={{
						duration: 20, // tempo total do ciclo
						repeat: Infinity, // infinito
						ease: "easeInOut", // suavidade
					}}
				/>
			</div> */}
			{/* <div className="fixed inset-0 pointer-events-none overflow-hidden">
				<motion.div
					className="absolute w-[300px] h-[300px] bg-gradient-to-br from-rose-300/50 to-pink-300 blur-3xl  rounded-full opacity-50"
					animate={{
						x: ["0vw", "100vw", "100vw", "0vw"], // percorrer toda largura da tela
						y: ["100vh", "-15vh", "0vh", "100vh"], // percorrer toda altura da tela
					}}
					transition={{
						duration: 20, // tempo total do percurso
						repeat: Infinity,
						ease: "linear",
					}}
				/>
			</div>
			<div className="fixed inset-0 pointer-events-none overflow-hidden">
				<motion.div
					className="absolute w-[300px] h-[300px] bg-gradient-to-br from-rose-300/50 to-pink-300 blur-3xl  rounded-full opacity-50"
					animate={{
						x: ["0vw", "50vw", "100vw", "0vw"], // percorrer toda largura da tela
						y: ["50vh", "-15vh", "0vh", "50vh"], // percorrer toda altura da tela
					}}
					transition={{
						duration: 20, // tempo total do percurso
						repeat: Infinity,
						ease: "linear",
					}}
				/>
			</div> */}
			<div className="h-svh mx-8 ">
				<div className="flex w-fit h-full mx-auto  items-center justify-center gap-6 max-w-7xl text-center flex-col">
					<h2 className="text-9xl font-extrabold text-[#E33C68]">Wikilo</h2>
					<h5 className="text-3xl max-w-xl leading-12">
						Onde <strong>artistas independentes</strong> brasileiros ganham voz,
						história e reconhecimento
					</h5>
					<div className=" rounded-2xl w-full shadow-2xl shadow-[#E33C68]/25 max-w-lg border border-[#E33C68]/50 p-2.5 text-gray-600 flex items-center gap-2.5 bg-white">
						<Search className="text-[#E33C68] w-6 h-6 ml-2.5" />
						<input
							type="text"
							className=" flex items-center flex-1  px-2.5 gap-5 outline-none"
							placeholder="Procure por um artista..."
						/>
						<button className="bg-[#E33C68] w-fit bg-gradient-to-l to-pink-500 from-[#E33C68] hover:from-[#ff0f4f] ease-in-out duration-500 transition cursor-pointer text-white rounded-md p-2.5 px-10 !font-bold ml-auto">
							Buscar
						</button>
					</div>
					<div className="flex items-center gap-5">
						<button className="bg-[#E33C68] flex items-center gap-5 pr-6 text-white font-bold rounded-md p-2.5 px-5">
							Começar Gratuitamente <ArrowRight />
						</button>
						<button
							style={{ backgroundColor: "#fff" }}
							className="flex items-center gap-5 text-[#E33C68] border border-[#E33C68]/50  font-bold rounded-md p-2.5 px-5"
						>
							Ver comunidade
						</button>
					</div>
				</div>
			</div>
			<div className="fixed inset-0 text-[#E33C68] overflow-hidden">
				<div
					className="absolute w-[300px] h-[300px] hover:bg-[#E33C68] hover:text-white  flex justify-center items-center -left-20 -top-20 border-8 border-[#E33C68] rounded-full opacity-50 animate-breathe"
					style={{ animationDelay: "2s" }}
				>
					<Guitar size={70} />
				</div>

				<div
					className="absolute w-[300px] h-[300px] hover:bg-[#E33C68] hover:text-white transition-all flex justify-center items-center -right-30 -top-40 border-8 border-[#E33C68] rounded-full opacity-50 animate-breathe"
					style={{ animationDelay: "4s" }}
				>
					<Palette size={70} />
				</div>

				<div
					className="absolute -bottom-40 left-[10svw] hover:bg-[#E33C68] hover:text-white flex justify-center items-center w-[300px] h-[300px] border-8 border-[#E33C68] rounded-full opacity-50 animate-breathe"
					style={{ animationDelay: "6s" }}
				>
					<Drama size={70} />
				</div>

				<div
					className="absolute top-[45svh] right-[2svw] w-[300px]  hover:bg-[#E33C68] hover:text-white flex justify-center items-center h-[300px] border-8 border-[#E33C68] rounded-full opacity-50 animate-breathe"
					style={{ animationDelay: "1s" }}
				>
					<Music size={70} />
				</div>
			</div>
			{/* <div className="fixed inset-0 pointer-events-none overflow-hidden">
				<div
					className="absolute w-[150px] h-[150px] bg-gradient-to-br from-rose-300/50 to-pink-300 rounded-full opacity-50"
					style={{
						transform: `translate(${position.x}px, ${position.y}px)`,
					}}
				>
					<img src={gifOlhos} className="opacity-50" alt="" />
				</div>
			</div> */}
		</>
	);
};

export default Teste;
