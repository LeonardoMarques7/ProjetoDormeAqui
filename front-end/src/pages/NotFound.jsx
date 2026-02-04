import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
	return (
		<div className="min-h-100 py-15 flex items-center max-sm:rounded-none max-sm:min-h-screen justify-start w-full mx-auto max-w-7xl bg-accent rounded-2xl">
			<div className="text-start mx-8 mt-5 max-sm:max-w-svw max-w-lg flex flex-col gap-5">
				<p className="text-primary-500 uppercase font-light">Erro 404</p>
				<p className="text-8xl font-bold max-sm:text-5xl max-sm:leading-none -pl-1 leading-22">
					Página não encontrada
				</p>
				<p className="text-gray-500 mb-8">
					Mas isso não significa que sua busca pelo lugar perfeito precisa parar
					por aqui.
				</p>
				<Link
					to="/"
					className="bg-primary flex items-center gap-4 max-sm:mt-0  mt-4 w-fit text-white px-6 py-3 rounded-lg hover:bg-primary-800 transition-colors"
				>
					<ArrowLeft />
					Voltar ao Início
				</Link>
			</div>
		</div>
	);
}
