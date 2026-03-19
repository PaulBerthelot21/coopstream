"use client"

import * as React from "react"

import { useCoopStreamStore } from "@/lib/store/coopstream"
import type { Challenge } from "@/lib/types/challenge"

const STORAGE_KEY = "coopstream-state-v1"

type PersistedSlice = Pick<
  ReturnType<typeof useCoopStreamStore.getState>,
  "challenges" | "selectedChallengeId"
>

function loadFromStorage(): PersistedSlice | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedSlice
    if (!parsed || typeof parsed !== "object") return null
    return parsed
  } catch {
    return null
  }
}

function buildMockChallenges(): PersistedSlice {
  const now = Date.now()
  const mocks: Array<Omit<Challenge, "updatedAt"> & { updatedAt: number }> = [
    {
      id: "mock-01",
      title: "15 kills à l’AWP",
      current: 3,
      target: 15,
      unit: "kills",
      reward: "Roulette",
      skinImageUrl:
        "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyL1m5fn8Sdk5-uRbKB9IeSsG3WS_uJ_t-l9AXm2kxkk42rWn9egc36UOwYiX5N1EOVYsRLtldC0M77g5QXfiN1Fzn_gznQemk8fKYk",
      updatedAt: now - 1000 * 1,
    },
    {
      id: "mock-02",
      title: "10 headshots",
      current: 10,
      target: 10,
      unit: "HS",
      reward: "1 gorgée",
      skinImageUrl:
        "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxu5Dx60noTyLwiYbf_jdk4veqYaF7IfysCnWRxuF4j-B-Xxa_nBovp3Pdwtj9cC_GaAd0DZdwQu9fuhS4kNy0NePntVTbjYpCyyT_3CgY5i9j_a9cBkcCWUKV",
      updatedAt: now - 1000 * 2,
    },
    {
      id: "mock-03",
      title: "Gagner un round au pistolet",
      current: 0,
      target: 1,
      unit: "round",
      reward: "5€",
      skinImageUrl:
        "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz3UqlXOLrxM-vMGmW8VNzv5zq70fqX1O3krLk-XgDiuaUaO8fbP-LXHLLy_ds-WEnln2nkBFmx89hDcCh86OJdQjsHzF2tDo1A0vDZGzWYrK1RMu3Hsg1r92bwY6H4QKZb6DoyaqZ_xrZ5ewCdFziw",
      updatedAt: now - 1000 * 3,
    },
    {
      id: "mock-04",
      title: "3 no-scope",
      current: 1,
      target: 3,
      unit: "no-scope",
      reward: "Punition chat",
      skinImageUrl:
        "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz3UqlXOLrxM-vMGmW8VNzugb73l7sUYz2k7fg2lNt7-DaXc1UcvmcQGvXyM5sD0iwymLhyRKw-txKT2cxY-ecWVuVVp1yFvI5gGL-dDhFjvPv0PvCbsc32Gz07Az9hgEHsPL0vVmAGFmhAt6MwPpLQ",
      updatedAt: now - 1000 * 4,
    },
    {
      id: "mock-05",
      title: "Clutch 1v3",
      current: 0,
      target: 1,
      unit: "clutch",
      reward: "Double roulette",
      skinImageUrl:
        "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxrZXpq03uU1P20rOexCBJuO3bcbR5JORRQSPYnsqiVJItDm7gxRVHX1ctttbvY7SQQBqDFdgd78EmSLXbWzZUJt_vJQPKR9wX0FvpFh3bDg1bmxG-n_gOUY_A1stxIEFM",
      updatedAt: now - 1000 * 5,
    },
    {
      id: "mock-06",
      title: "5 kills au Deagle",
      current: 1,
      target: 5,
      unit: "kills",
      reward: "On change de map",
      skinImageUrl:
        "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz2lu_XsnXwtmkJjSU91dh8bjn_lDkShjjoYbh_ilk5PO6OvQ8dM_DXCnHkOgktbhoHyqxxRh0tWiDnIr4dnKSOAUoC5J1TbJZ4Bi8k9HlY-Li-UWA3NcCqy5X",
      updatedAt: now - 1000 * 6,
    },
    {
      id: "mock-07",
      title: "Placer 3 smokes utiles",
      current: 0,
      target: 3,
      unit: "smokes",
      reward: "Team shoutout",
      skinImageUrl:
        "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNzu4bpy1bqQ3b2hr-ujCZBu-OMWO1YZ7GcWmXbk_NiuG9pwn2njzEGw2iUNoThYzecVwXhC5N1EOVYsRLtldC0M77g5QXfiN1Fzn_gznQemk8fKYk",
      updatedAt: now - 1000 * 7,
    },
    {
      id: "mock-08",
      title: "Faire 2 ACE",
      current: 0,
      target: 2,
      unit: "ACE",
      reward: "Roulette premium",
      skinImageUrl:
        "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNyxJbpy0TrVUu3kbzg1CZT_OHUdSRsb-PEUVaL0OUxxeg91Xu-yRSwpt1EBdeM4mpdTEg3G8MyvHMxBWfzWNXOL5SyBQ-3pgza3nfp_0rtV03BcCyXO2ImesJdXuFaQfWA",
      updatedAt: now - 1000 * 8,
    },
    {
      id: "mock-09",
      title: "Survivre 4 rounds d’affilée",
      current: 2,
      target: 4,
      unit: "rounds",
      reward: "Pas de buy 1 round",
      skinImageUrl:
        "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNyuI_ts0jxH3_10rHmwzEGuLjbZt5YbOqVUFbE4PN2XME4k32lRV7jy7kXF2ShY2TWAFXrPJ4cK1szUIbObXibce_ZSuj9OsI2k3vty87qHh1b7yHpyJndyUSAkCoX5BuQ",
      updatedAt: now - 1000 * 9,
    },
    {
      id: "mock-10",
      title: "5 assists",
      current: 4,
      target: 5,
      unit: "assists",
      reward: "1 minute de pause",
      skinImageUrl:
        "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz2lu_XsnXwtmkJjSU91dh9L3x3YLvU2j1g7zbwpR97u3Xdc4RaO65TF2Rk_d_v8RejG_qlxKq896BusT0OpTTVlKmD9Yx_kpsFKzjbyETH-PeTA_Tp9mt1HXj2IHo04VZyD2tdmjdgZhix1jnLs9Fg",
      updatedAt: now - 1000 * 10,
    },
    {
      id: "mock-11",
      title: "3 entries (first kill)",
      current: 1,
      target: 3,
      unit: "entries",
      reward: "Changement de sensi",
      skinImageUrl:
        "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxrIXv9lP3T3Xw1-KwhBRL8umxc9h1sbWxQVGb0_EnlZxwEHmlRxmk8thNOeH-96yZQ0_PRNEeykE4xhGVZXCpT_fbs_rbL5c3zH3x1M79kA1aSyF7CpvYvgwQKsN_-IE0",
      updatedAt: now - 1000 * 11,
    },
    {
      id: "mock-12",
      title: "2 kills au couteau",
      current: 0,
      target: 2,
      unit: "knife",
      reward: "Musique au choix",
      skinImageUrl:
        "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz2lu_XsnXwtmkJjSU91dxt4i_zE3vUnyl1O6hCJNgO6eUbvwxZL6NS2PRiZ1yUe99CimzkRzg8lUZvYbm8-ZDRw3CDcpzbWR90z-WX2CRKaFMGofbac12n3negwI96k0ZpcGz0i07FH_MY6-SxR8c",
      updatedAt: now - 1000 * 12,
    },
    {
      id: "mock-13",
      title: "10 kills au MP9",
      current: 6,
      target: 10,
      unit: "kills",
      reward: "Roulette",
      skinImageUrl:
        "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNyuc_uy0n4WW31hL7ixQAauOGbO8EVY7aEDG2Xk_kvVkR9VDnkBxex4tlcYtG4-ePSdRn9FN0V2Eoiw0fCALmBdrmGMDq14cM2pkXkzwz4hg0bpACo44Gpcmi8-pnIs61Y",
      updatedAt: now - 1000 * 13,
    },
    {
      id: "mock-14",
      title: "Gagner 3 rounds CT d’affilée",
      current: 1,
      target: 3,
      unit: "rounds",
      reward: "Pas de casque 1 round",
      skinImageUrl:
        "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VN0vJvr80P2SFim0-ifsSVbuOjXbM8lY7LEUHmbkv4sXwkn0T_qgRVhldpbVui98OxVSFWrtJkdaG1wNlr-bjWnXvOXWqbcwdt983Plg9f9hxlaPuDXn2174XH060mD5lyA",
      updatedAt: now - 1000 * 14,
    },
    {
      id: "mock-15",
      title: "Planter 2 bombes",
      current: 1,
      target: 2,
      unit: "plants",
      reward: "Viewer choose loadout",
      skinImageUrl:
        "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz2lu_XsnXwtmkJjSU91dztoT-_nrrTH2kqPfthBxJuudzMdBlY_LbQGCV1PZ0e8RxTnmmRhCvk9VOtDX7Y-3BRDPYBt42VjgzNrPWdDAweOJkZrrptQhT21HdlxoVyk2UZrXl02M7RnKt0UnC71LI",
      updatedAt: now - 1000 * 15,
    },
    {
      id: "mock-16",
      title: "Désamorcer 2 bombes",
      current: 0,
      target: 2,
      unit: "defuses",
      reward: "Hydratation",
      skinImageUrl:
        "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNyqIju7lHtT3n00rzviDVe_O_Yd9xNL-rKF2LUnIgqXUFaiD7mSlXjwqgGdrGxpPXRWE_CAM9Y2G9gz0vCVCGicyf_Yd6sd8Bm0XDjzg73W1lRqqjWvOmdahAlYQYHIsBw",
      updatedAt: now - 1000 * 16,
    },
    {
      id: "mock-17",
      title: "Faire 3000 dmg",
      current: 1200,
      target: 3000,
      unit: "dmg",
      reward: "Roulette",
      skinImageUrl:
        "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGIGz3UqlXOLrxM-vMGmW8VNxqYbmnkPpVkjh1-KvwRFduOXXZt46bLbjU2nYz8siVEVvUTy5wBLuxbAfFt_tYrSZUk3VFNUbuwoAUZPabj2iYObxRf7F98J0m2rqizy81xRNceH_mmwrdRK4ymJ1vfU0",
      updatedAt: now - 1000 * 17,
    },
    {
      id: "mock-18",
      title: "2 kills à travers une smoke",
      current: 0,
      target: 2,
      unit: "kills",
      reward: "Pas de viseur 1 round",
      skinImageUrl:
        "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz2lu_XsnXwtmkJjSU91dztoefhnLRA2S1ruu42J5gv-wae9ctZeGuXSCXh_qiXF86WHDzRhDl49IcYfDlY7SNRRLHPY4RlGh9Z0XbGCDXer3dEMa1aIW02HCjj__BkzVbcuCsuulDmGref_vVTzo",
      updatedAt: now - 1000 * 18,
    },
    {
      id: "mock-19",
      title: "Gagner 1 eco round",
      current: 0,
      target: 1,
      unit: "round",
      reward: "Challenge bonus",
      skinImageUrl:
        "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz2lu_XsnXwtmkJjSU91dx368mmlPkQ2K0gPX7wfIt4uruZt01b_SbHHTU3MgkbFY8CzvnzhLm1apfS7X7N6SWUG6OB99I1z8wYFaLf3GCH-IDW8XH99oF3Himwwcihw4UZPqG4pnl9iP4Krz7JUxI",
      updatedAt: now - 1000 * 19,
    },
    {
      id: "mock-20",
      title: "5 kills en défense de site",
      current: 2,
      target: 5,
      unit: "kills",
      reward: "Roulette",
      skinImageUrl:
        "https://community.akamai.steamstatic.com/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz2lu_XsnXwtmkJjSU91dz6o6v0iTCWyvvkbuywQdc_K6XcMseffSSWWCXh5FjVkY2mDDSzBG3kOwZetW3Y_SXSlLNBYtQGzowVF_KX3GXf_SFT7DY097vk3fs3Mv1kQRad5XyipnRAzchFf6Ds9Bc",
      updatedAt: now - 1000 * 20,
    },
  ]

  const challenges = Object.fromEntries(mocks.map((c) => [c.id, c])) as PersistedSlice["challenges"]
  return { challenges, selectedChallengeId: mocks[0]?.id ?? null }
}

export function useCoopStreamPersistence() {
  React.useEffect(() => {
    const stored = loadFromStorage()
    if (stored) {
      useCoopStreamStore.setState((prev) => ({
        ...prev,
        challenges: stored.challenges ?? prev.challenges,
        selectedChallengeId:
          stored.selectedChallengeId ?? prev.selectedChallengeId,
      }))
    } else if (process.env.NODE_ENV !== "production") {
      const state = useCoopStreamStore.getState()
      if (Object.keys(state.challenges).length === 0) {
        const seed = buildMockChallenges()
        useCoopStreamStore.setState((prev) => ({
          ...prev,
          challenges: seed.challenges,
          selectedChallengeId: seed.selectedChallengeId,
        }))
      }
    }

    const unsubscribe = useCoopStreamStore.subscribe((state) => {
      const slice: PersistedSlice = {
        challenges: state.challenges,
        selectedChallengeId: state.selectedChallengeId,
      }
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slice))
      } catch {
        // ignore
      }
    })

    return unsubscribe
  }, [])
}

