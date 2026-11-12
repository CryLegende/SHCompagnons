// Animations de repos des modèles repris de block-display.com (voir animer.mjs).
// Repère : celui du modèle recentré, en blocs. La plupart regardent vers -z, le hérisson vers +x.
// Chaque animation joue son mouvement puis laisse le modèle au repos jusqu'à la fin du cycle (loop).
// Nom du modèle produit → file : fichier d'origine dans importes/ ou refs/ quand il porte un autre nom.
export default {
    // Canard : il se dandine deux pas, la tête pique du bec à chaque pas
    paques_canard: {
        file: 'canard',
        groups: {
            corps: { parts: [0, 1, 2, 3, 8], pivot: [0, -0.22, 0] },
            tete: { parts: [1, 2, 3], pivot: [0, 0.08, -0.03], parent: 'corps' },
        },
        clips: [{ loop: 100, keys: [
            { t: 10, corps: { rot: [0, 0, 5] }, tete: { rot: [-12, 0, 0] } },
            { t: 20 },
            { t: 30, corps: { rot: [0, 0, -5] }, tete: { rot: [-12, 0, 0] } },
            { t: 40 },
        ] }],
    },
    // Shiba : la queue remue depuis sa base, la tête se penche et une oreille frémit
    shiba: {
        file: 'renard',
        groups: {
            tete: { parts: [0, 1, 2, 3], pivot: [0, 0.03, -0.3] },
            oreille: { parts: [2], pivot: [0.16, 0.2, -0.31], parent: 'tete' },
            queue: { parts: [8], pivot: [-0.01, -0.28, 0.22] },
        },
        clips: [
            { loop: 80, keys: [{ t: 6, queue: { rot: [0, 20, 0] } }, { t: 14, queue: { rot: [0, -20, 0] } }, { t: 22, queue: { rot: [0, 20, 0] } }, { t: 30, queue: { rot: [0, -20, 0] } }, { t: 38 }] },
            { loop: 120, keys: [
                { t: 60 },
                { t: 70, tete: { rot: [0, 0, 11] } },
                { t: 76, tete: { rot: [0, 0, 11] }, oreille: { rot: [0, 0, -22] } },
                { t: 81, tete: { rot: [0, 0, 11] } },
                { t: 96, tete: { rot: [0, 0, 11] } },
                { t: 106 },
            ] },
        ],
    },
    // Teckel : la queue frétille depuis sa base, la tête se penche d'un côté puis de l'autre, les oreilles suivent
    teckel: {
        groups: {
            tete: { parts: [1, 2, 3, 4], pivot: [0, 0.08, -0.3] },
            oreilleG: { parts: [3], pivot: [0.24, 0.4, -0.28], parent: 'tete' },
            oreilleD: { parts: [4], pivot: [-0.24, 0.4, -0.28], parent: 'tete' },
            queue: { parts: [9], pivot: [0, 0.03, 0.57] },
        },
        clips: [
            { loop: 70, keys: [{ t: 5, queue: { rot: [0, 24, 0] } }, { t: 11, queue: { rot: [0, -24, 0] } }, { t: 17, queue: { rot: [0, 24, 0] } }, { t: 23, queue: { rot: [0, -24, 0] } }, { t: 29 }] },
            { loop: 130, keys: [
                { t: 50 },
                { t: 60, tete: { rot: [0, 0, 10] }, oreilleG: { rot: [0, 0, 14] } },
                { t: 76, tete: { rot: [0, 0, 10] }, oreilleG: { rot: [0, 0, 14] } },
                { t: 90, tete: { rot: [0, 0, -10] }, oreilleD: { rot: [0, 0, -14] } },
                { t: 106, tete: { rot: [0, 0, -10] }, oreilleD: { rot: [0, 0, -14] } },
                { t: 116 },
            ] },
        ],
    },
    // Éléphant : les oreilles battent deux fois, la trompe se balance, la queue chasse les mouches
    elephant: {
        groups: {
            oreilleG: { parts: [1], pivot: [0.375, 0.06, -0.02] },
            oreilleD: { parts: [6], pivot: [-0.375, 0.06, -0.02] },
            trompe: { parts: [2], pivot: [0, 0.2, -0.4] },
            queue: { parts: [10, 11], pivot: [0, -0.1, 0.36] },
        },
        clips: [
            { loop: 110, keys: [{ t: 10, oreilleG: { rot: [0, -26, 0] }, oreilleD: { rot: [0, 26, 0] } }, { t: 22, oreilleG: { rot: [0, 8, 0] }, oreilleD: { rot: [0, -8, 0] } }, { t: 34, oreilleG: { rot: [0, -26, 0] }, oreilleD: { rot: [0, 26, 0] } }, { t: 48 }] },
            { loop: 120, keys: [{ t: 60 }, { t: 76, trompe: { rot: [0, 0, 8] } }, { t: 100, trompe: { rot: [0, 0, -8] } }, { t: 114 }] },
            { loop: 90, keys: [{ t: 60 }, { t: 66, queue: { rot: [0, 24, 0] } }, { t: 74, queue: { rot: [0, -24, 0] } }, { t: 82, queue: { rot: [0, 24, 0] } }, { t: 88 }] },
        ],
    },
    // Hérisson : il tape deux fois dans ses pattes, renifle et remue les oreilles
    herisson: {
        groups: {
            brasG: { parts: [2], pivot: [0.2, 0, -0.2] },
            brasD: { parts: [3], pivot: [0.2, 0, 0.2] },
            nez: { parts: [8, 9], pivot: [0.08, 0.13, 0] },
            oreilleG: { parts: [6], pivot: [0.08, 0.2, -0.17] },
            oreilleD: { parts: [7], pivot: [0.08, 0.2, 0.17] },
        },
        clips: [
            { loop: 100, keys: [{ t: 8, brasG: { rot: [16, 0, 0] }, brasD: { rot: [-16, 0, 0] } }, { t: 16, brasG: { rot: [-8, 0, 0] }, brasD: { rot: [8, 0, 0] } }, { t: 24, brasG: { rot: [16, 0, 0] }, brasD: { rot: [-16, 0, 0] } }, { t: 32, brasG: { rot: [-8, 0, 0] }, brasD: { rot: [8, 0, 0] } }, { t: 40 }] },
            { loop: 80, keys: [{ t: 50 }, { t: 55, nez: { rot: [0, 0, 9] } }, { t: 60 }, { t: 65, nez: { rot: [0, 0, 9] } }, { t: 70 }] },
            { loop: 120, keys: [{ t: 96 }, { t: 100, oreilleG: { rot: [-24, 0, 0] }, oreilleD: { rot: [24, 0, 0] } }, { t: 105 }, { t: 109, oreilleG: { rot: [-24, 0, 0] }, oreilleD: { rot: [24, 0, 0] } }, { t: 114 }] },
        ],
    },
    // Champignon : le chapeau dodeline à peine, sans décoller du pied
    champignon: {
        groups: { chapeau: { parts: [3, 4, 5, 6, 7], pivot: [0, 0.02, 0] } },
        clips: [{ loop: 100, keys: [{ t: 12, chapeau: { rot: [0, 0, 2.5] } }, { t: 36, chapeau: { rot: [0, 0, -2.5] } }, { t: 48 }] }],
    },
    // Araignée : les pattes tapotent trois par trois, les crochets mâchonnent, l'abdomen se soulève
    halloween_araignee: {
        file: 'araignee',
        groups: {
            p4: { parts: [4], pivot: [-0.36, 0.06, -0.13] }, p10: { parts: [10], pivot: [-0.36, 0.05, 0.12] }, p6: { parts: [6], pivot: [-0.3, 0.12, 0.34] },
            p5: { parts: [5], pivot: [0.36, 0.06, -0.11] }, p11: { parts: [11], pivot: [0.32, 0.05, 0.12] }, p7: { parts: [7], pivot: [0.28, 0.12, 0.34] },
            crochets: { parts: [8, 9], pivot: [0, 0.08, -0.4] },
            abdomen: { parts: [2, 3], pivot: [0, 0, 0] },
        },
        clips: [
            { loop: 90, keys: [
                { t: 6, p4: { rot: [0, 0, -13] }, p6: { rot: [0, 0, -13] }, p11: { rot: [0, 0, 13] } },
                { t: 12 },
                { t: 22, p10: { rot: [0, 0, -13] }, p5: { rot: [0, 0, 13] }, p7: { rot: [0, 0, 13] } },
                { t: 28 },
            ] },
            { loop: 70, keys: [{ t: 40 }, { t: 45, crochets: { rot: [12, 0, 0] } }, { t: 51, crochets: { rot: [-6, 0, 0] } }, { t: 57, crochets: { rot: [12, 0, 0] } }, { t: 63 }] },
            { loop: 110, keys: [{ t: 30, abdomen: { rot: [-5, 0, 0] } }, { t: 60 }] },
        ],
    },
    // Ornithorynque : deux coups de pagaie des quatre pattes, la queue godille
    ornithorynque: {
        groups: {
            avG: { parts: [3], pivot: [-0.15, -0.06, -0.14] }, arG: { parts: [4], pivot: [-0.15, -0.06, 0.14] },
            avD: { parts: [5], pivot: [0.15, -0.06, -0.14] }, arD: { parts: [6], pivot: [0.15, -0.06, 0.14] },
            queue: { parts: [0], pivot: [0, -0.03, 0.19] },
        },
        clips: [
            { loop: 100, keys: [
                { t: 10, avG: { rot: [0, 24, 0] }, avD: { rot: [0, -24, 0] }, arG: { rot: [0, -18, 0] }, arD: { rot: [0, 18, 0] } },
                { t: 24, avG: { rot: [0, -20, 0] }, avD: { rot: [0, 20, 0] }, arG: { rot: [0, 16, 0] }, arD: { rot: [0, -16, 0] } },
                { t: 38, avG: { rot: [0, 24, 0] }, avD: { rot: [0, -24, 0] }, arG: { rot: [0, -18, 0] }, arD: { rot: [0, 18, 0] } },
                { t: 50 },
            ] },
            { loop: 110, keys: [{ t: 50 }, { t: 64, queue: { rot: [0, 16, 0] } }, { t: 84, queue: { rot: [0, -16, 0] } }, { t: 98 }] },
        ],
    },
    // Golem de cuivre : la tête pivote d'un côté puis de l'autre, les bras se balancent un aller-retour
    golem_cuivre: {
        groups: {
            tete: { parts: [6, 7, 10, 11], pivot: [0, -0.06, 0] },
            brasG: { parts: [4], pivot: [0.38, -0.08, 0] },
            brasD: { parts: [5], pivot: [-0.38, -0.08, 0] },
        },
        clips: [
            { loop: 130, keys: [{ t: 30 }, { t: 42, tete: { rot: [0, 38, 0] } }, { t: 60, tete: { rot: [0, 38, 0] } }, { t: 78, tete: { rot: [0, -38, 0] } }, { t: 96, tete: { rot: [0, -38, 0] } }, { t: 108 }] },
            { loop: 100, keys: [{ t: 10, brasG: { rot: [20, 0, 0] }, brasD: { rot: [-20, 0, 0] } }, { t: 28, brasG: { rot: [-20, 0, 0] }, brasD: { rot: [20, 0, 0] } }, { t: 40 }] },
        ],
    },
    // Panda roux : il dort, la queue balaie le sol, une oreille tressaille
    panda_roux: {
        groups: { queue: { parts: [7], pivot: [0.1, -0.16, 0.3] }, oreille: { parts: [5], pivot: [0.3, 0.03, -0.43] } },
        clips: [
            { loop: 120, keys: [{ t: 20, queue: { rot: [0, 14, 0] } }, { t: 56, queue: { rot: [0, -10, 0] } }, { t: 76 }] },
            { loop: 130, keys: [{ t: 100 }, { t: 104, oreille: { rot: [0, 0, -22] } }, { t: 109 }, { t: 113, oreille: { rot: [0, 0, -22] } }, { t: 118 }] },
        ],
    },
    // Manchot : il se dandine deux pas, la tête penche avec le pas
    manchot: {
        source: 'refs',
        groups: { corps: { parts: [0, 1], pivot: [0, -0.3, 0] }, tete: { parts: [1], pivot: [0, 0.07, 0], parent: 'corps' } },
        clips: [{ loop: 100, keys: [{ t: 10, corps: { rot: [0, 0, 6] }, tete: { rot: [0, 0, 7] } }, { t: 28, corps: { rot: [0, 0, -6] }, tete: { rot: [0, 0, -7] } }, { t: 46, corps: { rot: [0, 0, 6] }, tete: { rot: [0, 0, 7] } }, { t: 58 }] }],
    },
    // Poulet : il picore deux coups, puis bat des ailes
    poulet: {
        source: 'refs',
        groups: {
            tete: { parts: [0, 1], pivot: [0, -0.08, -0.1] },
            aileG: { parts: [3], pivot: [-0.23, 0.1, 0.15] },
            aileD: { parts: [4], pivot: [0.23, 0.1, 0.15] },
        },
        clips: [
            { loop: 110, keys: [{ t: 50 }, { t: 56, tete: { rot: [-20, 0, 0] } }, { t: 62, tete: { rot: [-4, 0, 0] } }, { t: 68, tete: { rot: [-20, 0, 0] } }, { t: 76 }] },
            { loop: 110, keys: [{ t: 6 }, { t: 10, aileG: { rot: [0, 0, -18] }, aileD: { rot: [0, 0, 18] } }, { t: 15 }, { t: 19, aileG: { rot: [0, 0, -18] }, aileD: { rot: [0, 0, 18] } }, { t: 24 }] },
        ],
    },
    // Cadeau : le couvercle s'entrouvre deux fois, les boucles du nœud s'écartent
    cadeau: {
        source: 'refs',
        groups: {
            couvercle: { parts: [0, 1, 2, 3], pivot: [0, 0.05, 0.28] },
            boucleG: { parts: [0], pivot: [-0.07, 0.2, 0], parent: 'couvercle' },
            boucleD: { parts: [2], pivot: [0.07, 0.2, 0], parent: 'couvercle' },
        },
        clips: [{ loop: 110, keys: [
            { t: 60 },
            { t: 66, couvercle: { rot: [13, 0, 0] }, boucleG: { rot: [0, 0, 16] }, boucleD: { rot: [0, 0, -16] } },
            { t: 72, couvercle: { rot: [4, 0, 0] } },
            { t: 78, couvercle: { rot: [13, 0, 0] }, boucleG: { rot: [0, 0, 16] }, boucleD: { rot: [0, 0, -16] } },
            { t: 88 },
        ] }],
    },
};
