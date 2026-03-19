declare module "tmi.js" {
  // Minimal typing for the browser overlay.
  // Only the subset used by `OverlayTwitchChat` is declared here.
  export type Client = {
    connect: () => Promise<void>
    disconnect: () => Promise<void> | void
    on: (event: "message", handler: (...args: unknown[]) => void) => void
    removeAllListeners?: (event: "message") => void
  }

  export class Client {
    constructor(options: unknown)
  }
}

