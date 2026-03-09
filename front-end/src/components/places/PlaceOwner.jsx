import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const slideLeft = {
	hidden: { opacity: 0, x: -32 },
	visible: {
		opacity: 1,
		x: 0,
		transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
	},
};

export default function PlaceOwner({ owner }) {
	const [experienceTime, setExperienceTime] = useState("");
	useEffect(() => {
		if (owner) {
			calculateExperienceTime();
		}
	}, [owner]);

	const calculateExperienceTime = () => {
		const createdAt = owner?.createdAt || place?.owner?.createdAt;
		if (!createdAt) return;

		const createdDate = new Date(createdAt);
		const now = new Date();
		const diffTime = Math.abs(now - createdDate);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays < 30) {
			setExperienceTime(`${diffDays} dia${diffDays !== 1 ? "s" : ""}`);
		} else if (diffDays < 365) {
			const months = Math.floor(diffDays / 30);
			setExperienceTime(`${months} ${months !== 1 ? "meses" : "mês"}`);
		} else {
			const years = Math.floor(diffDays / 365);
			setExperienceTime(`${years} ano${years !== 1 ? "s" : ""}`);
		}
	};

	return (
		<motion.div
			className="flex gap-2 flex-col mt-2.5 max-sm:mt-2"
			variants={slideLeft}
			initial="hidden"
			whileInView="visible"
			viewport={{ once: true }}
		>
			<div className="flex items-center gap-2 w-full">
				<div className="flex items-center group max-sm:w-full py-5 transition-all w-full rounded-2xl gap-2.5 justify-between">
					<Link
						to={`/account/profile/${owner._id}`}
						className="flex group rounded-2xl items-center font-normal gap-2.5"
					>
						<img
							src={owner.photo}
							className="w-12 h-12 group-hover:size-15 transition-all duration-500 aspect-square rounded-full object-cover"
							alt="Foto do Usuário"
						/>
						<div className="flex flex-col text-gray-700">
							<div className="font-medium w-fit">{owner.name}</div>
							<small className="flex items-center gap-1">
								Anfitrião há{" "}
								<span className="text-primary-600 font-medium">
									{experienceTime}
								</span>
							</small>
						</div>
					</Link>
				</div>
			</div>
		</motion.div>
	);
}
