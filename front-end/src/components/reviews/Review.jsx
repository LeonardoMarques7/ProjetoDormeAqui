import { useState } from "react";
import axios from "axios";
import { Star } from "lucide-react";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { useMessage } from "@/components/contexts/MessageContext";
import { motion, AnimatePresence } from "framer-motion";

const Review = ({ booking }) => {
	const [rating, setRating] = useState(0);
	const [hoverRating, setHoverRating] = useState(0);
	const [comment, setComment] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const { showMessage } = useMessage();

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (rating === 0) {
			showMessage("Por favor, selecione uma avaliação.", "warning");
			return;
		}

		setIsSubmitting(true);
		try {
			await axios.post("/reviews", {
				booking: booking._id,
				place: booking.place._id,
				user: booking.user._id,
				rating,
				comment: comment.trim() || "",
			});
			setSubmitted(true);
			showMessage("Avaliação enviada com sucesso!", "success");
		} catch (error) {
			console.error("Erro ao enviar avaliação:", error);
			showMessage("Erro ao enviar avaliação. Tente novamente.", "error");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (submitted) {
		return (
			<motion.div
				className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ type: "spring", stiffness: 300, damping: 20 }}
			>
				<p className="text-green-800 font-medium">Avaliação enviada!</p>
				<p className="text-green-600 text-sm">
					Obrigado por compartilhar sua experiência.
				</p>
			</motion.div>
		);
	}

	return (
		<motion.div
			className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg"
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
		>
			<h3 className="text-lg font-semibold text-gray-900 mb-3">
				Avalie sua estadia em {booking.place.title}
			</h3>

			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Rating Stars */}
				<div className="flex flex-col gap-2">
					<label className="text-sm font-medium text-gray-700">
						Avaliação geral:
					</label>
					<div className="flex gap-1">
						{[1, 2, 3, 4, 5].map((star) => (
							<motion.button
								key={star}
								type="button"
								className="p-1"
								onMouseEnter={() => setHoverRating(star)}
								onMouseLeave={() => setHoverRating(0)}
								onClick={() => setRating(star)}
								whileHover={{ scale: 1.3 }}
								whileTap={{ scale: 0.9 }}
								transition={{ type: "spring", stiffness: 400, damping: 10 }}
							>
								<motion.span
									className="inline-flex"
									transition={{ duration: 0.2 }}
								>
									<Star
										size={24}
										className={`${
											star <= (hoverRating || rating)
												? "fill-yellow-400 text-yellow-400"
												: "text-gray-300"
										} transition-colors`}
									/>
								</motion.span>
							</motion.button>
						))}
					</div>
					{rating > 0 && (
						<p className="text-sm text-gray-600">
							{rating === 1 && "Ruim"}
							{rating === 2 && "Regular"}
							{rating === 3 && "Bom"}
							{rating === 4 && "Muito bom"}
							{rating === 5 && "Excelente"}
						</p>
					)}
				</div>

				{/* Comment */}
				<div className="flex flex-col gap-2">
					<label className="text-sm font-medium text-gray-700">
						Comentário (opcional):
					</label>
					<textarea
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						placeholder="Conte-nos sobre sua experiência..."
						className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
						rows={3}
						maxLength={500}
					/>
					<p className="text-xs text-gray-500 text-right">
						{comment.length}/500 caracteres
					</p>
				</div>

				{/* Submit Button */}
				<motion.div whileHover={{ scale: 1.01 }}>
					<InteractiveHoverButton
						type="submit"
						disabled={isSubmitting || rating === 0}
						className="w-full flex items-center justify-center gap-2"
					>
						{isSubmitting ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
								Enviando...
							</>
						) : (
							<>Enviar avaliação</>
						)}
					</InteractiveHoverButton>
				</motion.div>
			</form>
		</motion.div>
	);
};

export default Review;
