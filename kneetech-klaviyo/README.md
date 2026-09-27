# KNEETECH – e-maily a automatizace pro Klaviyo

13 hotových e-mailů v češtině (složka `templates/`) a plán 6 automatizací (flow).
Předměty a náhledové texty jsou v `subjects.json`. Když chceš e-maily upravit, změň `build.py` a spusť `python3 build.py`.

> Do Klaviya patří **nový účet pro KNEETECH**. Současný připojený účet patří Tone&Glow a je napojený na starý obchod.

## Příprava nového účtu (jednou)
1. Založ účet na klaviyo.com (odesílatel např. „KNEETECH“, e-mail, na který ti chodí odpovědi).
2. V Shopify nového obchodu nainstaluj aplikaci **Klaviyo** a propoj ji s tímhle účtem.
3. V Klaviyu → Integrace → Shopify zapni:
   - **Sync email subscribers to Klaviyo** → do seznamu **Newsletter** (sem padají lidi z vyskakovacího okna na webu),
   - **Onsite tracking** (kvůli e-mailům o prohlížení produktu a košíku).
4. Připoj Klaviyo konektor v claude.ai k novému účtu. Pak můžu všechny šablony i flow založit automaticky.

## Automatizace

| # | Flow | Spouštěč | Filtr | E-maily a časování |
|---|---|---|---|---|
| 1 | **Uvítací série** | Přidán do seznamu Newsletter | Placed Order = 0 od začátku flow (u e-mailů 2 a 3) | `welcome-1` hned → 2 dny → `welcome-2` → 3 dny → `welcome-3` |
| 2 | **Opuštěná pokladna** | Checkout Started | Placed Order = 0 od začátku flow; ne víc než 1× za 7 dní | 1 h → `checkout-1` → 23 h → `checkout-2` → 24 h → `checkout-3` |
| 3 | **Opuštěný košík** | Added to Cart | Checkout Started = 0 a Placed Order = 0 od začátku flow | 2 h → `cart-1` → 22 h → `cart-2` |
| 4 | **Prohlížení produktu** | Viewed Product | Added to Cart = 0, Checkout Started = 0, Placed Order = 0 od začátku; nebyl ve flow 2 a 3 posledních 7 dní | 4 h → `browse-1` |
| 5 | **Po nákupu** | Placed Order | – | 1 h → `post-1`; Fulfilled Order + 10 dní → `post-2`; + 7 dní → `post-3` (recenze, až bude Judge.me) |
| 6 | **Návrat** | Placed Order | Placed Order = 1 od začátku flow | 75 dní → `winback-1` |

U všech marketingových flow nech zapnuté **Smart Sending**. E-mail `post-1` může být transakční (bez souhlasu s marketingem), ostatní jen pro lidi se souhlasem.

## Na co dát pozor (právo)
- **Souhlas:** posílej marketing jen lidem, kteří se přihlásili (vyskakovací okno, patička, zaškrtnutí v pokladně). V souhlasu na webu je i věk 15+, protože cílíte na teenagery.
- **Odhlášení:** každý e-mail má odkaz „Odhlásit odběr“ a adresu provozovatele. V Klaviyu vyplň v nastavení účtu jméno a adresu (`organization.name`, `organization.full_address`).
- **Žádná falešná naléhavost:** kód VITEJ15 nemá konec platnosti, proto e-maily nepíšou „jen dnes“ ani „poslední šance“.
- **Recenze** (`post-3`) žádá o jakékoli hodnocení, i kritické. Neslibuj za recenzi odměnu, jinak ji musíš u recenze uvést.

## Odkazy v e-mailech
Vedou na `https://8yquir-xg.myshopify.com`. Až připojíš vlastní doménu, změň `STORE` v `build.py` a znovu spusť.
