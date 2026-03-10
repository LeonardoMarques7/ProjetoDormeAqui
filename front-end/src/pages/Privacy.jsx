import React from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Trash2 } from "lucide-react";

const fadeUp = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Privacy() {
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
						Política de Privacidade
					</h1>
					<p className="text-xl text-primary-100">
						Sua privacidade é importante para nós
					</p>
				</div>
			</motion.section>

			{/* Main Content */}
			<div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
				<motion.div
					className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={fadeUp}
				>
					<p className="text-sm text-blue-900">
						<strong>Última atualização:</strong>{" "}
						{new Date().toLocaleDateString("pt-BR")}
					</p>
					<p className="text-sm text-blue-800 mt-2">
						Esta política de privacidade explica como o DormeAqui coleta,
						utiliza e protege seus dados pessoais em conformidade com a Lei
						Geral de Proteção de Dados (LGPD).
					</p>
				</motion.div>

				{/* 3.1 Coleta de dados */}
				<motion.section
					className="mb-12"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={fadeUp}
				>
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						3.1 Coleta de Dados
					</h2>
					<p className="text-gray-700 leading-relaxed mb-4">
						Coletamos informações como:
					</p>
					<ul className="space-y-2 text-gray-700 mb-4">
						<li>✓ Nome completo</li>
						<li>✓ Email e telefone</li>
						<li>✓ Dados de endereço (para verificação de identidade)</li>
						<li>✓ Informações de pagamento (processadas via Stripe)</li>
						<li>✓ Histórico de reservas e interações na plataforma</li>
						<li>✓ Dados de navegação e preferências de uso</li>
					</ul>
					<p className="text-gray-700">
						Estes dados são coletados quando você cria uma conta, faz uma
						reserva ou interage com nossa plataforma.
					</p>
				</motion.section>

				{/* 3.2 Uso das informações */}
				<motion.section
					className="mb-12"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={fadeUp}
				>
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						3.2 Uso das Informações
					</h2>
					<p className="text-gray-700 leading-relaxed mb-4">
						Os dados coletados são utilizados para:
					</p>
					<ul className="space-y-2 text-gray-700">
						<li>✓ Processar e confirmar suas reservas</li>
						<li>✓ Realizar transações de pagamento de forma segura</li>
						<li>✓ Melhorar a experiência do usuário na plataforma</li>
						<li>✓ Garantir a segurança da plataforma e prevenir fraudes</li>
						<li>
							✓ Enviar confirmações, atualizações e notificações de reserva
						</li>
						<li>✓ Oferecer suporte ao cliente</li>
						<li>✓ Análise de uso e melhoria de serviços</li>
					</ul>
				</motion.section>

				{/* 3.3 Compartilhamento de dados */}
				<motion.section
					className="mb-12 bg-orange-50 rounded-lg p-6 border border-orange-200"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={fadeUp}
				>
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						3.3 Compartilhamento de Dados
					</h2>
					<p className="text-gray-700 leading-relaxed mb-4">
						Alguns dados podem ser compartilhados com:
					</p>
					<ul className="space-y-2 text-gray-700">
						<li>
							<strong>Processadores de Pagamento (Stripe):</strong> Para
							processamento seguro de transações, verificação de identidade e
							prevenção de fraude.
						</li>
						<li>
							<strong>Anfitriões:</strong> Informações essenciais para
							confirmação e realização da reserva.
						</li>
						<li>
							<strong>Autoridades:</strong> Quando exigido por lei ou ordem
							judicial.
						</li>
					</ul>
					<p className="text-gray-700 mt-4 text-sm">
						Não vendemos seus dados a terceiros para fins de marketing.
					</p>
				</motion.section>

				{/* 3.4 Segurança dos dados */}
				<motion.section
					className="mb-12"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={fadeUp}
				>
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						3.4 Segurança dos Dados
					</h2>
					<p className="text-gray-700 leading-relaxed mb-4">
						Utilizamos múltiplas camadas de proteção:
					</p>
					<ul className="space-y-2 text-gray-700">
						<li>✓ Criptografia SSL/TLS em todas as conexões</li>
						<li>✓ Senhas criptografadas com algoritmos de hash</li>
						<li>✓ Segurança de infraestrutura em nuvem</li>
						<li>✓ Conformidade com padrões PCI-DSS para dados de pagamento</li>
						<li>✓ Auditorias regulares de segurança</li>
						<li>✓ Restrição de acesso aos dados internamente</li>
					</ul>
				</motion.section>

				{/* 3.5 Cookies */}
				<motion.section
					className="mb-12"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={fadeUp}
				>
					<h2 className="text-3xl font-bold text-gray-900 mb-4">3.5 Cookies</h2>
					<p className="text-gray-700 leading-relaxed">
						Utilizamos cookies para:
					</p>
					<ul className="space-y-2 text-gray-700 mt-4">
						<li>
							<strong>Autenticação:</strong> Manter sua sessão segura e ativa.
						</li>
						<li>
							<strong>Preferências:</strong> Lembrar suas preferências de
							navegação.
						</li>
						<li>
							<strong>Análise:</strong> Entender como você usa nossa plataforma
							para melhorar o serviço.
						</li>
					</ul>
					<p className="text-gray-700 mt-4 text-sm">
						Você pode controlar cookies através das configurações do seu
						navegador.
					</p>
				</motion.section>

				{/* 3.6 Direitos do usuário */}
				<motion.section
					className="mb-12 bg-green-50 rounded-lg p-6 border border-green-200"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={fadeUp}
				>
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						3.6 Direitos do Usuário (LGPD)
					</h2>
					<p className="text-gray-700 leading-relaxed mb-4">
						Conforme a Lei Geral de Proteção de Dados (LGPD), você tem direito
						a:
					</p>
					<ul className="space-y-3 text-gray-700">
						<li className="flex gap-3">
							<Eye className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
							<span>
								<strong>Acessar</strong> todos os dados que temos sobre você
							</span>
						</li>
						<li className="flex gap-3">
							<Lock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
							<span>
								<strong>Corrigir</strong> informações incompletas ou incorretas
							</span>
						</li>
						<li className="flex gap-3">
							<Trash2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
							<span>
								<strong>Deletar</strong> seus dados em certos contextos
							</span>
						</li>
						<li className="flex gap-3">
							<Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
							<span>
								<strong>Revogar consentimento</strong> para processamento de
								dados
							</span>
						</li>
					</ul>
					<p className="text-gray-700 mt-4">
						Para exercer esses direitos, envie um email para{" "}
						<a
							href="mailto:projeto.dormeaqui@gmail.com"
							className="text-green-700 font-semibold hover:underline"
						>
							projeto.dormeaqui@gmail.com
						</a>
					</p>
				</motion.section>

				{/* Contato */}
				<motion.section
					className="bg-gray-100 rounded-lg p-6"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={fadeUp}
				>
					<h3 className="text-2xl font-bold text-gray-900 mb-3">
						Dúvidas sobre Privacidade?
					</h3>
					<p className="text-gray-700 mb-3">
						Se tiver dúvidas sobre esta política de privacidade ou deseje
						exercer seus direitos, entre em contato:
					</p>
					<p className="text-gray-700">
						<strong>Email:</strong>{" "}
						<a
							href="mailto:projeto.dormeaqui@gmail.com"
							className="text-primary-600 font-semibold hover:underline"
						>
							projeto.dormeaqui@gmail.com
						</a>
					</p>
				</motion.section>
			</div>
		</div>
	);
}
