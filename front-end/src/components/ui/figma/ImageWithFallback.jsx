import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export function UserImageFallback({
	src,
	type = "avatar",
	fallbackSrc,
	className,
	alt,
	...props
}) {
	const baseFallbacks = {
		avatar: "/src/assets/user__default.png",
		banner: "/src/assets/banner__default2.jpg",
	};

	const effectiveFallback = fallbackSrc || baseFallbacks[type];

	const isValidSrc =
		src &&
		src.trim() !== "" &&
		(src.startsWith("http") || src.startsWith("/src/assets"));

	const initialSrc = isValidSrc ? src : effectiveFallback;

	const [imgSrc, setImgSrc] = useState(initialSrc);
	const [hasError, setHasError] = useState(!isValidSrc);

	const handleError = useCallback(() => {
		if (!hasError && imgSrc !== effectiveFallback) {
			setHasError(true);
			setImgSrc(effectiveFallback);
		}
	}, [hasError, imgSrc, effectiveFallback]);

	const typeClasses =
		type === "avatar" ? "rounded-full object-cover" : "object-cover rounded-lg";

	return (
		<img
			src={imgSrc}
			alt={alt || `User ${type}`}
			className={cn(typeClasses, "w-full h-auto", className)}
			onError={handleError}
			loading="lazy"
			{...props}
		/>
	);
}
