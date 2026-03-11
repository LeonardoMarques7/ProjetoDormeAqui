import { Filter, Star, Verified } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { Select } from "@mantine/core";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useMobileContext } from "../contexts/MobileContext";
import photoDefault from "../../assets/photoDefault.jpg";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";

const stagger = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
	hidden: { opacity: 0, y: 28 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
	},
};

const maskReveal = {
	hidden: { y: "105%" },
	visible: {
		y: "0%",
		transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
	},
};

function dataFormat(date) {
	return new Date(date).toLocaleString("pt-BR", { dateStyle: "short" });
}

export default function PlaceReviews({ reviews }) {
	const { mobile } = useMobileContext();

	const [sortBy, setSortBy] = useState("recent");
	const [ratingFilter, setRatingFilter] = useState("all");
	const [commentFilter, setCommentFilter] = useState("all");

	const [sheetOpen, setSheetOpen] = useState(false);
	const [sortByTemp, setSortByTemp] = useState("recent");
	const [tempRating, setTempRating] = useState(0);
	const [tempHoverRating, setTempHoverRating] = useState(0);
	const [tempCommentFilter, setTempCommentFilter] = useState("all");

	const filteredReviews = useMemo(() => {
		let filtered = [...reviews];

		if (ratingFilter !== "all") {
			filtered = filtered.filter((r) => r.rating === parseInt(ratingFilter));
		}
		if (commentFilter === "with") {
			filtered = filtered.filter((r) => r.comment && r.comment.trim() !== "");
		} else if (commentFilter === "without") {
			filtered = filtered.filter((r) => !r.comment || r.comment.trim() === "");
		}

		filtered.sort((a, b) => {
			const da = new Date(a.createdAt || 0);
			const db = new Date(b.createdAt || 0);
			return sortBy === "recent" ? db - da : da - db;
		});

		return filtered;
	}, [reviews, sortBy, ratingFilter, commentFilter]);

	const handleClearFilters = (e) => {
		e.preventDefault();
		setSortBy("recent");
		setRatingFilter("all");
		setCommentFilter("all");
		setSortByTemp("recent");
		setTempRating(0);
		setTempCommentFilter("all");
	};

	const handleApplyFilters = () => {
		setSortBy(sortByTemp);
		setRatingFilter(tempRating > 0 ? tempRating.toString() : "all");
		setCommentFilter(tempCommentFilter);
		setSheetOpen(false);
		document
			.getElementById("avaliacoes")
			?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<div className="my-4 mt-7">
			<motion.div
				id="avaliacoes"
				className="flex scroll-m-25 flex-col w-full relative"
				variants={stagger}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, margin: "-50px" }}
			>
				<div className="overflow-hidden">
					<motion.p
						variants={maskReveal}
						className="text-primary-500 uppercase font-light"
					>
						Avaliações
					</motion.p>
				</div>

				<div className="flex items-center justify-between">
					<div className="overflow-hidden ">
						<motion.p variants={maskReveal} className="text-3xl font-bold">
							O que Dizem
						</motion.p>
						{/* Mobile filter button */}
					</div>
					{mobile && (
						<button
							onClick={() => setSheetOpen(true)}
							className="text-center cursor-pointer justify-center text-xl w-10 h-10 p-1 shadow-sm flex  items-center gap-2 bg-primary-900 hover:bg-primary-black transition-colors rounded-full text-white font-medium"
						>
							<AdjustmentsHorizontalIcon
								className="text-white w-6 h-6"
								color="#fff"
							/>
						</button>
					)}

					{/* Mobile filter drawer trigger */}
					{mobile && (
						<Drawer open={sheetOpen} onOpenChange={setSheetOpen} modal={true}>
							<DrawerContent className="rounded-tl-3xl h-auto p-5 py-6 max-h-[80vh]">
								<p className="text-xl font-medium text-gray-900 mb-2">
									Filtros de Avaliações
								</p>
								<div className="flex flex-col gap-6 mt-6">
									{/* Sort */}
									<div className="flex flex-col gap-2">
										<label className="text-sm font-medium text-gray-700">
											Ordenar por:
										</label>
										<div className="flex flex-col gap-4">
											{["recent", "oldest"].map((val) => (
												<label
													key={val}
													className={`flex items-center gap-2 cursor-pointer px-3 py-2 border-l-1 border-transparent transition-colors ${
														sortByTemp === val
															? "border-l-primary-900 text-primary-900 bg-primary-100/50"
															: "text-gray-800 hover:bg-primary-100/50 hover:border-l-primary-300"
													}`}
												>
													<input
														type="checkbox"
														checked={sortByTemp === val}
														onChange={(e) => {
															if (e.target.checked) setSortByTemp(val);
														}}
														className="hidden"
													/>
													{val === "recent" ? "Mais recente" : "Mais antigo"}
													<span
														className={`w-2 h-2 ml-auto rounded-full bg-transparent ${sortByTemp === val && "!bg-primary-900"}`}
													/>
												</label>
											))}
										</div>
									</div>

									{/* Stars */}
									<div className="flex flex-col gap-2">
										<label className="text-sm font-medium text-gray-700">
											Estrelas:
										</label>
										<div className="flex gap-1">
											{[1, 2, 3, 4, 5].map((star) => (
												<button
													key={star}
													type="button"
													className={`p-3 hover:scale-110 rounded-2xl bg-primary-100/50 transition-all ${
														star <= (tempHoverRating || tempRating)
															? "bg-primary-900"
															: ""
													}`}
													onMouseEnter={() => setTempHoverRating(star)}
													onMouseLeave={() => setTempHoverRating(0)}
													onClick={() => setTempRating(star)}
												>
													<Star
														size={24}
														className={`${
															star <= (tempHoverRating || tempRating)
																? "fill-white text-white"
																: "text-gray-300"
														} transition-colors`}
													/>
												</button>
											))}
										</div>
									</div>

									{/* Comment filter */}
									<div className="flex flex-col gap-2">
										<label className="text-sm font-medium text-gray-700">
											Comentários:
										</label>
										<div className="flex flex-col gap-4">
											{["all", "with", "without"].map((val) => (
												<label
													key={val}
													className={`flex items-center gap-2 cursor-pointer px-3 py-2 border-l-1 border-transparent transition-colors ${
														tempCommentFilter === val
															? "border-l-primary-900 text-primary-900 bg-primary-100/50"
															: "text-gray-800 hover:bg-primary-100/50 hover:border-l-primary-300"
													}`}
												>
													<input
														type="checkbox"
														checked={tempCommentFilter === val}
														onChange={(e) => {
															if (e.target.checked) setTempCommentFilter(val);
														}}
														className="hidden"
													/>
													{val === "all"
														? "Todos"
														: val === "with"
															? "Com comentário"
															: "Sem comentário"}
													<span
														className={`w-2 h-2 ml-auto rounded-full bg-transparent ${tempCommentFilter === val && "!bg-primary-900"}`}
													/>
												</label>
											))}
										</div>
									</div>
								</div>

								<div className="flex justify-end gap-4 mt-6">
									<button
										type="button"
										onClick={handleClearFilters}
										className="px-4 py-2 cursor-pointer hover:bg-primary-100 rounded-lg border hover:text-primary-900 transition-colors font-medium"
									>
										Limpar
									</button>
									<button
										type="button"
										onClick={handleApplyFilters}
										className="px-6 py-2 bg-primary-900 cursor-pointer text-white rounded-lg hover:bg-primary-800 transition-colors font-medium"
									>
										Aplicar Filtros
									</button>
								</div>
							</DrawerContent>
						</Drawer>
					)}
				</div>

				{/* Desktop filters */}
				{!mobile && (
					<div className="flex flex-wrap gap-4 mt-5 mb-5 ">
						{[
							{
								label: "Ordenar por:",
								value: sortBy,
								onChange: setSortBy,
								data: [
									{ value: "recent", label: "Mais recente" },
									{ value: "oldest", label: "Mais antigo" },
								],
								placeholder: "Ordenar por",
							},
							{
								label: "Estrelas:",
								value: ratingFilter,
								onChange: setRatingFilter,
								data: [
									{ value: "all", label: "Todas" },
									{ value: "5", label: "5 estrelas" },
									{ value: "4", label: "4 estrelas" },
									{ value: "3", label: "3 estrelas" },
									{ value: "2", label: "2 estrelas" },
									{ value: "1", label: "1 estrela" },
								],
								placeholder: "Estrelas",
							},
							{
								label: "Comentários:",
								value: commentFilter,
								onChange: setCommentFilter,
								data: [
									{ value: "all", label: "Todos" },
									{ value: "with", label: "Com comentário" },
									{ value: "without", label: "Sem comentário" },
								],
								placeholder: "Comentários",
							},
						].map(({ label, value, onChange, data, placeholder }) => (
							<div key={label} className="flex flex-col gap-2">
								<label className="text-sm font-medium text-gray-700">
									{label}
								</label>
								<Select
									value={value}
									onChange={onChange}
									data={data}
									placeholder={placeholder}
									className="w-[180px]"
									styles={{
										input: { borderRadius: "12px" },
										dropdown: { borderRadius: "12px" },
									}}
								/>
							</div>
						))}
					</div>
				)}

				{/* Reviews grid */}
				<motion.div
					className="grid max-w-full relative  grid-cols-[repeat(auto-fit,minmax(300px,1fr))] max-sm:grid-cols-1 max-sm:gap-3.5 gap-3 mt-5 mb-15 max-sm:mb-0"
					variants={stagger}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
				>
					{filteredReviews.length > 0 ? (
						filteredReviews.map((review) => (
							<motion.div
								key={review._id}
								variants={fadeUp}
								whileHover={{ y: -4, transition: { duration: 0.2 } }}
								className="group relative bg-white rounded-3xl h-full p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-neutral-100"
							>
								{/* Header */}
								<div className="flex items-center justify-between">
									<Link
										to={`/account/profile/${review.user._id}`}
										className="flex items-center gap-4"
									>
										<div className="relative">
											<img
												src={review.user.photo || photoDefault}
												className="w-14 h-14 rounded-full object-cover shadow-sm"
												alt=""
											/>
											<Verified className="size-5 text-blue-600 absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow" />
										</div>
										<div>
											<p className="font-semibold text-neutral-900">
												{review.user.name}
											</p>
											<p className="text-sm text-neutral-500">
												{review.user.city || "Hóspede"}
											</p>
										</div>
									</Link>
								</div>

								{/* Rating */}
								<div className="flex items-center gap-1 mt-4">
									<span className="font-semibold">
										{Number(review.rating).toFixed(1)}
									</span>
									<div className="flex text-yellow-500 text-xl">
										{[1, 2, 3, 4, 5].map((star) => (
											<span key={star}>
												{star <= Math.round(review.rating) ? "★" : "☆"}
											</span>
										))}
									</div>
								</div>

								{/* Comment */}
								<div className="my-4 mt-1 relative">
									{review.comment ? (
										<p className="text-neutral-700 pt-1 leading-relaxed line-clamp-4">
											{review.comment}
										</p>
									) : (
										<p className="text-neutral-400 italic">Sem comentário</p>
									)}
								</div>

								{/* Footer */}
								<div className="mt-auto absolute bottom-4 text-xs text-neutral-400">
									Avaliado em {dataFormat(review.createdAt)}
								</div>
							</motion.div>
						))
					) : (
						<p className="text-gray-500 text-center py-0 col-span-full">
							Ainda não há avaliações para este filtro.
						</p>
					)}
				</motion.div>
			</motion.div>
		</div>
	);
}
