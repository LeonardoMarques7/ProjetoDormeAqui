import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Nome completo é obrigatório")
    .trim()
    .refine((val) => val.split(/\s+/).filter(Boolean).length >= 2, "Nome deve ter pelo menos duas palavras")
    .max(100, "Nome muito longo"),
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .trim()
    .email("Email inválido")
    .transform((val) => val.toLowerCase()),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .trim()
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
      "Senha: 8+ chars, 1 maiúsc, 1 minúsc, 1 número, 1 especial (sem espaços)")
    .max(128),
  confirmPassword: z
    .string()
    .min(1, "Confirme a senha")
    .trim(),
  acceptedTerms: z.literal(true, "Aceite os termos")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"]
});
