import { Link } from "react-router-dom";
import image1 from "../assets/lugares/image__1.jpg";
import { Skeleton } from "@mantine/core";
import MarkdownIt from "markdown-it";

import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";

const Item = ({ place = null, placeHolder }) => {
	const md = new MarkdownIt({
		html: false,
		breaks: true,
		linkify: true,
	});

	return (
		<>
			{placeHolder ? (
				<div className="flex flex-col gap-2 max-w-[350px]">
					<Skeleton className="aspect-square w-full rounded-2xl" />
					<div className="space-y-2">
						<Skeleton className="h-7 w-3/4" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-5/6" />
					</div>
					<Skeleton className="h-5 w-32" />
				</div>
			) : (
				<Link to={`/places/${place._id}`}>
					<div className="flex flex-col gap-2 group rounded-2xl hover:p-3 hover:bg-primary-100 transition-all duration-700 max-w-[350px]">
						<Carousel
							opts={{
								loop: true,
							}}
							className="w-full max-w-xs z-99 relative"
						>
							<CarouselContent>
								{place.photos.map((_, index) => (
									<CarouselItem key={index}>
										<img
											src={place.photos[index]}
											alt="Imagem da acomodação"
											className="aspect-square object-cover transition-transform rounded-2xl"
										/>
									</CarouselItem>
								))}
							</CarouselContent>
							<div onClick={(e) => e.preventDefault()}>
								<CarouselPrevious className="absolute left-2 text-white bg-transparent hover:cursor-pointer " />
							</div>
							<div onClick={(e) => e.preventDefault()}>
								<CarouselNext className="absolute right-2 bg-transparent text-white hover:cursor-pointer" />
							</div>
						</Carousel>

						<div className="">
							<h3 className="text-xl font-semibold line-clamp-1">
								{place.city}
							</h3>
							<p
								className="line-clamp-2 text-gray-600"
								dangerouslySetInnerHTML={{
									__html: md.render(place.description),
								}}
							></p>
						</div>
						<p>
							<span className="font-semibold">{place.price}</span> por noite
						</p>
					</div>
				</Link>
			)}
		</>
	);
};

export default Item;
