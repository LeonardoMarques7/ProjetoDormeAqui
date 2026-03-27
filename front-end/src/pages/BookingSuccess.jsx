import React from "react";
import { ArrowRight, Home, Waves, Dumbbell } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { ImageWithFallback } from "@/components/ui/figma/ImageWithFallback";
import CheckoutPreview from "../components/CheckoutPreview";

const PaymentSuccess = ({ className, bookingData, ...props }) => {
	// Use bookingDetails from existing logic, fallback to mock
	const defaultBooking = {
		place: {
			name: "Resort Paradise Tropical",
			address: "Av. Beira Mar, 1500 - Praia do Forte, BA, 48280-000",
			photoUrl:
				"https://images.unsplash.com/photo-1690199827629-552c41f6450f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjByZXNvcnQlMjBob3RlbCUyMGV4dGVyaW9yJTIwdHJvcGljYWx8ZW58MXx8fHwxNzc0NDc3NTc2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
		},
		user: {
			name: "Maria Silva",
		},
		pricePerNight: 450.0,
		priceTotal: 1350.0,
		checkin: "2026-04-10",
		checkout: "2026-04-13",
		guests: 2,
		nights: 3,
		paymentStatus: "approved",
		mercadopagoPaymentId: "MP-123456789",
	};

	const booking = bookingData || defaultBooking;

	// Formatação de datas
	const formatDate = (dateStr) => {
		const date = new Date(dateStr);
		return new Intl.DateTimeFormat("pt-BR", {
			weekday: "short",
			day: "2-digit",
			month: "short",
		}).format(date);
	};

	const formatDateFull = (dateStr) => {
		const date = new Date(dateStr);
		return new Intl.DateTimeFormat("pt-BR", {
			day: "2-digit",
			month: "long",
			year: "numeric",
		}).format(date);
	};

	return (
		<div
			data-slot="booking-success"
			className={twMerge("min-h-screen bg-cover bg-center relative", className)}
			style={{
				backgroundImage: `url(${booking.place.photoUrl})`,
			}}
			{...props}
		>
			{/* Overlay */}
			<div className="absolute inset-0 bg-black/40" />

			{/* Content */}
			<div className="relative z-10 min-h-screen p-8 flex flex-col">
				{/* Header */}
				<div className="flex items-start justify-between mb-8">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 bg-white rounded flex items-center justify-center">
							<Home className="size-5 text-blue-700" />
						</div>
						<span className="text-white text-xs tracking-wider uppercase">
							{booking.place.name}
						</span>
					</div>
					<span className="text-white text-xs tracking-wider uppercase">
						Confirmação de Reserva
					</span>
				</div>

				{/* Main Content */}
				<div className="flex-1 flex items-center justify-center">
					<div className="w-full max-w-7xl grid grid-cols-3 gap-0 bg-white rounded-lg overflow-hidden shadow-2xl">
						{/* Left Column - Booking Details */}
						<div className="bg-stone-50 p-8 flex flex-col">
							<div className="mb-8">
								<h1 className="text-2xl font-semibold text-gray-900 mb-1">
									Olá, {booking.user?.name || "Visitante"}!
								</h1>
								<p className="text-blue-600 text-sm">
									Ficamos felizes em recebê-lo(a)!
								</p>
							</div>

							{/* Booking Info */}
							<div className="space-y-6 mb-8">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<div className="text-xs text-gray-500 mb-1">CHECK-IN</div>
										<div className="font-semibold text-gray-900">
											{formatDate(booking.checkin)}
										</div>
									</div>
									<div>
										<div className="text-xs text-gray-500 mb-1">CHECK-OUT</div>
										<div className="font-semibold text-gray-900">
											{formatDate(booking.checkout)}
										</div>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<div className="text-xs text-gray-500 mb-1">HÓSPEDES</div>
										<div className="font-semibold text-gray-900">
											{booking.guests}{" "}
											{booking.guests === 1 ? "Pessoa" : "Pessoas"}
										</div>
									</div>
									<div>
										<div className="text-xs text-gray-500 mb-1">NOITES</div>
										<div className="font-semibold text-gray-900">
											{booking.nights}{" "}
											{booking.nights === 1 ? "Noite" : "Noites"}
										</div>
									</div>
								</div>

								<div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
									<div className="flex justify-between items-center">
										<span className="text-sm text-gray-600">
											Valor por noite
										</span>
										<span className="font-semibold text-gray-900">
											R$ {booking.pricePerNight?.toFixed(2) || "0,00"}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm text-gray-600">Total</span>
										<span className="font-semibold text-gray-900">
											R$ {booking.priceTotal?.toFixed(2) || "0,00"}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm text-gray-600">Status</span>
										<span className="font-semibold text-emerald-600">
											Confirmado
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm text-gray-600">Pagamento via</span>
										<span className="font-semibold text-gray-900">
											MercadoPago
										</span>
									</div>
									{booking.mercadopagoPaymentId && (
										<div className="pt-2 border-t border-gray-200">
											<span className="text-xs text-gray-500">ID: </span>
											<span className="text-xs text-gray-700 font-mono">
												{booking.mercadopagoPaymentId}
											</span>
										</div>
									)}
								</div>

								<button
									className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
									aria-label="Baixar comprovante"
									onClick={() => window.print()}
								>
									Baixar Comprovante
									<ArrowRight className="size-4" />
								</button>
							</div>

							{/* Footer Text */}
							<div className="mt-auto pt-6 border-t border-gray-200">
								<p className="text-xs text-gray-500 leading-relaxed">
									Sua reserva foi confirmada com sucesso! Prepare-se para uma
									experiência inesquecível. Nossa equipe está à disposição para
									tornar sua estadia perfeita. Em caso de dúvidas, entre em
									contato através dos nossos canais de atendimento.
								</p>
							</div>
						</div>

						{/* Middle Column - What to do */}
						<div className="bg-blue-700 text-white p-8">
							<h2 className="text-2xl font-semibold mb-8">O que fazer</h2>

							<div className="space-y-6 mb-12">
								{/* Piscinas */}
								<div className="flex gap-4">
									<div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
										<Waves className="size-6" />
									</div>
									<div>
										<h3 className="font-semibold mb-1">PISCINAS AQUECIDAS</h3>
										<p className="text-sm text-blue-100 leading-relaxed">
											Aproveite nossas piscinas aquecidas com vista para o mar.
											Um espaço perfeito para relaxar e curtir o sol, com bar
											molhado e área kids exclusiva.
										</p>
									</div>
								</div>

								{/* Spa */}
								<div className="flex gap-4">
									<div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
										<svg
											className="size-6"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
											/>
										</svg>
									</div>
									<div>
										<h3 className="font-semibold mb-1">SPA & WELLNESS</h3>
										<p className="text-sm text-blue-100 leading-relaxed">
											Nosso spa oferece tratamentos exclusivos com produtos
											naturais. Massagens, sauna, hidromassagem e terapias
											holísticas para seu bem-estar completo.
										</p>
									</div>
								</div>

								{/* Academia */}
								<div className="flex gap-4">
									<div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
										<Dumbbell className="size-6" />
									</div>
									<div>
										<h3 className="font-semibold mb-1">ACADEMIA & ESPORTES</h3>
										<p className="text-sm text-blue-100 leading-relaxed">
											Academia completa, quadras de tênis e vôlei de praia.
											Personal trainers disponíveis e aulas coletivas de yoga,
											pilates e funcional.
										</p>
									</div>
								</div>
							</div>

							{/* Important Numbers */}
							<div className="bg-blue-800/50 rounded-lg p-6">
								<h3 className="font-semibold mb-4">Números Importantes</h3>
								<div className="space-y-3">
									<div className="flex justify-between items-center">
										<span className="text-sm">Recepção 24h</span>
										<span className="text-sm font-mono">(75) 3676-1234</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm">Serviço de Quarto</span>
										<span className="text-sm font-mono">(75) 3676-1235</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm">Concierge</span>
										<span className="text-sm font-mono">(75) 3676-1236</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-sm">Restaurante</span>
										<span className="text-sm font-mono">(75) 3676-1237</span>
									</div>
								</div>
							</div>
						</div>

						{/* Right Column - Map */}
						<div className="bg-sky-200 p-8 flex flex-col">
							{/* Map Placeholder */}
							<div className="relative bg-sky-100 rounded-lg overflow-hidden mb-6 flex-1">
								{/* Simplified map representation */}
								<div className="absolute inset-0 p-4">
									<div className="relative w-full h-full">
										{/* Map roads/paths */}
										<svg
											className="absolute inset-0 w-full h-full"
											viewBox="0 0 300 400"
										>
											{/* Simplified road paths */}
											<path
												d="M50 200 L250 150"
												stroke="#93c5fd"
												strokeWidth="3"
												fill="none"
											/>
											<path
												d="M150 50 L150 350"
												stroke="#93c5fd"
												strokeWidth="3"
												fill="none"
											/>
											<path
												d="M100 300 L250 280"
												stroke="#93c5fd"
												strokeWidth="3"
												fill="none"
											/>
											<circle
												cx="80"
												cy="120"
												r="20"
												fill="#38bdf8"
												opacity="0.3"
											/>
											<circle
												cx="200"
												cy="250"
												r="30"
												fill="#38bdf8"
												opacity="0.3"
											/>
										</svg>

										{/* Beach area */}
										<div className="absolute left-1/4 top-1/3 w-32 h-32 bg-blue-200/40 rounded-full" />

										{/* Location Pin */}
										<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
											<svg
												className="w-12 h-12 text-red-600"
												viewBox="0 0 24 24"
												fill="currentColor"
											>
												<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
											</svg>
										</div>

										{/* Labels */}
										<div className="absolute right-4 top-8">
											<div className="bg-white px-2 py-1 rounded text-xs font-medium text-gray-900 border border-gray-300">
												Centro da Vila
											</div>
										</div>

										<div className="absolute left-1/3 top-1/2">
											<div className="bg-white px-2 py-1 rounded-lg text-xs">
												<div className="font-semibold text-blue-700">
													{booking.place.name}
												</div>
												<div className="text-blue-700">Resort & Spa</div>
												<div className="text-emerald-600 text-[10px]">
													5 estrelas com
												</div>
												<div className="text-emerald-600 text-[10px]">
													vista para o mar
												</div>
												<div className="text-blue-600 text-[10px] underline">
													Sua reserva
												</div>
											</div>
										</div>

										<div className="absolute left-4 bottom-12 text-gray-700 font-medium text-sm">
											Praia do Forte
										</div>

										<div className="absolute right-8 bottom-8 text-gray-700 font-medium text-sm">
											Centro
										</div>
									</div>
								</div>
							</div>

							{/* Location Details */}
							<div className="bg-white rounded-lg p-4 space-y-4">
								<div className="flex items-start gap-3">
									<div className="flex-1">
										<h3 className="font-semibold text-gray-900 mb-1">
											{booking.place.name}
										</h3>
										<p className="text-xs text-gray-600">
											{booking.place.address}
										</p>
									</div>
									<ImageWithFallback
										src={booking.place.photoUrl}
										alt={booking.place.name}
										className="w-16 h-16 rounded object-cover"
									/>
								</div>

								<button
									className="w-full bg-white border border-gray-300 text-gray-900 py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
									aria-label="Abrir no Google Maps"
								>
									Abrir no Google Maps
									<ArrowRight className="size-4" />
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="flex items-end justify-between mt-8">
					<span className="text-white text-xs tracking-wider uppercase">
						{booking.place.name}
					</span>
					<span className="text-white text-xs tracking-wider uppercase">
						Reserva confirmada em {formatDateFull(new Date().toISOString())}
					</span>
				</div>
			</div>
		</div>
	);
};

export default PaymentSuccess;
