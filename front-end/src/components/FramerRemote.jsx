import React, { useEffect, useState } from "react";

export default function FramerRemote(props) {
	const [Comp, setComp] = useState(null);

	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const mod =
					await import("https://framerusercontent.com/modules/lnuIDRI4Z6eSeg2PFL7h/gxTSGAtx5jv1Sfw1Oo3q/b0loa20dW.js");
				if (mounted && mod && mod.default) {
					setComp(() => mod.default);
				}
			} catch (err) {
				console.error("Failed to load remote Framer component:", err);
			}
		})();

		return () => {
			mounted = false;
		};
	}, []);

	if (!Comp) return <div className="text-center p-6">Carregando componente...</div>;
	return <Comp {...props} />;
}
