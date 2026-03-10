import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Users, CreditCard } from "lucide-react";

const fadeUp = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Terms() {
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
						Termos de Serviço
					</h1>
					<p className="text-xl text-primary-100">
						Direitos e responsabilidades na plataforma DormeAqui
					</p>
				</div>
			</motion.section>

			{/* Main Content */}
			<div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
				<motion.div
					className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={fadeUp}
				>
					<AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
					<div>
						<p className="font-semibold text-red-900">Leia atentamente</p>
						<p className="text-sm text-red-800 mt-1">
							Ao acessar e usar a plataforma DormeAqui, você concorda com estes
							termos de serviço. Se não concordar, não use a plataforma.
						</p>
					</div>
				</motion.div>

				{/* 4.1 Aceitação dos termos */}
				<motion.section
					className="mb-12"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={fadeUp}
				>
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						4.1 Aceitação dos Termos
					</h2>
					<p className="text-gray-700 leading-relaxed">
						Ao utilizar a plataforma DormeAqui, você concorda automaticamente
						com estes termos de serviço. Recomendamos ler cuidadosamente todos
						os termos antes de criar uma conta ou realizar uma reserva. O
						DormeAqui se reserva o direito de modificar estes termos a qualquer
						momento.
					</p>
				</motion.section>

				{/* 4.2 Cadastro de conta */}
				<motion.section
					className="mb-12 bg-blue-50 rounded-lg p-6 border-l-4 border-blue-600"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={fadeUp}
				>
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						4.2 Cadastro de Conta
					</h2>
					<p className="text-gray-700 leading-relaxed mb-4">
						Os usuários devem fornecer informações verdadeiras, precisas e
						atualizadas ao criar uma conta. Você é responsável por:
					</p>
					<ul className="space-y-2 text-gray-700">
						<li>✓ Manter a confidencialidade de sua senha</li>
						<li>✓ Notificar-nos imediatamente sobre acessos não autorizados</li>
						<li>✓ Cumprir toda a legislação aplicável ao usar a plataforma</li>
						<li>✓ Manter informações de conta atualizadas</li>
					</ul>
				</motion.section>

				{/* 4.3 Reservas e pagamentos */}
				<motion.section
					className="mb-12"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={fadeUp}
				>
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						4.3 Reservas e Pagamentos
					</h2>
					<p className="text-gray-700 leading-relaxed mb-4">
						As reservas são realizadas através da plataforma DormeAqui e os
						pagamentos são processados com segurança pela Stripe. Você concorda
						que:
					</p>
					<ul className="space-y-2 text-gray-700">
						<li>
							✓ É responsável por fornecer informações de pagamento precisas
						</li>
						<li>✓ Autoriza a Stripe a processar pagamentos em seu nome</li>
						<li>✓ Compreende que os valores podem incluir taxas de serviço</li>
						<li>
							✓ Recebará confirmação de reserva via email após o pagamento
						</li>
					</ul>
				</motion.section>

				{/* 4.4 Cancelamentos e reembolsos */}
				<motion.section
					className="mb-12"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={fadeUp}
				>
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						4.4 Cancelamentos e Reembolsos
					</h2>
					<p className="text-gray-700 leading-relaxed">
						Políticas de cancelamento podem variar dependendo da hospedagem ou
						experiência selecionada. Antes de completar sua reserva, você terá
						acesso à política de cancelamento específica. Reembolsos, se
						aplicáveis, serão processados dentro de 5-10 dias úteis pela Stripe
						para sua conta original.
					</p>
				</motion.section>

				{/* 4.5 Responsabilidades do anfitrião */}
				<motion.section
					className="mb-12 bg-purple-50 rounded-lg p-6"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={fadeUp}
				>
					<div className="flex gap-3 mb-4">
						<Users className="w-6 h-6 text-purple-600 flex-shrink-0" />
						<h2 className="text-3xl font-bold text-gray-900">
							4.5 Responsabilidades do Anfitrião
						</h2>
					</div>
					<p className="text-gray-700 leading-relaxed mb-4">
						Os anfitriões são responsáveis por:
					</p>
					<ul className="space-y-2 text-gray-700">
						<li>
							✓ Garantir que as informações das hospedagens estejam corretas e
							atualizadas
						</li>
						<li>✓ Oferecer a experiência/hospedagem conforme descrito</li>
						<li>✓ Manter a hospedagem em condições adequadas</li>
						<li>✓ Cumprir todas as leis e regulamentações aplicáveis</li>
						<li>✓ Comunicar-se profissionalmente com os hóspedes</li>
						<li>
							✓ Responder a questões e preocupações dos hóspedes em tempo hábil
						</li>
					</ul>
				</motion.section>

				{/* 4.6 Responsabilidades do hóspede */}
				<motion.section
					className="mb-12 bg-green-50 rounded-lg p-6"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={fadeUp}
				>
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						4.6 Responsabilidades do Hóspede
					</h2>
					<p className="text-gray-700 leading-relaxed mb-4">
						Os hóspedes devem:
					</p>
					<ul className="space-y-2 text-gray-700">
						<li>✓ Respeitar as regras e políticas da hospedagem</li>
						<li>✓ Cuidar adequadamente da propriedade durante a estadia</li>
						<li>✓ Não danificar a propriedade ou pertences do anfitrião</li>
						<li>✓ Comunicar-se respeitosamente com o anfitrião</li>
						<li>✓ Respeitar os horários de check-in e check-out</li>
						<li>✓ Cumprir todas as leis e regulamentações aplicáveis</li>
					</ul>
				</motion.section>

				{/* 4.7 Limitação de responsabilidade */}
				<motion.section
					className="mb-12 bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-600"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={fadeUp}
				>
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						4.7 Limitação de Responsabilidade
					</h2>
					<p className="text-gray-700 leading-relaxed">
						O DormeAqui atua como intermediador entre hóspedes e anfitriões e
						não é responsável por eventos fora de seu controle, incluindo:
						cancelamentos de anfitriões, danos à propriedade, conflitos entre
						partes, eventos climáticos, ou qualquer outra circunstância
						extraordinária. O DormeAqui não oferece garantias explícitas ou
						implícitas sobre hospedagens ou experiências listadas.
					</p>
				</motion.section>

				{/* 4.8 Modificações dos termos */}
				<motion.section
					className="mb-12"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={fadeUp}
				>
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						4.8 Modificações dos Termos
					</h2>
					<p className="text-gray-700 leading-relaxed">
						Os termos de serviço podem ser atualizados periodicamente para
						refletir mudanças na plataforma, legislação aplicável ou operações.
						Notificaremos aos usuários sobre mudanças significativas. O uso
						contínuo da plataforma após notificação de mudanças implica
						aceitação dos novos termos.
					</p>
				</motion.section>

				{/* Disposições Gerais */}
				<motion.section
					className="bg-gray-100 rounded-lg p-6"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={fadeUp}
				>
					<h3 className="text-2xl font-bold text-gray-900 mb-4">
						Disposições Gerais
					</h3>
					<div className="space-y-4 text-gray-700">
						<div>
							<h4 className="font-semibold text-gray-900 mb-2">Proibições</h4>
							<p>
								É proibido usar a plataforma para atividades ilegais, fraude,
								assédio, ou qualquer propósito prejudicial.
							</p>
						</div>
						<div>
							<h4 className="font-semibold text-gray-900 mb-2">
								Encerramento de Conta
							</h4>
							<p>
								O DormeAqui se reserva o direito de suspender ou encerrar contas
								que violem estes termos.
							</p>
						</div>
						<div>
							<h4 className="font-semibold text-gray-900 mb-2">
								Lei Aplicável
							</h4>
							<p>
								Estes termos são regidos pelas leis da República Federativa do
								Brasil.
							</p>
						</div>
						<div>
							<h4 className="font-semibold text-gray-900 mb-2">Contato</h4>
							<p>
								Para dúvidas sobre estes termos, entre em contato:
								<a
									href="mailto:projeto.dormeaqui@gmail.com"
									className="text-primary-600 font-semibold hover:underline ml-1"
								>
									projeto.dormeaqui@gmail.com
								</a>
							</p>
						</div>
					</div>
				</motion.section>
			</div>
		</div>
	);
}
