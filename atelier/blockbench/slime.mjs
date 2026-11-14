// Slime vert : le slime du jeu, tel quel. Son vrai visage dans une gelée translucide, rien d'autre.
import { slime } from './_slime.mjs';
import { peau, TETES } from './_officiel.mjs';

export default slime({ name: 'slime', title: 'Slime', verre: 'lime_stained_glass', tete: (await peau(TETES.slime)).tete, teinte: '#8fe06aa0' });
