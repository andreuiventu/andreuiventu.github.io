# Andreu & Ventu — Web de casament 💍

Una pàgina web de casament *over-the-top*, en català, amb estètica **mediterrània editorial** (sàlvia, oliva, ivori; tipografies Cormorant Garamond i Great Vibes). Estàtica al 100%, pensada per allotjar-se gratis a **GitHub Pages**.

**Nuvis:** Andreu & Ventu · **Data:** 27 d'agost · **Lloc:** Can Cugulada

## Què inclou

- Pantalla de càrrega amb monograma animat
- Hero amb pètals que cauen i botànica dibuixada
- Compte enrere en directe fins al gran dia
- Invitació, secció dels nuvis, cronograma del dia (hora a hora)
- Mapa de Can Cugulada (Google Maps incrustat)
- Codi de vestimenta amb paleta de colors
- Formulari de confirmació (RSVP) que obre el correu amb totes les respostes
- Llista de reproducció (Spotify) i petició de cançons
- Llista de noces amb IBAN i botó de copiar
- **Minijocs**: Paraulògic (paraula amagada «CASAMENT», amb diccionari català real) i un Wordle on la paraula secreta és «CUGULADA»
- Preguntes freqüents (acordió)
- Llibre de visites (es guarda al navegador)
- Música ambiental, confeti, codi Konami i altres detalls 🎉

## Personalització ràpida

Edita aquests valors a `assets/js/script.js`:

```js
const WEDDING    = new Date("2026-08-27T19:00:00+02:00"); // data i hora
const RSVP_EMAIL = "andreu.ventu.casament@example.com";   // correu de confirmacions
const IBAN       = "ES00 0000 0000 0000 0000 0000";       // IBAN regal
```

Per canviar colors o tipografies: `assets/css/style.css` (variables a `:root`).

## Com publicar-ho a GitHub Pages

Hi ha un workflow a `.github/workflows/deploy.yml` que ho desplega automàticament.

1. Puja els canvis a la branca `main`.
2. A GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Cada `push` a `main` torna a publicar la web.

La web quedarà a: `https://<usuari>.github.io/fake_wedding_sekta/`

> Alternativa sense Actions: **Settings → Pages → Source: Deploy from a branch → `main` / `(root)`**.

## Desenvolupament local

No cal cap build. Obre `index.html` al navegador, o serveix la carpeta:

```bash
python3 -m http.server 8000
# obre http://localhost:8000
```
