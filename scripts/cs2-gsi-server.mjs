import http from "node:http"

const PORT = 3210

/** @type {Record<string, unknown> | null} */
let latest = null
/** @type {Set<http.ServerResponse>} */
const clients = new Set()

function writeSse(res, event, payload) {
  res.write(`event: ${event}\n`)
  res.write(`data: ${JSON.stringify(payload)}\n\n`)
}

function broadcast(event, payload) {
  for (const client of clients) {
    writeSse(client, event, payload)
  }
}

function json(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  })
  res.end(JSON.stringify(body))
}

const server = http.createServer((req, res) => {
  console.log(`[cs2-gsi] ${req.method ?? "?"} ${req.url ?? "?"}`)

  if (!req.url) {
    json(res, 400, { ok: false, error: "Missing URL" })
    return
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    })
    res.end()
    return
  }

  if (req.method === "GET" && req.url === "/events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    })
    res.write("retry: 1000\n\n")
    if (latest) {
      writeSse(res, "update", latest)
    }
    clients.add(res)
    console.log(`[cs2-gsi] SSE client connected (total: ${clients.size})`)

    req.on("close", () => {
      clients.delete(res)
      console.log(`[cs2-gsi] SSE client disconnected (total: ${clients.size})`)
    })
    return
  }

  if (req.method === "GET" && req.url === "/state") {
    json(res, 200, { ok: true, state: latest })
    return
  }

  // CS2 usually posts to "/" with JSON body.
  if (req.method === "POST") {
    let body = ""
    req.on("data", (chunk) => {
      body += chunk.toString("utf8")
    })
    req.on("end", () => {
      try {
        const parsed = body ? JSON.parse(body) : {}
        const keys =
          parsed && typeof parsed === "object"
            ? Object.keys(parsed).join(", ")
            : ""
        console.log(
          `[cs2-gsi] payload received (${body.length} bytes)${
            keys ? ` keys: ${keys}` : ""
          }`,
        )
        latest = {
          receivedAt: Date.now(),
          ...parsed,
        }
        broadcast("update", latest)
        json(res, 200, { ok: true })
      } catch {
        console.error(
          `[cs2-gsi] invalid JSON payload (${body.length} bytes): ${body.slice(
            0,
            180,
          )}`,
        )
        json(res, 400, { ok: false, error: "Invalid JSON payload" })
      }
    })
    return
  }

  json(res, 404, { ok: false, error: "Not found" })
})

server.listen(PORT, () => {
  console.log(`[cs2-gsi] Listening on http://localhost:${PORT}`)
  console.log("[cs2-gsi] CS2 cfg uri should be: http://localhost:3210")
  console.log("[cs2-gsi] Overlay listens on /events (SSE)")
})

