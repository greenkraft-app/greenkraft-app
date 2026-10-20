# WiseWeee — analiză secțiuni și plan pentru aplicația noastră

Parcurs în 20.10.2026, doar citire (nu s-a salvat, șters sau trimis nimic în WiseWeee). Datele reale din WiseWeee nu au fost copiate, doar structura.

**Ce este WiseWeee:** „Gestionare DEEE" — evidența deșeurilor de echipamente electrice și electronice, pe companie (GREEN KRAFT SRL) și pe **organizație** (CNREE, ECOPOSITIVE, ECOTIC, ENVIRON, REDPOINT, RLG, NEALOCATE = nealocat).

**Fluxul de bază (lanțul de date):**

```
Furnizor ─► ACHIZIȚIE (echipamente intrate, kg + buc)
                │  stoc echipamente (pe echipament + cod EWC + organizație)
                ▼
          DEZMEMBRARE  ──(rețetă: % pe fracții)──►  FRACȚII (fier, cupru, plastic…)
                                                       │ stoc fracții
                                                       ▼
                                              VÂNZARE FRACȚII ─► Client (cu aviz)
```
Regula de control: la dezmembrare, **total intrat = total ieșit (fracții)** („Balanță OK").

---

## 1. Achiziții (`/acquisitions` — „Documente Colectare")

- **Listă:** Data, Luna, Furnizor, Aviz, Nr. mașină, Cod EWC, Echipament, Buc, Organizație, Docs (fișiere/poze), Verificat.
- **Filtre:** căutare text, An, Lună, Organizație, Cod EWC, Nr. mașină, Tip furnizor, Documente/poze, interval de date.
- **Totaluri:** nr. documente, total greutate, total distribuit, total bucăți. Contor „Verificate X/Y".
- **Acțiuni:** Document Nou, Export, Raport verificare (XLSX), Alocă organizație (în masă), Trimite în SIATD, NIR PDF pe rând, încărcare poze/documente pe rând.
- **Document Nou:** alegi „Scanează document (OCR)" sau „Completează manual". Formular în 2 pași:
  1. *Informații document:* Furnizor*, Nr. Document* (serie + număr, devine aviz), Tip Anexă (1/2/3), Nr. Anexă, Dată Anexă, Organizație alocată, Nr. Ticket Cântar, Dată Ticket, Nr. SIATD (completat la trimitere), Cod HG856*, Greutate totală*, Data colectare*, Transport: Fără licență (sub 3,5 t), Transportator, Nr. Auto, Șofer, Observații.
  2. *Distribuție echipamente:* greutatea totală se împarte pe echipamente (cu buc).

## 2. Dezmembrare (`/dismantling`)

- **Listă:** Data, Nr. operațiune (GK-129…), Echipamente (nume — kg, buc · organizație), Organizație, Total cantitate, Status (Finalizat), Observații. Acțiuni: tipărire, editare, ștergere.
- **Filtre:** Status, Organizație, Echipament. Totaluri: nr. operațiuni, kg, buc, completate/alte.
- **Operațiune nouă (2 pași):**
  1. *Informații:* Nr. operațiune*, Data*, Observații.
  2. *Echipamente & fracții:* stoc disponibil → alegi echipamente (cu cod EWC și organizație) → **„Aplică rețetă"** (procente 10–100% din stoc) → greutate (kg) + bucăți → liniile de fracții (cod fracție, denumire, cod EWC, kg și % din total) → verificare *Total intrat = Total ieșit* → Salvează.

## 3. Dezmembrare Fracții (`/fraction-dismantling`)

Același tipar, pe un nivel mai jos (fracții compuse → sub-fracții). **Gol la voi (0 operațiuni)** — nu o folosiți acum; o putem lăsa pe mai târziu.

## 4. Stocuri (`/stock`)

- **Tab Echipamente:** grupat Echipament → Cod EWC → Organizație, cu *Total / Dezmembrat / Disponibil (kg) / Buc*. Sumar sus (total, dezmembrat, disponibil). Filtre: interval de date, organizație.
- **Tab Fracții:** Cod fracție, Denumire, Organizație, *Total / Vândut-Consumat / Disponibil (kg)*.
- Stocul **nu se introduce manual**: se calculează din Achiziții (intrări), Dezmembrări (scăderi din echipamente, intrări în fracții) și Vânzări fracții (scăderi din fracții).

## 5. Vânzări Fracții (`/fraction-sales`)

- **Listă:** Data, Client, Nr. Aviz, Cod fracție, Fracție, Organizație, Kg, Docs (PDF + atașamente). Filtre: An, Client, Organizație. Totaluri: nr. vânzări, total kg, clienți unici, kg pe organizație.
- **Vânzare nouă:** Client*, Nr. document, Data vânzare*, **Fracție din stoc*** (se alege din stocul disponibil), Greutate*, Observații.
- **Procente R/D:** pe fiecare grup (client + cod + fracție) se completează Reciclare %, Valorificare %, Eliminare % (total 100%) și Cod R/D; fără ele se folosește clasificarea implicită.
- **Alocă Org.** (în masă) și **Export**.

## 6. Furnizori (`/suppliers`)

- **Listă:** Nume, CUI, Tip, Localitate, Județ, Telefon.
- **Tipuri:** COLECTOR, PF, PJ, CLIENT, PARTENER (clienții de la Vânzări sunt tot aici, tip CLIENT).
- **Câmpuri:** CUI*, Nume*, Tip*, Nr. Reg. Comerț, Nr. Autorizație Mediu, Persoană contact, Telefon, Email, Județ*, Localitate* (listă în funcție de județ), Nr. auto (mai multe), Adresă.

## 7. Transportatori (`/transporters`)

- **Listă:** Nume, Tip (PJ/PF), CUI/CNP.
- **Transportator:** Nume*, Tip, CUI. După salvare se adaugă:
  - **Mașini:** Nr. auto, „Fără licență (sub 3,5 t)", Număr licență, Dată licență, Dată expirare licență.
  - **Șoferi** per mașină.
- La Achiziții, alegerea transportatorului restrânge Nr. Auto și Șofer la ce e înregistrat la el.

## 8. Rețete (`/recipes`)

- **Listă:** Echipament (cu număr de versiune, ex. „Mașină de spălat 9 (GK)"), Tip (**Companie** = ale voastre, **Global** = predefinite WiseWeee), nr. fracții, Total % (trebuie 100%).
- **Rețetă:** Echipament* + linii de fracții: Fracție (cod EWC, ex. 16 02 16 / 19 12 02), Denumire (Fier, Circuite imprimate, Cabluri, Condensatori…), **%** din greutate, **Ref. kg** (greutate de referință a echipamentului).
- **Versionare:** „Salvează ca versiune nouă" — rețetele vechi rămân (operațiunile deja făcute nu se schimbă).

---

## Ce avem deja în Greenkraft și ce lipsește

| WiseWeee | În Greenkraft acum | De făcut |
|---|---|---|
| Achiziții | Achiziții (`colectari`) + tichete cântar, buton „trimite în WiseWeee" | Adăugăm: organizație, cod EWC/HG856, echipamente + distribuție (buc), tip anexă, poze/documente, verificat |
| Furnizori | Furnizori PF/PJ (`furnizori_pf`, `furnizori_pj`) | Tipuri COLECTOR/CLIENT/PARTENER, autorizație de mediu, contact, localitate |
| Transportatori | Delegați și mașini (liste simple) | Transportator → mașini (licență, expirare) → șoferi |
| Stocuri | Stoc din produse (nu pe echipament/organizație) | Stoc echipamente + stoc fracții, calculate automat |
| Vânzări fracții | Vânzări (`livrari`), produse generice | Legare de stocul de fracții, organizație, procente R/D |
| Dezmembrare | — | **Nou** (operațiuni, balanță intrat = ieșit) |
| Rețete | — | **Nou** (cu versionare) |
| Organizații (CNREE, RLG…) | — | **Nou** (se aplică peste tot) |

## Plan pe etape (propus)

1. **Fundația:** Organizații, nomenclator echipamente + coduri EWC, nomenclator fracții.
2. **Furnizori și Transportatori** extinși (mașini cu licență, șoferi).
3. **Achiziții** cu echipamente și distribuție + stoc echipamente.
4. **Rețete** (cu versiuni) și **Dezmembrare** (aplică rețeta, balanță) → stoc fracții.
5. **Vânzări fracții** din stoc + procente R/D.
6. **Rapoarte / export** (Excel pe organizație, lună).

## Ce nu putem reface fără acces oficial

- **Trimiterea în SIATD** (și numărul SIATD returnat) — cere acces/API de la autorități. Aplicația noastră ține evidența; trimiterea rămâne manuală sau prin WiseWeee cât timp o folosiți.
- **OCR** pentru scanarea documentelor — se poate adăuga ulterior (un serviciu extern).
- Secțiunile nevăzute (cerute doar cele 7): Documente/Poze, Registre, Rate R&R, Rapoarte, Utilizatori, Compania mea.

## Decizii de luat

1. Construim ca **module noi în Greenkraft** (recomandat — Furnizorii, Transportatorii, Achizițiile și Tichetele există deja și rămân legate) sau ca aplicație separată?
2. Începem cu **etapa 1–3**? 
3. Importăm datele existente din WiseWeee (documente, rețete) sau pornim de la zero?
