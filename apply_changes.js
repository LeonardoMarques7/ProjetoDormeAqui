const fs = require('fs');
const path = require('path');

// Create C:\temp directory if it doesn't exist
const tempDir = 'C:/temp';
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
  console.log('Created C:/temp directory');
}

// ─── Place.jsx ───────────────────────────────────────────────────────────────
const placePath = 'C:/Users/leona/Desktop/ProjetoDormeAqui/front-end/src/pages/Place.jsx';
let place = fs.readFileSync(placePath, 'utf8');

// ── Change B ─────────────────────────────────────────────────────────────────

// B1: outer flex-col div → motion.div with stagger
const B1_old = '\t\t\t\t\t\t<div className="flex flex-col flex-1 gap-2">';
const B1_new = '\t\t\t\t\t\t<motion.div\n\t\t\t\t\t\t\tclassName="flex flex-col flex-1 gap-2"\n\t\t\t\t\t\t\tvariants={{ visible: { transition: { staggerChildren: 0.1 } } }}\n\t\t\t\t\t\t\tinitial="hidden"\n\t\t\t\t\t\t\twhileInView="visible"\n\t\t\t\t\t\t\tviewport={{ once: true }}\n\t\t\t\t\t\t>';
if (!place.includes(B1_old)) { console.error('B1 NOT FOUND'); process.exit(1); }
place = place.replace(B1_old, B1_new);

// B2: title div → motion.div
const B2_old = '\t\t\t\t\t\t\t<div className="text-3xl font-bold max-sm:text-[1.5rem] text-gray-700 ">\n\t\t\t\t\t\t\t\t{place.title}\n\t\t\t\t\t\t\t</div>';
const B2_new = '\t\t\t\t\t\t\t<motion.div\n\t\t\t\t\t\t\t\tvariants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}\n\t\t\t\t\t\t\t\ttransition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}\n\t\t\t\t\t\t\t\tclassName="text-3xl font-bold max-sm:text-[1.5rem] text-gray-700 "\n\t\t\t\t\t\t\t>\n\t\t\t\t\t\t\t\t{place.title}\n\t\t\t\t\t\t\t</motion.div>';
if (!place.includes(B2_old)) { console.error('B2 NOT FOUND'); process.exit(1); }
place = place.replace(B2_old, B2_new);

// B3: Replace the fragment + inner div for averageRating
const B3_old = '\t\t\t\t\t\t\t{place.averageRating > 0 && (\n\t\t\t\t\t\t\t\t<>\n\t\t\t\t\t\t\t\t\t<div className="flex gap-2 rounded-2xl items-center ">';
const B3_new = '\t\t\t\t\t\t\t{place.averageRating > 0 && (\n\t\t\t\t\t\t\t\t<motion.div\n\t\t\t\t\t\t\t\t\tvariants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}\n\t\t\t\t\t\t\t\t\ttransition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}\n\t\t\t\t\t\t\t\t\tclassName="flex gap-2 rounded-2xl items-center "\n\t\t\t\t\t\t\t\t>';
if (!place.includes(B3_old)) { console.error('B3 NOT FOUND'); process.exit(1); }
place = place.replace(B3_old, B3_new);

// Close: replace </div> + </> with </motion.div>
const B3close_old = '\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</>\n\t\t\t\t\t\t\t)}';
const B3close_new = '\t\t\t\t\t\t\t\t</motion.div>\n\t\t\t\t\t\t\t)}';
if (!place.includes(B3close_old)) { console.error('B3close NOT FOUND'); process.exit(1); }
place = place.replace(B3close_old, B3close_new);

// B4: city div → motion.div + close outer motion.div
const B4_old = '\t\t\t\t\t\t\t<div className="flex items-center max-sm:text-sm text-gray-600 gap-2">\n\t\t\t\t\t\t\t\t<MapPin size={13} />\n\t\t\t\t\t\t\t\t<span>{place.city}</span>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>';
const B4_new = '\t\t\t\t\t\t\t<motion.div\n\t\t\t\t\t\t\t\tvariants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}\n\t\t\t\t\t\t\t\ttransition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}\n\t\t\t\t\t\t\t\tclassName="flex items-center max-sm:text-sm text-gray-600 gap-2"\n\t\t\t\t\t\t\t>\n\t\t\t\t\t\t\t\t<MapPin size={13} />\n\t\t\t\t\t\t\t\t<span>{place.city}</span>\n\t\t\t\t\t\t\t</motion.div>\n\t\t\t\t\t\t</motion.div>';
if (!place.includes(B4_old)) { console.error('B4 NOT FOUND'); process.exit(1); }
place = place.replace(B4_old, B4_new);

// ── Change C ─────────────────────────────────────────────────────────────────
const C_old = '\t\t\t\t\t<div className="border max-w-2xl border-r-0 py-7 border-l-0">\n\t\t\t\t\t\t<p\n\t\t\t\t\t\t\tclassName=""\n\t\t\t\t\t\t\tdangerouslySetInnerHTML={{\n\t\t\t\t\t\t\t\t__html: md.render(place.description),\n\t\t\t\t\t\t\t}}\n\t\t\t\t\t\t></p>\n\t\t\t\t\t</div>';
const C_new = '\t\t\t\t\t<motion.div className="border max-w-2xl border-r-0 py-7 border-l-0" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>\n\t\t\t\t\t\t<p\n\t\t\t\t\t\t\tclassName=""\n\t\t\t\t\t\t\tdangerouslySetInnerHTML={{\n\t\t\t\t\t\t\t\t__html: md.render(place.description),\n\t\t\t\t\t\t\t}}\n\t\t\t\t\t\t></p>\n\t\t\t\t\t</motion.div>';
if (!place.includes(C_old)) { console.error('C NOT FOUND'); process.exit(1); }
place = place.replace(C_old, C_new);

// ── Change D ─────────────────────────────────────────────────────────────────
const D_old = '\t\t\t\t\t<div className="py-7 border-b  max-w-2xl">';
const D_new = '\t\t\t\t\t<motion.div className="py-7 border-b  max-w-2xl" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>';
if (!place.includes(D_old)) { console.error('D NOT FOUND'); process.exit(1); }
place = place.replace(D_old, D_new);

// Close the perks section motion.div
const D_close_old = '\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div className="py-7  max-w-2xl border-b">';
const D_close_new = '\t\t\t\t\t\t</div>\n\t\t\t\t\t</motion.div>\n\t\t\t\t\t<div className="py-7  max-w-2xl border-b">';
if (!place.includes(D_close_old)) { console.error('D_close NOT FOUND'); process.exit(1); }
place = place.replace(D_close_old, D_close_new);

// ── Change E ─────────────────────────────────────────────────────────────────
const E_old = '\t\t\t\t\t<form\n\t\t\t\t\t\tref={formRef}\n\t\t\t\t\t\tclassName="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-6"\n\t\t\t\t\t>';
const E_new = '\t\t\t\t\t<motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 200, damping: 25 }}>\n\t\t\t\t\t<form\n\t\t\t\t\t\tref={formRef}\n\t\t\t\t\t\tclassName="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-6"\n\t\t\t\t\t>';
if (!place.includes(E_old)) { console.error('E_open NOT FOUND'); process.exit(1); }
place = place.replace(E_old, E_new);

const E_close_old = '\t\t\t\t\t</form>\n\t\t\t\t\t{showTransparentCheckout && transparentBookingData && (';
const E_close_new = '\t\t\t\t\t</form>\n\t\t\t\t\t</motion.div>\n\t\t\t\t\t{showTransparentCheckout && transparentBookingData && (';
if (!place.includes(E_close_old)) { console.error('E_close NOT FOUND'); process.exit(1); }
place = place.replace(E_close_old, E_close_new);

fs.writeFileSync(placePath, place, 'utf8');
console.log('Place.jsx written');

// ─── NewPlace.jsx ─────────────────────────────────────────────────────────────
const newPlacePath = 'C:/Users/leona/Desktop/ProjetoDormeAqui/front-end/src/components/places/NewPlace.jsx';
let newPlace = fs.readFileSync(newPlacePath, 'utf8');

// ── Change F ─────────────────────────────────────────────────────────────────
const F_old = '\t<div className=" min-h-screen ">';
const F_new = '\t<motion.div className=" min-h-screen " initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>';
if (!newPlace.includes(F_old)) { console.error('F_open NOT FOUND'); process.exit(1); }
newPlace = newPlace.replace(F_old, F_new);

const F_close_old = '\t\t</div>\n\t</div>\n\t);\n};';
const F_close_new = '\t\t</div>\n\t</motion.div>\n\t);\n};';
if (!newPlace.includes(F_close_old)) { console.error('F_close NOT FOUND'); process.exit(1); }
newPlace = newPlace.replace(F_close_old, F_close_new);

// ── Change G ─────────────────────────────────────────────────────────────────
const G_old = '\t\t\t\t\t<div\n\t\t\t\t\t\tclassName="h-full bg-primary-600 rounded-full transition-all duration-500"\n\t\t\t\t\t\tstyle={{\n\t\t\t\t\t\t\twidth: `${Math.round(((currentStep - 1) / TOTAL_STEPS) * 100)}%`,\n\t\t\t\t\t\t}}\n\t\t\t\t\t/>';
const G_new = '\t\t\t\t\t<motion.div\n\t\t\t\t\t\tclassName="h-full bg-primary-600 rounded-full"\n\t\t\t\t\t\tanimate={{ width: `${Math.round(((currentStep - 1) / TOTAL_STEPS) * 100)}%` }}\n\t\t\t\t\t\ttransition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}\n\t\t\t\t\t/>';
if (!newPlace.includes(G_old)) { console.error('G NOT FOUND'); process.exit(1); }
newPlace = newPlace.replace(G_old, G_new);

// ── Change H ─────────────────────────────────────────────────────────────────
const H_old = '\t\t\t\t{/* Conteúdo do step atual */}\n\t\t\t\t<div className="flex-1">\n\t\t\t\t\t<StepComponent\n\t\t\t\t\t\tdata={state}\n\t\t\t\t\t\tdispatch={dispatch}\n\t\t\t\t\t\terrors={stepErrors}\n\t\t\t\t\t\tshowMessage={showMessage}\n\t\t\t\t\t\tonSubmit={handleSubmit}\n\t\t\t\t\t\tisSubmitting={isSubmitting}\n\t\t\t\t\t/>\n\t\t\t\t</div>';
const H_new = '\t\t\t\t{/* Conteúdo do step atual */}\n\t\t\t\t<AnimatePresence mode="wait">\n\t\t\t\t\t<motion.div\n\t\t\t\t\t\tkey={currentStep}\n\t\t\t\t\t\tclassName="flex-1"\n\t\t\t\t\t\tinitial={{ opacity: 0, x: 30 }}\n\t\t\t\t\t\tanimate={{ opacity: 1, x: 0 }}\n\t\t\t\t\t\texit={{ opacity: 0, x: -30 }}\n\t\t\t\t\t\ttransition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}\n\t\t\t\t\t>\n\t\t\t\t\t\t<StepComponent\n\t\t\t\t\t\t\tdata={state}\n\t\t\t\t\t\t\tdispatch={dispatch}\n\t\t\t\t\t\t\terrors={stepErrors}\n\t\t\t\t\t\t\tshowMessage={showMessage}\n\t\t\t\t\t\t\tonSubmit={handleSubmit}\n\t\t\t\t\t\t\tisSubmitting={isSubmitting}\n\t\t\t\t\t\t/>\n\t\t\t\t\t</motion.div>\n\t\t\t\t</AnimatePresence>';
if (!newPlace.includes(H_old)) { console.error('H NOT FOUND'); process.exit(1); }
newPlace = newPlace.replace(H_old, H_new);

// ── Change I ─────────────────────────────────────────────────────────────────
const I_old = '\t\t\t\t{/* Navegação (Voltar / Próximo) — oculta no último step */}\n\t\t\t\t{currentStep < TOTAL_STEPS && (\n\t\t\t\t\t<StepNavigation\n\t\t\t\t\t\tcurrentStep={currentStep}\n\t\t\t\t\t\tisCurrentStepValid={currentStepValid}\n\t\t\t\t\t\tstepErrors={stepErrors}\n\t\t\t\t\t\tonNext={handleNext}\n\t\t\t\t\t\tonBack={handleBack}\n\t\t\t\t\t/>\n\t\t\t\t)}';
const I_new = '\t\t\t\t{/* Navegação (Voltar / Próximo) — oculta no último step */}\n\t\t\t\t{currentStep < TOTAL_STEPS && (\n\t\t\t\t\t<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>\n\t\t\t\t\t<StepNavigation\n\t\t\t\t\t\tcurrentStep={currentStep}\n\t\t\t\t\t\tisCurrentStepValid={currentStepValid}\n\t\t\t\t\t\tstepErrors={stepErrors}\n\t\t\t\t\t\tonNext={handleNext}\n\t\t\t\t\t\tonBack={handleBack}\n\t\t\t\t\t/>\n\t\t\t\t\t</motion.div>\n\t\t\t\t)}';
if (!newPlace.includes(I_old)) { console.error('I NOT FOUND'); process.exit(1); }
newPlace = newPlace.replace(I_old, I_new);

fs.writeFileSync(newPlacePath, newPlace, 'utf8');
console.log('NewPlace.jsx written');
console.log('All changes applied successfully.');
