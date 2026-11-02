export const SOCIAL_PLATFORMS = ["youtube", "tiktok", "instagram", "twitch"] as const
export type SocialPlatform = typeof SOCIAL_PLATFORMS[number]
export function parseSocialPlatform(raw?: string): SocialPlatform { return SOCIAL_PLATFORMS.find(value => value === raw) ?? "youtube" }
export const CHIBI_VARIANTS = ["goal", "follow", "sub", "raid"] as const
export type ChibiVariant = typeof CHIBI_VARIANTS[number]
export function parseChibiVariant(raw?: string): ChibiVariant { return CHIBI_VARIANTS.find(value => value === raw) ?? "goal" }
