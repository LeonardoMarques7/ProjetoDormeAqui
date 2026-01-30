import React, { useState } from "react";
import axios from "axios";
import { Star, Send } from "lucide-react";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { useMessage } from "@/components/contexts/MessageContext";

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
			<div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
				<p className="text-green-800 font-medium">Avaliação enviada!</p>
				<p className="text-green-600 text-sm">
					Obrigado por compartilhar sua experiência.
				</p>
			</div>
		);
	}

	return (
		<div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
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
							<button
								key={star}
								type="button"
								className="p-1 hover:scale-110 transition-transform"
								onMouseEnter={() => setHoverRating(star)}
								onMouseLeave={() => setHoverRating(0)}
								onClick={() => setRating(star)}
							>
								<Star
									size={24}
									className={`${
										star <= (hoverRating || rating)
											? "fill-yellow-400 text-yellow-400"
											: "text-gray-300"
									} transition-colors`}
								/>
							</button>
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
			</form>
		</div>
	);
};

export default Review;
