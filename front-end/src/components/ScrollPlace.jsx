import {
	ScrollVelocityContainer,
	ScrollVelocityRow,
} from "@/components/ui/scroll-based-velocity";

export default function ScrollPlace({ data }) {
	return (
		<div className="relative flex w-full flex-col items-center justify-center overflow-hidden py-8">
			<ScrollVelocityContainer className="w-full">
				<ScrollVelocityRow baseVelocity={6} direction={1} className="py-4">
					{data.map((src, idx) => (
						<img
							key={idx}
							src={src}
							alt="Unsplash sample"
							width={240}
							height={160}
							loading="lazy"
							decoding="async"
							className="mx-4 inline-block h-40 w-60 rounded-lg object-cover shadow-sm"
						/>
					))}
				</ScrollVelocityRow>
				<ScrollVelocityRow baseVelocity={6} direction={-1} className="py-4">
					{data.map((src, idx) => (
						<img
							key={idx}
							src={src}
							alt="Unsplash sample"
							width={240}
							height={160}
							loading="lazy"
							decoding="async"
							className="mx-4 inline-block h-40 w-60 rounded-lg object-cover shadow-sm"
						/>
					))}
				</ScrollVelocityRow>
			</ScrollVelocityContainer>

			<div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r"></div>
			<div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l"></div>
		</div>
	);
}
