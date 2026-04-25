import React from "react";
import {
	InformationCircleIcon,
	CheckCircleIcon,
	LightBulbIcon,
	ExclamationCircleIcon,
	ClockIcon,
	UserIcon,
	ExclamationTriangleIcon,
	UsersIcon,
	SparklesIcon,
	CalendarIcon,
	CurrencyDollarIcon,
	CameraIcon,
	StarIcon,
	ChatBubbleLeftIcon,
	ArrowTrendingUpIcon,
	ChevronDownIcon,
} from "@heroicons/react/24/solid";
import {
	Collapsible,
	CollapsibleTrigger,
	CollapsibleContent,
} from "@/components/ui/collapsible";

/**
 * Componente de Alerta/Insight com design premium
 * Padrão: Ícone quadrado colorido + Conteúdo + Tempo
 */
const AlertCard = ({
	title,
	description,
	type = "info", // 'critical', 'warning', 'info', 'success'
	time = null,
	footer = null,
	icon: CustomIcon = null,
}) => {
	// Mapa de configuração por tipo
	const typeConfig = {
		critical: {
			bgIcon: "bg-red-500",
			borderColor: "border-4 border-gray-100",
			icon: <ExclamationTriangleIcon className="w-6 h-6 text-white" />,
		},
		warning: {
			bgIcon: "bg-amber-500",
			borderColor: "border-4 border-gray-100",
			icon: <ExclamationCircleIcon className="w-6 h-6 text-white" />,
		},
		info: {
			bgIcon: "bg-blue-500",
			borderColor: "border-4 border-gray-100",
			icon: <InformationCircleIcon className="w-6 h-6 text-white" />,
		},
		success: {
			bgIcon: "bg-emerald-500",
			borderColor: "border-4 border-gray-100",
			icon: <CheckCircleIcon className="w-6 h-6 text-white" />,
		},
		tip: {
			bgIcon: "bg-teal-500",
			borderColor: "border-4 border-gray-100",
			icon: <LightBulbIcon className="w-6 h-6 text-white" />,
		},
	};

	// Mapa de nomes de ícones para componentes do HeroIcons
	const iconMap = {
		users: <UsersIcon className="w-4 h-4" />,
		clock: <ClockIcon className="w-4 h-4" />,
		sparkles: <SparklesIcon className="w-4 h-4" />,
		calendar: <CalendarIcon className="w-4 h-4" />,
		"currency-dollar": <CurrencyDollarIcon className="w-4 h-4" />,
		camera: <CameraIcon className="w-4 h-4" />,
		star: <StarIcon className="w-4 h-4" />,
		"check-circle": <CheckCircleIcon className="w-4 h-4" />,
		"chat-bubble-left": <ChatBubbleLeftIcon className="w-4 h-4" />,
		"arrow-trending-up": <ArrowTrendingUpIcon className="w-4 h-4" />,
	};

	const config = typeConfig[type] || typeConfig.info;

	return (
		<Collapsible>
			<div
				className={`bg-white rounded-2xl p-5 mb-4 ${config.borderColor} shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}
			>
				<CollapsibleTrigger asChild>
					<div className="flex items-center gap-4 cursor-pointer group">
						{/* Ícone Quadrado Colorido */}
						<div
							className={`${config.bgIcon} rounded-xl p-3 flex-shrink-0 flex items-center justify-center`}
						>
							{CustomIcon ? (
								<CustomIcon className="w-6 h-6 text-white" />
							) : (
								config.icon
							)}
						</div>

						{/* Título + Tempo + Chevron */}
						<div className="flex-1 min-w-0">
							<div className="flex items-start justify-between gap-3 mb-1">
								<h4 className="font-bold text-base text-slate-900 leading-tight">
									{title}
								</h4>
								<div className="flex items-center gap-2">
									{time && (
										<span className="text-xs font-medium text-slate-500 whitespace-nowrap">
											{time}
										</span>
									)}
									<ChevronDownIcon className="w-4 h-4 text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
								</div>
							</div>
						</div>
					</div>
				</CollapsibleTrigger>

				<CollapsibleContent>
					<div className="flex items-start gap-4 mt-1">
						{/* Espaçador para alinhar com a coluna do ícone */}
						<div className="w-12 h-12 flex-shrink-0" />

						<div className="flex-1 min-w-0">
							{/* Descrição */}
							<p className="text-sm text-slate-600 mb-2 leading-relaxed">
								{description}
							</p>

							{/* Footer com Ícones e Informações */}
							{footer && (
								<div className="text-xs text-slate-600 space-y-1">
									{Array.isArray(footer) ? (
										footer.map((item, idx) => (
											<div key={idx} className="flex items-center gap-2">
												{item.iconName && iconMap[item.iconName] && (
													<span className="flex-shrink-0">
														{iconMap[item.iconName]}
													</span>
												)}
												<span>{item.text}</span>
											</div>
										))
									) : (
										<div className="flex items-center gap-2">
											{footer.iconName && iconMap[footer.iconName] && (
												<span className="flex-shrink-0">
													{iconMap[footer.iconName]}
												</span>
											)}
											<span>{footer.text}</span>
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				</CollapsibleContent>
			</div>
		</Collapsible>
	);
};

export default AlertCard;
