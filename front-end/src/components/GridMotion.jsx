import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const GridMotion = ({ gradientColor = "black" }) => {
	const gridRef = useRef(null);
	const rowRefs = useRef([]);
	const mouseXRef = useRef(window.innerWidth / 2);

	const items = [
		"https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800",
		"https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800",
		"https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800",
		"https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800",
		"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",

		"https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800",
		"https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800",
		"https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
		"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
		"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",

		"https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800",
		"https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800",
		"https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800",
		"https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
		"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",

		"https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
		"https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
		"https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800",
		"https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800",
		"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",

		"https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800",
		"https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
		"https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800",
		"https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800",
		"https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800",

		"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
		"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
		"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
		"https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
		"https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",

		"https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",

		"https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800",

		"https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800",
	];

	const totalItems = 28;
	const defaultItems = Array.from(
		{ length: totalItems },
		(_, index) => `Item ${index + 1}`
	);
	const combinedItems =
		items.length > 0 ? items.slice(0, totalItems) : defaultItems;

	useEffect(() => {
		gsap.ticker.lagSmoothing(0);

		const handleMouseMove = (e) => {
			mouseXRef.current = e.clientX;
		};

		const updateMotion = () => {
			const maxMoveAmount = 300;
			const baseDuration = 0.8;
			const inertiaFactors = [0.6, 0.4, 0.3, 0.2];

			rowRefs.current.forEach((row, index) => {
				if (row) {
					const direction = index % 2 === 0 ? 1 : -1;
					const moveAmount =
						((mouseXRef.current / window.innerWidth) * maxMoveAmount -
							maxMoveAmount / 2) *
						direction;

					gsap.to(row, {
						x: moveAmount,
						duration:
							baseDuration + inertiaFactors[index % inertiaFactors.length],
						ease: "power3.out",
						overwrite: "auto",
					});
				}
			});
		};

		const removeAnimationLoop = gsap.ticker.add(updateMotion);
		window.addEventListener("mousemove", handleMouseMove);

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
			removeAnimationLoop();
		};
	}, []);

	return (
		<div ref={gridRef} className="h-full w-full overflow-hidden">
			<section
				className="w-full h-screen overflow-hidden  relative flex items-center justify-center"
				style={{
					background: `radial-gradient(circle, ${gradientColor} 0%, transparent 100%)`,
				}}
			>
				<div className="absolute inset-0 pointer-events-none z-5 bg-primary-900/60 "></div>
				<div className="gap-4 flex-none relative w-[150vw]  h-[150vh] grid grid-rows-4 grid-cols-1 rotate-[-15deg] origin-center ">
					{[...Array(4)].map((_, rowIndex) => (
						<div
							key={rowIndex}
							className="grid gap-4 grid-cols-7 "
							style={{ willChange: "transform, filter" }}
							ref={(el) => (rowRefs.current[rowIndex] = el)}
						>
							{[...Array(7)].map((_, itemIndex) => {
								const content = combinedItems[rowIndex * 7 + itemIndex];
								return (
									<div key={itemIndex} className="relative">
										<div className="relative w-full h-full  overflow-hidden rounded-[10px] bg-[#111] flex items-center justify-center text-white text-[1.5rem]">
											{typeof content === "string" &&
											content.startsWith("http") ? (
												<div
													className="w-full h-full bg-cover  bg-center absolute top-0 left-0"
													style={{ backgroundImage: `url(${content})` }}
												></div>
											) : (
												<div className="p-4 text-center z-[1]">{content}</div>
											)}
										</div>
									</div>
								);
							})}
						</div>
					))}
				</div>
				<div className="relative w-full h-full top-0 left-0 pointer-events-none"></div>
			</section>
		</div>
	);
};

export default GridMotion;
