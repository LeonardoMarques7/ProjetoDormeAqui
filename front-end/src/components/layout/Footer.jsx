import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { fadeUp } from "@/lib/animations";
import iconsBrands from "@/assets/icons/iconsBrands.png";
import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
	const currentYear = new Date().getFullYear();

	return (
		<motion.footer
			variants={fadeUp}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, amount: 0.3 }}
			className="mx-auto mt-5 w-full max-w-7xl text-gray-900 bg-accent rounded-2xl border border-gray-100"
		>
			<div className="py-12 px-8 max-sm:px-6 max-sm:py-8">
				{/* Top Section - Logo, Description, Payment Methods */}
				<div className="grid md:grid-cols-3 gap-8 mb-12 pb-8 border-b border-gray-200">
					{/* Brand & Description */}
					<div>
						<h3 className="text-lg font-bold text-gray-900 mb-2">DormeAqui</h3>
						<p className="text-sm text-gray-600 leading-relaxed">
							Plataforma de reservas de hospedagem que conecta hóspedes a
							anfitriões locais em Sorocaba.
						</p>
					</div>

					{/* Quick Links */}
					<div>
						<h4 className="font-semibold text-gray-900 mb-4">Links</h4>
						<ul className="space-y-2 text-sm">
							<li>
								<Link
									to="/about"
									className="text-gray-600 hover:text-primary-600 transition-colors"
								>
									Sobre nós
								</Link>
							</li>
							<li>
								<Link
									to="/contact"
									className="text-gray-600 hover:text-primary-600 transition-colors"
								>
									Contato
								</Link>
							</li>
							<li>
								<Link
									to="/"
									className="text-gray-600 hover:text-primary-600 transition-colors"
								>
									Explorar hospedagens
								</Link>
							</li>
						</ul>
					</div>

					{/* Payment Methods */}
					<div>
						<h4 className="font-semibold text-gray-900 mb-4">
							Formas de Pagamento
						</h4>
						<img
							src={iconsBrands}
							alt="Formas de pagamento aceitas"
							className="h-6 object-contain"
						/>
						<p className="text-xs text-gray-500 mt-2">
							Cartão, PIX e parcelado via Stripe
						</p>
					</div>
				</div>

				{/* Middle Section - Contact & Legal */}
				<div className="grid md:grid-cols-2 gap-8 mb-12 pb-8 border-b border-gray-200">
					{/* Contact Info */}
					<div>
						<h4 className="font-semibold text-gray-900 mb-4">
							Contato e Suporte
						</h4>
						<div className="space-y-3 text-sm">
							<div className="flex items-center gap-2">
								<Mail className="w-4 h-4 text-primary-600" />
								<a
									href="mailto:projeto.dormeaqui@gmail.com"
									className="text-gray-600 hover:text-primary-600 transition-colors"
								>
									projeto.dormeaqui@gmail.com
								</a>
							</div>

							<div className="flex items-center gap-2">
								<MapPin className="w-4 h-4 text-primary-600" />
								<span className="text-gray-600">
									Sorocaba – São Paulo – Brasil
								</span>
							</div>
						</div>
					</div>

					{/* Legal & Policies */}
					<div>
						<h4 className="font-semibold text-gray-900 mb-4">
							Políticas e Termos
						</h4>
						<ul className="space-y-2 text-sm">
							<li>
								<Link
									to="/terms"
									className="text-gray-600 hover:text-primary-600 transition-colors"
								>
									Termos de Serviço
								</Link>
							</li>
							<li>
								<Link
									to="/privacy"
									className="text-gray-600 hover:text-primary-600 transition-colors"
								>
									Política de Privacidade
								</Link>
							</li>
							<li>
								<a
									href="mailto:projeto.dormeaqui@gmail.com"
									className="text-gray-600 hover:text-primary-600 transition-colors"
								>
									Reportar Problemas
								</a>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom Section - Copyright */}
				<div className="text-center pt-6 border-t border-gray-200">
					<p className="text-xs text-gray-500 mb-2">
						© {currentYear} DormeAqui. Todos os direitos reservados.
					</p>
					<p className="text-xs text-gray-500">
						Desenvolvido com ❤️ para conectar hóspedes e anfitriões em Sorocaba
					</p>
				</div>
			</div>
		</motion.footer>
	);
};

export default Footer;
