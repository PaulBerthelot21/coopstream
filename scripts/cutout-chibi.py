from collections import deque
from PIL import Image

src = r"d:\coopstream\public\overlays\lecalme-rebrand\chibi-source.png"
dst = r"d:\coopstream\public\overlays\lecalme-rebrand\chibi.png"

im = Image.open(src).convert("RGBA")
w, h = im.size
px = im.load()


def is_bg(r: int, g: int, b: int, a: int) -> bool:
    return a > 0 and r <= 18 and g <= 18 and b <= 18


visited = [[False] * w for _ in range(h)]
q: deque[tuple[int, int]] = deque()

for x in range(w):
    for y in (0, h - 1):
        r, g, b, a = px[x, y]
        if is_bg(r, g, b, a):
            q.append((x, y))
            visited[y][x] = True

for y in range(h):
    for x in (0, w - 1):
        r, g, b, a = px[x, y]
        if is_bg(r, g, b, a) and not visited[y][x]:
            q.append((x, y))
            visited[y][x] = True

while q:
    x, y = q.popleft()
    r, g, b, a = px[x, y]
    if is_bg(r, g, b, a):
        lum = max(r, g, b)
        if lum <= 8:
            px[x, y] = (0, 0, 0, 0)
        else:
            px[x, y] = (r, g, b, int(255 * (lum / 18)))
    for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
        if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx]:
            nr, ng, nb, na = px[nx, ny]
            if is_bg(nr, ng, nb, na):
                visited[ny][nx] = True
                q.append((nx, ny))

bbox = im.getbbox()
if bbox:
    pad = 8
    left, top, right, bottom = bbox
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(w, right + pad)
    bottom = min(h, bottom + pad)
    im = im.crop((left, top, right, bottom))

im.save(dst, optimize=True)
print("saved", dst, im.size)
