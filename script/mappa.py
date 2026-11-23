#!/usr/bin/env python3
"""Prepara i tracciati delle province per la mappa della home.

Legge i confini amministrativi ISTAT generalizzati (shapefile, UTM 32N, licenza CC BY 4.0):
  https://www.istat.it/storage/cartografia/confini_amministrativi/generalizzati/2025/Limiti01012025_g.zip
da scompattare in dati-istat/confini/ (cartella non versionata), e scrive sito/data/mappa.json:
un tracciato SVG per provincia, già semplificato, nelle coordinate di un viewBox fisso.
Solo libreria standard: nessuna dipendenza da installare.

Uso, dalla radice del repo: python3 script/mappa.py
Confronta le province dei confini con quelle di sito/data/province-lite.json e stampa le discordanze.
"""
import json
import re
import struct
import sys
import unicodedata
from pathlib import Path

RADICE = Path(__file__).resolve().parent.parent
SHP = RADICE / "dati-istat/confini/ProvCM01012025_g/ProvCM01012025_g_WGS84"
DATI = RADICE / "sito/data/province-lite.json"
USCITA = RADICE / "sito/data/mappa.json"

LARGHEZZA = 500          # unità del viewBox in orizzontale
TOLLERANZA = 0.3         # unità del viewBox: soglia della semplificazione (Douglas-Peucker)
AREA_MINIMA = 0.8        # unità² del viewBox: isole e pezzi più piccoli si scartano


ALIAS = {"reggiodicalabria": "reggiocalabria"}  # ISTAT scrive "Reggio di Calabria"


def chiave(nome):
    nome = nome.split("/")[0]
    nome = unicodedata.normalize("NFD", nome.lower())
    nome = "".join(c for c in nome if unicodedata.category(c) != "Mn")
    nome = re.sub(r"[^a-z0-9]+", "", nome)
    return ALIAS.get(nome, nome)


def leggi_dbf(percorso):
    f = percorso.read_bytes()
    n, lt, lr = struct.unpack("<xxxxIHH", f[:12])
    campi, o = [], 32
    while f[o] != 0x0D:
        campi.append((f[o:o + 11].split(b"\0")[0].decode(), f[o + 16]))
        o += 32
    righe = []
    for i in range(n):
        r = f[lt + i * lr: lt + (i + 1) * lr][1:]
        d, p = {}, 0
        for nome, ln in campi:
            d[nome] = r[p:p + ln].decode("utf-8").strip()
            p += ln
        righe.append(d)
    return righe


def leggi_shp(percorso):
    """Una lista di poligoni per record; ogni poligono è una lista di anelli [(x, y), ...]."""
    f = percorso.read_bytes()
    pos, out = 100, []
    while pos < len(f):
        lung = struct.unpack(">i", f[pos + 4:pos + 8])[0] * 2
        rec = f[pos + 8:pos + 8 + lung]
        pos += 8 + lung
        tipo = struct.unpack("<i", rec[:4])[0]
        if tipo != 5:
            sys.exit(f"Tipo di forma non gestito: {tipo}")
        npart, npunti = struct.unpack("<ii", rec[36:44])
        parti = list(struct.unpack(f"<{npart}i", rec[44:44 + 4 * npart])) + [npunti]
        o = 44 + 4 * npart
        punti = [struct.unpack("<dd", rec[o + 16 * i:o + 16 * i + 16]) for i in range(npunti)]
        out.append([punti[parti[i]:parti[i + 1]] for i in range(npart)])
    return out


def semplifica(punti, tol):
    """Douglas-Peucker iterativo; vale anche per anelli chiusi (primo e ultimo punto coincidono)."""
    if len(punti) < 4:
        return punti
    tieni = [False] * len(punti)
    tieni[0] = tieni[-1] = True
    pila = [(0, len(punti) - 1)]
    while pila:
        a, b = pila.pop()
        (ax, ay), (bx, by) = punti[a], punti[b]
        dx, dy = bx - ax, by - ay
        q = dx * dx + dy * dy
        massimo, indice = -1.0, -1
        for i in range(a + 1, b):
            px, py = punti[i]
            if q == 0:
                d = ((px - ax) ** 2 + (py - ay) ** 2) ** 0.5
            else:
                d = abs(dy * (px - ax) - dx * (py - ay)) / q ** 0.5
            if d > massimo:
                massimo, indice = d, i
        if massimo > tol:
            tieni[indice] = True
            pila += [(a, indice), (indice, b)]
    return [p for p, k in zip(punti, tieni) if k]


def area(anello):
    return abs(sum(x1 * y2 - x2 * y1 for (x1, y1), (x2, y2) in zip(anello, anello[1:] + anello[:1]))) / 2


def tracciato(anelli):
    """Percorso SVG con coordinate intere relative (m/l minuscoli)."""
    d = []
    for a in anelli:
        pp = [(round(x), round(y)) for x, y in a[:-1]]
        pp = [p for i, p in enumerate(pp) if i == 0 or p != pp[i - 1]]
        if len(pp) < 3:
            continue
        (x0, y0) = pp[0]
        seg = f"M{x0} {y0}l" + " ".join(f"{x - px} {y - py}" for (px, py), (x, y) in zip(pp, pp[1:])) + "z"
        d.append(seg)
    return "".join(d)


def main():
    forme, schede = leggi_shp(SHP.with_suffix(".shp")), leggi_dbf(SHP.with_suffix(".dbf"))
    xs = [x for poligono in forme for anello in poligono for x, _ in anello]
    ys = [y for poligono in forme for anello in poligono for _, y in anello]
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    scala = (x1 - x0) / LARGHEZZA
    altezza = round((y1 - y0) / scala)

    nostre = {chiave(p["provincia"]): p["provincia"] for p in json.loads(DATI.read_text())["province"]}
    trovate, province = {}, {}
    for anelli, s in zip(forme, schede):
        nome = s["DEN_UTS"]
        k = chiave(nome)
        mio = nostre.get(k)
        if not mio:
            trovate[nome] = None
            continue
        trovate[nome] = mio
        pezzi = []
        for anello in anelli:
            a = [((x - x0) / scala, (y1 - y) / scala) for x, y in anello]
            if area(a) < AREA_MINIMA:
                continue
            pezzi.append(semplifica(a, TOLLERANZA))
        province[mio] = {"sigla": s["SIGLA"], "d": tracciato(pezzi)}

    solo_nostre = sorted(set(nostre.values()) - set(province))
    solo_confini = sorted(n for n, m in trovate.items() if m is None)
    print(f"Confini ISTAT: {len(schede)} unità; nostre province: {len(nostre)}; abbinate: {len(province)}")
    print("Nei dati e non nei confini:", solo_nostre or "nessuna")
    print("Nei confini e non nei dati:", solo_confini or "nessuna")

    USCITA.write_text(json.dumps({
        "fonte": "ISTAT, Confini delle unità amministrative a fini statistici, generalizzati, 1 gennaio 2025",
        "viewBox": [LARGHEZZA, altezza],
        "province": dict(sorted(province.items())),
    }, ensure_ascii=False, separators=(",", ":")))
    print(f"Scritto {USCITA.relative_to(RADICE)}: {USCITA.stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    main()
