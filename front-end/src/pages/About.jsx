import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, ShieldCheck, Zap } from 'lucide-react';

const fadeUp = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function About() {
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
						Sobre o DormeAqui
					</h1>
					<p className="text-xl text-primary-100 max-w-2xl mx-auto">
						Conectando hóspedes a anfitriões locais em Sorocaba para
						hospedagens e experiências autênticas
					</p>
				</div>
			</motion.section>

			{/* Main Content */}
			<div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
				{/* 1.1 O que é o DormeAqui */}
				<motion.section
					className="mb-16"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={fadeUp}
				>
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						1.1 O que é o DormeAqui?
					</h2>
					<p className="text-lg text-gray-700 leading-relaxed">
						O DormeAqui é uma plataforma digital inovadora que conecta
						hóspedes a anfitriões locais em Sorocaba, permitindo a
						descoberta e reserva de hospedagens e experiências autênticas na
						cidade. Nossa missão é facilitar conexões entre viajantes e
						comunidades locais, promovendo o turismo sustentável e o
						desenvolvimento regional.
					</p>
				</motion.section>

				{/* 1.2 Quem somos */}
				<motion.section
					className="mb-16"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={fadeUp}
				>
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						1.2 Quem somos
					</h2>
					<p className="text-lg text-gray-700 leading-relaxed">
						O projeto é liderado por entusiastas da tecnologia e do
						desenvolvimento regional, com o objetivo de valorizar o turismo
						local e fortalecer a economia da cidade de Sorocaba. Acreditamos
						que a tecnologia pode ser um instrumento poderoso para
						empoderar pequenos negócios e criar oportunidades de crescimento
						para comunidades.
					</p>
				</motion.section>

				{/* 1.3 Como funciona */}
				<motion.section
					className="mb-16"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={fadeUp}
				>
					<h2 className="text-3xl font-bold text-gray-900 mb-8">
						1.3 Como funciona
					</h2>

					<div className="grid md:grid-cols-3 gap-8">
						{/* 1.3.1 Exploração */}
						<motion.div
							className="bg-white rounded-lg p-6 shadow-md border-l-4 border-primary-600"
							variants={fadeUp}
						>
							<Zap className="w-10 h-10 text-primary-600 mb-4" />
							<h3 className="text-xl font-semibold text-gray-900 mb-3">
								1.3.1 Exploração
							</h3>
							<p className="text-gray-700">
								Os usuários podem navegar pela plataforma para descobrir
								hospedagens únicas e experiências locais como roteiros
								gastronômicos, eventos culturais e atividades de bem-estar.
							</p>
						</motion.div>

						{/* 1.3.2 Reserva segura */}
						<motion.div
							className="bg-white rounded-lg p-6 shadow-md border-l-4 border-primary-600"
							variants={fadeUp}
						>
							<ShieldCheck className="w-10 h-10 text-primary-600 mb-4" />
							<h3 className="text-xl font-semibold text-gray-900 mb-3">
								1.3.2 Reserva Segura
							</h3>
							<p className="text-gray-700">
								As reservas são realizadas diretamente pela plataforma e os
								pagamentos são processados por meio da infraestrutura segura
								da Stripe.
							</p>
						</motion.div>

						{/* 1.3.3 Hospedagem e experiência */}
						<motion.div
							className="bg-white rounded-lg p-6 shadow-md border-l-4 border-primary-600"
							variants={fadeUp}
						>
							<MapPin className="w-10 h-10 text-primary-600 mb-4" />
							<h3 className="text-xl font-semibold text-gray-900 mb-3">
								1.3.3 Hospedagem
							</h3>
							<p className="text-gray-700">
								Após a confirmação da reserva, o hóspede realiza sua estadia
								enquanto o anfitrião oferece a experiência contratada.
							</p>
						</motion.div>
					</div>
				</motion.section>

				{/* 1.4 Modelo de serviço */}
				<motion.section
					className="mb-16 bg-primary-50 rounded-lg p-8"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={fadeUp}
				>
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						1.4 Modelo de Serviço
					</h2>
					<p className="text-lg text-gray-700 leading-relaxed">
						O DormeAqui atua como intermediador entre hóspedes e anfitriões.
						Uma taxa de serviço pode ser aplicada às reservas para
						manutenção e operação da plataforma. Este modelo garante que
						possamos continuar oferecendo uma plataforma segura, confiável e
						inovadora para todos os usuários.
					</p>
				</motion.section>

				{/* 1.5 Missão e propósito */}
				<motion.section
					className="mb-16"
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={fadeUp}
				>
					<h2 className="text-3xl font-bold text-gray-900 mb-4">
						1.5 Missão e Propósito
					</h2>
					<p className="text-lg text-gray-700 leading-relaxed mb-6">
						Nosso objetivo é promover o turismo regional sustentável e
						fortalecer pequenos negócios locais por meio da tecnologia.
						Acreditamos que cada interação na plataforma contribui para o
						desenvolvimento econômico e social de Sorocaba.
					</p>

					<div className="bg-white rounded-lg p-6 border-2 border-primary-200">
						<div className="flex items-center gap-3 mb-4">
							<Users className="w-6 h-6 text-primary-600" />
							<h3 className="text-xl font-semibold text-gray-900">
								Nossos Valores
							</h3>
						</div>
						<ul className="space-y-2 text-gray-700">
							<li>✓ Transparência em todas as operações</li>
							<li>✓ Segurança e confiança dos usuários</li>
							<li>✓ Sustentabilidade e responsabilidade social</li>
							<li>✓ Inovação contínua</li>
							<li>✓ Apoio ao turismo local e economia regional</li>
						</ul>
					</div>
				</motion.section>
			</div>
		</div>
	);
}
