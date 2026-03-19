import type { Chalet } from "./types";

const COUPLE_NUMS = ["V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIV", "XV", "XVI", "XVII"];

export const INITIAL_CHALETS: Chalet[] = [
  {
    id: "chalet-I",
    name: "Chalet I",
    capacity: 15,
    color: "#16A34A",
    floors: [
      {
        name: "",
        rooms: [
          { id: "c1-r1", name: "Chambre 1", capacity: 7, occupants: [], bedDescription: "3 lits superposés + 1 simple" },
          { id: "c1-r2", name: "Chambre 2", capacity: 4, occupants: [], bedDescription: "2 lits superposés" },
          { id: "c1-r3", name: "Chambre 3", capacity: 2, occupants: [], bedDescription: "1 lit superposé" },
          { id: "c1-r4", name: "Chambre 4", capacity: 2, occupants: [], bedDescription: "1 lit superposé" },
        ],
      },
    ],
  },
  {
    id: "chalet-II",
    name: "Chalet II",
    capacity: 15,
    color: "#2563EB",
    floors: [
      {
        name: "RDC",
        rooms: [
          { id: "c2-r1", name: "Chambre 1", capacity: 2, occupants: [], bedDescription: "2 lits simples" },
          { id: "c2-r2", name: "Chambre 2", capacity: 2, occupants: [], bedDescription: "2 lits simples" },
          { id: "c2-r3", name: "Chambre 3", capacity: 2, occupants: [], bedDescription: "2 lits simples" },
        ],
      },
      {
        name: "Étage",
        rooms: [
          { id: "c2-r4", name: "Chambre 4", capacity: 3, occupants: [], bedDescription: "3 lits simples" },
          { id: "c2-r5", name: "Chambre 5", capacity: 2, occupants: [], bedDescription: "2 lits simples" },
          { id: "c2-r6", name: "Chambre 6", capacity: 2, occupants: [], bedDescription: "2 lits simples" },
          { id: "c2-r7", name: "Chambre 7", capacity: 2, occupants: [], bedDescription: "2 lits simples" },
        ],
      },
    ],
  },
  {
    id: "chalet-III",
    name: "Chalet III",
    capacity: 8,
    color: "#D97706",
    floors: [
      {
        name: "RDC",
        rooms: [
          { id: "c3-r1", name: "Chambre 1", capacity: 3, occupants: [], bedDescription: "3 lits simples" },
          { id: "c3-r2", name: "Chambre 2", capacity: 1, occupants: [], bedDescription: "1 lit simple" },
        ],
      },
      {
        name: "Étage",
        rooms: [
          { id: "c3-r3", name: "Chambre 3", capacity: 2, occupants: [], bedDescription: "2 lits simples" },
          { id: "c3-r4", name: "Chambre 4", capacity: 2, occupants: [], bedDescription: "2 lits simples" },
        ],
      },
    ],
  },
  ...COUPLE_NUMS.map((num) => ({
    id: `chalet-${num}`,
    name: `Chalet ${num}`,
    capacity: 2,
    color: "#7C3AED",
    floors: [
      {
        name: "",
        rooms: [
          { id: `c${num}-r1`, name: "Chambre", capacity: 2, occupants: [], bedDescription: "2 lits simples" },
        ],
      },
    ],
  })),
];

export const DEFAULT_GUESTS = `Benoit
Anthime
Manu
Romain
Alizée
Marion .D
Guillaume
Agathe
Thomas
Adrien
Samir
Isabelle
Zoé
Justine
Elena
Milia
Raph T
Rubén
Lunna
Arthur
Carla
Gabriel
Maxence
Yanis
Magali
Inès
Emma
Chloe
Guillaume (Agathe)
Thierry
Kossai
Lisa
Jade
Samantha
Clémentine
Maxime
Paul
Tess
Martin
Sacha
Rémi
Constance
Aylan
Marie
Raphaël
Chloé
Jason
Alexia
Maxime (pote Paul)
Flavien
Maxence (2)
Younes`;
