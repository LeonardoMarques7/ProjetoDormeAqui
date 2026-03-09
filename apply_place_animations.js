const fs = require('fs');
const path = 'C:/Users/leona/Desktop/ProjetoDormeAqui/front-end/src/pages/Place.jsx';
let content = fs.readFileSync(path, 'utf8');

const changes = [];

function replace(oldStr, newStr, label) {
	if (content.includes(oldStr)) {
		content = content.replace(oldStr, newStr);
		changes.push('✅ ' + label);
	} else {
		changes.push('❌ SKIPPED: ' + label + ' (pattern not found)');
	}
}

// ── 1. Gallery grid ──────────────────────────────────────────────────────────

// 1a. Inner grid div → motion.div stagger
replace(
	`<motion.div style={{ y: parallaxY }}>
						<div className="grid relative  grid-cols-5 grid-rows-2 max-sm:grid-cols-3 h-100  max-sm:p-2 gap-2 2xl:h-150 max-sm:h-[50svh]">`,
	`<motion.div style={{ y: parallaxY }}>
						<motion.div className="grid relative  grid-cols-5 grid-rows-2 max-sm:grid-cols-3 h-100  max-sm:p-2 gap-2 2xl:h-150 max-sm:h-[50svh]" variants={stagger} initial="hidden" animate="visible">`,
	'1a. Gallery grid div → motion.div with stagger'
);

// 1b. Main image cell (col-span-3)
replace(
	`{/* Imagem principal - ocupa 2 colunas e 2 linhas */}
							<div className="col-span-3 row-span-2 max-sm:col-span-4 max-sm:row-span-2">
								<img
									className="w-full h-full rounded-2xl object-cover cursor-pointer  transition-all"
									src={getImageSrc(0)}
									onError={() => handleImageError(0)}
									alt="Imagem da acomodação"
									onClick={() => handleImageClick(0)}
								/>
							</div>`,
	`{/* Imagem principal - ocupa 2 colunas e 2 linhas */}
							<motion.div className="col-span-3 row-span-2 max-sm:col-span-4 max-sm:row-span-2 overflow-hidden rounded-2xl" variants={galleryItem}>
								<img
									className="w-full h-full rounded-2xl object-cover cursor-pointer hover:scale-[1.03] transition-transform duration-700"
									src={getImageSrc(0)}
									onError={() => handleImageError(0)}
									alt="Imagem da acomodação"
									onClick={() => handleImageClick(0)}
								/>
							</motion.div>`,
	'1b. Main image cell → motion.div galleryItem'
);

// 1c. Image cell col-span-1 upper right (img 1)
replace(
	`{/* Imagem superior direita */}
							<div className="col-span-1 row-span-1 max-sm:col-span-2 ">
								<img
									className="w-full h-full rounded-2xl object-cover cursor-pointer  transition-all"
									src={getImageSrc(1)}
									onError={() => handleImageError(1)}
									alt="Imagem da acomodação"
									onClick={() => handleImageClick(1)}
								/>
							</div>`,
	`{/* Imagem superior direita */}
							<motion.div className="col-span-1 row-span-1 max-sm:col-span-2 overflow-hidden rounded-2xl" variants={galleryItem}>
								<img
									className="w-full h-full rounded-2xl object-cover cursor-pointer hover:scale-[1.03] transition-transform duration-700"
									src={getImageSrc(1)}
									onError={() => handleImageError(1)}
									alt="Imagem da acomodação"
									onClick={() => handleImageClick(1)}
								/>
							</motion.div>`,
	'1c. Upper right image cell → motion.div galleryItem'
);

// 1d. Image cell col-span-1 upper right extreme (img 2)
replace(
	`{/* Imagem superior direita extrema */}
							<div className="col-span-1 row-span-1 max-sm:col-span-2">
								<img
									className="w-full h-full rounded-2xl object-cover cursor-pointer  transition-all"
									src={getImageSrc(2)}
									onError={() => handleImageError(2)}
									alt="Imagem da acomodação"
									onClick={() => handleImageClick(2)}
								/>
							</div>`,
	`{/* Imagem superior direita extrema */}
							<motion.div className="col-span-1 row-span-1 max-sm:col-span-2 overflow-hidden rounded-2xl" variants={galleryItem}>
								<img
									className="w-full h-full rounded-2xl object-cover cursor-pointer hover:scale-[1.03] transition-transform duration-700"
									src={getImageSrc(2)}
									onError={() => handleImageError(2)}
									alt="Imagem da acomodação"
									onClick={() => handleImageClick(2)}
								/>
							</motion.div>`,
	'1d. Upper right extreme image cell → motion.div galleryItem'
);

// 1e. Desktop-only img 3 (col-span-1 row-span-1 with photoDefaultLoading #1)
replace(
	`								<div className="col-span-1 row-span-1 max-sm:col-span-4">
									<img
										className="w-full h-full border aspect-video rounded-2xl object-cover transition-all"
										src={photoDefaultLoading}
										alt="Imagem da acomodação"
										onClick={() => handleImageClick(3)}
									/>
								</div>`,
	`								<motion.div className="col-span-1 row-span-1 max-sm:col-span-4 overflow-hidden rounded-2xl" variants={galleryItem}>
									<img
										className="w-full h-full border aspect-video rounded-2xl object-cover hover:scale-[1.03] transition-transform duration-700"
										src={photoDefaultLoading}
										alt="Imagem da acomodação"
										onClick={() => handleImageClick(3)}
									/>
								</motion.div>`,
	'1e. Desktop img 3 → motion.div galleryItem'
);

// 1f. Desktop-only img 4 (col-span-1 row-span-1 with photoDefaultLoading #2)
replace(
	`								<div className="col-span-1 row-span-1">
									<img
										className="w-full h-full border aspect-video rounded-2xl object-cover transition-all"
										src={photoDefaultLoading}
										alt="Imagem da acomodação"
										onClick={() => handleImageClick(4)}
									/>
								</div>`,
	`								<motion.div className="col-span-1 row-span-1 overflow-hidden rounded-2xl" variants={galleryItem}>
									<img
										className="w-full h-full border aspect-video rounded-2xl object-cover hover:scale-[1.03] transition-transform duration-700"
										src={photoDefaultLoading}
										alt="Imagem da acomodação"
										onClick={() => handleImageClick(4)}
									/>
								</motion.div>`,
	'1f. Desktop img 4 → motion.div galleryItem'
);

// 1g. Show more button → motion.button
replace(
	`						<button
							className="absolute bottom-4 right-4 max-sm:text-sm max-sm:opacity-70 max-sm:p-2 hover:max-sm:opacity-100 flex items-center px-4 py-2 rounded-lg gap-2 bg-white border border-gray-800 hover:bg-gray-50 transition-all cursor-pointer font-medium"
							onClick={handleShowMoreClick}
						>
							<Expand size={18} />
							<span className="max-sm:hidden">Mostrar todas as fotos</span>
						</button>
					</div>
				</motion.div>`,
	`						<motion.button
							className="absolute bottom-4 right-4 max-sm:text-sm max-sm:opacity-70 max-sm:p-2 hover:max-sm:opacity-100 flex items-center px-4 py-2 rounded-lg gap-2 bg-white border border-gray-800 hover:bg-gray-50 transition-all cursor-pointer font-medium"
							onClick={handleShowMoreClick}
							variants={fadeUp}
							whileHover={{ scale: 1.04 }}
							whileTap={{ scale: 0.97 }}
						>
							<Expand size={18} />
							<span className="max-sm:hidden">Mostrar todas as fotos</span>
						</motion.button>
					</motion.div>
				</motion.div>`,
	'1g. Show more button → motion.button + close grid motion.div'
);

// ── 2. Info section header ────────────────────────────────────────────────────

// 2a. Title text → overflow-hidden + motion.span maskReveal
replace(
	`							<div className="text-3xl font-bold max-sm:text-[1.5rem] text-gray-700 ">
								{place.title}
							</div>`,
	`							<div className="overflow-hidden"><motion.span variants={maskReveal} className="block text-3xl font-bold max-sm:text-[1.5rem] text-gray-700">{place.title}</motion.span></div>`,
	'2a. Title → overflow-hidden + motion.span maskReveal'
);

// 2b. Rating stars div → wrap with motion.div fadeUp
replace(
	`								<div className="flex gap-2 rounded-2xl items-center ">
										<div className="flex items-center gap-2">
											<div className="flex items-center gap-1">
												{[...Array(5)].map((_, i) => (
													<Star`,
	`								<motion.div variants={fadeUp}><div className="flex gap-2 rounded-2xl items-center ">
										<div className="flex items-center gap-2">
											<div className="flex items-center gap-1">
												{[...Array(5)].map((_, i) => (
													<Star`,
	'2b. Rating stars div → wrap motion.div fadeUp (open)'
);

replace(
	`									<div>{place.averageRating.toFixed(1)} estrelas</div>
									</div>
								</div>
							</>`,
	`									<div>{place.averageRating.toFixed(1)} estrelas</div>
									</div>
								</div></motion.div>
							</>`,
	'2b. Rating stars div → close motion.div fadeUp'
);

// 2c. MapPin location div → wrap with motion.div fadeUp
replace(
	`							<div className="flex items-center max-sm:text-sm text-gray-600 gap-2">
								<MapPin size={13} />
								<span>{place.city}</span>
							</div>`,
	`							<motion.div variants={fadeUp}><div className="flex items-center max-sm:text-sm text-gray-600 gap-2">
								<MapPin size={13} />
								<span>{place.city}</span>
							</div></motion.div>`,
	'2c. MapPin location → wrap motion.div fadeUp'
);

// ── 3. Specs row ──────────────────────────────────────────────────────────────

// 3a. Change outer flex gap-4 div to motion.div stagger
replace(
	`						<div className="flex gap-4 w-full !flex-nowrap items-center max-sm:text-xs! max-sm:gap-2! max-sm:w-fit max-sm:justify-center justify-start mt-4 max-w-auto">`,
	`						<motion.div className="flex gap-4 w-full !flex-nowrap items-center max-sm:text-xs! max-sm:gap-2! max-sm:w-fit max-sm:justify-center justify-start mt-4 max-w-auto" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>`,
	'3a. Specs row outer div → motion.div stagger'
);

// 3b. Each spec item div → motion.div fadeUp (guests)
replace(
	`							<div className="flex gap-2 rounded-2xl items-center ">
									<div className="flex items-center gap-2">
										<div>{place.guests} hóspedes</div>
									</div>
								</div>
								<div className="w-1 rounded-full h-1 bg-gray-500"></div>
								<div className="flex gap-2  rounded-2xl items-center ">
									<div className="flex items-center gap-2">
										{place.rooms || rooms > 1 ? (
											<p>
												<span>{place.rooms}</span> quartos
											</p>
										) : (
											<p>
												<span>{place.rooms}</span> quarto
											</p>
										)}
									</div>
								</div>
								<div className="w-1 rounded-full h-1 bg-gray-500"></div>
								<div className="flex gap-2 rounded-2xl items-center ">
									<div className="flex items-center gap-2">
										{place.beds && place.beds > 1 ? (
											<p>
												<span className="">{place.beds}</span> camas
											</p>
										) : (
											<p>
												<span className="">{place.beds}</span> cama
											</p>
										)}
									</div>
								</div>
								<div className="w-1 rounded-full h-1 bg-gray-500"></div>
								<div className="flex gap-2 rounded-2xl items-center ">
									<div className="flex items-center gap-2">
										{place.bathrooms || bathrooms > 1 ? (
											<p>
												<span>{place.bathrooms}</span> banheiros
											</p>
										) : (
											<p className="text-sm">
												<span>{place.bathrooms}</span> banheiro
											</p>
										)}
									</div>
								</div>
							</div>`,
	`							<motion.div variants={fadeUp}><div className="flex gap-2 rounded-2xl items-center ">
									<div className="flex items-center gap-2">
										<div>{place.guests} hóspedes</div>
									</div>
								</div></motion.div>
								<div className="w-1 rounded-full h-1 bg-gray-500"></div>
								<motion.div variants={fadeUp}><div className="flex gap-2  rounded-2xl items-center ">
									<div className="flex items-center gap-2">
										{place.rooms || rooms > 1 ? (
											<p>
												<span>{place.rooms}</span> quartos
											</p>
										) : (
											<p>
												<span>{place.rooms}</span> quarto
											</p>
										)}
									</div>
								</div></motion.div>
								<div className="w-1 rounded-full h-1 bg-gray-500"></div>
								<motion.div variants={fadeUp}><div className="flex gap-2 rounded-2xl items-center ">
									<div className="flex items-center gap-2">
										{place.beds && place.beds > 1 ? (
											<p>
												<span className="">{place.beds}</span> camas
											</p>
										) : (
											<p>
												<span className="">{place.beds}</span> cama
											</p>
										)}
									</div>
								</div></motion.div>
								<div className="w-1 rounded-full h-1 bg-gray-500"></div>
								<motion.div variants={fadeUp}><div className="flex gap-2 rounded-2xl items-center ">
									<div className="flex items-center gap-2">
										{place.bathrooms || bathrooms > 1 ? (
											<p>
												<span>{place.bathrooms}</span> banheiros
											</p>
										) : (
											<p className="text-sm">
												<span>{place.bathrooms}</span> banheiro
											</p>
										)}
									</div>
								</div></motion.div>
							</motion.div>`,
	'3b. Spec items → motion.div fadeUp + close outer motion.div'
);

// ── 4. Host card ──────────────────────────────────────────────────────────────

replace(
	`					<div className="flex gap-2 flex-col mt-2.5 max-sm:mt-2  ">`,
	`					<motion.div className="flex gap-2 flex-col mt-2.5 max-sm:mt-2  " variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>`,
	'4. Host card outer div → motion.div fadeUp whileInView'
);

// Close the host card div (the one right before the description border div)
replace(
	`					</div>
					<div className="border max-w-2xl border-r-0 py-7 border-l-0">`,
	`					</motion.div>
					<motion.div className="border max-w-2xl border-r-0 py-7 border-l-0" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>`,
	'4b. Close host motion.div + 5. Description div → motion.div fadeUp'
);

// Close the description div
replace(
	`					</div>
					<motion.div
						className="py-7 border-b  max-w-2xl"`,
	`					</motion.div>
					<motion.div
						className="py-7 border-b  max-w-2xl"`,
	'5b. Close description motion.div'
);

// ── 6. Perks/amenities ────────────────────────────────────────────────────────

// 6a. Outer perks grid div → motion.div stagger
replace(
	`							<div className="sm:grid sm:grid-cols-2 max-sm:flex max-sm:flex-wrap gap-3 max-sm:gap-2.5 mt-5 max-w-7xl mx-auto">`,
	`							<motion.div className="sm:grid sm:grid-cols-2 max-sm:flex max-sm:flex-wrap gap-3 max-sm:gap-2.5 mt-5 max-w-7xl mx-auto" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>`,
	'6a. Perks outer div → motion.div stagger'
);

// 6b. Each perk item div → motion.div fadeUp
replace(
	`											<div
												key={index}
												className={`,
	`											<motion.div
												key={index}
												variants={fadeUp}
												className={`,
	'6b. Perk item div → motion.div fadeUp'
);

replace(
	`											>
												<Perk place={true} perk={perk} />
											</div>`,
	`											>
												<Perk place={true} perk={perk} />
											</motion.div>`,
	'6b. Close perk item motion.div'
);

// 6c. Close outer perks div → motion.div
replace(
	`								</div>
						</div>
					</motion.div>
					<div className="py-7  max-w-2xl border-b">
						<p className="text-primary-500 uppercase font-light">
							Localização`,
	`								</motion.div>
						</div>
					</motion.div>
					<motion.div className="py-7  max-w-2xl border-b" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
						<p className="text-primary-500 uppercase font-light">
							Localização`,
	'6c. Close perks outer motion.div + 7. Location div → motion.div'
);

// ── 7. Location section close ─────────────────────────────────────────────────

replace(
	`						</div>
					</div>
					<div className="py-7  max-w-2xl border-b">
						<p className="text-primary-500 uppercase font-light">
							Políticas e Regras`,
	`						</div>
					</motion.div>
					<motion.div className="py-7  max-w-2xl border-b" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
						<p className="text-primary-500 uppercase font-light">
							Políticas e Regras`,
	'7b. Close location motion.div + 8. Rules div → motion.div'
);

// ── 8. Rules section - inner rule divs ────────────────────────────────────────

// Rule 1: CalendarX - policy
replace(
	`							<div className="my-4 space-y-6">
							<div>
								<CalendarX size={18} />`,
	`							<div className="my-4 space-y-6">
							<motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
								<CalendarX size={18} />`,
	'8a. Rule 1 (cancelation) div → motion.div fadeUp'
);

replace(
	`								</p>
							</div>
							<div>
								<ScrollText size={18} />`,
	`								</p>
							</motion.div>
							<motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
								<ScrollText size={18} />`,
	'8b. Close rule 1 + Rule 2 (house rules) div → motion.div fadeUp'
);

replace(
	`								</div>
							</div>
							<div>
								<ShieldHalf size={18} />`,
	`								</div>
							</motion.div>
							<motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
								<ShieldHalf size={18} />`,
	'8c. Close rule 2 + Rule 3 (safety) div → motion.div fadeUp'
);

replace(
	`								</div>
							</div>
						</div>
					</div>
					<div className="my-4 mt-7">`,
	`								</div>
							</motion.div>
						</div>
					</motion.div>
					<div className="my-4 mt-7">`,
	'8d. Close rule 3 motion.div + close rules outer motion.div'
);

// ── 9. Reviews section header ─────────────────────────────────────────────────

replace(
	`							<p className="text-primary-500 uppercase font-light">
								Avaliações
							</p>`,
	`							<div className="overflow-hidden"><motion.span variants={maskReveal} initial="hidden" whileInView="visible" viewport={{ once: true }} className="block text-primary-500 uppercase font-light">Avaliações</motion.span></div>`,
	'9a. "Avaliações" p → overflow-hidden + motion.span maskReveal'
);

replace(
	`									<p className="text-3xl font-bold">O que Dizem</p>`,
	`									<div className="overflow-hidden"><motion.span variants={maskReveal} initial="hidden" whileInView="visible" viewport={{ once: true }} className="block text-3xl font-bold">O que Dizem</motion.span></div>`,
	'9b. "O que Dizem" p → overflow-hidden + motion.span maskReveal'
);

// ── 10. Reviews grid ──────────────────────────────────────────────────────────

// 10a. Grid outer div → motion.div stagger
replace(
	`							<div className="grid max-w-full transition-transform relative grid-cols-[repeat(auto-fit,minmax(300px,1fr))] max-sm:grid-cols-[repeat(auto-fit,minmax(160px,1fr))] max-sm:gap-3.5 gap-3 mt-5 mb-15 max-sm:mb-0">`,
	`							<motion.div className="grid max-w-full transition-transform relative grid-cols-[repeat(auto-fit,minmax(300px,1fr))] max-sm:grid-cols-[repeat(auto-fit,minmax(160px,1fr))] max-sm:gap-3.5 gap-3 mt-5 mb-15 max-sm:mb-0" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}>`,
	'10a. Reviews grid div → motion.div stagger'
);

// 10b. Each review card div → motion.div fadeUp with hover
replace(
	`											<div
												className="group relative bg-white rounded-3xl h-full p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-neutral-100"
												key={review._id}
											>`,
	`											<motion.div
												key={review._id}
												className="group relative bg-white rounded-3xl h-full p-6 border border-neutral-100"
												variants={fadeUp}
												whileHover={{ y: -6, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.12)" }}
												transition={{ type: "spring", stiffness: 300, damping: 25 }}
											>`,
	'10b. Review card div → motion.div fadeUp with hover'
);

// Close review card
replace(
	`											</div>
										);
									})
								) : (`,
	`											</motion.div>
										);
									})
								) : (`,
	'10b. Close review card motion.div'
);

// Close reviews grid
replace(
	`							</div>
							{mobile && (
								<button
									onClick={() => setSheetOpen(true)}`,
	`							</motion.div>
							{mobile && (
								<button
									onClick={() => setSheetOpen(true)}`,
	'10c. Close reviews grid motion.div'
);

// ── 11. Booking sidebar ───────────────────────────────────────────────────────

// 11a. Sidebar outer div → motion.div slideRight
replace(
	`				<div className="order-2 col-span-2 flex-1 w-full max-w-full  ml-auto">`,
	`				<motion.div className="order-2 col-span-2 flex-1 w-full max-w-full  ml-auto" variants={slideRight} initial="hidden" animate="visible">`,
	'11a. Booking sidebar div → motion.div slideRight'
);

// 11b. Form → motion.form with stagger
replace(
	`					<form
						ref={formRef}
						className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-6"
					>`,
	`					<motion.form
						ref={formRef}
						className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-6"
						variants={stagger}
						initial="hidden"
						animate="visible"
					>`,
	'11b. Booking form → motion.form with stagger'
);

// 11c. Price section div → motion.div fadeUp
replace(
	`						{/* Preço */}
						<div className="mb-6">
							<div className="flex items-baseline gap-1">`,
	`						{/* Preço */}
						<motion.div className="mb-6" variants={fadeUp}>
							<div className="flex items-baseline gap-1">`,
	'11c. Price section div → motion.div fadeUp'
);

replace(
	`								<span className="text-gray-600">por noite</span>
							</div>
						</div>`,
	`								<span className="text-gray-600">por noite</span>
							</div>
						</motion.div>`,
	'11c. Close price section motion.div'
);

// 11d. Reserve button → motion.button
replace(
	`						{/* Botão */}
						<button
							className="w-full bg-gray-900 text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-colors"
							onClick={
								user
									? handleBooking
									: (e) => {
											e.preventDefault();
											showAuthModal("login");
										}
							}
						>
							{user ? "Reservar Agora" : "Faça login para reservar"}
						</button>
					</form>`,
	`						{/* Botão */}
						<motion.button
							className="w-full bg-gray-900 text-white py-4 rounded-xl font-medium"
							onClick={
								user
									? handleBooking
									: (e) => {
											e.preventDefault();
											showAuthModal("login");
										}
							}
							whileHover={{ scale: 1.02, backgroundColor: "#111827" }}
							whileTap={{ scale: 0.98 }}
							transition={{ type: "spring", stiffness: 400, damping: 25 }}
						>
							{user ? "Reservar Agora" : "Faça login para reservar"}
						</motion.button>
					</motion.form>`,
	'11d. Reserve button → motion.button + close form as motion.form'
);

// 11e. Close sidebar motion.div
replace(
	`					</div>
			</div>
		</div>
	</>
	);`,
	`					</motion.div>
			</div>
		</div>
	</>
	);`,
	'11e. Close sidebar motion.div'
);

// Write the file
fs.writeFileSync(path, content, 'utf8');

// Report
console.log('\n=== Animation Changes Applied ===\n');
changes.forEach(c => console.log(c));
const applied = changes.filter(c => c.startsWith('✅')).length;
const skipped = changes.filter(c => c.startsWith('❌')).length;
console.log(`\nTotal: ${applied} applied, ${skipped} skipped`);
