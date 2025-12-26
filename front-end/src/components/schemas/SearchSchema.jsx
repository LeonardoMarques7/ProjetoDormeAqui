import { z } from "zod";
import { isBefore, isAfter, startOfDay } from "date-fns";

export const searchSchema = z
	.object({
		city: z
			.string()
			.max(100, "A cidade deve ter no máximo 100 caracteres")
			.optional()
			.or(z.literal("")),

		checkin: z
			.date({
				required_error: "Selecione a data de check-in",
				invalid_type_error: "Data de check-in inválida",
			})
			.optional()
			.nullable(),

		checkout: z
			.date({
				required_error: "Selecione a data de check-out",
				invalid_type_error: "Data de check-out inválida",
			})
			.optional()
			.nullable(),

		guests: z.coerce
			.number({
				invalid_type_error: "Número de hóspedes deve ser um número",
			})
			.int("Número de hóspedes deve ser um número inteiro")
			.min(1, "Mínimo de 1 hóspede")
			.max(20, "Máximo de 20 hóspedes")
			.optional()
			.nullable(),
	})
	.refine(
		(data) => {
			// Se checkin existe, deve ser hoje ou no futuro
			if (data.checkin) {
				const today = startOfDay(new Date());
				return !isBefore(startOfDay(data.checkin), today);
			}
			return true;
		},
		{
			message: "Data de check-in deve ser hoje ou no futuro",
			path: ["checkin"],
		}
	)
	.refine(
		(data) => {
			// Se ambos existem, checkout deve ser depois de checkin
			if (data.checkin && data.checkout) {
				return isAfter(data.checkout, data.checkin);
			}
			return true;
		},
		{
			message: "Check-out deve ser após o check-in",
			path: ["checkout"],
		}
	)
	.refine(
		(data) => {
			// Se checkout existe, checkin também deve existir
			if (data.checkout && !data.checkin) {
				return false;
			}
			return true;
		},
		{
			message: "Selecione primeiro a data de check-in",
			path: ["checkin"],
		}
	);
