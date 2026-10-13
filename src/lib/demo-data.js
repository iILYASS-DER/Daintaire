/**
 * Données de démonstration utilisées uniquement lorsque Firestore ne
 * contient pas encore de contenu publié (ou en cas d'indisponibilité).
 *
 * ⚠️ Elles sont explicitement marquées isDemo: true : l'interface affiche un
 * badge « Démo » et l'administrateur doit les remplacer depuis le tableau de
 * bord. Aucun nom, diplôme ou photo réel n'est inventé.
 */

export const DEMO_SERVICES = [
  {
    id: "demo-consultation",
    isDemo: true,
    active: true,
    order: 1,
    nameFr: "Consultation et bilan",
    nameAr: "استشارة وفحص",
    descFr: "Premier examen, discussion du besoin et explication des options de soin.",
    descAr: "الفحص الأول، مناقشة الحاجة وشرح خيارات العلاج.",
    durationMinutes: 30,
    price: null,
    image: "/images/service-consultation.jpg",
  },
  {
    id: "demo-cleaning",
    isDemo: true,
    active: true,
    order: 2,
    nameFr: "Détartrage et prophylaxie",
    nameAr: "إزالة الجير والوقاية",
    descFr: "Nettoyage professionnel des dents et conseils d'hygiène au quotidien.",
    descAr: "تنظيف احترافي للأسنان ونصائح للعناية اليومية.",
    durationMinutes: 45,
    price: null,
    image: "/images/service-cleaning.jpg",
  },
  {
    id: "demo-filling",
    isDemo: true,
    active: true,
    order: 3,
    nameFr: "Soins conservateurs (composites)",
    nameAr: "علاجات ترميمية (حشوات)",
    descFr: "Traitement des caries avec des restaurations esthétiques.",
    descAr: "علاج التسوس بحشوات تجميلية.",
    durationMinutes: 45,
    price: null,
    image: "/images/service-treatment.jpg",
  },
  {
    id: "demo-orthodontics",
    isDemo: true,
    active: true,
    order: 4,
    nameFr: "Orthodontie",
    nameAr: "تقويم الأسنان",
    descFr: "Correction de l'alignement dentaire, suivi planifié séance par séance.",
    descAr: "تصحيح ارتفاع الأسنان، مع متابعة مخططة جلسة تلو الأخرى.",
    durationMinutes: 60,
    price: null,
    image: "/images/service-orthodontics.jpg",
  },
  {
    id: "demo-crown",
    isDemo: true,
    active: true,
    order: 5,
    nameFr: "Couronnes et prothèses",
    nameAr: "تيجان وأطقم سنية",
    descFr: "Restauration des dents abîmées par des prothèses fabriquées sur mesure.",
    descAr: "ترميم الأسنان التالفة بأطقم مصنعة حسب القياس.",
    durationMinutes: 60,
    price: null,
    image: "/images/service-crown.jpg",
  },
  {
    id: "demo-rootcanal",
    isDemo: true,
    active: true,
    order: 6,
    nameFr: "Endodontie (traitement canalaire)",
    nameAr: "علاج الجذور (العصب)",
    descFr: "Traitement de l'intérieur de la dent lorsque la pulpe est atteinte.",
    descAr: "علاج داخل السن عندما تتأثر العصب.",
    durationMinutes: 60,
    price: null,
    image: "/images/service-root-canal.jpg",
  },
  {
    id: "demo-implant",
    isDemo: true,
    active: true,
    order: 7,
    nameFr: "Implantologie",
    nameAr: "زراعة الأسنان",
    descFr: "Remplacement d'une dent absente, après bilan et plan de traitement.",
    descAr: "تعويض سن مفقود، بعد الفحص وخطة العلاج.",
    durationMinutes: 90,
    price: null,
    image: "/images/service-implant.jpg",
  },
  {
    id: "demo-emergency",
    isDemo: true,
    active: true,
    order: 8,
    nameFr: "Urgence dentaire",
    nameAr: "طوارئ الأسنان",
    descFr: "Prise en charge d'une douleur ou d'un imprévu, selon les disponibilités du jour.",
    descAr: "التعامل مع الألم أو الحالة الطارئة حسب المواعيد المتاحة.",
    durationMinutes: 30,
    price: null,
    image: "/images/service-emergency.jpg",
  },
];

/** Jour JS : 0 = dimanche … 6 = samedi. Cabinet ouvert du samedi au jeudi. */
const DEFAULT_DAYS = [0, 1, 2, 3, 4, 6]; // dimanche → jeudi (hors vendredi)

export const DEMO_DOCTORS = [
  {
    id: "demo-doctor-1",
    isDemo: true,
    active: true,
    displayName: "Dr Ilyass (démo)",
    bioFr:
      "Profil de démonstration : à remplacer par la présentation réelle validée par le cabinet.",
    bioAr:
      "ملف تجريبي: يجب استبداله بالنبذة الحقيقية المعتمدة من العيادة.",
    photoUrl: "",
    serviceIds: [
      "demo-consultation",
      "demo-cleaning",
      "demo-filling",
      "demo-rootcanal",
      "demo-emergency",
    ],
    workingDays: DEFAULT_DAYS,
    workingHours: { start: "09:00", end: "17:00" },
    breaks: [{ start: "13:00", end: "14:00" }],
    unavailableDates: [],
    timeZone: "Africa/Casablanca",
  },
  {
    id: "demo-doctor-2",
    isDemo: true,
    active: true,
    displayName: "Dr (démo) — orthodontie",
    bioFr:
      "Profil de démonstration : présentation, horaires et photo à renseigner par l'administration.",
    bioAr:
      "ملف تجريبي: يجب على الإدارة إدخال النبذة والمواعيد والصورة.",
    photoUrl: "",
    serviceIds: ["demo-consultation", "demo-orthodontics", "demo-crown", "demo-implant"],
    workingDays: DEFAULT_DAYS,
    workingHours: { start: "10:00", end: "18:00" },
    breaks: [{ start: "13:00", end: "14:00" }],
    unavailableDates: [],
    timeZone: "Africa/Casablanca",
  },
];

export const DEMO_SETTINGS = {
  id: "main",
  isDemo: true,
  clinicName: "Cabinet Dentaire Ilyass",
  phone: "+212659349160",
  email: "ilyassdr60@gmail.com",
  address: "Tiflet, Hay Andalos, Morocco",
  addressAr: "تيفلت، حي الأندلس، المغرب",
  mapQuery: "Hay Andalos, Tiflet, Morocco",
  timeZone: "Africa/Casablanca",
  defaultLanguage: "fr",
  locale: "fr-MA",
  openingHours: {
    0: { open: "09:00", close: "17:00" }, // dimanche
    1: { open: "09:00", close: "17:00" },
    2: { open: "09:00", close: "17:00" },
    3: { open: "09:00", close: "17:00" },
    4: { open: "09:00", close: "17:00" },
    5: null, // vendredi fermé (exemple de démonstration)
    6: { open: "09:00", close: "13:00" },
  },
  booking: {
    pendingHoldHours: 48,
    maxAdvanceDays: 90,
    slotStepMinutes: 30,
    minNoticeMinutes: 60,
  },
};

export const FALLBACK_DEMO_ERROR = "demo-fallback";
