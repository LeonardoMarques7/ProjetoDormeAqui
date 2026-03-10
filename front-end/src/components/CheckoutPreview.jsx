import React from 'react';
import { Calendar, Users, MapPin, CreditCard } from 'lucide-react';

export default function CheckoutPreview({ checkoutData, place }) {
	if (!checkoutData || !place) return null;

	const checkIn = new Date(checkoutData.checkIn);
	const checkOut = new Date(checkoutData.checkOut);
	const nights = checkoutData.nights || 0;
	const totalPrice = checkoutData.totalPrice || 0;
	const pricePerNight = checkoutData.pricePerNight || 0;

	const formatDate = (date) => {
		return date.toLocaleDateString('pt-BR', {
			weekday: 'short',
			day: '2-digit',
			month: 'short',
		});
	};

	const formatCurrency = (value) => {
		return new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: 'BRL',
		}).format(value);
	};

	return (
		<div className="w-full bg-white rounded-2xl border border-gray-200 overflow-hidden">
			{/* Imagem da acomodação */}
			{place?.photos && place.photos.length > 0 && (
				<div className="w-full h-48 bg-gray-200 overflow-hidden">
					<img
						src={place.photos[0]}
						alt={place.title}
						className="w-full h-full object-cover"
					/>
				</div>
			)}

			{/* Conteúdo */}
			<div className="p-5 space-y-4">
				{/* Título e localização */}
				<div>
					<h3 className="text-lg font-bold text-gray-900 mb-1">
						{place.title}
					</h3>
					<div className="flex items-center gap-1 text-sm text-gray-600">
						<MapPin size={16} />
						<span>{place.city || place.location}</span>
					</div>
				</div>

				<div className="border-t border-gray-100" />

				{/* Detalhes da reserva */}
				<div className="space-y-3">
					{/* Check-in e Check-out */}
					<div className="flex items-start gap-3">
						<Calendar size={18} className="text-primary-600 mt-0.5 flex-shrink-0" />
						<div>
							<p className="text-xs font-semibold text-gray-500 uppercase mb-1">
								Data da reserva
							</p>
							<div className="flex items-center gap-2 text-sm text-gray-900">
								<span className="font-medium">{formatDate(checkIn)}</span>
								<span className="text-gray-400">→</span>
								<span className="font-medium">{formatDate(checkOut)}</span>
							</div>
							<p className="text-xs text-gray-500 mt-1">
								{nights} {nights === 1 ? 'noite' : 'noites'}
							</p>
						</div>
					</div>

					{/* Hóspedes */}
					<div className="flex items-center gap-3">
						<Users size={18} className="text-primary-600 flex-shrink-0" />
						<div>
							<p className="text-xs font-semibold text-gray-500 uppercase mb-1">
								Hóspedes
							</p>
							<p className="text-sm font-medium text-gray-900">
								{checkoutData.guests} {checkoutData.guests === 1 ? 'hóspede' : 'hóspedes'}
							</p>
						</div>
					</div>

					{/* Preço */}
					<div className="flex items-start gap-3">
						<CreditCard size={18} className="text-primary-600 mt-0.5 flex-shrink-0" />
						<div className="flex-1">
							<p className="text-xs font-semibold text-gray-500 uppercase mb-2">
								Preço
							</p>
							<div className="space-y-1">
								<div className="flex justify-between text-sm text-gray-700">
									<span>{formatCurrency(pricePerNight)} × {nights} noite{nights !== 1 ? 's' : ''}</span>
									<span className="font-medium">
										{formatCurrency(pricePerNight * nights)}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="border-t border-gray-100" />

				{/* Total */}
				<div className="flex justify-between items-center">
					<span className="text-base font-semibold text-gray-900">Total</span>
					<span className="text-2xl font-bold text-primary-900">
						{formatCurrency(totalPrice)}
					</span>
				</div>

				{/* Informação de segurança */}
				<div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-2">
					<div className="text-blue-600 flex-shrink-0 mt-0.5">
						<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
							<path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
						</svg>
					</div>
					<p className="text-xs text-blue-700">
						Você será redirecionado para o checkout seguro do Stripe para completar o pagamento.
					</p>
				</div>
			</div>
		</div>
	);
}
