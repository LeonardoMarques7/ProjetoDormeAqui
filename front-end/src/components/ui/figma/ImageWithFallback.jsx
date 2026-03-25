import { useState } from "react";
import { cn } from "@/lib/utils";

export function ImageWithFallback({
	src,
	fallbackSrc = "/src/assets/photoDefault.jpg",
	className,
	alt,
	...props
}) {
	const [imgSrc, setImgSrc] = useState(src);
	const [hasError, setHasError] = useState(false);

	const handleError = () => {
		if (!hasError) {
			setHasError(true);
			setImgSrc(fallbackSrc);
		}
	};

	return (
		<img
			src={imgSrc}
			alt={alt}
			className={cn("w-full h-auto object-cover rounded-lg", className)}
			onError={handleError}
			{...props}
		/>
	);
}
