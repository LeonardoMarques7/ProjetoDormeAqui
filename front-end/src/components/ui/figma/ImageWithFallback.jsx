import { useCallback, useEffect, useMemo, useState } from "react";
import userDefault from "@/assets/user__default.png";
import bannerDefault from "@/assets/banner__default2.jpg";
import placeDefault from "@/assets/photoDefault.jpg";
import { cn } from "@/lib/utils";

const DEFAULT_FALLBACKS = {
	avatar: userDefault,
	banner: bannerDefault,
	place: placeDefault,
	image: placeDefault,
};

const normalizeImageSrc = (src) => {
	if (typeof src !== "string") return null;

	const value = src.trim();
	if (!value) return null;

	if (
		value.startsWith("http://") ||
		value.startsWith("https://") ||
		value.startsWith("data:") ||
		value.startsWith("blob:") ||
		value.startsWith("/")
	) {
		return value;
	}

	return null;
};

export function ImageWithFallback({
	src,
	fallbackType = "image",
	fallbackSrc,
	className,
	alt,
	onError,
	...props
}) {
	const effectiveFallback =
		fallbackSrc || DEFAULT_FALLBACKS[fallbackType] || DEFAULT_FALLBACKS.image;

	const normalizedSrc = useMemo(() => normalizeImageSrc(src), [src]);
	const [imgSrc, setImgSrc] = useState(normalizedSrc || effectiveFallback);

	useEffect(() => {
		setImgSrc(normalizedSrc || effectiveFallback);
	}, [normalizedSrc, effectiveFallback]);

	const handleError = useCallback(
		(event) => {
			if (imgSrc !== effectiveFallback) {
				setImgSrc(effectiveFallback);
			}
			onError?.(event);
		},
		[effectiveFallback, imgSrc, onError],
	);

	return (
		<img
			src={imgSrc}
			alt={alt || ""}
			className={className}
			onError={handleError}
			loading="lazy"
			{...props}
		/>
	);
}

export function UserImageFallback({
	src,
	type = "avatar",
	fallbackSrc,
	className,
	alt,
	...props
}) {
	const typeClasses =
		type === "avatar" ? "rounded-full object-cover" : "object-cover rounded-lg";

	return (
		<ImageWithFallback
			src={src}
			alt={alt || `User ${type}`}
			fallbackType={type}
			fallbackSrc={fallbackSrc}
			className={cn(typeClasses, "w-full h-auto", className)}
			{...props}
		/>
	);
}

export function PlaceImageFallback({
	src,
	fallbackSrc,
	className,
	alt,
	...props
}) {
	return (
		<ImageWithFallback
			src={src}
			alt={alt}
			fallbackType="place"
			fallbackSrc={fallbackSrc}
			className={cn("object-cover", className)}
			{...props}
		/>
	);
}
