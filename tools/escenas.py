"""
Generador de escenas de montaña (pintura digital procedural) para Hombres de Pacto.
No usa fotografías ni personas: cielo, sol, rayos, cordilleras con perspectiva
atmosférica, niebla, luz de borde y grano. Salida: public/images/escenas/*.webp

Uso:  python tools/escenas.py
"""
import os
import numpy as np
from PIL import Image, ImageFilter

OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'images', 'escenas')
os.makedirs(OUT, exist_ok=True)


def hexrgb(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.float32) / 255


def noise1d(n, rng, octaves=6, base=3, persistence=.55):
    out = np.zeros(n, np.float32)
    amp, freq, tot = 1.0, base, 0
    x = np.linspace(0, 1, n)
    for _ in range(octaves):
        pts = rng.random(freq + 1)
        out += amp * np.interp(x, np.linspace(0, 1, freq + 1), pts)
        tot += amp
        amp *= persistence
        freq *= 2
    return out / tot


def noise2d(h, w, rng, octaves=5, base=4):
    out = np.zeros((h, w), np.float32)
    amp, tot = 1.0, 0
    for o in range(octaves):
        f = base * 2 ** o
        g = rng.random((max(2, int(f * h / w) + 1), f + 1)).astype(np.float32)
        img = Image.fromarray((g * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
        out += amp * (np.asarray(img, np.float32) / 255)
        tot += amp
        amp *= .5
    return out / tot


def gradient(h, stops):
    """stops: [(pos 0..1, '#hex'), ...] → array (h, 3)"""
    pos = np.array([s[0] for s in stops])
    cols = np.array([hexrgb(s[1]) for s in stops])
    y = np.linspace(0, 1, h)
    return np.stack([np.interp(y, pos, cols[:, c]) for c in range(3)], axis=1)


def render(name, w, h, sky, sun, layers, haze, fog=(), rays=.5, stars=0, seed=7, clouds_sea=None, trail=None, warmth=1.0):
    rng = np.random.default_rng(seed)
    Y, X = np.mgrid[0:h, 0:w].astype(np.float32)
    img = np.repeat(gradient(h, sky)[:, None, :], w, axis=1)

    # Estrellas
    if stars:
        s = rng.random((h, w)) > 1 - stars
        s &= Y < h * .55
        img[s] = np.minimum(1, img[s] + rng.random((s.sum(), 1)) * .7)

    # Sol, halo y rayos
    sx, sy, sr = sun['x'] * w, sun['y'] * h, sun['r'] * w
    scol = hexrgb(sun['color'])
    d = np.hypot(X - sx, Y - sy)
    bloom = (np.exp(-(d / (sr * 9)) ** 2) * .55 + np.exp(-(d / (sr * 3)) ** 2) * .6 + np.exp(-(d / (sr * 1.1)) ** 4) * 1.2) * sun.get('power', 1)
    if rays:
        ang = np.arctan2(Y - sy, X - sx)
        rn = noise1d(720, rng, 4, 24)
        ray = rn[((ang + np.pi) / (2 * np.pi) * 719).astype(int)] ** 3
        ray *= np.exp(-(d / (w * .55)) ** 2) * rays
        bloom += ray * (Y < sy + sr)
    img = img + bloom[..., None] * scol * .9
    img = 1 - (1 - img) * np.exp(-bloom[..., None] * .15)

    # Mar de nubes (para la cumbre)
    def fog_band(y0, thick, color, alpha, freq=6, s2=1):
        n2 = noise2d(h, w, np.random.default_rng(seed + s2), 5, freq)
        prof = np.exp(-((Y - y0 * h) / (thick * h)) ** 2)
        a = np.clip(prof * (0.55 + n2 * .9) * alpha, 0, 1)[..., None]
        return a, hexrgb(color)

    # Cordilleras de lejos a cerca
    for i, L in enumerate(layers):
        r = noise1d(w, np.random.default_rng(seed + 11 * i), L.get('oct', 7), L.get('freq', 3))
        r = (r - r.min()) / (r.max() - r.min() + 1e-6)
        if L.get('peak'):  # pico dominante
            px, pw = L['peak']
            xx = np.arange(w) / w - px
            jag = noise1d(w, np.random.default_rng(seed + 5 * i), 6, 12)
            shape = np.exp(-np.abs(xx) / pw) * (0.82 + 0.18 * jag) + np.exp(-(xx / (pw * 3)) ** 2) * .15
            r = np.maximum(r * .55, shape / shape.max())
        ridge = L['y'] * h - r * L['amp'] * h
        mask = Y >= ridge[None, :]
        depth = L['haze']
        base = hexrgb(L['color']) * (1 - depth) + hexrgb(haze) * depth
        tex = noise2d(h, w, np.random.default_rng(seed + 31 * i), 6, 8)
        shade = 1 + (tex - .5) * L.get('texture', .25)
        # luz lateral: laderas que miran al sol
        sm_r = np.convolve(np.pad(ridge, 60, mode='edge'), np.ones(121) / 121, mode='same')[60:-60]
        slope = np.gradient(sm_r)
        side = np.clip(-np.sign(np.arange(w) - sx) * slope * .05, -.6, .6)
        shade = shade * (1 + side[None, :] * L.get('side', .5) * (1 - depth))
        big = np.convolve(np.pad(ridge, 150, mode='edge'), np.ones(301) / 301, mode='same')[150:-150]
        dist_top = np.clip((Y - np.minimum(big, ridge)[None, :]) / (h * .3), 0, 1)
        col = base[None, None, :] * shade[..., None] * (1 - dist_top[..., None] * L.get('fall', .35))
        # luz de borde dorada
        near_sun = np.exp(-((np.arange(w) - sx) / (w * .35)) ** 2)
        rim = np.clip(1 - (Y - ridge[None, :]) / L.get('rimw', 5), 0, 1) * (Y >= ridge[None, :])
        col = col + (rim * near_sun[None, :] * L.get('rim', .45))[..., None] * scol
        img = np.where(mask[..., None], col, img)
        for f in fog:
            if f[0] == i:
                a, c = fog_band(*f[1:])
                img = img * (1 - a) + c * a
        if clouds_sea and clouds_sea[0] == i:
            y0, color = clouds_sea[1], hexrgb(clouds_sea[2])
            n2 = noise2d(h, w, np.random.default_rng(seed + 99), 6, 5)
            top = y0 * h - n2 * h * .07
            a = np.clip((Y - top) / (h * .05), 0, 1) * .97
            lit = 1 + np.exp(-((X - sx) / (w * .3)) ** 2) * .25
            cc = color * lit[..., None] * (0.9 + n2[..., None] * .2)
            img = img * (1 - a[..., None]) + cc * a[..., None]

    # Sendero (camino que asciende)
    if trail:
        pts = np.array(trail, dtype=np.float32) * [w, h]
        t = np.linspace(0, 1, 2000)
        idx = t * (len(pts) - 1)
        i0 = np.floor(idx).astype(int).clip(0, len(pts) - 2)
        f = (idx - i0)[:, None]
        p0, p1 = pts[i0], pts[i0 + 1]
        # Catmull-Rom simplificado
        pm = pts[np.clip(i0 - 1, 0, len(pts) - 1)]
        p2 = pts[np.clip(i0 + 2, 0, len(pts) - 1)]
        c = .5 * ((2 * p0) + (-pm + p1) * f + (2 * pm - 5 * p0 + 4 * p1 - p2) * f ** 2 + (-pm + 3 * p0 - 3 * p1 + p2) * f ** 3)
        trail_img = Image.new('L', (w, h), 0)
        from PIL import ImageDraw
        dr = ImageDraw.Draw(trail_img)
        for k in range(len(c) - 1):
            width = max(1, int(14 * (c[k][1] / h) ** 2))
            dr.line([tuple(c[k]), tuple(c[k + 1])], fill=200, width=width)
        a = np.asarray(trail_img.filter(ImageFilter.GaussianBlur(1.6)), np.float32)[..., None] / 255 * .42
        img = img * (1 - a) + hexrgb('#f0d9a8') * a

    # Calidez, viñeta y grano
    img = img * np.array([1.0, 1.0, 1.0 - .04 * warmth])
    v = 1 - .35 * (((X - w / 2) / (w * .75)) ** 2 + ((Y - h * .45) / (h * .9)) ** 2)
    img = img * v[..., None]
    img = img + (rng.random((h, w, 1)) - .5) * .035
    out = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8))
    out.save(os.path.join(OUT, f'{name}.webp'), 'WEBP', quality=82, method=6)
    sm = out.resize((900, round(h * 900 / w)), Image.LANCZOS)
    sm.save(os.path.join(OUT, f'{name}-sm.webp'), 'WEBP', quality=78, method=6)
    print(name, out.size)


W, H = 2000, 1150

# Portada: amanecer cálido sobre la cordillera
render('amanecer', W, H,
       sky=[(0, '#1d2a44'), (.35, '#5a4a5a'), (.55, '#c27a46'), (.68, '#f2b766'), (1, '#f6d9a0')],
       sun=dict(x=.62, y=.58, r=.018, color='#ffe2a6', power=1.2), haze='#e9b37a', rays=.55,
       layers=[dict(y=.66, amp=.30, color='#8a6a5e', haze=.62, peak=(.44, .07), rim=.9),
               dict(y=.74, amp=.22, color='#5a4038', haze=.42, rim=.6),
               dict(y=.84, amp=.18, color='#33241e', haze=.25, rim=.35),
               dict(y=.95, amp=.14, color='#1a1310', haze=.08, rim=.2)],
       fog=[(0, .70, .05, '#f3c88e', .55), (1, .80, .05, '#e8b27a', .35)], seed=3)

# Etapas del Camino de Pacto: del valle a la cumbre
etapas = [
    ('etapa-1-valle', [(0, '#0f1a2e'), (.5, '#26385a'), (.75, '#6a6a80'), (1, '#9a8a8a')], dict(x=.5, y=.95, r=.02, color='#f0c890', power=.35), '#8a90a8', .0,
     [dict(y=.55, amp=.32, color='#3a4a66', haze=.55), dict(y=.68, amp=.22, color='#24324a', haze=.35), dict(y=.86, amp=.14, color='#141c2a', haze=.12)],
     [(0, .60, .05, '#b8bccc', .55), (1, .74, .06, '#9aa0b4', .5)], None, [(.55, 1.0), (.42, .9), (.6, .82), (.48, .74)]),
    ('etapa-2-sendero', [(0, '#1a2440'), (.4, '#4b3e58'), (.65, '#a46a58'), (1, '#e0a878')], dict(x=.35, y=.72, r=.016, color='#ffd2a0', power=.6), '#c08a78', .3,
     [dict(y=.6, amp=.3, color='#6a5060', haze=.55, rim=.6), dict(y=.72, amp=.22, color='#3e2e36', haze=.35, rim=.4), dict(y=.88, amp=.15, color='#1e1618', haze=.1)],
     [(0, .66, .05, '#e2b49a', .45)], None, [(.6, 1.0), (.45, .92), (.58, .84), (.5, .76), (.56, .7)]),
    ('etapa-3-ladera', [(0, '#24304a'), (.35, '#7a5a50'), (.6, '#e09a52'), (1, '#f8d49a')], dict(x=.7, y=.55, r=.02, color='#ffe0a0', power=1.0), '#e0a868', .5,
     [dict(y=.58, amp=.34, color='#8a6248', haze=.55, rim=.9, peak=(.3, .08)), dict(y=.72, amp=.24, color='#4e3624', haze=.32, rim=.6), dict(y=.9, amp=.16, color='#22170f', haze=.08, rim=.3)],
     [(0, .62, .05, '#f6c890', .4)], None, [(.45, 1.0), (.6, .9), (.42, .8), (.55, .7), (.45, .62)]),
    ('etapa-4-cresta', [(0, '#3a4a66'), (.3, '#b08a6a'), (.55, '#f2c27a'), (1, '#fbe6b8')], dict(x=.5, y=.42, r=.02, color='#fff0c8', power=1.0), '#f4d0a0', .65,
     [dict(y=.6, amp=.25, color='#c49a74', haze=.7, rim=.5), dict(y=.74, amp=.3, color='#6e4c34', haze=.3, rim=1.0, peak=(.62, .06)), dict(y=.94, amp=.2, color='#2a1c12', haze=.06, rim=.5)],
     [(0, .66, .06, '#fff1d6', .5)], None, [(.5, 1.0), (.62, .9), (.55, .8), (.62, .66)]),
    ('etapa-5-cumbre', [(0, '#4a5a7a'), (.3, '#d9a978'), (.5, '#ffd99a'), (1, '#fff3d8')], dict(x=.5, y=.3, r=.022, color='#fff6dc', power=1.05), '#ffe7c0', .8,
     [dict(y=.62, amp=.12, color='#d8b898', haze=.75), dict(y=1.02, amp=.62, color='#3a281a', haze=.05, rim=1.4, rimw=8, peak=(.5, .1), freq=2)],
     [], (0, .64, '#fff4e2'), [(.5, 1.0), (.44, .86), (.52, .74), (.47, .62), (.5, .46)]),
]
for name, sky, sun, haze, rays, layers, fog, sea, trail in etapas:
    render(name, 1600, 900, sky=sky, sun=sun, haze=haze, rays=rays, layers=layers, fog=fog, clouds_sea=sea, trail=trail, seed=sum(map(ord, name)) % 1000)

# Encuentros: crepúsculo con estrellas y alba en el horizonte
render('crepusculo', W, H,
       sky=[(0, '#070b16'), (.45, '#13223e'), (.7, '#3b4766'), (.85, '#b98a62'), (1, '#e8b880')],
       sun=dict(x=.5, y=.98, r=.02, color='#f4c890', power=.5), haze='#4a5878', rays=0, stars=.0012,
       layers=[dict(y=.72, amp=.26, color='#2a3654', haze=.5, rim=.5), dict(y=.82, amp=.2, color='#18213a', haze=.3, rim=.3), dict(y=.95, amp=.13, color='#0b0f1a', haze=.05)],
       fog=[(0, .76, .04, '#8a8aa0', .35)], seed=21)

# Oración: neblina serena de madrugada
render('serenidad', W, H,
       sky=[(0, '#c9c4bd'), (.45, '#e6d6c0'), (.7, '#f4e3c6'), (1, '#f8efe0')],
       sun=dict(x=.3, y=.5, r=.02, color='#fff1d0', power=.9), haze='#efe2cf', rays=.25,
       layers=[dict(y=.62, amp=.2, color='#b9aea2', haze=.6, texture=.1), dict(y=.74, amp=.18, color='#9a8c7e', haze=.45, texture=.12),
               dict(y=.86, amp=.14, color='#6e6256', haze=.3, texture=.15), dict(y=.98, amp=.1, color='#4a4038', haze=.15)],
       fog=[(0, .66, .06, '#f6ede0', .7), (1, .78, .06, '#f2e6d4', .6), (2, .9, .05, '#efe2cf', .5)], seed=33, warmth=.4)

# Altar: resplandor ámbar
render('resplandor', W, H,
       sky=[(0, '#120d0a'), (.4, '#3a2214'), (.62, '#a35a26'), (.75, '#f0a050'), (1, '#f8cf8a')],
       sun=dict(x=.5, y=.66, r=.02, color='#ffd08a', power=1.1), haze='#d88a48', rays=.7,
       layers=[dict(y=.7, amp=.24, color='#6a3a20', haze=.5, rim=.8), dict(y=.82, amp=.2, color='#331b10', haze=.25, rim=.4), dict(y=.96, amp=.12, color='#150c07', haze=.05)],
       fog=[(0, .74, .04, '#f2a860', .45)], seed=55)
