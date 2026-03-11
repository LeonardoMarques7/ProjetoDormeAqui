import { motion, useScroll, useTransform } from "framer-motion";
import photoDefaultLoading from "@/assets/loadingGif2.gif";
import { useMobileContext } from "@/components/contexts/MobileContext";
import { Skeleton } from "@/components/ui/skeleton";

const galleryItem = {
	hidden: { clipPath: "inset(100% 0 0 0)", scale: 1.06 },
	visible: {
		clipPath: "inset(0% 0 0 0)",
		scale: 1,
		transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
	},
};

export default function PlaceHolder() {
	const { mobile } = useMobileContext();

	const { scrollY } = useScroll();
	const parallaxY = useTransform(scrollY, [0, 600], [0, -60]);

	return (
		<>
			<div className="max-sm:p-0 max-sm:shadow-none max-h-full max-sm:bg-transparent max-w-full mx-auto w-full object-cover bg-center relative overflow-hidden">
				<motion.div
					className="grid  relative grid-cols-5 grid-rows-2 max-sm:grid-cols-3 h-100 max-sm:p-0 gap-2 2xl:h-150 max-sm:h-[50svh]"
					initial="hidden"
					style={{ y: parallaxY }}
					animate="visible"
				>
					{/* Imagem principal */}
					<motion.div className="col-span-3 row-span-2 max-sm:col-span-4 max-sm:row-span-2 overflow-hidden">
						<img
							src={photoDefaultLoading}
							className="w-full h-full object-cover border  rounded-3xl  transition-transform duration-700"
						/>
					</motion.div>

					<motion.div className="col-span-1 row-span-1 max-sm:col-span-2 overflow-hidden rounded-3xl">
						<img
							src={photoDefaultLoading}
							className="w-full h-full object-cover border  rounded-3xl  transition-transform duration-700"
						/>
					</motion.div>

					<motion.div className="col-span-1 row-span-1 max-sm:col-span-2 overflow-hidden rounded-3xl">
						<img
							src={photoDefaultLoading}
							className="w-full h-full object-cover border  rounded-3xl  transition-transform duration-700"
						/>
					</motion.div>

					{!mobile && (
						<>
							<motion.div className="col-span-1 row-span-1 max-sm:col-span-4 overflow-hidden rounded-3xl">
								<img
									src={photoDefaultLoading}
									className="w-full h-full object-cover border  rounded-3xl  transition-transform duration-700"
								/>
							</motion.div>

							<motion.div className="col-span-1 row-span-1 overflow-hidden rounded-3xl">
								<img
									src={photoDefaultLoading}
									className="w-full h-full object-cover border  rounded-3xl  transition-transform duration-700"
								/>
							</motion.div>
						</>
					)}
				</motion.div>
			</div>
			<div className="flex mt-4 flex-col flex-1 gap-4">
				<Skeleton className="w-100 h-10" />
				<div className="flex gap-2 rounded-2xl items-center">
					<div className="flex items-center gap-2">
						<div className="flex items-center gap-1">
							{[...Array(5)].map((_, i) => (
								<Skeleton key={i} className="w-7 h-7" />
							))}
						</div>
						<Skeleton className="w-20 h-7" />
					</div>
				</div>

				<div className="flex items-center max-sm:text-sm text-gray-600 gap-2">
					<Skeleton className="w-7 h-7" />
					<Skeleton className="w-20 h-7" />
				</div>

				<div className="flex group rounded-2xl items-center font-normal gap-2.5">
					<img
						src={photoDefaultLoading}
						className="w-12 h-12 border  transition-all duration-500 aspect-square rounded-full object-cover"
						alt="Foto do Usuário"
					/>
					<div className="flex flex-col gap-2.5 text-gray-700">
						<Skeleton className="font-medium w-20 h-4"></Skeleton>
						<Skeleton className="flex items-center gap-1 w-25 h-2"></Skeleton>
					</div>
				</div>
				<div className="flex flex-col gap-2 max-w-2xl leading-relaxed">
					<Skeleton className="max-w-sm w-full h-5 "></Skeleton>
					<Skeleton className="max-w-lg  w-full h-5 "></Skeleton>
					<Skeleton className="max-w-xl w-full h-5 "></Skeleton>
					<Skeleton className="max-w-md w-full h-5 "></Skeleton>
					<Skeleton className="max-w-1xl w-full h-5 "></Skeleton>
					<Skeleton className="max-w-2xl w-full h-5 "></Skeleton>
				</div>
			</div>
		</>
	);
}
