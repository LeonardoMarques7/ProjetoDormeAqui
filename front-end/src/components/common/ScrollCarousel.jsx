import { motion } from "framer-motion";
import Autoplay from "embla-carousel-autoplay";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";

const slides = [
	{
		src: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=1200",
		title: "Chalé à Beira do Rio",
		subtitle: "Sorocaba, São Paulo",
	},
	{
		src: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200",
		title: "Casa Moderna com Piscina",
		subtitle: "Campinas, São Paulo",
	},
	{
		src: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1200",
		title: "Suíte com Vista para o Mar",
		subtitle: "Ubatuba, São Paulo",
	},
	{
		src: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200",
		title: "Resort Boutique",
		subtitle: "Ilhabela, São Paulo",
	},
	{
		src: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200",
		title: "Loft no Centro Histórico",
		subtitle: "Paraty, Rio de Janeiro",
	},
	{
		src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200",
		title: "Mansão com Jardim Privativo",
		subtitle: "Campos do Jordão, São Paulo",
	},
];

export default function ScrollCarousel() {
	return (
		<section className="relative w-full py-16 px-4 overflow-hidden">
			{/* Section header */}
			<motion.div
				initial={{ opacity: 0, y: 30 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.6 }}
				className="text-center mb-10 max-w-2xl mx-auto"
			>
				<h2 className="text-4xl max-sm:text-2xl font-extrabold text-primary-900 mb-3">
					Destinos em destaque
				</h2>
				<p className="text-gray-500 text-lg">
					Descubra acomodações incríveis selecionadas especialmente para você
				</p>
			</motion.div>

			{/* Carousel */}
			<div className="relative max-w-7xl mx-auto">
				<Carousel
					opts={{ align: "start", loop: true }}
					plugins={[Autoplay({ delay: 4000, stopOnInteraction: true })]}
					className="w-full"
				>
					<CarouselContent className="-ml-4">
						{slides.map((slide, i) => {
							const isCenter = i === activeIndex;

							return (
								<CarouselItem
									key={i}
									className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 flex justify-center"
								>
									<motion.div
										animate={{
											scale: isCenter ? 1.15 : 0.9,
											opacity: isCenter ? 1 : 0.6,
										}}
										transition={{ duration: 0.4 }}
										className={`relative aspect-video overflow-hidden rounded-2xl group transition-all duration-500
        ${isCenter ? "z-20 shadow-2xl" : "z-10 shadow-md"}`}
									>
										<img
											src={slide.src}
											alt={slide.title}
											className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
											loading="lazy"
										/>

										{/* Gradient */}
										<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

										{/* Text */}
										<div className="absolute bottom-0 left-0 right-0 p-5">
											<h3 className="text-white font-bold text-xl leading-tight drop-shadow">
												{slide.title}
											</h3>
											<p className="text-white/80 text-sm mt-1 drop-shadow">
												{slide.subtitle}
											</p>
										</div>
									</motion.div>
								</CarouselItem>
							);
						})}
					</CarouselContent>
				</Carousel>
			</div>
		</section>
	);
}
