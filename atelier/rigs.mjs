// Animations de repos des modèles repris de block-display.com (voir animer.mjs).
// Repère : celui du modèle recentré, en blocs. La plupart regardent vers -z, le hérisson vers +x.
export default {
    // Canard : il se dandine, la tête pique du bec à chaque pas
    canard: {
        groups: {
            corps: { parts: [0, 1, 2, 3, 8], pivot: [0, -0.22, 0] },
            tete: { parts: [1, 2, 3], pivot: [0, 0.08, -0.03], parent: 'corps' },
        },
        clips: [{ loop: 40, keys: [
            { t: 10, corps: { rot: [0, 0, 5] }, tete: { rot: [-13, 0, 0] } },
            { t: 20 },
            { t: 30, corps: { rot: [0, 0, -5] }, tete: { rot: [-13, 0, 0] } },
        ] }],
    },
    // Shiba : la queue remue, la tête se penche et une oreille frémit
    shiba: {
        source: 'importes', file: 'renard',
        groups: {
            tete: { parts: [0, 1, 2, 3], pivot: [0, 0.03, -0.3] },
            oreille: { parts: [2], pivot: [0.16, 0.2, -0.31], parent: 'tete' },
            queue: { parts: [8], pivot: [0, -0.36, 0.37] },
        },
        clips: [
            { loop: 14, keys: [{ t: 4, queue: { rot: [0, 0, 24] } }, { t: 11, queue: { rot: [0, 0, -24] } }] },
            { loop: 100, keys: [
                { t: 50 },
                { t: 57, tete: { rot: [0, 0, 11] } },
                { t: 62, tete: { rot: [0, 0, 11] }, oreille: { rot: [0, 0, -22] } },
                { t: 66, tete: { rot: [0, 0, 11] } },
                { t: 80, tete: { rot: [0, 0, 11] } },
                { t: 88 },
            ] },
        ],
    },
    // Teckel : la queue frétille, la tête se penche d'un côté puis de l'autre, les oreilles suivent
    teckel: {
        groups: {
            tete: { parts: [1, 2, 3, 4], pivot: [0, 0.08, -0.3] },
            oreilleG: { parts: [3], pivot: [0.24, 0.4, -0.28], parent: 'tete' },
            oreilleD: { parts: [4], pivot: [-0.24, 0.4, -0.28], parent: 'tete' },
            queue: { parts: [9], pivot: [0, -0.27, 0.63] },
        },
        clips: [
            { loop: 10, keys: [{ t: 3, queue: { rot: [0, 0, 28] } }, { t: 8, queue: { rot: [0, 0, -28] } }] },
            { loop: 110, keys: [
                { t: 40 },
                { t: 47, tete: { rot: [0, 0, 10] }, oreilleG: { rot: [0, 0, 14] } },
                { t: 62, tete: { rot: [0, 0, 10] }, oreilleG: { rot: [0, 0, 14] } },
                { t: 72, tete: { rot: [0, 0, -10] }, oreilleD: { rot: [0, 0, -14] } },
                { t: 88, tete: { rot: [0, 0, -10] }, oreilleD: { rot: [0, 0, -14] } },
                { t: 96 },
            ] },
        ],
    },
    // Éléphant : les oreilles battent, la trompe se balance, la queue chasse les mouches
    elephant: {
        groups: {
            oreilleG: { parts: [1], pivot: [0.375, 0.06, -0.02] },
            oreilleD: { parts: [6], pivot: [-0.375, 0.06, -0.02] },
            trompe: { parts: [2], pivot: [0, 0.2, -0.4] },
            queue: { parts: [10, 11], pivot: [0, -0.1, 0.36] },
        },
        clips: [
            { loop: 40, keys: [{ t: 8, oreilleG: { rot: [0, -26, 0] }, oreilleD: { rot: [0, 26, 0] } }, { t: 20, oreilleG: { rot: [0, 10, 0] }, oreilleD: { rot: [0, -10, 0] } }, { t: 30 }] },
            { loop: 64, keys: [{ t: 16, trompe: { rot: [0, 0, 8] } }, { t: 48, trompe: { rot: [0, 0, -8] } }] },
            { loop: 26, keys: [{ t: 6, queue: { rot: [0, 24, 0] } }, { t: 19, queue: { rot: [0, -24, 0] } }] },
        ],
    },
    // Hérisson : il tape dans ses pattes, renifle et remue les oreilles
    herisson: {
        groups: {
            brasG: { parts: [2], pivot: [0.2, 0, -0.2] },
            brasD: { parts: [3], pivot: [0.2, 0, 0.2] },
            nez: { parts: [8, 9], pivot: [0.08, 0.13, 0] },
            oreilleG: { parts: [6], pivot: [0.08, 0.2, -0.17] },
            oreilleD: { parts: [7], pivot: [0.08, 0.2, 0.17] },
        },
        clips: [
            { loop: 24, keys: [{ t: 6, brasG: { rot: [16, 0, 0] }, brasD: { rot: [-16, 0, 0] } }, { t: 18, brasG: { rot: [-8, 0, 0] }, brasD: { rot: [8, 0, 0] } }] },
            { loop: 34, keys: [{ t: 5, nez: { rot: [0, 0, 9] } }, { t: 10 }, { t: 15, nez: { rot: [0, 0, 9] } }, { t: 20 }] },
            { loop: 90, keys: [{ t: 70 }, { t: 73, oreilleG: { rot: [-24, 0, 0] }, oreilleD: { rot: [24, 0, 0] } }, { t: 77 }, { t: 80, oreilleG: { rot: [-24, 0, 0] }, oreilleD: { rot: [24, 0, 0] } }, { t: 84 }] },
        ],
    },
    // Champignon : le chapeau se soulève et se balance
    champignon: {
        groups: { chapeau: { parts: [3, 4, 5, 6, 7], pivot: [0, 0, 0] } },
        clips: [{ loop: 32, keys: [{ t: 8, chapeau: { move: [0, 0.035, 0], rot: [0, 0, 6] } }, { t: 16 }, { t: 24, chapeau: { move: [0, 0.035, 0], rot: [0, 0, -6] } }] }],
    },
    // Araignée : les pattes tapotent trois par trois, les crochets mâchonnent, l'abdomen se soulève
    araignee: {
        groups: {
            p4: { parts: [4], pivot: [-0.36, 0.06, -0.13] }, p10: { parts: [10], pivot: [-0.36, 0.05, 0.12] }, p6: { parts: [6], pivot: [-0.3, 0.12, 0.34] },
            p5: { parts: [5], pivot: [0.36, 0.06, -0.11] }, p11: { parts: [11], pivot: [0.32, 0.05, 0.12] }, p7: { parts: [7], pivot: [0.28, 0.12, 0.34] },
            crochets: { parts: [8, 9], pivot: [0, 0.08, -0.4] },
            abdomen: { parts: [2, 3], pivot: [0, 0, 0] },
        },
        clips: [
            { loop: 36, keys: [
                { t: 6, p4: { rot: [0, 0, -13] }, p6: { rot: [0, 0, -13] }, p11: { rot: [0, 0, 13] } },
                { t: 12 },
                { t: 24, p10: { rot: [0, 0, -13] }, p5: { rot: [0, 0, 13] }, p7: { rot: [0, 0, 13] } },
                { t: 30 },
            ] },
            { loop: 18, keys: [{ t: 4, crochets: { rot: [12, 0, 0] } }, { t: 13, crochets: { rot: [-6, 0, 0] } }] },
            { loop: 56, keys: [{ t: 28, abdomen: { rot: [-5, 0, 0] } }] },
        ],
    },
    // Ornithorynque : il pagaie des quatre pattes, la queue godille
    ornithorynque: {
        groups: {
            avG: { parts: [3], pivot: [-0.15, -0.06, -0.14] }, arG: { parts: [4], pivot: [-0.15, -0.06, 0.14] },
            avD: { parts: [5], pivot: [0.15, -0.06, -0.14] }, arD: { parts: [6], pivot: [0.15, -0.06, 0.14] },
            queue: { parts: [0], pivot: [0, -0.03, 0.19] },
        },
        clips: [
            { loop: 30, keys: [
                { t: 8, avG: { rot: [0, 24, 0] }, avD: { rot: [0, -24, 0] }, arG: { rot: [0, -18, 0] }, arD: { rot: [0, 18, 0] } },
                { t: 22, avG: { rot: [0, -20, 0] }, avD: { rot: [0, 20, 0] }, arG: { rot: [0, 16, 0] }, arD: { rot: [0, -16, 0] } },
            ] },
            { loop: 44, keys: [{ t: 11, queue: { rot: [0, 16, 0] } }, { t: 33, queue: { rot: [0, -16, 0] } }] },
        ],
    },
    // Golem de cuivre : la tête pivote d'un côté puis de l'autre, les bras se balancent
    golem_cuivre: {
        groups: {
            tete: { parts: [6, 7, 10, 11], pivot: [0, -0.06, 0] },
            brasG: { parts: [4], pivot: [0.38, -0.08, 0] },
            brasD: { parts: [5], pivot: [-0.38, -0.08, 0] },
        },
        clips: [
            { loop: 90, keys: [{ t: 20 }, { t: 27, tete: { rot: [0, 38, 0] } }, { t: 42, tete: { rot: [0, 38, 0] } }, { t: 54, tete: { rot: [0, -38, 0] } }, { t: 70, tete: { rot: [0, -38, 0] } }, { t: 78 }] },
            { loop: 32, keys: [{ t: 8, brasG: { rot: [20, 0, 0] }, brasD: { rot: [-20, 0, 0] } }, { t: 24, brasG: { rot: [-20, 0, 0] }, brasD: { rot: [20, 0, 0] } }] },
        ],
    },
    // Panda roux : il dort, la queue balaie le sol, une oreille tressaille
    panda_roux: {
        groups: { queue: { parts: [7], pivot: [0.1, -0.16, 0.3] }, oreille: { parts: [5], pivot: [0.3, 0.03, -0.43] } },
        clips: [
            { loop: 64, keys: [{ t: 16, queue: { rot: [0, 14, 0] } }, { t: 48, queue: { rot: [0, -10, 0] } }] },
            { loop: 90, keys: [{ t: 70 }, { t: 73, oreille: { rot: [0, 0, -22] } }, { t: 77 }, { t: 80, oreille: { rot: [0, 0, -22] } }, { t: 84 }] },
        ],
    },
    // Manchot : il se dandine, la tête penche avec le pas
    manchot: {
        source: 'refs',
        groups: { corps: { parts: [0, 1], pivot: [0, -0.3, 0] }, tete: { parts: [1], pivot: [0, 0.07, 0], parent: 'corps' } },
        clips: [{ loop: 36, keys: [{ t: 9, corps: { rot: [0, 0, 6] }, tete: { rot: [0, 0, 7] } }, { t: 27, corps: { rot: [0, 0, -6] }, tete: { rot: [0, 0, -7] } }] }],
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
            { loop: 76, keys: [{ t: 40 }, { t: 44, tete: { rot: [-20, 0, 0] } }, { t: 48, tete: { rot: [-4, 0, 0] } }, { t: 52, tete: { rot: [-20, 0, 0] } }, { t: 58 }] },
            { loop: 76, keys: [{ t: 4 }, { t: 7, aileG: { rot: [0, 0, -18] }, aileD: { rot: [0, 0, 18] } }, { t: 11 }, { t: 14, aileG: { rot: [0, 0, -18] }, aileD: { rot: [0, 0, 18] } }, { t: 18 }] },
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
        clips: [{ loop: 70, keys: [
            { t: 40 },
            { t: 44, couvercle: { rot: [13, 0, 0] }, boucleG: { rot: [0, 0, 16] }, boucleD: { rot: [0, 0, -16] } },
            { t: 48, couvercle: { rot: [4, 0, 0] } },
            { t: 52, couvercle: { rot: [13, 0, 0] }, boucleG: { rot: [0, 0, 16] }, boucleD: { rot: [0, 0, -16] } },
            { t: 58 },
        ] }],
    },
};
