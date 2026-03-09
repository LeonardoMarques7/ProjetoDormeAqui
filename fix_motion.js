const fs = require('fs');
const filePath = 'C:/Users/leona/Desktop/ProjetoDormeAqui/front-end/src/components/profile/AccProfile.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Detect line ending
const lineEnding = content.includes('\r\n') ? '\r\n' : '\n';
const n = lineEnding;
const t = '\t';

console.log('Line ending:', lineEnding === '\r\n' ? 'CRLF' : 'LF');
console.log('File length:', content.length);

// Edit 1: Replace opening div for name/occupation section
const edit1Find = t.repeat(7) + '<div className="flex gap-0 flex-col">' + n + t.repeat(8) + '<div className="">';
const edit1Replace = t.repeat(7) + '<motion.div' + n
  + t.repeat(8) + 'className="flex gap-0 flex-col"' + n
  + t.repeat(8) + 'initial={{ opacity: 0, x: -20 }}' + n
  + t.repeat(8) + 'animate={{ opacity: 1, x: 0 }}' + n
  + t.repeat(8) + 'transition={{ delay: 0.2, duration: 0.5 }}' + n
  + t.repeat(7) + '>' + n
  + t.repeat(8) + '<div className="">';

if (content.includes(edit1Find)) {
  content = content.replace(edit1Find, edit1Replace);
  console.log('Edit 1: OK');
} else {
  console.log('Edit 1: NOT FOUND');
}

// Edit 2: Replace closing </div> for the motion.div from Edit 1
const edit2Find = t.repeat(8) + '</span>' + n + t.repeat(7) + '</div>' + n + t.repeat(7) + '<div className="flex gap-5 items-center">';
const edit2Replace = t.repeat(8) + '</span>' + n + t.repeat(7) + '</motion.div>' + n + t.repeat(7) + '<div className="flex gap-5 items-center">';

if (content.includes(edit2Find)) {
  content = content.replace(edit2Find, edit2Replace);
  console.log('Edit 2: OK');
} else {
  console.log('Edit 2: NOT FOUND');
}

// Edit 3a: First stat span (places.length)
const edit3aFind = t.repeat(8) + '<span className="flex flex-col gap-2.5 max-sm:gap-0 ">' + n
  + t.repeat(9) + '<span className="font-bold max-sm:font-medium text-5xl  ">' + n
  + t.repeat(10) + '{places.length}' + n
  + t.repeat(9) + '</span>' + n
  + t.repeat(9) + '<p>Acomodações Exclusivas</p>' + n
  + t.repeat(8) + '</span>';

const edit3aReplace = t.repeat(8) + '<motion.div' + n
  + t.repeat(9) + 'initial={{ opacity: 0, y: 20 }}' + n
  + t.repeat(9) + 'whileInView={{ opacity: 1, y: 0 }}' + n
  + t.repeat(9) + 'viewport={{ once: true }}' + n
  + t.repeat(9) + 'transition={{ delay: 0 }}' + n
  + t.repeat(8) + '>' + n
  + t.repeat(9) + '<span className="flex flex-col gap-2.5 max-sm:gap-0 ">' + n
  + t.repeat(10) + '<span className="font-bold max-sm:font-medium text-5xl  ">' + n
  + t.repeat(11) + '{places.length}' + n
  + t.repeat(10) + '</span>' + n
  + t.repeat(10) + '<p>Acomodações Exclusivas</p>' + n
  + t.repeat(9) + '</span>' + n
  + t.repeat(8) + '</motion.div>';

if (content.includes(edit3aFind)) {
  content = content.replace(edit3aFind, edit3aReplace);
  console.log('Edit 3a: OK');
} else {
  console.log('Edit 3a: NOT FOUND');
}

// Edit 3b: Second stat span (totalGuestsSatisfied)
const edit3bFind = t.repeat(8) + '<span className="flex flex-col gap-2.5 max-sm:gap-0 ">' + n
  + t.repeat(9) + '<span className="font-bold max-sm:font-medium text-5xl ">' + n
  + t.repeat(10) + '{totalGuestsSatisfied}' + n
  + t.repeat(9) + '</span>' + n
  + t.repeat(9) + '<p>Hóspedes Satisfeitos</p>' + n
  + t.repeat(8) + '</span>';

const edit3bReplace = t.repeat(8) + '<motion.div' + n
  + t.repeat(9) + 'initial={{ opacity: 0, y: 20 }}' + n
  + t.repeat(9) + 'whileInView={{ opacity: 1, y: 0 }}' + n
  + t.repeat(9) + 'viewport={{ once: true }}' + n
  + t.repeat(9) + 'transition={{ delay: 0.1 }}' + n
  + t.repeat(8) + '>' + n
  + t.repeat(9) + '<span className="flex flex-col gap-2.5 max-sm:gap-0 ">' + n
  + t.repeat(10) + '<span className="font-bold max-sm:font-medium text-5xl ">' + n
  + t.repeat(11) + '{totalGuestsSatisfied}' + n
  + t.repeat(10) + '</span>' + n
  + t.repeat(10) + '<p>Hóspedes Satisfeitos</p>' + n
  + t.repeat(9) + '</span>' + n
  + t.repeat(8) + '</motion.div>';

if (content.includes(edit3bFind)) {
  content = content.replace(edit3bFind, edit3bReplace);
  console.log('Edit 3b: OK');
} else {
  console.log('Edit 3b: NOT FOUND');
}

// Edit 3c: Third stat span (experienceTime)
const edit3cFind = t.repeat(8) + '<span className="flex flex-col gap-2.5 max-sm:gap-0 ">' + n
  + t.repeat(9) + '<span className="font-bold max-sm:font-medium text-5xl ">' + n
  + t.repeat(10) + '{experienceTime}' + n
  + t.repeat(9) + '</span>' + n
  + t.repeat(9) + '<p>De Experiência</p>' + n
  + t.repeat(8) + '</span>';

const edit3cReplace = t.repeat(8) + '<motion.div' + n
  + t.repeat(9) + 'initial={{ opacity: 0, y: 20 }}' + n
  + t.repeat(9) + 'whileInView={{ opacity: 1, y: 0 }}' + n
  + t.repeat(9) + 'viewport={{ once: true }}' + n
  + t.repeat(9) + 'transition={{ delay: 0.2 }}' + n
  + t.repeat(8) + '>' + n
  + t.repeat(9) + '<span className="flex flex-col gap-2.5 max-sm:gap-0 ">' + n
  + t.repeat(10) + '<span className="font-bold max-sm:font-medium text-5xl ">' + n
  + t.repeat(11) + '{experienceTime}' + n
  + t.repeat(10) + '</span>' + n
  + t.repeat(10) + '<p>De Experiência</p>' + n
  + t.repeat(9) + '</span>' + n
  + t.repeat(8) + '</motion.div>';

if (content.includes(edit3cFind)) {
  content = content.replace(edit3cFind, edit3cReplace);
  console.log('Edit 3c: OK');
} else {
  console.log('Edit 3c: NOT FOUND');
}

// Edit 4: Replace <div> after "Meus anúncios" comment
const edit4Find = t.repeat(7) + '{/* Meus anúncios */}' + n
  + t.repeat(7) + '<div>' + n
  + t.repeat(8) + '<p className="text-primary-500 uppercase font-light">Seleção</p>';

const edit4Replace = t.repeat(7) + '{/* Meus anúncios */}' + n
  + t.repeat(7) + '<motion.div' + n
  + t.repeat(8) + 'initial={{ opacity: 0, y: 16 }}' + n
  + t.repeat(8) + 'animate={{ opacity: 1, y: 0 }}' + n
  + t.repeat(8) + 'transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}' + n
  + t.repeat(7) + '>' + n
  + t.repeat(8) + '<p className="text-primary-500 uppercase font-light">Seleção</p>';

if (content.includes(edit4Find)) {
  content = content.replace(edit4Find, edit4Replace);
  console.log('Edit 4: OK');
} else {
  console.log('Edit 4: NOT FOUND');
}

// Edit 5: Replace closing </div> before {isOwnProfile &&
const edit5Find = t.repeat(8) + '</div>' + n + t.repeat(7) + '</div>' + n + t.repeat(7) + '{isOwnProfile && (';
const edit5Replace = t.repeat(8) + '</div>' + n + t.repeat(7) + '</motion.div>' + n + t.repeat(7) + '{isOwnProfile && (';

if (content.includes(edit5Find)) {
  content = content.replace(edit5Find, edit5Replace);
  console.log('Edit 5: OK');
} else {
  console.log('Edit 5: NOT FOUND');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('\nDone! Verifying...');
console.log('Occurrences of motion.div:', (content.match(/motion\.div/g) || []).length);
