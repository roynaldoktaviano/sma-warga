// Import siswa SMP Warga — npx tsx prisma/seed-siswa.ts
// Buat TahunAjaran 2025/2026 Ganjil + kelas 8A/8B/9A/9B + import 126 siswa
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL } },
});

type Row = { nis: string; nisn: string; nama: string; lp: string; agama: string; kelas: string; asalSD: string; dl: string };

const SISWA: Row[] = [
  // ── 8 A (31 siswa) ──────────────────────────────────────────
  { nis:"10507",nisn:"0121836315",nama:"Abed Schot Tandilangi",            lp:"L",agama:"Kristen",kelas:"8 A",asalSD:"SD N 01 BANDARDAWUNG",                          dl:"L"},
  { nis:"10508",nisn:"3139923934",nama:"Aldan Abhyaksa Firmansyah",         lp:"L",agama:"Islam",  kelas:"8 A",asalSD:"SD NEGERI KUDU 01 BAKI",                         dl:"L"},
  { nis:"10509",nisn:"3122897395",nama:"Andini Vaniarti Putri",             lp:"P",agama:"Islam",  kelas:"8 A",asalSD:"SD MIN 2 BOYOLALI",                              dl:"L"},
  { nis:"10510",nisn:"0134654343",nama:"Arjuna Aryana Al Arsyad",           lp:"L",agama:"Islam",  kelas:"8 A",asalSD:"SD AL FIRDAUS",                                  dl:"L"},
  { nis:"10512",nisn:"3123720087",nama:"Axel Marvello Jose",                lp:"L",agama:"Islam",  kelas:"8 A",asalSD:"SD MI AL ISLAM Grobagan",                        dl:"L"},
  { nis:"10513",nisn:"3126983824",nama:"Azzahra Kirana Pradhipta",          lp:"P",agama:"Islam",  kelas:"8 A",asalSD:"SD Baiturahman Tangerang",                       dl:"L"},
  { nis:"10514",nisn:"0133646155",nama:"Bima Kenzo Tegar Alkautsar",        lp:"L",agama:"Islam",  kelas:"8 A",asalSD:"SD Negeri Cemara Dua",                           dl:"D"},
  { nis:"10515",nisn:"3125757808",nama:"Brigitta Alicia Putri",             lp:"P",agama:"Katolik",kelas:"8 A",asalSD:"SD WARGA SURAKARTA",                             dl:"D"},
  { nis:"10516",nisn:"0126019813",nama:"Caesar Elang Beltsazar",            lp:"L",agama:"Kristen",kelas:"8 A",asalSD:"SD Maria Purworejo",                             dl:"L"},
  { nis:"10517",nisn:"0134754521",nama:"Chelsea Aqyla Swis Setyawan",       lp:"P",agama:"Kristen",kelas:"8 A",asalSD:"SD WARGA SURAKARTA",                             dl:"D"},
  { nis:"10518",nisn:"0129788424",nama:"Chintya Putri Primandari",          lp:"P",agama:"Islam",  kelas:"8 A",asalSD:"SD N MOJOSONGO 5 SURAKARTA",                     dl:"D"},
  { nis:"10519",nisn:"0128881518",nama:"Danar Wibisono",                    lp:"L",agama:"Islam",  kelas:"8 A",asalSD:"SD Jirapan 3 Masaran Sragen",                    dl:"L"},
  { nis:"10520",nisn:"0136889735",nama:"Darell Azka Athallah Prasetya",     lp:"L",agama:"Islam",  kelas:"8 A",asalSD:"SD Mitra Harapan Madiun",                        dl:"L"},
  { nis:"10521",nisn:"0123725342",nama:"Elvinno Noel Santoso",              lp:"L",agama:"Islam",  kelas:"8 A",asalSD:"SD WARGA SURAKARTA",                             dl:"D"},
  { nis:"10522",nisn:"0133946358",nama:"Gilbert Giovani Santoso",           lp:"L",agama:"Kristen",kelas:"8 A",asalSD:"SD WARGA SURAKARTA",                             dl:"D"},
  { nis:"10523",nisn:"0123182486",nama:"Jonathan Christian",                lp:"L",agama:"Kristen",kelas:"8 A",asalSD:"SD NEGERI 1 DELANGGU",                           dl:"L"},
  { nis:"10524",nisn:"0128833268",nama:"Justyn Ivander Christian Effendi",  lp:"L",agama:"Kristen",kelas:"8 A",asalSD:"SD N 06 NGRINGO",                                dl:"D"},
  { nis:"10525",nisn:"3122094445",nama:"Krisna Bayu Sanjaya",               lp:"L",agama:"Islam",  kelas:"8 A",asalSD:"SD N Triyagan 02 Mojolaban",                     dl:"L"},
  { nis:"10526",nisn:"0124264778",nama:"Lionel Yonaga",                     lp:"L",agama:"Kristen",kelas:"8 A",asalSD:"Sdk Santo Yosef Ngawi",                          dl:"L"},
  { nis:"10527",nisn:"3131886541",nama:"Luvena Theodora",                   lp:"P",agama:"Katolik",kelas:"8 A",asalSD:"SD KANISIUS KEPRABON 02",                        dl:"D"},
  { nis:"10528",nisn:"0132512649",nama:"Micelline Gabriell Santoso",        lp:"P",agama:"Kristen",kelas:"8 A",asalSD:"SD MASEHI KUDUS",                                dl:"L"},
  { nis:"10529",nisn:"3133441471",nama:"Muhammad Alzam Salman",             lp:"L",agama:"Islam",  kelas:"8 A",asalSD:"SD WARGA SURAKARTA",                             dl:"L"},
  { nis:"10530",nisn:"0132687287",nama:"Nadine Nathania Calista",           lp:"P",agama:"Kristen",kelas:"8 A",asalSD:"SD NEGERI PALUR 03",                             dl:"D"},
  { nis:"10531",nisn:"0137681458",nama:"Naufal Raditya Alvaro",             lp:"L",agama:"Islam",  kelas:"8 A",asalSD:"SDN 03 JATI KARANGANYAR",                        dl:"L"},
  { nis:"10532",nisn:"3127087908",nama:"Rahmandito Lelaki Jiwa Merdeka",    lp:"L",agama:"Islam",  kelas:"8 A",asalSD:"SD NEGERI NGOMBAKAN 01",                         dl:"L"},
  { nis:"10533",nisn:"0125743097",nama:"Sevilio Veraldi Santosa",           lp:"L",agama:"Kristen",kelas:"8 A",asalSD:"SD Kristen Widya Wacana Warungmiri",             dl:"D"},
  { nis:"10534",nisn:"0132571208",nama:"Stefanus Kharis Sembiring",         lp:"L",agama:"Kristen",kelas:"8 A",asalSD:"SD WIDYA WACANA 6",                              dl:"L"},
  { nis:"10535",nisn:"0129964642",nama:"Tafida Haura Brahmana",             lp:"P",agama:"Islam",  kelas:"8 A",asalSD:"SD N 03 KARANGANYAR",                            dl:"L"},
  { nis:"10536",nisn:"0139009007",nama:"Velove Faradeana Putri Agretya",    lp:"P",agama:"Islam",  kelas:"8 A",asalSD:"SD MUHAMMADIYAH 4 KANDANGSAPI",                  dl:"L"},
  { nis:"10537",nisn:"3123032440",nama:"Yacinda Averina Sasmita",           lp:"P",agama:"Islam",  kelas:"8 A",asalSD:"SD WARGA SURAKARTA",                             dl:"D"},
  { nis:"10538",nisn:"0132944407",nama:"Yohanna Floren Abigail Nadya Mulya",lp:"P",agama:"Katolik",kelas:"8 A",asalSD:"SD KANISIUS KEPRABON I",                         dl:"D"},
  // ── 8 B (32 siswa) ──────────────────────────────────────────
  { nis:"10539",nisn:"0132079507",nama:"Abednego Eliseo Waradana",          lp:"L",agama:"Kristen",kelas:"8 B",asalSD:"SD WARGA SURAKARTA",                             dl:"D"},
  { nis:"10540",nisn:"0125094786",nama:"Adelya Ashyka Christangel Setyawan",lp:"P",agama:"Islam",  kelas:"8 B",asalSD:"SD NEGERI JOGLO 76",                             dl:"D"},
  { nis:"10541",nisn:"0131677968",nama:"Alvino Chandra Pradypta",           lp:"L",agama:"Islam",  kelas:"8 B",asalSD:"SD TA MIRUL ISLAM",                              dl:"D"},
  { nis:"10542",nisn:"0122764939",nama:"Aurellio Marvel Setiawan",          lp:"L",agama:"Kristen",kelas:"8 B",asalSD:"SD WIDYA WACANA 6",                              dl:"D"},
  { nis:"10543",nisn:"0136849838",nama:"Az-zahra Febriana Damayanti",       lp:"P",agama:"Islam",  kelas:"8 B",asalSD:"SD WARGA SURAKARTA",                             dl:"D"},
  { nis:"10544",nisn:"3136461528",nama:"Beatricia Chandria Evelyn",         lp:"P",agama:"Kristen",kelas:"8 B",asalSD:"SD WARGA SURAKARTA",                             dl:"D"},
  { nis:"10545",nisn:"0124974077",nama:"Caesar Arkenzie Raffasya Frediyanto",lp:"L",agama:"Islam", kelas:"8 B",asalSD:"SD N 06 NGRINGO",                                dl:"L"},
  { nis:"10546",nisn:"0122974803",nama:"Calista Gishella Santoso",          lp:"P",agama:"Kristen",kelas:"8 B",asalSD:"SD WARGA SURAKARTA",                             dl:"L"},
  { nis:"10547",nisn:"0127307659",nama:"Christabel Amarissa Reimona",       lp:"P",agama:"Kristen",kelas:"8 B",asalSD:"SD Elim Sragen",                                 dl:"L"},
  { nis:"10548",nisn:"0127488378",nama:"Christian Matthew Calvin Saputra",  lp:"L",agama:"Katolik",kelas:"8 B",asalSD:"SD NEGERI KLECO 1 SURAKARTA",                   dl:"L"},
  { nis:"10549",nisn:"0131754475",nama:"Damian Sean Alvino",                lp:"L",agama:"Kristen",kelas:"8 B",asalSD:"SD MARSUDIRINI",                                 dl:"D"},
  { nis:"10550",nisn:"3123716136",nama:"Edgin Moses Lumban Siantar",        lp:"L",agama:"Kristen",kelas:"8 B",asalSD:"SD KRISTEN WIDYA WACANA 1",                     dl:"L"},
  { nis:"10551",nisn:"3128144647",nama:"Eduardus Akuadaner Muara Bagdja",   lp:"L",agama:"Katolik",kelas:"8 B",asalSD:"SD MARSUDIRINI",                                 dl:"L"},
  { nis:"10552",nisn:"0136114421",nama:"Feby Valencia Beatrix Lanonda",     lp:"P",agama:"Kristen",kelas:"8 B",asalSD:"SD FOCUS INDEPENDENT SCHOOL SOLO",              dl:"L"},
  { nis:"10553",nisn:"0124141421",nama:"Gavin Christian Prayoga",           lp:"L",agama:"Kristen",kelas:"8 B",asalSD:"SD Kristen Banjarsari",                          dl:"D"},
  { nis:"10554",nisn:"3124802169",nama:"Gracia Masayu Paramitha",           lp:"P",agama:"Kristen",kelas:"8 B",asalSD:"SD KRISTEN SETABELAN 1",                        dl:"D"},
  { nis:"10555",nisn:"0122128706",nama:"Ivanno Ganindra Gunawan",           lp:"L",agama:"Katolik",kelas:"8 B",asalSD:"SD WARGA SURAKARTA",                             dl:"D"},
  { nis:"10556",nisn:"3129103188",nama:"Jastin Matanari",                   lp:"L",agama:"Kristen",kelas:"8 B",asalSD:"SD CHARIS",                                      dl:"D"},
  { nis:"10557",nisn:"0121679419",nama:"Lionel Ardhi Wibawa",               lp:"L",agama:"Kristen",kelas:"8 B",asalSD:"SD WIDYA WACANA 6",                              dl:"D"},
  { nis:"10558",nisn:"3129234385",nama:"Mario Argo Putra",                  lp:"L",agama:"Islam",  kelas:"8 B",asalSD:"SD N MOJOSONGO 5 SURAKARTA",                     dl:"L"},
  { nis:"10559",nisn:"0138954582",nama:"Mikhaela Gracellyne Nugroho",       lp:"P",agama:"Kristen",kelas:"8 B",asalSD:"SDN 3 JATEN KARANGANYAR",                        dl:"L"},
  { nis:"10560",nisn:"3121058026",nama:"Nazwa Michella Septia",             lp:"P",agama:"Islam",  kelas:"8 B",asalSD:"SDN 3 JATEN KARANGANYAR",                        dl:"L"},
  { nis:"10561",nisn:"0126133637",nama:"Radika Kenzie Kurniawan",           lp:"L",agama:"Katolik",kelas:"8 B",asalSD:"SDN 03 JATI KARANGANYAR",                        dl:"L"},
  { nis:"10562",nisn:"3128524680",nama:"Richard Noverio Dias Putra",        lp:"L",agama:"Kristen",kelas:"8 B",asalSD:"SD Widya Wacana Jamsaren Surakarta",             dl:"D"},
  { nis:"10563",nisn:"0122184204",nama:"Salma Umaya",                       lp:"P",agama:"Islam",  kelas:"8 B",asalSD:"SDN Gambirsari",                                 dl:"D"},
  { nis:"10564",nisn:"0132368946",nama:"Sola Fide Theofanny Andrew",        lp:"P",agama:"Kristen",kelas:"8 B",asalSD:"SD WARGA SURAKARTA",                             dl:"L"},
  { nis:"10565",nisn:"0138531352",nama:"Stefanus Davino Visesa",            lp:"L",agama:"Kristen",kelas:"8 B",asalSD:"SD WARGA SURAKARTA",                             dl:"D"},
  { nis:"10566",nisn:"0127410832",nama:"Stefany Djilian Larasati",          lp:"P",agama:"Kristen",kelas:"8 B",asalSD:"SD WARGA SURAKARTA",                             dl:"D"},
  { nis:"10567",nisn:"0121678506",nama:"Tobias Kennan Prasetyo",            lp:"L",agama:"Katolik",kelas:"8 B",asalSD:"SD WARGA SURAKARTA",                             dl:"D"},
  { nis:"10568",nisn:"0131894821",nama:"Via Dolorosa Armayasari",           lp:"P",agama:"Katolik",kelas:"8 B",asalSD:"SD KANISIUS KEPRABON I",                         dl:"D"},
  { nis:"10569",nisn:"0112210814",nama:"Wira Ditya Gavin Valerio",          lp:"L",agama:"Islam",  kelas:"8 B",asalSD:"SD WARGA SURAKARTA",                             dl:"D"},
  { nis:"10570",nisn:"0128543987",nama:"Yoda Putra Mahendra",               lp:"L",agama:"Islam",  kelas:"8 B",asalSD:"SDN TELUKAN 04 SUKOHARJO",                       dl:"L"},
  // ── 9 A (31 siswa) ──────────────────────────────────────────
  { nis:"10436",nisn:"0107694693",nama:"Maheswara Panji",                   lp:"L",agama:"Islam",  kelas:"9 A",asalSD:"PKBM Sinar Mentari",                             dl:"L"},
  { nis:"10440",nisn:"0125620801",nama:"Adella Jasmine Prasetyo",           lp:"P",agama:"Islam",  kelas:"9 A",asalSD:"SDN Mojosongo 5 Surakarta",                      dl:"D"},
  { nis:"10441",nisn:"0127464813",nama:"Adellia Naima Rachmaningtyas",      lp:"P",agama:"Kristen",kelas:"9 A",asalSD:"SD Pangudi Luhur st Timotius",                   dl:"D"},
  { nis:"10442",nisn:"0125849143",nama:"Afika Quella Prasetya",             lp:"P",agama:"Islam",  kelas:"9 A",asalSD:"SDN CEMARA DUA NO.13",                           dl:"D"},
  { nis:"10443",nisn:"0117223773",nama:"Angelica Putri Mariska",            lp:"P",agama:"Katolik",kelas:"9 A",asalSD:"SD NEGERI JOGLO 76",                             dl:"D"},
  { nis:"10444",nisn:"0127854591",nama:"Athalla Yaafe Ramadhan",            lp:"L",agama:"Islam",  kelas:"9 A",asalSD:"SD Insan Mulia Surakarta",                       dl:"D"},
  { nis:"10445",nisn:"0104668159",nama:"Axel Vegardian Sakalessia",         lp:"L",agama:"Kristen",kelas:"9 A",asalSD:"SD NEGERI JAGALAN 81",                           dl:"D"},
  { nis:"10446",nisn:"0122743624",nama:"Callista Anastasia",                lp:"P",agama:"Islam",  kelas:"9 A",asalSD:"SD WARGA",                                       dl:"D"},
  { nis:"10447",nisn:"0111184947",nama:"Calvino Sony Alano",                lp:"L",agama:"Islam",  kelas:"9 A",asalSD:"SDK Sang Timur Pasuruan",                        dl:"D"},
  { nis:"10448",nisn:"0128869792",nama:"Danendra Arsatya Saputro",          lp:"L",agama:"Katolik",kelas:"9 A",asalSD:"SD WARGA",                                       dl:"L"},
  { nis:"10449",nisn:"0112622808",nama:"Dhimas Farrel Rizky Athallah",      lp:"L",agama:"Islam",  kelas:"9 A",asalSD:"SDN CEMARA DUA NO.13 SKA",                       dl:"L"},
  { nis:"10450",nisn:"0129726392",nama:"Dista Gustina",                     lp:"P",agama:"Islam",  kelas:"9 A",asalSD:"SD Negeri 02 Ngringo",                           dl:"L"},
  { nis:"10451",nisn:"0122196256",nama:"Ervito Juan Setya Gunawan",         lp:"L",agama:"Islam",  kelas:"9 A",asalSD:"SD WARGA",                                       dl:"D"},
  { nis:"10452",nisn:"0127168748",nama:"Fidela Marya Ozora",                lp:"P",agama:"Kristen",kelas:"9 A",asalSD:"SD KRISTEN MANAHAN",                             dl:"D"},
  { nis:"10453",nisn:"0129995261",nama:"Flora Shalomita Margono",           lp:"P",agama:"Kristen",kelas:"9 A",asalSD:"SD KRISTEN MANAHAN",                             dl:"D"},
  { nis:"10454",nisn:"0123698203",nama:"Gabriella Rahya Naviendra",         lp:"P",agama:"Kristen",kelas:"9 A",asalSD:"SD ADVENT SURAKARTA",                            dl:"D"},
  { nis:"10455",nisn:"0118980479",nama:"Justin Faith Fabian Nugroho",       lp:"L",agama:"Kristen",kelas:"9 A",asalSD:"SD WIDYA WACANA 6",                              dl:"L"},
  { nis:"10456",nisn:"0114846507",nama:"Kenzovano Alvero Chiputra",         lp:"L",agama:"Kristen",kelas:"9 A",asalSD:"SD Warga Surakarta",                             dl:"L"},
  { nis:"10457",nisn:"3129811412",nama:"Kevin Fawwaz Khairullah Baraputra", lp:"L",agama:"Islam",  kelas:"9 A",asalSD:"SD Mutiara Ibu Purworejo",                       dl:"L"},
  { nis:"10458",nisn:"0119221465",nama:"Leonel Rafael Putra Pratama",       lp:"L",agama:"Kristen",kelas:"9 A",asalSD:"SD WARGA",                                       dl:"D"},
  { nis:"10459",nisn:"3120858275",nama:"Neisha Ardhiona",                   lp:"P",agama:"Islam",  kelas:"9 A",asalSD:"SD Warga",                                       dl:"D"},
  { nis:"10460",nisn:"0118185239",nama:"Rahardian Ghany Arrasyid",          lp:"L",agama:"Islam",  kelas:"9 A",asalSD:"SD Muhammadiyah 3 Surakarta",                    dl:"D"},
  { nis:"10461",nisn:"0112591209",nama:"Rea Valeri Anindhyta Crista",       lp:"P",agama:"Kristen",kelas:"9 A",asalSD:"SD MARSUDIRINI",                                 dl:"D"},
  { nis:"10462",nisn:"0128967647",nama:"Rezkya Cahaya Ramadani Samaloisa",  lp:"P",agama:"Islam",  kelas:"9 A",asalSD:"SDN DEMAKAN 3 MOJOLABAN",                        dl:"D"},
  { nis:"10463",nisn:"0117650339",nama:"Richie Kaka Pratama",               lp:"L",agama:"Islam",  kelas:"9 A",asalSD:"SD NEGERI DADAPSARI",                            dl:"D"},
  { nis:"10464",nisn:"0128179038",nama:"Sagata Satya",                      lp:"L",agama:"Kristen",kelas:"9 A",asalSD:"SD MARSUDIRINI",                                 dl:"D"},
  { nis:"10465",nisn:"0111329047",nama:"Samuel Jason Wibowo",               lp:"L",agama:"Kristen",kelas:"9 A",asalSD:"SD WIDYA WACANA 6 SKA",                          dl:"D"},
  { nis:"10466",nisn:"0118195378",nama:"Vittorio Isiozoii Adekumara",       lp:"L",agama:"Kristen",kelas:"9 A",asalSD:"SD WIDYA WACANA 6",                              dl:"D"},
  { nis:"10467",nisn:"0127597423",nama:"Yehezkiel Billy Kristanto",         lp:"L",agama:"Kristen",kelas:"9 A",asalSD:"SDN 06 NGRINGO JATEN KRA",                       dl:"L"},
  { nis:"10571",nisn:"0116539777",nama:"Christian Putra Andrian",           lp:"L",agama:"Kristen",kelas:"9 A",asalSD:"",                                               dl:"L"},
  { nis:"10572",nisn:"0111530665",nama:"Wilbert Aquila Wibisonoputra",      lp:"L",agama:"Kristen",kelas:"9 A",asalSD:"",                                               dl:"D"},
  // ── 9 B (32 siswa) ──────────────────────────────────────────
  { nis:"10468",nisn:"0119710272",nama:"Aditya Rifky Maulana Tri Putra",    lp:"L",agama:"Islam",  kelas:"9 B",asalSD:"SD Islam NDM Kauman Solo",                       dl:"L"},
  { nis:"10469",nisn:"0112941582",nama:"Alendra Dirga Aksaloko",            lp:"L",agama:"Islam",  kelas:"9 B",asalSD:"SDN 01 DAGEN JATEN KRA",                         dl:"L"},
  { nis:"10470",nisn:"3121064276",nama:"Almira Aga Karunia",                lp:"P",agama:"Islam",  kelas:"9 B",asalSD:"SD AL ISLAM 3 Gebang",                           dl:"D"},
  { nis:"10471",nisn:"0115991374",nama:"Alona Tifara Warasty",              lp:"P",agama:"Islam",  kelas:"9 B",asalSD:"SD NEGERI NUSUKAN 44",                           dl:"D"},
  { nis:"10472",nisn:"0119240451",nama:"Alonzia Sabine Kireine",            lp:"P",agama:"Kristen",kelas:"9 B",asalSD:"SD Kristen Banjarsari",                          dl:"D"},
  { nis:"10473",nisn:"0121488791",nama:"Alvaro Gavriel Febriaryano",        lp:"L",agama:"Islam",  kelas:"9 B",asalSD:"SD WARGA",                                       dl:"D"},
  { nis:"10474",nisn:"0126896573",nama:"Cynthia Nikita Budianto",           lp:"P",agama:"Islam",  kelas:"9 B",asalSD:"SD WARGA",                                       dl:"L"},
  { nis:"10475",nisn:"0125905003",nama:"Davendra Leonard Bhagawanta",       lp:"L",agama:"Kristen",kelas:"9 B",asalSD:"SD MARSUDIRINI SURAKARTA",                       dl:"D"},
  { nis:"10476",nisn:"3124811710",nama:"Fellysah Br. Gultom",               lp:"P",agama:"Kristen",kelas:"9 B",asalSD:"SDN 01 Wonorejo Gondangrejo",                    dl:"L"},
  { nis:"10477",nisn:"0113007529",nama:"Gendis Jenar Yoga",                 lp:"P",agama:"Islam",  kelas:"9 B",asalSD:"SD Mutiara Ibu Purworejo",                       dl:"L"},
  { nis:"10478",nisn:"0122633447",nama:"Ghizella Putri Ramadhani",          lp:"P",agama:"Kristen",kelas:"9 B",asalSD:"SD KRISTEN MANAHAN SKA",                         dl:"L"},
  { nis:"10479",nisn:"0129027947",nama:"Illona Jacinda Hedva Kalani",       lp:"P",agama:"Islam",  kelas:"9 B",asalSD:"SD WARGA",                                       dl:"D"},
  { nis:"10480",nisn:"0124042328",nama:"Jannice Olivia Naomi",              lp:"P",agama:"Kristen",kelas:"9 B",asalSD:"SD WARGA",                                       dl:"D"},
  { nis:"10481",nisn:"0117364801",nama:"Jara Encore",                       lp:"P",agama:"Kristen",kelas:"9 B",asalSD:"SD KATOLIK SANTO YOSEF Kota Kediri",             dl:"L"},
  { nis:"10482",nisn:"0113085201",nama:"Jevon Iddo Oktavianus",             lp:"L",agama:"Kristen",kelas:"9 B",asalSD:"SDN Jatisari 1 Jatisrono Wonogiri",              dl:"L"},
  { nis:"10483",nisn:"0112990297",nama:"Jonathan Krisherdiano Putra Yudhianto",lp:"L",agama:"Kristen",kelas:"9 B",asalSD:"SD Kristen Widya Wacana Jamsaren",            dl:"L"},
  { nis:"10484",nisn:"0119235527",nama:"Lastiar Ailsha Sitanggang",         lp:"P",agama:"Kristen",kelas:"9 B",asalSD:"SDN Sambirejo",                                  dl:"L"},
  { nis:"10485",nisn:"0128480405",nama:"Lionel Dyandra Prasetya",           lp:"L",agama:"Islam",  kelas:"9 B",asalSD:"SD WARGA",                                       dl:"D"},
  { nis:"10486",nisn:"0127798269",nama:"Nicolas Putra Wijaya",              lp:"L",agama:"Kristen",kelas:"9 B",asalSD:"SD Warga",                                       dl:"L"},
  { nis:"10487",nisn:"0123717461",nama:"Nurul Nazwaziilah Izzati",          lp:"P",agama:"Islam",  kelas:"9 B",asalSD:"SD N 01 Nangsri Kebakkramat",                    dl:"L"},
  { nis:"10488",nisn:"0117003247",nama:"Pasha Valentino Bagus Saputro",     lp:"L",agama:"Islam",  kelas:"9 B",asalSD:"SDN SAWAHAN 3",                                  dl:"L"},
  { nis:"10489",nisn:"0121993633",nama:"Pattaya Kemuning Ayu Muninggar",    lp:"P",agama:"Islam",  kelas:"9 B",asalSD:"SD WARGA",                                       dl:"D"},
  { nis:"10490",nisn:"0123058184",nama:"Richo Ferdinan Charisma Putra",     lp:"L",agama:"Kristen",kelas:"9 B",asalSD:"SD WARGA",                                       dl:"D"},
  { nis:"10491",nisn:"0113155770",nama:"Rosawani Dinda Novemia",            lp:"P",agama:"Islam",  kelas:"9 B",asalSD:"SD WARGA",                                       dl:"D"},
  { nis:"10492",nisn:"0126683683",nama:"Sharon Prasasti Nugroho",           lp:"P",agama:"Kristen",kelas:"9 B",asalSD:"SD KRISTEN SETABELAN 1 SKA",                     dl:"D"},
  { nis:"10493",nisn:"0125069756",nama:"Stanislaus Jalu Putra Pambudi",     lp:"L",agama:"Katolik",kelas:"9 B",asalSD:"SD Kanisius Keprabon 01 Surakarta",              dl:"L"},
  { nis:"10494",nisn:"0119968938",nama:"Steavano Ongky Setyawan",           lp:"L",agama:"Islam",  kelas:"9 B",asalSD:"SD WARGA",                                       dl:"D"},
  { nis:"10495",nisn:"0125480436",nama:"Tristan Anindito Alfarezel",        lp:"L",agama:"Islam",  kelas:"9 B",asalSD:"SD NEGERI CEMARA DUA",                           dl:"D"},
  { nis:"10496",nisn:"0111657146",nama:"Yusuf Rizki Fadhilah",              lp:"L",agama:"Islam",  kelas:"9 B",asalSD:"SD IT AL MUJAHIDIN",                             dl:"L"},
  { nis:"10497",nisn:"0123302381",nama:"Zefara Isandari Putri Gautama",     lp:"P",agama:"Islam",  kelas:"9 B",asalSD:"SD Bright Star Primary School Makassar",         dl:"L"},
  { nis:"10504",nisn:"0123164959",nama:"Prisa Nazanin Yusra",               lp:"P",agama:"Islam",  kelas:"9 B",asalSD:"",                                               dl:"L"},
  { nis:"10505",nisn:"0119757239",nama:"Timotius Martanto",                 lp:"L",agama:"Islam",  kelas:"9 B",asalSD:"",                                               dl:"D"},
];

async function main() {
  const sekolah = await prisma.sekolah.findFirst();
  if (!sekolah) { console.error("Sekolah tidak ditemukan."); process.exit(1); }

  // Cari atau buat TahunAjaran
  let ta = await prisma.tahunAjaran.findFirst({ orderBy: [{ isActive: "desc" }, { createdAt: "desc" }] });
  if (!ta) {
    ta = await prisma.tahunAjaran.create({
      data: { nama: "2025/2026", semester: "GANJIL", status: "BERJALAN", sekolahId: sekolah.id },
    });
    console.log("Buat TahunAjaran: 2025/2026 Ganjil");
  } else {
    console.log(`Gunakan TahunAjaran: ${ta.nama} ${ta.semester}`);
  }

  // Buat kelas yang dibutuhkan
  const kelasNamas = ["8 A", "8 B", "9 A", "9 B"];
  const kelasMap: Record<string, string> = {};
  for (const nama of kelasNamas) {
    let k = await prisma.kelas.findUnique({
      where: { tahunAjaranId_nama: { tahunAjaranId: ta.id, nama } },
    });
    if (!k) {
      k = await prisma.kelas.create({ data: { nama, tahunAjaranId: ta.id, sekolahId: sekolah.id } });
      console.log(`  + Kelas ${nama}`);
    }
    kelasMap[nama] = k.id;
  }

  // Import siswa
  let added = 0, skipped = 0;
  console.log("\nMengimport siswa…");

  for (const s of SISWA) {
    const exists = await prisma.siswa.findFirst({ where: { OR: [{ nis: s.nis }, { nisn: s.nisn }] } });
    if (exists) { skipped++; continue; }

    const hash = await bcrypt.hash(s.nis, 10);
    const siswa = await prisma.siswa.create({
      data: {
        nis:          s.nis,
        nisn:         s.nisn,
        nama:         s.nama.trim(),
        kelas:        s.kelas,
        jenisKelamin: s.lp,
        agama:        s.agama,
        asalSD:       s.asalSD || null,
        statusDL:     s.dl,
        username:     s.nisn,
        password:     hash,
        poinAwal:     100,
        sekolahId:    sekolah.id,
      },
    });

    // Assign ke kelas
    const kelasId = kelasMap[s.kelas];
    if (kelasId) {
      await prisma.kelasAnggota.create({ data: { kelasId, siswaId: siswa.id } });
    }

    added++;
    if (added % 10 === 0) process.stdout.write(`  ${added} selesai…\n`);
  }

  const byKelas = Object.fromEntries(
    kelasNamas.map(k => [k, SISWA.filter(s => s.kelas === k).length])
  );

  console.log(`\n✓ Selesai: ${added} siswa ditambahkan, ${skipped} dilewati.`);
  console.log("  Distribusi:", Object.entries(byKelas).map(([k, n]) => `Kelas ${k}: ${n}`).join("  "));
  console.log("\nLogin siswa: username = NISN, password = NIS");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
