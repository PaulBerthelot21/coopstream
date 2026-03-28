export const INTRO_3D_SCENES = [
  {
    id: "portal",
    label: "Portail néon",
    description: "Anneaux violet / cyan, cœur filaire — la scène d’origine.",
  },
  {
    id: "elegance",
    label: "Élégance",
    description: "Noir profond, or rose, verre et lumières de studio — très sobre.",
  },
  {
    id: "nebula",
    label: "Nébuleuse",
    description: "Nuages de poussière, étoiles chaudes, astéroïdes en orbite.",
  },
  {
    id: "pulse",
    label: "Vitesse",
    description: "Grille perspective, prismes qui tournent, néons cyan / magenta.",
  },
] as const

export type Intro3dSceneId = (typeof INTRO_3D_SCENES)[number]["id"]

export function isIntro3dSceneId(v: string): v is Intro3dSceneId {
  return INTRO_3D_SCENES.some((s) => s.id === v)
}

export function getIntro3dSceneMeta(id: Intro3dSceneId) {
  return INTRO_3D_SCENES.find((s) => s.id === id) ?? INTRO_3D_SCENES[0]
}
