# WiseWeee — referință completă (învățat din platformă, doar citire)

Platformă: `dash.wiseweee.com` — SPA React (Vite + shadcn/Radix + Recharts + jsPDF + JSZip), date în **Supabase** (proiect propriu WiseWeee). Studiată în contul GREEN KRAFT SRL (utilizator `greenkraft`, rol Administrator).

> Document în lucru. Se completează pe măsură ce parcurg fiecare secțiune. Marcajul ✅ = verificat direct în platformă.

## 0. Structura generală

- **Meniu lateral (15 secțiuni):** Dashboard `/`, Achiziții `/acquisitions`, Documente / Poze `/documente`, Dezmembrare `/dismantling`, Dezm. Fracții `/fraction-dismantling`, Stocuri `/stock`, Vânzări Fracții `/fraction-sales`, Furnizori `/suppliers`, Transportatori `/transporters`, Rețete `/recipes`, Registre `/registers`, Rate R&R `/recovery-rates`, Rapoarte `/reports`, Utilizatori `/users`, Compania Mea `/my-company`. ✅
- **Antet:** buton meniu (colapsare bară laterală), **filtru global de organizație** („Toate organizațiile" + CNREE, ECOPOSITIVE, ECOTIC, ENVIRON, REDPOINT, RLG, NEALOCATE), meniu utilizator (nume, rol „Administrator", „Deconectare"). ✅
- **Multi-companie:** toate datele sunt pe `company_id`; un utilizator poate avea mai multe companii (`user_companies`).
- **Organizații (OIREP):** CNREE, ECOPOSITIVE, ECOTIC, ENVIRON, REDPOINT, RLG + **NEALOCATE** (nealocat, valoare implicită).

## 1. Modelul de date (tabele Supabase observate) ✅

### Nomenclator global
- **`deee_intern`** (echipamente, comun tuturor companiilor): `id` (int), `denumire`, `ecotic_ids`, `ecopositive_ids` (ID-urile echipamentului la OIREP-urile ECOTIC / ECOPOSITIVE), `medium_weight` (kg/buc, **greutatea medie**), `min_weight`, `max_weight`, `created_at`, `updated_at`. Ex.: „Alte echipamente de mari dimensiuni > 50 cm" (id 4, medie 150 kg), „Alte echipamente de mici dimensiuni < 50 cm" (id 5, medie 5), „Mașină de spălat" (id 47, medie 60), „Aragaz" (id 15, medie 38), „Aspirator Mare" (id 17, medie 25).
- **`siatd_equipment_map`**: `deee_intern_id`, `category_no`, `subcategory_id` (corespondența echipament → categorie/subcategorie SIATD).
- **`deee_category_mapping`** (79 rânduri): `deee_intern_id` → `weeelabex_category` (CAT1…CAT6).
- **`equipment_category_targets`** (6 rânduri): `category` (CAT1…), `category_name` (ex. „Echipamente de schimb termic"), `recovery_target` (ex. 85), `recycling_target` (ex. 80) — țintele de valorificare/reciclare pe categorie.
- **`fraction_classification`**: clasificare implicită a fracțiilor pe `fraction_code` (gol la GREEN KRAFT).

### Companie și utilizatori
- **`companies`**: `id`, `name`, `cui`, `email`, `phone`, `address`, `judet`, `authorization_number` (ex. 233), `nr_inregistrare`, `punct_de_lucru`, `contract_nr`, `contract_date`, `contact_person`, `last_anexa_nr` (ultimul număr de anexă).
- **`users`**: `id`, `email`, `username`, `company_id`, `role` (`admin`…), `is_active`, `broker_role`, `created_at`, `updated_at`; **`user_companies`** (apartenența la mai multe companii).

### Furnizori și transportatori
- **`furnizori`**: `id`, `company_id`, `cui`, `name`, `type` (COLECTOR/PF/PJ/CLIENT/PARTENER), `email`, `phone`, `judet`, `localitate`, `siruta` (cod SIRUTA al localității), `address`, `nr_auto`, `contact_person`, `numar_registru_comert`, `numar_autorizatie_mediu`, `created_at`, `updated_at`.
- **`transportatori`**: `id`, `company_id`, `name`, `cui`, `type` (PJ/PF), `license_no`, `license_date`, `nr_auto`, `created_at`, `updated_at` (+ tabele separate pentru mașini/șoferi, citite la deschiderea fișei).

### Achiziții (documente de colectare)
- **`collection_documents`**: `id`, `company_id`, `furnizor_id`, `supplier_name`, `document_number` (aviz), `hg856_code`, `total_weight_kg`, `collection_date`, `notes`, `created_by`, `created_at`, `updated_at`, `nr_auto`, `sofer`, `ticket_number`, `ticket_date`, `allocated_organization`, `siatd_number`, `siatd_pushed_at`, `transporter_name`, `transporter_cui`, `transporter_type`, `transporter_license_no`, `transporter_license_date`, `transport_type` (ex. „Rutier"), `anexa_type` (1/2/3), `anexa_number`, `anexa_date`, `aviz_series`.
- **`document_deee_breakdown`** (distribuția pe echipamente): `id`, `document_id`, `deee_intern_id`, `percentage`, `calculated_weight_kg`, `calculated_pieces`, `allocated_organization` (**organizația e și pe rândul de echipament**), `stare_deee`, `tip_calitate`.
  - **Bucățile se calculează automat**: `buc ≈ greutate / medium_weight` (ex. 2140 kg la 150 kg/buc → 14 buc).
- **`acquisition_verifications`**: `verified_by` (utilizator), solicitare de reverificare (`recheck_requested_by`), + **note de verificare** (`acquisition_verification_notes`) — fluxul „Verificate X/Y".
- **`acquisition_files`**: `document_id`, `kind` (tipul fișierului: document / poze…), `sent_to_otr_at` (trimis la OTR/OIREP).

### Dezmembrare
- **`dismantling_operations`**: `id`, `company_id`, `operation_number` (GK-129), `operation_date`, `status` (`completed`), `notes`, `created_by`, `completed_at`, `created_at`, `updated_at`.
- **`dismantling_equipment_items`**: `id`, `dismantling_operation_id`, `deee_intern_id`, `weight_kg`, `pieces`, `hg856_code`, `allocated_organization` (**organizația e pe fiecare echipament al operațiunii**, nu pe operațiune).
- **`individual_fractions`**: `id`, `dismantling_equipment_id` (legat de echipamentul consumat), `fraction_code`, `fraction_name`, `weight_kg`, `hg856_code` (codul echipamentului-sursă), `allocated_organization`.
- **`dismantling_reference_data`** = **rețete**: `id`, `company_id`, `deee_intern_id`, `is_global` (rețete predefinite WiseWeee vs ale companiei), `version_number`, `created_by_label`; **`recipe_fractions`**: `recipe_id`, `fraction_code`, `fraction_name`, `percentage`, `reference_weight_kg` (greutate de referință **pe fracție**).

### Dezmembrare fracții și vânzări
- **`fraction_dismantling_operations`** + **`fraction_dismantling_inputs`** / **`fraction_dismantling_outputs`** (`fraction_code`, `fraction_name`, `weight_kg`, `hg856_code`, `allocated_organization`).
- **`fraction_sales`**: `id`, `company_id`, `client_name`, `document_number`, `sale_date`, `fraction_code`, `fraction_name`, `weight_kg`, **`price_per_kg`**, **`total_price`**, `hg856_code`, `allocated_organization`, `notes`, `created_by`, `recycling_pct`, `recovery_pct`, `disposal_pct`, `recovery_code`.

### Registre
- **`register_entries`** (`register_type`, `company_id`, …) — registrele cerute de autorități (gol la GREEN KRAFT).

## 2. Rapoarte pe organizație (Dashboard → „Pachet pe organizație") ✅
Se generează în browser (module `cnreeAcquisitionsUnified`, `cnreeFisaGestiune`, `cnreeFisaFractii`, `environCentralizatorLivrari`, `billingAnnexService`, `templateFill`, `pierderi`, `pdf-builder` / jsPDF, `excel-builder`, `jszip`): pentru fiecare organizație există formatul ei (CNREE: achiziții unificat, fișă de gestiune, fișă fracții; ENVIRON: centralizator livrări; anexe de facturare; calcul de pierderi). „Exportă tot" produce pachetul pe lună/an.

### Tabele suplimentare (inventar din cod) ✅
`organizations`, `organization_equipment`, `equipment_org_mapping`, `cod_incadrare_deee_ecotic`, `cod_incadrare_deee_ecopositive` (coduri de încadrare DEEE la ECOTIC/ECOPOSITIVE), `transportator_vehicule` (mașinile unui transportator, cu licență și expirare), `vehicul_soferi` (șoferii fiecărei mașini), `acquisition_verification_notes`, `user_companies`.
**RPC:** `request_recheck` (cere reverificarea unei achiziții), `set_broker_role`. **Funcții edge:** `ocr-document` (extragere text din document scanat), `lookup-cui` (date firmă după CUI, la ANAF), `create-user`.

---

## 3. Ecranele (secțiune cu secțiune) ✅

### 3.1 Dashboard `/`
- Carduri: **Documente Colectare** (nr.), **Greutate Totală** (kg), **Operațiuni Dezmembrare** (nr.), **Finalizate**.
- **„Pachet pe organizație"**: alegi Organizația (ECOTIC, ECOPOSITIVE, ENVIRON, CNREE, REDPOINT, RLG), Luna („tot anul" + 12 luni), Anul (2026/2025/2024); lista inclusă (Achiziții, Dezmembrări, Vânzări fracții); buton **„Exportă tot"** → generează în browser pachetul de fișiere în formatul cerut de acea organizație.
- Grafice: **Trend Lunar** (kg pe lună) și **Per Organizație** (kg și % din total).

### 3.2 Achiziții `/acquisitions` („Documente Colectare — Achiziții și recepții DEEE")
- **Antet:** contor „Verificate X/Y", **Raport verificare (XLSX)**, **Alocă Org.** (alocare în masă: „De la organizație → La organizație"), **Trimite în SIATD**, **Export**, **Document Nou**.
- **Filtre:** căutare („document, furnizor, cod sau nr. mașină"), An, Luna, Organizație, Cod EWC, Nr. mașină (cu număr de rânduri la fiecare), Tip furnizor (Persoană fizică / juridică / Client / Partener), Documente / poze (Fără niciun fișier / Fără document / Fără poze / Complete), De la – Până la.
- **Carduri:** Documente, Total greutate (kg), Total distribuit (kg), Total bucăți.
- **Tabel (un rând pe echipament, nu pe document; paginat la 50, „1–50 din 1342"):** Data, Luna, Furnizor, Aviz, Nr. mașină, Cod EWC, Echipament, Kg, Buc, Org., Docs, Verif., acțiuni.
- **Acțiuni pe rând:** deschide fișierele (Docs), **NIR PDF**, **vizualizare** (Detalii Document), **editare**, încărcare fișiere (meniu „Din fișiere" / „Fotografiază"; acceptă imagini și PDF, multiple), **ștergere**.
- **Detalii Document (vizualizare):** Nr. Document, Furnizor, Nr. Auto, Cod HG856, Greutate Totală, Data Colectare, Organizație, Șofer, Nr. Ticket Cântar, Observații; **Distribuție Echipamente** (echipament + organizație, % — kg — buc); **Fișiere** (+ „Adaugă poze și documente"); **Documente (comparație)** cu „Mărește" (vizualizare documente alăturate).
- **Document Nou:** alegi **„Scanează document (OCR)"** (încarci PDF borderou + cântar; OCR completează; „Extrage cu OCR", verifică „kg vs cântar — coincid / NU coincid", „Fotografiază documentul", poze opționale pentru PJ/colectori) sau **„Completează manual"**. Formular în 2 pași (vezi mai jos).
- **Formular, pasul 1 „Informații Document"** (câmpurile marcate *SIATD* se trimit automat în SIATD): Furnizor* (căutare min. 2 litere, cu „Nu găsești furnizorul? Adaugă-l"; potrivire automată după CUI/denumire), Nr. Document* (serie + număr, ex. „WWE 2755" — devine avizul în SIATD), Tip Anexă (1/2/3), Nr. Anexă (dacă diferă), Dată Anexă, Organizație Alocată, Nr. Ticket Cântar (devine bonul de cântar în SIATD), Dată Ticket Cântar, Nr. SIATD (completat automat la trimitere), Cod HG856*, Greutate Totală (kg)*, Data Colectare*, **Fără licență transport (sub 3,5 t)**, Transportator (căutare / „Adaugă transportator nou", cu tip PJ/PF), **Mașină** (din mașinile transportatorului; „Adaugă mașină nouă" cu licență; avertisment „Licența mașinii X a expirat"), **Șofer** (din șoferii mașinii; „Adaugă șofer"), Observații.
- **Pasul 2 „Distribuție Echipamente":** antet „Total: X kg | Distribuit: Y kg (Z%)"; pentru fiecare echipament: **Echipament** (listă de 85 de echipamente), **Organizație**, **Procent (%)**, **Greutate (kg)**, **Bucăți** (se calculează din greutatea medie); „Adaugă Echipament"; „Pasul anterior" / „Salvează". Procentul și greutatea se leagă (procent = greutate/total·100).
- **Reguli de validare:** furnizor existent din listă; „există deja un document cu același nr. aviz de la acest furnizor"; pentru **REDPOINT** sunt obligatorii Nr. Auto, Șofer și Nr. Ticket Cântar.
- **SIATD:** „Trimite în SIATD" folosește o extensie de browser; după trimitere se păstrează `siatd_number` și `siatd_pushed_at`; există acțiune „Achiziție pregătită pentru retrimitere SIATD" (resetare stare).
- **Verificare:** flux de verificare cu verificator, solicitare de **reverificare** și note (vezi `acquisition_verifications`).
- **NIR PDF** (Nota de Intrare-Recepție, A4 pe orizontal): „NOTA DE INTRARE-RECEPTIE (NIR)", Nr: `NIR-<aviz>-<an>`, Data; Furnizor (generator): nume, CUI, Doc, Cod EWC, Total; Beneficiar: GREEN KRAFT SRL, CUI, Adresa, Punct de lucru; tabel (Nr, Echipament DEEE, Cod EWC, Organizație, Denumire Org, Categorie_anexa2_OUG 5, U/M, Kg, Buc, Preț, Valoare); totaluri (cantitate, bucăți, valoare); Gestionarul (nume, semnătură); „Pagina 1 din 1".

### 3.3 Documente / Poze `/documente`
Fișierele atașate achizițiilor, pe lună. Filtre: An (2022–2026), Luna, Furnizor, Tip (Toate / Poze / Documente), Organizație, căutare globală (nr. aviz, furnizor, companie). Acțiuni: Selectează tot, **Descarcă pozele (ZIP)**, **Descarcă documentele (ZIP)**, **Șterge selectate**; contor „N fișiere". (La GREEN KRAFT: 0 fișiere încărcate.)

### 3.4 Dezmembrare `/dismantling` („Operațiuni de dezmembrare DEEE")
- **Antet:** **Alocă Org.** („Alocare în masă — Dezmembrări"), **Export**, **Tratare SIATD** (doar pentru roluri cu drepturi), **Operațiune Nouă**.
- **Filtre:** căutare, **Status** (Completat / Draft / În așteptare / În progres / Anulat), Organizația, Echipament (din operațiuni), De la – Până la.
- **Carduri:** Operațiuni, Total greutate (kg), Total bucăți, Completate / Alte.
- **Tabel:** Data, Nr. Operațiune (GK-129), Echipamente (nume — kg, buc · organizație), Organizație, Total cantitate (kg · buc), Status (Finalizat), Observații, acțiuni: **tipărire PV**, **editare**, **ștergere**; rând → „Detalii Operațiune".
- **Operațiune nouă/Editare — pasul 1 „Informații Operațiune":** Nr. Operațiune*, Data Operațiune*, Observații. **Pasul 2 „Echipamente & Fracții":** „Stoc Disponibil" (echipamente din stoc), „Echipamente Selectate" (echipament, cod EWC, organizație), **Aplică Rețetă** cu procente 10%–100% din stoc, Greutate (kg), Bucăți, linii de fracții (Cod fracție, Denumire, Cod EWC, kg și % din total), „Șterge fracție", total „Fracții: X / Y kg (100%)", **Total intrat / Total ieșit (fracții) — „Balanță OK"**; „Pasul anterior" / „Salvează Operațiune". Mesaje: „Adaugă cel puțin un echipament din stocul de mai sus"; „Balanța nu se închide — fracțiile nu însumează cantitatea intrată".
- **PV (Proces-Verbal de Tratare/Dezmembrare):** „Echipamente intrate în tratare" (Cod HG856, Denumire, kg, buc), „Fracții rezultate din tratare" (Cod Fracțiune, Denumire Fracțiune, **Denumire Contabilitate**, kg, **% din Total**), „Responsabil tratare / Semnătura". Există un **tabel de denumiri contabile** pe fracții (ex. „FIER EWC 19 12 02", „PLACI ELECTRONICE EWC 16 02 16", „PIERDERI TEHNOLOGICE EWC 99 99 99").
- **Export** (Excel, secțiuni „--- INPUT – ACHIZIȚII ---" cu Nr. Aviz, Denumire Internă, kg, buc, % și „--- OUTPUT – FRACȚII DIN DEZMEMBRARE ---" cu Denumire Fracție, kg, % din Dezmembrat, „TOTAL INPUT / TOTAL OUTPUT").
- **Tratare SIATD:** alegi organizația, contractul și operațiunea; verifică alocările în SIATD („Lipsesc X kg — în perioada aleasă ai doar Y kg pe N alocări"); trimite prin extensia „WiseWeee → SIATD Tratare" (răspuns așteptat max. 2 minute); semnalează echipamente fără corespondent în SIATD.

### 3.5 Dezm. Fracții `/fraction-dismantling` („Dezmembrarea fracțiilor compuse în sub-fracții")
Căutare (nr. operațiune, fracție, note), carduri Operațiuni / Total input (kg), Export, Operațiune Nouă (Nr. Operațiune, fracție(i) intrate, fracții rezultate). **Documente PDF:** „PROCES-VERBAL DE DEZMEMBRARE FRACȚII" și „PROCES-VERBAL DE CONCASARE" (concasare materiale pentru agregate reciclate: Cod CED, tip material, echipamente utilizate, mențiuni, semnături). *(La GREEN KRAFT: 0 operațiuni.)*

### 3.6 Stocuri `/stock`
Taburi **Echipamente** / **Fracții**; carduri Total / Dezmembrat / Disponibil (kg); căutare, De la – Până la, organizație; rândurile se desfac pe cod EWC și organizație; avertisment „Dezmembrat mai mult decât există pe această combinație"; Buc disponibile.

### 3.7 Vânzări Fracții `/fraction-sales`
Antet: **Procente R/D** (reciclare/valorificare/eliminare per client+cod+fracție, cu cod R/D), **Alocă Org.**, **Export**, **Vânzare Nouă** (Client* cu „Client Nou", Nr. Document, Data*, Fracție din stoc*, Greutate*, Observații). Filtre: căutare, An, Client, Organizație, De la – Până la, Resetează. Carduri: Vânzări (din total), Total cantitate, Nr. clienți unici, **Pe organizație** (kg). Tabel: Data, Client, Nr. Aviz, Cod Fracție, Fracție, Organizație, Kg, Docs. Acțiuni pe rând: documente / adaugă documente, ștergere (**fără editare**).

### 3.8 Furnizori `/suppliers`
Căutare (nume sau CUI); tabel Nume, CUI, Tip, Localitate, Județ, Telefon; Furnizor Nou / Editare: CUI/CNP (obligatoriu, validat), **„Caută date firmă după CUI"** (ANAF, funcția `lookup-cui`), Nume, Tip (COLECTOR/PF/PJ/CLIENT/PARTENER), Reg. Com., Aut. Mediu, Persoană contact, Telefon, Email (validat), Județ (listă), Localitate (listă cu cod SIRUTA), Nr. Auto (mai multe), Adresă.

### 3.9 Transportatori `/transporters`
Căutare, tabel Nume, Tip, CUI/CNP; Transportator Nou (Nume*, Tip PJ/PF, CUI) — după salvare: **Mașini** (Nr. Auto, „Fără licență sub 3,5 t", Număr Licență, Dată Licență, Dată Expirare Licență, „Șterge mașina", „Salvează") și **Șoferi** pe fiecare mașină (+ „Adaugă").

### 3.10 Rețete `/recipes` („Template-uri de fracții per echipament")
Căutare; tabel Echipament (cu numărul versiunii și eticheta, ex. „Masina de spalat 9 (GK)"), **Tip (Companie / Global)**, Fracții (nr.), Total %; **Rețetă Nouă**, editare („Salvează ca versiune nouă"), **Copiază** (copiază o rețetă globală în compania ta ca versiune nouă), ștergere cu confirmare. Fracții: cod, denumire, procent, greutate de referință.

### 3.11 Registre `/registers` (WEEELABEX / EN 50625-1 / GDPR)
16 registre în 5 grupe, fiecare cu: căutare, De la – Până la, **Export PDF**, buton „nou", formular cu **semnături desenate** (cu „Șterge"), tabel de înregistrări.
- **OPERAȚIONAL:** Registru Vizitatori (Data*, Nume vizitator*, Companie, Act identitate, Scop, Însoțitor, Zone, Oră intrare/ieșire, Briefing efectuat, EIP furnizat, Observații, Semnătură) · Registru Întreținere Echipamente (Data*, Echipament*, Tip operație [Preventivă/Corectivă], Descriere, Piese înlocuite, Durată, Următoarea verificare, Executant, Observații, Semnătură) · Fișă Predare EIP *(în curând)*.
- **MEDIU & SIGURANȚĂ:** Incidente/Accidente (Data*, Ora, Locație, Tip incident, Persoane implicate, Descriere*, Leziuni/Pagube, Măsuri imediate, Cauză probabilă, Măsuri preventive, Raportat la ITM/APM/ISU, Responsabil, Semnătură) · Scurgeri/Poluări Accidentale (Data*, Ora, Locație*, Tip, Substanță/Fracție, Măsuri intervenție, Durata, Responsabil, Măsuri preventive, Observații, Semnătură) · Curățare și Decontaminare Containere (Data*, Tip container/Cod*, Fracția stocată, Cod EWC, Motiv, Metodă, Efectuat de, Verificat de, Observații, 2 semnături) · Monitorizare Depoluare DEEE (Data*, Lot/Operație, Tip echipament, Fracție depoluată, Metoda, EIP utilizat, Control vizual, Durată, Executant, Observații, Semnătură).
- **CONFORMITATE:** Neconformități și Acțiuni Corective (Data constatării*, Prioritate, Descriere*, Cauză rădăcină, Acțiune corectivă, Termen limită, Responsabil, Data rezolvării, Verificat de, Observații, Semnătură; termen max. acțiune corectivă 3 luni) · Certificate Distrugere Date (Nr. certificat*, Data distrugerii*, Tip echipament, Tip suport [Card memorie/Hârtie/…], Serie/ID, Cantitate, Metoda distrugere, Client, Martor, Executant, Observații, 2 semnături; retenție 5 ani) · Fișă Luare la Cunoștință, Checklist Audit Intern, Plan Audit Intern Anual *(în curând)*.
- **TRASABILITATE (generate, Generează PDF pe an/lună):** Recepție Livrări DEEE (din achiziții) · Lot Prelucrare (din dezmembrări/PV) · Fracții Output — masă balanțieră (din fracții) · Trasabilitate Downstream (din vânzări).
- **TRANSPORT:** Registru Anexe Transport (Data*, Nr. Anexă*, Tip Anexă 1/2/3, Sens* intrare/ieșire, Partener*, Tip deșeu/fracție, Cantitate, Transportator, Nr. auto, Observații).

### 3.12 Rate R&R `/recovery-rates` („Calculul ratelor conform WEEELABEX per categorie")
Comutatoare **Diagramă**, **Total / Doar Vânzări**, An. Avertismente („N coduri de fracție nu au nici procente din vânzări, nici clasificare implicită"; „N vânzări nu au procente R/D completate — se folosește clasificarea implicită"). Carduri: Total Input, Total Reciclat, **Rata Reciclare** (țintă ponderată, ex. 75,3%), **Rata Recuperare** (țintă 83,1%). Tabel pe categorii (CAT1–CAT6, ex. „CAT4 Echipamente mari (>50 cm)"): Input, Output, Pierderi, Rata Reciclare, Țintă, Rata Recuperare, Țintă, Status (Sub/Peste țintă). Ținte din `equipment_category_targets`, încadrare echipament→categorie din `deee_category_mapping`.

### 3.13 Rapoarte `/reports` („Rapoarte & Exporturi")
Cinci exporturi: **Totalizare Echipamente + Fracții** (per organizație, cu denumiri ECOTIC/ECOPOSITIVE; Excel multi-sheet) · **Proces Verbal Tratare** (input/output per operațiune cu fracții și procente) · **Trasabilitate Fracții** (per cod HG856, echipament, organizație) · **Contabilitate** (INPUT vs OUTPUT, bilanț tratare; multi-sheet) · **Per Organizație per Lună** (raport lunar separat ECOTIC/ECOPOSITIVE).
**Integrare SIATD — 3 extensii Chrome/Edge (v0.1.0):** *Achiziții* (trimite avizele în SIATD fără copy-paste), *Alocări* (alocă mai departe către organizația colectivă, o categorie pe rând — pentru brokeri), *Tratare* (transferă, valorifică și alocă fracțiile unei luni dintr-un buton). „Cum se instalează": Developer mode → Load unpacked.

### 3.14 Utilizatori `/users`
Tabel Nume, Email, Rol, **Broker**, Status; **Adaugă Utilizator** (Email*, Parolă* min. 8 caractere, Nume utilizator*, Rol*, companii accesibile); roluri **Administrator / Manager / Angajat / Responsabil tratare**; rol broker **Broker Junior / Broker Senior**; Activează / Dezactivează; acces la mai multe companii.

### 3.15 Compania Mea `/my-company`
Date: Nume, CUI, Email, Telefon, Nr. Autorizație, Nr. Reg. Comerțului, Adresă sediu social, Punct de lucru; **Editează**.

---

## 4. Date de referință salvate (fișiere separate)
- `wiseweee-date-referinta.json` — 85 echipamente interne (greutate medie, coduri ECOTIC/ECOPOSITIVE, categorie CAT1–6), ținte reciclare/valorificare pe categorii, echipamente SIATD.
- `wiseweee-coduri-organizatii.json` — 144 coduri ale organizațiilor (ECOTIC 51, ECOPOSITIVE 5, REDPOINT 17, CNREE 33, ENVIRON 9, RLG 29) + 506 legături echipament intern → cod organizație (`legaturi`, „idEchipament:idCod”).
- `wiseweee-retete.txt` — 97 rețete de dezmembrare (12 ale companiei „(GK)”, 85 globale) cu fracții, procente și greutate de referință.
- Coloanele de export ale organizațiilor (`organizations.export_columns`): **ECOTIC** {Cod ECOTIC; „Denumire ECOTIC” = „{cod} - {denumire}”} · **ECOPOSITIVE** {Cod OUG; „{categorie} {denumire}”} · **REDPOINT** {Cod, Denumire, Categorie} · **CNREE** {Cod, Sub-categorie, Categorie} · **ENVIRON** {Tip DEEE, Denumire, Categorie; afișare „{cod}”} · **RLG** {Subcategorie OUG 5, Denumire, Categorie}.

## 5. Reguli de calcul (din cod și din comportament)
1. **Bucăți:** `buc = round(kg / greutate_medie)` — se recalculează doar când se schimbă echipamentul sau procentul; la editarea doar a kg se recalculează doar procentul.
2. **Procent / kg:** `procent = kg / total_document × 100` (4 zecimale); `kg = procent / 100 × total` (2 zecimale).
3. **Organizația implicită:** `NEALOCATE`. Alocarea pe organizații (ECOTIC, ECOPOSITIVE, REDPOINT, CNREE, ENVIRON, RLG) se face pe fiecare linie de achiziție (nu pe document) și, în masă, prin „De la organizație → La organizație”.
4. **Cod organizație la export:** din `equipment_org_mapping` (prima legătură pentru perechea echipament+organizație); afișat conform coloanelor de export ale organizației.
5. **Stoc echipamente:** cheie `deee_intern_id – cod HG856 – organizație`; stoc = total din achiziții − dezmembrări finalizate. **Stoc fracții:** cheie `cod|denumire|organizație`; stoc = fracții din dezmembrare + fracții rezultate din dezm. fracții − fracții folosite ca input − vânzări (vânzările fără organizație cad pe NEALOCATE).
6. **Achiziții:** o linie de listă pe echipament (660 documente → 1342 linii); duplicat (furnizor, aviz) blocat; REDPOINT cere Nr. Auto, Șofer, Nr. Ticket Cântar; NIR `NIR-<aviz>-<an>`.
7. **Dezmembrare:** balanță obligatorie — suma fracțiilor = cantitatea intrată (pierderile tehnologice, cod 99 99 99, închid diferența); rețeta se aplică la 10%–100% din stoc; greutatea de referință a rețetei doar informativă.
8. **Vânzări fracții:** nu se editează, doar se șterg; procentele R/D (reciclare/valorificare/eliminare + cod R/D) sunt pe (client, cod, fracție).
9. **Rate R&R:** pe categorie CAT1–6: `rata reciclare = reciclat / input`, `rata recuperare = (reciclat + valorificat) / input`; reciclat/valorificat vin din procentele R/D ale vânzărilor sau, în lipsă, din `fraction_classification`; compară cu țintele din `equipment_category_targets`.

## 6. Analiză de diferențe: WiseWeee ↔ DEEE Greenkraft (starea curentă)
| Zonă | WiseWeee | Greenkraft acum |
|---|---|---|
| Nomenclator echipamente | 85 echipamente, greutate medie, categorie CAT, coduri organizații | 17 echipamente, fără greutate medie/categorie |
| Organizații | 6 organizații cu coduri și coloane de export; alocare pe linie | organizație la nivel de document/operațiune |
| Achiziții | formulare + OCR, verificare, fișiere/poze, NIR, SIATD | formular, linii, NIR (A4), fără OCR/verificare/poze |
| Dezmembrare | echipamente din stoc, rețetă 10–100%, PV, balanță | există, fără PV complet și fără cote din stoc |
| Rețete | 97 versiuni (companie/global), copiere, versiuni | rețete simple, fără versiuni/global |
| Stocuri | echipamente + fracții pe organizație/cod | există parțial |
| Vânzări fracții | procente R/D, documente, alocare | vânzări simple |
| Dezm. fracții | concasare + PV | lipsă |
| Registre (16) | WEEELABEX/EN 50625/GDPR | lipsă |
| Rate R&R | pe categorii, ținte | lipsă |
| Rapoarte | 5 exporturi Excel | lipsă |
| Utilizatori/roluri | 4 roluri + brokeri | utilizatori Greenkraft existenți |
| SIATD / OCR | extensii Chrome / funcție OCR | nu se pot copia (necesită acces la SIATD / serviciu OCR) |

## 7. Plan de implementare (faze, fiecare cu SQL de rulat de utilizator)
1. **Nomenclator complet:** 85 echipamente (greutate medie, CAT), 6 organizații, 144 coduri, 506 legături, ținte categorii → seed din fișierele JSON.
2. **Achiziții aliniate:** alocare organizație pe linie, bucăți automate, cod organizație afișat, filtre/export Excel.
3. **Rețete + Dezmembrare:** 97 rețete (versiuni, copiere globală→companie), aplicare 10–100% din stoc, PV tipărit, balanță.
4. **Stocuri + Vânzări:** stoc pe (echipament, cod, organizație) și (fracție, organizație); procente R/D; „Alocă Org.” în masă.
5. **Rate R&R + Rapoarte:** calcul pe CAT1–6 și cele 5 exporturi Excel.
6. **Registre + Dezm. fracții + Utilizatori/roluri.**

*Neacoperit (fără acces/serviciu): trimiterea în SIATD prin extensii și OCR-ul documentelor.*
