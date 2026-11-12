// Among Us : équipier qui marche sur place et change de couleur (rouge, bleu, noir, blanc, rose), visière en relief.
import { mirrored } from '../kit.mjs';
import { plain } from './_aides.mjs';

const COULEURS = [[197, 22, 22], [22, 46, 209], [66, 74, 82], [214, 224, 240], [237, 84, 186]];
const tenues = COULEURS.map((c, i) => plain(c, { noise: 0.04, grad: 0.22, seed: 31 + i }));
const TENUE = ['corps', 'dome', 'sac', 'jambeG', 'jambeD'];
const jambe = { id: 'jambeG', size: [2.6, 2.8, 3.4], pos: [1.7, 1.4, 0], skin: tenues[0] };
const pas = (t, k) => ({ t, parts: { jambeG: { pos: [1.7, 1.4 + (k > 0 ? 0.9 : 0), 0.9 * k] }, jambeD: { pos: [-1.7, 1.4 + (k < 0 ? 0.9 : 0), -0.9 * k] } } });
const couleurs = { loop: 100, keys: [1, 2, 3, 4].map((i) => ({ t: 20 * i, parts: Object.fromEntries(TENUE.map((id) => [id, { skin: tenues[i] }])) })) };
export default {
    name: 'amongus',
    title: 'Among Us',
    scale: 0.6,
    palette: { v: '#9ad5ea', V: '#5fa3bf', e: { c: '#f4fbfe', n: 0 }, n: '#2c4a57' },
    parts: [
        { id: 'corps', size: [6, 6.2, 4.6], pos: [0, 5.6, 0], skin: tenues[0] },
        { id: 'dome', size: [5, 1.4, 3.8], pos: [0, 9.2, 0], skin: tenues[0] },
        { id: 'visiere', size: [4.4, 2.7, 1.5], pos: [0.3, 6.9, 2.5], skin: { all: 'V', front: ['nnnnnnnn', 'nveeevvn', 'nvveevvn', 'nvvvvvvn', 'nvvvvvVn', 'nvvvvVVn', 'nVVVVVVn', 'nnnnnnnn'], sides: 'n', top: 'n', bottom: 'n', grad: 0 } },
        { id: 'sac', size: [3.8, 4.4, 1.7], pos: [0, 5.2, -3], skin: tenues[0] },
        jambe, mirrored(jambe, 'jambeD'),
    ],
    clips: [
        { loop: 84, keys: [pas(5, 1), pas(15, -1), pas(25, 1), pas(35, -1), pas(45, 1), pas(55, -1), { t: 60 }] },
        couleurs,
    ],
    frames: [0, 5, 15, 25, 45, 65, 85, 105],
};
