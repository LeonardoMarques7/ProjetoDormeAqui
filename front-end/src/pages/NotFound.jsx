import { Link } from "react-router-dom";

export default function NotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="text-center">
				<h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
				<p className="text-xl text-gray-600 mb-8">Página não encontrada</p>
				<p className="text-gray-500 mb-8">
					A página que você está procurando não existe ou foi movida.
				</p>
				<Link
					to="/"
					className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
				>
					Voltar ao Início
				</Link>
			</div>
		</div>
	);
}
