import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { fadeUp } from "@/lib/animations";
import { useFooterHeight } from "@/components/contexts/FooterContext";
import iconsBrands from "@/assets/icons/iconsBrands.png";
import logoPrimary from "@/assets/logo__primary.png";
import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
	const currentYear = new Date().getFullYear();
	const footerElementRef = useRef(null);
	const { observeFooterHeight } = useFooterHeight();

	useEffect(() => {
		if (footerElementRef.current) {
			const unsubscribe = observeFooterHeight(footerElementRef.current);
			return unsubscribe;
		}
	}, [observeFooterHeight]);

	return (
		<motion.footer
			ref={footerElementRef}
			variants={fadeUp}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true, amount: 0.3 }}
			className="mx-auto mt-10 mb-5 w-full max-w-7xl text-gray-900 bg-accent rounded-2xl border border-gray-100"
		>
			<div className="py-10 px-8 max-sm:px-6 max-sm:py-8">
				{/* Top Section - Logo, Description, Payment Methods */}
				<div className="flex justify-between max-sm:justify-center max-sm:flex-col  gap-8 max-sm:mb-0 pb-8 ">
					{/* Brand & Description */}
					<div className="flex  gap-5 max-sm:text-center flex-col">
						<img
							src={logoPrimary}
							className="w-50 max-sm:mx-auto object-contain"
						/>
						<p className="text-sm text-gray-600 leading-relaxed max-w-sm">
							Plataforma de reservas de hospedagem que conecta hóspedes a
							anfitriões locais em Sorocaba.
						</p>
					</div>

					{/* Quick Links */}
					<div className=" flex gap-5 max-sm:text-center max-sm:flex-col mr-15 max-sm:mr-0">
						<div>
							<h4 className="font-semibold text-gray-900 mb-4">
								Contato e Suporte
							</h4>
							<div className="space-y-3 text-sm">
								<div className="flex items-center max-sm:justify-center  gap-2">
									<a
										href="mailto:projeto.dormeaqui@gmail.com"
										className="text-gray-600 hover:underline hover:text-primary-600 transition-colors"
									>
										projeto.dormeaqui@gmail.com
									</a>
								</div>

								<div className="flex items-center max-sm:justify-center gap-2">
									<span className="text-gray-600">
										Sorocaba, São Paulo – Brasil
									</span>
								</div>
							</div>
						</div>
						<div className="">
							<h4 className="font-semibold text-gray-900 mb-4">Links</h4>
							<ul className="space-y-2 list-none text-sm">
								<li>
									<Link
										to="/about"
										className="text-gray-600 hover:underline hover:text-primary-600 transition-colors"
									>
										Sobre nós
									</Link>
								</li>
								<li>
									<Link
										to="/contact"
										className="text-gray-600 hover:underline hover:text-primary-600 transition-colors"
									>
										Contato
									</Link>
								</li>
								<li>
									<Link
										to="/"
										className="text-gray-600 hover:underline hover:text-primary-600 transition-colors"
									>
										Explorar hospedagens
									</Link>
								</li>
							</ul>
						</div>
						<div>
							<h4 className="font-semibold text-gray-900 mb-4">
								Políticas e Termos
							</h4>
							<ul className="space-y-2 list-none text-sm">
								<li>
									<Link
										to="/terms"
										className="text-gray-600 hover:underline hover:text-primary-600 transition-colors"
									>
										Termos de Serviço
									</Link>
								</li>
								<li>
									<Link
										to="/privacy"
										className="text-gray-600 hover:underline hover:text-primary-600 transition-colors"
									>
										Política de Privacidade
									</Link>
								</li>
								<li>
									<a
										href="mailto:projeto.dormeaqui@gmail.com"
										className="text-gray-600 hover:underline hover:text-primary-600 transition-colors"
									>
										Reportar Problemas
									</a>
								</li>
							</ul>
						</div>
					</div>
				</div>

				{/* Bottom Section - Copyright */}
				<div className="pt-10 flex border-t max-sm:flex-col-reverse max-sm:text-center max-sm:gap-8 justify-between items-center  border-gray-200">
					<div>
						<p className="text-xs text-gray-500 mb-2">
							© {currentYear} DormeAqui. Todos os direitos reservados.
						</p>
						<p className="text-xs text-gray-500">
							Desenvolvido com ❤️ para conectar hóspedes e anfitriões em
							Sorocaba
						</p>
					</div>
					{/* Payment Methods */}
					<div>
						<img
							src={iconsBrands}
							alt="Formas de pagamento aceitas"
							className="h-6 max-sm:w-[70svw] max-sm:mx-auto object-contain"
						/>
						<p className="text-xs text-gray-500 mt-2">
							Formas de Pagamento: Cartão, PIX e parcelado via Stripe
						</p>
					</div>
				</div>
			</div>
		</motion.footer>
	);
};

export default Footer;
