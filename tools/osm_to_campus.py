#!/usr/bin/env python3
"""Convertit un extrait OpenStreetMap (.osm, API 0.6 /map) en assets/campus.json pour le vol 3D.

Usage :
  curl -o campus.osm "https://api.openstreetmap.org/api/0.6/map?bbox=-1.7160,48.1088,-1.6985,48.1178"
  python3 tools/osm_to_campus.py campus.osm assets/campus.json

Coordonnées de sortie : décimètres (entiers), x vers l'est, y vers le nord,
origine = bâtiment 11 (lat/lng de data.js). Données © contributeurs OpenStreetMap (ODbL).
"""
import json, math, random, re, sys
import xml.etree.ElementTree as ET

LAT0, LON0 = 48.11349, -1.70613
KX = 111320 * math.cos(math.radians(LAT0))
KY = 110540
CENTER = (-150.0, 0.0)      # centre de la zone dessinée (m)
RADIUS = 660.0              # au-delà, rien n'est exporté
TARGET, MAIN = '24', '11'   # bâtiment des conférences, bâtiment historique

def load(path):
    root = ET.parse(path).getroot()
    nodes = {}
    for n in root.iter('node'):
        tags = {t.get('k'): t.get('v') for t in n.findall('tag')}
        nodes[n.get('id')] = ((float(n.get('lon')) - LON0) * KX, (float(n.get('lat')) - LAT0) * KY, tags)
    ways = {}
    for w in root.iter('way'):
        ways[w.get('id')] = ([nd.get('ref') for nd in w.findall('nd')], {t.get('k'): t.get('v') for t in w.findall('tag')})
    rels = []
    for r in root.iter('relation'):
        rels.append(([(m.get('type'), m.get('ref'), m.get('role')) for m in r.findall('member')], {t.get('k'): t.get('v') for t in r.findall('tag')}))
    return nodes, ways, rels

# ---------- géométrie ----------
def area(p):
    return 0.5 * sum(p[i][0] * p[(i + 1) % len(p)][1] - p[(i + 1) % len(p)][0] * p[i][1] for i in range(len(p)))

def perimeter(p):
    return sum(math.dist(p[i], p[(i + 1) % len(p)]) for i in range(len(p)))

def centroid(p):
    a = area(p)
    if abs(a) < 1e-9:
        return (sum(q[0] for q in p) / len(p), sum(q[1] for q in p) / len(p))
    cx = cy = 0.0
    for i in range(len(p)):
        x0, y0 = p[i]; x1, y1 = p[(i + 1) % len(p)]
        c = x0 * y1 - x1 * y0
        cx += (x0 + x1) * c; cy += (y0 + y1) * c
    return (cx / (6 * a), cy / (6 * a))

def inside(pt, poly):
    x, y = pt; c = False
    for i in range(len(poly)):
        x0, y0 = poly[i]; x1, y1 = poly[i - 1]
        if (y0 > y) != (y1 > y) and x < (x1 - x0) * (y - y0) / (y1 - y0) + x0:
            c = not c
    return c

def clean(pts, min_edge=0.45, min_turn=0.06):
    p = [tuple(q) for q in pts]
    if len(p) > 1 and math.dist(p[0], p[-1]) < 1e-6:
        p = p[:-1]
    changed = True
    while changed and len(p) >= 3:
        changed = False
        out = []
        for i in range(len(p)):
            if out and math.dist(out[-1], p[i]) < min_edge:
                changed = True; continue
            out.append(p[i])
        if len(out) > 2 and math.dist(out[0], out[-1]) < min_edge:
            out.pop(); changed = True
        p = out
        if len(p) < 3: break
        out = []
        n = len(p)
        for i in range(n):
            a, b, c = p[i - 1], p[i], p[(i + 1) % n]
            ux, uy = b[0] - a[0], b[1] - a[1]; vx, vy = c[0] - b[0], c[1] - b[1]
            lu, lv = math.hypot(ux, uy), math.hypot(vx, vy)
            if lu < 1e-9 or lv < 1e-9:
                changed = True; continue
            s = (ux * vy - uy * vx) / (lu * lv)
            d = (ux * vx + uy * vy) / (lu * lv)
            if abs(s) < min_turn and d > 0:        # quasi aligné : on retire b
                changed = True; continue
            out.append(b)
        p = out
    if len(p) < 3:
        return None
    if area(p) < 0:
        p.reverse()
    return p

def seg_intersect(a, b, c, d):
    def orient(p, q, r):
        return (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])
    o1, o2, o3, o4 = orient(a, b, c), orient(a, b, d), orient(c, d, a), orient(c, d, b)
    return (o1 * o2 < 0) and (o3 * o4 < 0)

def simple(p):
    n = len(p)
    for i in range(n):
        a, b = p[i], p[(i + 1) % n]
        for j in range(i + 2, n):
            if i == 0 and j == n - 1:
                continue
            if seg_intersect(a, b, p[j], p[(j + 1) % n]):
                return False
    return True

def inset(p, d):
    """Décale un polygone CCW vers l'intérieur de d mètres (joints en onglet)."""
    n = len(p)
    lines = []
    for i in range(n):
        a, b = p[i], p[(i + 1) % n]
        dx, dy = b[0] - a[0], b[1] - a[1]
        l = math.hypot(dx, dy)
        nx, ny = -dy / l, dx / l                      # normale gauche = intérieur (CCW)
        lines.append(((a[0] + nx * d, a[1] + ny * d), (dx / l, dy / l)))
    out = []
    for i in range(n):
        (p1, d1), (p2, d2) = lines[i - 1], lines[i]
        den = d1[0] * d2[1] - d1[1] * d2[0]
        if abs(den) < 0.08:                            # presque parallèles
            out.append(p2)
            continue
        t = ((p2[0] - p1[0]) * d2[1] - (p2[1] - p1[1]) * d2[0]) / den
        out.append((p1[0] + d1[0] * t, p1[1] + d1[1] * t))
    # validation
    for i in range(n):
        a, b = p[i], p[(i + 1) % n]
        c, e = out[i], out[(i + 1) % n]
        if (b[0] - a[0]) * (e[0] - c[0]) + (b[1] - a[1]) * (e[1] - c[1]) <= 0.05 * math.dist(a, b) ** 2:
            return None
    if area(out) <= 0.5 or area(out) >= area(p) or not simple(out):
        return None
    if not all(inside(q, p) for q in out):
        return None
    return out

def roof_rings(p, d, rise, tiers=1, second=None):
    """Renvoie [(anneau, hauteur relative), ...] pour un toit à pans, ou None."""
    for k in range(4):
        r = inset(p, d)
        if r:
            rings = [(r, rise)]
            if second:
                d2, rise2 = second
                for _ in range(3):
                    r2 = inset(r, d2)
                    if r2:
                        rings.append((r2, rise + rise2)); break
                    d2 *= 0.6
            return rings
        d *= 0.62; rise *= 0.62
        if d < 0.6:
            break
    return None

def num(v):
    if v is None:
        return None
    m = re.match(r'\s*([0-9]+(?:[.,][0-9]+)?)', str(v))
    return float(m.group(1).replace(',', '.')) if m else None

def dm(v):
    return int(round(v * 10))

def flat_dm(p):
    out = []
    for x, y in p:
        out += [dm(x), dm(y)]
    return out

# ---------- extraction ----------
def main(src, dst):
    nodes, ways, rels = load(src)
    pt = lambda ref: (nodes[ref][0], nodes[ref][1]) if ref in nodes else None
    def ring(refs):
        r = [pt(x) for x in refs]
        return [q for q in r if q]
    near = lambda q, extra=0: math.dist(q, CENTER) < RADIUS + extra

    # périmètre du campus
    campus = None
    for refs, tags in ways.values():
        if tags.get('name') == "L'Institut Agro Rennes-Angers" and refs[0] == refs[-1]:
            campus = clean(ring(refs), 0.3, 0.02)
    assert campus, 'périmètre du campus introuvable'

    rng = random.Random(24)
    buildings = []

    def add_building(outer, tags, holes=()):
        p = clean(outer)
        if not p or abs(area(p)) < 6:
            return
        c = centroid(p)
        if not near(c):
            return
        btype = tags.get('building', 'yes')
        name = tags.get('name', '') or ''
        ref = tags.get('ref', '') or ''
        m = re.match(r'\s*([0-9]{1,2}[a-z]?)\b', name) or re.match(r'\s*([0-9]{1,2}[a-z]?)\b', ref) or re.search(r'\(([0-9]{1,2}[a-z]?)\)', name)
        label = m.group(1) if m else None
        on_campus = inside(c, campus)
        if not on_campus:
            label = None
        a = area(p)
        levels = num(tags.get('building:levels'))
        height = num(tags.get('height'))
        roof_levels = num(tags.get('roof:levels')) or 0
        shape = tags.get('roof:shape')
        housey = btype in ('house', 'detached', 'semidetached_house', 'terrace', 'residential', 'bungalow')
        small = btype in ('garage', 'garages', 'shed', 'hut', 'service', 'roof', 'greenhouse', 'kiosk', 'carport')
        churchy = btype in ('church', 'chapel', 'mosque', 'cathedral')
        if btype == 'yes' and not on_campus:
            if a < 38: small = True
            elif a < 230: housey = True
        if levels is None:
            if housey: levels = 2
            elif small: levels = 1
            elif btype == 'apartments': levels = 5
            elif btype in ('dormitory', 'university', 'college', 'school', 'commercial', 'office', 'hotel', 'civic', 'retail'): levels = 3
            elif churchy: levels = 3
            elif on_campus: levels = 2 if a < 260 else 3
            else: levels = 2 if a < 600 else 3
        levels = max(levels, 0.6)
        wall = levels * 3.05 + (0.4 if not small else 0.0)
        pitched = False
        if shape in ('gabled', 'hipped', 'half-hipped', 'gambrel', 'mansard', 'pyramidal', 'skillion', 'round', 'dome'):
            pitched = True
        elif shape is None and (housey or churchy):
            pitched = True
        if label == MAIN:
            pitched = True
            wall = 12.5
        if label == TARGET:
            wall = 11.0
        if height:
            wall = height * (0.72 if pitched else 1.0)
        t = 2 * a / perimeter(p)                       # épaisseur moyenne
        rings = None
        if pitched and not holes:
            if label == MAIN:                          # toit à la Mansart : brisis raide puis terrasson
                rings = roof_rings(p, 1.6, 4.2, second=(2.6, 1.1))
            else:
                d = min(0.62 * t, 6.5)
                rise = d * (0.95 if not churchy else 1.5)
                if roof_levels:
                    rise = max(rise, roof_levels * 2.4)
                rings = roof_rings(p, d, rise)
        flags = (1 if on_campus else 0) | (2 if label == TARGET else 0) | (4 if label == MAIN else 0)
        b = {'f': flags, 'h': dm(wall), 'p': flat_dm(p)}
        if rings:
            b['r'] = [[flat_dm(r), dm(hh)] for r, hh in rings]
        if holes:
            hs = [clean(h) for h in holes]
            hs = [list(reversed(h)) for h in hs if h and abs(area(h)) > 4]
            if hs:
                b['o'] = [flat_dm(h) for h in hs]
        if label:
            b['n'] = label
        buildings.append(b)

    rel_members = set()
    for members, tags in rels:
        if 'building' in tags and tags.get('type') == 'multipolygon':
            outers = [ways[r][0] for t, r, role in members if t == 'way' and r in ways and role == 'outer']
            inners = [ways[r][0] for t, r, role in members if t == 'way' and r in ways and role == 'inner']
            for t, r, role in members:
                rel_members.add(r)
            for o in outers:
                if o[0] == o[-1]:
                    add_building(ring(o), tags, [ring(i) for i in inners if i[0] == i[-1]])
    for wid, (refs, tags) in ways.items():
        if 'building' in tags and refs[0] == refs[-1] and wid not in rel_members and tags.get('building') not in ('no',):
            add_building(ring(refs), tags)

    # rues
    widths = {'primary': None, 'secondary': 9.0, 'tertiary': 8.0, 'residential': 6.5, 'unclassified': 6.5,
              'living_street': 5.5, 'secondary_link': 6.0, 'service': 4.2, 'pedestrian': 5.0, 'track': 3.0,
              'footway': 1.8, 'path': 1.6, 'cycleway': 2.0}
    cls_id = {'primary': 0, 'secondary': 1, 'tertiary': 1, 'secondary_link': 1, 'residential': 2, 'unclassified': 2,
              'living_street': 2, 'service': 3, 'pedestrian': 3, 'track': 3, 'footway': 4, 'path': 4, 'cycleway': 4}
    roads = []
    for refs, tags in ways.values():
        hw = tags.get('highway')
        if hw not in widths or tags.get('area') == 'yes' or tags.get('tunnel') in ('yes', 'building_passage'):
            continue
        r = ring(refs)
        if len(r) < 2 or not any(near(q, 60) for q in r):
            continue
        w = widths[hw]
        if w is None:
            lanes = num(tags.get('lanes')) or 2
            w = lanes * 3.3 + (1.6 if tags.get('cycleway:right') in ('lane', 'share_busway') else 0)
        roads.append({'c': cls_id[hw], 'w': dm(w), 'p': flat_dm(r)})

    # surfaces : 0 vert, 1 eau, 2 parking, 3 terrain de sport
    areas = []
    green_lu = ('grass', 'meadow', 'village_green', 'forest', 'allotments', 'farmland', 'recreation_ground', 'orchard')
    def area_kind(tags):
        if tags.get('natural') == 'water' or tags.get('leisure') == 'swimming_pool' or tags.get('water'):
            return 1
        if tags.get('amenity') == 'parking':
            return 2
        if tags.get('leisure') == 'pitch':
            return 3
        if tags.get('landuse') in green_lu or tags.get('leisure') in ('park', 'garden', 'playground') or tags.get('natural') in ('wood', 'scrub', 'grassland', 'wetland'):
            return 0
        return None
    woods = []
    for refs, tags in ways.values():
        if refs[0] != refs[-1] or 'building' in tags:
            continue
        k = area_kind(tags)
        if k is None:
            continue
        p = clean(ring(refs), 0.3, 0.03)
        if not p or abs(area(p)) < 12 or not near(centroid(p), 80):
            continue
        areas.append({'k': k, 'p': flat_dm(p)})
        if tags.get('natural') == 'wood' or tags.get('landuse') == 'forest':
            woods.append(p)

    # arbres : nœuds, alignements, bois
    trees = []
    def add_tree(x, y, r=None):
        if near((x, y)):
            trees.append((x, y, r if r else 2.6 + rng.random() * 2.6))
    for x, y, tags in nodes.values():
        if tags.get('natural') == 'tree':
            add_tree(x, y)
    for refs, tags in ways.values():
        if tags.get('natural') == 'tree_row':
            r = ring(refs)
            for i in range(len(r) - 1):
                a, b = r[i], r[i + 1]
                L = math.dist(a, b)
                n = max(1, int(L / 7.5))
                for k in range(n):
                    u = (k + rng.random() * 0.3) / n
                    add_tree(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, 2.2 + rng.random() * 1.6)
    for p in woods:
        xs = [q[0] for q in p]; ys = [q[1] for q in p]
        y = min(ys)
        while y < max(ys):
            x = min(xs)
            while x < max(xs):
                q = (x + rng.uniform(-3, 3), y + rng.uniform(-3, 3))
                if inside(q, p):
                    add_tree(q[0], q[1], 3.0 + rng.random() * 2.8)
                x += 9.0
            y += 8.0
    # pas de doublons trop proches
    trees.sort()
    kept = []
    grid = {}
    for x, y, r in trees:
        key = (int(x // 4), int(y // 4))
        if any(math.dist((x, y), q[:2]) < 2.5 for dx in (-1, 0, 1) for dy in (-1, 0, 1) for q in grid.get((key[0] + dx, key[1] + dy), [])):
            continue
        grid.setdefault(key, []).append((x, y))
        kept.append((x, y, r))
    tree_flat = []
    for x, y, r in kept:
        tree_flat += [dm(x), dm(y), dm(r)]

    # repères utiles au script
    def bcenter(label):
        for b in buildings:
            if b.get('n') == label:
                pts = [(b['p'][i] / 10, b['p'][i + 1] / 10) for i in range(0, len(b['p']), 2)]
                c = centroid(pts)
                return [round(c[0], 1), round(c[1], 1)]
    out = {
        'v': 1,
        'origin': [LAT0, LON0],
        'unit': 'dm',
        'attribution': '© contributeurs OpenStreetMap (ODbL)',
        'center': list(CENTER),
        'campus': flat_dm(campus),
        'marks': {'target': bcenter(TARGET), 'main': bcenter(MAIN)},
        'buildings': buildings,
        'roads': roads,
        'areas': areas,
        'trees': tree_flat,
    }
    with open(dst, 'w', encoding='utf-8') as f:
        json.dump(out, f, separators=(',', ':'), ensure_ascii=False)
    print(f'{len(buildings)} bâtiments ({sum(1 for b in buildings if "r" in b)} toits à pans, '
          f'{sum(1 for b in buildings if b["f"] & 1)} sur le campus), {len(roads)} rues, {len(areas)} surfaces, '
          f'{len(kept)} arbres → {dst}')
    print('repères :', out['marks'])

if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
