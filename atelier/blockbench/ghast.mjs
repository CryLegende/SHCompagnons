// Ghast : le ghast du jeu, tel quel. Son vrai visage, six tentacules qui ondulent.
// Au clic il se gonfle et tremble, tentacules écartés.
import { ghast } from './_ghast.mjs';
import { peau, TETES } from './_officiel.mjs';

export default ghast({ name: 'ghast', title: 'Ghast', tete: (await peau(TETES.ghast)).tete });
