"""Generátor e-mailů KNEETECH pro Klaviyo (HTML šablony). Spusť: python3 build.py"""
import html, os

STORE = "https://8yquir-xg.myshopify.com"   # po připojení domény nahraď
PRODUCT = STORE + "/products/kneetech-bandaz-na-koleno"
SIZES = STORE + "/pages/velikosti"
FAQ = STORE + "/pages/faq"

def layout(preheader, body):
    return f"""<!DOCTYPE html>
<html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting"><title>KNEETECH</title>
<style>
  body{{margin:0;padding:0;background:#f3f3f1;}}
  a{{color:#0a0a0a;}}
  @media (max-width:620px){{ .wrap{{width:100%!important}} .pad{{padding-left:24px!important;padding-right:24px!important}} .h1{{font-size:34px!important}} }}
</style></head>
<body style="margin:0;padding:0;background:#f3f3f1;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">{html.escape(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f3f1;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" style="width:600px;background:#ffffff;">
  <tr><td style="background:#0a0a0a;padding:22px 40px;" class="pad">
    <a href="{STORE}" style="text-decoration:none;color:#ffffff;font-family:'Oswald','Arial Narrow',Arial,sans-serif;font-weight:700;font-size:26px;letter-spacing:2px;">KNEETECH</a>
  </td></tr>
  {body}
  <tr><td class="pad" style="background:#0a0a0a;padding:28px 40px;font-family:Arial,sans-serif;font-size:12px;line-height:18px;color:#a8a8a8;">
    <strong style="color:#ffffff;">KNEETECH</strong> · Hraj naplno. Koleno pod kontrolou.<br>
    {{{{ organization.name }}}} · {{{{ organization.full_address }}}}<br>
    Dotaz? Odpověz na tenhle e-mail.<br><br>
    Tenhle e-mail ti přišel, protože jsi u nás nakoupil nebo ses přihlásil k odběru. {{% unsubscribe 'Odhlásit odběr' %}}
  </td></tr>
</table></td></tr></table></body></html>
"""

def hero(eyebrow, title, text):
    return f"""<tr><td class="pad" style="padding:44px 40px 8px;font-family:Arial,sans-serif;">
    <div style="font-family:'Oswald','Arial Narrow',Arial,sans-serif;font-size:12px;letter-spacing:4px;text-transform:uppercase;color:#6b6b6b;">{eyebrow}</div>
    <h1 class="h1" style="margin:12px 0 16px;font-family:'Oswald','Arial Narrow',Arial,sans-serif;font-size:42px;line-height:44px;text-transform:uppercase;color:#0a0a0a;">{title}</h1>
    <div style="font-size:16px;line-height:26px;color:#333333;">{text}</div>
  </td></tr>"""

def button(label, url):
    return f"""<tr><td class="pad" style="padding:24px 40px 8px;">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#0a0a0a;">
      <a href="{url}" style="display:inline-block;padding:17px 34px;font-family:'Oswald','Arial Narrow',Arial,sans-serif;font-size:16px;letter-spacing:3px;text-transform:uppercase;color:#ffffff;text-decoration:none;">{label}</a>
    </td></tr></table>
  </td></tr>"""

def code_box(code, note):
    return f"""<tr><td class="pad" style="padding:20px 40px 4px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:2px dashed #0a0a0a;"><tr>
      <td align="center" style="padding:18px;font-family:'Oswald','Arial Narrow',Arial,sans-serif;font-size:34px;letter-spacing:6px;font-weight:700;color:#0a0a0a;">{code}</td>
    </tr></table>
    <div style="font-family:Arial,sans-serif;font-size:13px;line-height:20px;color:#6b6b6b;padding-top:8px;">{note}</div>
  </td></tr>"""

def paragraph(text):
    return f"""<tr><td class="pad" style="padding:16px 40px 0;font-family:Arial,sans-serif;font-size:16px;line-height:26px;color:#333333;">{text}</td></tr>"""

def points(items):
    rows="".join(f"""<tr><td valign="top" style="padding:8px 12px 8px 0;font-family:'Oswald','Arial Narrow',Arial,sans-serif;font-size:18px;font-weight:700;color:#0a0a0a;">{i+1:02d}</td>
      <td style="padding:8px 0;font-family:Arial,sans-serif;font-size:15px;line-height:23px;color:#333333;"><strong style="color:#0a0a0a;">{t}</strong><br>{d}</td></tr>""" for i,(t,d) in enumerate(items))
    return f"""<tr><td class="pad" style="padding:20px 40px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e3e3e0;">{rows}</table></td></tr>"""

def offer():
    return f"""<tr><td class="pad" style="padding:24px 40px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;"><tr>
      <td style="padding:22px 24px;font-family:Arial,sans-serif;color:#ffffff;">
        <div style="display:inline-block;background:#d8ff3e;color:#0a0a0a;font-family:'Oswald','Arial Narrow',Arial,sans-serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;padding:4px 10px;">Nejvýhodnější</div>
        <div style="font-family:'Oswald','Arial Narrow',Arial,sans-serif;font-size:26px;text-transform:uppercase;margin-top:10px;">2 kusy na obě kolena</div>
        <div style="font-size:14px;color:#cfcfcf;margin-top:4px;"><s>1 180 Kč</s> &nbsp;<strong style="color:#ffffff;font-size:22px;">790 Kč</strong> · ušetříš 390 Kč</div>
      </td></tr></table>
  </td></tr>"""

def dyn_checkout():
    return """<tr><td class="pad" style="padding:24px 40px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e3e3e0;border-bottom:1px solid #e3e3e0;">
    {% for item in event.extra.line_items %}
      <tr>
        <td width="96" style="padding:14px 16px 14px 0;"><img src="{{ item.product.images.0.src|default:'' }}" width="80" alt="{{ item.product.title }}" style="display:block;width:80px;height:auto;background:#f3f3f1;"></td>
        <td style="padding:14px 0;font-family:Arial,sans-serif;font-size:15px;line-height:22px;color:#0a0a0a;">
          <strong>{{ item.product.title }}</strong><br>
          <span style="color:#6b6b6b;">{{ item.variant.title }} · {{ item.quantity }}×</span>
        </td>
        <td align="right" style="padding:14px 0;font-family:'Oswald','Arial Narrow',Arial,sans-serif;font-size:18px;color:#0a0a0a;">{{ item.line_price|floatformat:0 }} Kč</td>
      </tr>
    {% endfor %}
    </table></td></tr>"""

def dyn_cart():
    return """<tr><td class="pad" style="padding:24px 40px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e3e3e0;border-bottom:1px solid #e3e3e0;"><tr>
      <td width="96" style="padding:14px 16px 14px 0;"><img src="{{ event.AddedItemImageURL|default:'' }}" width="80" alt="{{ event.AddedItemProductName }}" style="display:block;width:80px;height:auto;background:#f3f3f1;"></td>
      <td style="padding:14px 0;font-family:Arial,sans-serif;font-size:15px;line-height:22px;color:#0a0a0a;"><strong>{{ event.AddedItemProductName }}</strong><br><span style="color:#6b6b6b;">{{ event.AddedItemVariantName|default:'' }}</span></td>
    </tr></table></td></tr>"""

def signoff():
    return paragraph("Díky, že hraješ s námi.<br><strong>Tým KNEETECH</strong>") + "<tr><td style='padding:0 0 36px;'></td></tr>"

E = {}

# ---------- 1) UVÍTACÍ SÉRIE ----------
E["welcome-1"] = ("Tvůj kód na 15 % je tady 🔓", "VITEJ15 – sleva 15 % na první nákup.",
  hero("Vítej v týmu", "Tvůj kód na 15&nbsp;%", "Díky, že ses přihlásil. Slíbili jsme slevu, tak tady je. Zadej ji v pokladně při první objednávce.")
  + code_box("VITEJ15", "Platí jednou na první objednávku. Nekombinuje se s jinými slevami.")
  + button("Vybrat bandáž", PRODUCT)
  + points([("Utáhneš si ji sám", "Suchý zip povolíš nebo přitáhneš přesně podle sebe."),
            ("Nesjíždí", "Protiskluzový pásek ji drží na místě i při sprintu."),
            ("Nepřekáží", "Asi 70 gramů a prodyšný materiál.")])
  + signoff())

E["welcome-2"] = ("Jakou velikost? Změř se za minutu", "Obvod kolena přes střed čéšky – a máš hotovo.",
  hero("Velikost", "Změř se za minutu", "Bandáž dělá svou práci, jen když sedí. Stačí krejčovský metr:")
  + points([("Postav se a lehce pokrč nohu", "Jako když stojíš v obraně."),
            ("Změř obvod kolena přes střed čéšky", "Metr nepřitahuj, jen ať přiléhá."),
            ("Najdi se v tabulce", "S 30–33 cm · M 33–36 cm · L 36–40 cm · XL 40–44 cm (orientačně).")])
  + paragraph("Jsi mezi dvěma velikostmi? Napiš nám obvod kolena odpovědí na tenhle e-mail a poradíme.")
  + button("Tabulka velikostí", SIZES)
  + signoff())

E["welcome-3"] = ("Na obě kolena? Tohle se vyplatí", "2 kusy za 790 Kč a tvůj kód VITEJ15 pořád platí.",
  hero("Tip", "Obě kolena, jedna cena", "Chceš oporu na obě kolena? Balení 2 kusy tě vyjde na 395 Kč za kus.")
  + offer()
  + paragraph("A kód <strong>VITEJ15</strong> na 15 % máš pořád k dispozici na první objednávku.")
  + button("Chci 2 kusy", PRODUCT)
  + paragraph("<span style='font-size:13px;color:#6b6b6b;'>Bandáž není zdravotnický prostředek. Když tě koleno bolí dlouhodobě, zajdi za doktorem.</span>")
  + signoff())

# ---------- 2) OPUŠTĚNÁ POKLADNA ----------
E["checkout-1"] = ("Zapomněl jsi něco v pokladně?", "Tvoje objednávka na tebe čeká.",
  hero("Skoro hotovo", "Tvoje bandáž čeká", "Zůstalo ti to v pokladně. Nic se neztratilo – dokončíš to jedním kliknutím.")
  + dyn_checkout()
  + button("Dokončit objednávku", "{{ event.extra.checkout_url }}")
  + paragraph("Něco tě zastavilo? Velikost, doprava, platba? Odpověz na tenhle e-mail, poradíme.")
  + signoff())

E["checkout-2"] = ("Nejsi si jistý velikostí?", "Změř se za minutu a dokonči objednávku.",
  hero("Pomůžeme", "Nevíš, jakou velikost?", "Stačí změřit obvod kolena přes střed čéšky a podívat se do tabulky. Zabere to minutu.")
  + button("Tabulka velikostí", SIZES)
  + dyn_checkout()
  + button("Dokončit objednávku", "{{ event.extra.checkout_url }}")
  + signoff())

E["checkout-3"] = ("Poslední připomínka k tvé objednávce", "Doručení do 14 dnů, doprava 72 Kč.",
  hero("Naposledy", "Pořád to tu máme", "Tvoje objednávka je pořád v pokladně. Pak už tě nebudeme otravovat.")
  + dyn_checkout()
  + points([("Doručení do 14 dnů", "Po odeslání ti pošleme odkaz na sledování."),
            ("Doprava 72 Kč", "Od 1 500 Kč zdarma."),
            ("Poradíme s velikostí", "Stačí odpovědět na tenhle e-mail.")])
  + button("Dokončit objednávku", "{{ event.extra.checkout_url }}")
  + signoff())

# ---------- 3) OPUŠTĚNÝ KOŠÍK ----------
E["cart-1"] = ("Máš něco v košíku", "Bandáž KNEETECH na tebe čeká.",
  hero("Košík", "Nezapomeň na koleno", "Přidal sis bandáž do košíku. Až budeš připravený, dokončíš to za minutu.")
  + dyn_cart()
  + button("Zpět do košíku", STORE + "/cart")
  + signoff())

E["cart-2"] = ("Na obě kolena ušetříš 390 Kč", "2 kusy za 790 Kč místo 1 180 Kč.",
  hero("Tip", "Bereš na jedno, nebo obě?", "Když chceš oporu na obě kolena, balení 2 kusy vyjde výhodněji.")
  + offer()
  + button("Zpět do košíku", STORE + "/cart")
  + signoff())

# ---------- 4) PROHLÍŽENÍ PRODUKTU ----------
E["browse-1"] = ("Líbila se ti bandáž?", "Tady je všechno, co potřebuješ vědět.",
  hero("Viděl jsi", "KNEETECH bandáž", "Díval ses na naši bandáž. Tady je rychlé shrnutí:")
  + points([("Komprese a opora", "Obepne koleno ze všech stran."),
            ("Suchý zip", "Utáhneš si ji přesně podle sebe."),
            ("1 ks 590 Kč, 2 ks 790 Kč", "Na obě kolena ušetříš 390 Kč.")])
  + button("Prohlédnout znovu", "{{ event.URL|default:'" + PRODUCT + "' }}")
  + paragraph("Máš otázku? Mrkni do <a href='" + FAQ + "'>častých dotazů</a> nebo odpověz na tenhle e-mail.")
  + signoff())

# ---------- 5) PO NÁKUPU ----------
E["post-1"] = ("Díky za objednávku! Tohle se ti bude hodit", "Jak bandáž nasadit a utáhnout.",
  hero("Díky!", "Objednávka je naše", "Díky, že sis vybral KNEETECH. Potvrzení objednávky ti přišlo zvlášť. Než bandáž dorazí (obvykle do 14 dnů), tady je rychlý návod:")
  + points([("Nasaď", "Natáhni bandáž tak, aby byla středem přes čéšku."),
            ("Utáhni", "Suchý zip pevně, ale tak, abys normálně ohnul koleno."),
            ("Hraj", "Když cítíš brnění nebo otok, povol. Nenos ji celý den ani přes noc.")])
  + paragraph("Jakmile zásilku odešleme, přijde ti odkaz na sledování.")
  + signoff())

E["post-2"] = ("Jak se ti v ní hraje?", "Pár tipů, ať ti bandáž vydrží co nejdéle.",
  hero("Péče", "Ať ti vydrží", "Bandáž by už měla být u tebe. Aby ti vydržela co nejdéle:")
  + points([("Perte ručně", "Ve vlažné vodě s jemným prostředkem, suchý zip před praním zapni."),
            ("Suš na vzduchu", "Ne v sušičce ani na topení."),
            ("Nepřetahuj", "Pevně, ale ne na doraz.")])
  + paragraph("<span style='font-size:13px;color:#6b6b6b;'>Když tě koleno bolí dlouhodobě, bandáž nestačí – zajdi za doktorem.</span>")
  + signoff())

E["post-3"] = ("Pomůžeš dalším hráčům?", "Napiš, jak jsi s bandáží spokojený.",
  hero("Tvůj názor", "Jak jsi spokojený?", "Na webu máme jen skutečné recenze od lidí, co bandáž koupili. Pomůžeš dalším klukům s výběrem? Stačí pár vět a hvězdičky – klidně i kritických.")
  + button("Napsat recenzi", PRODUCT + "#reviews")
  + signoff())

# ---------- 6) NÁVRAT ----------
E["winback-1"] = ("Druhé koleno?", "Bandáž KNEETECH – 1 ks 590 Kč, 2 ks 790 Kč.",
  hero("Dlouho jsme se neviděli", "Jak se hraje?", "Doufáme, že ti bandáž slouží. Kdybys potřeboval druhou – na druhé koleno, do zálohy nebo pro spoluhráče – najdeš nás tady.")
  + offer()
  + button("Do obchodu", PRODUCT)
  + signoff())

os.makedirs("templates", exist_ok=True)
for key,(subject,preheader,body) in E.items():
    open(f"templates/{key}.html","w").write(layout(preheader, body))
import json
json.dump({k:{"subject":v[0],"preview_text":v[1]} for k,v in E.items()}, open("subjects.json","w"), ensure_ascii=False, indent=2)
print(len(E),"emails")
