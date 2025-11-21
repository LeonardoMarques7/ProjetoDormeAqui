import ProgressSpiner from "@/components/ui/ProgressSpinner";
export default function Loading() {
	window.scrollTo({ top: 0, behavior: "smooth" });

	return (
		<div className="h-dvh overflow-hidden flex gap-5 flex-col bg-primary-500 justify-center items-center">
			<ProgressSpiner />
			<h2 className="text-white text-2xl">Carregando</h2>
		</div>
	);
}
