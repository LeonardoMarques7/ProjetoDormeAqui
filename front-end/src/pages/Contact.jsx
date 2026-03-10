import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";

const fadeUp = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Contact() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		message: "",
	});
	const [submitted, setSubmitted] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			// Aqui você pode adicionar lógica para enviar o formulário
			// Por enquanto, apenas simulamos o envio
			await new Promise((resolve) => setTimeout(resolve, 1500));
			setSubmitted(true);
			setFormData({ name: "", email: "", message: "" });
			setTimeout(() => setSubmitted(false), 5000);
		} catch (error) {
			console.error("Erro ao enviar formulário:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Hero Section */}
			<motion.section
				className="bg-gradient-to-r from-primary-900 to-primary-800 text-white py-16 md:py-24"
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true }}
				variants={fadeUp}
			>
				<div className="max-w-4xl mx-auto px-6 text-center">
					<h1 className="text-4xl md:text-5xl font-bold mb-4">
						Contato e Suporte
					</h1>
					<p className="text-xl text-primary-100">
						Estamos aqui para ajudar. Entre em contato conosco!
					</p>
				</div>
			</motion.section>

			{/* Main Content */}
			<div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
				{/* Contact Info */}
				<motion.section
					className="grid md:grid-cols-3 gap-8 mb-16"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={fadeUp}
				>
					{/* 2.1 Suporte ao cliente */}
					<div className="bg-white rounded-lg p-8 shadow-md border-t-4 border-primary-600">
						<Mail className="w-10 h-10 text-primary-600 mb-4" />
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							2.1 Suporte ao Cliente
						</h2>
						<p className="text-gray-600 mb-3">
							<a
								href="mailto:projeto.dormeaqui@gmail.com"
								className="text-primary-600 hover:underline font-semibold"
							>
								projeto.dormeaqui@gmail.com
							</a>
						</p>
						<p className="text-gray-700 text-sm">
							⏱️ Tempo médio de resposta: até 24 horas úteis.
						</p>
					</div>

					{/* 2.2 Telefone de atendimento */}
					<div className="bg-white rounded-lg p-8 shadow-md border-t-4 border-primary-600">
						<Phone className="w-10 h-10 text-primary-600 mb-4" />
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							2.2 Telefone
						</h2>
						<p className="text-gray-600 mb-3">
							<a
								href="tel:+5515996023560"
								className="text-primary-600 hover:underline font-semibold"
							>
								+55 (15) 99602-3560
							</a>
						</p>
						<p className="text-gray-700 text-sm">
							📅 Segunda a sexta-feira, das 09h às 18h.
						</p>
					</div>

					{/* 2.3 Endereço administrativo */}
					<div className="bg-white rounded-lg p-8 shadow-md border-t-4 border-primary-600">
						<MapPin className="w-10 h-10 text-primary-600 mb-4" />
						<h2 className="text-2xl font-bold text-gray-900 mb-2">
							2.3 Endereço
						</h2>
						<p className="text-gray-700 font-semibold">
							Sorocaba – São Paulo – Brasil
						</p>
						<p className="text-gray-600 text-sm mt-2">Unidade administrativa</p>
					</div>
				</motion.section>

				{/* Contact Form */}
				<motion.section
					className="bg-white rounded-lg shadow-lg p-8 md:p-12"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={fadeUp}
				>
					<h2 className="text-3xl font-bold text-gray-900 mb-2">
						2.4 Formulário de Contato
					</h2>
					<p className="text-gray-600 mb-8">
						Preencha o formulário abaixo e entraremos em contato em breve.
					</p>

					{submitted && (
						<motion.div
							className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3"
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
						>
							<CheckCircle className="w-6 h-6 text-green-600" />
							<div>
								<p className="font-semibold text-green-900">
									Mensagem enviada com sucesso!
								</p>
								<p className="text-green-700 text-sm">
									Responderemos em breve.
								</p>
							</div>
						</motion.div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Nome */}
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-semibold text-gray-900 mb-2"
							>
								Nome
							</label>
							<input
								type="text"
								id="name"
								name="name"
								value={formData.name}
								onChange={handleChange}
								required
								placeholder="Seu nome completo"
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
							/>
						</div>

						{/* Email */}
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-semibold text-gray-900 mb-2"
							>
								Email
							</label>
							<input
								type="email"
								id="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								required
								placeholder="seu.email@exemplo.com"
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
							/>
						</div>

						{/* Mensagem */}
						<div>
							<label
								htmlFor="message"
								className="block text-sm font-semibold text-gray-900 mb-2"
							>
								Mensagem
							</label>
							<textarea
								id="message"
								name="message"
								value={formData.message}
								onChange={handleChange}
								required
								rows="6"
								placeholder="Digite sua mensagem aqui..."
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent resize-none"
							/>
						</div>

						{/* Submit Button */}
						<button
							type="submit"
							disabled={loading}
							className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						>
							<Send size={20} />
							{loading ? "Enviando..." : "Enviar Mensagem"}
						</button>
					</form>
				</motion.section>

				{/* Additional Info */}
				<motion.section
					className="mt-16 bg-primary-50 rounded-lg p-8"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={fadeUp}
				>
					<h3 className="text-2xl font-bold text-gray-900 mb-4">
						Perguntas Frequentes
					</h3>
					<ul className="space-y-4 text-gray-700">
						<li className="flex gap-3">
							<span className="text-primary-600 font-bold">•</span>
							<span>
								<strong>Quanto tempo leva para receber uma resposta?</strong>
								<p className="text-sm mt-1">
									Respondemos a todos os emails em até 24 horas úteis.
								</p>
							</span>
						</li>
						<li className="flex gap-3">
							<span className="text-primary-600 font-bold">•</span>
							<span>
								<strong>Qual é o melhor meio de contato para urgências?</strong>
								<p className="text-sm mt-1">
									Para questões urgentes, recomendamos ligar para nosso telefone
									de atendimento.
								</p>
							</span>
						</li>
						<li className="flex gap-3">
							<span className="text-primary-600 font-bold">•</span>
							<span>
								<strong>Vocês atendem fora do horário comercial?</strong>
								<p className="text-sm mt-1">
									Nosso atendimento é de segunda a sexta das 09h às 18h. Você
									pode enviar email a qualquer momento.
								</p>
							</span>
						</li>
					</ul>
				</motion.section>
			</div>
		</div>
	);
}
