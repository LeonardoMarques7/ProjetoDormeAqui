import { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

function Number({ mv, number, height }) {
	let y = useTransform(mv, (latest) => {
		let placeValue = latest % 10;
		let offset = (10 + number - placeValue) % 10;
		let memo = offset * height;
		if (offset > 5) {
			memo -= 10 * height;
		}
		return memo;
	});

	const style = {
		position: "absolute",
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	};

	return <motion.span style={{ ...style, y }}>{number}</motion.span>;
}

function Digit({ place, value, height, digitStyle }) {
	let valueRoundedToPlace = Math.floor(value / place);
	let animatedValue = useSpring(valueRoundedToPlace);

	useEffect(() => {
		animatedValue.set(valueRoundedToPlace);
	}, [animatedValue, valueRoundedToPlace]);

	const defaultStyle = {
		height,
		position: "relative",
		width: "1ch",
	};

	return (
		<div style={{ ...defaultStyle, ...digitStyle }}>
			{Array.from({ length: 10 }, (_, i) => (
				<Number key={i} mv={animatedValue} number={i} height={height} />
			))}
		</div>
	);
}

export default function Counter({
	value,
	fontSize = 32,
	padding = 0,
	places = [1],
	gap = 4,
	textColor = "#1f2937",
	fontWeight = "bold",
}) {
	const height = fontSize + padding;

	const defaultContainerStyle = {
		position: "relative",
		display: "inline-block",
	};

	const defaultCounterStyle = {
		fontSize,
		display: "flex",
		gap: gap,
		overflow: "hidden",
		lineHeight: 1,
		color: textColor,
		fontWeight: fontWeight,
	};

	return (
		<div style={defaultContainerStyle}>
			<div style={defaultCounterStyle}>
				{places.map((place) => (
					<Digit key={place} place={place} value={value} height={height} />
				))}
			</div>
		</div>
	);
}
