# Style des compagnons SkyHand

## D'où vient le style

La référence est la collection de compagnons de https://banqueroute.github.io/#companions (48 modèles : 38 compagnons et 10 de Noël), que Cry a donnée comme cible le 14 novembre 2026 : « là-bas tous les compagnons ont de la personnalité ». On s'en inspire, on ne les copie pas : aucun de leurs modèles n'est repris, ni leur idée quand elle est propre à l'un d'eux (le renard à la lanterne, l'escargot-théière, le mouton-nuage...).
Exception demandée par Cry le 14 novembre 2026 au soir : Nouille, Piquant, Carton et Boulon sont refaits d'après leurs fiches, au plus près (« recopier au mieux possible »), mais construits ici cube par cube : aucun fichier de leur site n'est repris.

Les captures de leurs 48 fiches, au repos et pendant leur réaction au clic, sont gardées hors du dépôt (elles appartiennent à leur auteur) : `Optimisation Hetzner/_tools/blockdisplay/refs-compagnons/` sur le poste de Cry (`*-a-repos.png` : une rangée de fiches par image ; `*-b`, `-c`, `-d` : la même rangée pendant la réaction ; `fiches.json` : noms et descriptions). **Les regarder avant de dessiner un compagnon.** `node refs.mjs` (voir l'atelier) les refait si elles manquent.

Notre modèle de référence maison est le capybara (`capybara.mjs`), validé par Cry : « incroyable, le style est parfait ».

## Ce qui donne de la personnalité (leçon des références)

1. **Une idée qui tient en une phrase.** Chaque compagnon est un animal ou un objet croisé avec une idée, et la phrase dit ce qu'il est et ce qu'il fait : un grille-pain dont les tartines sautent quand il est content, un chat qui ne quitte jamais son carton, une chaussette qui cherche sa jumelle, un cône de chantier toujours planté là où il ne faut pas. Un animal seul, même mignon, n'est pas une idée. **On écrit la phrase avant de poser le premier cube** ; si elle ne fait pas sourire, on en cherche une autre.
2. **Le corps est l'idée.** L'objet ou l'animal se reconnaît à sa silhouette seule : la coquille est une théière, la carapace une tartine, le bocal a des bottes. Les pattes et les bras sont minuscules ou absents.
3. **Un accessoire planté de travers.** Presque tous ont une pièce en diagonale qui casse les boîtes : une pelle dans le sable, une cuillère dans le miel, un pinceau dans la peinture, des aiguilles dans la pelote, une clé dans le dos, une paille. C'est le détail qui donne la vie.
4. **Des détails, pas des petits cubes qui flottent.** Les références ont souvent un ou deux cubes détachés du corps (vapeur, bulles, flocons). Cry n'en veut pas chez nous (14 novembre 2026 : « deux blocs inutiles autour ») : les pièces qui restent sous la limite servent à des détails posés sur le compagnon (pépites en relief, cartes dans un ruban, branchies, fermoir, palmes). Un cube détaché ne se garde que s'il est l'idée elle-même (le « z » du dormeur, la flamme du dragonneau).
5. **Des couches et des débordements.** Un couvercle entrouvert, un rebord, un glaçage qui coule sur les côtés, de la chantilly : des étages plutôt qu'un bloc lisse.
6. **Le même visage partout.** Deux yeux sombres, hauts et étroits, assez rapprochés, posés au milieu ou en bas de la face ; une joue rose sous chacun, vers l'extérieur. Presque jamais de bouche. C'est ce visage constant sur des corps très différents qui fait la collection.
7. **Peu de couleurs, franches.** Deux ou trois teintes vives, un clair, un sombre. Les motifs sont de gros pixels (vichy, pois, rayures), les détails sont des cubes.
8. **Une réaction qui joue l'idée.** Au clic, le compagnon fait ce que sa phrase promet : les tartines sautent, le cadeau claque son couvercle, l'arrosoir se renverse pour arroser, le sablier se retourne. Jamais un simple saut passe-partout quand l'idée offre mieux.
9. **Un nom.** Court, en français, souvent le mot de l'objet ou un jeu de mots.
10. **Ne pas forcer.** L'accessoire doit aller de soi (l'étal du marchand, la couronne du slime doré). Un objet ajouté pour « faire une idée » se voit et déplaît : Cry a refusé l'épée plantée dans le slime et les larmes du ghast (14 novembre 2026).

Beaucoup de leurs modèles tiennent en 5 à 12 cubes (29 sur 48) : la personnalité vient de l'idée, de l'accessoire et de la pose, pas du nombre de pièces.

## Nos contraintes

- **Pas de resource pack** : chaque cube est une tête de joueur étirée (8 x 8 pixels par face), ou un bloc du jeu (`block:`, pour le translucide), ou un objet du jeu tenu à plat (`item:`).
- **12 pièces au plus** par compagnon (limite du plugin) : chaque pièce coûte à chaque joueur qui regarde. On dépense les pièces dans cet ordre : silhouette de l'idée, accessoire planté, visage en relief (museau, bec), détails ; les pattes viennent après.
- **Une créature ou un personnage du jeu reste lui-même** (retour de Cry, 14 novembre 2026) : il garde son vrai visage, pris sur sa texture d'origine (`_officiel.mjs` : `officiel()`, `peau()`), sans yeux ni joues du style, et on ne lui invente pas d'accessoire. Le visage du style est pour les animaux, les objets et les créatures inventées.
- **Un socle ne bouge pas** : quand un compagnon est posé sur quelque chose (flaque, assiette, tas d'or des slimes), ce socle reste immobile et le compagnon rebondit dessus (os `root` pour le socle, voir `_slime.mjs`).
- **Porté à l'épaule** : le compagnon flotte. Ses pattes pendent et bougent, elles ne restent jamais figées.

## Règles de dessin

### Silhouette
- Grosse tête ou gros corps, membres courts. Le modèle regarde vers le nord dans Blockbench (-z), posé à y = 0, centré sur x = 0.
- Au moins une pièce en diagonale (`rot`) et, si l'idée s'y prête, une pose de repos un peu penchée.
- Taille en jeu calculée par `blockbench.mjs` (« corps » de 0,20 bloc) : tous les compagnons paraissent de la même taille.

### Visage
- `visage('f')` : yeux de 1 x 2 aux colonnes 1 et 6, pour une tête à museau (le museau en relief occupe le milieu).
- `frimousse('f')` : yeux de 1 x 2 rapprochés (colonnes 2 et 5), plus bas, pour un visage plat (objet, oiseau, créature sans museau). C'est le visage des références.
- Œil `#2b1b12`, jamais noir pur ; joue `#ef9c88` ou une teinte voisine du corps s'il est rose ou sombre.
- Museau, bec ou groin : un petit cube clair en avant, nez et bouche dessinés dessus, en petit.
- Exceptions : les créatures et personnages du jeu (villageois, ghasts), qui gardent leur vrai visage. Sur un corps sombre (Sculk, Dragonnet de l'End) les yeux gardent la forme du style mais prennent une couleur lumineuse.

### Couleurs et textures
- Couleurs claires et franches : en jeu les côtés d'une tête sont rendus à mi-luminosité.
- On ne donne que la couleur de base : `bbkit.mjs` éclaircit la ligne du haut et le dessus, assombrit la ligne du bas et le dessous, ajoute un grain léger. Une couleur donnée en objet (`{ c: '#...' }`) reste nette (yeux, traits).
- Une face se dessine en 1, 2, 4 ou 8 lignes de 1, 2, 4 ou 8 caractères. Gros pixels, pas de damier fin.
- Deux pièces unies de la même couleur partagent la même tête : moins de textures à envoyer et à télécharger.

### Animations
| État | Quand | Contenu |
|---|---|---|
| `idle` (6 s) | il flotte, immobile | respiration, regard, un tic, pattes qui se balancent, l'accessoire qui vit |
| `walk` (0,7 s) | son propriétaire avance | pattes qui pédalent, corps penché, accessoire qui ballotte |
| `interact` (1,2 à 2 s) | clic du propriétaire | la réaction de l'idée, qui finit dans la pose de repos |

- Mouvements en ligne droite entre deux poses (`balance`) : deux paquets par pièce et par cycle. Une pose tenue pendant tout un état (`tient`) ne coûte rien.
- Un os qui s'étire (respiration, gelée d'un slime) ne porte que des cubes droits : une pièce penchée posée dessus se déforme en biais. La mettre sur un os voisin qui suit le mouvement sans s'étirer (os `dessus` des slimes).
- Viser moins de 12 paquets par seconde au repos et moins de 25 en avançant (affichés par `blockbench.mjs`).

## Fiches des compagnons

Une ligne par compagnon : son idée, ce qui se voit, ce qu'il fait au clic. À tenir à jour : c'est la liste qui évite de refaire deux fois la même idée.

| Compagnon | Idée | Ce qui se voit | Au clic |
|---|---|---|---|
| Capybara | zen, une orange sur la tête | orange et sa feuille | lance l'orange et la rattrape |
| Cochon | une tirelire | fente sur le dos, pièce d'or qui dépasse, bouchon | se secoue, une pièce saute et retombe dans la fente |
| Shiba | ne lâche jamais son bâton | bâton trop large en travers de la gueule, bandana rouge | fait la révérence du jeu, queue en folie |
| Teckel | déguisé en hot-dog | pain de chaque côté, zigzag de moutarde | s'étire comme un accordéon |
| Panda roux | dort tout le temps | bonnet de nuit, queue en écharpe, « z » qui flottent | se réveille en sursaut, bras en l'air |
| Lapin | lapin de magicien | assis dans un haut-de-forme, baguette, nœud papillon, deux cartes dans le ruban | disparaît dans le chapeau et ressort |
| Éléphant | a peur de la souris posée sur sa tête | petite souris grise sur le crâne | la souris couine, il sursaute, oreilles écartées |
| Hérisson | cueilleur | pomme, feuille et champignon piqués sur le dos | se roule en boule et rebondit : son butin saute en l'air et retombe pile sur ses piquants, il se déroule et renifle |
| Tortue | porte une île sur son dos | carapace en bloc d'herbe, petit arbre, coffre | rentre la tête, l'arbre tremble |
| Ornithorynque | plongeur | masque et tuba de travers, palmes jaunes | grande inspiration, plonge la tête la première en battant des palmes, remonte d'un bond et s'ébroue |
| Jeb le mouton | arc-en-ciel à cause de son étiquette | laine en anneaux, étiquette de nom qui pend | bondit en vrille |
| Araignée (Halloween) | petite sorcière au bout de son fil | chapeau pointu, fil blanc | descend et remonte sur son fil |
| Abeille | butineuse | marguerite tenue contre elle, ailes de verre | danse frétillante (deux courses en se trémoussant, une boucle de chaque côté), puis tend sa marguerite |
| Manchot | serveur | nœud papillon, plateau et son poisson | lance le poisson et le gobe |
| Poulet | couveuse | assise dans son nid de paille, œufs | pond un œuf de plus |
| Caneton (Pâques) | pas fini d'éclore | assis dans sa coquille peinte, l'autre moitié en chapeau | se cache dans l'œuf et ressort |
| Perroquet | pirate | tricorne à tête de mort de travers | bat des ailes en dansant, le chapeau saute |
| Nounours | peluche rapiécée | pièces de tissu, un œil en bouton, rembourrage qui sort | ouvre les bras pour un câlin |
| Panda | gourmand | bambou tenu à deux pattes, feuille sur la tête, taches grises autour des yeux du style | croque son bambou trois fois (la tige raccourcit), se tapote le ventre tout rond, la feuille sautille |
| Bébé Yoda | dans sa nacelle | bol de bouillon, boule argentée qui lévite, yeux du style | la Force : la boule tourne autour de lui |
| Villageois | marchand ambulant | son vrai visage (sourcil, yeux verts, gros nez), chapeau de paille, bras croisés, étal avec une émeraude et une miche de pain | fait non de la tête, présente l'émeraude, finit par dire oui |
| Among Us | promène son mini sur la tête | mini équipier jaune perché, qui regarde de l'autre côté | bondit en vrille, le mini saute encore plus haut |
| Slime | slime des marais et son petit | nénuphar de travers et sa fleur ; dans sa flaque : un roseau, un petit nénuphar, un tout petit slime qui l'imite | s'écrase et bondit en vrille sur sa flaque, le petit bondit à son tour |
| Slime bleu | petite mer | écume, voilier à fanion qui tangue ; au bord de l'eau : un crabe, une bouée | bondit en vrille, le voilier décolle, le crabe lève les pinces |
| Slime doré | petit roi sur son tas d'or | couronne de travers au joyau rouge ; sur le tas : deux piles de pièces, un rubis | bondit en vrille, la couronne saute, le rubis tourne |
| Slime en chocolat | dessert servi sur son assiette | nappage qui coule, chantilly, cerise, gaufrette plantée ; sur l'assiette : cuillère, fraise, carré de chocolat | bondit en vrille, la cerise saute |
| Ghast | le ghast du jeu, tel quel | son vrai visage, six tentacules | se gonfle et tremble, tentacules écartés |
| Happy Ghast | le happy ghast du jeu | son sourire, lunettes relevées sur le front, harnais, coussin | se gonfle de joie |
| Cookie | sort du four | debout sur sa spatule, coin croqué, grosses pépites en relief | saute comme une crêpe et retombe sur la spatule |
| Cadeau du Père Noël | pressé d'être ouvert | bonnet de Père Noël, étiquette | le couvercle saute, une étoile sort |
| Bonhomme de neige (Noël) | le bonhomme de neige de Noël | haut-de-forme à ruban rouge et houx, carotte, écharpe rayée rouge et vert, boutons de charbon, brindilles fourchues | soulève son chapeau pour saluer |
| Champignon | grand timide | chapeau trop grand rabattu sur les yeux, pois en relief, rainette et tout petit champignon dessus | rabat son chapeau et tremble, la rainette saute |
| Obsidienne | escargot dont la coquille est un portail du Nether | cadre d'obsidienne ébréché (un bloc qui pleure, un bloc tombé), voile violet, yeux au bout des antennes | rentre dans son portail et ressort |
| Sculk | petit bloc de sculk à l'écoute du moindre bruit (le compagnon d'origine, dans le style) | yeux turquoise lumineux, tapis de veines, quatre capteurs, cœur d'âmes, dents d'os | sursaute, capteurs écartés qui vibrent, cœur qui s'emballe |
| Tison | dragonneau qui fait griller sa guimauve tout seul | petite flamme devant le museau, guimauve dorée au bout d'un bâton, ailes qui battent | prend son souffle et crache une vraie flamme |
| Dragonnet de l'End | ne lâche jamais son œuf | écailles sombres, ailes violettes, yeux magenta, œuf de dragon dans les bras | l'œuf se téléporte au-dessus de sa tête, il le rattrape |
| Méduse | un petit poisson vit caché dans ses tentacules | cloche qui se gonfle, six tentacules, poisson orange | le poisson file faire le tour de la méduse et revient |
| Axolotl | fait le mort, comme le vrai | branchies au vent, crête, sourire | se retourne sur le dos, pattes en l'air, puis se remet d'aplomb |
| Grimoire | livre enchanté qui flotte | plume plantée de travers, ruban rouge, fermoir doré, pierre sertie | s'ouvre en grand, ses runes jaillissent, se referme d'un coup |
| Pain d'épices (Noël) | il lui manque déjà un coin de tête | glaçage, boutons en bonbon, nœud papillon, sucre d'orge | danse d'un pied sur l'autre |
| Lapin en chocolat (Pâques) | a très peur d'être mangé | papier doré à moitié défait, oreille croquée, ruban et grelot | tremble, l'oreille se couche, le grelot tinte |
| Fantôme (Halloween) | à la chasse aux bonbons | drap rapiécé qui traîne, seau citrouille, sucette plantée de travers | fait « bouh », bras en l'air, la sucette saute |
| Flamant rose (été) | ne sait pas nager : il garde sa bouée | bouée rouge et blanche, longues pattes qui pédalent, bec crochu | fait tourner sa bouée comme un cerceau |
| Crabe (été) | tient sa glace bien haut | cornet à deux boules dans la pince levée, petites pattes qui gigotent | pas de crabe d'un côté puis de l'autre, la boule vacille |
| Nouille | dragon nouille qui ondule dans l'air (d'après banqueroute) | long corps turquoise en trois segments au ventre crème, bois crème, moustaches dorées, crête et nageoires rouge orangé | fait un looping complet, le corps enroulé dans la boucle, les moustaches qui fouettent |
| Boulon | robot à remonter (d'après banqueroute) | tête-écran aux yeux cyan, cœur rouge sur la poitrine, antenne à boule rouge, boulons aux tempes, clé dorée dans le dos qui tourne doucement | on le remonte : la clé fait trois tours, il cliquette d'un côté à l'autre en agitant les bras, puis bondit de joie |
| Carton | chat qui ne quitte jamais son carton (d'après banqueroute) | chat gris aux oreilles roses, pattes blanches posées sur le bord, rabats ouverts en biais, ruban adhésif, croix et flèche « haut » sur les flancs, queue qui dépasse | plonge au fond du carton, jette un œil par-dessus le bord à gauche puis à droite, ressort d'un coup |
| Piquant | bébé cactus qui sautille dans son pot (d'après banqueroute) | côtes vert foncé, épines blanches, bras levé en L et petit bras, fleur rose au cœur jaune, pot en terre cuite à rebord | bondit hors du pot bras en l'air, la fleur fait un tour, retombe, rebondit et se tortille |
| Kappa | esprit des rivières très poli, sa coupelle d'eau sur le crâne (inspiré de Japanese style Pets, mcmodels.net) | coupelle pleine d'eau, frange bleu-vert, bec, carapace, concombre croqué serré dans les bras | salue bien bas, l'eau se renverse, il panique, la coupelle se remplit et il saute de soulagement |
| Maneki | le chat porte-bonheur en céramique (inspiré du même pack) | chat tricolore assis, patte levée qui fait signe, grosse pièce d'or de travers, collier rouge et grelot | appelle la chance à toute vitesse, la pièce saute en tournant au-dessus de sa tête et retombe dans sa patte |

### Compagnons d'évènement

Quatre évènements : Noël, Pâques, Halloween, été. Le fichier du modèle porte l'évènement (`noel_`, `paques_`, `halloween_`, `ete_`). Le menu leur réserve cinq places chacun dans « Compagnons spéciaux » ; on part de deux par évènement (trois pour Noël : cadeau, bonhomme de neige, pain d'épices) pour pouvoir en ajouter un par an. L'ananas de l'été 2026 a été retiré (Cry : pas au niveau), le flamant rose le remplace.

### Gardés tels qu'ils étaient

Steve, Alex, le zombie, R2-D2 et le golem de cuivre gardent leur apparence : Cry préfère leurs modèles d'origine (corps mieux proportionnés, têtes moins étranges, le golem ressemble au vrai). Ils ont reçu le 14 novembre 2026 les trois états du style, sans rien changer à leur forme ni à leurs têtes :

- `node garde.mjs <nom> [--demitour]` relit l'ancien fichier de modèle et écrit `blockbench/garde/<nom>.json` (mêmes pièces, mêmes faces pixel par pixel) ; il ajoute à `textures.json` l'empreinte d'origine de chaque tête, donc rien n'est téléversé et la tête montrée en jeu reste la même. `--demitour` pour le golem, qui regardait vers l'arrière (rotation y 170 dans la config, retirée ensuite par `config_blockbench.py`).
- `blockbench/<nom>.mjs` range ces pièces dans des os (`_garde.mjs` : `garde()`, `OS_PERSO`, `PIECES_PERSO`) et écrit idle, walk et interact. L'échelle de la description reprend celle de la config (0,42 ; R2-D2 0,5 ; golem 0,3).
- Ne pas redessiner ces cinq-là dans le style : seules leurs animations sont à nous.

| Compagnon | Au repos | Au clic |
|---|---|---|
| Steve | regarde autour de lui, brandit sa pioche au-dessus de l'épaule | pioche trois fois sur le côté et brandit sa pioche |
| Alex | fait coucou de la main | saute de joie en tournant sur elle-même, les deux bras en l'air |
| Zombie | dodeline, bras tendus qui tanguent | se penche en grognant et griffe l'air des deux mains |
| R2-D2 | le dôme regarde de gauche à droite, le voyant passe du rouge au bleu (une petite pièce bleue posée sur le voyant rouge) ; il se dandine en avançant | le dôme fait un tour complet, il se balance d'un pied sur l'autre en sautillant, le voyant clignote |
| Golem de cuivre | regarde autour de lui, le paratonnerre frémit | le paratonnerre tourne comme une hélice et le soulève, il bat des bras, puis titube en se posant |

## Créer un compagnon

1. Regarder les références, écrire la phrase (idée + ce qu'il fait), vérifier dans le tableau qu'elle n'existe pas déjà chez nous ni telle quelle chez eux.
2. Choisir l'accessoire planté, les cubes flottants éventuels, la réaction.
3. Écrire `blockbench/<nom>.mjs` en partant du compagnon le plus proche (`_style.mjs` fournit visage, pattes, animations types).
4. `node blockbench.mjs --planche=gros capybara <nom>` : le comparer au capybara et aux références. Reprendre jusqu'à ce qu'il tienne la comparaison ; abandonner l'idée plutôt que livrer un compagnon sans personnalité.
5. `node blockbench.mjs <nom>` : contrôler les trois animations et leur coût.
6. `node televerse.mjs`, puis `node blockbench.mjs --livrer tout`, déclarer dans config.yml (`animation: FLOAT`, échelle calculée), essayer sur un micro serveur.
7. Ajouter sa ligne au tableau.

## Contrôle avant de livrer

- La phrase se devine en regardant le modèle, sans la lire.
- De face : le visage du style, lisible. De trois quarts : la silhouette de l'idée, l'accessoire de travers.
- À côté du capybara : même taille apparente, couleurs aussi lumineuses.
- La réaction au clic joue l'idée et finit dans la pose de repos.
- 12 pièces au plus, aucun avertissement à la conversion.
