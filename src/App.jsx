import { useState, useEffect, useRef, Fragment } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase client ───────────────────────────────────────────
const sb = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ── Constants ─────────────────────────────────────────────────
const G = "#1d6f42";
const PRODUSE_LIST = [
  { den: "DESEURI DE AMBALAJE DIN CARTON-COD 15 01 01", cod: "15 01 01", cod_art: "000001" },
  { den: "DESEURI DE AMBALAJE DIN PLASTIC (AFARA DE PET)-COD 15 01 02", cod: "15 01 02", cod_art: "000002" },
  { den: "DESEURI DE AMBALAJE DIN PET-COD 15 01 02", cod: "15 01 02", cod_art: "000003" },
  { den: "DESEURI DE AMBALAJE DIN LEMN-COD 15 01 03", cod: "15 01 03", cod_art: "000004" },
  { den: "DESEURI DE AMBALAJE DIN ALUMINIU-COD 15 01 04", cod: "15 01 04", cod_art: "000005" },
  { den: "DESEURI DE AMBALAJE DIN STICLA-COD 15 01 07", cod: "15 01 07", cod_art: "000008" },
  { den: "DESEURI DE AMBALAJE FOLIE TRANSPARENTA-COD 15 01 02", cod: "15 01 02", cod_art: "000010" },
  { den: "DESEURI DE AMBALAJE DIN CARTON - COD 15 01 01", cod: "15 01 01", cod_art: "000016" },
  { den: "DESEURI DE AMBALAJE DIN PLASTIC (AFARA DE PET)-COD 15 01 02", cod: "15 01 02", cod_art: "000017" },
  { den: "DESEURI DE AMBALAJE DIN PET - COD 15 01 02", cod: "15 01 02", cod_art: "000018" },
  { den: "DESEURI DE AMBALAJE DIN LEMN - COD 15 01 03", cod: "15 01 03", cod_art: "000019" },
  { den: "DESEURI DE AMBALAJE DIN ALUMINIU - COD 15 01 04", cod: "15 01 04", cod_art: "000020" },
  { den: "DESEURI DE AMBALAJE DIN OTEL - COD 15 01 04", cod: "15 01 04", cod_art: "000021" },
  { den: "DESEURI DE AMBALAJE DIN STICLA - COD 15 01 07", cod: "15 01 07", cod_art: "000023" },
  { den: "DESEURI DE AMBALAJE FOLIE TRANSPARENTA - COD 15 01 02", cod: "15 01 02", cod_art: "000024" },
  { den: "DESEURI DE AMBALAJE PP - COD 15 01 02", cod: "15 01 02", cod_art: "000025" },
  { den: "DESEURI DE AMBALAJE PE - COD 15 01 02", cod: "15 01 02", cod_art: "000026" },
  { den: "DESEURI DE AMBALAJE DIN PET-COD 15 01 02-FARA TRASABILITATE", cod: "15 01 02", cod_art: "000049" },
  { den: "DESEURI DE AMBALAJE DIN CARTON-COD 15 01 01-FARA TRASABILITA", cod: "15 01 01", cod_art: "000050" },
  { den: "DESEURI DE AMBALAJE DIN ALUMINIU-COD 15 01 04-FARA TRASABILI", cod: "15 01 04", cod_art: "000051" },
  { den: "DESEURI DE AMBALAJE DIN STICLA-COD 15 01 07-FARA TRASABILITA", cod: "15 01 07", cod_art: "000052" },
  { den: "DESEURI DE AMBALAJE PP-COD 15 01 02-FARA TRASABILITATE", cod: "15 01 02", cod_art: "000053" },
  { den: "DESEURI DE AMBALAJE PE-COD 15 01 02-FARA TRASABILITATE", cod: "15 01 02", cod_art: "000054" },
  { den: "DESEURI HARTIE -COD 20 01 01", cod: "20 01 01", cod_art: "000055" },
  { den: "FIER DESEURI - COD 17 04 05", cod: "17 04 05", cod_art: "000056" },
  { den: "CUPRU DESEURI  - COD 17 04 01", cod: "17 04 01", cod_art: "000057" },
  { den: "ALUMINIU DESEURI - COD 17 04 02", cod: "17 04 02", cod_art: "000058" },
  { den: "INOX DESEURI - COD 17 04 05", cod: "17 04 05", cod_art: "000059" },
  { den: "ALAMA DESEURI - COD 17 04 01", cod: "17 04 01", cod_art: "000061" },
  { den: "DESEURI DE AMBALAJE DIN PET ALBASTRU - COD 15 01 02", cod: "15 01 02", cod_art: "000078" },
  { den: "DESEURI DE AMBALAJE DIN PET TRANSPARENT - COD 15 01 02", cod: "15 01 02", cod_art: "000079" },
  { den: "DESEURI DE AMBALAJE DIN PET MARO - COD 15 01 02", cod: "15 01 02", cod_art: "000080" },
  { den: "DESEURI DE AMBALAJE DIN PET VERDE - COD 15 01 02", cod: "15 01 02", cod_art: "000081" },
  { den: "DESEURI DE AMBALAJE DIN HDPE - COD 15 01 02", cod: "15 01 02", cod_art: "000128" },
  { den: "DESEURI DE AMBALAJE DIN HDPE SUFLARE < 5L- COD 15 01 02", cod: "15 01 02", cod_art: "000132" },
  { den: "DESEURI DE AMBALAJE DIN HDPE SUFLARE > 5L- COD 15 01 02", cod: "15 01 02", cod_art: "000133" },
  { den: "DESEURI DE AMBALAJE DIN PP SUFLARE - COD 15 01 02", cod: "15 01 02", cod_art: "000134" },
  { den: "DESEURI DE AMBALAJE DIN PET FLORAL - COD 15 01 02", cod: "15 01 02", cod_art: "000135" },
  { den: "DESEU DEEE COD 160214", cod: "16 02 14", cod_art: "000163" },
  { den: "DESEURI DE AMBALAJE DIN FOLIE COLOR - COD 15 01 02", cod: "15 01 02", cod_art: "000174" },
  { den: "FIER DESEURI - COD 16 01 17", cod: "16 01 17", cod_art: "000188" },
  { den: "CARTON GOFRAT PENTRU AMBALARE - CUTIE 4KG", cod: "", cod_art: "000189" },
  { den: "FOLIE CU BULE 50 GR/MP - 0,30 M LATIME X 100 M", cod: "", cod_art: "000190" },
  { den: "HARTIE ALBA COPIATOR A4,80G/MP,CLASA A. DOUBLE A PREMIUM", cod: "", cod_art: "000191" },
  { den: "DESEURI DE AMBALAJE DIN PET MIXT - COD 15 01 02", cod: "15 01 02", cod_art: "000192" },
  { den: "DESEURI DE AMBALAJE DIN PET MIXT BALOTAT - COD 15 01 02", cod: "15 01 02", cod_art: "000193" },
  { den: "DESEURI DE AMBALAJE DIN PET T/V/A BALOTAT - COD 15 01 02", cod: "15 01 02", cod_art: "000194" },
  { den: "DESEURI DE AMBALAJE DIN PET ALBASTRU BALOTAT - COD 15 01 02", cod: "15 01 02", cod_art: "000195" },
  { den: "DESEURI DE AMBALAJE DIN PET VERDE BALOTAT - COD 15 01 02", cod: "15 01 02", cod_art: "000196" },
  { den: "DESEURI DE AMBALAJE DIN PET MARO BALOTAT - COD 15 01 02", cod: "15 01 02", cod_art: "000197" },
  { den: "DESEURI DE AMBALAJE DIN PET TRANSPARENT BALOTAT - COD 15 01", cod: "", cod_art: "000198" },
  { den: "DESEURI LEMN - COD 20 01 38", cod: "20 01 38", cod_art: "000218" },
  { den: "EUROPALETI", cod: "", cod_art: "000219" },
  { den: "DESEURI DE AMBALAJE DIN RAFIE-COD 15 01 02", cod: "15 01 02", cod_art: "000239" },
  { den: "DESEU BATERII DBA MIXT - COD 16 06 05", cod: "16 06 05", cod_art: "000261" },
  { den: "DESEURI CABLURI CUPRU-COD 17 04 11", cod: "17 04 11", cod_art: "000276" },
  { den: "DESEURI CABLURI ALUMINIU-COD 17 04 11", cod: "17 04 11", cod_art: "000277" },
  { den: "CUPRU DIN DESEU DE CABLURI-COD 17 04 01", cod: "17 04 01", cod_art: "000279" },
  { den: "ALUMINIU DIN DESEU DE CABLURI -COD 17 04 02", cod: "17 04 02", cod_art: "000280" },
  { den: "DESEU PLASTIC AMESTEC DIN CABLU", cod: "", cod_art: "000281" },
  { den: "DESEURI DE ULEI SI GRASIMI COMESTIBILE - COD 20 01 25", cod: "20 01 25", cod_art: "000299" },
  { den: "EUROPALET ALB", cod: "", cod_art: "000333" },
  { den: "EUROPALET NEGRU", cod: "", cod_art: "000334" },
  { den: "NONEUROPALET", cod: "", cod_art: "000335" },
  { den: "DESEU ACUMULATORI  - COD 16 06 01", cod: "16 06 01", cod_art: "000336" },
  { den: "DESEU MATERIALE PLASTICE - COD 16 01 19", cod: "16 01 19", cod_art: "000337" },
  { den: "DESEU FIER DIN DEEE-COD 16 02 16", cod: "16 02 16", cod_art: "000362" },
  { den: "DESEU DEEE-COD 16 02 14", cod: "16 02 14", cod_art: "000363" },
  { den: "DESEU DEEE-COD 20 01 36", cod: "20 01 36", cod_art: "000364" },
  { den: "DESEU VSU PROVENITE DIN CASARE  AUTO", cod: "", cod_art: "000393" },
  { den: "APARAT PT.INGRIJIRE PAR SI INGRIJIRE CORPORALA-COD: 16 02 14", cod: "16 02 14", cod_art: "000395" },
  { den: "APARAT PT.INGRIJIRE PAR SI INGRIJIRE CORPORALA-COD: 20 01 36", cod: "20 01 36", cod_art: "000396" },
  { den: "APARAT RADIO-COD: 16 02 14", cod: "16 02 14", cod_art: "000397" },
  { den: "APARAT RADIO-COD: 20 01 36", cod: "20 01 36", cod_art: "000398" },
  { den: "APARATE DE PRAJIT PAINE-COD: 20 01 36", cod: "20 01 36", cod_art: "000399" },
  { den: "ASPIRATOR-COD: 16 02 14", cod: "16 02 14", cod_art: "000400" },
  { den: "ASPIRATOR-COD: 20 01 36", cod: "20 01 36", cod_art: "000401" },
  { den: "AUTOMATE CU MONEDE DE MARI DIMENSIUNI-COD: 20 01 36", cod: "20 01 36", cod_art: "000402" },
  { den: "CUPTOR CU MICROUNDE-COD: 16 02 14", cod: "16 02 14", cod_art: "000404" },
  { den: "CUPTOR CU MICROUNDE-COD: 20 01 36", cod: "20 01 36", cod_art: "000405" },
  { den: "FIARE DE CALCAT-COD: 20 01 36", cod: "20 01 36", cod_art: "000410" },
  { den: "FIERBATOARE DE APA-COD: 20 01 36", cod: "20 01 36", cod_art: "000411" },
  { den: "IMPRIMANTE MARI-COD: 16 02 14", cod: "16 02 14", cod_art: "000412" },
  { den: "IMPRIMANTE MARI-COD: 20 01 36", cod: "20 01 36", cod_art: "000413" },
  { den: "IMPRIMANTE MICI-COD: 16 02 14", cod: "16 02 14", cod_art: "000414" },
  { den: "IMPRIMANTE MICI-COD: 20 01 36", cod: "20 01 36", cod_art: "000415" },
  { den: "JUCARII-COD: 20 01 36", cod: "20 01 36", cod_art: "000416" },
  { den: "MASINA DE SPALAT RUFE-COD: 16 02 14", cod: "16 02 14", cod_art: "000417" },
  { den: "MASINA DE SPALAT RUFE-COD: 20 01 36", cod: "20 01 36", cod_art: "000418" },
  { den: "MASINA DE SPALAT VASE-COD: 16 02 14", cod: "16 02 14", cod_art: "000419" },
  { den: "MASINA DE SPALAT VASE-COD: 20 01 36", cod: "20 01 36", cod_art: "000420" },
  { den: "MASINA DE USCAT RUFE-COD: 16 02 14", cod: "16 02 14", cod_art: "000421" },
  { den: "MASINI DE GATIT-COD: 16 02 14", cod: "16 02 14", cod_art: "000423" },
  { den: "MASINI DE GATIT-COD: 20 01 36", cod: "20 01 36", cod_art: "000424" },
  { den: "SOBE ELECTRICE-COD: 16 02 14", cod: "16 02 14", cod_art: "000427" },
  { den: "SOBE ELECTRICE-COD: 20 01 36", cod: "20 01 36", cod_art: "000428" },
  { den: "TELEFOANE-COD: 20 01 36", cod: "20 01 36", cod_art: "000429" },
  { den: "UNELTE ELECTRICE & ELECTRONICE MICI DIMENSIUNI-COD: 20 01 36", cod: "20 01 36", cod_art: "000431" },
  { den: "UNITATE CENTRALA PC-COD: 16 02 14", cod: "16 02 14", cod_art: "000432" },
  { den: "VENTILATOARE-COD: 16 02 14", cod: "16 02 14", cod_art: "000435" },
  { den: "VENTILATOARE-COD: 20 01 36", cod: "20 01 36", cod_art: "000436" },
  { den: "CONDENSATORI-COD: 16 02 15*", cod: "16 02 15*", cod_art: "000438" },
  { den: "ALUMINIU- DEZMEMBRARE MANUALA-COD: 16 02 16", cod: "16 02 16", cod_art: "000439" },
  { den: "COMPONENTE ELECTRONICE-COD: 16 02 16", cod: "16 02 16", cod_art: "000440" },
  { den: "CUPRU - DEZMEMBRARE MANUALA-COD: 16 02 16", cod: "16 02 16", cod_art: "000441" },
  { den: "FIER - DEZMEMBRARE MANUALA-COD: 16 02 16", cod: "16 02 16", cod_art: "000442" },
  { den: "PLACI CU CIRCUITE IMPRIMATE-COD: 16 02 16", cod: "16 02 16", cod_art: "000443" },
  { den: "PLASTIC NESORTAT-COD: 16 02 16", cod: "16 02 16", cod_art: "000444" },
  { den: "STICLA-COD: 16 02 16", cod: "16 02 16", cod_art: "000445" },
  { den: "SURSE ALIMENTARE-COD: 16 02 16", cod: "16 02 16", cod_art: "000446" },
  { den: "ALTE BATERII-COD: 16 06 05", cod: "16 06 05", cod_art: "000447" },
  { den: "BETON-COD: 19 12 12", cod: "19 12 12", cod_art: "000448" },
  { den: "IMPURITATI FARA COMPUSI PERICULOSI-COD: 19 12 12", cod: "19 12 12", cod_art: "000449" },
  { den: "CARTUSE, TONERE-COD: 08 03 18", cod: "08 03 18", cod_art: "000450" },
  { den: "CAUCIUC-COD: 16 02 16", cod: "16 02 16", cod_art: "000452" },
  { den: "MOTOARE/TRANSFORMATOARE-COD: 16 02 16", cod: "16 02 16", cod_art: "000453" },
  { den: "VATA MINERALA-COD: 19 12 12", cod: "19 12 12", cod_art: "000454" },
  { den: "HDD/SSD-COD: 16 02 16", cod: "16 02 16", cod_art: "000455" },
  { den: "UNELTE ELECTRICE & ELECTRONICE MICI DIMENSIUNI-COD: 16 02 14", cod: "16 02 14", cod_art: "000459" },
  { den: "ECRANE-COD: 16 02 14", cod: "16 02 14", cod_art: "000460" },
  { den: "MONITOARE-COD: 16 02 14", cod: "16 02 14", cod_art: "000461" },
  { den: "TELEFOANE-COD: 16 02 14", cod: "16 02 14", cod_art: "000462" },
  { den: "TELEVIZOARE-COD: 16 02 14", cod: "16 02 14", cod_art: "000463" },
  { den: "CALCULATOARE MICI PORTABILE-COD: 16 02 14", cod: "16 02 14", cod_art: "000464" },
  { den: "CALCULATOARE PORTABILE-COD: 16 02 14", cod: "16 02 14", cod_art: "000465" },
  { den: "CALCULATOARE PORTABILE-COD: 20 01 36", cod: "20 01 36", cod_art: "000466" },
  { den: "CALCULATOARE PERSONALE-COD: 20 01 36", cod: "20 01 36", cod_art: "000467" },
  { den: "USCATOARE DE HAINE-COD: 20 01 36", cod: "20 01 36", cod_art: "000468" },
  { den: "APARATE VIDEO-COD: 20 01 36", cod: "20 01 36", cod_art: "000469" },
  { den: "ALTELE-COD: 20 01 36", cod: "20 01 36", cod_art: "000470" },
  { den: "ALTELE-COD: 16 02 14", cod: "16 02 14", cod_art: "000477" },
  { den: "INOX - DEZMEMBRARE MANUALA-COD: 16 02 16", cod: "16 02 16", cod_art: "000478" },
  { den: "CALCULATOARE MICI PORTABILE-COD: 20 01 36", cod: "20 01 36", cod_art: "000479" },
  { den: "TELEVIZOARE-COD: 20 01 36", cod: "20 01 36", cod_art: "000480" },
  { den: "MONITOARE-COD: 20 01 36", cod: "20 01 36", cod_art: "000481" },
  { den: "CALCULATOARE DE BUZUNAR-COD: 20 01 36", cod: "20 01 36", cod_art: "000484" },
  { den: "GPS-COD: 16 02 14", cod: "16 02 14", cod_art: "000485" },
  { den: "CALCULATOARE PERSONALE-COD: 16 02 14", cod: "16 02 14", cod_art: "000487" },
  { den: "FIARE DE CALCAT-COD: 16 02 14", cod: "16 02 14", cod_art: "000505" },
  { den: "CALCULATOARE MARI-COD: 16 02 14", cod: "16 02 14", cod_art: "000506" },
  { den: "CALCULATOARE MARI-COD: 20 01 36", cod: "20 01 36", cod_art: "000507" },
  { den: "ECHIPAMENTE DE AER CONDITIONAT-COD: 16 02 14", cod: "16 02 14", cod_art: "000508" },
  { den: "ECHIPAMENTE DE AER CONDITIONAT-COD: 20 01 36", cod: "20 01 36", cod_art: "000509" },
  { den: "ECHIPAMENTE DE DEZUMIDIFICARE-COD: 16 02 14", cod: "16 02 14", cod_art: "000510" },
  { den: "ECHIPAMENTE DE DEZUMIDIFICARE-COD: 20 01 36", cod: "20 01 36", cod_art: "000511" },
  { den: "RADIATOARE CU ULEI-COD: 16 02 14", cod: "16 02 14", cod_art: "000512" },
  { den: "RADIATOARE CU ULEI-COD: 20 01 36", cod: "20 01 36", cod_art: "000513" },
  { den: "APARATE DE PRAJIT PAINE-COD: 16 02 14", cod: "16 02 14", cod_art: "000514" },
  { den: "FIERBATOARE DE APA-COD: 16 02 14", cod: "16 02 14", cod_art: "000515" },
  { den: "GRANULA LDPE RECICLAT", cod: "", cod_art: "000517" },
  { den: "MATERIAL ABSORBANT-COD: 19 12 04", cod: "19 12 04", cod_art: "000526" },
  { den: "SPUMA POLIUTERMICA-COD: 16 02 16", cod: "16 02 16", cod_art: "000527" },
  { den: "VENTILATOARE-COD: 16 02 16", cod: "16 02 16", cod_art: "000528" },
  { den: "DESEU FIER DIN DEEE-COD 19 12 02", cod: "19 12 02", cod_art: "000533" },
  { den: "POMPE DRC 80-400", cod: "", cod_art: "000535" },
  { den: "POMPE MV 253", cod: "", cod_art: "000536" },
  { den: "POMPE NC 200", cod: "", cod_art: "000537" },
  { den: "DESEURI HARTIE-COD 20 01 01", cod: "20 01 01", cod_art: "000538" },
  { den: "FIER DESEURI -COD 17 04 05", cod: "17 04 05", cod_art: "000539" },
  { den: "CUPRU DESEURI -COD 17 04 01", cod: "17 04 01", cod_art: "000540" },
  { den: "ALUMINIU DESEURI -COD 17 04 02", cod: "17 04 02", cod_art: "000541" },
  { den: "INOX DESEURI-COD 17 04 05", cod: "17 04 05", cod_art: "000542" },
  { den: "DESEURI DE AMBALAJE DIN HDPE-COD 15 01 02", cod: "15 01 02", cod_art: "000543" },
  { den: "DESEU DEEE COD 16 02 14", cod: "16 02 14", cod_art: "000544" },
  { den: "DESEURI DE AMBALAJE DIN FOLIE COLOR-COD 15 01 02", cod: "15 01 02", cod_art: "000545" },
  { den: "FIER DESEURI-COD 16 01 17", cod: "16 01 17", cod_art: "000546" },
  { den: "DESEU FIER DIN DEEE - COD 16 02 16", cod: "16 02 16", cod_art: "000547" },
  { den: "DESEU FIER DIN DEEE - COD 19 12 02", cod: "19 12 02", cod_art: "000548" },
  { den: "GRANULA LDPE  RECICLAT", cod: "", cod_art: "000549" },
];
const PRODUSE = PRODUSE_LIST.map((p) => p.den);
const AGENTI = ["Alex","Sandel","Cosereni","Tanase George","Iacob Marian","Cuscru","Ecosal","Ecovol","Nea Costel"];
const ACHITAT_DE_OPT = ["Alex","Maria","Ion","Andrei","Nea Costel"];
const CLIENTI = ["ROMRECYCLING","CRILELMAR SRL","GREENTECH","METALROM","RECYCLE PRO","Altul"];
const CATEGORIE_COL = ["Curte","Deee","Diverse","Altele"];
const COL_COLORS = { Curte: "#c6efce", Deee: "#bdd7ee", Diverse: "#fff2cc", Altele: "#fce4d6" };
const CATEGORIE_CH = ["Diverse","Taxe","Salarii","Utilități","Transport","Combustibil","Altele"];
const DECONT_CAT = ["Marfă","Salarii","Furnizor","Combustibil","Taxe","Comisioane","Altele"];
const GREENKRAFT_OPT = ["Deee","Greenkraft"];
// ── Liste predefinite Tichete Cantar (din aplicatia veche, curatate) ──
const TIC_DELEGATI = ["ANDREI ALEXANDRU","BALESCU DUMITRU","BALTAC CONSTANTIN","BARBU DANIEL","BARBU LIVIU","BERCU MARIAN","BERCUCI NICOLAE","BOGDAN STEFAN COSMIN","BUDU MIHAI","CALIN RAZVAN","CARCEI IONUT","CIMPOIERU VIOREL","CIORTAN FLORIN","CIUCA SORIN DANIEL","COSTEA DANIEL MIHAI","DAN VARGATU","DEATCU MARIN","DINU DANUT","DINU TITI","DONDOE EMIL","DUMITRACHE CORNEL","DUMITRU MARIUS","FLOREA ION","FLOREA STEFAN","FLORESCU VASILE","FODOROIU MARIAN","GAGU TRAIAN","GANA MIHAI","GAULEA MARIAN","GHERGHILESCU CIPRIAN","GORE GEORGIAN","GRIGORE EUGEN","ILIE VASILE","ION BOGDAN","IORDACHE NICUSOR","IORGA IONEL","LAZAR FLORIN","MARADIN ANDREI","MARCU NELUS","MARINICA NICOLAIE","MATEI MARIAN","MAZILU FLORIN","MIHAI BOGDANEL","MIHAI CRISTIAN","MIHAI DORIAN","MIINEA VALENTIN (BALBI)","MITICA CORNELIU","MOCANU MARIUS","MORARU CONSTANTIN","NEAGU NICOLAE","NICOLAE CONSTANTIN","NISTOR CATALIN GEORGE","OLARU VIOREL","OPRESCU ION","PATRICHI GICA","PAUN GEORGE","PETRE DUMITRU","PINTILIE SILVIU","PITIGOI DUMITRU","PLAIASU IONEL","POROINEANU VALENTIN","PUSCASU CLAUDIU","RADU IULIAN","RADUCANU MARIUS","ROSU SORIN","RUBEI DORIAN","SAMOILA FLORIN DANIEL","SANDEL","SANDU IULIAN GABRIEL","SANDU ROMEO","SCARLAT MARIAN","SERBAN GIANI","SMARANDA ALIN","STAICU DANUT VIRGIL","STANCIU MARIAN ALEXANDRU","STATE NICUSOR","STEREA FLORIN GABRIEL","TANASE ALEXANDRU","TARZIU VASILE","TELEASA MIHAI","TOADER CATALIN","TUDOR IONUT","URDA VOICU","VENTRI CLAUDIU","VICA MARCEL","VISAN ADRIAN","ZICA ZISU CATALIN"];
const TIC_TRANSPORTATORI = ["GREEN KRAFT SRL","AUTO HOFF TECHNOLOGY","AWR GREEN POINT SRL","BEFIN","BRAVA EVE SRL","CIUCA SORIN DANIEL","COSTEA DANIEL MIHAI","COSTELO SPEED SRL","DIMAR SRL","DINU TITI","DOM & LUK SRL","DSE WEST TRANS SOLUTIONS SRL","ECO METAL COLECT","ECOSAL SERV DOBROESTI","ECOSFERA COLECT","EUROPE WASTE MANAGEMENT","FRANCESCA WEN TRUCK SRL","GABIONEL MARFURI TRANS SRL","GREEN PACK","GREEN RESPO RECYCLING SRL","GREENWEEE INTERNATIONAL SA","IULIAN","MANY SPEED TRANS","MARADIN ANDREI","MARCU DRAGOS IANIS SRL","MARILU EXPRESS","MARIMAR BEST SPEDITION","MEGA ACTIV SRL","METAL TURAL","MITICA CORNELIU","ND CORNELIO","OGLEJA GROUP TRANS SRL","OMEGA MET CONSTRUCT","PATRIKI TRANS LOGISTIC SRL","PAVIS DENIS AUTO SRL","PRO AUTO COLLINI","RADU IULIAN","RALEX TRANZIT SRL","REMAT BUCURESTI SUD","REMAT ECO METAL SRL","RFC CLAUS INTER TRANS","RNC IDEAL LOGISTIC INT","RODI DOR SPEED SRL","ROMCARBON SA","ROMRECYCLING SRL","SANDEL","SD STEELMET SRL","SILPIN EUROTRANS","SKY DAA TRANS","SORGETI","STAICU TRANS","STEP ONE AGRO SRL","TD TYA CONCEPT TRANS","TEH 2001 SERVICE SRL","TRANS TIMIABI LEVI SRL","YASMI MAR LOGISTIC SRL","YULIAF TRANS","ZERO WASTE CONCEPT"];
const TIC_MASINI = ["34GF2212","B06SUN","B113CKM","B131RRY","B150YRS","B158RSA","B16GPC B07GPC","B170RHO","B199DAR","B204EMC","B223RHO","B232MDI","B23RRY","B305ATU IL05DBJ","B305ATU IL30DBJ","B35ATU IL33DBJ","B35RRY","B580MST IF17HJH","B707MCI","B750MIT","B80LUY","B82DYR","B898EST DJ64EST","B900WIP","B90JTR","B90LUY","BZ04MCD","BZ05AST","BZ10JNN","BZ16LPP","BZ21UTE","BZ26SKY","BZ28SKY","BZ29AKM","BZ33TIA","BZ41MDI","BZ46MDI","BZ52MCD","BZ52RNC","BZ65CST","BZ75KAT","BZ76MAZ","CL02DCS CL24DCS","CL23BYA CL23SAF","CT88RFC","DB11ULB DB11UCN","DB17WEN DB20WEN","DB24BFN","DB89PST DB90PST","DJ21STH","DJ36EST","DJ56EST","DJ87EST","GR26PKV GR30PKV","GR88ECS","IF03JFJ","IF057673","IF06EMC","IF06TRE","IF11UYK","IF12VXT","IF15DSW","IF20KFT","IF31RAL","IF35WSD","IF39WSD","IF43EVE","IF44WTW B02WIA","IF49ECS","IF50LAF","IF55KFT","IF71EXA","IF81PDA","IF85PDA","IF88HLP","IF88KFT","IF90RRY","IF95WTW","IL04DBJ TR32MAS","IL41VAN","IL41VAN IL14VAN","IL41VAN IL18VAN","IL99BRV IL05DBJ","IL99BRV IL30DBJ","MH09TOX MH80TOX","MH24LTC","PH76MMR","PH93MRD","PH94TAS PH85TRS","SB17PMY CT19XKR","TL05FWU","TR32MAS IL04DBJ"];
const TIC_CLIENTI = ["GREEN KRAFT SRL","AWR GREEN POINT SRL","BALAN VASILE","BALTAC CONSTANTIN","BURLACU PAVEL-ANDREI","CALIN GHEORGHE-BOGDAN","CAN PACK RECYCLING SRL","CASE CALDUROASE SRL","CIUCA SORIN-DANIEL","COSTEA DANIEL-MIHAI","COTAN CODRIN","DGASPC IALOMITA","DINU IORDAN","ECO METAL COLECT","ECOFRIEND RECYCLING","ECOSAL SERV DOBROESTI","ECOVOL ILFOV SA","EDIL MAR NORD EST SRL","EUROPE WASTE MANAGEMENT","EVEREST","FUTURE INSPIRED TRAINING SRL","GENERAL CONCRETE CERNAVODA SRL","GHEORGHE CRISTINA-MIRELA","GLINTA LUCIAN","GREEN CITY VOLUNTARI SA","GREEN KRAFT SRL / ENVIRON","GREENWEEE INTERNATIONAL SA","INCD-IBA BUCURESTI","LUCICA","MANOLACHE MARCEL","MARADIN ANDREI","MORARU DORIN-CLAUDIU","OMEGA MET CONSTRUCT","PAS SERVICE SRL","PAUZA DE DULCE SRL","PERCA RAZVAN-FLORIN","POP CONSTANTIN-LIVIU","PREMIUM STORE SRL","REMAT BUCURESTI","REMAT BUCURESTI SUD","REMAT ECO METAL SRL","RETURO SISTEM SA","ROCK STAR CONSTRUCT","ROMCARBON SA","ROMRECYCLING SRL","RUS ELECTRONIC RECYCLING","SANDU MARIAN","SD STEELMET SRL","SERVICE CICLOP SA","STANCIU MARIAN-ALEXANDRU","STOICA GEORGE-ALEXANDRU","STOOK CONCEPT SRL","TAURUS TEHNOLOGII MEDIU","TEH 2001 SERVICE SRL","TEHNO INVEST BALKAN","TEMPOS SERV","TEO TODICA","TOPORAN FLORIN","TOTAL PRO ACHIZITII SRL","VIRSARU MARIAN-AUREL","WASTE RECYCLING INVESTMENT SRL","WOWSTEP CONCEPT SRL","ZUHUR IMPORT SRL"];
const LUNI = ["Ian","Feb","Mar","Apr","Mai","Iun","Iul","Aug","Sep","Oct","Nov","Dec"];
const SERII = ["GK","GKR"];
const CAT_PAROLE = ["Email","Bancă","Card","Platformă","WiFi","Altele"];
const PIN_CORRECT = "336699";

// ── PV constants ──────────────────────────────────────────────
const PV_MATERIALE = [
  { den: "Deseuri de ambalaje din carton", cod: "15 01 01" },
  { den: "Deseuri de ambalaje din lemn", cod: "15 01 03" },
  { den: "Deseuri de ambalaje din PET", cod: "15 01 02" },
  { den: "Deseuri de ambalaje din Aluminiu", cod: "15 01 04" },
  { den: "Deseuri de ambalaje folie color", cod: "15 01 02" },
  { den: "Deseuri de ambalaje din sticla", cod: "15 01 07" },
  { den: "Deseu Fier", cod: "17 04 05" },
  { den: "Deseu DEEE", cod: "16 02 14" },
  { den: "Deseu Aluminiu", cod: "17 04 02" },
  { den: "Deseu Cupru", cod: "17 04 01" },
  { den: "Deseu Inox", cod: "17 04 05" },
  { den: "Deseu Baterii DBA Mixt", cod: "16 06 05" },
];
const PV_DEN_OPTIONS = PV_MATERIALE.map(m => m.den);
const DELEGATI = ["Baltac Constantin", "Alex", "Sandel", "Ion", "Andrei", "Catalin Zica"];
const DESTINATII = ["Colectare", "Stocare temporară", "Tratare", "Valorificare", "Eliminare"];

// ── Helpers ───────────────────────────────────────────────────
const fmt = (v, dec = 2) => {
  if (v === "" || v === null || v === undefined || isNaN(v)) return "";
  return Number(v).toLocaleString("ro-RO", { minimumFractionDigits: dec, maximumFractionDigits: dec });
};
const parseSuma = (s) => {
  if (!s) return 0;
  return parseFloat(String(s).replace(/\./g, "").replace(",", ".")) || 0;
};
const calcRow = (r, cost) => {
  const m = r.pv && r.pa ? +(r.pv - r.pa).toFixed(4) : 0;
  return { ...r, cost, marja: m, cant: m > 0 ? +(cost / m).toFixed(2) : 0 };
};
function today() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}
function litere(n) {
  n = Math.round(n || 0);
  const u = ["","unu","doi","trei","patru","cinci","șase","șapte","opt","nouă","zece","unsprezece","doisprezece","treisprezece","paisprezece","cincisprezece","șaisprezece","șaptesprezece","optsprezece","nouăsprezece"];
  const z = ["","","douăzeci","treizeci","patruzeci","cincizeci","șaizeci","șaptezeci","optzeci","nouăzeci"];
  const s = ["","una sută","două sute","trei sute","patru sute","cinci sute","șase sute","șapte sute","opt sute","nouă sute"];
  if (!n) return "zero";
  let p = [], rest = n;
  if (rest >= 1000) { const m = Math.floor(rest / 1000); p.push(m === 1 ? "o mie" : m === 2 ? "două mii" : fmt(m, 0) + " mii"); rest = rest % 1000; }
  const sv = Math.floor(rest / 100); if (sv) p.push(s[sv]); rest = rest % 100;
  if (rest < 20 && rest > 0) p.push(u[rest]);
  else { const zv = Math.floor(rest / 10), uv = rest % 10; if (zv) p.push(z[zv] + (uv ? " și " + u[uv] : "")); }
  return p.join(" ") || "zero";
}
const getNextNr = (serie, reg) => {
  const m = reg.filter((r) => r.serie === serie).map((r) => parseInt(r.nr) || 0);
  return m.length ? String(Math.max(...m) + 1) : serie === "GK" ? "18050" : "1";
};
function calcStoc(miscari = []) {
  const map = {};
  miscari.forEach((m) => {
    const k = m.produs;
    if (!map[k]) map[k] = { produs: m.produs, cod: m.cod || "", cod_art: m.cod_art || "", cant: 0, val: 0, intrari: 0, iesiri: 0, data: m.data || "" };
    if (m.cod_art && !map[k].cod_art) map[k].cod_art = m.cod_art;
    if (m.tip === "intrare") { map[k].val += (parseFloat(m.cant) || 0) * (parseFloat(m.pu) || 0); map[k].cant += parseFloat(m.cant) || 0; map[k].intrari += parseFloat(m.cant) || 0; }
    else { map[k].cant -= parseFloat(m.cant) || 0; map[k].iesiri += parseFloat(m.cant) || 0; }
    if ((m.data || "") > (map[k].data || "")) map[k].data = m.data;
  });
  return Object.values(map).map((r) => ({ ...r, pm: r.intrari > 0 ? r.val / r.intrari : 0 }));
}

// ── Styles ────────────────────────────────────────────────────
const th = (x = {}) => ({ background: "#3a6b4a", color: "#fff", padding: "5px 6px", border: "1px solid #aaa", fontWeight: 700, fontSize: 11, whiteSpace: "nowrap", textAlign: "center", ...x });
const td = (x = {}) => ({ padding: "3px 5px", border: "1px solid #d0d0d0", fontSize: 12, background: "#fff", verticalAlign: "middle", ...x });
const inp = (x = {}) => ({ width: "100%", border: "none", outline: "none", fontSize: 12, background: "transparent", ...x });
const sel = (x = {}) => ({ border: "none", outline: "none", background: "transparent", fontSize: 12, width: "100%", cursor: "pointer", ...x });
const LSt = { fontSize: 11, fontWeight: 600, color: "#555", marginBottom: 2, display: "block" };
const IFS = { width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "4px 8px", fontSize: 12, boxSizing: "border-box" };

// ── Date Input (with HTML5 calendar) ──────────────────────────
function DateInput({ value, onChange, style = {} }) {
  // Convert DD.MM.YYYY to YYYY-MM-DD for HTML date input
  const toIso = (s) => {
    if (!s) return "";
    const m = String(s).match(/^(\d{1,2})[.\/\-](\d{1,2})[.\/\-](\d{2,4})/);
    if (!m) return "";
    let y = parseInt(m[3]);
    if (y < 100) y += 2000;
    return `${y}-${String(parseInt(m[2])).padStart(2, "0")}-${String(parseInt(m[1])).padStart(2, "0")}`;
  };
  // Convert YYYY-MM-DD back to DD.MM.YYYY
  const fromIso = (s) => {
    if (!s) return "";
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return "";
    return `${m[3]}.${m[2]}.${m[1]}`;
  };
  return (
    <input
      type="date"
      style={{ width: "100%", border: "1px solid transparent", borderRadius: 3, padding: "3px 5px", fontSize: 12, background: "transparent", outline: "none", fontFamily: "inherit", textAlign: "center", ...style }}
      value={toIso(value)}
      onChange={(e) => onChange(fromIso(e.target.value))}
    />
  );
}

// ── Autocomplete ──────────────────────────────────────────────
function AC({ value, onChange, options, placeholder = "" }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(value);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 200 });
  const inputRef = useRef();
  const updatePos = () => {
    if (inputRef.current) {
      const r = inputRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 2, left: r.left, width: Math.max(220, r.width) });
    }
  };
  const filtered = options.filter((o) => o.toLowerCase().includes((q || "").toLowerCase()));
  return (
    <div style={{ position: "relative" }}>
      <input ref={inputRef} style={inp({ textAlign: "center" })} value={q} placeholder={placeholder}
        onChange={(e) => { setQ(e.target.value); onChange(e.target.value); updatePos(); setOpen(true); }}
        onFocus={() => { updatePos(); setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 150)} />
      {open && filtered.length > 0 && (
        <div style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width, zIndex: 99999, background: "#fff", border: "1px solid #1565c0", borderRadius: 4, boxShadow: "0 4px 16px rgba(0,0,0,.2)", maxHeight: 240, overflowY: "auto" }}>
          {filtered.slice(0, 50).map((o) => (
            <div key={o} onMouseDown={() => { setQ(o); onChange(o); setOpen(false); }}
              style={{ padding: "6px 10px", fontSize: 12, cursor: "pointer", borderBottom: "1px solid #eee", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#e8f5e9")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}>{o}</div>
          ))}
          {filtered.length > 50 && <div style={{ padding: "4px 10px", fontSize: 10, color: "#888", textAlign: "center", background: "#f5f5f5" }}>+ {filtered.length - 50} rezultate. Filtrează mai precis.</div>}
        </div>
      )}
    </div>
  );
}

// ── Borderou Print ────────────────────────────────────────────
function BordPrint({ b }) {
  const tot = b.produse.reduce((s, p) => s + (parseFloat(p.cant) || 0) * (parseFloat(p.pret) || 0), 0);
  const imp = Math.round(tot * 0.1), tax = Math.round(tot * 0.02), rest = tot - imp - tax;
  const tS = { width: "100%", borderCollapse: "collapse", margin: "8px 0", fontSize: 11 };
  const thP = (x = {}) => ({ border: "1px solid #000", padding: "4px 6px", fontWeight: "bold", textAlign: "center", background: "#f5f5f5", ...x });
  const tdP = (x = {}) => ({ border: "1px solid #000", padding: "4px 6px", textAlign: "center", ...x });
  return (
    <div style={{ fontFamily: "Times New Roman,serif", fontSize: 11, color: "#000", background: "#fff", padding: "18px 24px", maxWidth: 760, margin: "0 auto", lineHeight: 1.5 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <div><div style={{ fontWeight: "bold", fontSize: 13 }}>S.C. GREEN KRAFT S.R.L.</div><div>CUI:36191378</div><div>Nr. Reg Comert: J23/2426/2016</div></div>
        <div style={{ textAlign: "right", fontSize: 10 }}><div>Autorizatie Mediu : 233/22.12.2021</div><div>Soseaua de centura dreapta 18A, Afumați</div><div>Judeţul Ilfov, cod postal 770110</div></div>
      </div>
      <div style={{ textAlign: "center", margin: "8px 0" }}>
        <div style={{ fontSize: 18, fontWeight: "bold", fontStyle: "italic" }}>BORDEROU</div>
        <div style={{ fontSize: 12, fontStyle: "italic" }}>De achizitie deseuri</div>
        <div style={{ fontSize: 12, fontWeight: "bold" }}>Seria {b.serie} Nr. {b.nr} din data de {b.data}</div>
      </div>
      <div style={{ margin: "8px 0", fontSize: 11 }}>S-au primit de la (detinator) <strong>{b.det.toUpperCase()}</strong>, domiciliat{b.det.toLowerCase().endsWith("a") ? "a" : ""} in localitatea <strong>{b.dom}</strong>, legitimat{b.det.toLowerCase().endsWith("a") ? "a" : ""} cu C.I. Seria <strong>{b.ci_s}</strong>, nr. <strong>{b.ci_n}</strong>, eliberata de <strong>{b.ci_e}</strong> <strong>{b.ci_v}</strong>, CNP <strong>{b.cnp}</strong>, cu mijloc de transport <strong>{b.trans}</strong>,</div>
      <div style={{ fontSize: 11, marginBottom: 4 }}>următoarele materiale deseuri:</div>
      <table style={tS}>
        <thead>
          <tr><th style={thP({ textAlign: "left" })}>Denumire deseu</th><th style={thP()}>Cod HG 856</th><th style={thP()}>U/M</th><th style={thP()}>Cant.(Kg)</th><th style={thP()}>Pret (Lei/Kg)</th><th style={thP()}>Valoare (Lei)</th></tr>
          <tr>{["1","2","","","","5=3x4"].map((h, i) => <td key={i} style={tdP({ fontSize: 10, background: "#f9f9f9" })}>{h}</td>)}</tr>
        </thead>
        <tbody>
          {b.produse.map((p, i) => { const v = (parseFloat(p.cant) || 0) * (parseFloat(p.pret) || 0); return (<tr key={i}><td style={tdP({ textAlign: "left" })}>{p.den.toUpperCase()}</td><td style={tdP()}>{p.cod}</td><td style={tdP()}>KG</td><td style={tdP()}>{p.cant || ""}</td><td style={tdP()}>{p.pret || ""}</td><td style={tdP()}>{v > 0 ? fmt(v) : ""}</td></tr>); })}
          {Array(Math.max(0, 5 - b.produse.length)).fill(0).map((_, i) => <tr key={"e" + i}><td style={{ ...tdP(), height: 18 }} colSpan={6}>&nbsp;</td></tr>)}
        </tbody>
      </table>
      <table style={{ ...tS, width: "55%", marginLeft: "auto" }}>
        <tbody>
          <tr><td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold" }}>TOTAL</td><td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "right", fontWeight: "bold" }}>{fmt(tot)}</td></tr>
          <tr><td style={{ border: "1px solid #000", padding: "3px 6px" }}>Impozit pe venit 10%</td><td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "right" }}>{imp}</td></tr>
          <tr><td style={{ border: "1px solid #000", padding: "3px 6px" }}>Taxa mediu OUG 196/2005 2%</td><td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "right" }}>{fmt(tax)}</td></tr>
          <tr style={{ background: "#f0f0f0" }}><td style={{ border: "1px solid #000", padding: "3px 6px", fontWeight: "bold" }}>REST DE PLATA</td><td style={{ border: "1px solid #000", padding: "3px 6px", textAlign: "right", fontWeight: "bold", fontSize: 14 }}>{fmt(rest)}</td></tr>
        </tbody>
      </table>
      <div style={{ margin: "8px 0", fontSize: 11 }}>Se achita suma de <strong>{Math.round(rest)} Lei</strong>, adica (<em>{litere(Math.round(rest))} lei</em>) reprezentand contravaloarea deseurilor achizitionate cu chitanta nr. {b.nr}, sau la termen de maximum 3 zile lucratoare de la data prezentei, prin virament bancar in contul detinatorului nr. ______________________________, deschis la ______________________________.</div>
      <div style={{ fontSize: 10, margin: "6px 0", lineHeight: 1.6 }}>
        <p style={{ margin: "0 0 5px" }}>Impozitul pe venit de 10% si contributia de 2% la Administratia Fondului pentru Mediu (conf. Ordonantei de urgenta a Guvernului nr. 196/2005 privind Fondul pentru mediu, aprobata cu modificari si completari prin Legea nr. 105/2006, cu modificarile si completarile ulterioare) din contravaloarea deseurilor predate, au fost retinute la sursa din valoarea bruta.</p>
        <p style={{ margin: "0 0 5px" }}>Imi exprim acordul cu privire la utilizarea si prelucrarea datelor mele cu caracter personal de catre societatea GREEN KRAFT S.R.L. Sunt informat de catre beneficiar- ca aceste date vor fi tratate confidential, in conformitate cu prevederile Regulamentului (UE) 2016/679 privind protectia persoanelor fizice in ceea ce priveste prelucrarea datelor cu caracter personal si privind libera circulatie a acestor date.</p>
        <p style={{ margin: "0" }}>Datele dumneavoastra personale sunt prelucrate de societatea GREEN KRAFT S.R.L. in conformitate cu Regulamentul (UE) 2016/679 privind protectia persoanelor fizice in ceea ce priveste prelucrarea datelor cu caracter personal si privind libera circulatie a acestor date in scopul completarii si transmiterii declaratiilor si raportarilor legale.</p>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: 11 }}>
        <div style={{ textAlign: "center" }}><div>Am primit,</div><div style={{ fontWeight: "bold" }}>Gana Mihai</div><div style={{ fontSize: 9 }}>(nume/CNP/semnatura/stampila)</div><div style={{ marginTop: 6, width: 60, height: 60, border: "1px dashed #bbb", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#bbb", fontSize: 9, margin: "6px auto 0" }}>ștampilă</div></div>
        <div style={{ flex: 1, paddingLeft: 20 }}>
          <div style={{ fontWeight: "bold" }}>Detinator de deseuri-persoana fizica.</div>
          <div>1. Cunosc faptul ca falsul in declaratii constituie infractiune si se pedepseste conform Codului penal.</div>
          <div>2. Declar pe proprie raspundere ca deseurile pe care le predau provin din</div>
          <div style={{ paddingLeft: 14 }}>a) Gospodărie proprie [{b.sursa === "gospodarie" ? " X" : " "}]</div>
          <div style={{ paddingLeft: 14 }}>b) Alte surse [{b.sursa === "alte" ? " X" : " "}]</div>
          <div style={{ marginTop: 8 }}>Nume si prenume (detinator): <strong>{b.det}</strong></div>
          <div style={{ marginTop: 6 }}>Semnatura __________________</div>
        </div>
      </div>
    </div>
  );
}

// ── PV Print (2 pages) ────────────────────────────────────────
function PVPrint({ pv }) {
  const tS = { width: "100%", borderCollapse: "collapse", fontSize: 11 };
  const pageBreak = { pageBreakAfter: "always", breakAfter: "page" };
  return (
    <div style={{ fontFamily: "Times New Roman,serif", fontSize: 11, color: "#000", background: "#fff" }}>
      {/* PAGE 1 — Proces Verbal */}
      <div style={{ padding: "30px 40px", maxWidth: 800, margin: "0 auto", ...pageBreak }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: "bold" }}>PROCES VERBAL DE PREDARE –PRIMIRE</div>
          <div style={{ fontSize: 13, fontWeight: "bold", marginTop: 5 }}>Serie {pv.serie} nr. {pv.nr_pv} din data: {pv.data}</div>
        </div>
        <div style={{ marginBottom: 12, lineHeight: 1.6 }}>Incheiat intre:</div>
        <div style={{ marginBottom: 12, lineHeight: 1.6 }}>
          <strong>Societatea GREENKRAFT S.R.L.</strong> cu sediul in Soseaua de centura dreapta 18A, Afumați, inregistrata la Registrul Comertului sub nr. J23/2426/2016, CUI 36191378, reprezentata legal prin Catalin Zica, in calitate de <strong>COLECTOR/PRESTATOR</strong>,
        </div>
        <div style={{ textAlign: "center", margin: "8px 0" }}>și</div>
        <div style={{ marginBottom: 12, lineHeight: 1.6 }}>
          <strong>Societatea {pv.client_denumire?.toUpperCase()}</strong>, cu sediul social în {pv.client_adresa}, Judetul {pv.client_judet}, având Cod fiscal {pv.client_cui}, înregistrată la Oficiul National al Registrului Comertului sub nr. {pv.client_reg_com}, reprezentată de {pv.client_reprezentant || "_____"}, în calitate de <strong>BENEFICIAR</strong>,
        </div>
        <div style={{ marginBottom: 6 }}>Am procedat la predarea, respectiv la primirea urmatoarelor categorii de deseuri de ambalaje:</div>
        <div style={{ fontWeight: "bold", marginBottom: 4, paddingLeft: 10 }}>Denumire</div>
        <table style={tS}>
          <tbody>
            {pv.materiale?.filter(m => m.den).map((m, i) => (
              <tr key={i}>
                <td style={{ padding: "3px 8px", borderBottom: "1px dotted #999" }}>{m.den}</td>
                <td style={{ padding: "3px 8px", borderBottom: "1px dotted #999", textAlign: "right", whiteSpace: "nowrap" }}>{m.cant || 0} kg</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ margin: "16px 0", fontSize: 11 }}>Deseurile de ambalaje din prezentul proces verbal au fost predate cu titlu gratuit (nu se factureaza), in vederea colectarii si reciclarii /valorificarii.</div>
        <div style={{ display: "flex", justifyContent: "space-around", marginTop: 40, fontSize: 11 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: "bold" }}>Am predat,</div>
            <div style={{ fontWeight: "bold" }}>{pv.client_denumire?.toUpperCase()}</div>
            <div style={{ fontSize: 10, marginTop: 30 }}>(stampila si semnatura)</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: "bold" }}>Am primit,</div>
            <div style={{ fontWeight: "bold" }}>GREENKRAFT SRL</div>
            <div style={{ fontSize: 10, marginTop: 30 }}>(stampila si semnatura)</div>
          </div>
        </div>
      </div>

      {/* PAGE 2 — Anexa 3 */}
      <div style={{ padding: "30px 40px", maxWidth: 800, margin: "0 auto", pageBreakAfter: "always", breakAfter: "page" }}>
        <div style={{ textAlign: "center", marginBottom: 6 }}>Anexa 3 - Nr. {pv.nr_anexa} din data de {pv.data}</div>
        <div style={{ textAlign: "center", marginBottom: 14 }}>Formular de încărcare – descărcare deşeuri nepericuloase</div>
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #000", fontSize: 10 }}>
          <thead>
            <tr style={{ background: "#fff" }}>
              <th style={{ border: "1px solid #000", padding: 5, width: "22%" }}>Date de identificare transportator</th>
              <th style={{ border: "1px solid #000", padding: 5, width: "12%" }}>Data</th>
              <th style={{ border: "1px solid #000", padding: 5, width: "22%" }}>Caracteristici deşeuri</th>
              <th style={{ border: "1px solid #000", padding: 5, width: "12%" }}>Cantitate</th>
              <th style={{ border: "1px solid #000", padding: 5, width: "32%" }}>Date privind punctul de lucru*) unde se efectuează:</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #000", padding: 8, verticalAlign: "top", lineHeight: 1.6 }}>
                <div><u>Date identificare:</u></div>
                <div><strong>GREEN KRAFT S.R.L.</strong></div>
                <div style={{ marginTop: 8 }}><u>Delegat:</u></div>
                <div><strong>{pv.delegat}</strong></div>
                <div style={{ marginTop: 12 }}>Nr. de inmatriculare</div>
                <div><u>mijloc de transport:</u></div>
                <div><strong>{pv.nr_masina}</strong></div>
                <div style={{ marginTop: 12 }}>Număr licenţa de transport</div>
                <div><u>mărfuri nepericuloase:</u></div>
                <div>{pv.licenta || "nu e cazul"}</div>
                <div style={{ marginTop: 8, fontSize: 9 }}>Data expirare licenţă transport <u>mărfuri nepericuloase:</u></div>
                <div>{pv.licenta_exp || ""}</div>
                <div style={{ marginTop: 24 }}>Semnatura și stampila</div>
              </td>
              <td style={{ border: "1px solid #000", padding: 8, verticalAlign: "top" }}>
                <div><u>Încărcare:</u></div>
                <div><strong>{pv.data}</strong></div>
                <div style={{ marginTop: 50 }}><u>Descărcare:</u></div>
                <div><strong>{pv.data}</strong></div>
              </td>
              <td style={{ border: "1px solid #000", padding: 8, verticalAlign: "top", lineHeight: 1.4 }}>
                {pv.materiale?.filter(m => m.den && m.cant).map((m, i) => (
                  <div key={i} style={{ minHeight: 36, marginBottom: 6 }}>
                    <div>{m.den}</div>
                  </div>
                ))}
                <div style={{ marginTop: 30, textAlign: "center", fontWeight: "bold" }}><u>Descriere destinație:</u></div>
                {DESTINATII.map(d => (
                  <div key={d} style={{ fontSize: 10 }}>
                    {d} {pv.destinatie === d ? "●" : "○"}
                  </div>
                ))}
              </td>
              <td style={{ border: "1px solid #000", padding: 8, verticalAlign: "top", lineHeight: 1.4, fontWeight: "bold" }}>
                {pv.materiale?.filter(m => m.den && m.cant).map((m, i) => (
                  <div key={i} style={{ minHeight: 36, marginBottom: 6 }}>{m.cant} Kg</div>
                ))}
              </td>
              <td style={{ border: "1px solid #000", padding: 8, verticalAlign: "top", lineHeight: 1.6 }}>
                <div style={{ textAlign: "center", fontWeight: "bold" }}><u>ÎNCĂRCAREA</u></div>
                <div style={{ marginTop: 4 }}><u>Date de identificare expeditor:</u></div>
                <div style={{ fontWeight: "bold", fontStyle: "italic" }}>{pv.client_denumire?.toUpperCase()}</div>
                <div>{pv.adresa_incarcare || pv.client_adresa}</div>
                <div style={{ marginTop: 8 }}><u>Autorizație de mediu nr:</u></div>
                <div>{pv.client_autorizatie || ""}</div>
                <div><u>Dată expirare Autorizație Mediu:</u></div>
                <div>{pv.client_autorizatie_exp || ""}</div>
                <div style={{ textAlign: "center", marginTop: 8 }}>Semnatura și stampila</div>
                <div style={{ textAlign: "center", marginTop: 30, fontWeight: "bold" }}><u>DESCĂRCAREA</u></div>
                <div><u>Date identificare destinatar:</u></div>
                <div style={{ fontWeight: "bold", fontStyle: "italic" }}>GREEN KRAFT S.R.L.</div>
                <div><u>Autorizație de mediu număr:</u></div>
                <div style={{ marginTop: 8, fontWeight: "bold", textAlign: "center" }}>233 din 22.12.2021</div>
                <div style={{ marginTop: 8, fontSize: 9 }}>Data expirare Autorizație de Mediu:</div>
                <div style={{ fontWeight: "bold", textAlign: "center" }}>22.12.2026</div>
                <div style={{ textAlign: "center", marginTop: 18 }}>Semnatura și stampila</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Supabase realtime helper ──────────────────────────────────
function useSupaTable(tableName, setFn) {
  useEffect(() => {
    sb.from(tableName).select("*").order("created_at", { ascending: true })
      .then(({ data }) => { if (data) setFn(data); });
    const ch = sb.channel(`${tableName}-rt`)
      .on("postgres_changes", { event: "*", schema: "public", table: tableName },
        () => sb.from(tableName).select("*").order("created_at", { ascending: true })
          .then(({ data }) => { if (data) setFn(data); }))
      .subscribe();
    return () => sb.removeChannel(ch);
  }, []);
}

// ── Main App ──────────────────────────────────────────────────
export default function App() {
  const printRef = useRef();
  const regPrintRef = useRef();
  const scanInputRef = useRef();
  const pvPrintRef = useRef();
  const debounce = useRef({});

  // Debounced save to Supabase
  const dbSave = (table, id, changes) => {
    if (!id) return;
    const key = `${table}-${id}`;
    clearTimeout(debounce.current[key]);
    debounce.current[key] = setTimeout(async () => {
      await sb.from(table).update(changes).eq("id", id);
    }, 700);
  };

  // ── UI state ─────────────────────────────────────────────
  const [tab, setTab] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem("currentUser") || "");
  const [backupLoading, setBackupLoading] = useState(false);
  const [auditLog, setAuditLog] = useState([]);
  const [showAutMediu, setShowAutMediu] = useState(false);
  // ── Cantar (Dini Argeo via Web Serial) ────────────────────
  const [scalePort, setScalePort] = useState(null);
  const [scaleReading, setScaleReading] = useState(null);
  const [scaleRawLine, setScaleRawLine] = useState("");
  const [scaleError, setScaleError] = useState("");
  const scaleReaderRef = useRef(null);
  const scaleActiveRef = useRef(false);
  const [cantarLiveRows, setCantarLiveRows] = useState([]);
  const [, setLiveTick] = useState(0);
  const lastPushRef = useRef(0);
  const [printQueue, setPrintQueue] = useState([]);
  const [printServer, setPrintServer] = useState(() => localStorage.getItem("gk_print_server") === "1");
  const printedJobsRef = useRef(new Set());

  const parseScaleLine = (line) => {
    if (!line || !line.trim()) return null;
    const upper = line.toUpperCase();
    let stable = !/\bUS\b/.test(upper);
    if (/\bOL\b/.test(upper)) return { value: 0, stable: false, overload: true, raw: line };

    // METHOD 1: Dini Argeo comma format: "1,ST,-3560,PT 3560," or "ST,GS,0.000"
    // The weight follows a status keyword (ST/US/GS/NT)
    const stMatch = line.match(/\b(ST|US|GS|NT)\b[,\s]*([+-]?\s*\d+(?:[.,]\d+)?)/i);
    if (stMatch) {
      const val = parseFloat(stMatch[2].replace(/\s+/g, "").replace(",", "."));
      if (!isNaN(val)) return { value: val, stable, raw: line };
    }

    // METHOD 2: number followed by "kg"
    let m = line.match(/([+-]?\s*\d+(?:[.,]\d+)?)\s*kg/i);
    if (m) {
      const val = parseFloat(m[1].replace(/\s+/g, "").replace(",", "."));
      if (!isNaN(val)) return { value: val, stable, raw: line };
    }

    // METHOD 3: any number with decimal
    m = line.match(/([+-]?\d+[.,]\d+)/);
    if (m) {
      const val = parseFloat(m[1].replace(",", "."));
      if (!isNaN(val)) return { value: val, stable, raw: line };
    }

    return null;
  };

  const startScaleReader = async (port) => {
    const decoder = new TextDecoder();
    let buffer = "";
    scaleActiveRef.current = true;
    while (port.readable && scaleActiveRef.current) {
      let reader;
      try {
        reader = port.readable.getReader();
        scaleReaderRef.current = reader;
        while (scaleActiveRef.current) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value);
          const lines = buffer.split(/[\r\n]+/);
          if (lines.length > 1) {
            for (let i = 0; i < lines.length - 1; i++) {
              const raw = lines[i].trim();
              if (raw) setScaleRawLine(raw);
              const parsed = parseScaleLine(lines[i]);
              if (parsed) setScaleReading(parsed);
            }
            buffer = lines[lines.length - 1];
          }
        }
      } catch (e) {
        if (e.name !== "AbortError" && !scaleActiveRef.current) break;
      } finally {
        try { if (reader) reader.releaseLock(); } catch (e) {}
      }
      if (!scaleActiveRef.current) break;
    }
  };

  const connectScale = async () => {
    setScaleError("");
    try {
      if (!navigator.serial) {
        setScaleError("Browser-ul nu suportă cantar. Folosește Chrome sau Edge.");
        alert("Browser-ul nu suportă cantar. Folosește Chrome sau Edge.");
        return;
      }
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600, dataBits: 8, stopBits: 1, parity: "none" });
      setScalePort(port);
      startScaleReader(port);
      localStorage.setItem("scaleAutoConnect", "1");
    } catch (e) {
      if (e.name !== "NotFoundError") {
        setScaleError("Eroare: " + e.message);
        alert("Eroare conectare cantar: " + e.message);
      }
    }
  };

  // Non-blocking disconnect - UI updates immediately, cleanup happens async
  const disconnectScale = () => {
    const port = scalePort;
    const reader = scaleReaderRef.current;
    scaleActiveRef.current = false;
    scaleReaderRef.current = null;
    setScalePort(null);
    setScaleReading(null);
    setScaleRawLine("");
    localStorage.removeItem("scaleAutoConnect");
    // Cleanup in background, don't await
    (async () => {
      try { if (reader) await reader.cancel(); } catch (e) {}
      try { if (port) await port.close(); } catch (e) {}
    })();
  };

  // Auto-reconnect on page load if previously connected
  useEffect(() => {
    if (!navigator.serial || !localStorage.getItem("scaleAutoConnect")) return;
    (async () => {
      try {
        const ports = await navigator.serial.getPorts();
        if (ports.length > 0) {
          const port = ports[0];
          await port.open({ baudRate: 9600, dataBits: 8, stopBits: 1, parity: "none" });
          setScalePort(port);
          startScaleReader(port);
        }
      } catch (e) { console.warn("Scale auto-connect failed:", e); }
    })();
  }, []);

  const useScaleWeight = (callback) => {
    if (!scalePort) { alert("Cantarul nu e conectat. Click pe ⚖️ în header."); return; }
    if (!scaleReading) { alert("Aștept date de la cantar..."); return; }
    if (scaleReading.overload) { alert("Suprasarcină!"); return; }
    if (!scaleReading.stable) {
      if (!window.confirm(`Cântărire instabilă (${scaleReading.value} kg). Folosești această valoare?`)) return;
    }
    callback(scaleReading.value);
  };

  // ── Cantar Live Bridge: PC-ul cu cantarul publica greutatea in Supabase ──
  useEffect(() => {
    if (!scalePort || !scaleReading) return;
    const now = Date.now();
    if (now - lastPushRef.current < 1200) return; // max ~1 update/sec
    lastPushRef.current = now;
    sb.from("cantar_live").upsert({ id: 1, value: scaleReading.value, stable: !!scaleReading.stable, updated_at: new Date().toISOString() }).then(() => {});
  }, [scaleReading, scalePort]);

  // Tick pentru verificarea prospetimii (doar cand suntem in tab-ul cantar)
  useEffect(() => {
    if (tab !== "cantar") return;
    const iv = setInterval(() => setLiveTick((t) => t + 1), 4000);
    return () => clearInterval(iv);
  }, [tab]);

  const cantarLive = (() => {
    const r = cantarLiveRows[0];
    if (!r || !r.updated_at) return null;
    const age = Date.now() - new Date(r.updated_at).getTime();
    return { value: r.value, stable: r.stable, age, fresh: age < 30000 };
  })();

  const useLiveWeight = (callback) => {
    const r = cantarLiveRows[0];
    if (!r || !r.updated_at) { alert("Nu există date de la cântar."); return; }
    const age = Date.now() - new Date(r.updated_at).getTime();
    if (age > 30000) { alert(`Datele de la cântar sunt vechi (${Math.round(age / 1000)}s). Verifică dacă aplicația e deschisă pe calculatorul cu cântarul.`); return; }
    if (!r.stable) {
      if (!window.confirm(`Cântărire instabilă (${r.value} kg). Folosești această valoare?`)) return;
    }
    callback(r.value);
  };
  // ── Helper: confirmation dialog for deletes ──────────────
  const confirmDel = (what) => window.confirm(`⚠️ Sigur vrei să ștergi ${what}?\n\nAcțiunea NU poate fi anulată.`);
  // ── Helper: audit log ─────────────────────────────────────
  const logAction = async (action, entity, entityId, details = null) => {
    try {
      await sb.from("audit_log").insert({
        user_name: currentUser || "Anonim",
        action, entity,
        entity_id: String(entityId || ""),
        details
      });
    } catch (e) { console.warn("Audit log failed:", e); }
  };
  // ── Helper: backup all data ───────────────────────────────
  // ── Task-uri functions ──
  const addTask = async (text, scadenta = "", prioritate = "normal") => {
    if (!text || !text.trim()) return;
    try {
      const { error } = await sb.from("taskuri").insert({ text: text.trim(), scadenta, prioritate, done: false, creat_de: currentUser });
      if (error) alert("Eroare: " + error.message);
    } catch (e) { alert("Eroare: " + e.message); }
  };
  const toggleTask = async (id, done) => {
    try { await sb.from("taskuri").update({ done: !done }).eq("id", id); } catch (e) {}
  };
  const delTask = async (id) => {
    try { await sb.from("taskuri").delete().eq("id", id); } catch (e) {}
  };

  const generateBackup = async () => {
    setBackupLoading(true);
    try {
      const tables = ['registru', 'procese_verbale', 'cheltuieli', 'colectari', 'livrari', 'datorii', 'avansuri', 'contracte', 'furnizori_pf', 'furnizori_pj', 'salariati', 'stoc_manual', 'parole', 'declaratii', 'audit_log'];
      const backup = { version: 1, app: "greenkraft-app", timestamp: new Date().toISOString(), generated_by: currentUser || "Anonim" };
      for (const t of tables) {
        try { const { data } = await sb.from(t).select("*"); backup[t] = data || []; }
        catch (e) { backup[t] = { error: e.message }; }
      }
      const json = JSON.stringify(backup, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
      link.download = `backup_greenkraft_${ts}.json`;
      link.click();
      await logAction("backup", "system", "", { tables: tables.length });
    } catch (e) { alert("Eroare backup: " + e.message); }
    setBackupLoading(false);
  };
  // ── Load audit log ────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { data } = await sb.from("audit_log").select("*").order("created_at", { ascending: false }).limit(200);
      setAuditLog(data || []);
    })();
  }, [currentUser]);
  const [bordSubTab, setBordSubTab] = useState("editor");
  const [regPfMonth, setRegPfMonth] = useState("");
  const [regPfSearch, setRegPfSearch] = useState("");
  const [regPjMonth, setRegPjMonth] = useState("");
  const [regPjSearch, setRegPjSearch] = useState("");
  const [activeBord, setActiveBord] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [detSearch, setDetSearch] = useState("");
  const [detOpen, setDetOpen] = useState(false);
  const [stocFilter, setStocFilter] = useState("");
  const [showMisc, setShowMisc] = useState(false);
  const [newM, setNewM] = useState({ data: today(), tip: "intrare", produs: "", cod: "", cant: "", pu: "", sursa: "" });
  const [selSal, setSelSal] = useState(null);
  const [concF, setConcF] = useState({ luna: 0, zile: 1 });
  const [costAl, setCostAl] = useState(86100);
  const [calRows, setCalRows] = useState([
    { material: "Fier", pa: 0.9, pv: 1.15 }, { material: "Aluminiu", pa: 5.5, pv: 7.5 },
    { material: "Cupru", pa: 35, pv: 40 }, { material: "Baterii", pa: 2.3, pv: 2.8 }, { material: "Deee", pa: 1.1, pv: 1.6 },
  ].map((r) => calcRow(r, 86100)));
  const [datFilter, setDatFilter] = useState("");
  const [avTip, setAvTip] = useState("toate");
  const [avPers, setAvPers] = useState("");
  const [expandedAv, setExpandedAv] = useState(null); // id of expanded avans row
  const [ctSearch, setCtSearch] = useState("");
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [parolaCat, setParolaCat] = useState("toate");
  const [parolaSearch, setParolaSearch] = useState("");
  const [showParole, setShowParole] = useState({});
  const [parolaEdit, setParolaEdit] = useState(null);
  const [pfFilter, setPfFilter] = useState("");
  const [pjFilter, setPjFilter] = useState("");
  const [puncteModal, setPuncteModal] = useState(null); // { idx, adrese: [...] }
  const [matTipiceModal, setMatTipiceModal] = useState(null); // { idx, den, items: [{den,cod_art,min_kg,max_kg}] }
  // ── Filtre pentru Cheltuieli/Colectari/Livrari ───────────
  const [chSearch, setChSearch] = useState("");
  const [chCat, setChCat] = useState("");
  const [chAchitat, setChAchitat] = useState("");
  const [chAchDe, setChAchDe] = useState("");
  const [chMonth, setChMonth] = useState(() => { const d = new Date(); return `${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`; });
  const [colSearch, setColSearch] = useState("");
  const [colCat, setColCat] = useState("");
  const [colAgent, setColAgent] = useState("");
  const [colAchitat, setColAchitat] = useState("");
  const [colMonth, setColMonth] = useState(() => { const d = new Date(); return `${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`; });
  const [livSearch, setLivSearch] = useState("");
  const [livClient, setLivClient] = useState("");
  const [livMonth, setLivMonth] = useState(() => { const d = new Date(); return `${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`; });
  // ── Rapoarte state ────────────────────────────────────────
  const [rapDateStart, setRapDateStart] = useState("");
  const [rapDateEnd, setRapDateEnd] = useState("");
  const [rapLoading, setRapLoading] = useState(false);
  // ── Trasabilitate state ───────────────────────────────────
  const [trasFilter, setTrasFilter] = useState("");
  const [trasMonth, setTrasMonth] = useState("");
  const [trasMode, setTrasMode] = useState("all"); // all / assigned / unassigned
  const [trasCompany, setTrasCompany] = useState("");
  const [trasGenLoading, setTrasGenLoading] = useState(false);
  const [trasNrInreg, setTrasNrInreg] = useState("");
  const [trasContract, setTrasContract] = useState("");
  const [trasFactura, setTrasFactura] = useState("");
  const [pdfBundle, setPdfBundle] = useState({ borderouri: [], pvuri: [] });
  const pdfBundleRef = useRef();
  // ── Import/Export state ──
  const [impTarget, setImpTarget] = useState("");
  const [impLoading, setImpLoading] = useState(false);
  const [impResult, setImpResult] = useState(null);
  const impFileRef = useRef();
  const [cuiSearch, setCuiSearch] = useState("");
  const [cuiLoading, setCuiLoading] = useState(false);
  const [cuiResult, setCuiResult] = useState(null);
  const [cuiErr, setCuiErr] = useState("");
  // ── Print from Registru ───────────────────────────────────
  const [printBord, setPrintBord] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  // ── PV state ──────────────────────────────────────────────
  const [pvSubTab, setPvSubTab] = useState("editor");
  const [activePV, setActivePV] = useState(0);
  const [pvPreview, setPvPreview] = useState(false);
  const [pjSearchPV, setPjSearchPV] = useState("");
  const [pjOpenPV, setPjOpenPV] = useState(false);
  const [printPV, setPrintPV] = useState(null);

  // Borderouri (local only — saved to registru on submit)
  const newBord = (serie = "GK", reg = []) => ({
    serie, nr: getNextNr(serie, reg), data: today(),
    det: "", dom: "", ci_s: "", ci_n: "", ci_e: "", ci_v: "", cnp: "", trans: "Auto", sursa: "alte",
    produse: [{ den: "", cod: "", cod_art: "", cant: "", pret: "" }],
  });
  const [borderouri, setBorderouri] = useState([newBord()]);
  const b = borderouri[activeBord] || newBord();
  const setB = (fn) => setBorderouri((p) => { const n = [...p]; n[activeBord] = fn(n[activeBord]); return n; });
  const updB = (f, v) => setB((b) => f === "serie" ? { ...b, serie: v, nr: getNextNr(v, registru) } : { ...b, [f]: v });
  const lastRegLen = useRef(0);
  const updP = (i, f, v) => setB((b) => { const ps = [...b.produse]; ps[i] = { ...ps[i], [f]: v }; if (f === "den") { const fd = produseList.find((p) => p.den === v); if (fd) { ps[i].cod = fd.cod; ps[i].cod_art = fd.cod_art; } } return { ...b, produse: ps }; });
  const bTot = b.produse.reduce((s, p) => s + (parseFloat(p.cant) || 0) * (parseFloat(p.pret) || 0), 0);
  const bImp = Math.round(bTot * 0.1), bTax = Math.round(bTot * 0.02), bRest = bTot - bImp - bTax;

  // ── Supabase-backed data ──────────────────────────────────
  const [registru, setRegistru] = useState([]);

  // Auto-update nr borderou when registru loads (only for empty/fresh borderou)
  useEffect(() => {
    if (registru.length === lastRegLen.current) return;
    lastRegLen.current = registru.length;
    if (registru.length === 0) return;
    setBorderouri(prev => {
      const cur = prev[0];
      if (!cur) return prev;
      const isEmpty = !cur.det && !cur.cnp && (!cur.produse || cur.produse.every(pr => !pr.den && !pr.cant));
      if (!isEmpty) return prev;
      const nextNr = getNextNr(cur.serie, registru);
      if (cur.nr === nextNr) return prev;
      const n = [...prev];
      n[0] = { ...cur, nr: nextNr };
      return n;
    });
  }, [registru.length]);
  const [chRows, setChRows] = useState([]);
  const [colRows, setColRows] = useState([]);
  const [livRows, setLivRows] = useState([]);
  const [datRows, setDatRows] = useState([]);
  const [avRows, setAvRows] = useState([]);
  const [contracte, setContracte] = useState([]);
  const [pfList, setPfList] = useState([]);
  const [pjList, setPjList] = useState([]);
  const [parole, setParole] = useState([]);
  const [salRows, setSalRows] = useState([]);
  const [manMisc, setManMisc] = useState([]);
  const [pvList, setPvList] = useState([]);
  const [produseLista, setProduseLista] = useState([]);
  const [taskuri, setTaskuri] = useState([]);
  const [delegatiList, setDelegatiList] = useState([]);
  const [varSubTab, setVarSubTab] = useState("produse"); // produse | delegati
  const [ticheteList, setTicheteList] = useState([]);
  const [ticSubTab, setTicSubTab] = useState("nou"); // nou | deschise | registru
  const [ticFilter, setTicFilter] = useState("");
  const [ticLuna, setTicLuna] = useState("");
  const [ticTaraInput, setTicTaraInput] = useState({}); // { [id]: valoare }
  const [ticNou, setTicNou] = useState({ tip: "Intrare", prima: "plin", partener: "", partener_cui: "", client: "GREEN KRAFT SRL", transportator: "", nr_masina: "", sofer: "", material: "", greutate: "", factura: "", aviz: "", obs: "" });
  const [ticEdit, setTicEdit] = useState(null); // { id, nr_tichet, factura, aviz, brut_la, tara_la, ora_intrare, ora_iesire }

  useSupaTable("registru", setRegistru);
  useSupaTable("cheltuieli", setChRows);
  useSupaTable("colectari", setColRows);
  useSupaTable("livrari", setLivRows);
  useSupaTable("datorii", setDatRows);
  useSupaTable("avansuri", setAvRows);
  useSupaTable("contracte", setContracte);
  useSupaTable("furnizori_pf", setPfList);
  useSupaTable("furnizori_pj", setPjList);
  useSupaTable("salariati", setSalRows);
  useSupaTable("stoc_manual", setManMisc);
  useSupaTable("procese_verbale", setPvList);
  useSupaTable("produse", setProduseLista);
  useSupaTable("taskuri", setTaskuri);
  useSupaTable("delegati", setDelegatiList);
  useSupaTable("tichete_cantar", setTicheteList);
  useSupaTable("cantar_live", setCantarLiveRows);
  useSupaTable("print_queue", setPrintQueue);

  // Effective produse list: from DB if loaded, else fallback to hardcoded constant
  const produseList = produseLista.length > 0 ? produseLista : PRODUSE_LIST;
  const PRODUSE_DYN = produseList.map(p => p.den);

  // Parole — map utilizator → user
  useEffect(() => {
    sb.from("parole").select("*").order("created_at", { ascending: true })
      .then(({ data }) => { if (data) setParole(data.map((r) => ({ ...r, user: r.utilizator }))); });
    const ch = sb.channel("parole-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "parole" },
        () => sb.from("parole").select("*").order("created_at", { ascending: true })
          .then(({ data }) => { if (data) setParole(data.map((r) => ({ ...r, user: r.utilizator }))); }))
      .subscribe();
    return () => sb.removeChannel(ch);
  }, []);

  // ── CRUD helpers ─────────────────────────────────────────
  const mkUpd = (rows, setRows, table) => (i, f, v) => {
    setRows((p) => { const n = [...p]; n[i] = { ...n[i], [f]: v }; return n; });
    dbSave(table, rows[i]?.id, { [f]: v });
  };
  const mkDel = (setRows, table, label = "această înregistrare") => async (id) => {
    if (!confirmDel(label)) return;
    setRows((p) => p.filter((r) => r.id !== id));
    await sb.from(table).delete().eq("id", id);
    await logAction("delete", table, id);
  };

  // Cheltuieli
  const updCH = mkUpd(chRows, setChRows, "cheltuieli");
  const delCH = mkDel(setChRows, "cheltuieli", "această cheltuială");
  const addCH = async () => {
    const row = { data: today(), gk: "Deee", suma: "", cat: "Diverse", det: "", ach: "", ach_de: "", note: "" };
    const { data } = await sb.from("cheltuieli").insert(row).select();
    if (data) setChRows((p) => [...p, data[0]]);
  };

  // Colectari
  const updCOL = mkUpd(colRows, setColRows, "colectari");
  const delCOL = mkDel(setColRows, "colectari", "această colectare");
  const addCOL = async () => {
    const row = { data: today(), agent: "", furn: "", cat: "Curte", produs: "", cant: 0, pret: 0, ach: "", ach_de: "" };
    const { data } = await sb.from("colectari").insert(row).select();
    if (data) setColRows((p) => [...p, data[0]]);
  };

  // Livrari
  const updLIV = mkUpd(livRows, setLivRows, "livrari");
  const delLIV = mkDel(setLivRows, "livrari", "această livrare");
  const addLIV = async () => {
    const row = { data: today(), nr: "", client: "", produs: "", cant: 0, pret: 0, fact: "", inc: "", det: "" };
    const { data } = await sb.from("livrari").insert(row).select();
    if (data) setLivRows((p) => [...p, data[0]]);
  };

  // Datorii
  const updDAT = mkUpd(datRows, setDatRows, "datorii");
  const delDAT = mkDel(setDatRows, "datorii", "această datorie");
  const addDAT = async () => {
    const row = { data: today(), nume: "", suma: "", det: "" };
    const { data } = await sb.from("datorii").insert(row).select();
    if (data) setDatRows((p) => [...p, data[0]]);
  };

  // Avansuri
  const updAV = mkUpd(avRows, setAvRows, "avansuri");
  const delAV = mkDel(setAvRows, "avansuri", "acest avans/dividend");
  const addAV = async (tip) => {
    const row = { data: today(), catre: "", suma: "", tip, det: "", decont: [] };
    const { data } = await sb.from("avansuri").insert(row).select();
    if (data) setAvRows((p) => [...p, data[0]]);
  };
  // Decont items
  const addDecontItem = async (avansId) => {
    const av = avRows.find(a => a.id === avansId);
    if (!av) return;
    const newItem = { data: today(), suma: "", cat: "Marfă", det: "" };
    const newDecont = [...(av.decont || []), newItem];
    try {
      await sb.from("avansuri").update({ decont: newDecont }).eq("id", avansId);
      setAvRows(p => p.map(r => r.id === avansId ? { ...r, decont: newDecont } : r));
    } catch (e) { alert("Eroare: " + e.message); }
  };
  const updDecontItem = async (avansId, idx, field, value) => {
    const av = avRows.find(a => a.id === avansId);
    if (!av) return;
    const newDecont = [...(av.decont || [])];
    newDecont[idx] = { ...newDecont[idx], [field]: value };
    try {
      await sb.from("avansuri").update({ decont: newDecont }).eq("id", avansId);
      setAvRows(p => p.map(r => r.id === avansId ? { ...r, decont: newDecont } : r));
    } catch (e) { alert("Eroare: " + e.message); }
  };
  const delDecontItem = async (avansId, idx) => {
    if (!window.confirm("Ștergi această decontare?")) return;
    const av = avRows.find(a => a.id === avansId);
    if (!av) return;
    const newDecont = (av.decont || []).filter((_, i) => i !== idx);
    try {
      await sb.from("avansuri").update({ decont: newDecont }).eq("id", avansId);
      setAvRows(p => p.map(r => r.id === avansId ? { ...r, decont: newDecont } : r));
    } catch (e) { alert("Eroare: " + e.message); }
  };

  // Contracte
  const updCT = mkUpd(contracte, setContracte, "contracte");
  const delCT = mkDel(setContracte, "contracte", "acest contract");
  const addCT = async () => {
    const maxNr = contracte.reduce((m, r) => Math.max(m, parseInt(r.nr) || 0), 0);
    const row = { nr: String(maxNr + 1), companie: "", data: today(), detalii: "" };
    const { data } = await sb.from("contracte").insert(row).select();
    if (data) setContracte((p) => [...p, data[0]]);
  };

  // Furnizori PF
  const updPF = mkUpd(pfList, setPfList, "furnizori_pf");
  const delPF = mkDel(setPfList, "furnizori_pf", "această persoană fizică");
  const addPF = async () => {
    const codes = pfList.map((f) => parseInt(f.cod) || 0);
    const cod = String((codes.length ? Math.max(...codes) : 0) + 1).padStart(5, "0");
    const row = { cod, denumire: "", cod_fiscal: "", analitic: `401.${cod}`, tara: "RO", judet: "", adresa: "", reg_com: "", inf_supl: "" };
    const { data } = await sb.from("furnizori_pf").insert(row).select();
    if (data) setPfList((p) => [...p, data[0]]);
  };

  // Furnizori PJ
  const updPJ = mkUpd(pjList, setPjList, "furnizori_pj");
  const delPJ = mkDel(setPjList, "furnizori_pj", "această persoană juridică");
  const addPJ = async () => {
    const row = { cod: "", denumire: "", cod_fiscal: "", analitic: "", tara: "RO", judet: "B", adresa: "", cont_banca: "", banca: "", reg_com: "", grupa: "", tel: "" };
    const { data } = await sb.from("furnizori_pj").insert(row).select();
    if (data) setPjList((p) => [...p, data[0]]);
  };

  // Parole
  const updPAR = (i, f, v) => {
    setParole((p) => { const n = [...p]; n[i] = { ...n[i], [f]: v }; return n; });
    const id = parole[i]?.id;
    if (id) dbSave("parole", id, { [f === "user" ? "utilizator" : f]: v });
  };
  const delPAR = mkDel(setParole, "parole", "această parolă");
  const addPAR = async () => {
    const row = { platforma: "", cat: "Platformă", utilizator: "", parola: "", note: "" };
    const { data } = await sb.from("parole").insert(row).select();
    if (data) setParole((p) => [...p, { ...data[0], user: data[0].utilizator }]);
  };

  // Salariati
  const updSAL = (i, f, v) => {
    setSalRows((p) => { const n = [...p]; n[i] = { ...n[i], [f]: v }; return n; });
    dbSave("salariati", salRows[i]?.id, { [f]: v });
  };
  const delSAL = mkDel(setSalRows, "salariati", "acest salariat");
  const addSAL = async () => {
    const row = { nume: "Nume Nou", functie: "", net: 0, taxe: 0, co: 21, ef: 0, conc: [] };
    const { data } = await sb.from("salariati").insert(row).select();
    if (data) setSalRows((p) => [...p, data[0]]);
  };
  const delConc = async (si, ci) => {
    const row = salRows[si];
    const conc = row.conc.filter((_, j) => j !== ci);
    const ef = conc.reduce((s, x) => s + x.zile, 0);
    setSalRows((p) => { const n = [...p]; n[si] = { ...n[si], conc, ef }; return n; });
    await sb.from("salariati").update({ conc, ef }).eq("id", row.id);
  };
  const addConc = async (si) => {
    const row = salRows[si];
    const conc = [...row.conc, { luna: concF.luna, zile: parseInt(concF.zile) || 1 }];
    const ef = conc.reduce((s, x) => s + x.zile, 0);
    setSalRows((p) => { const n = [...p]; n[si] = { ...n[si], conc, ef }; return n; });
    await sb.from("salariati").update({ conc, ef }).eq("id", row.id);
    setSelSal(null);
  };

  // Stoc manual
  const delManMisc = mkDel(setManMisc, "stoc_manual", "această mișcare manuală");
  const addManMisc = async () => {
    if (!newM.produs || !newM.cant) return;
    const fd = produseList.find((p) => p.den === newM.produs);
    const row = { ...newM, cod: newM.cod || fd?.cod || "" };
    const { data } = await sb.from("stoc_manual").insert(row).select();
    if (data) setManMisc((p) => [...p, data[0]]);
    setNewM({ data: today(), tip: "intrare", produs: "", cod: "", cant: "", pu: "", sursa: "" });
  };

  // Salveaza borderou → registru
  const salveaza = async () => {
    const pr = b.produse.filter((p) => p.den && p.cant);
    if (!pr.length) { alert("Completați cel puțin un produs!"); return; }
    if (registru.some(x => x.serie === b.serie && String(x.nr) === String(b.nr))) { alert(`⚠️ Borderou ${b.serie} ${b.nr} există deja în Registru!`); return; }
    const newEntries = pr.map((p) => {
      const v = (parseFloat(p.cant) || 0) * (parseFloat(p.pret) || 0);
      const imp = Math.round(v * 0.1), tx = Math.round(v * 0.02);
      return { serie: b.serie, nr: b.nr, data: b.data, furnizor: b.det, adresa: b.dom, cnp: b.cnp, denumire: p.den.toUpperCase(), cantitate: parseFloat(p.cant) || 0, pu: parseFloat(p.pret) || 0, valoare: Math.round(v - imp - tx) };
    });
    const { data: ins, error } = await sb.from("registru").insert(newEntries).select();
    if (error) { alert("❌ Eroare salvare Borderou: " + error.message); return; }
    if (ins) setRegistru(p => [...p, ...ins]);
    alert(`✅ Borderou ${b.serie} ${b.nr} salvat!`);
    const updatedReg = [...registru, ...(ins || newEntries)];
    setBorderouri(p => { const n = [...p]; n[activeBord] = newBord(b.serie, updatedReg); return n; });
    setDetSearch("");
    setBordSubTab("registru");
  };

  const handlePrint = () => {
    const c = printRef.current.innerHTML;
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Borderou ${b.serie} ${b.nr}</title><style>body{margin:0;padding:16px;font-family:'Times New Roman',serif;}</style></head><body>${c}</body></html>`);
    w.document.close(); w.focus(); w.print();
  };

  // ── Tichete Cantar helpers ────────────────────────────────
  const oraAcum = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
  const timestampAcum = () => { const d = new Date(); return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`; };
  const getNextTichetNr = () => {
    const nrs = ticheteList.map((t) => parseInt(t.nr_tichet) || 0);
    return String((nrs.length ? Math.max(...nrs) : 0) + 1);
  };
  const salveazaTichet1 = async () => {
    if (!ticNou.partener) { alert("Completați furnizorul (cine aduce marfa)!"); return; }
    if (!ticNou.nr_masina) { alert("Completați nr. de înmatriculare!"); return; }
    if (!ticNou.greutate || parseFloat(ticNou.greutate) <= 0) { alert("Completați greutatea primei cântăriri!"); return; }
    const g = parseFloat(ticNou.greutate) || 0;
    const ePlin = ticNou.prima === "plin";
    const ts = timestampAcum();
    const row = {
      serie: "TC",
      nr_tichet: getNextTichetNr(),
      data: today(),
      ora_intrare: oraAcum(),
      ora_iesire: "",
      tip: ticNou.tip,
      partener: ticNou.partener,
      partener_cui: ticNou.partener_cui || "",
      client: ticNou.client || "GREEN KRAFT SRL",
      transportator: ticNou.transportator || "",
      nr_masina: ticNou.nr_masina.toUpperCase(),
      sofer: ticNou.sofer || "",
      material: ticNou.material || "",
      brut: ePlin ? g : null,
      tara: ePlin ? null : g,
      brut_la: ePlin ? ts : "",
      tara_la: ePlin ? "" : ts,
      net: null,
      status: "deschis",
      operator: currentUser || "",
      factura: ticNou.factura || "",
      aviz: ticNou.aviz || "",
      obs: ticNou.obs || "",
    };
    const { data, error } = await sb.from("tichete_cantar").insert(row).select();
    if (error) { alert("Eroare la salvare: " + error.message); return; }
    if (data) setTicheteList((p) => [...p, data[0]]);
    // Sofer nou? Il salvam automat in tabela delegati
    if (row.sofer && !delegatiList.some((d) => d.nume?.toLowerCase() === row.sofer.toLowerCase())) {
      const { data: dNou } = await sb.from("delegati").insert({ nume: row.sofer, ci_serie: "", ci_numar: "", cnp: "" }).select();
      if (dNou) setDelegatiList((p) => [...p, dNou[0]]);
    }
    logAction("Creare", "Tichet cântar", row.serie + " " + row.nr_tichet, `${row.tip} • ${row.partener} • ${ePlin ? "BRUT" : "TARA"} ${g} kg`);
    setTicNou({ tip: "Intrare", prima: "plin", partener: "", partener_cui: "", client: "GREEN KRAFT SRL", transportator: "", nr_masina: "", sofer: "", material: "", greutate: "", factura: "", aviz: "", obs: "" });
    setTicSubTab("deschise");
  };
  const inchideTichet = async (t) => {
    const v = parseFloat(ticTaraInput[t.id]);
    if (!v || v <= 0) { alert("Introduceți greutatea celei de-a doua cântăriri!"); return; }
    const areBrut = t.brut != null && t.brut !== "";
    const ts = timestampAcum();
    let brutV, taraV, upd;
    if (areBrut) {
      brutV = parseFloat(t.brut) || 0; taraV = v;
      if (taraV >= brutV) { alert(`TARA (${taraV} kg) trebuie să fie mai mică decât BRUT (${brutV} kg)!`); return; }
      upd = { tara: taraV, tara_la: ts };
    } else {
      taraV = parseFloat(t.tara) || 0; brutV = v;
      if (brutV <= taraV) { alert(`BRUT (${brutV} kg) trebuie să fie mai mare decât TARA (${taraV} kg)!`); return; }
      upd = { brut: brutV, brut_la: ts };
    }
    const netV = Math.round((brutV - taraV) * 100) / 100;
    upd = { ...upd, net: netV, ora_iesire: oraAcum(), status: "inchis" };
    const { error } = await sb.from("tichete_cantar").update(upd).eq("id", t.id);
    if (error) { alert("Eroare: " + error.message); return; }
    setTicheteList((p) => p.map((x) => (x.id === t.id ? { ...x, ...upd } : x)));
    logAction("Închidere", "Tichet cântar", t.serie + " " + t.nr_tichet, `NET ${netV} kg`);
    setTicTaraInput((p) => { const n = { ...p }; delete n[t.id]; return n; });
  };
  const delTichet = async (t) => {
    if (!confirmDel("acest tichet de cântar")) return;
    await sb.from("tichete_cantar").delete().eq("id", t.id);
    setTicheteList((p) => p.filter((x) => x.id !== t.id));
    logAction("Ștergere", "Tichet cântar", t.serie + " " + t.nr_tichet, `${t.partener}`);
  };
  const salveazaTicEdit = async () => {
    const upd = { factura: ticEdit.factura || "", aviz: ticEdit.aviz || "", brut_la: ticEdit.brut_la || "", tara_la: ticEdit.tara_la || "", ora_intrare: ticEdit.ora_intrare || "", ora_iesire: ticEdit.ora_iesire || "" };
    const { error } = await sb.from("tichete_cantar").update(upd).eq("id", ticEdit.id);
    if (error) { alert("Eroare: " + error.message); return; }
    setTicheteList((p) => p.map((x) => (x.id === ticEdit.id ? { ...x, ...upd } : x)));
    logAction("Editare", "Tichet cântar", "TC " + ticEdit.nr_tichet, "Factura/Aviz/Ore");
    setTicEdit(null);
  };
  const buildTichetHTML = (t) => {
    const cuiClient = (t.client || "GREEN KRAFT SRL").toUpperCase().includes("GREEN KRAFT") ? "36191378" : "";
    const cuiTransp = (() => { const tr = (t.transportator || "").toUpperCase(); if (!tr) return ""; if (tr.includes("GREEN KRAFT")) return "36191378"; const fj = pjList.find(x => x.denumire?.toUpperCase() === tr); return fj?.cod_fiscal || ""; })();
    const R = (lbl, val, lbl2, val2) => `<tr>
      <td style="padding:1.2mm 2.5mm;border:0.5px solid #bbb;background:#f4f4f4;font-weight:bold;width:22%;white-space:nowrap;">${lbl}</td>
      <td style="padding:1.2mm 2.5mm;border:0.5px solid #bbb;width:34%;">${val || "—"}</td>
      <td style="padding:1.2mm 2.5mm;border:0.5px solid #bbb;background:#f4f4f4;font-weight:bold;width:18%;white-space:nowrap;">${lbl2 || ""}</td>
      <td style="padding:1.2mm 2.5mm;border:0.5px solid #bbb;width:26%;">${lbl2 ? (val2 || "—") : ""}</td>
    </tr>`;
    const html = `
      <div style="font-family:Arial,sans-serif;font-size:9.5pt;color:#111;">
        <!-- Antet emitent -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1d6f42;padding-bottom:2mm;margin-bottom:2mm;">
          <div>
            <div style="font-size:13pt;font-weight:bold;color:#1d6f42;">GREEN KRAFT S.R.L.</div>
            <div style="font-size:8pt;line-height:1.5;">CUI: RO 36191378 • Reg. Com.: J23/2426/2016<br/>Șos. de Centura Dreapta nr. 18A, com. Afumați, Jud. Ilfov<br/>Autorizație de Mediu nr. 233/22.12.2021 (rev. 27.11.2025)</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:13pt;font-weight:bold;letter-spacing:0.5px;">TICHET DE CÂNTAR</div>
            <div style="font-size:12pt;font-weight:bold;margin-top:1mm;">Seria ${t.serie} Nr. ${t.nr_tichet}</div>
            <div style="font-size:9pt;margin-top:1mm;">Data: <b>${t.data}</b></div>
            <div style="font-size:9pt;font-weight:bold;color:${t.tip === "Intrare" ? "#1d6f42" : "#bf360c"};">${t.tip === "Intrare" ? "▼ INTRARE — Recepție deșeuri" : "▲ IEȘIRE — Livrare deșeuri"}</div>
          </div>
        </div>
        <!-- Date partener / transport -->
        <table style="width:100%;border-collapse:collapse;font-size:9pt;">
          ${R("Furnizor", "<b>" + (t.partener || "").toUpperCase() + "</b>", "CUI/CNP", t.partener_cui)}
          ${R("Client", "<b>" + (t.client || "GREEN KRAFT SRL").toUpperCase() + "</b>", "CUI", cuiClient)}
          ${R("Transportator", (t.transportator || "").toUpperCase(), "CUI", cuiTransp)}
          ${R("Nr. auto", "<b>" + (t.nr_masina || "") + "</b>", "Delegat", (t.sofer || "").toUpperCase())}
          ${R("Material / Deșeu", t.material, "Factura / Aviz", [t.factura, t.aviz].filter(Boolean).join(" / "))}
        </table>
        <!-- Cantariri -->
        <table style="width:100%;border-collapse:collapse;font-size:9.5pt;margin-top:2mm;">
          <tr style="background:#1d6f42;color:#fff;font-weight:bold;text-align:center;">
            <td style="padding:1.5mm;border:0.5px solid #1d6f42;width:25%;">Cântărire</td>
            <td style="padding:1.5mm;border:0.5px solid #1d6f42;width:30%;">Greutate</td>
            <td style="padding:1.5mm;border:0.5px solid #1d6f42;width:45%;">Data și ora cântăririi</td>
          </tr>
          <tr style="text-align:center;">
            <td style="padding:1.5mm;border:0.5px solid #bbb;font-weight:bold;">BRUT</td>
            <td style="padding:1.5mm;border:0.5px solid #bbb;font-size:10.5pt;">${t.brut != null ? fmt(t.brut) + " kg" : "—"}</td>
            <td style="padding:1.5mm;border:0.5px solid #bbb;">${t.brut_la || "—"}</td>
          </tr>
          <tr style="text-align:center;">
            <td style="padding:1.5mm;border:0.5px solid #bbb;font-weight:bold;">TARA</td>
            <td style="padding:1.5mm;border:0.5px solid #bbb;font-size:10.5pt;">${t.tara != null ? fmt(t.tara) + " kg" : "—"}</td>
            <td style="padding:1.5mm;border:0.5px solid #bbb;">${t.tara_la || "—"}</td>
          </tr>
          <tr style="text-align:center;background:#eef7f0;">
            <td style="padding:2mm;border:1.5px solid #1d6f42;font-weight:bold;font-size:10.5pt;">NET</td>
            <td style="padding:2mm;border:1.5px solid #1d6f42;font-weight:bold;font-size:13pt;" colspan="2">${t.net != null ? fmt(t.net) + " kg" : "—"}</td>
          </tr>
        </table>
        <!-- Identificare cantar -->
        <div style="font-size:8pt;color:#444;margin-top:2mm;border:0.5px solid #ccc;padding:1.2mm 2.5mm;background:#fafafa;">
          <b>Aparat de cântărit:</b> Dini Argeo DFW • Serie: 18360 • Tip cântărire: Statică • Clasa de exactitate: III • Locație: Șos. de Centura Dreapta nr. 18A, Afumați, IF
        </div>
        ${t.obs ? `<div style="font-size:8.5pt;margin-top:2mm;"><b>Observații:</b> ${t.obs}</div>` : ""}
        <!-- Semnatura + stampila -->
        <div style="display:flex;justify-content:flex-end;margin-top:1mm;font-size:9pt;">
          <div style="text-align:center;position:relative;width:62mm;height:34mm;">
            <div style="position:absolute;top:0;left:0;right:0;">Semnătura Operator,<br/><b>${t.operator || ""}</b></div>
            <img src="${window.location.origin}/stampila.png" onerror="this.style.display='none'" style="position:absolute;top:7mm;left:8mm;transform:rotate(-5deg);width:22mm;" />
            <img src="${window.location.origin}/semnatura-${(t.operator || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}.png" onerror="this.style.display='none'" style="position:absolute;bottom:3mm;right:2mm;height:14mm;max-width:30mm;object-fit:contain;" />
            <div style="position:absolute;bottom:0;left:0;right:0;">__________________</div>
          </div>
        </div>
      </div>`;
    return `<html><head><title>Tichet ${t.serie} ${t.nr_tichet}</title><style>html,body{margin:0;padding:0;} body{box-sizing:border-box;padding:4mm;max-width:150mm;} *{-webkit-print-color-adjust:exact !important;print-color-adjust:exact !important;} @page{size:A5 portrait;margin:5mm;} @media print{ body{page-break-after:avoid;} }</style></head><body>${html}<scr` + `ipt>window.onload=function(){setTimeout(function(){window.print();},300);};</scr` + `ipt></body></html>`;
  };
  const printTichet = (t) => {
    const w = window.open("", "_blank");
    w.document.write(buildTichetHTML(t));
    w.document.close(); w.focus();
  };
  const printTichetSilent = (t) => {
    // print prin iframe ascuns — functioneaza fara click (pt. coada de print de la birou)
    const fr = document.createElement("iframe");
    fr.style.position = "fixed"; fr.style.right = "-9999px"; fr.style.width = "1px"; fr.style.height = "1px";
    document.body.appendChild(fr);
    const doc = fr.contentWindow.document;
    doc.open();
    doc.write(buildTichetHTML(t).replace("window.print()", "parent.postMessage('gk-print-done','*'); window.print()"));
    doc.close();
    setTimeout(() => { try { document.body.removeChild(fr); } catch (e) {} }, 60000);
  };

  // ── Print Bridge: trimitere tichet la imprimanta de la birou ──
  const togglePrintServer = () => {
    const nv = !printServer;
    setPrintServer(nv);
    localStorage.setItem("gk_print_server", nv ? "1" : "0");
  };
  const trimiteLaPrint = async (t) => {
    const { error } = await sb.from("print_queue").insert({ tichet_id: t.id, status: "pending", requested_by: currentUser || "" });
    if (error) { alert("Eroare la trimitere: " + error.message); return; }
    alert(`🖨️ Tichetul TC #${t.nr_tichet} a fost trimis la imprimanta de la birou.`);
  };
  // Procesare coada: doar pe calculatorul marcat ca server de print
  useEffect(() => {
    if (!printServer) return;
    const pending = printQueue.filter((j) => j.status === "pending" && (Date.now() - new Date(j.created_at).getTime()) < 10 * 60 * 1000);
    pending.forEach(async (job, idx) => {
      if (printedJobsRef.current.has(job.id)) return;
      printedJobsRef.current.add(job.id);
      const t = ticheteList.find((x) => x.id === job.tichet_id);
      await sb.from("print_queue").update({ status: t ? "printed" : "error" }).eq("id", job.id);
      if (t) setTimeout(() => printTichetSilent(t), idx * 4000); // 4s intre joburi multiple
    });
  }, [printQueue, printServer, ticheteList]);

  // ── PV (Proces Verbal) helpers ────────────────────────────
  const newPV = (lst = [], serie = "A") => {
    const filtered = lst.filter(p => p.serie === serie);
    const defaults = { A: 837, PV: 6585, GK: 0 };
    const maxNr = filtered.length ? Math.max(...filtered.map(p => parseInt(p.nr_pv) || 0)) : (defaults[serie] ?? 0);
    return {
      serie,
      nr_pv: String(maxNr + 1),
      nr_anexa: String(maxNr + 1),
      data: today(),
      client_id: "",
      client_denumire: "",
      client_adresa: "",
      client_cui: "",
      client_reg_com: "",
      client_judet: "",
      client_reprezentant: "",
      client_autorizatie: "",
      client_autorizatie_exp: "",
      delegat: "Baltac Constantin",
      nr_masina: "",
      licenta: "nu e cazul",
      licenta_exp: "",
      destinatie: "Valorificare",
      materiale: [{ den: "", cod: "", cod_art: "", cant: "" }],
    };
  };
  const [pvBorderouri, setPvBorderouri] = useState([newPV()]);
  const pv = pvBorderouri[activePV] || newPV();
  const setPV = (fn) => setPvBorderouri((p) => { const n = [...p]; n[activePV] = fn(n[activePV]); return n; });
  const updPV = (f, v) => setPV((p) => {
    if (f === "nr_pv") return { ...p, nr_pv: v, nr_anexa: v };
    if (f === "serie") {
      const filtered = pvList.filter(x => x.serie === v);
      const defaults = { A: 837, PV: 6585, GK: 0 };
      const maxNr = filtered.length ? Math.max(...filtered.map(x => parseInt(x.nr_pv) || 0)) : (defaults[v] ?? 0);
      const nextNr = String(maxNr + 1);
      return { ...p, serie: v, nr_pv: nextNr, nr_anexa: nextNr };
    }
    return { ...p, [f]: v };
  });
  const updPVMat = (i, f, v) => setPV((p) => {
    const ms = [...p.materiale];
    ms[i] = { ...ms[i], [f]: v };
    if (f === "den") { const fd = produseList.find((x) => x.den === v); if (fd) { ms[i].cod = fd.cod; ms[i].cod_art = fd.cod_art; } }
    return { ...p, materiale: ms };
  });

  const pjFiltPV = pjList.filter((f) => !pjSearchPV ? true : (f.denumire?.toLowerCase().includes(pjSearchPV.toLowerCase()) || f.cod_fiscal?.includes(pjSearchPV) || f.cod?.includes(pjSearchPV)));
  const fillPjPV = (f) => {
    // Generare materiale automate din mat_tipice
    const tipice = f.mat_tipice || [];
    const materialeAuto = tipice.length > 0
      ? tipice.map((t) => {
          const minV = parseFloat(t.min_kg) || 0;
          const maxV = parseFloat(t.max_kg) || 0;
          const cant = minV >= maxV ? (minV || "") : Math.round(minV + Math.random() * (maxV - minV));
          return { den: t.den || "", cod: "", cod_art: t.cod_art || "", cant: cant ? String(cant) : "" };
        })
      : [{ den: "", cod: "", cod_art: "", cant: "" }];
    setPV((p) => ({
      ...p,
      client_id: f.cod || "",
      client_denumire: f.denumire || "",
      client_adresa: f.adresa || "",
      client_cui: f.cod_fiscal || "",
      client_reg_com: f.reg_com || "",
      client_judet: f.judet || "",
      adresa_incarcare: f.adresa || "",
      materiale: materialeAuto,
    }));
    setPjSearchPV(f.denumire);
    setPjOpenPV(false);
  };

  const salveazaPV = async () => {
    const mats = pv.materiale.filter((m) => m.den && m.cant);
    if (!mats.length) { alert("Completați cel puțin un material cu cantitate!"); return; }
    if (!pv.client_denumire) { alert("Selectați o firmă (Pers. Juridică)!"); return; }
    if (pvList.some(x => x.serie === pv.serie && String(x.nr_pv) === String(pv.nr_pv))) {
      alert(`⚠️ PV ${pv.serie} ${pv.nr_pv} există deja!`); return;
    }
    // Strip any "_" prefixed fields (UI-only state)
    const row = Object.fromEntries(Object.entries({ ...pv, materiale: mats }).filter(([k]) => !k.startsWith("_")));
    const { data: ins, error } = await sb.from("procese_verbale").insert(row).select();
    if (error) { alert("❌ Eroare salvare PV: " + error.message); return; }
    if (ins) setPvList(p => [...p, ins[0]]);
    alert(`✅ PV ${pv.serie} ${pv.nr_pv} salvat!`);
    setPvBorderouri(p => { const n = [...p]; n[activePV] = newPV([...pvList, ...(ins || [row])], pv.serie); return n; });
    setPjSearchPV("");
    setPvSubTab("registru");
  };

  const handlePrintPV = () => {
    setPrintPV(pv);
    setTimeout(() => {
      if (pvPrintRef.current) {
        const c = pvPrintRef.current.innerHTML;
        const w = window.open("", "_blank");
        w.document.write(`<html><head><title>PV ${pv.serie} ${pv.nr_pv}</title><style>body{margin:0;font-family:'Times New Roman',serif;}</style></head><body>${c}</body></html>`);
        w.document.close(); w.focus(); w.print();
      }
    }, 150);
  };

  const printRegistruPV = (id) => {
    const found = pvList.find((p) => p.id === id);
    if (!found) return;
    setPrintPV(found);
    setTimeout(() => {
      if (pvPrintRef.current) {
        const c = pvPrintRef.current.innerHTML;
        const w = window.open("", "_blank");
        w.document.write(`<html><head><title>PV ${found.serie} ${found.nr_pv}</title><style>body{margin:0;font-family:'Times New Roman',serif;}</style></head><body>${c}</body></html>`);
        w.document.close(); w.focus(); w.print();
      }
    }, 150);
  };

  const delPV = async (id) => {
    if (!confirmDel("acest PV")) return;
    setPvList(p => p.filter(x => x.id !== id));
    await sb.from("procese_verbale").delete().eq("id", id);
    await logAction("delete", "procese_verbale", id);
  };

  // ── Excel Export (Rapoarte) ───────────────────────────────
  const parseDateRO = (s) => {
    if (!s) return null;
    const m = String(s).match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2,4})/);
    if (!m) return null;
    const d = parseInt(m[1]), mo = parseInt(m[2]), y = parseInt(m[3]) < 100 ? 2000 + parseInt(m[3]) : parseInt(m[3]);
    return new Date(y, mo - 1, d);
  };
  // Sort an array by 'data' field ascending (oldest first → newest last)
  const sortByDateAsc = (arr) => [...arr].sort((a, b) => {
    const da = parseDateRO(a.data);
    const db = parseDateRO(b.data);
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return da - db;
  });
  const inRange = (dateStr) => {
    if (!rapDateStart && !rapDateEnd) return true;
    const d = parseDateRO(dateStr);
    if (!d) return true;
    if (rapDateStart) { const s = parseDateRO(rapDateStart); if (s && d < s) return false; }
    if (rapDateEnd) { const e = parseDateRO(rapDateEnd); if (e && d > e) return false; }
    return true;
  };

  const RAP_HEADERS = ["Serie borderou/PV", "NrBorderou/PV", "Data", "Furnizor", "Adresa", "CNP/CUI", "Denumire", "CodSAGA", "Cantitate", "PU", "CodFSaga", "Trasabilitate", "Nr NIR", "Denumire Deseu", "Impozit 10%", "Taxa Mediu 2%", "Valoare"];

  const buildPFRows = () => registru.filter(r => inRange(r.data)).map(r => {
    const cant = parseFloat(r.cantitate) || 0;
    const pu = parseFloat(r.pu) || 0;
    const v = cant * pu;
    const imp = Math.round(v * 0.1);
    const tax = Math.round(v * 0.02);
    const fd = produseList.find(p => p.den === r.denumire || p.den.toUpperCase() === r.denumire);
    const codSaga = fd?.cod_art || "";
    const denSaga = fd?.den || r.denumire || "";
    return [r.serie || "", r.nr || "", r.data || "", r.furnizor || "", r.adresa || "", r.cnp || "", denSaga, codSaga, cant, pu, "", "", "", r.denumire || "", imp, tax, parseFloat(r.valoare) || 0];
  });

  const buildPJRows = () => pvList.filter(p => inRange(p.data)).flatMap(p => {
    const mats = (p.materiale || []).filter(m => m.den);
    return mats.map(m => {
      const fd = produseList.find(x => x.den === m.den);
      const codSaga = m.cod_art || fd?.cod_art || "";
      const denSaga = fd?.den || m.den || "";
      return [p.serie || "", p.nr_pv || "", p.data || "", p.client_denumire || "", p.client_adresa || "", p.client_cui || "", denSaga, codSaga, parseFloat(m.cant) || 0, "", "", "", "", m.den || "", "", "", ""];
    });
  });

  const loadXLSX = async () => {
    if (window.XLSX) return window.XLSX;
    await new Promise((res) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      s.onload = res;
      document.head.appendChild(s);
    });
    return window.XLSX;
  };

  const exportExcel = async (type) => {
    setRapLoading(true);
    try {
      const XLSX = await loadXLSX();
      const wb = XLSX.utils.book_new();
      let fileName = "raport.xlsx";
      if (type === "pf" || type === "all") {
        const rows = buildPFRows();
        const ws = XLSX.utils.aoa_to_sheet([RAP_HEADERS, ...rows]);
        ws["!cols"] = RAP_HEADERS.map(h => ({ wch: Math.max(12, h.length + 2) }));
        XLSX.utils.book_append_sheet(wb, ws, "Registru PF");
        if (type === "pf") fileName = `raport_PF_${today().replace(/\./g, "-")}.xlsx`;
      }
      if (type === "pj" || type === "all") {
        const rows = buildPJRows();
        const ws = XLSX.utils.aoa_to_sheet([RAP_HEADERS, ...rows]);
        ws["!cols"] = RAP_HEADERS.map(h => ({ wch: Math.max(12, h.length + 2) }));
        XLSX.utils.book_append_sheet(wb, ws, "Registru PJ");
        if (type === "pj") fileName = `raport_PJ_${today().replace(/\./g, "-")}.xlsx`;
      }
      if (type === "all") fileName = `raport_complet_${today().replace(/\./g, "-")}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (e) { alert("Eroare export: " + e.message); }
    setRapLoading(false);
  };

  // ── Import/Export Schemas ────────────────────────────────
  const IMPORT_SCHEMAS = {
    registru_pf: {
      label: "📄 Registru PF (Borderouri)",
      table: "registru",
      color: "#1565c0",
      columns: [
        { excel: "Serie", field: "serie" },
        { excel: "Nr", field: "nr" },
        { excel: "Data", field: "data" },
        { excel: "Furnizor", field: "furnizor" },
        { excel: "Adresa", field: "adresa" },
        { excel: "CNP", field: "cnp" },
        { excel: "Denumire", field: "denumire" },
        { excel: "Cantitate (kg)", field: "cantitate", type: "number" },
        { excel: "Pret Unitar", field: "pu", type: "number" },
        { excel: "Trasabilitate", field: "trasabilitate" },
      ],
    },
    registru_pj: {
      label: "📋 Registru PJ (PV-uri)",
      table: "procese_verbale",
      color: "#e65100",
      isPV: true, // special handling - group by serie+nr
      columns: [
        { excel: "Serie", field: "serie" },
        { excel: "Nr PV", field: "nr_pv" },
        { excel: "Nr Anexa", field: "nr_anexa" },
        { excel: "Data", field: "data" },
        { excel: "Client Denumire", field: "client_denumire" },
        { excel: "Client CUI", field: "client_cui" },
        { excel: "Client Adresa", field: "client_adresa" },
        { excel: "Client Reg Com", field: "client_reg_com" },
        { excel: "Client Reprezentant", field: "client_reprezentant" },
        { excel: "Delegat", field: "delegat" },
        { excel: "Nr Masina", field: "nr_masina" },
        { excel: "Licenta", field: "licenta" },
        { excel: "Destinatie", field: "destinatie" },
        { excel: "Material Denumire", field: "_mat_den" },
        { excel: "Material Cod HG", field: "_mat_cod" },
        { excel: "Material Cod SAGA", field: "_mat_cod_art" },
        { excel: "Material Cantitate (kg)", field: "_mat_cant", type: "number" },
        { excel: "Trasabilitate", field: "trasabilitate" },
      ],
    },
    cheltuieli: {
      label: "💸 Cheltuieli",
      table: "cheltuieli",
      color: "#c62828",
      columns: [
        { excel: "Data", field: "data" },
        { excel: "GK/Deee", field: "gk" },
        { excel: "Total (lei)", field: "suma", type: "number" },
        { excel: "Categorie", field: "cat" },
        { excel: "Detalii", field: "det" },
        { excel: "Achitat", field: "ach" },
        { excel: "Achitat De", field: "ach_de" },
        { excel: "Note", field: "note" },
      ],
    },
    colectari: {
      label: "🚛 Colectări",
      table: "colectari",
      color: "#2e7d32",
      columns: [
        { excel: "Data", field: "data" },
        { excel: "Agent", field: "agent" },
        { excel: "Furnizor", field: "furn" },
        { excel: "Categorie", field: "cat" },
        { excel: "Produs", field: "produs" },
        { excel: "Cantitate (kg)", field: "cant", type: "number" },
        { excel: "Pret", field: "pret", type: "number" },
        { excel: "Achitat", field: "ach" },
        { excel: "Achitat De", field: "ach_de" },
      ],
    },
    livrari: {
      label: "📤 Livrări",
      table: "livrari",
      color: "#6a1b9a",
      columns: [
        { excel: "Data", field: "data" },
        { excel: "Nr", field: "nr" },
        { excel: "Client", field: "client" },
        { excel: "Produs", field: "produs" },
        { excel: "Cantitate (kg)", field: "cant", type: "number" },
        { excel: "Pret", field: "pret", type: "number" },
        { excel: "Facturat", field: "fact" },
        { excel: "Incasat", field: "inc" },
        { excel: "Detalii", field: "det" },
      ],
    },
  };

  // Export template (empty Excel with headers)
  const exportTemplate = async (key) => {
    const schema = IMPORT_SCHEMAS[key];
    if (!schema) return;
    try {
      const XLSX = await loadXLSX();
      const headers = schema.columns.map(c => c.excel);
      const ws = XLSX.utils.aoa_to_sheet([headers]);
      ws["!cols"] = headers.map(h => ({ wch: Math.max(12, h.length + 4) }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, schema.label.replace(/[^a-zA-Z0-9 ]/g, "").trim().slice(0, 30));
      XLSX.writeFile(wb, `Template_${key}_${today().replace(/\./g, "-")}.xlsx`);
    } catch (e) { alert("Eroare: " + e.message); }
  };

  // Import from Excel
  const importFromExcel = async (file, key) => {
    const schema = IMPORT_SCHEMAS[key];
    if (!schema) return;
    setImpLoading(true);
    setImpResult(null);
    try {
      const XLSX = await loadXLSX();
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array", cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval: "", raw: true });
      if (rows.length === 0) {
        setImpResult({ success: false, message: "Fișierul e gol sau nu are header valid." });
        setImpLoading(false);
        return;
      }

      // Helper: convert various date formats to DD.MM.YYYY
      const toDateRO = (val) => {
        if (val instanceof Date) {
          return `${String(val.getDate()).padStart(2,"0")}.${String(val.getMonth()+1).padStart(2,"0")}.${val.getFullYear()}`;
        }
        if (typeof val === "number" && val > 25000 && val < 100000) {
          // Excel serial number
          const d = new Date(Math.round((val - 25569) * 86400 * 1000));
          return `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`;
        }
        return String(val).trim();
      };

      const dateRe = /^\d{2}\.\d{2}\.\d{4}$/;
      const produseSet = new Set(produseList.map(p => p.den.toUpperCase()));

      // ── VALIDATION PASS ──
      const validationErrors = [];
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        // Skip totally empty rows
        const hasAny = Object.values(row).some(v => v !== "" && v !== null && v !== undefined);
        if (!hasAny) continue;

        for (const col of schema.columns) {
          let val = row[col.excel];
          if (val === undefined || val === "") continue;

          // Date validation
          if (col.field === "data") {
            const dStr = toDateRO(val);
            if (!dateRe.test(dStr)) {
              validationErrors.push(`Rândul ${i + 2} — coloana "${col.excel}": format invalid "${val}". Necesar: DD.MM.YYYY (ex: 15.05.2026)`);
            }
          }

          // Denumire validation (PF, PJ materiale, Colectari produs, Livrari produs)
          if ((col.field === "denumire" || col.field === "_mat_den" || col.field === "produs") && val) {
            const upper = String(val).toUpperCase().trim();
            if (!produseSet.has(upper)) {
              validationErrors.push(`Rândul ${i + 2} — denumire "${val}" nu există în lista de produse SAGA. Verifică ortografia.`);
            }
          }
        }
      }

      if (validationErrors.length > 0) {
        setImpResult({
          success: false,
          message: `❌ Import RESPINS — ${validationErrors.length} erori de validare. Corectează fișierul și încearcă din nou.`,
          errors: validationErrors.slice(0, 30)
        });
        setImpLoading(false);
        return;
      }

      // ── INSERT PASS ──
      let inserted = 0;
      let errors = [];

      if (schema.isPV) {
        // Special handling for PV - group rows by serie+nr_pv
        const pvMap = {};
        for (const row of rows) {
          const serie = row["Serie"] || "A";
          const nr = String(row["Nr PV"] || "").trim();
          if (!nr) continue;
          const key2 = `${serie}__${nr}`;
          if (!pvMap[key2]) {
            pvMap[key2] = {
              serie, nr_pv: nr,
              nr_anexa: String(row["Nr Anexa"] || nr).trim(),
              data: toDateRO(row["Data"]) || today(),
              client_denumire: String(row["Client Denumire"] || "").trim(),
              client_cui: String(row["Client CUI"] || "").trim(),
              client_adresa: String(row["Client Adresa"] || "").trim(),
              client_reg_com: String(row["Client Reg Com"] || "").trim(),
              client_reprezentant: String(row["Client Reprezentant"] || "").trim(),
              delegat: String(row["Delegat"] || "").trim(),
              nr_masina: String(row["Nr Masina"] || "").trim(),
              licenta: String(row["Licenta"] || "").trim(),
              destinatie: String(row["Destinatie"] || "Valorificare").trim(),
              trasabilitate: String(row["Trasabilitate"] || "").trim(),
              materiale: [],
            };
          }
          const matDen = row["Material Denumire"];
          if (matDen) {
            const denStr = String(matDen).trim();
            // Auto-fill Cod HG and Cod SAGA from produseList
            const fd = produseList.find(p => p.den.toUpperCase() === denStr.toUpperCase());
            pvMap[key2].materiale.push({
              den: fd?.den || denStr,
              cod: row["Material Cod HG"] || fd?.cod || "",
              cod_art: row["Material Cod SAGA"] || fd?.cod_art || "",
              cant: parseFloat(String(row["Material Cantitate (kg)"]).replace(/,/g, ".")) || 0,
            });
          }
        }
        for (const pv of Object.values(pvMap)) {
          try {
            const { error } = await sb.from(schema.table).insert(pv);
            if (error) errors.push(`PV ${pv.serie} #${pv.nr_pv}: ${error.message}`);
            else inserted++;
          } catch (e) { errors.push(`PV ${pv.serie} #${pv.nr_pv}: ${e.message}`); }
        }
      } else {
        // Standard row-by-row insert
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const record = {};
          let hasData = false;
          for (const col of schema.columns) {
            let val = row[col.excel];
            if (val === undefined || val === "") { record[col.field] = col.type === "number" ? 0 : ""; continue; }
            if (col.field === "data") {
              val = toDateRO(val);
            } else if (col.type === "number") {
              val = parseFloat(String(val).replace(/,/g, ".")) || 0;
            } else {
              val = String(val).trim();
            }
            record[col.field] = val;
            if (val !== "" && val !== 0) hasData = true;
          }
          if (!hasData) continue;

          // ── AUTO-CALCULATE VALOARE for Registru PF ──
          if (key === "registru_pf") {
            const cant = parseFloat(record.cantitate) || 0;
            const pu = parseFloat(record.pu) || 0;
            const v = cant * pu;
            const imp = Math.round(v * 0.1);
            const tx = Math.round(v * 0.02);
            record.valoare = Math.round(v - imp - tx);
          }

          try {
            const { error } = await sb.from(schema.table).insert(record);
            if (error) errors.push(`Rândul ${i + 2}: ${error.message}`);
            else inserted++;
          } catch (e) { errors.push(`Rândul ${i + 2}: ${e.message}`); }
        }
      }

      await logAction("import", schema.table, "", { count: inserted });
      setImpResult({
        success: errors.length === 0,
        message: `${errors.length === 0 ? "✅" : "⚠️"} Import finalizat: ${inserted} înregistrări adăugate.${errors.length ? ` ${errors.length} erori la inserare.` : ""}`,
        errors: errors.slice(0, 10)
      });
    } catch (e) {
      setImpResult({ success: false, message: "Eroare la citire fișier: " + e.message });
    }
    setImpLoading(false);
  };

  // ── Trasabilitate functions ──────────────────────────────
  // Combined entries (PF + PJ)
  const getTrasEntries = () => {
    const pfEntries = registru.map(r => ({
      type: "PF", id: r.id, refId: r.id, serie: r.serie, nr: r.nr, data: r.data,
      furnizor: r.furnizor || "", cui_cnp: r.cnp || "", denumire: r.denumire || "",
      cant: parseFloat(r.cantitate) || 0, trasabilitate: r.trasabilitate || ""
    }));
    const pjEntries = pvList.flatMap(p => {
      const mats = (p.materiale || []).filter(m => m.den);
      return mats.map((m, mi) => ({
        type: "PJ", id: `${p.id}__${mi}`, refId: p.id, matIndex: mi,
        serie: p.serie, nr: p.nr_pv, data: p.data,
        furnizor: p.client_denumire || "", cui_cnp: p.client_cui || "", denumire: m.den || "",
        cant: parseFloat(m.cant) || 0, trasabilitate: p.trasabilitate || ""
      }));
    });
    return [...pfEntries, ...pjEntries];
  };

  const updTrasabilitate = async (entry, value) => {
    if (entry.type === "PF") {
      setRegistru(p => p.map(r => r.id === entry.refId ? { ...r, trasabilitate: value } : r));
      await sb.from("registru").update({ trasabilitate: value }).eq("id", entry.refId);
    } else {
      setPvList(p => p.map(x => x.id === entry.refId ? { ...x, trasabilitate: value } : x));
      await sb.from("procese_verbale").update({ trasabilitate: value }).eq("id", entry.refId);
    }
  };

  const monthOf = (dateStr) => {
    const d = parseDateRO(dateStr);
    if (!d) return "";
    return `${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
  };

  const trasEntries = getTrasEntries();
  const trasCompanies = [...new Set(trasEntries.map(e => e.trasabilitate).filter(Boolean))].sort();
  const trasMonthsList = [...new Set(trasEntries.map(e => monthOf(e.data)).filter(Boolean))].sort();

  const trasFiltered = trasEntries.filter(e => {
    if (trasMode === "assigned" && !e.trasabilitate) return false;
    if (trasMode === "unassigned" && e.trasabilitate) return false;
    if (trasFilter && !(e.furnizor?.toLowerCase().includes(trasFilter.toLowerCase()) || e.trasabilitate?.toLowerCase().includes(trasFilter.toLowerCase()) || e.denumire?.toLowerCase().includes(trasFilter.toLowerCase()))) return false;
    if (trasMonth && monthOf(e.data) !== trasMonth) return false;
    return true;
  });

  const LUNI_RO = ["ianuarie","februarie","martie","aprilie","mai","iunie","iulie","august","septembrie","octombrie","noiembrie","decembrie"];

  // ── Generator: Anexa de raportare (PDF A4) ───────────────
  const generateAnexaRaportare = () => {
    if (!trasCompany) { alert("Selectează firma!"); return; }
    if (!trasMonth) { alert("Selectează luna!"); return; }
    // Include both PF and PJ entries
    const entries = trasEntries.filter(e => e.trasabilitate === trasCompany && monthOf(e.data) === trasMonth);
    if (!entries.length) { alert("Nicio înregistrare găsită pentru firma și luna selectată!"); return; }

    const [mm, yyyy] = trasMonth.split(".");
    const lunaText = LUNI_RO[parseInt(mm) - 1].charAt(0).toUpperCase() + LUNI_RO[parseInt(mm) - 1].slice(1);

    // Group by material
    const byMat = {};
    entries.forEach(e => {
      const key = e.denumire;
      if (!byMat[key]) byMat[key] = [];
      byMat[key].push(e);
    });

    // Build rows HTML
    let nrCrt = 1;
    let totalGen = 0;
    let rowsHTML = "";
    Object.entries(byMat).forEach(([matName, items]) => {
      // Short material name
      const codMatch = matName.match(/COD[:\s\-]*(\d{2}\s*\d{2}\s*\d{2})/);
      const matShort = codMatch
        ? matName.replace(/-?\s*COD[\s\S]*$/i, '').trim() + ' - ' + codMatch[1]
        : matName;
      let matTotal = 0;
      items.forEach(item => {
        rowsHTML += `<tr>
          <td style="border:1px solid #000;padding:3px 5px;text-align:center;">${nrCrt++}</td>
          <td style="border:1px solid #000;padding:3px 5px;">${item.furnizor}</td>
          <td style="border:1px solid #000;padding:3px 5px;font-family:monospace;">${item.cui_cnp}</td>
          <td style="border:1px solid #000;padding:3px 5px;">${matShort}</td>
          <td style="border:1px solid #000;padding:3px 5px;text-align:right;">${item.cant}</td>
          <td style="border:1px solid #000;padding:3px 5px;">${item.nr}/${item.data}</td>
        </tr>`;
        matTotal += item.cant;
      });
      // Subtotal row - only show total, no material name in name column
      rowsHTML += `<tr style="background:#eee;">
        <td style="border:1px solid #000;padding:3px 5px;"></td>
        <td style="border:1px solid #000;padding:3px 5px;font-weight:bold;text-align:right;" colspan="3">Subtotal ${matShort}</td>
        <td style="border:1px solid #000;padding:3px 5px;text-align:right;font-weight:bold;">${matTotal}</td>
        <td style="border:1px solid #000;padding:3px 5px;"></td>
      </tr>`;
      totalGen += matTotal;
    });
    // TOTAL row
    rowsHTML += `<tr style="background:#ddd;">
      <td colspan="4" style="border:1px solid #000;padding:5px;font-weight:bold;text-align:center;">TOTAL</td>
      <td style="border:1px solid #000;padding:5px;text-align:right;font-weight:bold;">${totalGen}</td>
      <td style="border:1px solid #000;padding:5px;"></td>
    </tr>`;

    const dataDoc = `31-${mm}-${String(yyyy).slice(-2)}`;

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Anexa raportare ${trasCompany} ${trasMonth}</title>
<style>
@page { size: A4 portrait; margin: 10mm; }
body { font-family: 'Times New Roman', serif; font-size: 9pt; margin: 0; padding: 0; color: #000; }
.container { padding: 5mm; }
table { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
th { border: 1px solid #000; padding: 4px 5px; background: #f0f0f0; font-weight: bold; }
</style></head>
<body>
<div class="container">
  <div style="text-align: right; font-weight: bold; font-size: 10pt; margin-bottom: 6px;">Anexa 4.1.A</div>
  <div style="text-align: center; font-weight: bold; font-size: 11pt; margin: 4px 0;">BORDEROU DE COLECTARE A DESEURILOR DE AMBALAJE DIN FLUX MUNICIPAL AL GREENKRAFT SRL</div>
  <div style="text-align: center; font-weight: bold; margin-bottom: 8px;">in luna ${lunaText} ${yyyy}</div>
  <div style="font-size: 8pt; margin-bottom: 8px;"><strong>Nota:</strong> cantitatile se raporteaza in kilograme</div>
  <table>
    <thead><tr>
      <th style="width: 30px;">Nr crt</th>
      <th>Nume si prenume / Firma</th>
      <th style="width: 95px;">CNP / CUI</th>
      <th style="width: 150px;">Tip material Deseu amb/Cod deseu *)</th>
      <th style="width: 70px;">Cantitate (kg)</th>
      <th style="width: 110px;">Nr si data document de colectare</th>
    </tr></thead>
    <tbody>${rowsHTML}</tbody>
  </table>
  <div style="font-size: 8pt; margin-top: 10px;"><strong>*) conf Anexa nr 2 din HG 856/2002 (Decizia 2014/955/UE)</strong></div>
  <div style="font-size: 8pt;"><strong>Din flux municipal = achizitie de la populatie</strong></div>
  <div style="font-size: 8pt;">Materialele compozite se incadreaza in functie de materialul preponderent</div>
  <div style="display: flex; justify-content: space-between; margin-top: 25px; font-size: 9pt;">
    <div>
      <div>${dataDoc}</div>
      <div style="margin-top: 4px;">Nume, Prenume, Functie</div>
      <div style="font-weight: bold;">MIHAI GANA</div>
      <div>Gestionar Depozit</div>
    </div>
    <div style="text-align: right;">Semnatura si stampila</div>
  </div>
</div>
</body></html>`;

    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  // ── Generator: Declaratia (PDF cu auto-increment) ────────
  const generateDeclaratia = async () => {
    if (!trasCompany) { alert("Selectează firma!"); return; }
    if (!trasMonth) { alert("Selectează luna!"); return; }
    const entries = trasEntries.filter(e => e.trasabilitate === trasCompany && monthOf(e.data) === trasMonth);
    if (!entries.length) { alert("Nicio înregistrare găsită!"); return; }

    setTrasGenLoading(true);
    try {
      // Group by material
      const byMat = {};
      entries.forEach(e => { byMat[e.denumire] = (byMat[e.denumire] || 0) + e.cant; });

      // Get next number from declaratii table
      const { data: maxData } = await sb.from("declaratii").select("numar").order("numar", { ascending: false }).limit(1);
      let nextNr = (maxData && maxData[0] && maxData[0].numar ? maxData[0].numar : (parseInt(trasNrInreg) || 0)) + 1;

      const [mm, yyyy] = trasMonth.split(".");
      const lunaText = LUNI_RO[parseInt(mm) - 1];
      const contract = trasContract || "ECO 17/01.07.2024";
      const factura = trasFactura || "GKF ____";
      const dataDecl = `31.${mm}.${yyyy}`;

      // Build one HTML with all declarations (page break between)
      let allDeclHTML = "";
      const insertsToSave = [];

      for (const [matName, totalCant] of Object.entries(byMat)) {
        const matCode = matName.match(/COD[:\s\-]*(\d{2}\s*\d{2}\s*\d{2})/);
        const matLine = matCode
          ? matName.replace(/-?\s*COD[\s\S]*$/i, '').trim().toUpperCase() + ` - COD ${matCode[1]}`
          : matName.toUpperCase();
        const nrInreg = `${nextNr}/${dataDecl}`;

        allDeclHTML += `<div style="page-break-after: always; padding: 20mm; font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6;">
  <div style="text-align: right; font-weight: bold;">Nr. Inregistrare ${nrInreg}</div>
  <br/><br/>
  <div style="text-align: center; font-weight: bold; font-size: 14pt; text-decoration: underline;">DECLARATIE PE PROPRIA RASPUNDERE</div>
  <br/><br/>
  <p style="text-align: justify; text-indent: 30px;">Subsemnatul <strong>ZICA ZISU CATALIN</strong>, in calitate de administrator al Societatii <strong>GREENKRAFT SRL</strong>, cu sediul in Afumati, Ilfov, inregistrata la Registrul Comertului J23/2426/2016 cod fiscal RO3619138, autorizatie de mediu nr. 233/22.12.2021, declar pe propria raspundere urmatoarele: <strong>${matLine}</strong> in cantitate de <strong>${totalCant} kg</strong>, generate de persoane fizice si/sau de persoane juridice de pe de teritoriul Romaniei, predate in luna ${lunaText} ${yyyy}, in baza contractului <strong>${contract}</strong>, conform factura/facturi <strong>${factura}</strong>, nu au mai fost si nu vor fi utilizate si/sau raportate la realizarea obiectivelor de valorificare si reciclare conf. Legii 249/2015 catre alti agenti economici, astfel cum sunt stabilite de legislatia in vigoare privind gestionarea ambalajelor si deseurilor de ambalaje.</p>
  <br/>
  <p style="text-align: justify; text-indent: 30px;">Prezenta declarație este data azi ${dataDecl}, pe propria raspundere, cunoscand ca falsul in declaratii, uzul de fals și înșelăciunea sunt sancționate de legislatia in vigoare cu pedeapsa cu închisoarea.</p>
  <br/><br/>
  <div style="font-weight: bold;">GREENKRAFT SRL</div>
  <div>Prin reprezentant legal/administrator</div>
  <div>Nume si Prenume <strong>ZICA ZISU CATALIN</strong></div>
  <br/><br/>
  <div>Semnatura (Stampila)</div>
  <div>..............................</div>
</div>`;

        insertsToSave.push({
          numar: nextNr,
          data: dataDecl,
          trasabilitate: trasCompany,
          material: matLine,
          cantitate: totalCant,
          luna: trasMonth,
          contract,
          factura
        });
        nextNr++;
      }

      // Save to DB
      await sb.from("declaratii").insert(insertsToSave);

      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Declaratie ${trasCompany} ${trasMonth}</title>
<style>@page { size: A4 portrait; margin: 0; } body { margin: 0; }</style>
</head><body>${allDeclHTML}</body></html>`;

      const w = window.open("", "_blank");
      w.document.write(html);
      w.document.close();
      w.focus();
      setTimeout(() => w.print(), 300);
    } catch (e) { alert("Eroare: " + e.message); }
    setTrasGenLoading(false);
  };

  // ── Generator: PDF Toate Documentele ────────────────────
  const generatePDFToate = () => {
    if (!trasCompany) { alert("Selectează firma!"); return; }
    if (!trasMonth) { alert("Selectează luna!"); return; }

    // Find unique PF borderouri and PJ PVs
    const pfKeys = new Set();
    trasEntries.filter(e => e.trasabilitate === trasCompany && monthOf(e.data) === trasMonth && e.type === "PF").forEach(e => pfKeys.add(`${e.serie}__${e.nr}`));
    const pjIds = new Set();
    trasEntries.filter(e => e.trasabilitate === trasCompany && monthOf(e.data) === trasMonth && e.type === "PJ").forEach(e => pjIds.add(e.refId));

    if (pfKeys.size === 0 && pjIds.size === 0) { alert("Nicio înregistrare găsită!"); return; }

    // Build borderou objects
    const bordList = [];
    pfKeys.forEach(key => {
      const [serie, nr] = key.split("__");
      const rows = registru.filter(r => r.serie === serie && String(r.nr) === String(nr));
      if (!rows.length) return;
      const first = rows[0];
      bordList.push({
        serie, nr,
        data: first.data || "",
        det: first.furnizor || "",
        dom: first.adresa || "",
        ci_s: "", ci_n: "", ci_e: "", ci_v: "",
        cnp: first.cnp || "",
        trans: "Auto",
        sursa: "alte",
        produse: rows.map(r => {
          const fd = produseList.find(p => p.den === r.denumire || p.den.toUpperCase() === r.denumire);
          return { den: r.denumire || "", cod: fd?.cod || "", cant: r.cantitate || "", pret: r.pu || "" };
        }),
      });
    });

    const pvDocs = [...pjIds].map(id => pvList.find(p => p.id === id)).filter(Boolean);

    // Set bundle state - components will render in hidden ref
    setPdfBundle({ borderouri: bordList, pvuri: pvDocs });

    setTimeout(() => {
      if (pdfBundleRef.current) {
        const c = pdfBundleRef.current.innerHTML;
        const w = window.open("", "_blank");
        w.document.write(`<html><head><title>Toate documentele - ${trasCompany} - ${trasMonth}</title><style>body{margin:0;padding:0;font-family:'Times New Roman',serif;} @page { size: A4; margin: 10mm; } @media print { .page-break-after { page-break-after: always; } }</style></head><body>${c}</body></html>`);
        w.document.close();
        w.focus();
        setTimeout(() => w.print(), 400);
      }
    }, 400);
  };

  // ── Print borderou din Registru ───────────────────────────
  const printRegistruBord = (serie, nr) => {
    const rows = registru.filter((r) => r.serie === serie && String(r.nr) === String(nr));
    if (!rows.length) return;
    const first = rows[0];
    const bord = {
      serie, nr,
      data: first.data || "",
      det: first.furnizor || "",
      dom: first.adresa || "",
      ci_s: "", ci_n: "", ci_e: "", ci_v: "",
      cnp: first.cnp || "",
      trans: "Auto",
      sursa: "alte",
      produse: rows.map((r) => {
        const fd = produseList.find((p) => p.den === r.denumire || p.den.toUpperCase() === r.denumire);
        return {
          den: r.denumire || "",
          cod: fd?.cod || "",
          cant: r.cantitate || "",
          pret: r.pu || "",
        };
      }),
    };
    setPrintBord(bord);
    setTimeout(() => {
      if (regPrintRef.current) {
        const c = regPrintRef.current.innerHTML;
        const w = window.open("", "_blank");
        w.document.write(`<html><head><title>Borderou ${serie} ${nr}</title><style>body{margin:0;padding:16px;font-family:'Times New Roman',serif;}</style></head><body>${c}</body></html>`);
        w.document.close(); w.focus(); w.print();
      }
    }, 150);
  };

  // ── Scanare Buletin ───────────────────────────────────────
  const scanBuletin = async (file) => {
    if (!file) return;
    setScanLoading(true);
    try {
      let base64, mediaType = "image/jpeg";

      if (file.type === "application/pdf") {
        if (!window.pdfjsLib) {
          await new Promise((res) => {
            const s = document.createElement("script");
            s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
            s.onload = res;
            document.head.appendChild(s);
          });
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        }
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
        base64 = canvas.toDataURL("image/jpeg", 0.85).split(",")[1];
      } else {
        base64 = await new Promise((res, rej) => {
          const img = new Image();
          const url = URL.createObjectURL(file);
          img.onload = () => {
            const maxW = 1024;
            const scale = Math.min(1, maxW / img.width);
            const canvas = document.createElement("canvas");
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            res(canvas.toDataURL("image/jpeg", 0.85).split(",")[1]);
          };
          img.onerror = () => rej(new Error("Eroare citire imagine"));
          img.src = url;
        });
      }

      const resp = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1000,
          messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            { type: "text", text: `Acesta este un buletin/carte de identitate românesc. Extrage datele și returnează DOAR JSON valid fără alt text:\n{"denumire":"Nume Prenume","cod_fiscal":"CNP 13 cifre","judet":"cod judet 2 litere","adresa":"adresa completa","reg_com":"seria+nr CI ex IF123456","inf_supl":"Eliberat de SPCLEP... - valabil DD.MM.YYYY"}` }
          ]}]
        })
      });
      const respText = await resp.text();
      if (!respText || respText.trim() === "") throw new Error("Raspuns gol - verifica ANTHROPIC_API_KEY in Vercel");
      let data;
      try { data = JSON.parse(respText); } catch { throw new Error("Raspuns invalid: " + respText.slice(0, 150)); }
      if (data.error) throw new Error(JSON.stringify(data.error));
      const text = data.content?.filter(c => c.type === "text").map(c => c.text).join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean.slice(clean.indexOf("{")));
      const codes = pfList.map(f => parseInt(f.cod) || 0);
      const cod = String((codes.length ? Math.max(...codes) : 0) + 1).padStart(5, "0");
      const row = { cod, denumire: parsed.denumire || "", cod_fiscal: parsed.cod_fiscal || "", analitic: `401.${cod}`, tara: "RO", judet: parsed.judet || "", adresa: parsed.adresa || "", reg_com: parsed.reg_com || "", inf_supl: parsed.inf_supl || "" };
      const { data: ins } = await sb.from("furnizori_pf").insert(row).select();
      if (ins) { setPfList(p => [...p, ins[0]]); alert(`✅ ${parsed.denumire} adăugat cu succes!`); }
    } catch (e) { alert("Eroare la scanare: " + e.message); }
    setScanLoading(false);
  };

  // CUI search
  const searchCUI = async () => {
    const cui = cuiSearch.replace(/\D/g, "");
    if (!cui || cui.length < 4) { setCuiErr("CUI invalid."); return; }
    setCuiLoading(true); setCuiResult(null); setCuiErr("");
    try {
      const resp = await fetch("/api/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 800, tools: [{ type: "web_search_20250305", name: "web_search" }], messages: [{ role: "user", content: `Cauta pe termene.ro firma cu CUI ${cui} Romania. Returneaza DOAR JSON: {"denumire":"","cod_fiscal":"RO${cui}","adresa":"","reg_com":"","judet":"","tel":""}` }] }) });
      const data = await resp.json();
      if (data.error) throw new Error(JSON.stringify(data.error));
      const text = data.content?.filter((c) => c.type === "text").map((c) => c.text).join("") || "";
      try { const m = text.match(/\{[\s\S]*\}/); if (m) setCuiResult(JSON.parse(m[0])); else setCuiErr("Nu am găsit date pentru CUI-ul " + cui + "."); }
      catch (er) { setCuiErr("Eroare parsare: " + er.message); }
    } catch (e) { setCuiErr("Eroare: " + e.message); }
    setCuiLoading(false);
  };
  const importCUI = async () => {
    if (!cuiResult) return;
    const codes = pjList.map((f) => parseInt(f.cod) || 0);
    const cod = String((codes.length ? Math.max(...codes) : 0) + 1).padStart(5, "0");
    const row = { cod, denumire: cuiResult.denumire || "", cod_fiscal: cuiResult.cod_fiscal || "RO" + cuiSearch.replace(/\D/g, ""), analitic: `401.${cod}`, tara: "RO", judet: cuiResult.judet || "", adresa: cuiResult.adresa || "", cont_banca: "", banca: "", reg_com: cuiResult.reg_com || "", grupa: "", tel: cuiResult.tel || "" };
    const { data } = await sb.from("furnizori_pj").insert(row).select();
    if (data) setPjList((p) => [...p, data[0]]);
    setCuiResult(null); setCuiSearch("");
  };

  // Detinator fill from PF list
  const detFiltered = pfList.filter((f) => !detSearch ? true : (f.denumire?.toLowerCase().includes(detSearch.toLowerCase()) || f.cod_fiscal?.includes(detSearch) || f.cod?.includes(detSearch)));
  const fillDet = (f) => {
    setB((b) => ({ ...b, det: f.denumire, dom: f.adresa, ci_s: f.reg_com?.slice(0, 2) || "", ci_n: f.reg_com?.slice(2) || "", ci_e: f.inf_supl?.split("-")[0]?.trim() || "", ci_v: f.inf_supl?.split("-").slice(1).join("-").trim() || "", cnp: f.cod_fiscal || "" }));
    setDetSearch(f.denumire); setDetOpen(false);
  };

  // Stoc computed
  const getMiscari = () => {
    const r = [];
    colRows.forEach((x, i) => { if (!x.produs || !x.cant) return; const fd = produseList.find((p) => p.den === x.produs); r.push({ id: `col-${i}`, data: x.data, tip: "intrare", produs: x.produs, cod: fd?.cod || "", cod_art: fd?.cod_art || "", cant: parseFloat(x.cant) || 0, pu: parseFloat(x.pret) || 0, sursa: `Colectare${x.agent ? " - " + x.agent : ""}` }); });
    registru.forEach((x, i) => { if (!x.denumire || !x.cantitate) return; const fd = produseList.find((p) => p.den === x.denumire || p.den.toUpperCase() === x.denumire); r.push({ id: `bord-${i}`, data: x.data, tip: "intrare", produs: x.denumire, cod: fd?.cod || "", cod_art: fd?.cod_art || "", cant: parseFloat(x.cantitate) || 0, pu: parseFloat(x.pu) || 0, sursa: `Borderou ${x.serie} ${x.nr} - ${x.furnizor}` }); });
    livRows.forEach((x, i) => { if (!x.produs || !x.cant) return; const fd = produseList.find((p) => p.den === x.produs); r.push({ id: `liv-${i}`, data: x.data, tip: "iesire", produs: x.produs, cod: fd?.cod || "", cod_art: fd?.cod_art || "", cant: parseFloat(x.cant) || 0, pu: parseFloat(x.pret) || 0, sursa: `Livrare ${x.client || ""} ${x.nr ? "nr." + x.nr : ""}`.trim() }); });
    manMisc.forEach((m) => r.push(m));
    return r;
  };
  const miscari = getMiscari();
  const stocAg = calcStoc(miscari);
  const stocFilt = stocAg.filter((r) => !stocFilter || r.produs.toLowerCase().includes(stocFilter.toLowerCase()) || r.cod.includes(stocFilter));
  const totStocVal = stocAg.reduce((s, r) => s + Math.max(0, r.cant) * r.pm, 0);
  const totStocKg = stocAg.reduce((s, r) => s + Math.max(0, r.cant), 0);

  // Calculator
  const updCost = (v) => { const c = parseFloat(v) || 0; setCostAl(v); setCalRows((p) => p.map((r) => calcRow(r, c))); };
  const updCal = (i, f, v) => setCalRows((p) => { const n = [...p]; const u = { ...n[i], [f]: v }; const pa = parseFloat(u.pa) || 0, pv = parseFloat(u.pv) || 0, cost = parseFloat(u.cost) || 0; u.marja = pv && pa ? +(pv - pa).toFixed(4) : 0; u.cant = u.marja > 0 ? +(cost / u.marja).toFixed(2) : 0; n[i] = u; return n; });

  // Datorii computed
  const numeUnici = [...new Set(datRows.map((r) => r.nume))];
  const filtDat = sortByDateAsc(datRows.filter((r) => !datFilter || r.nume === datFilter));
  const totDat = filtDat.reduce((s, r) => s + (parseSuma(r.suma) || 0), 0);
  const totDatAll = datRows.reduce((s, r) => s + (parseSuma(r.suma) || 0), 0);

  // Avansuri computed
  const filtAv = sortByDateAsc(avRows.filter((r) => (avTip === "toate" || r.tip === avTip) && (!avPers || r.catre === avPers)));
  const totAvans = avRows.filter((r) => r.tip === "avans").reduce((s, r) => s + (parseSuma(r.suma) || 0), 0);
  const totDiv = avRows.filter((r) => r.tip === "dividend").reduce((s, r) => s + (parseSuma(r.suma) || 0), 0);
  const persList = [...new Set(avRows.map((r) => r.catre).filter(Boolean))];

  // Contracte computed
  const filtCT = sortByDateAsc(contracte.filter((r) => !ctSearch || r.companie?.toLowerCase().includes(ctSearch.toLowerCase()) || r.nr?.includes(ctSearch) || r.detalii?.toLowerCase().includes(ctSearch.toLowerCase())));

  // Parole computed
  const filtParole = parole.filter((r) => {
    if (parolaCat !== "toate" && r.cat !== parolaCat) return false;
    if (parolaSearch && !(r.platforma?.toLowerCase().includes(parolaSearch.toLowerCase()) || r.user?.toLowerCase().includes(parolaSearch.toLowerCase()) || r.note?.toLowerCase().includes(parolaSearch.toLowerCase()))) return false;
    return true;
  });

  // PIN
  const checkPin = (pin) => {
    if (pin === PIN_CORRECT) { setPinUnlocked(true); setPinError(false); setPinInput(""); }
    else { setPinError(true); setPinInput(""); setTimeout(() => setPinError(false), 1500); }
  };

  // ── Dynamic option lists (predefined + values used) ────────
  const agentOptions = [...new Set([...AGENTI, ...colRows.map(r => r.agent).filter(Boolean)])].sort();
  const furnOptions = [...new Set(colRows.map(r => r.furn).filter(Boolean))].sort();
  const achitatOptions = [...new Set([...ACHITAT_DE_OPT, ...colRows.map(r => r.ach_de).filter(Boolean), ...chRows.map(r => r.ach_de).filter(Boolean)])].sort();
  const clientOptions = [...new Set([...CLIENTI, ...livRows.map(r => r.client).filter(Boolean)])].sort();

  // ── Render helpers ────────────────────────────────────────
  const tabSt = (name) => ({ padding: "7px 13px", cursor: "pointer", border: "none", fontWeight: 600, fontSize: 12, borderBottom: tab === name ? `3px solid ${G}` : "3px solid transparent", background: tab === name ? "#fff" : "#e8f0eb", color: tab === name ? G : "#555", borderRadius: "6px 6px 0 0", marginRight: 2, whiteSpace: "nowrap" });
  const subTabSt = (name) => ({ padding: "5px 13px", cursor: "pointer", border: "none", fontWeight: 600, fontSize: 12, borderBottom: bordSubTab === name ? `2px solid ${G}` : "2px solid transparent", background: bordSubTab === name ? "#f0faf4" : "transparent", color: bordSubTab === name ? G : "#666", marginRight: 3 });
  const SC = ({ label, value, c, bg }) => (<div style={{ flex: 1, minWidth: 120, background: bg, border: `1px solid ${c}33`, borderRadius: 8, padding: "7px 12px" }}><div style={{ fontSize: 10, color: "#666", marginBottom: 1 }}>{label}</div><div style={{ fontSize: 14, fontWeight: 700, color: c }}>{value}</div></div>);
  const AddBtn = ({ onClick, label, color = G }) => (<button onClick={onClick} style={{ marginTop: 10, background: color, color: "#fff", border: "none", borderRadius: 6, padding: "7px 15px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{label}</button>);
  const IBox = (label, f, ph = "") => (<div style={{ marginBottom: 7 }}><label style={LSt}>{label}</label><input style={IFS} value={b[f] || ""} onChange={(e) => updB(f, e.target.value)} placeholder={ph} /></div>);
  const regCols = [{ k: "serie", l: "Serie", w: 45 }, { k: "nr", l: "Nr", w: 65 }, { k: "data", l: "Data", w: 85 }, { k: "furnizor", l: "Furnizor", w: 150 }, { k: "cnp", l: "CNP", w: 110 }, { k: "denumire", l: "Denumire Deseu", w: 180 }, { k: "cantitate", l: "Cant.(kg)", w: 75 }, { k: "pu", l: "PU", w: 50 }, { k: "valoare", l: "Valoare", w: 65 }];

  // Group registru rows by serie+nr for print button display
  const bordGroupKeys = [...new Set(registru.map((r) => `${r.serie}__${r.nr}`))];

  return (
    <div style={{ fontFamily: "Segoe UI,sans-serif", background: "#f0f4f0", minHeight: "100vh", padding: 12 }}>

      {/* Login Modal — appears if no user selected */}
      {!currentUser && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999999 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 32, maxWidth: 380, width: "90%", boxShadow: "0 10px 40px rgba(0,0,0,0.3)", textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 8 }}>
              <span style={{ fontSize: 26, fontWeight: 900, color: G, letterSpacing: -0.5 }}>Green</span>
              <span style={{ fontSize: 26, fontWeight: 900, color: "#4caf50", letterSpacing: -0.5 }}>kraft</span>
            </div>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 24 }}>Cine ești?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["Catalin", "Alexandru", "Mihai"].map(u => (
                <button key={u} onClick={() => { setCurrentUser(u); localStorage.setItem("currentUser", u); }} style={{ background: `linear-gradient(135deg,${G},#43a047)`, color: "#fff", border: "none", borderRadius: 8, padding: "12px 20px", cursor: "pointer", fontSize: 15, fontWeight: 700, transition: "transform .1s" }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.03)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                >👤 {u}</button>
              ))}
            </div>
            <div style={{ marginTop: 16, fontSize: 10, color: "#aaa" }}>Modificările tale vor fi înregistrate în istoric</div>
          </div>
        </div>
      )}

      {/* Hidden div for registru print */}
      <div ref={regPrintRef} style={{ display: "none" }}>
        {printBord && <BordPrint b={printBord} />}
      </div>

      {/* Hidden div for PV print */}
      <div ref={pvPrintRef} style={{ display: "none" }}>
        {(printPV || pv) && <PVPrint pv={printPV || pv} />}
      </div>

      {/* Hidden div for PDF bundle (toate documentele) */}
      <div ref={pdfBundleRef} style={{ display: "none" }}>
        {pdfBundle.borderouri.map((b, i) => (
          <div key={`b-${i}`} style={{ pageBreakAfter: "always" }}>
            <BordPrint b={b} />
          </div>
        ))}
        {pdfBundle.pvuri.map((p, i) => (
          <div key={`p-${i}`}>
            <PVPrint pv={p} />
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,#1b5e20,${G},#2e7d32)`, color: "#fff", borderRadius: "10px 10px 0 0", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: "#e8f5e9", letterSpacing: -0.5 }}>Green</span>
            <span style={{ fontSize: 22, fontWeight: 900, color: "#4caf50", letterSpacing: -0.5 }}>kraft</span>
          </div>
          <div style={{ borderLeft: "1px solid rgba(255,255,255,0.2)", paddingLeft: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9 }}>Tablou de Bord</div>
            <div style={{ fontSize: 10, opacity: 0.65 }}>S.C. GREEN KRAFT S.R.L. • CUI: 36191378</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 6, fontSize: 11, opacity: 0.8 }}><span>📍 Afumați, Jud. Ilfov</span><span onClick={() => setShowAutMediu(true)} title="Deschide Autorizația de Mediu" style={{ cursor: "pointer", textDecoration: "underline dotted", textUnderlineOffset: 3 }}>📋 Aut. Mediu: 233/22.12.2021</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.15)", borderRadius: 6, padding: "4px 10px" }}>
            <span style={{ fontSize: 11 }}>👤</span>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{currentUser || "—"}</span>
            <button onClick={() => { if (window.confirm("Schimbi user-ul?")) { localStorage.removeItem("currentUser"); setCurrentUser(""); } }} title="Schimbă user" style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontSize: 10, marginLeft: 4, opacity: 0.7 }}>🔄</button>
          </div>
          <button onClick={generateBackup} disabled={backupLoading} title="Descarcă backup JSON" style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 6, padding: "4px 10px", cursor: backupLoading ? "wait" : "pointer", fontSize: 11, fontWeight: 600 }}>{backupLoading ? "⏳" : "💾 Backup"}</button>
        </div>
      </div>

      {/* Modal Autorizatie Mediu */}
      {showAutMediu && (
        <div onClick={() => setShowAutMediu(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 10, width: "min(96vw,900px)", height: "min(96vh,850px)", display: "flex", flexDirection: "column", boxShadow: "0 8px 40px rgba(0,0,0,0.4)", overflow: "hidden" }}>
            <div style={{ background: `linear-gradient(135deg,#1b5e20,${G})`, color: "#fff", padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>📋 Autorizație de Mediu nr. 233/22.12.2021</div>
                <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>GREEN KRAFT S.R.L. • Revizuire (3) la data de 27.11.2025</div>
              </div>
              <button onClick={() => setShowAutMediu(false)} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)", color: "#fff", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>✕</button>
            </div>
            <iframe
              src="/autorizatie-mediu.pdf"
              title="Autorizatie Mediu"
              style={{ flex: 1, border: "none", width: "100%" }}
            />
            <div style={{ padding: "8px 18px", background: "#f5f5f5", borderTop: "1px solid #ddd", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: "#666", flexShrink: 0 }}>
              <span>Directia Judeteana de Mediu Ilfov • Emisa: 22.12.2021</span>
              <a href="/autorizatie-mediu.pdf" download="Autorizatie_Mediu_233_GreenKraft_2025.pdf" style={{ color: G, fontWeight: 600, textDecoration: "none", fontSize: 12 }}>⬇️ Descarcă PDF</a>
            </div>
          </div>
        </div>
      )}

      {/* Modal Puncte de Lucru */}
      {puncteModal && (
        <div onClick={() => setPuncteModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 10, width: "min(96vw,520px)", display: "flex", flexDirection: "column", boxShadow: "0 8px 40px rgba(0,0,0,0.35)", overflow: "hidden" }}>
            {/* Header modal */}
            <div style={{ background: "linear-gradient(135deg,#0d47a1,#1565c0)", color: "#fff", padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>📍 Puncte de Lucru</div>
                <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>Adrese suplimentare de ridicare</div>
              </div>
              <button onClick={() => setPuncteModal(null)} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)", color: "#fff", borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
            {/* Lista adrese */}
            <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 8, maxHeight: 360, overflowY: "auto" }}>
              {puncteModal.adrese.length === 0 && (
                <div style={{ color: "#999", fontSize: 12, textAlign: "center", padding: "20px 0" }}>Nicio adresă adăugată încă.</div>
              )}
              {puncteModal.adrese.map((adresa, ai) => (
                <div key={ai} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#999", minWidth: 18, textAlign: "right" }}>{ai + 1}.</span>
                  <input
                    autoFocus={ai === puncteModal.adrese.length - 1}
                    style={{ flex: 1, padding: "6px 8px", border: "1px solid #bbdefb", borderRadius: 5, fontSize: 13, outline: "none" }}
                    value={adresa}
                    onChange={(e) => {
                      const nou = [...puncteModal.adrese];
                      nou[ai] = e.target.value;
                      setPuncteModal((p) => ({ ...p, adrese: nou }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const nou = [...puncteModal.adrese];
                        nou.splice(ai + 1, 0, "");
                        setPuncteModal((p) => ({ ...p, adrese: nou }));
                      }
                    }}
                    placeholder={`Adresa ${ai + 1}...`}
                  />
                  <button onClick={() => { const nou = puncteModal.adrese.filter((_, j) => j !== ai); setPuncteModal((p) => ({ ...p, adrese: nou })); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 16, padding: "0 4px" }} title="Șterge">✕</button>
                </div>
              ))}
              {/* Buton adaugare rand nou */}
              <button onClick={() => setPuncteModal((p) => ({ ...p, adrese: [...p.adrese, ""] }))} style={{ marginTop: 4, padding: "6px 12px", border: "2px dashed #90caf9", borderRadius: 6, background: "#e3f2fd", color: "#1565c0", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                + Adaugă adresă nouă
              </button>
            </div>
            {/* Footer */}
            <div style={{ padding: "10px 18px", background: "#f5f5f5", borderTop: "1px solid #ddd", display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setPuncteModal(null)} style={{ padding: "6px 16px", border: "1px solid #ccc", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 13 }}>Anulează</button>
              <button onClick={() => {
                const adreseCurate = puncteModal.adrese.map((s) => s.trim()).filter(Boolean);
                updPJ(puncteModal.idx, "puncte_lucru", adreseCurate);
                setPuncteModal(null);
              }} style={{ padding: "6px 20px", border: "none", borderRadius: 6, background: "#1565c0", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>✔ Salvează</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Materiale Tipice per firma PJ */}
      {matTipiceModal && (
        <div onClick={() => setMatTipiceModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 10, width: "min(96vw,640px)", display: "flex", flexDirection: "column", boxShadow: "0 8px 40px rgba(0,0,0,0.35)", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ background: "linear-gradient(135deg,#bf360c,#e65100)", color: "#fff", padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>🗂️ Materiale Tipice</div>
                <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>{matTipiceModal.den} — auto-completare la selectare în Editor PV</div>
              </div>
              <button onClick={() => setMatTipiceModal(null)} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)", color: "#fff", borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
            {/* Explicatie */}
            <div style={{ background: "#fff8e1", borderBottom: "1px solid #ffe082", padding: "8px 18px", fontSize: 11, color: "#795548" }}>
              💡 Când selectezi această firmă în <strong>Editor PV</strong>, materialele de mai jos se vor completa automat cu cantități aleatoare între <strong>Min</strong> și <strong>Max</strong> kg.
            </div>
            {/* Tabel materiale */}
            <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 0, maxHeight: 380, overflowY: "auto" }}>
              {matTipiceModal.items.length === 0 && (
                <div style={{ color: "#999", fontSize: 12, textAlign: "center", padding: "20px 0" }}>Niciun material tipic adăugat. Apasă „+ Adaugă material" mai jos.</div>
              )}
              {matTipiceModal.items.length > 0 && (
                <table style={{ borderCollapse: "collapse", width: "100%", marginBottom: 8 }}>
                  <thead>
                    <tr style={{ background: "#e65100", color: "#fff" }}>
                      <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 11, fontWeight: 700, width: "40%" }}>Denumire Material</th>
                      <th style={{ padding: "6px 8px", textAlign: "center", fontSize: 11, fontWeight: 700, width: "18%" }}>CodSAGA</th>
                      <th style={{ padding: "6px 8px", textAlign: "center", fontSize: 11, fontWeight: 700, width: "14%" }}>Min (kg)</th>
                      <th style={{ padding: "6px 8px", textAlign: "center", fontSize: 11, fontWeight: 700, width: "14%" }}>Max (kg)</th>
                      <th style={{ padding: "6px 4px", textAlign: "center", fontSize: 11, fontWeight: 700, width: "14%" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {matTipiceModal.items.map((it, ai) => (
                      <tr key={ai} style={{ background: ai % 2 === 0 ? "#fff" : "#fff8f5" }}>
                        <td style={{ padding: "4px 6px" }}>
                          <AC
                            value={it.den}
                            options={PRODUSE_DYN}
                            placeholder="Selectează material..."
                            onChange={(v) => {
                              const nou = [...matTipiceModal.items];
                              // auto-fill cod_art din produseList
                              const prod = (produseLista.length > 0 ? produseLista : PRODUSE_LIST).find(p => p.den === v);
                              nou[ai] = { ...nou[ai], den: v, cod_art: prod?.cod_art || nou[ai].cod_art || "" };
                              setMatTipiceModal(p => ({ ...p, items: nou }));
                            }}
                          />
                        </td>
                        <td style={{ padding: "4px 6px" }}>
                          <input
                            style={{ width: "100%", padding: "4px 6px", border: "1px solid #ddd", borderRadius: 4, fontSize: 12, textAlign: "center", boxSizing: "border-box" }}
                            value={it.cod_art || ""}
                            onChange={(e) => { const nou = [...matTipiceModal.items]; nou[ai] = { ...nou[ai], cod_art: e.target.value }; setMatTipiceModal(p => ({ ...p, items: nou })); }}
                            placeholder="ex: 001"
                          />
                        </td>
                        <td style={{ padding: "4px 6px" }}>
                          <input
                            style={{ width: "100%", padding: "4px 6px", border: "1px solid #a5d6a7", borderRadius: 4, fontSize: 12, textAlign: "center", background: "#f1f8e9", boxSizing: "border-box" }}
                            type="number" min="0"
                            value={it.min_kg || ""}
                            onChange={(e) => { const nou = [...matTipiceModal.items]; nou[ai] = { ...nou[ai], min_kg: e.target.value }; setMatTipiceModal(p => ({ ...p, items: nou })); }}
                            placeholder="0"
                          />
                        </td>
                        <td style={{ padding: "4px 6px" }}>
                          <input
                            style={{ width: "100%", padding: "4px 6px", border: "1px solid #ef9a9a", borderRadius: 4, fontSize: 12, textAlign: "center", background: "#fce4ec", boxSizing: "border-box" }}
                            type="number" min="0"
                            value={it.max_kg || ""}
                            onChange={(e) => { const nou = [...matTipiceModal.items]; nou[ai] = { ...nou[ai], max_kg: e.target.value }; setMatTipiceModal(p => ({ ...p, items: nou })); }}
                            placeholder="0"
                          />
                        </td>
                        <td style={{ padding: "4px 4px", textAlign: "center" }}>
                          <button onClick={() => { const nou = matTipiceModal.items.filter((_, j) => j !== ai); setMatTipiceModal(p => ({ ...p, items: nou })); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 16 }} title="Șterge">✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <button onClick={() => setMatTipiceModal(p => ({ ...p, items: [...p.items, { den: "", cod_art: "", min_kg: "", max_kg: "" }] }))} style={{ padding: "6px 14px", border: "2px dashed #ffcc80", borderRadius: 6, background: "#fff8e1", color: "#e65100", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                + Adaugă material
              </button>
            </div>
            {/* Footer */}
            <div style={{ padding: "10px 18px", background: "#f5f5f5", borderTop: "1px solid #ddd", display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#888" }}>{matTipiceModal.items.filter(i => i.den).length} material(e) configurate</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setMatTipiceModal(null)} style={{ padding: "6px 16px", border: "1px solid #ccc", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 13 }}>Anulează</button>
                <button onClick={() => {
                  const curate = matTipiceModal.items.filter(i => i.den).map(i => ({ den: i.den, cod_art: i.cod_art || "", min_kg: parseFloat(i.min_kg) || 0, max_kg: parseFloat(i.max_kg) || 0 }));
                  updPJ(matTipiceModal.idx, "mat_tipice", curate);
                  setMatTipiceModal(null);
                }} style={{ padding: "6px 20px", border: "none", borderRadius: 6, background: "#e65100", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>✔ Salvează</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editare Tichet (factura/aviz/ore) */}
      {ticEdit && (
        <div onClick={() => setTicEdit(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 10, width: "min(96vw,440px)", display: "flex", flexDirection: "column", boxShadow: "0 8px 40px rgba(0,0,0,0.35)", overflow: "hidden" }}>
            <div style={{ background: `linear-gradient(135deg,#1b5e20,${G})`, color: "#fff", padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>✏️ Editare Tichet TC #{ticEdit.nr_tichet}</div>
              <button onClick={() => setTicEdit(null)} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)", color: "#fff", borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
            <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}><label style={{ fontSize: 11, fontWeight: 600, color: "#555" }}>Factura</label><input style={{ width: "100%", padding: "6px 8px", border: "1px solid #ccc", borderRadius: 5, fontSize: 13, boxSizing: "border-box" }} value={ticEdit.factura} onChange={(e) => setTicEdit((p) => ({ ...p, factura: e.target.value }))} /></div>
                <div style={{ flex: 1 }}><label style={{ fontSize: 11, fontWeight: 600, color: "#555" }}>Aviz</label><input style={{ width: "100%", padding: "6px 8px", border: "1px solid #ccc", borderRadius: 5, fontSize: 13, boxSizing: "border-box" }} value={ticEdit.aviz} onChange={(e) => setTicEdit((p) => ({ ...p, aviz: e.target.value }))} /></div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#6a1b9a" }}>⚖️ Cântărit BRUT la</label>
                <input style={{ width: "100%", padding: "6px 8px", border: "1px solid #ce93d8", borderRadius: 5, fontSize: 13, fontFamily: "monospace", boxSizing: "border-box" }} value={ticEdit.brut_la} onChange={(e) => setTicEdit((p) => ({ ...p, brut_la: e.target.value }))} placeholder="DD.MM.YYYY HH:MM:SS" />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#6a1b9a" }}>⚖️ Cântărit TARA la</label>
                <input style={{ width: "100%", padding: "6px 8px", border: "1px solid #ce93d8", borderRadius: 5, fontSize: 13, fontFamily: "monospace", boxSizing: "border-box" }} value={ticEdit.tara_la} onChange={(e) => setTicEdit((p) => ({ ...p, tara_la: e.target.value }))} placeholder="DD.MM.YYYY HH:MM:SS" />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}><label style={{ fontSize: 11, fontWeight: 600, color: "#555" }}>Ora intrare</label><input style={{ width: "100%", padding: "6px 8px", border: "1px solid #ccc", borderRadius: 5, fontSize: 13, fontFamily: "monospace", boxSizing: "border-box" }} value={ticEdit.ora_intrare} onChange={(e) => setTicEdit((p) => ({ ...p, ora_intrare: e.target.value }))} placeholder="HH:MM" /></div>
                <div style={{ flex: 1 }}><label style={{ fontSize: 11, fontWeight: 600, color: "#555" }}>Ora ieșire</label><input style={{ width: "100%", padding: "6px 8px", border: "1px solid #ccc", borderRadius: 5, fontSize: 13, fontFamily: "monospace", boxSizing: "border-box" }} value={ticEdit.ora_iesire} onChange={(e) => setTicEdit((p) => ({ ...p, ora_iesire: e.target.value }))} placeholder="HH:MM" /></div>
              </div>
              <div style={{ fontSize: 10, color: "#999" }}>💡 Orele de cântărire apar pe tichetul printat la „Cantarit la". Format: 10.12.2025 15:48:03</div>
            </div>
            <div style={{ padding: "10px 18px", background: "#f5f5f5", borderTop: "1px solid #ddd", display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setTicEdit(null)} style={{ padding: "6px 16px", border: "1px solid #ccc", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 13 }}>Anulează</button>
              <button onClick={salveazaTicEdit} style={{ padding: "6px 20px", border: "none", borderRadius: 6, background: G, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>✔ Salvează</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", background: "#e8f0eb", borderLeft: "1px solid #ccc", borderRight: "1px solid #ccc", overflowX: "auto" }}>
        {[["dashboard","🏠 Acasă"],["borderou","📄 Borderouri"],["pv","📋 PV & Anexa 3"],["cheltuieli","💸 Cheltuieli"],["colectari","🚛 Colectări"],["livrari","📤 Livrări"],["cantar","⚖️ Tichete Cântar"],["stoc","📦 Stocuri"],["produse","🛠️ Variabile"],["salariati","👷 Salariați"],["datorii","💳 Datorii"],["avansuri","💵 Avansuri & Dividende"],["contracte","📃 Contracte"],["parole","🔐 Parole"],["rapoarte","📊 Rapoarte"],["trasabilitate","🔄 Trasabilitate"],["calculator","🧮 Calculator"],["audit","🕘 Istoric"]].map(([k, l]) => (
          <button key={k} style={tabSt(k)} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid #ccc", borderTop: "none", borderRadius: "0 0 8px 8px", padding: 14, boxShadow: "0 2px 8px rgba(0,0,0,.08)" }}>

        {/* ══ DASHBOARD (ACASĂ) ══ */}
        {tab === "dashboard" && (() => {
          // Compute stats
          const now = new Date();
          const curMonth = `${String(now.getMonth() + 1).padStart(2, "0")}.${now.getFullYear()}`;
          const isCurMonth = (d) => monthOf(d) === curMonth;
          const todayStr = today();
          const isToday = (d) => d === todayStr;

          const bordToday = registru.filter(r => isToday(r.data));
          const bordMonth = registru.filter(r => isCurMonth(r.data));
          const pvToday = pvList.filter(p => isToday(p.data));
          const pvMonth = pvList.filter(p => isCurMonth(p.data));
          const colToday = colRows.filter(c => isToday(c.data));
          const chMonth = chRows.filter(c => isCurMonth(c.data));
          const colMonth = colRows.filter(c => isCurMonth(c.data));
          const livMonth = livRows.filter(l => isCurMonth(l.data));

          // BORDEROURI luna curentă
          const bordCountMonth = new Set(bordMonth.map(r => `${r.serie}__${r.nr}`)).size; // unique borderouri
          const bordKgMonth = bordMonth.reduce((s, r) => s + (parseFloat(r.cantitate) || 0), 0);
          const bordValMonth = bordMonth.reduce((s, r) => s + (parseFloat(r.cantitate) || 0) * (parseFloat(r.pu) || 0), 0);

          // PV luna curentă
          const pvKgMonth = pvMonth.reduce((s, p) => s + (p.materiale || []).reduce((ss, m) => ss + (parseFloat(m.cant) || 0), 0), 0);

          // COLECTARI luna curentă
          const colValMonth = colMonth.reduce((s, r) => s + (parseFloat(r.cant) || 0) * (parseFloat(r.pret) || 0), 0);
          const colValAchitat = colMonth.filter(r => r.ach === "Da").reduce((s, r) => s + (parseFloat(r.cant) || 0) * (parseFloat(r.pret) || 0), 0);
          const colValNeachitat = colMonth.filter(r => r.ach === "Nu").reduce((s, r) => s + (parseFloat(r.cant) || 0) * (parseFloat(r.pret) || 0), 0);

          // LIVRARI luna curentă
          const livValMonth = livMonth.reduce((s, r) => s + (parseFloat(r.cant) || 0) * (parseFloat(r.pret) || 0), 0);

          // CHELTUIELI luna curentă
          const chTotalMonth = chMonth.reduce((s, c) => s + (parseFloat(c.suma) || 0), 0);

          // SITUATIE LUNA = Livrări - (Colectări + Cheltuieli)
          const profitMonth = livValMonth - colValMonth - chTotalMonth;
          const isProfit = profitMonth >= 0;

          const totStocKg = stocAg.reduce((s, r) => s + Math.max(0, r.cant), 0);
          const stocNegativ = stocAg.filter(r => r.cant < 0).length;

          // Alerts
          const allTrasEntries = getTrasEntries();
          const trasNealocate = allTrasEntries.filter(e => !e.trasabilitate);
          const cheltNeach = chRows.filter(c => c.ach !== "Da").length;
          const datUnpaid = datRows.filter(d => d.stat !== "Achitată").length;
          const taskuriPending = taskuri.filter(t => !t.done);

          // Recent activity
          const recentActivity = auditLog.slice(0, 10);

          return (
            <div>
              {/* Welcome */}
              <div style={{ background: `linear-gradient(135deg,#1b5e20,${G},#43a047)`, color: "#fff", borderRadius: 10, padding: "16px 20px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>👋 Bună{currentUser ? `, ${currentUser}` : ""}!</div>
                  <div style={{ fontSize: 12, opacity: 0.9 }}>{new Date().toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={() => setTab("borderou")} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)", color: "#fff", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Borderou nou</button>
                  <button onClick={() => setTab("pv")} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)", color: "#fff", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ PV nou</button>
                  <button onClick={() => setTab("cheltuieli")} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)", color: "#fff", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Cheltuială</button>
                </div>
              </div>

              {/* Stats Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginBottom: 16 }}>
                {/* BORDEROURI */}
                <div style={{ background: "#fff", border: "2px solid #1565c0", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11, color: "#666", marginBottom: 6, fontWeight: 600 }}>📄 BORDEROURI — luna asta</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#1565c0", lineHeight: 1.2 }}>{bordCountMonth}</div>
                  <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>📦 <strong>{fmt(bordKgMonth)} kg</strong></div>
                  <div style={{ fontSize: 11, color: "#555" }}>💰 <strong>{fmt(bordValMonth)} lei</strong></div>
                </div>
                {/* PV-URI */}
                <div style={{ background: "#fff", border: "2px solid #e65100", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11, color: "#666", marginBottom: 6, fontWeight: 600 }}>📋 PV-URI — luna asta</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#e65100", lineHeight: 1.2 }}>{pvMonth.length}</div>
                  <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>📦 <strong>{fmt(pvKgMonth)} kg</strong></div>
                </div>
                {/* COLECTARI */}
                <div style={{ background: "#fff", border: "2px solid #2e7d32", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11, color: "#666", marginBottom: 6, fontWeight: 600 }}>🚛 COLECTĂRI — luna asta</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#2e7d32", lineHeight: 1.2 }}>{fmt(colValMonth)} lei</div>
                  <div style={{ fontSize: 11, color: G, marginTop: 4 }}>✅ Achitat: <strong>{fmt(colValAchitat)} lei</strong></div>
                  <div style={{ fontSize: 11, color: "#c62828" }}>⏳ Neachitat: <strong>{fmt(colValNeachitat)} lei</strong></div>
                </div>
                {/* LIVRARI */}
                <div style={{ background: "#fff", border: "2px solid #6a1b9a", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11, color: "#666", marginBottom: 6, fontWeight: 600 }}>📤 LIVRĂRI — luna asta</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#6a1b9a", lineHeight: 1.2 }}>{fmt(livValMonth)} lei</div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>{livMonth.length} livrări</div>
                </div>
                {/* CHELTUIELI */}
                <div style={{ background: "#fff", border: "2px solid #c62828", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11, color: "#666", marginBottom: 6, fontWeight: 600 }}>💸 CHELTUIELI — luna asta</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#c62828", lineHeight: 1.2 }}>{fmt(chTotalMonth)} lei</div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>{chMonth.length} înregistrări</div>
                </div>
              </div>

              {/* SITUATIE PROFIT/PIERDERE */}
              <div style={{ background: isProfit ? "linear-gradient(135deg,#e8f5e9,#c8e6c9)" : "linear-gradient(135deg,#ffebee,#ffcdd2)", border: `2px solid ${isProfit ? G : "#c62828"}`, borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: isProfit ? G : "#c62828", marginBottom: 10 }}>{isProfit ? "📈 SITUAȚIE LUNĂ — Profit" : "📉 SITUAȚIE LUNĂ — Pierdere"}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, alignItems: "center" }}>
                  <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 6, padding: "8px 12px" }}>
                    <div style={{ fontSize: 10, color: "#666" }}>📤 Livrări</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#6a1b9a" }}>+{fmt(livValMonth)} lei</div>
                  </div>
                  <div style={{ fontSize: 18, color: "#888", textAlign: "center", fontWeight: 700 }}>−</div>
                  <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 6, padding: "8px 12px" }}>
                    <div style={{ fontSize: 10, color: "#666" }}>🚛 Colectări</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#2e7d32" }}>−{fmt(colValMonth)} lei</div>
                  </div>
                  <div style={{ fontSize: 18, color: "#888", textAlign: "center", fontWeight: 700 }}>−</div>
                  <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 6, padding: "8px 12px" }}>
                    <div style={{ fontSize: 10, color: "#666" }}>💸 Cheltuieli</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#c62828" }}>−{fmt(chTotalMonth)} lei</div>
                  </div>
                  <div style={{ fontSize: 18, color: "#888", textAlign: "center", fontWeight: 700 }}>=</div>
                  <div style={{ background: isProfit ? G : "#c62828", color: "#fff", borderRadius: 6, padding: "10px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 10, opacity: 0.9 }}>{isProfit ? "PROFIT" : "PIERDERE"}</div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{isProfit ? "+" : ""}{fmt(profitMonth)} lei</div>
                  </div>
                </div>
              </div>

              {/* Task-uri */}
              <div style={{ background: "#fff", border: "2px solid #1565c0", borderRadius: 10, padding: 14, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1565c0", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>✅ Task-uri / De făcut</span>
                  <span style={{ fontSize: 11, color: "#888", fontWeight: 400 }}>{taskuri.filter(t => !t.done).length} active • {taskuri.filter(t => t.done).length} terminate</span>
                </div>
                <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                  <input id="newTaskInput" type="text" placeholder="Scrie un task nou..." style={{ flex: "1 1 200px", border: "1px solid #ccc", borderRadius: 6, padding: "7px 10px", fontSize: 13 }} onKeyDown={(e) => { if (e.key === "Enter" && e.target.value.trim()) { const scad = document.getElementById("newTaskScad")?.value || ""; const prio = document.getElementById("newTaskPrio")?.value || "normal"; addTask(e.target.value, scad, prio); e.target.value = ""; if (document.getElementById("newTaskScad")) document.getElementById("newTaskScad").value = ""; } }} />
                  <input id="newTaskScad" type="date" title="Scadență (opțional)" style={{ border: "1px solid #ccc", borderRadius: 6, padding: "7px 10px", fontSize: 13 }} />
                  <select id="newTaskPrio" style={{ border: "1px solid #ccc", borderRadius: 6, padding: "7px 10px", fontSize: 13 }}>
                    <option value="normal">Normal</option>
                    <option value="urgent">🔴 Urgent</option>
                  </select>
                  <button onClick={() => { const inp = document.getElementById("newTaskInput"); if (inp?.value.trim()) { const scadEl = document.getElementById("newTaskScad"); const prioEl = document.getElementById("newTaskPrio"); const scad = scadEl?.value ? scadEl.value.split("-").reverse().join(".") : ""; addTask(inp.value, scad, prioEl?.value || "normal"); inp.value = ""; if (scadEl) scadEl.value = ""; } }} style={{ background: G, color: "#fff", border: "none", borderRadius: 6, padding: "7px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>+ Adaugă</button>
                </div>
                {taskuri.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 16, color: "#aaa", fontSize: 13 }}>Niciun task încă. Adaugă unul mai sus 👆</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {[...taskuri].sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1)).map((t) => (
                      <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: t.done ? "#f5f5f5" : t.prioritate === "urgent" ? "#fff5f5" : "#f8fbff", border: `1px solid ${t.done ? "#e0e0e0" : t.prioritate === "urgent" ? "#ffcdd2" : "#bbdefb"}`, borderRadius: 6 }}>
                        <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id, t.done)} style={{ cursor: "pointer", width: 16, height: 16 }} />
                        <div style={{ flex: 1, fontSize: 13, textDecoration: t.done ? "line-through" : "none", color: t.done ? "#aaa" : "#333" }}>
                          {!t.done && t.prioritate === "urgent" && <span style={{ color: "#c62828", fontWeight: 700 }}>🔴 </span>}
                          {t.text}
                          {t.scadenta && <span style={{ fontSize: 11, color: "#888", marginLeft: 8 }}>📅 {t.scadenta}</span>}
                          {t.creat_de && <span style={{ fontSize: 10, color: "#bbb", marginLeft: 8 }}>— {t.creat_de}</span>}
                        </div>
                        <button onClick={() => delTask(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Alerts + Recent Activity */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 16 }}>
                {/* Alerts */}
                <div style={{ background: "#fff", border: "1px solid #ffcdd2", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#c62828", marginBottom: 10 }}>🔔 Necesită atenție</div>
                  {trasNealocate.length === 0 && cheltNeach === 0 && datUnpaid === 0 && stocNegativ === 0 ? (
                    <div style={{ textAlign: "center", padding: 20, color: G, fontSize: 13 }}>✅ Totul e în ordine!</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {trasNealocate.length > 0 && (
                        <div onClick={() => setTab("trasabilitate")} style={{ background: "#fff3e0", border: "1px solid #ffcc80", borderRadius: 6, padding: "8px 10px", cursor: "pointer", fontSize: 12 }}>
                          <strong style={{ color: "#e65100" }}>🔄 {trasNealocate.length} intrări fără trasabilitate</strong>
                          <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>Click pentru a aloca firma →</div>
                        </div>
                      )}
                      {cheltNeach > 0 && (
                        <div onClick={() => setTab("cheltuieli")} style={{ background: "#fff8e1", border: "1px solid #ffd54f", borderRadius: 6, padding: "8px 10px", cursor: "pointer", fontSize: 12 }}>
                          <strong style={{ color: "#f57f17" }}>💸 {cheltNeach} cheltuieli neachitate</strong>
                          <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>Click pentru a vedea →</div>
                        </div>
                      )}
                      {datUnpaid > 0 && (
                        <div onClick={() => setTab("datorii")} style={{ background: "#ffebee", border: "1px solid #ef9a9a", borderRadius: 6, padding: "8px 10px", cursor: "pointer", fontSize: 12 }}>
                          <strong style={{ color: "#c62828" }}>💳 {datUnpaid} datorii neachitate</strong>
                          <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>Click pentru a vedea →</div>
                        </div>
                      )}
                      {stocNegativ > 0 && (
                        <div onClick={() => setTab("stoc")} style={{ background: "#ffebee", border: "1px solid #ef9a9a", borderRadius: 6, padding: "8px 10px", cursor: "pointer", fontSize: 12 }}>
                          <strong style={{ color: "#c62828" }}>⚠️ {stocNegativ} produse cu stoc negativ</strong>
                          <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>Click pentru a vedea →</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Recent Activity */}
                <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#333", marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
                    <span>🕘 Activitate recentă</span>
                    <button onClick={() => setTab("audit")} style={{ background: "none", border: "none", color: G, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>Vezi tot →</button>
                  </div>
                  {recentActivity.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 20, color: "#888", fontSize: 12 }}>Nicio activitate înregistrată</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 280, overflowY: "auto" }}>
                      {recentActivity.map((a, i) => {
                        const dt = new Date(a.created_at);
                        const tDelta = Math.floor((Date.now() - dt.getTime()) / 1000);
                        const ago = tDelta < 60 ? "acum câteva sec." : tDelta < 3600 ? `${Math.floor(tDelta / 60)} min` : tDelta < 86400 ? `${Math.floor(tDelta / 3600)} ore` : `${Math.floor(tDelta / 86400)} zile`;
                        const iconColor = a.action === "delete" ? "#c62828" : a.action === "create" || a.action === "insert" ? G : "#1565c0";
                        const icon = a.action === "delete" ? "🗑️" : a.action === "create" || a.action === "insert" ? "➕" : a.action === "update" ? "✏️" : "💾";
                        return (
                          <div key={i} style={{ display: "flex", gap: 8, padding: "5px 0", borderBottom: i < recentActivity.length - 1 ? "1px solid #f0f0f0" : "none", fontSize: 11 }}>
                            <div style={{ fontSize: 14 }}>{icon}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div><strong style={{ color: iconColor }}>{a.user_name}</strong> a {a.action === "delete" ? "șters" : a.action === "create" || a.action === "insert" ? "adăugat" : "modificat"} în <em>{a.entity}</em></div>
                              <div style={{ color: "#888", fontSize: 10 }}>acum {ago}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ══ AUDIT LOG (ISTORIC) ══ */}
        {tab === "audit" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
              <SC label="Total acțiuni" value={auditLog.length + " (ultimele 200)"} c="#333" bg="#f5f5f5" />
              <SC label="Ștergeri" value={auditLog.filter(a => a.action === "delete").length + " buc."} c="#c62828" bg="#ffebee" />
              <SC label="Modificări" value={auditLog.filter(a => a.action === "update").length + " buc."} c="#1565c0" bg="#e3f2fd" />
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 700 }}>
                <thead><tr>
                  <th style={th({ background: "#455a64", width: 140 })}>Dată/Ora</th>
                  <th style={th({ background: "#455a64", width: 100 })}>User</th>
                  <th style={th({ background: "#455a64", width: 90 })}>Acțiune</th>
                  <th style={th({ background: "#455a64", width: 130 })}>Entitate</th>
                  <th style={th({ background: "#455a64", textAlign: "left" })}>ID / Detalii</th>
                </tr></thead>
                <tbody>
                  {auditLog.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: 20, color: "#aaa" }}>Nicio activitate înregistrată.</td></tr>}
                  {auditLog.map((a, i) => {
                    const dt = new Date(a.created_at);
                    const dtStr = `${String(dt.getDate()).padStart(2, "0")}.${String(dt.getMonth() + 1).padStart(2, "0")}.${dt.getFullYear()} ${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
                    const actColor = a.action === "delete" ? "#c62828" : a.action === "create" || a.action === "insert" ? G : a.action === "backup" ? "#6a1b9a" : "#1565c0";
                    return (
                      <tr key={a.id || i} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa" }}>
                        <td style={td({ fontFamily: "monospace", fontSize: 11 })}>{dtStr}</td>
                        <td style={td({ fontWeight: 600 })}>{a.user_name || "—"}</td>
                        <td style={td({ textAlign: "center" })}><span style={{ background: actColor, color: "#fff", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>{a.action}</span></td>
                        <td style={td({ fontFamily: "monospace", fontSize: 11 })}>{a.entity}</td>
                        <td style={td({ fontSize: 11, color: "#666" })}>{a.entity_id}{a.details ? " • " + JSON.stringify(a.details).slice(0, 100) : ""}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ BORDEROURI ══ */}
        {tab === "borderou" && (
          <div>
            <div style={{ display: "flex", borderBottom: "2px solid #e0e0e0", marginBottom: 12, flexWrap: "wrap", gap: 2 }}>
              <button style={subTabSt("editor")} onClick={() => setBordSubTab("editor")}>✏️ Editor PF</button>
              <button style={subTabSt("registru")} onClick={() => setBordSubTab("registru")}>📋 Registru PF <span style={{ marginLeft: 4, background: "#e53935", color: "#fff", borderRadius: 10, padding: "1px 5px", fontSize: 10, fontWeight: 700 }}>{registru.length}</span></button>
              <button style={subTabSt("pf")} onClick={() => setBordSubTab("pf")}>👤 Pers. Fizice <span style={{ marginLeft: 4, background: "#1565c0", color: "#fff", borderRadius: 10, padding: "1px 5px", fontSize: 10, fontWeight: 700 }}>{pfList.length}</span></button>
            </div>

            {bordSubTab === "editor" && (
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
                  {borderouri.map((_, i) => (<button key={i} onClick={() => { setActiveBord(i); setPreviewMode(false); setDetSearch(borderouri[i].det || ""); }} style={{ padding: "4px 12px", border: `2px solid ${activeBord === i ? G : "#ccc"}`, borderRadius: 20, background: activeBord === i ? G : "#fff", color: activeBord === i ? "#fff" : "#555", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{borderouri[i].serie} #{borderouri[i].nr || "nou"}</button>))}
                  <button onClick={() => { setBorderouri((p) => [...p, newBord("GK", registru)]); setActiveBord(borderouri.length); setPreviewMode(false); setDetSearch(""); }} style={{ padding: "4px 12px", border: "2px dashed #aaa", borderRadius: 20, background: "#f9f9f9", color: "#666", cursor: "pointer", fontSize: 12 }}>+ Borderou nou</button>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                    <button onClick={salveaza} style={{ padding: "6px 14px", background: "#e65100", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>💾 Salvează</button>
                    <button onClick={() => setPreviewMode((p) => !p)} style={{ padding: "6px 14px", background: previewMode ? "#1565c0" : G, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{previewMode ? "✏️ Editare" : "👁️ Preview"}</button>
                    {previewMode && <button onClick={handlePrint} style={{ padding: "6px 14px", background: "#333", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>🖨️ Print</button>}
                  </div>
                </div>
                {!previewMode && (
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                    <div style={{ flex: "0 0 296px", minWidth: 256 }}>
                      <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 8, padding: 12, marginBottom: 10 }}>
                        <div style={{ fontWeight: 700, color: G, marginBottom: 8, fontSize: 12 }}>📋 Date Borderou</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <div style={{ flex: "0 0 85px" }}><label style={LSt}>Seria</label><select style={{ ...IFS, fontWeight: 700, color: G }} value={b.serie} onChange={(e) => updB("serie", e.target.value)}>{SERII.map((s) => <option key={s}>{s}</option>)}</select></div>
                          <div style={{ flex: 1 }}><label style={LSt}>Nr.</label><input style={{ ...IFS, fontWeight: 700, color: "#1565c0" }} value={b.nr} onChange={(e) => updB("nr", e.target.value)} /></div>
                        </div>
                        <div style={{ marginTop: 8 }}><label style={LSt}>Data</label><DateInput value={b.data || ""} onChange={(v) => updB("data", v)} style={IFS} /></div>
                      </div>
                      <div style={{ background: "#e3f2fd", border: "1px solid #90caf9", borderRadius: 8, padding: 12 }}>
                        <div style={{ fontWeight: 700, color: "#1565c0", marginBottom: 8, fontSize: 12 }}>👤 Date Deținător</div>
                        <div style={{ marginBottom: 8, position: "relative" }}>
                          <label style={LSt}>Caută în Furnizori Pers. Fizice</label>
                          <input style={{ ...IFS, borderColor: "#1565c0" }} value={detSearch} onChange={(e) => { setDetSearch(e.target.value); setDetOpen(true); }} onFocus={() => setDetOpen(true)} onBlur={() => setTimeout(() => setDetOpen(false), 200)} placeholder="Tastează nume, CNP sau cod..." />
                          {detOpen && detFiltered.length > 0 && (
                            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 999, background: "#fff", border: "1px solid #1565c0", borderRadius: 6, boxShadow: "0 4px 16px rgba(0,0,0,.15)", maxHeight: 180, overflowY: "auto" }}>
                              {detFiltered.map((f, fi) => (<div key={fi} onMouseDown={() => fillDet(f)} style={{ padding: "6px 10px", fontSize: 12, cursor: "pointer", borderBottom: "1px solid #e3f2fd", display: "flex", gap: 8, alignItems: "center" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#e3f2fd")} onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}><span style={{ background: "#1565c0", color: "#fff", borderRadius: 4, padding: "1px 5px", fontSize: 10, fontWeight: 700 }}>{f.cod}</span><span style={{ fontWeight: 600, flex: 1 }}>{f.denumire}</span><span style={{ color: "#888", fontSize: 10 }}>{f.cod_fiscal}</span></div>))}
                            </div>
                          )}
                          {b.det && <div style={{ marginTop: 4, background: "#e3f2fd", border: "1px solid #90caf9", borderRadius: 4, padding: "4px 10px", fontSize: 11, color: "#1565c0", display: "flex", gap: 6, alignItems: "center", justifyContent: "space-between" }}><span>✅ <strong>{b.det}</strong> — {b.cnp}</span><button onMouseDown={() => { setDetSearch(""); setB((b) => ({ ...b, det: "", dom: "", ci_s: "", ci_n: "", ci_e: "", ci_v: "", cnp: "" })); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 12, padding: 0 }}>✕</button></div>}
                        </div>
                        {IBox("Nume complet", "det")}{IBox("Domiciliu / Adresă", "dom")}
                        <div style={{ display: "flex", gap: 6 }}><div style={{ flex: "0 0 68px" }}>{IBox("CI Seria", "ci_s", "IZ")}</div><div style={{ flex: 1 }}>{IBox("CI Nr.", "ci_n", "030452")}</div></div>
                        {IBox("Eliberată de", "ci_e")}{IBox("Valabilitate CI", "ci_v")}{IBox("CNP", "cnp")}
                        <div style={{ marginBottom: 7 }}><label style={LSt}>Mijloc transport</label><select style={IFS} value={b.trans} onChange={(e) => updB("trans", e.target.value)}><option>Auto</option><option>Pietonal</option><option>Bicicletă</option></select></div>
                        <div><label style={LSt}>Sursa deșeurilor</label>
                          <div style={{ display: "flex", gap: 12, fontSize: 12 }}>
                            <label style={{ cursor: "pointer" }}><input type="radio" name="sursa" value="gospodarie" checked={b.sursa === "gospodarie"} onChange={(e) => updB("sursa", e.target.value)} /> Gospodărie</label>
                            <label style={{ cursor: "pointer" }}><input type="radio" name="sursa" value="alte" checked={b.sursa === "alte"} onChange={(e) => updB("sursa", e.target.value)} /> Alte surse</label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 260 }}>
                      <div style={{ background: "#fff8e1", border: "1px solid #ffd54f", borderRadius: 8, padding: 12, marginBottom: 10 }}>
                        <div style={{ fontWeight: 700, color: "#e65100", marginBottom: 8, fontSize: 12 }}>📦 Produse / Deșeuri</div>
                        <table style={{ borderCollapse: "collapse", width: "100%" }}>
                          <thead><tr><th style={th({ textAlign: "left", background: "#e65100", minWidth: 170 })}>Denumire</th><th style={th({ width: 85, background: "#e65100" })}>CodSAGA</th><th style={th({ width: 80, background: "#e65100" })}>Cant.(kg)</th><th style={th({ width: 68, background: "#e65100" })}>Preț</th><th style={th({ width: 72, background: "#e65100" })}>Valoare</th><th style={th({ width: 26, background: "#e65100" })}></th></tr></thead>
                          <tbody>{b.produse.map((p, i) => { const v = (parseFloat(p.cant) || 0) * (parseFloat(p.pret) || 0); return (<tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fffde7" }}><td style={td()}><AC value={p.den} options={PRODUSE_DYN} placeholder="Selectează..." onChange={(v) => updP(i, "den", v)} /></td><td style={td()}><input style={inp({ textAlign: "center" })} value={p.cod_art || ""} onChange={(e) => updP(i, "cod_art", e.target.value)} /></td><td style={td()}><div style={{ display: "flex", gap: 2, alignItems: "center" }}><input style={inp({ textAlign: "right" })} type="number" value={p.cant} onChange={(e) => updP(i, "cant", e.target.value)} />{scalePort && <button onClick={() => useScaleWeight(v => updP(i, "cant", v))} title="Citește din cantar" style={{ background: scaleReading?.stable ? "#e8f5e9" : "#fff8e1", border: "1px solid #ccc", borderRadius: 3, padding: "1px 4px", cursor: "pointer", fontSize: 11 }}>⚖️</button>}</div></td><td style={td()}><input style={inp({ textAlign: "right" })} type="number" value={p.pret} onChange={(e) => updP(i, "pret", e.target.value)} /></td><td style={td({ textAlign: "right", fontWeight: 600, background: "#fff8e1" })}>{v > 0 ? fmt(v) : "—"}</td><td style={td({ textAlign: "center", padding: 2 })}><button onClick={() => setB((b) => ({ ...b, produse: b.produse.filter((_, j) => j !== i) }))} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button></td></tr>); })}</tbody>
                        </table>
                        <button onClick={() => setB((b) => ({ ...b, produse: [...b.produse, { den: "", cod: "", cod_art: "", cant: "", pret: "" }] }))} style={{ marginTop: 6, background: "#e65100", color: "#fff", border: "none", borderRadius: 4, padding: "5px 12px", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>+ Adaugă produs</button>
                      </div>
                      <div style={{ background: "#f3e5f5", border: "1px solid #ce93d8", borderRadius: 8, padding: 12 }}>
                        <div style={{ fontWeight: 700, color: "#6a1b9a", marginBottom: 8, fontSize: 12 }}>💰 Calcule Automate</div>
                        {[["Total brut", fmt(bTot) + " lei", "#333"], ["Impozit venit 10%", fmt(bImp) + " lei", "#c62828"], ["Taxa mediu 2%", fmt(bTax) + " lei", "#c62828"]].map(([l, v, c]) => (<div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "4px 8px", borderBottom: "1px solid #e1bee7", fontSize: 13 }}><span>{l}</span><span style={{ fontWeight: 600, color: c }}>{v}</span></div>))}
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px", background: "#6a1b9a", borderRadius: 4, marginTop: 6, color: "#fff" }}><span style={{ fontWeight: 700, fontSize: 14 }}>REST DE PLATĂ</span><span style={{ fontWeight: 700, fontSize: 16 }}>{fmt(bRest)} lei</span></div>
                      </div>
                    </div>
                  </div>
                )}
                {previewMode && (<div ref={printRef} style={{ border: "1px solid #ccc", borderRadius: 4, padding: 8, background: "#fff" }}><BordPrint b={b} /></div>)}
              </div>
            )}

            {bordSubTab === "registru" && (() => {
              const regPfMonths = [...new Set(registru.map(r => monthOf(r.data)).filter(Boolean))].sort().reverse();
              const filteredReg = registru.filter(r => {
                if (regPfMonth && monthOf(r.data) !== regPfMonth) return false;
                if (regPfSearch) {
                  const q = regPfSearch.toLowerCase();
                  if (!(r.furnizor?.toLowerCase().includes(q) || r.cnp?.includes(q) || r.denumire?.toLowerCase().includes(q) || String(r.nr).includes(q))) return false;
                }
                return true;
              });
              return (
              <div>
                <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <SC label="Total" value={filteredReg.length + " / " + registru.length + " buc."} c={G} bg="#e8f5e9" />
                  <SC label="Cant." value={fmt(filteredReg.reduce((s, r) => s + (parseFloat(r.cantitate) || 0), 0)) + " kg"} c="#1565c0" bg="#e3f2fd" />
                  <SC label="Valoare" value={fmt(filteredReg.reduce((s, r) => s + (parseFloat(r.valoare) || 0), 0)) + " lei"} c="#6a1b9a" bg="#f3e5f5" />
                  <button onClick={() => setBordSubTab("editor")} style={{ marginLeft: "auto", padding: "6px 14px", background: G, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Borderou nou</button>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <select value={regPfMonth} onChange={(e) => setRegPfMonth(e.target.value)} style={{ border: "1px solid #ccc", borderRadius: 6, padding: "6px 10px", fontSize: 12, minWidth: 130 }}>
                    <option value="">📅 Toate lunile</option>
                    {regPfMonths.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <input type="text" placeholder="🔍 Caută furnizor, CNP, nr, denumire..." value={regPfSearch} onChange={(e) => setRegPfSearch(e.target.value)} style={{ border: "1px solid #ccc", borderRadius: 6, padding: "6px 10px", fontSize: 12, minWidth: 280, flex: 1 }} />
                  {(regPfMonth || regPfSearch) && <button onClick={() => { setRegPfMonth(""); setRegPfSearch(""); }} style={{ background: "#fff", border: "1px solid #c62828", color: "#c62828", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 12 }}>✕ Resetează</button>}
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 800 }}>
                    <thead><tr>{[{ l: "", w: 28 }, ...regCols, { l: "🖨️ Print", w: 70 }, { l: "", w: 30 }].map((c, i) => <th key={i} style={{ ...th({ background: G }), width: c.w }}>{c.l}</th>)}</tr></thead>
                    <tbody>{sortByDateAsc(filteredReg).map((r, i, sortedReg) => {
                      const rowBg = i % 2 === 0 ? "#fff" : "#f7faf8";
                      // Show print button only on first row of each serie+nr group
                      const key = `${r.serie}__${r.nr}`;
                      const isFirstInGroup = sortedReg.findIndex((x) => x.serie === r.serie && String(x.nr) === String(r.nr)) === i;
                      const groupSize = sortedReg.filter((x) => x.serie === r.serie && String(x.nr) === String(r.nr)).length;
                      return (
                        <tr key={r.id || i} style={{ background: rowBg }}>
                          <td style={td({ textAlign: "center", color: "#aaa", fontSize: 10, background: "#f5f5f5" })}>{i + 133}</td>
                          {regCols.map((c) => (<td key={c.k} style={td({ background: c.k === "valoare" ? "#e8f5e9" : rowBg, textAlign: ["cantitate", "pu", "valoare"].includes(c.k) ? "right" : "left", fontWeight: c.k === "valoare" || c.k === "nr" ? 600 : 400, color: c.k === "valoare" ? G : "#333", whiteSpace: "nowrap", maxWidth: c.w + 20, overflow: "hidden", textOverflow: "ellipsis" })}>{["cantitate", "pu", "valoare"].includes(c.k) ? fmt(r[c.k]) : r[c.k]}</td>))}
                          <td style={td({ textAlign: "center", padding: 3 })}>
                            {isFirstInGroup && (
                              <button
                                onClick={() => printRegistruBord(r.serie, r.nr)}
                                title={`Printează borderou ${r.serie} ${r.nr}`}
                                style={{ background: "#e3f2fd", border: "1px solid #90caf9", borderRadius: 4, cursor: "pointer", color: "#1565c0", fontSize: 11, fontWeight: 700, padding: "2px 8px", whiteSpace: "nowrap" }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = "#1565c0"; e.currentTarget.style.color = "#fff"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = "#e3f2fd"; e.currentTarget.style.color = "#1565c0"; }}
                              >🖨️ {groupSize > 1 ? `(${groupSize})` : ""}</button>
                            )}
                          </td>
                          <td style={td({ textAlign: "center", padding: 3 })}><button onClick={async () => { if (!confirmDel("acest borderou")) return; await sb.from("registru").delete().eq("id", r.id); setRegistru(p => p.filter(x => x.id !== r.id)); await logAction("delete", "registru", r.id); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button></td>
                        </tr>
                      );
                    })}</tbody>
                    <tfoot><tr style={{ background: G, color: "#fff" }}><td></td><td colSpan={6} style={{ padding: "6px 10px", fontWeight: 700, fontSize: 12 }}>TOTAL</td><td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(filteredReg.reduce((s, r) => s + (parseFloat(r.cantitate) || 0), 0))}</td><td></td><td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(filteredReg.reduce((s, r) => s + (parseFloat(r.valoare) || 0), 0))}</td><td></td><td></td></tr></tfoot>
                  </table>
                </div>
              </div>
              );
            })()}

            {bordSubTab === "pf" && (
              <div>
                <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <SC label="Total" value={pfList.length + " pers."} c="#1565c0" bg="#e3f2fd" />
                  <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                    <input value={pfFilter} onChange={(e) => setPfFilter(e.target.value)} placeholder="🔍 Caută..." style={{ border: "1px solid #ccc", borderRadius: 6, padding: "5px 10px", fontSize: 12, width: 180 }} />
                    <button onClick={addPF} style={{ padding: "6px 12px", background: G, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Adaugă</button>
                    <button onClick={() => scanInputRef.current.click()} disabled={scanLoading} style={{ padding: "6px 12px", background: scanLoading ? "#ccc" : "#1565c0", color: "#fff", border: "none", borderRadius: 6, cursor: scanLoading ? "wait" : "pointer", fontSize: 12, fontWeight: 600 }}>{scanLoading ? "⏳ Scanez..." : "📷 Scanează Buletin"}</button>
                    <input ref={scanInputRef} type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={(e) => { if (e.target.files[0]) scanBuletin(e.target.files[0]); e.target.value = ""; }} />
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 860 }}>
                    <thead><tr><th style={th({ width: 28, background: "#1565c0" })}></th>{[{ l: "Cod", w: 60 }, { l: "Denumire", w: 175 }, { l: "CNP", w: 125 }, { l: "Analitic", w: 85 }, { l: "Jud.", w: 48 }, { l: "Adresa", w: 185 }, { l: "CI", w: 85 }, { l: "Inf.Supl.", w: 175 }].map((c) => <th key={c.l} style={{ ...th({ background: "#1565c0" }), width: c.w, textAlign: "left" }}>{c.l}</th>)}<th style={th({ background: "#1565c0", width: 30 })}></th></tr></thead>
                    <tbody>{pfList.filter((r) => !pfFilter || r.denumire?.toLowerCase().includes(pfFilter.toLowerCase()) || r.cod?.includes(pfFilter) || r.cod_fiscal?.includes(pfFilter)).map((r, i) => { const rowBg = i % 2 === 0 ? "#fff" : "#f0f4ff"; return (<tr key={r.id || i} style={{ background: rowBg }}><td style={td({ textAlign: "center", color: "#aaa", fontSize: 10, background: "#f5f5f5" })}>{i + 2}</td><td style={td({ background: "#e3f2fd", fontWeight: 700, color: "#1565c0", textAlign: "center" })}><input style={inp({ textAlign: "center", fontWeight: 700, color: "#1565c0" })} value={r.cod || ""} onChange={(e) => updPF(i, "cod", e.target.value)} /></td><td style={td({ fontWeight: 600 })}><input style={inp({ fontWeight: 600 })} value={r.denumire || ""} onChange={(e) => updPF(i, "denumire", e.target.value)} /></td><td style={td({ background: "#fff8e1" })}><input style={inp({ fontFamily: "monospace", fontSize: 11 })} value={r.cod_fiscal || ""} onChange={(e) => updPF(i, "cod_fiscal", e.target.value)} /></td><td style={td()}><input style={inp({ fontSize: 11 })} value={r.analitic || ""} onChange={(e) => updPF(i, "analitic", e.target.value)} /></td><td style={td({ background: "#e8f5e9", textAlign: "center", fontWeight: 600, color: G })}><input style={inp({ textAlign: "center", fontWeight: 600, color: G })} value={r.judet || ""} onChange={(e) => updPF(i, "judet", e.target.value)} /></td><td style={td({ fontSize: 11 })}><input style={inp({ fontSize: 11 })} value={r.adresa || ""} onChange={(e) => updPF(i, "adresa", e.target.value)} /></td><td style={td({ fontFamily: "monospace", fontSize: 11 })}><input style={inp({ fontFamily: "monospace", fontSize: 11 })} value={r.reg_com || ""} onChange={(e) => updPF(i, "reg_com", e.target.value)} /></td><td style={td({ fontSize: 11 })}><input style={inp({ fontSize: 11 })} value={r.inf_supl || ""} onChange={(e) => updPF(i, "inf_supl", e.target.value)} /></td><td style={td({ textAlign: "center", padding: 3 })}><button onClick={() => delPF(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button></td></tr>); })}</tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ══ PV & ANEXA 3 ══ */}
        {tab === "pv" && (
          <div>
            <div style={{ display: "flex", borderBottom: "2px solid #e0e0e0", marginBottom: 12, flexWrap: "wrap", gap: 2 }}>
              <button style={{ padding: "5px 13px", cursor: "pointer", border: "none", fontWeight: 600, fontSize: 12, borderBottom: pvSubTab === "editor" ? `2px solid ${G}` : "2px solid transparent", background: pvSubTab === "editor" ? "#f0faf4" : "transparent", color: pvSubTab === "editor" ? G : "#666", marginRight: 3 }} onClick={() => setPvSubTab("editor")}>✏️ Editor PV</button>
              <button style={{ padding: "5px 13px", cursor: "pointer", border: "none", fontWeight: 600, fontSize: 12, borderBottom: pvSubTab === "registru" ? `2px solid ${G}` : "2px solid transparent", background: pvSubTab === "registru" ? "#f0faf4" : "transparent", color: pvSubTab === "registru" ? G : "#666", marginRight: 3 }} onClick={() => setPvSubTab("registru")}>📋 Registru PJ <span style={{ marginLeft: 4, background: "#e65100", color: "#fff", borderRadius: 10, padding: "1px 5px", fontSize: 10, fontWeight: 700 }}>{pvList.length}</span></button>
              <button style={{ padding: "5px 13px", cursor: "pointer", border: "none", fontWeight: 600, fontSize: 12, borderBottom: pvSubTab === "pj" ? `2px solid ${G}` : "2px solid transparent", background: pvSubTab === "pj" ? "#f0faf4" : "transparent", color: pvSubTab === "pj" ? G : "#666", marginRight: 3 }} onClick={() => setPvSubTab("pj")}>🏢 Pers. Juridice <span style={{ marginLeft: 4, background: "#e65100", color: "#fff", borderRadius: 10, padding: "1px 5px", fontSize: 10, fontWeight: 700 }}>{pjList.length}</span></button>
            </div>

            {pvSubTab === "editor" && (
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
                  {pvBorderouri.map((_, i) => (<button key={i} onClick={() => { setActivePV(i); setPvPreview(false); setPjSearchPV(pvBorderouri[i].client_denumire || ""); }} style={{ padding: "4px 12px", border: `2px solid ${activePV === i ? "#e65100" : "#ccc"}`, borderRadius: 20, background: activePV === i ? "#e65100" : "#fff", color: activePV === i ? "#fff" : "#555", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{pvBorderouri[i].serie} #{pvBorderouri[i].nr_pv || "nou"}</button>))}
                  <button onClick={() => { setPvBorderouri((p) => [...p, newPV(pvList)]); setActivePV(pvBorderouri.length); setPvPreview(false); setPjSearchPV(""); }} style={{ padding: "4px 12px", border: "2px dashed #aaa", borderRadius: 20, background: "#f9f9f9", color: "#666", cursor: "pointer", fontSize: 12 }}>+ PV nou</button>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                    <button onClick={salveazaPV} style={{ padding: "6px 14px", background: "#e65100", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>💾 Salvează</button>
                    <button onClick={() => setPvPreview((p) => !p)} style={{ padding: "6px 14px", background: pvPreview ? "#1565c0" : G, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{pvPreview ? "✏️ Editare" : "👁️ Preview"}</button>
                    {pvPreview && <button onClick={handlePrintPV} style={{ padding: "6px 14px", background: "#333", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>🖨️ Print</button>}
                  </div>
                </div>

                {!pvPreview && (
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                    <div style={{ flex: "0 0 320px", minWidth: 280 }}>
                      <div style={{ background: "#fff3e0", border: "1px solid #ffcc80", borderRadius: 8, padding: 12, marginBottom: 10 }}>
                        <div style={{ fontWeight: 700, color: "#e65100", marginBottom: 8, fontSize: 12 }}>📋 Date PV</div>
                        <div style={{ display: "flex", gap: 8, marginBottom: 7 }}>
                          <div style={{ flex: "0 0 80px" }}><label style={LSt}>Serie</label><select style={{ ...IFS, fontWeight: 700, color: "#e65100", textAlign: "center" }} value={pv.serie} onChange={(e) => updPV("serie", e.target.value)}><option value="A">A</option><option value="GK">GK</option><option value="PV">PV</option></select></div>
                          <div style={{ flex: 1 }}><label style={LSt}>Nr. PV</label><input style={{ ...IFS, fontWeight: 700, color: "#1565c0" }} value={pv.nr_pv} onChange={(e) => updPV("nr_pv", e.target.value)} /></div>
                          <div style={{ flex: 1 }}><label style={LSt}>Nr. Anexa 3</label><input style={{ ...IFS, fontWeight: 700, color: "#1565c0" }} value={pv.nr_anexa} onChange={(e) => updPV("nr_anexa", e.target.value)} /></div>
                        </div>
                        <div style={{ marginBottom: 7 }}><label style={LSt}>Data</label><DateInput style={IFS} value={pv.data} onChange={(v) => updPV("data", v)} /></div>
                      </div>

                      <div style={{ background: "#e3f2fd", border: "1px solid #90caf9", borderRadius: 8, padding: 12, marginBottom: 10 }}>
                        <div style={{ fontWeight: 700, color: "#1565c0", marginBottom: 8, fontSize: 12 }}>🏢 Beneficiar (din Pers. Juridice)</div>
                        <div style={{ marginBottom: 8, position: "relative" }}>
                          <label style={LSt}>Caută firmă</label>
                          <input style={{ ...IFS, borderColor: "#1565c0" }} value={pjSearchPV} onChange={(e) => { setPjSearchPV(e.target.value); setPjOpenPV(true); }} onFocus={() => setPjOpenPV(true)} onBlur={() => setTimeout(() => setPjOpenPV(false), 200)} placeholder="Tastează nume, CUI sau cod..." />
                          {pjOpenPV && pjFiltPV.length > 0 && (
                            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 999, background: "#fff", border: "1px solid #1565c0", borderRadius: 6, boxShadow: "0 4px 16px rgba(0,0,0,.15)", maxHeight: 180, overflowY: "auto" }}>
                              {pjFiltPV.map((f, fi) => (<div key={fi} onMouseDown={() => fillPjPV(f)} style={{ padding: "6px 10px", fontSize: 12, cursor: "pointer", borderBottom: "1px solid #e3f2fd", display: "flex", gap: 8, alignItems: "center" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#e3f2fd")} onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}><span style={{ background: "#1565c0", color: "#fff", borderRadius: 4, padding: "1px 5px", fontSize: 10, fontWeight: 700 }}>{f.cod}</span><span style={{ fontWeight: 600, flex: 1 }}>{f.denumire}</span><span style={{ color: "#888", fontSize: 10 }}>{f.cod_fiscal}</span></div>))}
                            </div>
                          )}
                          {pv.client_denumire && <div style={{ marginTop: 4, background: "#e3f2fd", border: "1px solid #90caf9", borderRadius: 4, padding: "4px 10px", fontSize: 11, color: "#1565c0", display: "flex", gap: 6, alignItems: "center", justifyContent: "space-between" }}><span>✅ <strong>{pv.client_denumire}</strong> — {pv.client_cui}</span><button onMouseDown={() => { setPjSearchPV(""); setPV((p) => ({ ...p, client_id: "", client_denumire: "", client_adresa: "", client_cui: "", client_reg_com: "", client_judet: "" })); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 12, padding: 0 }}>✕</button></div>}
                        </div>
                        <div style={{ marginBottom: 7 }}><label style={LSt}>Reprezentant</label><input style={IFS} value={pv.client_reprezentant || ""} onChange={(e) => updPV("client_reprezentant", e.target.value)} placeholder="Nume reprezentant..." /></div>
                        <div style={{ marginBottom: 7 }}><label style={LSt}>Autorizație Mediu nr.</label><input style={IFS} value={pv.client_autorizatie || ""} onChange={(e) => updPV("client_autorizatie", e.target.value)} /></div>
                        <div><label style={LSt}>Autorizație Mediu — valabilă până</label><input style={IFS} value={pv.client_autorizatie_exp || ""} onChange={(e) => updPV("client_autorizatie_exp", e.target.value)} placeholder="DD.MM.YYYY" /></div>
                        {(() => {
                          // Find selected client and check for puncte_lucru
                          const selClient = pjList.find(f => f.denumire === pv.client_denumire);
                          const punctele = selClient?.puncte_lucru || [];
                          if (punctele.length === 0) return null;
                          const opts = [selClient.adresa || pv.client_adresa, ...punctele];
                          return (
                            <div style={{ marginTop: 7 }}>
                              <label style={LSt}>📍 Adresa Încărcare (Anexa 3)</label>
                              <select style={{ ...IFS, fontWeight: 600, color: "#1565c0" }} value={pv.adresa_incarcare || (selClient.adresa || pv.client_adresa)} onChange={(e) => updPV("adresa_incarcare", e.target.value)}>
                                {opts.map((adr, ai) => <option key={ai} value={adr}>{ai === 0 ? "🏢 Sediu social — " : `📍 Punct ${ai} — `}{adr}</option>)}
                              </select>
                              <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>Clientul are {punctele.length} {punctele.length === 1 ? "punct" : "puncte"} de lucru suplimentare. Alege de unde s-a făcut încărcarea.</div>
                            </div>
                          );
                        })()}
                      </div>

                      <div style={{ background: "#f3e5f5", border: "1px solid #ce93d8", borderRadius: 8, padding: 12 }}>
                        <div style={{ fontWeight: 700, color: "#6a1b9a", marginBottom: 8, fontSize: 12 }}>🚚 Transport</div>
                        <div style={{ marginBottom: 7 }}><label style={LSt}>Delegat (Șofer)</label>
                          <select style={IFS} value={pv.delegat || ""} onChange={(e) => updPV("delegat", e.target.value)}>
                            <option value="">— alege —</option>
                            {delegatiList.map((d) => <option key={d.id} value={d.nume}>{d.nume}</option>)}
                            {delegatiList.length === 0 && DELEGATI.map((d) => <option key={d}>{d}</option>)}
                          </select>
                          {delegatiList.length === 0 && <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>💡 Adaugă delegați în Variabile → Delegați</div>}
                        </div>
                        <div style={{ marginBottom: 7 }}><label style={LSt}>Nr. înmatriculare mijloc transport</label><input style={IFS} value={pv.nr_masina || ""} onChange={(e) => updPV("nr_masina", e.target.value)} placeholder="ex: IF55KFT" /></div>
                        <div style={{ marginBottom: 7 }}><label style={LSt}>Licență transport</label><input style={IFS} value={pv.licenta || ""} onChange={(e) => updPV("licenta", e.target.value)} /></div>
                        <div style={{ marginBottom: 7 }}><label style={LSt}>Expirare licență</label><input style={IFS} value={pv.licenta_exp || ""} onChange={(e) => updPV("licenta_exp", e.target.value)} placeholder="DD.MM.YYYY" /></div>
                        <div><label style={LSt}>Descriere destinație</label>
                          <select style={{ ...IFS, fontWeight: 700, color: "#6a1b9a" }} value={pv.destinatie || ""} onChange={(e) => updPV("destinatie", e.target.value)}>
                            <option value="">— alege —</option>
                            {DESTINATII.map((d) => <option key={d}>{d}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div style={{ flex: 1, minWidth: 320 }}>
                      <div style={{ background: "#fff8e1", border: "1px solid #ffd54f", borderRadius: 8, padding: 12 }}>
                        <div style={{ fontWeight: 700, color: "#e65100", marginBottom: 8, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span>📦 Materiale / Deșeuri</span>
                          {(() => {
                            const selC = pjList.find(f => f.denumire === pv.client_denumire);
                            if (!selC?.mat_tipice?.length) return null;
                            return (
                              <button onClick={() => {
                                const tipice = selC.mat_tipice || [];
                                const materialeNoi = tipice.map((t) => {
                                  const minV = parseFloat(t.min_kg) || 0;
                                  const maxV = parseFloat(t.max_kg) || 0;
                                  const cant = minV >= maxV ? (minV || "") : Math.round(minV + Math.random() * (maxV - minV));
                                  return { den: t.den || "", cod: "", cod_art: t.cod_art || "", cant: cant ? String(cant) : "" };
                                });
                                setPV(p => ({ ...p, materiale: materialeNoi }));
                              }} title="Regenerează cantități random din intervalele setate" style={{ background: "#fff8e1", border: "1px solid #ffa726", borderRadius: 5, padding: "2px 8px", cursor: "pointer", fontSize: 10, color: "#e65100", fontWeight: 600 }}>🎲 Regenerează kg</button>
                            );
                          })()}
                        </div>
                        <table style={{ borderCollapse: "collapse", width: "100%" }}>
                          <thead><tr><th style={th({ textAlign: "left", background: "#e65100", minWidth: 200 })}>Denumire</th><th style={th({ width: 85, background: "#e65100" })}>CodSAGA</th><th style={th({ width: 85, background: "#e65100" })}>Cant.(kg)</th><th style={th({ width: 26, background: "#e65100" })}></th></tr></thead>
                          <tbody>{pv.materiale.map((m, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fffde7" }}>
                              <td style={td()}><AC value={m.den} options={PRODUSE_DYN} placeholder="Selectează..." onChange={(v) => updPVMat(i, "den", v)} /></td>
                              <td style={td()}><input style={inp({ textAlign: "center" })} value={m.cod_art || ""} onChange={(e) => updPVMat(i, "cod_art", e.target.value)} /></td>
                              <td style={td()}><div style={{ display: "flex", gap: 2, alignItems: "center" }}><input style={inp({ textAlign: "right" })} type="number" value={m.cant} onChange={(e) => updPVMat(i, "cant", e.target.value)} />{scalePort && <button onClick={() => useScaleWeight(v => updPVMat(i, "cant", v))} title="Citește din cantar" style={{ background: scaleReading?.stable ? "#e8f5e9" : "#fff8e1", border: "1px solid #ccc", borderRadius: 3, padding: "1px 4px", cursor: "pointer", fontSize: 11 }}>⚖️</button>}</div></td>
                              <td style={td({ textAlign: "center", padding: 2 })}><button onClick={() => setPV((p) => ({ ...p, materiale: p.materiale.filter((_, j) => j !== i) }))} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button></td>
                            </tr>
                          ))}</tbody>
                        </table>
                        <button onClick={() => setPV((p) => ({ ...p, materiale: [...p.materiale, { den: "", cod: "", cod_art: "", cant: "" }] }))} style={{ marginTop: 6, background: "#e65100", color: "#fff", border: "none", borderRadius: 4, padding: "5px 12px", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>+ Adaugă material</button>
                      </div>
                    </div>
                  </div>
                )}

                {pvPreview && (
                  <div style={{ border: "1px solid #ccc", borderRadius: 4, padding: 8, background: "#fff" }}>
                    <PVPrint pv={pv} />
                  </div>
                )}
              </div>
            )}

            {pvSubTab === "registru" && (() => {
              const regPjMonths = [...new Set(pvList.map(p => monthOf(p.data)).filter(Boolean))].sort().reverse();
              const filteredPV = pvList.filter(p => {
                if (regPjMonth && monthOf(p.data) !== regPjMonth) return false;
                if (regPjSearch) {
                  const q = regPjSearch.toLowerCase();
                  const matMatch = (p.materiale || []).some(m => m.den?.toLowerCase().includes(q));
                  if (!(p.client_denumire?.toLowerCase().includes(q) || p.client_cui?.includes(q) || String(p.nr_pv).includes(q) || matMatch)) return false;
                }
                return true;
              });
              const totKgFilt = filteredPV.reduce((s, p) => s + (p.materiale || []).reduce((ss, m) => ss + (parseFloat(m.cant) || 0), 0), 0);
              return (
              <div>
                <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <SC label="Total PV-uri" value={filteredPV.length + " / " + pvList.length + " buc."} c="#e65100" bg="#fff3e0" />
                  <SC label="Total Cant." value={fmt(totKgFilt) + " kg"} c="#1565c0" bg="#e3f2fd" />
                  <button onClick={() => setPvSubTab("editor")} style={{ marginLeft: "auto", padding: "6px 14px", background: "#e65100", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ PV nou</button>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <select value={regPjMonth} onChange={(e) => setRegPjMonth(e.target.value)} style={{ border: "1px solid #ccc", borderRadius: 6, padding: "6px 10px", fontSize: 12, minWidth: 130 }}>
                    <option value="">📅 Toate lunile</option>
                    {regPjMonths.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <input type="text" placeholder="🔍 Caută client, CUI, nr PV, denumire material..." value={regPjSearch} onChange={(e) => setRegPjSearch(e.target.value)} style={{ border: "1px solid #ccc", borderRadius: 6, padding: "6px 10px", fontSize: 12, minWidth: 280, flex: 1 }} />
                  {(regPjMonth || regPjSearch) && <button onClick={() => { setRegPjMonth(""); setRegPjSearch(""); }} style={{ background: "#fff", border: "1px solid #c62828", color: "#c62828", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 12 }}>✕ Resetează</button>}
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 800 }}>
                    <thead><tr>
                      <th style={th({ background: "#e65100", width: 28 })}></th>
                      <th style={th({ background: "#e65100", width: 50 })}>Serie</th>
                      <th style={th({ background: "#e65100", width: 65 })}>Nr</th>
                      <th style={th({ background: "#e65100", width: 85 })}>Data</th>
                      <th style={th({ background: "#e65100", width: 165, textAlign: "left" })}>Furnizor</th>
                      <th style={th({ background: "#e65100", width: 110 })}>CUI</th>
                      <th style={th({ background: "#e65100", width: 200, textAlign: "left" })}>Denumire Deseu</th>
                      <th style={th({ background: "#e65100", width: 80 })}>Cant.(kg)</th>
                      <th style={th({ background: "#e65100", width: 70 })}>🖨️ Print</th>
                      <th style={th({ background: "#e65100", width: 30 })}></th>
                    </tr></thead>
                    <tbody>
                      {pvList.length === 0 && <tr><td colSpan={10} style={{ textAlign: "center", padding: 20, color: "#aaa" }}>Niciun PV salvat. Creează unul în Editor.</td></tr>}
                      {sortByDateAsc(filteredPV).flatMap((r, pi) => {
                        const mats = (r.materiale || []).filter(m => m.den);
                        if (!mats.length) return [];
                        return mats.map((m, mi) => {
                          const rowBg = pi % 2 === 0 ? "#fff" : "#fff8f5";
                          const isFirst = mi === 0;
                          return (
                            <tr key={`${r.id}-${mi}`} style={{ background: rowBg, borderTop: isFirst && pi > 0 ? "2px solid #ffcc80" : "1px solid #d0d0d0" }}>
                              <td style={td({ textAlign: "center", color: "#aaa", fontSize: 10, background: "#f5f5f5" })}>{pi + 1}</td>
                              <td style={td({ background: isFirst ? "#fff3e0" : rowBg, fontWeight: 700, color: "#e65100", textAlign: "center" })}>{isFirst ? r.serie : ""}</td>
                              <td style={td({ textAlign: "center", fontWeight: isFirst ? 700 : 400, color: isFirst ? "#1565c0" : "#aaa", background: rowBg })}>{isFirst ? r.nr_pv : ""}</td>
                              <td style={td({ textAlign: "center", color: isFirst ? "#333" : "#aaa", background: rowBg })}>{isFirst ? r.data : ""}</td>
                              <td style={td({ fontWeight: isFirst ? 600 : 400, color: isFirst ? "#333" : "#aaa", background: rowBg })}>{isFirst ? r.client_denumire : ""}</td>
                              <td style={td({ fontFamily: "monospace", fontSize: 11, color: isFirst ? "#333" : "#aaa", background: rowBg })}>{isFirst ? r.client_cui : ""}</td>
                              <td style={td({ background: rowBg })}>{m.den.toUpperCase()} <span style={{ color: "#888", fontSize: 10 }}>({m.cod})</span></td>
                              <td style={td({ textAlign: "right", background: "#e8f5e9", fontWeight: 700, color: G })}>{fmt(m.cant)}</td>
                              <td style={td({ textAlign: "center", padding: 3, background: rowBg })}>
                                {isFirst && (
                                  <button onClick={() => printRegistruPV(r.id)} title={`Printează PV ${r.serie} ${r.nr_pv}`} style={{ background: "#e3f2fd", border: "1px solid #90caf9", borderRadius: 4, cursor: "pointer", color: "#1565c0", fontSize: 11, fontWeight: 700, padding: "2px 8px" }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = "#1565c0"; e.currentTarget.style.color = "#fff"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = "#e3f2fd"; e.currentTarget.style.color = "#1565c0"; }}
                                  >🖨️ {mats.length > 1 ? `(${mats.length})` : ""}</button>
                                )}
                              </td>
                              <td style={td({ textAlign: "center", padding: 3, background: rowBg })}>{isFirst && <button onClick={() => delPV(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button>}</td>
                            </tr>
                          );
                        });
                      })}
                    </tbody>
                    <tfoot><tr style={{ background: "#e65100", color: "#fff" }}><td colSpan={7} style={{ padding: "6px 10px", fontWeight: 700, fontSize: 12 }}>TOTAL</td><td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(totKgFilt)} kg</td><td colSpan={2}></td></tr></tfoot>
                  </table>
                </div>
              </div>
              );
            })()}

            {pvSubTab === "pj" && (
              <div>
                <div style={{ background: "linear-gradient(135deg,#fff3e0,#fff8f5)", border: "2px solid #ffcc80", borderRadius: 10, padding: 12, marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, color: "#e65100", fontSize: 13, marginBottom: 10 }}>🔍 Caută firmă după CUI</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
                    <div style={{ flex: "0 0 210px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <input value={cuiSearch} onChange={(e) => { setCuiSearch(e.target.value); setCuiResult(null); setCuiErr(""); }} onKeyDown={(e) => e.key === "Enter" && searchCUI()} placeholder="ex: 36191378" style={{ ...IFS, borderColor: "#ffcc80", fontFamily: "monospace" }} />
                        <button onClick={searchCUI} disabled={cuiLoading} style={{ padding: "5px 12px", background: cuiLoading ? "#ccc" : "#e65100", color: "#fff", border: "none", borderRadius: 6, cursor: cuiLoading ? "wait" : "pointer", fontSize: 12, fontWeight: 700 }}>{cuiLoading ? "⏳" : "🔎"}</button>
                      </div>
                      {cuiErr && <div style={{ marginTop: 5, background: "#ffebee", border: "1px solid #ef9a9a", borderRadius: 5, padding: "5px 8px", fontSize: 11, color: "#c62828" }}>{cuiErr}</div>}
                    </div>
                    {cuiResult && !cuiLoading && (<div style={{ flex: 1, minWidth: 260, background: "#fff", border: "2px solid #a5d6a7", borderRadius: 8, padding: 10 }}><div style={{ fontWeight: 700, color: G, fontSize: 12, marginBottom: 6 }}>✅ Date găsite</div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 10px", fontSize: 12 }}>{[["Denumire", cuiResult.denumire], ["CUI", cuiResult.cod_fiscal], ["Adresă", cuiResult.adresa], ["Reg.Com.", cuiResult.reg_com], ["Județ", cuiResult.judet], ["Tel.", cuiResult.tel]].map(([l, v]) => v ? (<div key={l}><span style={{ color: "#888", fontSize: 10 }}>{l}: </span><strong>{v}</strong></div>) : null)}</div><div style={{ display: "flex", gap: 8, marginTop: 8 }}><button onClick={importCUI} style={{ padding: "6px 14px", background: G, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>⬇️ Importă</button><button onClick={() => setCuiResult(null)} style={{ padding: "6px 10px", background: "#f5f5f5", border: "1px solid #ccc", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>✕</button></div></div>)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
                  <SC label="Total Firme" value={pjList.length + " firme"} c="#e65100" bg="#fff3e0" />
                  <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                    <input value={pjFilter} onChange={(e) => setPjFilter(e.target.value)} placeholder="🔍 Caută..." style={{ border: "1px solid #ccc", borderRadius: 6, padding: "5px 10px", fontSize: 12, width: 180 }} />
                    <button onClick={addPJ} style={{ padding: "6px 12px", background: "#e65100", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Adaugă</button>
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 900 }}>
                    <thead><tr><th style={th({ background: "#b71c1c", width: 28 })}></th>{[{ l: "Cod", w: 55 }, { l: "Denumire", w: 185 }, { l: "CUI", w: 105 }, { l: "Analitic", w: 82 }, { l: "Jud.", w: 45 }, { l: "Adresa", w: 180 }, { l: "Cont Bancă", w: 165 }, { l: "Bancă", w: 130 }, { l: "Reg.Com.", w: 100 }, { l: "Tel.", w: 90 }].map((c) => <th key={c.l} style={{ ...th({ background: "#e65100" }), width: c.w, textAlign: "left" }}>{c.l}</th>)}<th style={th({ background: "#e65100", width: 30 })}></th></tr></thead>
                    <tbody>{pjList.filter((r) => !pjFilter || r.denumire?.toLowerCase().includes(pjFilter.toLowerCase()) || r.cod?.includes(pjFilter) || r.cod_fiscal?.toLowerCase().includes(pjFilter.toLowerCase())).map((r, i) => { const rowBg = i % 2 === 0 ? "#fff" : "#fff8f5"; return (<tr key={r.id || i} style={{ background: rowBg }}><td style={td({ textAlign: "center", color: "#aaa", fontSize: 10, background: "#f5f5f5" })}>{i + 2}</td><td style={td({ background: "#fff3e0", fontWeight: 700, color: "#e65100", textAlign: "center" })}><input style={inp({ textAlign: "center", fontWeight: 700, color: "#e65100" })} value={r.cod || ""} onChange={(e) => updPJ(i, "cod", e.target.value)} /></td><td style={td({ fontWeight: 600 })}><input style={inp({ fontWeight: 600, fontSize: 11 })} value={r.denumire || ""} onChange={(e) => updPJ(i, "denumire", e.target.value)} /></td><td style={td({ background: "#fff8e1" })}><input style={inp({ fontFamily: "monospace", fontSize: 11 })} value={r.cod_fiscal || ""} onChange={(e) => updPJ(i, "cod_fiscal", e.target.value)} /></td><td style={td()}><input style={inp({ fontSize: 11 })} value={r.analitic || ""} onChange={(e) => updPJ(i, "analitic", e.target.value)} /></td><td style={td({ background: "#e8f5e9", textAlign: "center", fontWeight: 600, color: G })}><input style={inp({ textAlign: "center", fontWeight: 600, color: G })} value={r.judet || ""} onChange={(e) => updPJ(i, "judet", e.target.value)} /></td><td style={td({ fontSize: 11 })}><div style={{ display: "flex", gap: 4 }}><input style={inp({ fontSize: 11 })} value={r.adresa || ""} onChange={(e) => updPJ(i, "adresa", e.target.value)} /><button onClick={() => { setPuncteModal({ idx: i, adrese: [...(r.puncte_lucru || [])] }); }} style={{ background: (r.puncte_lucru?.length || 0) > 0 ? "#e3f2fd" : "#fff", border: "1px solid #1565c0", borderRadius: 3, padding: "2px 6px", cursor: "pointer", fontSize: 10, color: "#1565c0", whiteSpace: "nowrap" }} title="Puncte de lucru (adrese suplimentare ridicare)">📍 {r.puncte_lucru?.length || 0}</button><button onClick={() => { setMatTipiceModal({ idx: i, den: r.denumire || "", items: JSON.parse(JSON.stringify(r.mat_tipice || [])) }); }} style={{ background: (r.mat_tipice?.length || 0) > 0 ? "#fff8e1" : "#fff", border: "1px solid #e65100", borderRadius: 3, padding: "2px 6px", cursor: "pointer", fontSize: 10, color: "#e65100", whiteSpace: "nowrap" }} title="Materiale tipice (auto-completare PV)">🗂️ {r.mat_tipice?.length || 0}</button></div></td><td style={td({ background: r.cont_banca ? "#e8f5e9" : "#fff", fontFamily: "monospace", fontSize: 10 })}><input style={inp({ fontFamily: "monospace", fontSize: 10 })} value={r.cont_banca || ""} onChange={(e) => updPJ(i, "cont_banca", e.target.value)} /></td><td style={td({ fontSize: 11 })}><input style={inp({ fontSize: 11 })} value={r.banca || ""} onChange={(e) => updPJ(i, "banca", e.target.value)} /></td><td style={td({ fontFamily: "monospace", fontSize: 11 })}><input style={inp({ fontFamily: "monospace", fontSize: 11 })} value={r.reg_com || ""} onChange={(e) => updPJ(i, "reg_com", e.target.value)} /></td><td style={td({ fontSize: 11 })}><input style={inp({ fontSize: 11 })} value={r.tel || ""} onChange={(e) => updPJ(i, "tel", e.target.value)} /></td><td style={td({ textAlign: "center", padding: 3 })}><button onClick={() => delPJ(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button></td></tr>); })}</tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ CHELTUIELI ══ */}
        {tab === "cheltuieli" && (() => {
          const chFiltered = sortByDateAsc(chRows.filter(r => {
            if (chMonth && monthOf(r.data) !== chMonth) return false;
            if (chCat && r.cat !== chCat) return false;
            if (chAchitat && r.ach !== chAchitat) return false;
            if (chAchDe && r.ach_de !== chAchDe) return false;
            if (chSearch) { const q = chSearch.toLowerCase(); if (!(r.det?.toLowerCase().includes(q) || r.note?.toLowerCase().includes(q) || String(r.suma).includes(q))) return false; }
            return true;
          }));
          const chMonthOpts = [...new Set(chRows.map(r => monthOf(r.data)).filter(Boolean))].sort();
          return (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
              <SC label="Total filtrat" value={fmt(chFiltered.reduce((s, r) => s + parseSuma(r.suma), 0)) + " lei"} c="#1565c0" bg="#e3f2fd" />
              <SC label="✅ Achitat" value={fmt(chFiltered.filter((r) => r.ach === "Da").reduce((s, r) => s + parseSuma(r.suma), 0)) + " lei"} c={G} bg="#e8f5e9" />
              <SC label="⏳ Neachitat" value={fmt(chFiltered.filter((r) => r.ach === "Nu").reduce((s, r) => s + parseSuma(r.suma), 0)) + " lei"} c="#c62828" bg="#ffebee" />
              <SC label="Înregistrări" value={chFiltered.length + " / " + chRows.length} c="#6a1b9a" bg="#f3e5f5" />
            </div>
            <div style={{ background: "#f5f5f5", border: "1px solid #ddd", borderRadius: 8, padding: 10, marginBottom: 10, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input value={chSearch} onChange={(e) => setChSearch(e.target.value)} placeholder="🔍 Caută detalii, sumă, note..." style={{ flex: 1, minWidth: 180, border: "1px solid #ccc", borderRadius: 5, padding: "5px 10px", fontSize: 12 }} />
              <select value={chMonth} onChange={(e) => setChMonth(e.target.value)} style={{ border: "1px solid #ccc", borderRadius: 5, padding: "5px 8px", fontSize: 12 }}>
                <option value="">📅 Toate lunile</option>
                {chMonthOpts.map(m => <option key={m}>{m}</option>)}
              </select>
              <select value={chCat} onChange={(e) => setChCat(e.target.value)} style={{ border: "1px solid #ccc", borderRadius: 5, padding: "5px 8px", fontSize: 12 }}>
                <option value="">📂 Toate categoriile</option>
                {CATEGORIE_CH.map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={chAchitat} onChange={(e) => setChAchitat(e.target.value)} style={{ border: "1px solid #ccc", borderRadius: 5, padding: "5px 8px", fontSize: 12 }}>
                <option value="">💰 Toate</option>
                <option value="Da">✅ Achitat</option>
                <option value="Nu">⏳ Neachitat</option>
              </select>
              <select value={chAchDe} onChange={(e) => setChAchDe(e.target.value)} style={{ border: "1px solid #ccc", borderRadius: 5, padding: "5px 8px", fontSize: 12 }}>
                <option value="">👤 Toți</option>
                {achitatOptions.map(o => <option key={o}>{o}</option>)}
              </select>
              {(chSearch || chMonth || chCat || chAchitat || chAchDe) && <button onClick={() => { setChSearch(""); setChMonth(""); setChCat(""); setChAchitat(""); setChAchDe(""); }} style={{ background: "#e53935", color: "#fff", border: "none", borderRadius: 5, padding: "5px 10px", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>✕ Reset</button>}
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <colgroup>
                  <col style={{ width: 28 }} />
                  <col style={{ width: 130 }} />
                  <col style={{ width: 82 }} />
                  <col style={{ width: 90 }} />
                  <col style={{ width: 100 }} />
                  <col />
                  <col style={{ width: 75 }} />
                  <col style={{ width: 90 }} />
                  <col style={{ width: 200 }} />
                  <col style={{ width: 28 }} />
                </colgroup>
                <thead><tr>
                  <th style={th({})}></th>
                  <th style={th({ textAlign: "center" })}>Data</th>
                  <th style={th({ textAlign: "center" })}>GK/Deee</th>
                  <th style={th({ textAlign: "center" })}>Total (lei)</th>
                  <th style={th({ textAlign: "center" })}>Categorie</th>
                  <th style={th({ textAlign: "left" })}>Detalii</th>
                  <th style={th({ textAlign: "center" })}>Achitat</th>
                  <th style={th({ textAlign: "center" })}>Achitat De</th>
                  <th style={th({ textAlign: "left" })}>Note</th>
                  <th style={th({})}></th>
                </tr></thead>
                <tbody>{chFiltered.map((r, idx) => { const i = chRows.indexOf(r); const rowBg = idx % 2 === 0 ? "#fff" : "#f7faf8"; const achBg = r.ach === "Da" ? "#e8f5e9" : r.ach === "Nu" ? "#ffebee" : "#fff"; const achC = r.ach === "Da" ? G : r.ach === "Nu" ? "#c62828" : "#555"; return (<tr key={r.id || i} style={{ background: rowBg }}><td style={td({ textAlign: "center", color: "#aaa", fontSize: 10, background: "#f5f5f5" })}>{idx + 2}</td><td style={td({ background: rowBg })}><DateInput value={r.data || ""} onChange={(v) => updCH(i, "data", v)} /></td><td style={td({ background: "#fffde7" })}><select style={sel({ textAlign: "center" })} value={r.gk || ""} onChange={(e) => updCH(i, "gk", e.target.value)}>{GREENKRAFT_OPT.map((o) => <option key={o}>{o}</option>)}</select></td><td style={td({ background: rowBg })}><input style={inp({ textAlign: "right" })} value={r.suma || ""} onChange={(e) => updCH(i, "suma", e.target.value)} /></td><td style={td({ background: "#fffde7" })}><select style={sel({ textAlign: "center" })} value={r.cat || ""} onChange={(e) => updCH(i, "cat", e.target.value)}>{CATEGORIE_CH.map((o) => <option key={o}>{o}</option>)}</select></td><td style={td({ background: rowBg })}><input style={inp({ textAlign: "center" })} value={r.det || ""} onChange={(e) => updCH(i, "det", e.target.value)} /></td><td style={td({ background: achBg })}><select style={sel({ color: achC, fontWeight: 700, textAlign: "center" })} value={r.ach || ""} onChange={(e) => updCH(i, "ach", e.target.value)}><option value=""></option><option>Da</option><option>Nu</option></select></td><td style={td({ background: "#fffde7" })}><AC value={r.ach_de || ""} options={achitatOptions} onChange={(v) => updCH(i, "ach_de", v)} placeholder="—" /></td><td style={td({ background: rowBg })}><input style={inp({ textAlign: "center" })} value={r.note || ""} onChange={(e) => updCH(i, "note", e.target.value)} /></td><td style={td({ textAlign: "center", padding: 3 })}><button onClick={() => delCH(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button></td></tr>); })}</tbody>
                <tfoot><tr style={{ background: G, color: "#fff" }}><td></td><td colSpan={2} style={{ padding: "6px 10px", fontWeight: 700, fontSize: 12 }}>TOTAL</td><td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(chFiltered.reduce((s, r) => s + parseSuma(r.suma), 0))}</td><td colSpan={5}></td><td></td></tr></tfoot>
              </table>
            </div>
            <AddBtn onClick={addCH} label="+ Adaugă cheltuială" />
          </div>
          );
        })()}

        {/* ══ COLECTARI ══ */}
        {tab === "colectari" && (() => {
          const colFiltered = sortByDateAsc(colRows.filter(r => {
            if (colMonth && monthOf(r.data) !== colMonth) return false;
            if (colCat && r.cat !== colCat) return false;
            if (colAgent && r.agent !== colAgent) return false;
            if (colAchitat && r.ach !== colAchitat) return false;
            if (colSearch) { const q = colSearch.toLowerCase(); if (!(r.furn?.toLowerCase().includes(q) || r.produs?.toLowerCase().includes(q) || r.ach_de?.toLowerCase().includes(q))) return false; }
            return true;
          }));
          const colMonthOpts = [...new Set(colRows.map(r => monthOf(r.data)).filter(Boolean))].sort();
          return (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
              <SC label="Total Cant." value={fmt(colFiltered.reduce((s, r) => s + (parseFloat(r.cant) || 0), 0)) + " kg"} c="#1565c0" bg="#e3f2fd" />
              <SC label="Total Valoare" value={fmt(colFiltered.reduce((s, r) => s + (parseFloat(r.cant) || 0) * (parseFloat(r.pret) || 0), 0)) + " lei"} c={G} bg="#e8f5e9" />
              <SC label="Înregistrări" value={colFiltered.length + " / " + colRows.length} c="#6a1b9a" bg="#f3e5f5" />
            </div>
            <div style={{ background: "#f5f5f5", border: "1px solid #ddd", borderRadius: 8, padding: 10, marginBottom: 10, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input value={colSearch} onChange={(e) => setColSearch(e.target.value)} placeholder="🔍 Caută furnizor, produs, achitat de..." style={{ flex: 1, minWidth: 180, border: "1px solid #ccc", borderRadius: 5, padding: "5px 10px", fontSize: 12 }} />
              <select value={colMonth} onChange={(e) => setColMonth(e.target.value)} style={{ border: "1px solid #ccc", borderRadius: 5, padding: "5px 8px", fontSize: 12 }}>
                <option value="">📅 Toate lunile</option>
                {colMonthOpts.map(m => <option key={m}>{m}</option>)}
              </select>
              <select value={colCat} onChange={(e) => setColCat(e.target.value)} style={{ border: "1px solid #ccc", borderRadius: 5, padding: "5px 8px", fontSize: 12 }}>
                <option value="">📂 Toate cat.</option>
                {CATEGORIE_COL.map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={colAgent} onChange={(e) => setColAgent(e.target.value)} style={{ border: "1px solid #ccc", borderRadius: 5, padding: "5px 8px", fontSize: 12 }}>
                <option value="">👤 Toți agenții</option>
                {agentOptions.map(a => <option key={a}>{a}</option>)}
              </select>
              <select value={colAchitat} onChange={(e) => setColAchitat(e.target.value)} style={{ border: "1px solid #ccc", borderRadius: 5, padding: "5px 8px", fontSize: 12 }}>
                <option value="">💰 Toate</option>
                <option value="Da">✅ Achitat</option>
                <option value="Nu">⏳ Neachitat</option>
              </select>
              {(colSearch || colMonth || colCat || colAgent || colAchitat) && <button onClick={() => { setColSearch(""); setColMonth(""); setColCat(""); setColAgent(""); setColAchitat(""); }} style={{ background: "#e53935", color: "#fff", border: "none", borderRadius: 5, padding: "5px 10px", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>✕ Reset</button>}
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <colgroup>
                  <col style={{ width: 28 }} />
                  <col style={{ width: 130 }} />
                  <col style={{ width: 90 }} />
                  <col style={{ width: 100 }} />
                  <col style={{ width: 80 }} />
                  <col />
                  <col style={{ width: 75 }} />
                  <col style={{ width: 65 }} />
                  <col style={{ width: 78 }} />
                  <col style={{ width: 82 }} />
                  <col style={{ width: 75 }} />
                  <col style={{ width: 90 }} />
                  <col style={{ width: 28 }} />
                </colgroup>
                <thead><tr>
                  <th style={th({})}></th>
                  <th style={th({ textAlign: "center" })}>Data</th>
                  <th style={th({ textAlign: "center" })}>Agent</th>
                  <th style={th({ textAlign: "center" })}>Furnizor</th>
                  <th style={th({ textAlign: "center" })}>Categorie</th>
                  <th style={th({ textAlign: "left" })}>Produs</th>
                  <th style={th({ textAlign: "center" })}>Cant.(kg)</th>
                  <th style={th({ textAlign: "center" })}>Preț</th>
                  <th style={th({ textAlign: "center" })}>Total (lei)</th>
                  <th style={th({ textAlign: "center" })}>Fără Imp.12%</th>
                  <th style={th({ textAlign: "center" })}>Achitat</th>
                  <th style={th({ textAlign: "center" })}>Achitat De</th>
                  <th style={th({})}></th>
                </tr></thead>
                <tbody>{colFiltered.map((r, idx) => { const i = colRows.indexOf(r); const tot = (parseFloat(r.cant) || 0) * (parseFloat(r.pret) || 0); const faraImp = tot ? +(tot * 0.88).toFixed(2) : 0; const rowBg = idx % 2 === 0 ? "#fff" : "#f8fbf9"; const achBg = r.ach === "Da" ? "#e8f5e9" : r.ach === "Nu" ? "#ffebee" : "#fff"; return (<tr key={r.id || i} style={{ background: rowBg }}><td style={td({ textAlign: "center", color: "#aaa", fontSize: 10, background: "#f5f5f5" })}>{idx + 2}</td><td style={td({ background: rowBg })}><DateInput value={r.data || ""} onChange={(v) => updCOL(i, "data", v)} /></td><td style={td({ background: rowBg })}><AC value={r.agent || ""} options={agentOptions} onChange={(v) => updCOL(i, "agent", v)} placeholder="—" /></td><td style={td({ background: rowBg })}><AC value={r.furn || ""} options={furnOptions} onChange={(v) => updCOL(i, "furn", v)} placeholder="—" /></td><td style={td({ background: COL_COLORS[r.cat] || "#eee", textAlign: "center" })}><select style={sel({ fontWeight: 600, textAlign: "center" })} value={r.cat || ""} onChange={(e) => updCOL(i, "cat", e.target.value)}>{CATEGORIE_COL.map((o) => <option key={o}>{o}</option>)}</select></td><td style={td({ background: rowBg })}><AC value={r.produs || ""} options={PRODUSE_DYN} onChange={(v) => updCOL(i, "produs", v)} /></td><td style={td({ background: rowBg })}><div style={{ display: "flex", gap: 2, alignItems: "center" }}><input style={inp({ textAlign: "right" })} type="number" value={r.cant || ""} onChange={(e) => updCOL(i, "cant", e.target.value)} />{scalePort && <button onClick={() => useScaleWeight(v => updCOL(i, "cant", v))} title="Citește din cantar" style={{ background: scaleReading?.stable ? "#e8f5e9" : "#fff8e1", border: "1px solid #ccc", borderRadius: 3, padding: "1px 4px", cursor: "pointer", fontSize: 11 }}>⚖️</button>}</div></td><td style={td({ background: rowBg })}><input style={inp({ textAlign: "right" })} type="number" value={r.pret || ""} onChange={(e) => updCOL(i, "pret", e.target.value)} /></td><td style={td({ textAlign: "right", background: "#f0f4f0", fontWeight: 600 })}>{tot > 0 ? fmt(tot) : "0,00"}</td><td style={td({ textAlign: "right", background: "#fce4d6", fontWeight: 600, color: "#bf360c" })}>{faraImp > 0 ? fmt(faraImp) : "0,00"}</td><td style={td({ background: achBg })}><select style={sel({ color: r.ach === "Da" ? G : r.ach === "Nu" ? "#c62828" : "#555", fontWeight: 700, textAlign: "center" })} value={r.ach || ""} onChange={(e) => updCOL(i, "ach", e.target.value)}><option value=""></option><option>Da</option><option>Nu</option></select></td><td style={td({ background: r.ach_de ? "#ffe0b2" : "#fff" })}><AC value={r.ach_de || ""} options={achitatOptions} onChange={(v) => updCOL(i, "ach_de", v)} placeholder="—" /></td><td style={td({ textAlign: "center", padding: 3 })}><button onClick={() => delCOL(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button></td></tr>); })}</tbody>
                <tfoot><tr style={{ background: G, color: "#fff" }}><td colSpan={6} style={{ padding: "6px 10px", fontWeight: 700, fontSize: 12 }}>TOTAL</td><td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(colFiltered.reduce((s, r) => s + (parseFloat(r.cant) || 0), 0))} kg</td><td></td><td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(colFiltered.reduce((s, r) => s + (parseFloat(r.cant) || 0) * (parseFloat(r.pret) || 0), 0))}</td><td colSpan={4}></td></tr></tfoot>
              </table>
            </div>
            <AddBtn onClick={addCOL} label="+ Adaugă colectare" />
          </div>
          );
        })()}

        {/* ══ LIVRARI ══ */}
        {tab === "livrari" && (() => {
          const livFiltered = sortByDateAsc(livRows.filter(r => {
            if (livMonth && monthOf(r.data) !== livMonth) return false;
            if (livClient && r.client !== livClient) return false;
            if (livSearch) { const q = livSearch.toLowerCase(); if (!(r.client?.toLowerCase().includes(q) || r.produs?.toLowerCase().includes(q) || r.det?.toLowerCase().includes(q) || String(r.nr).includes(q))) return false; }
            return true;
          }));
          const livMonthOpts = [...new Set(livRows.map(r => monthOf(r.data)).filter(Boolean))].sort();
          return (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
              <SC label="Total Cant." value={fmt(livFiltered.reduce((s, r) => s + (parseFloat(r.cant) || 0), 0)) + " kg"} c="#1565c0" bg="#e3f2fd" />
              <SC label="Total Valoare" value={fmt(livFiltered.reduce((s, r) => s + (parseFloat(r.cant) || 0) * (parseFloat(r.pret) || 0), 0)) + " lei"} c={G} bg="#e8f5e9" />
              <SC label="✅ Încasat" value={fmt(livFiltered.filter((r) => r.inc === "DA").reduce((s, r) => s + (parseFloat(r.cant) || 0) * (parseFloat(r.pret) || 0), 0)) + " lei"} c="#2e7d32" bg="#c8e6c9" />
              <SC label="Înregistrări" value={livFiltered.length + " / " + livRows.length} c="#6a1b9a" bg="#f3e5f5" />
            </div>
            <div style={{ background: "#f5f5f5", border: "1px solid #ddd", borderRadius: 8, padding: 10, marginBottom: 10, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input value={livSearch} onChange={(e) => setLivSearch(e.target.value)} placeholder="🔍 Caută client, produs, nr factură, detalii..." style={{ flex: 1, minWidth: 180, border: "1px solid #ccc", borderRadius: 5, padding: "5px 10px", fontSize: 12 }} />
              <select value={livMonth} onChange={(e) => setLivMonth(e.target.value)} style={{ border: "1px solid #ccc", borderRadius: 5, padding: "5px 8px", fontSize: 12 }}>
                <option value="">📅 Toate lunile</option>
                {livMonthOpts.map(m => <option key={m}>{m}</option>)}
              </select>
              <select value={livClient} onChange={(e) => setLivClient(e.target.value)} style={{ border: "1px solid #ccc", borderRadius: 5, padding: "5px 8px", fontSize: 12 }}>
                <option value="">🏢 Toți clienții</option>
                {clientOptions.map(c => <option key={c}>{c}</option>)}
              </select>
              {(livSearch || livMonth || livClient) && <button onClick={() => { setLivSearch(""); setLivMonth(""); setLivClient(""); }} style={{ background: "#e53935", color: "#fff", border: "none", borderRadius: 5, padding: "5px 10px", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>✕ Reset</button>}
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%", tableLayout: "fixed" }}>
                <colgroup><col style={{ width: 28 }} /><col style={{ width: 130 }} /><col style={{ width: 55 }} /><col style={{ width: 180 }} /><col /><col style={{ width: 75 }} /><col style={{ width: 65 }} /><col style={{ width: 85 }} /><col style={{ width: 80 }} /><col style={{ width: 80 }} /><col style={{ width: 130 }} /><col style={{ width: 28 }} /></colgroup>
                <thead><tr>
                  <th style={th({})}></th>
                  <th style={th({ textAlign: "center" })}>Data</th>
                  <th style={th({ textAlign: "center" })}>Nr.</th>
                  <th style={th({ textAlign: "center" })}>Client</th>
                  <th style={th({ textAlign: "left" })}>Produs</th>
                  <th style={th({ textAlign: "center" })}>Cant.(kg)</th>
                  <th style={th({ textAlign: "center" })}>Preț</th>
                  <th style={th({ textAlign: "center" })}>Total (lei)</th>
                  <th style={th({ textAlign: "center" })}>Facturat</th>
                  <th style={th({ textAlign: "center" })}>Încasat</th>
                  <th style={th({ textAlign: "left" })}>Detalii</th>
                  <th style={th({})}></th>
                </tr></thead>
                <tbody>{livFiltered.map((r, idx) => { const i = livRows.indexOf(r); const tot = (parseFloat(r.cant) || 0) * (parseFloat(r.pret) || 0); const rowBg = idx % 2 === 0 ? "#fff" : "#f8fbf9"; return (<tr key={r.id || i} style={{ background: rowBg }}><td style={td({ textAlign: "center", color: "#aaa", fontSize: 10, background: "#f5f5f5" })}>{idx + 2}</td><td style={td({ background: rowBg })}><DateInput value={r.data || ""} onChange={(v) => updLIV(i, "data", v)} /></td><td style={td({ background: rowBg })}><input style={inp({ textAlign: "center" })} value={r.nr || ""} onChange={(e) => updLIV(i, "nr", e.target.value)} /></td><td style={td({ background: "#fffde7" })}><AC value={r.client || ""} options={clientOptions} onChange={(v) => updLIV(i, "client", v)} placeholder="—" /></td><td style={{ ...td({ background: rowBg }), overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.produs}><AC value={r.produs || ""} options={PRODUSE_DYN} onChange={(v) => updLIV(i, "produs", v)} /></td><td style={td({ background: rowBg })}><input style={inp({ textAlign: "right" })} type="number" value={r.cant || ""} onChange={(e) => updLIV(i, "cant", e.target.value)} /></td><td style={td({ background: rowBg })}><input style={inp({ textAlign: "right" })} type="number" value={r.pret || ""} onChange={(e) => updLIV(i, "pret", e.target.value)} /></td><td style={td({ textAlign: "right", background: "#f0f4f0", fontWeight: 600 })}>{tot > 0 ? fmt(tot) : "0,00"}</td><td style={td({ background: r.fact === "DA" ? "#e8f5e9" : r.fact === "NU" ? "#ffebee" : "#fff", textAlign: "center" })}><select style={sel({ color: r.fact === "DA" ? G : r.fact === "NU" ? "#c62828" : "#555", fontWeight: 700, textAlign: "center" })} value={r.fact || ""} onChange={(e) => updLIV(i, "fact", e.target.value)}><option value=""></option><option>DA</option><option>NU</option></select></td><td style={td({ background: r.inc === "DA" ? "#c8e6c9" : r.inc === "NU" ? "#ffebee" : "#fff", textAlign: "center" })}><select style={sel({ color: r.inc === "DA" ? G : r.inc === "NU" ? "#c62828" : "#555", fontWeight: 700, textAlign: "center" })} value={r.inc || ""} onChange={(e) => updLIV(i, "inc", e.target.value)}><option value=""></option><option>DA</option><option>NU</option></select></td><td style={{ ...td({ background: rowBg }), overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.det}><input style={inp()} value={r.det || ""} onChange={(e) => updLIV(i, "det", e.target.value)} placeholder="..." /></td><td style={td({ textAlign: "center", padding: 3 })}><button onClick={() => delLIV(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button></td></tr>); })}</tbody>
                <tfoot><tr style={{ background: G, color: "#fff" }}><td colSpan={5} style={{ padding: "6px 10px", fontWeight: 700, fontSize: 12 }}>TOTAL</td><td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(livFiltered.reduce((s, r) => s + (parseFloat(r.cant) || 0), 0))} kg</td><td></td><td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(livFiltered.reduce((s, r) => s + (parseFloat(r.cant) || 0) * (parseFloat(r.pret) || 0), 0))}</td><td colSpan={4}></td></tr></tfoot>
              </table>
            </div>
            <AddBtn onClick={addLIV} label="+ Adaugă livrare" />
          </div>
          );
        })()}

        {/* ══ VARIABILE (Produse + Delegati) ══ */}
        {tab === "produse" && (() => {
          const addProdus = async () => {
            const den = window.prompt("Denumire produs nou:");
            if (!den || !den.trim()) return;
            const cod = window.prompt("Cod HG 856 (ex: 15 01 01):") || "";
            const cod_art = window.prompt("Cod SAGA (ex: 000123):") || "";
            try {
              const { error } = await sb.from("produse").insert({ den: den.trim(), cod: cod.trim(), cod_art: cod_art.trim() });
              if (error) alert("Eroare: " + error.message);
              else await logAction("add", "produse", "", { den });
            } catch (e) { alert("Eroare: " + e.message); }
          };
          const updProdus = async (id, field, value) => {
            try {
              const { error } = await sb.from("produse").update({ [field]: value }).eq("id", id);
              if (error) alert("Eroare: " + error.message);
            } catch (e) { alert("Eroare: " + e.message); }
          };
          const delProdus = async (id, den) => {
            if (!confirmDel(`produsul "${den}"`)) return;
            try {
              const { error } = await sb.from("produse").delete().eq("id", id);
              if (error) alert("Eroare: " + error.message);
              else await logAction("delete", "produse", id, { den });
            } catch (e) { alert("Eroare: " + e.message); }
          };

          const addDelegat = async () => {
            const nume = window.prompt("Nume complet șofer/delegat:");
            if (!nume || !nume.trim()) return;
            const ci_serie = window.prompt("Serie CI (opțional, ex: AB):") || "";
            const ci_numar = window.prompt("Număr CI (opțional, ex: 123456):") || "";
            const cnp = window.prompt("CNP (opțional):") || "";
            try {
              const { error } = await sb.from("delegati").insert({ nume: nume.trim(), ci_serie: ci_serie.trim(), ci_numar: ci_numar.trim(), cnp: cnp.trim() });
              if (error) alert("Eroare: " + error.message);
              else await logAction("add", "delegati", "", { nume });
            } catch (e) { alert("Eroare: " + e.message); }
          };
          const updDelegat = async (id, field, value) => {
            try { await sb.from("delegati").update({ [field]: value }).eq("id", id); } catch (e) { alert("Eroare: " + e.message); }
          };
          const delDelegat = async (id, nume) => {
            if (!confirmDel(`delegatul "${nume}"`)) return;
            try {
              await sb.from("delegati").delete().eq("id", id);
              await logAction("delete", "delegati", id, { nume });
            } catch (e) { alert("Eroare: " + e.message); }
          };

          const subTabSt = (k) => ({ padding: "8px 16px", borderRadius: "8px 8px 0 0", cursor: "pointer", fontSize: 13, fontWeight: 600, border: "1px solid #ccc", borderBottom: varSubTab === k ? "1px solid #fff" : "1px solid #ccc", background: varSubTab === k ? "#fff" : "#f0f0f0", color: varSubTab === k ? G : "#666", marginRight: 4, position: "relative", top: 1 });

          return (
            <div style={{ padding: 16 }}>
              <div style={{ background: "linear-gradient(135deg,#e3f2fd,#bbdefb)", border: "2px solid #1565c0", borderRadius: 10, padding: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0d47a1", marginBottom: 4 }}>🛠️ Variabile aplicație</div>
                <div style={{ fontSize: 12, color: "#444" }}>
                  Editezi <strong>denumiri produse SAGA</strong> și <strong>listă delegați (șoferi)</strong>.
                  Modificările apar automat în Borderouri, PV & Anexa 3, Colectări, Livrări.
                </div>
              </div>

              <div style={{ borderBottom: "1px solid #ccc", marginBottom: 0 }}>
                <button style={subTabSt("produse")} onClick={() => setVarSubTab("produse")}>🏷️ Produse <span style={{ marginLeft: 4, background: "#1565c0", color: "#fff", borderRadius: 10, padding: "1px 5px", fontSize: 10, fontWeight: 700 }}>{produseLista.length}</span></button>
                <button style={subTabSt("delegati")} onClick={() => setVarSubTab("delegati")}>🚚 Delegați (Șoferi) <span style={{ marginLeft: 4, background: "#e65100", color: "#fff", borderRadius: 10, padding: "1px 5px", fontSize: 10, fontWeight: 700 }}>{delegatiList.length}</span></button>
              </div>

              {varSubTab === "produse" && (
                <div style={{ background: "#fff", border: "1px solid #ccc", borderTop: "none", padding: 14 }}>
                  {produseLista.length === 0 && (
                    <div style={{ padding: 10, background: "#fff3e0", border: "1px solid #ffb74d", borderRadius: 6, fontSize: 12, color: "#bf360c", marginBottom: 10 }}>
                      ⚠️ Tabela <code>produse</code> e goală. Rulează scriptul <strong>setup_produse.sql</strong>.
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ fontSize: 13, color: "#555" }}>📊 Total: <strong style={{ color: "#1565c0" }}>{produseLista.length} produse</strong></div>
                    <button onClick={addProdus} style={{ background: G, color: "#fff", border: "none", borderRadius: 6, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>+ Adaugă Produs</button>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ borderCollapse: "collapse", width: "100%" }}>
                      <colgroup><col style={{ width: 48 }} /><col /><col style={{ width: 110 }} /><col style={{ width: 110 }} /><col style={{ width: 30 }} /></colgroup>
                      <thead><tr style={{ background: "#1565c0" }}>
                        <th style={th({ background: "#0d47a1", textAlign: "center" })}>#</th>
                        <th style={th({ background: "#1565c0", textAlign: "center" })}>Denumire</th>
                        <th style={th({ background: "#1565c0", textAlign: "center" })}>Cod HG 856</th>
                        <th style={th({ background: "#1565c0", textAlign: "center" })}>Cod SAGA</th>
                        <th style={th({ background: "#0d47a1" })}></th>
                      </tr></thead>
                      <tbody>
                        {produseLista.map((p, i) => (
                          <tr key={p.id || i} style={{ background: i % 2 === 0 ? "#fff" : "#f0f7fc" }}>
                            <td style={td({ textAlign: "center", color: "#888", fontSize: 10, background: "#f5f5f5" })}>{i + 1}</td>
                            <td style={td()}><input style={inp({ textAlign: "center", fontWeight: 600 })} defaultValue={p.den || ""} onBlur={(e) => { if (e.target.value !== p.den) updProdus(p.id, "den", e.target.value); }} /></td>
                            <td style={td({ background: "#fff8e1" })}><input style={inp({ textAlign: "center", fontFamily: "monospace" })} defaultValue={p.cod || ""} onBlur={(e) => { if (e.target.value !== p.cod) updProdus(p.id, "cod", e.target.value); }} /></td>
                            <td style={td({ background: "#e3f2fd" })}><input style={inp({ textAlign: "center", fontFamily: "monospace", fontWeight: 700, color: "#1565c0" })} defaultValue={p.cod_art || ""} onBlur={(e) => { if (e.target.value !== p.cod_art) updProdus(p.id, "cod_art", e.target.value); }} /></td>
                            <td style={td({ textAlign: "center", padding: 3 })}><button onClick={() => delProdus(p.id, p.den)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {varSubTab === "delegati" && (
                <div style={{ background: "#fff", border: "1px solid #ccc", borderTop: "none", padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ fontSize: 13, color: "#555" }}>🚚 Total: <strong style={{ color: "#e65100" }}>{delegatiList.length} delegați</strong></div>
                    <button onClick={addDelegat} style={{ background: "#e65100", color: "#fff", border: "none", borderRadius: 6, padding: "8px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>+ Adaugă Delegat</button>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ borderCollapse: "collapse", width: "100%" }}>
                      <colgroup><col style={{ width: 48 }} /><col /><col style={{ width: 80 }} /><col style={{ width: 110 }} /><col style={{ width: 130 }} /><col style={{ width: 30 }} /></colgroup>
                      <thead><tr style={{ background: "#e65100" }}>
                        <th style={th({ background: "#bf360c", textAlign: "center" })}>#</th>
                        <th style={th({ background: "#e65100", textAlign: "center" })}>Nume Complet</th>
                        <th style={th({ background: "#e65100", textAlign: "center" })}>Serie CI</th>
                        <th style={th({ background: "#e65100", textAlign: "center" })}>Număr CI</th>
                        <th style={th({ background: "#e65100", textAlign: "center" })}>CNP</th>
                        <th style={th({ background: "#bf360c" })}></th>
                      </tr></thead>
                      <tbody>
                        {delegatiList.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 30, color: "#888" }}>Niciun delegat încă. Adaugă unul cu butonul de mai sus.</td></tr>}
                        {delegatiList.map((d, i) => (
                          <tr key={d.id || i} style={{ background: i % 2 === 0 ? "#fff" : "#fff3e0" }}>
                            <td style={td({ textAlign: "center", color: "#888", fontSize: 10, background: "#f5f5f5" })}>{i + 1}</td>
                            <td style={td()}><input style={inp({ textAlign: "center", fontWeight: 600 })} defaultValue={d.nume || ""} onBlur={(e) => { if (e.target.value !== d.nume) updDelegat(d.id, "nume", e.target.value); }} /></td>
                            <td style={td({ background: "#fff8e1" })}><input style={inp({ textAlign: "center", fontFamily: "monospace" })} defaultValue={d.ci_serie || ""} onBlur={(e) => { if (e.target.value !== d.ci_serie) updDelegat(d.id, "ci_serie", e.target.value); }} /></td>
                            <td style={td({ background: "#fff8e1" })}><input style={inp({ textAlign: "center", fontFamily: "monospace" })} defaultValue={d.ci_numar || ""} onBlur={(e) => { if (e.target.value !== d.ci_numar) updDelegat(d.id, "ci_numar", e.target.value); }} /></td>
                            <td style={td({ background: "#e3f2fd" })}><input style={inp({ textAlign: "center", fontFamily: "monospace" })} defaultValue={d.cnp || ""} onBlur={(e) => { if (e.target.value !== d.cnp) updDelegat(d.id, "cnp", e.target.value); }} /></td>
                            <td style={td({ textAlign: "center", padding: 3 })}><button onClick={() => delDelegat(d.id, d.nume)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ══ STOCURI ══ */}
        {tab === "cantar" && (() => {
          const deschise = ticheteList.filter((t) => t.status === "deschis");
          const inchise = sortByDateAsc(ticheteList.filter((t) => t.status === "inchis"));
          const lunaOpts = [...new Set(ticheteList.map((t) => monthOf(t.data)).filter(Boolean))].sort();
          const filtrate = inchise.filter((t) => {
            if (ticLuna && monthOf(t.data) !== ticLuna) return false;
            if (ticFilter) {
              const q = ticFilter.toLowerCase();
              if (!(t.partener?.toLowerCase().includes(q) || t.nr_masina?.toLowerCase().includes(q) || t.material?.toLowerCase().includes(q) || String(t.nr_tichet).includes(q))) return false;
            }
            return true;
          });
          const totNet = filtrate.reduce((s, t) => s + (parseFloat(t.net) || 0), 0);
          const partenerOpts = [...new Set([...pfList.map(f => f.denumire), ...pjList.map(f => f.denumire)].filter(Boolean))];
          const transpOpts = [...new Set(["GREEN KRAFT SRL", ...TIC_TRANSPORTATORI, ...partenerOpts, ...ticheteList.map(t => t.transportator)].filter(Boolean))];
          const masiniOpts = [...new Set([...TIC_MASINI, ...ticheteList.map(t => t.nr_masina)].filter(Boolean))].sort();
          const soferiOpts = [...new Set([...TIC_DELEGATI, ...delegatiList.map(d => (d.nume || "").toUpperCase()), ...ticheteList.map(t => (t.sofer || "").toUpperCase())].filter(Boolean))].sort();
          const clientOpts = [...new Set(["GREEN KRAFT SRL", ...TIC_CLIENTI, ...ticheteList.map(t => t.client)].filter(Boolean))];
          const FL = { fontSize: 11, fontWeight: 600, color: "#555", display: "block", marginBottom: 2 };
          const FI = { width: "100%", padding: "7px 9px", border: "1px solid #d5d5d5", borderRadius: 6, fontSize: 13, boxSizing: "border-box" };
          const ACB = { border: "1px solid #d5d5d5", borderRadius: 6, padding: "3px 4px", background: "#fff" };
          return (
            <div>
              {/* Bara status cantar */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, background: "#fff", border: "1px solid #e0e0e0", borderRadius: 10, padding: "10px 16px", marginBottom: 14, flexWrap: "wrap" }}>
                {scalePort ? (
                  <>
                    <span style={{ fontSize: 22, fontWeight: 700, fontFamily: "monospace", color: scaleReading?.stable ? G : "#e65100" }}>{scaleReading ? `${fmt(scaleReading.value)} kg` : "..."}</span>
                    <span style={{ fontSize: 11, color: scaleReading?.stable ? G : "#e65100", fontWeight: 600 }}>{scaleReading?.stable ? "✓ stabil" : "⚠ instabil"}</span>
                    <button onClick={disconnectScale} style={{ marginLeft: "auto", padding: "5px 12px", border: "1px solid #ccc", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 11, color: "#666" }}>Deconectează cântarul</button>
                  </>
                ) : cantarLive?.fresh ? (
                  <>
                    <span style={{ fontSize: 22, fontWeight: 700, fontFamily: "monospace", color: "#1565c0" }}>📡 {fmt(cantarLive.value)} kg</span>
                    <span style={{ fontSize: 11, color: "#1565c0", fontWeight: 600 }}>{cantarLive.stable ? "✓ stabil" : "⚠ instabil"} • live de la birou</span>
                    <button onClick={connectScale} style={{ marginLeft: "auto", padding: "5px 12px", border: `1px solid ${G}`, borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 11, color: G, fontWeight: 600 }}>⚖️ Conectează local</button>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 13, color: "#999" }}>⚖️ Cântar neconectat</span>
                    <button onClick={connectScale} style={{ marginLeft: "auto", padding: "6px 16px", border: "none", borderRadius: 6, background: G, cursor: "pointer", fontSize: 12, color: "#fff", fontWeight: 700 }}>⚖️ Conectează cântarul</button>
                  </>
                )}
                <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: printServer ? "#1565c0" : "#999", fontWeight: 600, cursor: "pointer", borderLeft: "1px solid #e0e0e0", paddingLeft: 12 }} title="Activează DOAR pe calculatorul de la birou conectat la imprimantă. Tichetele trimise de pe telefon/alte calculatoare se vor printa aici.">
                  <input type="checkbox" checked={printServer} onChange={togglePrintServer} style={{ accentColor: "#1565c0" }} />
                  🖨️ Server print{printServer ? " ✓ activ" : ""}
                </label>
              </div>

              <div style={{ display: "flex", gap: 6, marginBottom: 14, borderBottom: "2px solid #eee" }}>
                {[["nou", "➕ Tichet Nou"], ["deschise", `⏳ Deschise${deschise.length ? ` (${deschise.length})` : ""}`], ["registru", "📒 Registru"]].map(([k, l]) => (
                  <button key={k} onClick={() => setTicSubTab(k)} style={{ padding: "7px 16px", cursor: "pointer", border: "none", fontWeight: 600, fontSize: 12, borderBottom: ticSubTab === k ? `2px solid ${G}` : "2px solid transparent", background: ticSubTab === k ? "#f0faf4" : "transparent", color: ticSubTab === k ? G : "#666" }}>{l}</button>
                ))}
              </div>

              {ticSubTab === "nou" && (
                <div style={{ maxWidth: 860 }}>
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                    {/* Coloana stanga: date transport */}
                    <div style={{ flex: "1 1 380px", background: "#fff", border: "1px solid #e0e0e0", borderRadius: 10, padding: 16 }}>
                      <div style={{ fontWeight: 700, color: "#444", fontSize: 12, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Date transport</div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                        <select style={{ ...FI, flex: 1, fontWeight: 700, color: ticNou.tip === "Intrare" ? G : "#bf360c" }} value={ticNou.tip} onChange={(e) => setTicNou((p) => ({ ...p, tip: e.target.value }))}>
                          <option value="Intrare">▼ Intrare (recepție)</option>
                          <option value="Iesire">▲ Ieșire (livrare)</option>
                        </select>
                        <select style={{ ...FI, flex: 1, fontWeight: 600, color: "#6a1b9a" }} value={ticNou.prima} onChange={(e) => setTicNou((p) => ({ ...p, prima: e.target.value }))}>
                          <option value="plin">🚛 Vine plin (1. BRUT)</option>
                          <option value="gol">🛻 Vine gol (1. TARA)</option>
                        </select>
                      </div>
                      <div style={{ marginBottom: 10 }}><label style={FL}>Furnizor (cine aduce marfa)</label><div style={ACB}><AC value={ticNou.partener} options={partenerOpts} placeholder="Caută PF sau PJ..." onChange={(v) => { const f = pjList.find(x => x.denumire === v) || pfList.find(x => x.denumire === v); setTicNou((p) => ({ ...p, partener: v, partener_cui: f?.cod_fiscal || "" })); }} /></div></div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                        <div style={{ flex: 1 }}><label style={FL}>Client</label><div style={ACB}><AC value={ticNou.client} options={clientOpts} placeholder="GREEN KRAFT SRL" onChange={(v) => setTicNou((p) => ({ ...p, client: v }))} /></div></div>
                        <div style={{ flex: 1 }}><label style={FL}>Transportator</label><div style={ACB}><AC value={ticNou.transportator} options={transpOpts} placeholder="noi / PF / PJ" onChange={(v) => setTicNou((p) => ({ ...p, transportator: v }))} /></div></div>
                      </div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                        <div style={{ flex: 1 }}><label style={FL}>Nr. auto</label><div style={ACB}><AC value={ticNou.nr_masina} options={masiniOpts} placeholder="IF55KFT" onChange={(v) => setTicNou((p) => ({ ...p, nr_masina: v.toUpperCase() }))} /></div></div>
                        <div style={{ flex: 1 }}><label style={FL}>Delegat (șofer)</label><div style={ACB}><AC value={ticNou.sofer} options={soferiOpts} placeholder="alege sau scrie nou" onChange={(v) => setTicNou((p) => ({ ...p, sofer: v }))} /></div></div>
                      </div>
                      <div style={{ marginBottom: 10 }}><label style={FL}>Material / Deșeu</label><div style={ACB}><AC value={ticNou.material} options={PRODUSE_DYN} placeholder="Selectează..." onChange={(v) => setTicNou((p) => ({ ...p, material: v }))} /></div></div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <div style={{ flex: 1 }}><label style={FL}>Factura</label><input style={FI} value={ticNou.factura} onChange={(e) => setTicNou((p) => ({ ...p, factura: e.target.value }))} placeholder="opțional" /></div>
                        <div style={{ flex: 1 }}><label style={FL}>Aviz</label><input style={FI} value={ticNou.aviz} onChange={(e) => setTicNou((p) => ({ ...p, aviz: e.target.value }))} placeholder="opțional" /></div>
                        <div style={{ flex: 1 }}><label style={FL}>Observații</label><input style={FI} value={ticNou.obs} onChange={(e) => setTicNou((p) => ({ ...p, obs: e.target.value }))} placeholder="opțional" /></div>
                      </div>
                    </div>
                    {/* Coloana dreapta: cantarirea */}
                    <div style={{ flex: "1 1 280px", background: "#fff", border: `1px solid ${G}`, borderRadius: 10, padding: 16, display: "flex", flexDirection: "column" }}>
                      <div style={{ fontWeight: 700, color: G, fontSize: 12, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Cântărirea 1 — {ticNou.prima === "plin" ? "Brut (plin)" : "Tara (gol)"}</div>
                      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                        <input style={{ flex: 1, padding: "14px", border: `2px solid ${G}`, borderRadius: 8, fontSize: 26, fontWeight: 700, textAlign: "right", boxSizing: "border-box", fontFamily: "monospace" }} type="number" value={ticNou.greutate} onChange={(e) => setTicNou((p) => ({ ...p, greutate: e.target.value }))} placeholder="0" />
                        <span style={{ alignSelf: "center", fontSize: 15, color: "#888", fontWeight: 600 }}>kg</span>
                      </div>
                      {scalePort && <button onClick={() => useScaleWeight((v) => setTicNou((p) => ({ ...p, greutate: v })))} style={{ padding: "10px", background: scaleReading?.stable ? "#e8f5e9" : "#fff8e1", border: `1px solid ${G}`, borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, color: G, marginBottom: 8 }}>⚖️ Preia din cântar {scaleReading ? `(${fmt(scaleReading.value)} kg)` : ""}</button>}
                      {!scalePort && cantarLive?.fresh && <button onClick={() => useLiveWeight((v) => setTicNou((p) => ({ ...p, greutate: v })))} style={{ padding: "10px", background: "#e3f2fd", border: "1px solid #90caf9", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#1565c0", marginBottom: 8 }}>📡 Preia live de la birou ({fmt(cantarLive.value)} kg)</button>}
                      <button onClick={salveazaTichet1} style={{ marginTop: "auto", padding: "13px", background: `linear-gradient(135deg,#1b5e20,${G})`, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 700 }}>💾 Deschide tichet TC #{getNextTichetNr()}</button>
                      <div style={{ fontSize: 10, color: "#999", marginTop: 6, textAlign: "center" }}>A doua cântărire se face din „⏳ Deschise"</div>
                    </div>
                  </div>
                </div>
              )}

              {ticSubTab === "deschise" && (
                <div>
                  {deschise.length === 0 && <div style={{ color: "#999", fontSize: 13, padding: "40px 0", textAlign: "center" }}>Niciun tichet deschis.<br /><span style={{ fontSize: 11 }}>Vehiculele cântărite o singură dată apar aici până la a doua cântărire.</span></div>}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                    {deschise.map((t) => (
                      <div key={t.id} style={{ width: 320, background: "#fff", border: "1px solid #e0e0e0", borderLeft: "4px solid #ffa726", borderRadius: 10, padding: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>TC #{t.nr_tichet}</span>
                          <span style={{ fontSize: 10, color: "#999" }}>{t.tip === "Intrare" ? "▼ Intrare" : "▲ Ieșire"} • {t.data} {t.ora_intrare}</span>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 1 }}>{t.partener}</div>
                        <div style={{ fontSize: 11, color: "#777", marginBottom: 10 }}>🚛 {t.nr_masina}{t.sofer ? ` • ${t.sofer}` : ""}{t.material ? ` • ${t.material}` : ""}</div>
                        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 8 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 10, color: "#999" }}>{t.brut != null ? "Brut ✓" : "Tara ✓"}</div>
                            <div style={{ fontWeight: 700, fontSize: 16, fontFamily: "monospace" }}>{fmt(t.brut != null ? t.brut : t.tara)}</div>
                          </div>
                          <div style={{ flex: 1.3 }}>
                            <div style={{ fontSize: 10, color: "#e65100", fontWeight: 600 }}>{t.brut != null ? "Tara (gol)" : "Brut (plin)"}</div>
                            <input style={{ width: "100%", padding: "6px", border: "1.5px solid #ffa726", borderRadius: 6, fontSize: 15, fontWeight: 700, textAlign: "right", boxSizing: "border-box", fontFamily: "monospace" }} type="number" value={ticTaraInput[t.id] || ""} onChange={(e) => setTicTaraInput((p) => ({ ...p, [t.id]: e.target.value }))} placeholder="kg" />
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                          {scalePort && <button onClick={() => useScaleWeight((v) => setTicTaraInput((p) => ({ ...p, [t.id]: v })))} style={{ flex: 1, padding: "5px", background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 5, cursor: "pointer", fontSize: 11, color: G, fontWeight: 600 }}>⚖️ Din cântar</button>}
                          {!scalePort && cantarLive?.fresh && <button onClick={() => useLiveWeight((v) => setTicTaraInput((p) => ({ ...p, [t.id]: v })))} style={{ flex: 1, padding: "5px", background: "#e3f2fd", border: "1px solid #90caf9", borderRadius: 5, cursor: "pointer", fontSize: 11, color: "#1565c0", fontWeight: 600 }}>📡 Live birou</button>}
                        </div>
                        {(() => {
                          const v2 = parseFloat(ticTaraInput[t.id]);
                          if (!v2 || v2 <= 0) return null;
                          const brutV = t.brut != null ? parseFloat(t.brut) : v2;
                          const taraV = t.brut != null ? v2 : parseFloat(t.tara);
                          if (brutV <= taraV) return <div style={{ textAlign: "center", marginBottom: 8, fontSize: 11, color: "#c62828", fontWeight: 600 }}>⚠️ Brut trebuie să fie mai mare decât Tara</div>;
                          return <div style={{ textAlign: "center", marginBottom: 8, fontSize: 14, color: G, fontWeight: 700, fontFamily: "monospace" }}>NET = {fmt(Math.round((brutV - taraV) * 100) / 100)} kg</div>;
                        })()}
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => inchideTichet(t)} style={{ flex: 1, padding: "9px", background: G, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>✔ Închide tichet</button>
                          <button onClick={() => delTichet(t)} style={{ padding: "9px 11px", background: "#fff", color: "#e53935", border: "1px solid #ef9a9a", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {ticSubTab === "registru" && (
                <div>
                  <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <select style={{ padding: "6px 10px", border: "1px solid #ccc", borderRadius: 5, fontSize: 12 }} value={ticLuna} onChange={(e) => setTicLuna(e.target.value)}>
                      <option value="">Toate lunile</option>
                      {lunaOpts.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <input style={{ padding: "6px 10px", border: "1px solid #ccc", borderRadius: 5, fontSize: 12, width: 220 }} value={ticFilter} onChange={(e) => setTicFilter(e.target.value)} placeholder="🔍 Caută furnizor / mașină / material..." />
                    {(ticLuna || ticFilter) && <button onClick={() => { setTicLuna(""); setTicFilter(""); }} style={{ padding: "5px 10px", border: "1px solid #ccc", borderRadius: 5, background: "#fff", cursor: "pointer", fontSize: 11 }}>↺ Reset</button>}
                    <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                      <SC label="Tichete" value={String(filtrate.length)} c={G} bg="#e8f5e9" />
                      <SC label="Total NET" value={fmt(totNet) + " kg"} c="#e65100" bg="#fff3e0" />
                    </div>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>
                      <thead><tr>{["Nr.", "Data", "Ore", "Tip", "Furnizor", "Mașină", "Șofer", "Material", "Brut", "Tara", "NET (kg)", "Operator", "🖨️", "✏️", ""].map((h, i) => <th key={i} style={th({ background: G })}>{h}</th>)}</tr></thead>
                      <tbody>
                        {filtrate.map((t, idx) => (
                          <tr key={t.id} style={{ background: idx % 2 === 0 ? "#fff" : "#f8fbf9" }}>
                            <td style={td({ textAlign: "center", fontWeight: 700, color: G })}>{t.serie} {t.nr_tichet}</td>
                            <td style={td({ textAlign: "center" })}>{t.data}</td>
                            <td style={td({ textAlign: "center", fontSize: 10, color: "#888" })}>{t.ora_intrare}–{t.ora_iesire}</td>
                            <td style={td({ textAlign: "center", fontWeight: 700, color: t.tip === "Intrare" ? G : "#bf360c", background: t.tip === "Intrare" ? "#e8f5e9" : "#fbe9e7" })}>{t.tip === "Intrare" ? "▼ IN" : "▲ OUT"}</td>
                            <td style={td({ fontWeight: 600 })}>{t.partener}</td>
                            <td style={td({ textAlign: "center", fontFamily: "monospace" })}>{t.nr_masina}</td>
                            <td style={td()}>{t.sofer || "—"}</td>
                            <td style={td()}>{t.material || "—"}</td>
                            <td style={td({ textAlign: "right" })}>{fmt(t.brut)}</td>
                            <td style={td({ textAlign: "right" })}>{fmt(t.tara)}</td>
                            <td style={td({ textAlign: "right", fontWeight: 700, background: "#fff8e1", color: "#e65100" })}>{fmt(t.net)}</td>
                            <td style={td({ textAlign: "center", fontSize: 10 })}>{t.operator || "—"}</td>
                            <td style={td({ textAlign: "center", padding: 2, whiteSpace: "nowrap" })}><button onClick={() => printTichet(t)} style={{ background: "#e3f2fd", border: "1px solid #90caf9", borderRadius: 4, cursor: "pointer", color: "#1565c0", fontSize: 11, fontWeight: 700, padding: "2px 8px" }} title="Printează aici">🖨️</button> <button onClick={() => trimiteLaPrint(t)} style={{ background: "#ede7f6", border: "1px solid #b39ddb", borderRadius: 4, cursor: "pointer", color: "#6a1b9a", fontSize: 11, fontWeight: 700, padding: "2px 6px" }} title="Trimite la imprimanta de la birou">📡🖨️</button></td>
                            <td style={td({ textAlign: "center", padding: 2 })}><button onClick={() => setTicEdit({ id: t.id, nr_tichet: t.nr_tichet, factura: t.factura || "", aviz: t.aviz || "", brut_la: t.brut_la || "", tara_la: t.tara_la || "", ora_intrare: t.ora_intrare || "", ora_iesire: t.ora_iesire || "" })} style={{ background: "#fff8e1", border: "1px solid #ffd54f", borderRadius: 4, cursor: "pointer", color: "#e65100", fontSize: 11, fontWeight: 700, padding: "2px 8px" }} title="Editează factura/aviz/ore">✏️</button></td>
                            <td style={td({ textAlign: "center", padding: 2 })}><button onClick={() => delTichet(t)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button></td>
                          </tr>
                        ))}
                        {filtrate.length === 0 && <tr><td colSpan={15} style={{ padding: 20, textAlign: "center", color: "#999", fontSize: 12 }}>Niciun tichet închis {ticLuna || ticFilter ? "pentru filtrele alese" : "încă"}.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {tab === "stoc" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
              <SC label="Produse în stoc" value={stocAg.filter((r) => r.cant > 0).length + " tipuri"} c={G} bg="#e8f5e9" />
              <SC label="Total Cantitate" value={fmt(totStocKg) + " kg"} c="#1565c0" bg="#e3f2fd" />
              <SC label="Valoare estimată" value={fmt(totStocVal) + " lei"} c="#6a1b9a" bg="#f3e5f5" />
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <input value={stocFilter} onChange={(e) => setStocFilter(e.target.value)} placeholder="🔍 Caută..." style={{ border: "1px solid #ccc", borderRadius: 6, padding: "5px 10px", fontSize: 12, width: 160 }} />
                <button onClick={() => setShowMisc((p) => !p)} style={{ padding: "6px 12px", background: showMisc ? "#1565c0" : "#e3f2fd", color: showMisc ? "#fff" : "#1565c0", border: "1px solid #90caf9", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{showMisc ? "📊 Stoc" : "📋 Mișcări"}</button>
              </div>
            </div>
            {!showMisc && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 680 }}>
                  <thead><tr><th style={th({ width: 28 })}>#</th><th style={th({ textAlign: "center", minWidth: 190 })}>Produs</th><th style={th({ textAlign: "center", width: 75 })}>CodSAGA</th><th style={th({ textAlign: "center", width: 90 })}>Cod HG 856</th><th style={th({ textAlign: "center", width: 105 })}>Intrat (kg)</th><th style={th({ textAlign: "center", width: 105 })}>Ieșit (kg)</th><th style={{ ...th({ textAlign: "center", width: 115 }), background: "#0d4a2a" }}>Stoc Curent</th><th style={th({ textAlign: "center", width: 100 })}>Preț Mediu</th><th style={{ ...th({ textAlign: "center", width: 115 }), background: "#6a1b9a" }}>Val. Stoc (lei)</th><th style={th({ textAlign: "center", width: 95 })}>Ultima misc.</th></tr></thead>
                  <tbody>
                    {stocFilt.length === 0 && <tr><td colSpan={10} style={{ textAlign: "center", padding: 20, color: "#aaa" }}>Niciun produs. Adaugă colectări sau borderouri.</td></tr>}
                    {stocFilt.map((r, i) => { const vs = Math.max(0, r.cant) * r.pm; const alert = r.cant <= 0; const rowBg = alert ? "#fff8f8" : i % 2 === 0 ? "#fff" : "#f8fbf9"; return (<tr key={i} style={{ background: rowBg }}><td style={td({ textAlign: "center", color: "#aaa", fontSize: 10, background: "#f5f5f5" })}>{i + 1}</td><td style={td({ background: rowBg, fontWeight: 600, color: alert ? "#c62828" : G })}>{alert && "⚠️ "}{r.produs}</td><td style={td({ background: "#fff3e0", textAlign: "center", fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "#e65100" })}>{r.cod_art || "—"}</td><td style={td({ background: rowBg, textAlign: "center", fontFamily: "monospace", fontSize: 11 })}>{r.cod}</td><td style={td({ background: "#e8f5e9", textAlign: "right", color: G, fontWeight: 600 })}>{fmt(r.intrari)}</td><td style={td({ background: "#ffebee", textAlign: "right", color: "#c62828", fontWeight: 600 })}>{fmt(r.iesiri)}</td><td style={td({ background: alert ? "#ffcdd2" : "#d4edda", textAlign: "right", fontWeight: 700, fontSize: 13, color: alert ? "#c62828" : "#0d4a2a" })}>{fmt(Math.max(0, r.cant))}</td><td style={td({ background: rowBg, textAlign: "right" })}>{fmt(r.pm, 4)}</td><td style={td({ background: "#f3e5f5", textAlign: "right", fontWeight: 700, color: "#6a1b9a" })}>{fmt(vs)}</td><td style={td({ background: rowBg, textAlign: "center", fontSize: 11, color: "#888" })}>{r.data}</td></tr>); })}
                  </tbody>
                  <tfoot><tr style={{ background: G, color: "#fff" }}><td colSpan={4} style={{ padding: "6px 10px", fontWeight: 700, fontSize: 12 }}>TOTAL</td><td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(stocAg.reduce((s, r) => s + r.intrari, 0))}</td><td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(stocAg.reduce((s, r) => s + r.iesiri, 0))}</td><td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(totStocKg)}</td><td></td><td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(totStocVal)}</td><td></td></tr></tfoot>
                </table>
                <div style={{ marginTop: 10, background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 6, padding: "8px 12px", fontSize: 11, color: G }}>💡 <strong>Actualizare automată:</strong> Colectările + Borderourile = intrări ⬆️ &nbsp;|&nbsp; Livrările = ieșiri ⬇️</div>
              </div>
            )}
            {showMisc && (
              <div>
                <div style={{ background: "#f9f9f9", border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, color: G, fontSize: 12, marginBottom: 8 }}>+ Adaugă mișcare manuală</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
                    <div><label style={LSt}>Data</label><input value={newM.data} onChange={(e) => setNewM((p) => ({ ...p, data: e.target.value }))} style={{ ...IFS, width: 90 }} /></div>
                    <div><label style={LSt}>Tip</label><select value={newM.tip} onChange={(e) => setNewM((p) => ({ ...p, tip: e.target.value }))} style={{ ...IFS, width: 90, color: newM.tip === "intrare" ? G : "#c62828", fontWeight: 700 }}><option value="intrare">⬆ Intrare</option><option value="iesire">⬇ Ieșire</option></select></div>
                    <div style={{ flex: "0 0 180px" }}><label style={LSt}>Produs</label><select value={newM.produs} onChange={(e) => { const fd = produseList.find((p) => p.den === e.target.value); setNewM((p) => ({ ...p, produs: e.target.value, cod: fd?.cod || "" })); }} style={IFS}><option value=""></option>{PRODUSE_DYN.map((p) => <option key={p}>{p}</option>)}</select></div>
                    <div><label style={LSt}>Cant.(kg)</label><input type="number" value={newM.cant} onChange={(e) => setNewM((p) => ({ ...p, cant: e.target.value }))} style={{ ...IFS, width: 80, textAlign: "right" }} /></div>
                    <div><label style={LSt}>Preț/kg</label><input type="number" value={newM.pu} onChange={(e) => setNewM((p) => ({ ...p, pu: e.target.value }))} style={{ ...IFS, width: 72, textAlign: "right" }} /></div>
                    <div style={{ flex: 1, minWidth: 120 }}><label style={LSt}>Sursă</label><input value={newM.sursa} onChange={(e) => setNewM((p) => ({ ...p, sursa: e.target.value }))} style={IFS} placeholder="Ajustare stoc..." /></div>
                    <button onClick={addManMisc} style={{ padding: "5px 14px", background: G, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, marginBottom: 1 }}>+ Adaugă</button>
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 680 }}>
                    <thead><tr><th style={th({ width: 28 })}>#</th><th style={th({ width: 82 })}>Data</th><th style={th({ width: 72 })}>Tip</th><th style={th({ minWidth: 170 })}>Produs</th><th style={th({ width: 78 })}>Cod</th><th style={th({ width: 80 })}>Cant.(kg)</th><th style={th({ width: 78 })}>Preț/kg</th><th style={th({ width: 80 })}>Valoare</th><th style={th({ minWidth: 150 })}>Sursă</th><th style={th({ width: 28 })}></th></tr></thead>
                    <tbody>{[...miscari].reverse().map((r, i) => { const v = (parseFloat(r.cant) || 0) * (parseFloat(r.pu) || 0); const isIn = r.tip === "intrare"; const isCol = String(r.id).startsWith("col-"); const isBord = String(r.id).startsWith("bord-"); const isLiv = String(r.id).startsWith("liv-"); const isMan = String(r.id).startsWith("man-"); const rowBg = isCol ? "#f0fff4" : isBord ? "#fffde7" : isLiv ? "#fff5f5" : "#f0f4ff"; const badge = isCol ? { bg: "#c6efce", c: G, l: "🚛" } : isBord ? { bg: "#fff2cc", c: "#e65100", l: "📄" } : isLiv ? { bg: "#fce4d6", c: "#c62828", l: "📤" } : { bg: "#e3f2fd", c: "#1565c0", l: "✏️" }; return (<tr key={r.id || i} style={{ background: rowBg }}><td style={td({ textAlign: "center", color: "#aaa", fontSize: 10, background: "#f5f5f5" })}>{miscari.length - i}</td><td style={td({ background: rowBg, textAlign: "center", fontSize: 11 })}>{r.data}</td><td style={td({ background: isIn ? "#e8f5e9" : "#ffebee", textAlign: "center", fontWeight: 700, color: isIn ? G : "#c62828" })}>{isIn ? "⬆" : "⬇"} {isIn ? "Intrare" : "Ieșire"}</td><td style={td({ background: rowBg, fontSize: 11 })}>{r.produs}</td><td style={td({ background: rowBg, textAlign: "center", fontFamily: "monospace", fontSize: 11 })}>{r.cod}</td><td style={td({ background: rowBg, textAlign: "right", fontWeight: 600, color: isIn ? G : "#c62828" })}>{isIn ? "+" : "-"}{fmt(r.cant)}</td><td style={td({ background: rowBg, textAlign: "right" })}>{fmt(r.pu, 4)}</td><td style={td({ background: rowBg, textAlign: "right", fontWeight: 600 })}>{fmt(v)}</td><td style={td({ background: rowBg, fontSize: 11 })}><span style={{ background: badge.bg, color: badge.c, borderRadius: 4, padding: "1px 5px", fontSize: 10, fontWeight: 700, marginRight: 5 }}>{badge.l}</span>{r.sursa}</td><td style={td({ textAlign: "center", padding: 3 })}>{isMan ? <button onClick={() => delManMisc(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button> : <span style={{ color: "#ccc", fontSize: 11 }} title="Modifică din sursa originală">🔒</span>}</td></tr>); })}</tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ SALARIATI ══ */}
        {tab === "salariati" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
              <SC label="Total Salarii Nete" value={fmt(salRows.reduce((s, r) => s + (parseFloat(r.net) || 0), 0)) + " lei"} c={G} bg="#e8f5e9" />
              <SC label="Total Taxe Stat" value={fmt(salRows.reduce((s, r) => s + (parseFloat(r.taxe) || 0), 0)) + " lei"} c="#c62828" bg="#ffebee" />
              <SC label="Total Cost Brut" value={fmt(salRows.reduce((s, r) => s + (parseFloat(r.net) || 0) + (parseFloat(r.taxe) || 0), 0)) + " lei"} c="#1565c0" bg="#e3f2fd" />
            </div>
            <div style={{ overflowX: "auto", marginBottom: 12 }}>
              <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 680 }}>
                <thead><tr><th style={th({ width: 28 })}>#</th><th style={th({ textAlign: "center", width: 115 })}>Nume</th><th style={th({ textAlign: "center", width: 105 })}>Funcție</th><th style={th({ textAlign: "center", width: 100 })}>Salariu Net</th><th style={th({ textAlign: "center", width: 92 })}>Taxe Stat</th><th style={th({ textAlign: "center", width: 92 })}>Cost Brut</th><th style={th({ textAlign: "center", width: 72 })}>Zile CO</th><th style={th({ textAlign: "center", width: 72 })}>Efectuate</th><th style={th({ textAlign: "center", width: 72 })}>Rămase</th><th style={th({ textAlign: "center", width: 82 })}>Concedii</th><th style={th({ width: 28 })}></th></tr></thead>
                <tbody>{salRows.map((r, i) => { const brut = (parseFloat(r.net) || 0) + (parseFloat(r.taxe) || 0); const ramase = (parseInt(r.co) || 0) - (parseInt(r.ef) || 0); const rowBg = i % 2 === 0 ? "#fff" : "#f8fbf9"; return (<tr key={r.id || i} style={{ background: rowBg }}><td style={td({ textAlign: "center", color: "#888", fontSize: 11, background: "#f5f5f5" })}>{i + 1}</td><td style={td({ background: rowBg, fontWeight: 600 })}><input style={inp({ textAlign: "center", fontWeight: 600 })} value={r.nume || ""} onChange={(e) => updSAL(i, "nume", e.target.value)} /></td><td style={td({ background: "#fffde7" })}><input style={inp({ textAlign: "center" })} value={r.functie || ""} onChange={(e) => updSAL(i, "functie", e.target.value)} /></td><td style={td({ background: rowBg })}><input style={inp({ textAlign: "right" })} type="number" value={r.net || ""} onChange={(e) => updSAL(i, "net", e.target.value)} /></td><td style={td({ background: "#ffebee" })}><input style={inp({ textAlign: "right", color: "#c62828" })} type="number" value={r.taxe || ""} onChange={(e) => updSAL(i, "taxe", e.target.value)} /></td><td style={td({ textAlign: "right", background: "#e3f2fd", fontWeight: 600, color: "#1565c0" })}>{fmt(brut)}</td><td style={td({ background: rowBg })}><input style={inp({ textAlign: "center" })} type="number" value={r.co || ""} onChange={(e) => updSAL(i, "co", e.target.value)} /></td><td style={td({ textAlign: "center", background: "#fff8e1", color: "#e65100", fontWeight: 600 })}>{r.ef}</td><td style={td({ textAlign: "center", background: ramase < 5 ? "#ffebee" : "#e8f5e9", color: ramase < 5 ? "#c62828" : G, fontWeight: 700 })}>{ramase}</td><td style={td({ textAlign: "center", padding: 3 })}><button onClick={() => setSelSal(selSal === i ? null : i)} style={{ background: selSal === i ? G : "#e8f5e9", color: selSal === i ? "#fff" : G, border: `1px solid ${G}`, borderRadius: 4, padding: "2px 7px", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>{(r.conc || []).length > 0 ? `${r.conc.length} per.` : "+ Add"}</button></td><td style={td({ textAlign: "center", padding: 3 })}><button onClick={() => delSAL(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button></td></tr>); })}</tbody>
                <tfoot><tr style={{ background: G, color: "#fff" }}><td colSpan={3} style={{ padding: "6px 10px", fontWeight: 700, fontSize: 12 }}>TOTAL</td><td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(salRows.reduce((s, r) => s + (parseFloat(r.net) || 0), 0))}</td><td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(salRows.reduce((s, r) => s + (parseFloat(r.taxe) || 0), 0))}</td><td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(salRows.reduce((s, r) => s + (parseFloat(r.net) || 0) + (parseFloat(r.taxe) || 0), 0))}</td><td colSpan={5}></td></tr></tfoot>
              </table>
            </div>
            {selSal !== null && salRows[selSal] && (
              <div style={{ background: "#f9f9f9", border: "1px solid #ccc", borderRadius: 8, padding: 12, marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: G, marginBottom: 8 }}>📅 Concedii — {salRows[selSal].nume}</div>
                {(salRows[selSal].conc || []).length > 0 ? (<table style={{ borderCollapse: "collapse", marginBottom: 10, maxWidth: 300 }}><thead><tr><th style={th({ width: 100 })}>Lună</th><th style={th({ width: 90 })}>Zile</th><th style={th({ width: 36 })}></th></tr></thead><tbody>{(salRows[selSal].conc || []).map((c, ci) => (<tr key={ci}><td style={td({ textAlign: "center", background: "#e8f5e9" })}>{LUNI[c.luna]}</td><td style={td({ textAlign: "center", fontWeight: 600 })}>{c.zile} zile</td><td style={td({ textAlign: "center", padding: 3 })}><button onClick={() => delConc(selSal, ci)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button></td></tr>))}</tbody></table>) : <div style={{ color: "#aaa", fontSize: 12, marginBottom: 8 }}>Nicio perioadă înregistrată.</div>}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>Adaugă:</span>
                  <select style={{ border: "1px solid #ccc", borderRadius: 4, padding: "4px 8px", fontSize: 12 }} value={concF.luna} onChange={(e) => setConcF((f) => ({ ...f, luna: parseInt(e.target.value) }))}>{LUNI.map((l, li) => <option key={li} value={li}>{l}</option>)}</select>
                  <input type="number" min={1} max={30} value={concF.zile} onChange={(e) => setConcF((f) => ({ ...f, zile: e.target.value }))} style={{ width: 50, border: "1px solid #ccc", borderRadius: 4, padding: "4px 8px", fontSize: 12, textAlign: "center" }} />
                  <span style={{ fontSize: 12 }}>zile</span>
                  <button onClick={() => addConc(selSal)} style={{ background: G, color: "#fff", border: "none", borderRadius: 4, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>✓ Adaugă</button>
                </div>
              </div>
            )}
            <AddBtn onClick={addSAL} label="+ Adaugă angajat" />
          </div>
        )}

        {/* ══ CALCULATOR ══ */}
        {tab === "calculator" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 6, padding: "8px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: G }}>💰 Cost alocat (lei):</label>
                <input type="number" value={costAl} onChange={(e) => updCost(e.target.value)} style={{ width: 110, padding: "4px 8px", borderRadius: 4, border: "1px solid #a5d6a7", fontSize: 14, fontWeight: 700, textAlign: "right", color: G }} />
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead><tr><th style={th({ width: 28 })}>#</th><th style={th({ textAlign: "left" })}>Material</th><th style={th()}>Cost Alocat</th><th style={th()}>Preț Ach.(lei/kg)</th><th style={th()}>Preț Vânz.(lei/kg)</th><th style={{ ...th(), background: "#155a35" }}>Marjă</th><th style={{ ...th(), background: "#0d4a2a" }}>Cantitate(kg)</th><th style={th({ width: 28 })}></th></tr></thead>
                <tbody>{calRows.map((r, i) => (<tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f9fbf9" }}><td style={td({ textAlign: "center", color: "#999" })}>{i + 1}</td><td style={td()}><input style={inp()} value={r.material} onChange={(e) => updCal(i, "material", e.target.value)} /></td><td style={td()}><input style={inp({ textAlign: "right" })} type="number" value={r.cost} onChange={(e) => updCal(i, "cost", e.target.value)} /></td><td style={td()}><input style={inp({ textAlign: "right" })} type="number" value={r.pa} onChange={(e) => updCal(i, "pa", e.target.value)} /></td><td style={td()}><input style={inp({ textAlign: "right" })} type="number" value={r.pv} onChange={(e) => updCal(i, "pv", e.target.value)} /></td><td style={td({ textAlign: "right", background: "#e8f5e9", color: r.marja > 0 ? G : "#c62828", fontWeight: 600 })}>{r.marja !== 0 ? fmt(r.marja) : "—"}</td><td style={td({ textAlign: "right", background: "#d4edda", fontWeight: 700, color: "#0d4a2a" })}>{r.cant > 0 ? fmt(r.cant) : "—"}</td><td style={td({ textAlign: "center", padding: 3 })}><button onClick={() => setCalRows((p) => p.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button></td></tr>))}</tbody>
                <tfoot><tr style={{ background: G, color: "#fff" }}><td colSpan={6} style={{ padding: "6px 10px", fontWeight: 700, fontSize: 12 }}>TOTAL</td><td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(calRows.reduce((s, r) => s + (parseFloat(r.cant) || 0), 0))} kg</td><td></td></tr></tfoot>
              </table>
            </div>
            <AddBtn onClick={() => setCalRows((p) => [...p, calcRow({ material: "", pa: "", pv: "" }, parseFloat(costAl) || 0)])} label="+ Adaugă material" />
          </div>
        )}

        {/* ══ DATORII ══ */}
        {tab === "datorii" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
              <SC label="Total Datorii" value={fmt(totDatAll) + " lei"} c="#c62828" bg="#ffebee" />
              {numeUnici.map((n) => { const tot = datRows.filter((r) => r.nume === n).reduce((s, r) => s + (parseSuma(r.suma) || 0), 0); return <SC key={n} label={n} value={fmt(tot) + " lei"} c="#e65100" bg="#fff3e0" />; })}
              <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                <select value={datFilter} onChange={(e) => setDatFilter(e.target.value)} style={{ border: "1px solid #ccc", borderRadius: 6, padding: "5px 10px", fontSize: 12, minWidth: 110 }}><option value="">Toți</option>{numeUnici.map((n) => <option key={n} value={n}>{n}</option>)}</select>
                {datFilter && <button onClick={() => setDatFilter("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 16 }}>✕</button>}
                <button onClick={addDAT} style={{ padding: "6px 14px", background: "#c62828", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Adaugă</button>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%", tableLayout: "fixed", minWidth: 480 }}>
                <colgroup><col style={{ width: 28 }} /><col style={{ width: 130 }} /><col style={{ width: 130 }} /><col style={{ width: 100 }} /><col /><col style={{ width: 30 }} /></colgroup>
                <thead><tr style={{ background: "#c62828" }}><th style={th({ background: "#b71c1c" })}></th><th style={th({ background: "#c62828", textAlign: "center" })}>Data</th><th style={th({ background: "#c62828", textAlign: "center" })}>Nume</th><th style={th({ background: "#c62828", textAlign: "center" })}>Total (lei)</th><th style={th({ background: "#c62828", textAlign: "center" })}>Detalii</th><th style={th({ background: "#c62828" })}></th></tr></thead>
                <tbody>{filtDat.map((r, i) => { const oi = datRows.indexOf(r); const rowBg = i % 2 === 0 ? "#fff" : "#fff5f5"; return (<tr key={r.id || i} style={{ background: rowBg }}><td style={td({ textAlign: "center", color: "#aaa", fontSize: 10, background: "#f5f5f5" })}>{i + 2}</td><td style={td({ background: rowBg })}><DateInput value={r.data || ""} onChange={(v) => updDAT(oi, "data", v)} /></td><td style={td({ background: "#fff8e1", fontWeight: 600 })}><input style={inp({ textAlign: "center", fontWeight: 600 })} value={r.nume || ""} onChange={(e) => updDAT(oi, "nume", e.target.value)} placeholder="Nume..." /></td><td style={td({ background: "#ffebee", textAlign: "right", fontWeight: 700, color: "#c62828" })}><input style={inp({ textAlign: "right", fontWeight: 700, color: "#c62828" })} value={r.suma || ""} onChange={(e) => updDAT(oi, "suma", e.target.value)} placeholder="0" /></td><td style={{ ...td({ background: rowBg }), overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.det}><input style={inp({ textAlign: "center" })} value={r.det || ""} onChange={(e) => updDAT(oi, "det", e.target.value)} placeholder="Descriere..." /></td><td style={td({ textAlign: "center", padding: 3 })}><button onClick={() => delDAT(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 14 }}>✕</button></td></tr>); })}</tbody>
                <tfoot><tr style={{ background: "#c62828", color: "#fff" }}><td colSpan={3} style={{ padding: "7px 10px", fontWeight: 700, fontSize: 12 }}>TOTAL {datFilter ? "— " + datFilter : ""}</td><td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 700, fontSize: 13 }}>{fmt(totDat)} lei</td><td colSpan={2}></td></tr></tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ══ AVANSURI & DIVIDENDE ══ */}
        {tab === "avansuri" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
              <SC label="Total Avansuri" value={fmt(totAvans) + " lei"} c="#e65100" bg="#fff3e0" />
              <SC label="Total Dividende" value={fmt(totDiv) + " lei"} c="#1565c0" bg="#e3f2fd" />
              <SC label="Total General" value={fmt(totAvans + totDiv) + " lei"} c="#6a1b9a" bg="#f3e5f5" />
              {persList.map((p) => { const tot = avRows.filter((r) => r.catre === p).reduce((s, r) => s + (parseSuma(r.suma) || 0), 0); return <SC key={p} label={"👤 " + p} value={fmt(tot) + " lei"} c={G} bg="#e8f5e9" />; })}
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ display: "flex", border: "1px solid #ccc", borderRadius: 6, overflow: "hidden" }}>
                {[["toate", "Toate"], ["avans", "Avansuri"], ["dividend", "Dividende"]].map(([v, l]) => (<button key={v} onClick={() => setAvTip(v)} style={{ padding: "5px 14px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: avTip === v ? G : "#f5f5f5", color: avTip === v ? "#fff" : "#555" }}>{l}</button>))}
              </div>
              <select value={avPers} onChange={(e) => setAvPers(e.target.value)} style={{ border: "1px solid #ccc", borderRadius: 6, padding: "5px 10px", fontSize: 12, minWidth: 120 }}><option value="">Toate persoanele</option>{persList.map((p) => <option key={p} value={p}>{p}</option>)}</select>
              {avPers && <button onClick={() => setAvPers("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 16 }}>✕</button>}
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button onClick={() => addAV("avans")} style={{ padding: "6px 14px", background: "#e65100", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Avans</button>
                <button onClick={() => addAV("dividend")} style={{ padding: "6px 14px", background: "#1565c0", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Dividend</button>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%", tableLayout: "fixed", minWidth: 800 }}>
                <colgroup><col style={{ width: 28 }} /><col style={{ width: 28 }} /><col style={{ width: 110 }} /><col style={{ width: 140 }} /><col style={{ width: 95 }} /><col style={{ width: 95 }} /><col style={{ width: 95 }} /><col style={{ width: 100 }} /><col style={{ width: 95 }} /><col /><col style={{ width: 30 }} /></colgroup>
                <thead><tr style={{ background: G }}>
                  <th style={th({ background: "#155a35" })}></th>
                  <th style={th({ background: "#155a35" })}></th>
                  <th style={th({ textAlign: "center" })}>Data</th>
                  <th style={th({ textAlign: "center" })}>Către</th>
                  <th style={th({ textAlign: "center" })}>Avans (lei)</th>
                  <th style={th({ textAlign: "center" })}>Decontat</th>
                  <th style={th({ textAlign: "center" })}>Rest</th>
                  <th style={th({ textAlign: "center" })}>Status</th>
                  <th style={th({ textAlign: "center" })}>Tip</th>
                  <th style={th({ textAlign: "center" })}>Detalii</th>
                  <th style={th({})}></th>
                </tr></thead>
                <tbody>
                  {filtAv.length === 0 && <tr><td colSpan={11} style={{ textAlign: "center", padding: 20, color: "#aaa" }}>Nicio înregistrare.</td></tr>}
                  {filtAv.map((r, i) => {
                    const oi = avRows.indexOf(r);
                    const isDiv = r.tip === "dividend";
                    const sumaTot = parseSuma(r.suma) || 0;
                    const decont = r.decont || [];
                    const decontatTot = decont.reduce((s, d) => s + (parseSuma(d.suma) || 0), 0);
                    const rest = sumaTot - decontatTot;
                    const isExpanded = expandedAv === r.id;
                    let statusLbl, statusBg, statusColor;
                    if (sumaTot === 0) { statusLbl = "—"; statusBg = "#f5f5f5"; statusColor = "#888"; }
                    else if (rest === 0) { statusLbl = "✅ Închis"; statusBg = "#e8f5e9"; statusColor = G; }
                    else if (rest < 0) { statusLbl = "⚠️ Supra"; statusBg = "#ffebee"; statusColor = "#c62828"; }
                    else if (decontatTot === 0) { statusLbl = "⏳ Nedecontat"; statusBg = "#fff3e0"; statusColor = "#e65100"; }
                    else { statusLbl = "🟡 În decont"; statusBg = "#fff8e1"; statusColor = "#f57c00"; }
                    const rowBg = isDiv ? (i % 2 === 0 ? "#eff6ff" : "#dbeafe") : (i % 2 === 0 ? "#fff" : "#f9f9f9");
                    return (
                      <Fragment key={r.id || i}>
                        <tr style={{ background: rowBg }}>
                          <td style={td({ textAlign: "center", color: "#aaa", fontSize: 10, background: "#f5f5f5" })}>{i + 2}</td>
                          <td style={td({ textAlign: "center", padding: 2 })}>
                            <button onClick={() => setExpandedAv(isExpanded ? null : r.id)} title={isExpanded ? "Ascunde deconturi" : "Vezi/Adaugă deconturi"} style={{ background: isExpanded ? G : "#e8f5e9", color: isExpanded ? "#fff" : G, border: `1px solid ${G}`, borderRadius: 4, padding: "2px 7px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>{isExpanded ? "▼" : "▶"} {decont.length}</button>
                          </td>
                          <td style={td({ background: rowBg })}><DateInput value={r.data || ""} onChange={(v) => updAV(oi, "data", v)} /></td>
                          <td style={td({ background: rowBg, fontWeight: 600 })}><input style={inp({ textAlign: "center", fontWeight: 600 })} value={r.catre || ""} onChange={(e) => updAV(oi, "catre", e.target.value)} placeholder="—" /></td>
                          <td style={td({ background: rowBg, textAlign: "right", fontWeight: 700, color: isDiv ? "#1565c0" : "#e65100" })}><input style={inp({ textAlign: "right", fontWeight: 700, color: isDiv ? "#1565c0" : "#e65100" })} value={r.suma || ""} onChange={(e) => updAV(oi, "suma", e.target.value)} placeholder="0" /></td>
                          <td style={td({ background: decontatTot > 0 ? "#e8f5e9" : rowBg, textAlign: "right", fontWeight: 700, color: decontatTot > 0 ? G : "#888" })}>{fmt(decontatTot)}</td>
                          <td style={td({ background: rest === 0 && sumaTot > 0 ? "#e8f5e9" : rest < 0 ? "#ffebee" : rest > 0 && sumaTot > 0 ? "#fff8e1" : rowBg, textAlign: "right", fontWeight: 700, color: rest === 0 && sumaTot > 0 ? G : rest < 0 ? "#c62828" : "#e65100" })}>{fmt(rest)}</td>
                          <td style={td({ background: statusBg, textAlign: "center", fontWeight: 700, color: statusColor, fontSize: 11 })}>{statusLbl}</td>
                          <td style={td({ background: isDiv ? "#dbeafe" : "#fff3e0", textAlign: "center" })}><select style={sel({ color: isDiv ? "#1565c0" : "#e65100", fontWeight: 700, textAlign: "center" })} value={r.tip || ""} onChange={(e) => updAV(oi, "tip", e.target.value)}><option value="avans">avans</option><option value="dividend">dividende</option></select></td>
                          <td style={td({ background: rowBg })}><input style={inp({ textAlign: "center" })} value={r.det || ""} onChange={(e) => updAV(oi, "det", e.target.value)} placeholder="..." /></td>
                          <td style={td({ textAlign: "center", padding: 3 })}><button onClick={() => delAV(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 14 }}>✕</button></td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={11} style={{ padding: 12, background: "#fafafa", borderTop: `2px solid ${G}`, borderBottom: `2px solid ${G}` }}>
                              <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                                  <div style={{ fontWeight: 700, color: G, fontSize: 13 }}>📋 Deconturi pentru avans {r.catre || "—"} ({fmt(sumaTot)} lei)</div>
                                  <button onClick={() => addDecontItem(r.id)} style={{ background: G, color: "#fff", border: "none", borderRadius: 5, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Adaugă Decont</button>
                                </div>
                                {decont.length === 0 ? (
                                  <div style={{ textAlign: "center", padding: 14, color: "#aaa", fontSize: 12 }}>Niciun decont încă. Click pe "+ Adaugă Decont" mai sus.</div>
                                ) : (
                                  <table style={{ borderCollapse: "collapse", width: "100%" }}>
                                    <colgroup><col style={{ width: 28 }} /><col style={{ width: 120 }} /><col style={{ width: 110 }} /><col style={{ width: 110 }} /><col /><col style={{ width: 30 }} /></colgroup>
                                    <thead><tr style={{ background: "#155a35" }}>
                                      <th style={th({ background: "#0d4a2a", textAlign: "center" })}>#</th>
                                      <th style={th({ background: "#155a35", textAlign: "center" })}>Data</th>
                                      <th style={th({ background: "#155a35", textAlign: "center" })}>Categorie</th>
                                      <th style={th({ background: "#155a35", textAlign: "center" })}>Sumă (lei)</th>
                                      <th style={th({ background: "#155a35", textAlign: "center" })}>Descriere</th>
                                      <th style={th({ background: "#0d4a2a" })}></th>
                                    </tr></thead>
                                    <tbody>
                                      {decont.map((d, di) => (
                                        <tr key={di} style={{ background: di % 2 === 0 ? "#fff" : "#f8fbf9" }}>
                                          <td style={td({ textAlign: "center", color: "#888", fontSize: 10, background: "#f5f5f5" })}>{di + 1}</td>
                                          <td style={td()}><DateInput value={d.data || ""} onChange={(v) => updDecontItem(r.id, di, "data", v)} /></td>
                                          <td style={td({ background: "#e8f5e9" })}>
                                            <select style={sel({ color: G, fontWeight: 600, textAlign: "center" })} value={d.cat || "Marfă"} onChange={(e) => updDecontItem(r.id, di, "cat", e.target.value)}>
                                              {DECONT_CAT.map((c) => <option key={c}>{c}</option>)}
                                            </select>
                                          </td>
                                          <td style={td({ textAlign: "right", background: "#fff8e1", fontWeight: 700, color: "#e65100" })}>
                                            <input style={inp({ textAlign: "right", fontWeight: 700, color: "#e65100" })} value={d.suma || ""} onChange={(e) => updDecontItem(r.id, di, "suma", e.target.value)} placeholder="0" />
                                          </td>
                                          <td style={td()}><input style={inp({ textAlign: "center" })} value={d.det || ""} onChange={(e) => updDecontItem(r.id, di, "det", e.target.value)} placeholder="Descriere..." /></td>
                                          <td style={td({ textAlign: "center", padding: 3 })}><button onClick={() => delDecontItem(r.id, di)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13 }}>✕</button></td>
                                        </tr>
                                      ))}
                                    </tbody>
                                    <tfoot>
                                      <tr style={{ background: "#e8f5e9" }}>
                                        <td colSpan={3} style={{ padding: "6px 10px", fontWeight: 700, fontSize: 12, color: G }}>TOTAL DECONTAT</td>
                                        <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700, color: G, fontSize: 12 }}>{fmt(decontatTot)} lei</td>
                                        <td colSpan={2}></td>
                                      </tr>
                                      <tr style={{ background: rest === 0 ? "#e8f5e9" : rest < 0 ? "#ffebee" : "#fff8e1" }}>
                                        <td colSpan={3} style={{ padding: "6px 10px", fontWeight: 700, fontSize: 12, color: rest === 0 ? G : rest < 0 ? "#c62828" : "#e65100" }}>REST DE DECONTAT</td>
                                        <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 800, color: rest === 0 ? G : rest < 0 ? "#c62828" : "#e65100", fontSize: 13 }}>{fmt(rest)} lei</td>
                                        <td colSpan={2}></td>
                                      </tr>
                                    </tfoot>
                                  </table>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
                <tfoot><tr style={{ background: G, color: "#fff" }}><td colSpan={4} style={{ padding: "7px 10px", fontWeight: 700, fontSize: 12 }}>TOTAL</td><td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 700, fontSize: 13 }}>{fmt(filtAv.reduce((s, r) => s + (parseSuma(r.suma) || 0), 0))} lei</td><td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 700, fontSize: 13 }}>{fmt(filtAv.reduce((s, r) => s + (r.decont || []).reduce((ss, d) => ss + (parseSuma(d.suma) || 0), 0), 0))}</td><td colSpan={5}></td></tr></tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ══ CONTRACTE ══ */}
        {tab === "contracte" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
              <SC label="Total Contracte" value={contracte.filter((r) => r.companie).length + " buc."} c="#1565c0" bg="#e3f2fd" />
              <SC label="Cu detalii" value={contracte.filter((r) => r.detalii).length + " buc."} c={G} bg="#e8f5e9" />
              <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                <input value={ctSearch} onChange={(e) => setCtSearch(e.target.value)} placeholder="🔍 Caută companie, nr, detalii..." style={{ border: "1px solid #ccc", borderRadius: 6, padding: "5px 10px", fontSize: 12, width: 220 }} />
                {ctSearch && <button onClick={() => setCtSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 16, lineHeight: 1 }}>✕</button>}
                <button onClick={addCT} style={{ padding: "6px 14px", background: G, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Adaugă contract</button>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%", tableLayout: "fixed", minWidth: 520 }}>
                <colgroup><col style={{ width: 28 }} /><col style={{ width: 65 }} /><col style={{ width: "auto" }} /><col style={{ width: 130 }} /><col style={{ width: 180 }} /><col style={{ width: 30 }} /></colgroup>
                <thead><tr style={{ background: G }}><th style={th({ background: "#155a35" })}></th><th style={th({ textAlign: "center" })}>Nr.</th><th style={th({ textAlign: "center" })}>Companie</th><th style={th({ textAlign: "center" })}>Data</th><th style={th({ textAlign: "center" })}>Detalii</th><th style={th({})}></th></tr></thead>
                <tbody>
                  {filtCT.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 20, color: "#aaa" }}>Niciun contract găsit.</td></tr>}
                  {filtCT.map((r, i) => { const oi = contracte.indexOf(r); const isEmpty = !r.companie; const rowBg = isEmpty ? "#fafafa" : i % 2 === 0 ? "#fff" : "#f3f8ff"; const hasD = !!r.detalii; return (<tr key={r.id || i} style={{ background: rowBg }}><td style={td({ textAlign: "center", color: "#aaa", fontSize: 10, background: "#f5f5f5" })}>{i + 2}</td><td style={td({ background: "#e3f2fd", textAlign: "center", fontWeight: 700, color: "#1565c0", fontFamily: "monospace" })}><input style={inp({ textAlign: "center", fontWeight: 700, color: "#1565c0", fontFamily: "monospace" })} value={r.nr || ""} onChange={(e) => updCT(oi, "nr", e.target.value)} /></td><td style={td({ background: rowBg, fontWeight: isEmpty ? 400 : 600, color: isEmpty ? "#bbb" : "#222", textAlign: "center" })}><input style={inp({ textAlign: "center", fontWeight: isEmpty ? 400 : 600, color: isEmpty ? "#bbb" : "#222" })} value={r.companie || ""} onChange={(e) => updCT(oi, "companie", e.target.value)} placeholder="—" /></td><td style={td({ background: rowBg, textAlign: "center", fontSize: 12 })}><DateInput value={r.data || ""} onChange={(v) => updCT(oi, "data", v)} /></td><td style={td({ background: hasD ? "#fff8e1" : rowBg, fontStyle: hasD ? "italic" : "normal", color: hasD ? "#e65100" : "#555", textAlign: "center" })}><input style={inp({ textAlign: "center", fontStyle: hasD ? "italic" : "normal", color: hasD ? "#e65100" : "#555" })} value={r.detalii || ""} onChange={(e) => updCT(oi, "detalii", e.target.value)} placeholder="—" /></td><td style={td({ textAlign: "center", padding: 3 })}><button onClick={() => delCT(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 14 }}>✕</button></td></tr>); })}
                </tbody>
                <tfoot><tr style={{ background: G, color: "#fff" }}><td colSpan={2} style={{ padding: "7px 10px", fontWeight: 700, fontSize: 12 }}>TOTAL</td><td colSpan={4} style={{ padding: "7px 10px", fontSize: 12 }}>{filtCT.length} contracte din {contracte.length}</td></tr></tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ══ PAROLE ══ */}
        {tab === "parole" && (
          <div>
            {!pinUnlocked ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", minHeight: 320 }}>
                <div style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 16, padding: "36px 40px", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", maxWidth: 320, width: "100%" }}>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>🔐</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#263238", marginBottom: 4 }}>Secțiune protejată</div>
                  <div style={{ fontSize: 13, color: "#888", marginBottom: 28 }}>Introduceți PIN-ul pentru a accesa parolele</div>
                  <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 24 }}>
                    {[0, 1, 2, 3, 4, 5].map((idx) => (<div key={idx} style={{ width: 14, height: 14, borderRadius: "50%", background: pinInput.length > idx ? (pinError ? "#e53935" : G) : "#e0e0e0", border: `2px solid ${pinInput.length > idx ? (pinError ? "#e53935" : G) : "#ccc"}` }} />))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map((k, i) => (
                      <button key={i} onClick={() => {
                        if (k === "⌫") { setPinInput((p) => p.slice(0, -1)); setPinError(false); }
                        else if (k !== "" && pinInput.length < 6) {
                          const next = pinInput + String(k);
                          setPinInput(next);
                          if (next.length === 6) checkPin(next);
                        }
                      }} disabled={k === ""}
                        style={{ height: 52, borderRadius: 10, border: "none", fontSize: k === "⌫" ? 18 : 20, fontWeight: 600, cursor: k === "" ? "default" : "pointer", background: k === "" ? "transparent" : pinError ? "#ffebee" : "#f5f5f5", color: pinError && k !== "" ? "#e53935" : k === "⌫" ? "#e53935" : "#263238", boxShadow: k === "" ? "none" : "0 2px 4px rgba(0,0,0,.08)" }}
                        onMouseEnter={(e) => { if (k !== "") e.currentTarget.style.background = pinError ? "#ffcdd2" : "#e8f5e9"; }}
                        onMouseLeave={(e) => { if (k !== "") e.currentTarget.style.background = pinError ? "#ffebee" : "#f5f5f5"; }}
                      >{k}</button>
                    ))}
                  </div>
                  {pinError && <div style={{ color: "#e53935", fontSize: 13, fontWeight: 600 }}>❌ PIN incorect</div>}
                  {!pinError && <div style={{ color: "#aaa", fontSize: 12 }}>Tastează cele 6 cifre</div>}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                  <button onClick={() => { setPinUnlocked(false); setPinInput(""); }} style={{ padding: "5px 14px", background: "#ffebee", color: "#e53935", border: "1px solid #ef9a9a", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>🔒 Blochează</button>
                </div>
                <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
                  {CAT_PAROLE.map((c) => { const cnt = parole.filter((r) => r.cat === c).length; const colors = { Email: ["#1565c0", "#e3f2fd"], Bancă: ["#2e7d32", "#e8f5e9"], Card: ["#6a1b9a", "#f3e5f5"], Platformă: ["#e65100", "#fff3e0"], WiFi: ["#0277bd", "#e1f5fe"], Altele: ["#555", "#f5f5f5"] }; const [c1, bg1] = colors[c] || ["#555", "#f5f5f5"]; return (<div key={c} onClick={() => setParolaCat(parolaCat === c ? "toate" : c)} style={{ flex: "0 0 auto", background: parolaCat === c ? c1 : bg1, border: `2px solid ${c1}`, borderRadius: 8, padding: "6px 14px", cursor: "pointer" }}><div style={{ fontSize: 10, color: parolaCat === c ? "rgba(255,255,255,0.8)" : "#666" }}>{c}</div><div style={{ fontSize: 16, fontWeight: 700, color: parolaCat === c ? "#fff" : c1 }}>{cnt}</div></div>); })}
                  <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <input value={parolaSearch} onChange={(e) => setParolaSearch(e.target.value)} placeholder="🔍 Caută platformă, user, note..." style={{ border: "1px solid #ccc", borderRadius: 6, padding: "5px 10px", fontSize: 12, width: 220 }} />
                    {parolaSearch && <button onClick={() => setParolaSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 16 }}>✕</button>}
                    {parolaCat !== "toate" && <button onClick={() => setParolaCat("toate")} style={{ padding: "5px 10px", background: "#f5f5f5", border: "1px solid #ccc", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>✕ {parolaCat}</button>}
                    <button onClick={addPAR} style={{ padding: "6px 14px", background: G, color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Adaugă</button>
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 680 }}>
                    <thead><tr style={{ background: "#263238" }}><th style={th({ background: "#1c2529", width: 28 })}></th><th style={th({ background: "#263238", textAlign: "left", minWidth: 170 })}>Platformă</th><th style={th({ background: "#263238", width: 85 })}>Categorie</th><th style={th({ background: "#263238", textAlign: "left", minWidth: 160 })}>Utilizator / Email</th><th style={th({ background: "#263238", minWidth: 160 })}>Parolă</th><th style={th({ background: "#263238", textAlign: "left", minWidth: 140 })}>Note</th><th style={th({ background: "#263238", width: 30 })}></th></tr></thead>
                    <tbody>
                      {filtParole.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 20, color: "#aaa" }}>Niciun rezultat.</td></tr>}
                      {filtParole.map((r, i) => {
                        const oi = parole.indexOf(r); const isEdit = parolaEdit === oi; const catColors = { Email: ["#1565c0", "#e3f2fd"], Bancă: ["#2e7d32", "#e8f5e9"], Card: ["#6a1b9a", "#f3e5f5"], Platformă: ["#e65100", "#fff3e0"], WiFi: ["#0277bd", "#e1f5fe"], Altele: ["#555", "#f5f5f5"] }; const [cc, cbg] = catColors[r.cat] || ["#555", "#f5f5f5"]; const rowBg = i % 2 === 0 ? "#fff" : "#f8f9fa"; const visible = showParole[oi];
                        return (<tr key={r.id || i} style={{ background: isEdit ? "#fffde7" : rowBg }}>
                          <td style={td({ textAlign: "center", color: "#aaa", fontSize: 10, background: "#f5f5f5" })}>{i + 1}</td>
                          <td style={td({ background: isEdit ? "#fffde7" : rowBg, fontWeight: 600 })}>{isEdit ? <input style={inp({ fontWeight: 600 })} value={r.platforma || ""} onChange={(e) => updPAR(oi, "platforma", e.target.value)} /> : <span>{r.platforma}</span>}</td>
                          <td style={td({ background: cbg, textAlign: "center" })}><select style={sel({ color: cc, fontWeight: 700, fontSize: 10 })} value={r.cat || ""} onChange={(e) => updPAR(oi, "cat", e.target.value)}>{CAT_PAROLE.map((c) => <option key={c}>{c}</option>)}</select></td>
                          <td style={td({ background: isEdit ? "#fffde7" : rowBg, fontSize: 11 })}><div style={{ display: "flex", alignItems: "center", gap: 4 }}>{isEdit ? <input style={inp({ fontSize: 11 })} value={r.user || ""} onChange={(e) => updPAR(oi, "user", e.target.value)} placeholder="user / email" /> : <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.user}>{r.user || "—"}</span>}{r.user && !isEdit && <button onClick={() => navigator.clipboard?.writeText(r.user)} title="Copiază" style={{ background: "none", border: "none", cursor: "pointer", color: "#90a4ae", fontSize: 12, padding: "0 2px", flexShrink: 0 }}>📋</button>}</div></td>
                          <td style={td({ background: isEdit ? "#fffde7" : "#f9fbe7" })}><div style={{ display: "flex", alignItems: "center", gap: 4 }}>{isEdit ? <input style={inp({ fontFamily: "monospace", fontSize: 11 })} value={r.parola || ""} onChange={(e) => updPAR(oi, "parola", e.target.value)} placeholder="parolă" /> : <span style={{ flex: 1, fontFamily: "monospace", fontSize: 12, letterSpacing: visible ? "0" : "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={visible ? r.parola : ""}>{visible ? r.parola : (r.parola ? "••••••••" : "—")}</span>}{r.parola && !isEdit && (<><button onClick={() => setShowParole((p) => ({ ...p, [oi]: !p[oi] }))} title={visible ? "Ascunde" : "Arată"} style={{ background: "none", border: "none", cursor: "pointer", color: "#90a4ae", fontSize: 13, padding: "0 2px", flexShrink: 0 }}>{visible ? "🙈" : "👁️"}</button><button onClick={() => navigator.clipboard?.writeText(r.parola)} title="Copiază parola" style={{ background: "none", border: "none", cursor: "pointer", color: "#90a4ae", fontSize: 12, padding: "0 2px", flexShrink: 0 }}>📋</button></>)}</div></td>
                          <td style={td({ background: isEdit ? "#fffde7" : rowBg, fontSize: 11, color: "#666" })}>{isEdit ? <input style={inp({ fontSize: 11 })} value={r.note || ""} onChange={(e) => updPAR(oi, "note", e.target.value)} placeholder="note, url, detalii..." /> : <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }} title={r.note}>{r.note || ""}</span>}</td>
                          <td style={td({ textAlign: "center", padding: 3 })}><div style={{ display: "flex", flexDirection: "column", gap: 2 }}><button onClick={() => setParolaEdit(isEdit ? null : oi)} title={isEdit ? "Salvează" : "Editează"} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, lineHeight: 1 }}>{isEdit ? "✅" : "✏️"}</button><button onClick={() => delPAR(r.id)} title="Șterge" style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 13, lineHeight: 1 }}>✕</button></div></td>
                        </tr>);
                      })}
                    </tbody>
                    <tfoot><tr style={{ background: "#263238", color: "#fff" }}><td colSpan={2} style={{ padding: "7px 10px", fontWeight: 700, fontSize: 12 }}>TOTAL</td><td colSpan={5} style={{ padding: "7px 10px", fontSize: 12 }}>{filtParole.length} înregistrări din {parole.length}</td></tr></tfoot>
                  </table>
                </div>
                <div style={{ marginTop: 10, fontSize: 11, color: "#888", textAlign: "center" }}>👁️ Click pe ochi pentru a vedea parola &nbsp;|&nbsp; 📋 Click pentru a copia &nbsp;|&nbsp; ✏️ Click pentru a edita</div>
              </div>
            )}
          </div>
        )}

        {/* ══ TRASABILITATE ══ */}
        {tab === "trasabilitate" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
              <SC label="Total intrări" value={trasEntries.length + " buc."} c="#1565c0" bg="#e3f2fd" />
              <SC label="✅ Alocate" value={trasEntries.filter(e => e.trasabilitate).length + " buc."} c={G} bg="#e8f5e9" />
              <SC label="⏳ Nealocate" value={trasEntries.filter(e => !e.trasabilitate).length + " buc."} c="#c62828" bg="#ffebee" />
              <SC label="Firme alocate" value={trasCompanies.length + " firme"} c="#6a1b9a" bg="#f3e5f5" />
            </div>

            {/* Generators */}
            <div style={{ background: "linear-gradient(135deg,#fff3e0,#fff8f5)", border: "2px solid #ffcc80", borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: "#e65100", fontSize: 13, marginBottom: 10 }}>📋 Generare documente</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 10 }}>
                <div style={{ flex: "0 0 200px" }}>
                  <label style={LSt}>Firma (Trasabilitate)</label>
                  <select style={{ ...IFS, fontWeight: 700, color: "#e65100" }} value={trasCompany} onChange={(e) => setTrasCompany(e.target.value)}>
                    <option value="">— alege firma —</option>
                    {trasCompanies.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ flex: "0 0 130px" }}>
                  <label style={LSt}>Luna (MM.YYYY)</label>
                  <select style={IFS} value={trasMonth} onChange={(e) => setTrasMonth(e.target.value)}>
                    <option value="">— alege luna —</option>
                    {trasMonthsList.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div style={{ flex: "0 0 130px" }}>
                  <label style={LSt}>Nr. Înregistrare</label>
                  <input style={IFS} value={trasNrInreg} onChange={(e) => setTrasNrInreg(e.target.value)} placeholder="ex: 27/31.12.2025" />
                </div>
                <div style={{ flex: "0 0 160px" }}>
                  <label style={LSt}>Contract</label>
                  <input style={IFS} value={trasContract} onChange={(e) => setTrasContract(e.target.value)} placeholder="ex: ECO 17/01.07.2024" />
                </div>
                <div style={{ flex: "0 0 130px" }}>
                  <label style={LSt}>Factură</label>
                  <input style={IFS} value={trasFactura} onChange={(e) => setTrasFactura(e.target.value)} placeholder="ex: GKF 2324" />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
                <button onClick={generateAnexaRaportare} disabled={trasGenLoading} style={{ padding: "10px", background: trasGenLoading ? "#ccc" : "#1565c0", color: "#fff", border: "none", borderRadius: 6, cursor: trasGenLoading ? "wait" : "pointer", fontSize: 12, fontWeight: 700 }}>📊 Anexa raportare</button>
                <button onClick={generateDeclaratia} style={{ padding: "10px", background: "#6a1b9a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>📄 Declaratia</button>
                <button onClick={generatePDFToate} style={{ padding: "10px", background: "#e65100", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>📦 PDF Toate Documentele</button>
              </div>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ display: "flex", border: "1px solid #ccc", borderRadius: 6, overflow: "hidden" }}>
                {[["all", "Toate"], ["assigned", "✅ Alocate"], ["unassigned", "⏳ Nealocate"]].map(([v, l]) => (
                  <button key={v} onClick={() => setTrasMode(v)} style={{ padding: "5px 14px", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: trasMode === v ? G : "#f5f5f5", color: trasMode === v ? "#fff" : "#555" }}>{l}</button>
                ))}
              </div>
              <select value={trasMonth} onChange={(e) => setTrasMonth(e.target.value)} style={{ border: "1px solid #ccc", borderRadius: 6, padding: "5px 10px", fontSize: 12 }}>
                <option value="">Toate lunile</option>
                {trasMonthsList.map(m => <option key={m}>{m}</option>)}
              </select>
              <input value={trasFilter} onChange={(e) => setTrasFilter(e.target.value)} placeholder="🔍 Caută firmă, trasabilitate, denumire..." style={{ flex: 1, minWidth: 200, border: "1px solid #ccc", borderRadius: 6, padding: "5px 10px", fontSize: 12 }} />
              {trasFilter && <button onClick={() => setTrasFilter("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#e53935", fontSize: 16 }}>✕</button>}
            </div>

            {/* Combined Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 900 }}>
                <thead><tr>
                  <th style={th({ background: "#6a1b9a", width: 50 })}>Tip</th>
                  <th style={th({ background: "#6a1b9a", width: 50 })}>Serie</th>
                  <th style={th({ background: "#6a1b9a", width: 65 })}>Nr</th>
                  <th style={th({ background: "#6a1b9a", width: 85 })}>Data</th>
                  <th style={th({ background: "#6a1b9a", textAlign: "left", minWidth: 150 })}>Furnizor / Client</th>
                  <th style={th({ background: "#6a1b9a", width: 110 })}>CNP / CUI</th>
                  <th style={th({ background: "#6a1b9a", textAlign: "left", minWidth: 200 })}>Denumire</th>
                  <th style={th({ background: "#6a1b9a", width: 75 })}>Cant.(kg)</th>
                  <th style={{ ...th({ background: "#e65100", minWidth: 170 }) }}>🔄 Trasabilitate</th>
                </tr></thead>
                <tbody>
                  {trasFiltered.length === 0 && <tr><td colSpan={9} style={{ textAlign: "center", padding: 20, color: "#aaa" }}>Nicio înregistrare.</td></tr>}
                  {trasFiltered.map((e, i) => {
                    const rowBg = e.type === "PF" ? (i % 2 === 0 ? "#fff" : "#f7faf8") : (i % 2 === 0 ? "#fff8f5" : "#fff3e0");
                    return (
                      <tr key={e.id} style={{ background: rowBg }}>
                        <td style={td({ textAlign: "center", background: e.type === "PF" ? "#e3f2fd" : "#fff3e0", fontWeight: 700, color: e.type === "PF" ? "#1565c0" : "#e65100", fontSize: 11 })}>{e.type}</td>
                        <td style={td({ textAlign: "center", fontWeight: 700, color: e.type === "PF" ? G : "#e65100" })}>{e.serie}</td>
                        <td style={td({ textAlign: "center", fontWeight: 600, color: "#1565c0" })}>{e.nr}</td>
                        <td style={td({ textAlign: "center" })}>{e.data}</td>
                        <td style={td({ fontWeight: 600 })}>{e.furnizor}</td>
                        <td style={td({ fontFamily: "monospace", fontSize: 11 })}>{e.cui_cnp}</td>
                        <td style={td({ fontSize: 11 })}>{e.denumire}</td>
                        <td style={td({ textAlign: "right", background: "#e8f5e9", fontWeight: 700, color: G })}>{fmt(e.cant)}</td>
                        <td style={td({ background: e.trasabilitate ? "#fff3e0" : "#fff" })}>
                          <input style={inp({ fontWeight: e.trasabilitate ? 700 : 400, color: e.trasabilitate ? "#e65100" : "#aaa" })} value={e.trasabilitate || ""} onChange={(ev) => updTrasabilitate(e, ev.target.value)} placeholder="— alocă firmă —" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot><tr style={{ background: "#6a1b9a", color: "#fff" }}>
                  <td colSpan={7} style={{ padding: "6px 10px", fontWeight: 700, fontSize: 12 }}>TOTAL {trasFiltered.length} din {trasEntries.length}</td>
                  <td style={{ padding: "6px", textAlign: "right", fontWeight: 700 }}>{fmt(trasFiltered.reduce((s, e) => s + e.cant, 0))} kg</td>
                  <td></td>
                </tr></tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ══ RAPOARTE ══ */}
        {tab === "rapoarte" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <SC label="Registru PF (linii)" value={registru.length + " buc."} c="#1565c0" bg="#e3f2fd" />
              <SC label="Registru PJ (PV-uri)" value={pvList.length + " buc."} c="#e65100" bg="#fff3e0" />
              <SC label="Total Cant. PF" value={fmt(registru.reduce((s, r) => s + (parseFloat(r.cantitate) || 0), 0)) + " kg"} c={G} bg="#e8f5e9" />
              <SC label="Total Cant. PJ" value={fmt(pvList.reduce((s, p) => s + (p.materiale || []).reduce((ss, m) => ss + (parseFloat(m.cant) || 0), 0), 0)) + " kg"} c="#6a1b9a" bg="#f3e5f5" />
            </div>

            <div style={{ background: "linear-gradient(135deg,#e8f5e9,#f0faf4)", border: "2px solid #a5d6a7", borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: G, fontSize: 13, marginBottom: 12 }}>📅 Filtru perioadă (opțional)</div>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
                <div style={{ flex: "0 0 140px" }}>
                  <label style={LSt}>Data început</label>
                  <input style={IFS} value={rapDateStart} onChange={(e) => setRapDateStart(e.target.value)} placeholder="DD.MM.YYYY" />
                </div>
                <div style={{ flex: "0 0 140px" }}>
                  <label style={LSt}>Data sfârșit</label>
                  <input style={IFS} value={rapDateEnd} onChange={(e) => setRapDateEnd(e.target.value)} placeholder="DD.MM.YYYY" />
                </div>
                {(rapDateStart || rapDateEnd) && (
                  <button onClick={() => { setRapDateStart(""); setRapDateEnd(""); }} style={{ padding: "5px 12px", background: "#f5f5f5", border: "1px solid #ccc", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>✕ Resetează</button>
                )}
                <div style={{ fontSize: 11, color: "#666", marginLeft: 10 }}>Lasă gol pentru export complet</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
              <div style={{ background: "#fff", border: "2px solid #1565c0", borderRadius: 10, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>👤</div>
                <div style={{ fontWeight: 700, color: "#1565c0", fontSize: 14, marginBottom: 4 }}>Registru PF</div>
                <div style={{ fontSize: 11, color: "#666", marginBottom: 12 }}>Borderouri de la persoane fizice<br/>{registru.length} linii disponibile</div>
                <button onClick={() => exportExcel("pf")} disabled={rapLoading || registru.length === 0} style={{ width: "100%", padding: "10px", background: rapLoading ? "#ccc" : "#1565c0", color: "#fff", border: "none", borderRadius: 6, cursor: rapLoading ? "wait" : "pointer", fontSize: 13, fontWeight: 700 }}>
                  {rapLoading ? "⏳ Generez..." : "📥 Descarcă Excel PF"}
                </button>
              </div>

              <div style={{ background: "#fff", border: "2px solid #e65100", borderRadius: 10, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🏢</div>
                <div style={{ fontWeight: 700, color: "#e65100", fontSize: 14, marginBottom: 4 }}>Registru PJ</div>
                <div style={{ fontSize: 11, color: "#666", marginBottom: 12 }}>Procese verbale firme<br/>{pvList.length} PV-uri disponibile</div>
                <button onClick={() => exportExcel("pj")} disabled={rapLoading || pvList.length === 0} style={{ width: "100%", padding: "10px", background: rapLoading ? "#ccc" : "#e65100", color: "#fff", border: "none", borderRadius: 6, cursor: rapLoading ? "wait" : "pointer", fontSize: 13, fontWeight: 700 }}>
                  {rapLoading ? "⏳ Generez..." : "📥 Descarcă Excel PJ"}
                </button>
              </div>

              <div style={{ background: "#fff", border: "2px solid #6a1b9a", borderRadius: 10, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
                <div style={{ fontWeight: 700, color: "#6a1b9a", fontSize: 14, marginBottom: 4 }}>Raport Complet</div>
                <div style={{ fontSize: 11, color: "#666", marginBottom: 12 }}>PF + PJ în 2 sheet-uri<br/>{registru.length + pvList.length} înregistrări</div>
                <button onClick={() => exportExcel("all")} disabled={rapLoading || (registru.length === 0 && pvList.length === 0)} style={{ width: "100%", padding: "10px", background: rapLoading ? "#ccc" : "#6a1b9a", color: "#fff", border: "none", borderRadius: 6, cursor: rapLoading ? "wait" : "pointer", fontSize: 13, fontWeight: 700 }}>
                  {rapLoading ? "⏳ Generez..." : "📥 Descarcă Excel Complet"}
                </button>
              </div>
            </div>

            <div style={{ marginTop: 16, background: "#fff8e1", border: "1px solid #ffd54f", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#666" }}>
              <strong style={{ color: "#e65100" }}>ℹ️ Structură Excel:</strong> Serie • Nr • Data • Furnizor • Adresa • CNP/CUI • Denumire • CodSAGA • Cantitate • PU • CodFSaga • Trasabilitate • Nr NIR • Denumire Deseu • Impozit 10% • Taxa Mediu 2% • Valoare
              <br/><span style={{ fontSize: 11 }}>Câmpurile lipsă (CodSAGA, CodFSaga, Trasabilitate, NIR) rămân goale pentru completare manuală.</span>
            </div>

            {/* ═══ IMPORT / EXPORT TEMPLATES ═══ */}
            <div style={{ marginTop: 24, background: "linear-gradient(135deg,#f5f5f5,#fff)", border: "2px solid #ccc", borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#333", marginBottom: 6 }}>📂 Import / Export Date</div>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 14 }}>
                Descarcă template Excel cu antetul corect, completează-l offline, apoi importă datele.
                Înregistrările deja existente NU sunt afectate — doar se adaugă cele noi.
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12 }}>
                {Object.entries(IMPORT_SCHEMAS).map(([key, schema]) => (
                  <div key={key} style={{ background: "#fff", border: `2px solid ${schema.color}`, borderRadius: 8, padding: 12 }}>
                    <div style={{ fontWeight: 700, color: schema.color, marginBottom: 8, fontSize: 13 }}>{schema.label}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => exportTemplate(key)} style={{ flex: 1, background: "#fff", color: schema.color, border: `1px solid ${schema.color}`, borderRadius: 5, padding: "6px 10px", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>📥 Template</button>
                      <button onClick={() => { setImpTarget(key); impFileRef.current?.click(); }} disabled={impLoading} style={{ flex: 1, background: schema.color, color: "#fff", border: "none", borderRadius: 5, padding: "6px 10px", cursor: impLoading ? "wait" : "pointer", fontSize: 11, fontWeight: 600 }}>📤 Import</button>
                    </div>
                  </div>
                ))}
              </div>

              <input
                ref={impFileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                style={{ display: "none" }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !impTarget) return;
                  const schema = IMPORT_SCHEMAS[impTarget];
                  if (!window.confirm(`Importi datele din "${file.name}" în ${schema.label}?\n\nÎnregistrările existente NU sunt afectate.`)) {
                    e.target.value = "";
                    return;
                  }
                  await importFromExcel(file, impTarget);
                  e.target.value = "";
                }}
              />

              {impLoading && (
                <div style={{ marginTop: 12, padding: 10, background: "#e3f2fd", borderRadius: 6, color: "#1565c0", fontSize: 12, textAlign: "center", fontWeight: 600 }}>
                  ⏳ Se importă datele... așteaptă...
                </div>
              )}

              {impResult && (
                <div style={{ marginTop: 12, padding: 12, background: impResult.success ? "#e8f5e9" : "#ffebee", border: `1px solid ${impResult.success ? G : "#c62828"}`, borderRadius: 6, fontSize: 12 }}>
                  <div style={{ fontWeight: 700, color: impResult.success ? G : "#c62828", marginBottom: 4 }}>
                    {impResult.success ? "✅" : "⚠️"} {impResult.message}
                  </div>
                  {impResult.errors && impResult.errors.length > 0 && (
                    <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 11, color: "#666" }}>
                      {impResult.errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  )}
                  <button onClick={() => setImpResult(null)} style={{ marginTop: 6, background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 11, textDecoration: "underline" }}>✕ Închide</button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
