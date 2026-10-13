/**
 * Dictionnaire bilingue FR / AR.
 * Chaque clé contient les deux langues côte à côte afin qu'aucune clé
 * ne puisse « dériver » d'une langue à l'autre.
 *
 * Interpolation : t('key', { name: 'Yassine' }) remplace {name}.
 *
 * Les messages d'erreur, de validation, les toasts et les états vides
 * vivent dans UN seul fichier : src/lib/messages.js (texte anglais
 * canonique + traductions fr/ar absorbées ci-dessous via UI_MESSAGES).
 */

import { UI_MESSAGES } from "@/lib/messages";

export const messages = {
  /* ---------------------------------------------------------- marque */
  "brand.name": { fr: "Cabinet Dentaire Ilyass", ar: "عيادة إيل ياس لطب الأسنان" },
  "brand.short": { fr: "Cabinet Ilyass", ar: "عيادة إيل ياس" },
  "brand.tagline": { fr: "Soins dentaires à Tiflet", ar: "علاجات الأسنان بتيفلت" },
  "brand.city": { fr: "Tiflet, Hay Andalos — Maroc", ar: "تيفلت، حي الأندلس — المغرب" },

  /* ---------------------------------------------------------- navigation */
  "nav.home": { fr: "Accueil", ar: "الرئيسية" },
  "nav.about": { fr: "Le cabinet", ar: "العيادة" },
  "nav.services": { fr: "Soins", ar: "العلاجات" },
  "nav.contact": { fr: "Contact", ar: "اتصل بنا" },
  "nav.appointment": { fr: "Prendre rendez-vous", ar: "حجز موعد" },
  "nav.privacy": { fr: "Confidentialité", ar: "سياسة الخصوصية" },
  "nav.track": { fr: "Suivre ma demande", ar: "تتبع الطلب" },
  "nav.admin": { fr: "Espace staff", ar: "فضاء الأطباء" },
  "nav.menu": { fr: "Menu", ar: "القائمة" },
  "nav.closeMenu": { fr: "Fermer le menu", ar: "إغلاق القائمة" },
  "nav.skipToContent": { fr: "Aller au contenu principal", ar: "الانتقال إلى المحتوى الرئيسي" },
  "nav.mainNav": { fr: "Principal", ar: "التنقل الرئيسي" },
  "nav.mobileNav": { fr: "Navigation mobile", ar: "التنقل عبر الهاتف" },

  /* ---------------------------------------------------------- langue */
  "lang.label": { fr: "Langue", ar: "اللغة" },
  "lang.fr": { fr: "Français", ar: "الفرنسية" },
  "lang.ar": { fr: "Arabe", ar: "العربية" },
  "lang.switch": { fr: "Changer de langue", ar: "تغيير اللغة" },

  /* ---------------------------------------------------------- commun */
  "common.loading": { fr: "Chargement…", ar: "جارٍ التحميل…" },
  "common.save": { fr: "Enregistrer", ar: "حفظ" },
  "common.cancel": { fr: "Annuler", ar: "إلغاء" },
  "common.close": { fr: "Fermer", ar: "إغلاق" },
  "common.back": { fr: "Retour", ar: "رجوع" },
  "common.next": { fr: "Suivant", ar: "التالي" },
  "common.previous": { fr: "Précédent", ar: "السابق" },
  "common.submit": { fr: "Envoyer", ar: "إرسال" },
  "common.confirm": { fr: "Confirmer", ar: "تأكيد" },
  "common.delete": { fr: "Supprimer", ar: "حذف" },
  "common.edit": { fr: "Modifier", ar: "تعديل" },
  "common.add": { fr: "Ajouter", ar: "إضافة" },
  "common.create": { fr: "Créer", ar: "إنشاء" },
  "common.search": { fr: "Rechercher", ar: "بحث" },
  "common.filter": { fr: "Filtrer", ar: "تصفية" },
  "common.all": { fr: "Tous", ar: "الكل" },
  "common.none": { fr: "Aucun", ar: "لا شيء" },
  "common.required": { fr: "Obligatoire", ar: "مطلوب" },
  "common.optional": { fr: "Facultatif", ar: "اختياري" },
  "common.demo": { fr: "Démo", ar: "تجريبي" },
  "common.demoBadge": { fr: "Contenu de démonstration", ar: "محتوى تجريبي" },
  "common.retry": { fr: "Réessayer", ar: "إعادة المحاولة" },
  "common.success": { fr: "Opération effectuée.", ar: "تمت العملية." },
  "common.phone": { fr: "Téléphone", ar: "الهاتف" },
  "common.email": { fr: "E-mail", ar: "البريد الإلكتروني" },
  "common.address": { fr: "Adresse", ar: "العنوان" },
  "common.fullName": { fr: "Nom complet", ar: "الاسم الكامل" },
  "common.date": { fr: "Date", ar: "التاريخ" },
  "common.time": { fr: "Heure", ar: "الوقت" },
  "common.duration": { fr: "Durée", ar: "المدة" },
  "common.price": { fr: "Tarif", ar: "السعر" },
  "common.status": { fr: "Statut", ar: "الحالة" },
  "common.actions": { fr: "Actions", ar: "إجراءات" },
  "common.notes": { fr: "Notes", ar: "ملاحظات" },
  "common.internalNote": { fr: "Note interne", ar: "ملاحظة داخلية" },
  "common.doctor": { fr: "Praticien", ar: "الطبيب" },
  "common.patient": { fr: "Patient", ar: "المريض" },
  "common.service": { fr: "Soin", ar: "العلاج" },
  "common.active": { fr: "Actif", ar: "نشط" },
  "common.inactive": { fr: "Inactif", ar: "غير نشط" },
  "common.minutes": { fr: "min", ar: "د" },
  "common.viewMore": { fr: "Voir tout", ar: "عرض الكل" },
  "common.notConfigured": {
    fr: "Non encore configuré",
    ar: "لم يتم الإعداد بعد",
  },
  "common.minutesToRead": { fr: "min de lecture", ar: "دقائق للقراءة" },

  /* ---------------------------------------------------------- statuts */
  "status.pending": { fr: "En attente", ar: "في انتظار الموافقة" },
  "status.confirmed": { fr: "Confirmé", ar: "مؤكد" },
  "status.rejected": { fr: "Refusé", ar: "مرفوض" },
  "status.cancelled": { fr: "Annulé", ar: "ملغى" },
  "status.expired": { fr: "Expiré", ar: "منتهي الصلاحية" },
  "status.completed": { fr: "Terminé", ar: "منجز" },
  "status.missed": { fr: "Non honoré", ar: "لم يحضر" },
  "status.rescheduled": { fr: "Reporté", ar: "تم التأجيل" },
  "status.scheduled": { fr: "Planifié", ar: "محدد زمنيًا" },
  "status.planned": { fr: "Prévu", ar: "مخطط" },
  "status.any": { fr: "Tous les statuts", ar: "كل الحالات" },

  /* ---------------------------------------------------------- hero */
  "hero.badge": { fr: "Tiflet · Hay Andalos", ar: "تيفلت · حي الأندلس" },
  "hero.title1": { fr: "Votre sourire entre de", ar: "ابتسامتك بين" },
  "hero.titleHighlight": { fr: "bonnes mains", ar: "أيدٍ أمينة" },
  "hero.title2": { fr: "", ar: "" },
  "hero.description": {
    fr: "Le Cabinet Dentaire Ilyass vous accueille à Tiflet pour un accompagnement dentaire clair, attentionné et adapté à chaque patient. Prenez rendez-vous en quelques minutes, votre demande est traitée par l'équipe du cabinet.",
    ar: "استقبلك عيادة إيل ياس لطب الأسنان بتيفلت لرعاية سنية واضحة ومتابعة مناسبة لكل مريض. احجز موعدك في دقائق، وسيتولى فريق العيادة معالجة طلبك.",
  },
  "hero.ctaPrimary": { fr: "Prendre rendez-vous", ar: "حجز موعد" },
  "hero.ctaSecondary": { fr: "Découvrir nos soins", ar: "اكتشف علاجاتنا" },
  "hero.point1": { fr: "Demande de rendez-vous en ligne", ar: "طلب موعد عبر الإنترنت" },
  "hero.point2": { fr: "Confirmation par l'équipe du cabinet", ar: "تأكيد من طرف فريق العيادة" },
  "hero.point3": { fr: "Plusieurs praticiens, plusieurs disponibilités", ar: "عدة أطباء ومواعيد متاحة" },
  "hero.imageAlt": {
    fr: "Dentiste examinant une patiente dans un cabinet moderne",
    ar: "طبيبة أسنان تفحص مريضة داخل عيادة عصرية",
  },
  "hero.cardTitle": { fr: "Comment ça marche ?", ar: "كيف يتم الحجز؟" },
  "hero.cardText": {
    fr: "Vous envoyez une demande, le cabinet la confirme par téléphone.",
    ar: "ترسل طلبًا، ثم تؤكد العيادة الموعد عبر الهاتف.",
  },

  /* ---------------------------------------------------------- home */
  "home.services.eyebrow": { fr: "Nos soins", ar: "علاجاتنا" },
  "home.services.title": { fr: "Des soins adaptés à chaque sourire", ar: "علاجات تناسب كل ابتسامة" },
  "home.services.subtitle": {
    fr: "Consultation, prévention, soins conservateurs, orthodontie et prothèses : retrouvez ci-dessous les soins proposés par le cabinet.",
    ar: "استشارة، وقاية، ترميم، تقويم وأطقم سنية: اكتشف في الأسفل العلاجات التي تقترحها العيادة.",
  },
  "home.about.eyebrow": { fr: "Le cabinet", ar: "العيادة" },
  "home.about.title": { fr: "Un cabinet de proximité, pensé pour vos rendez-vous", ar: "عيادة قريبة منك ومصممة لمواعيدك" },
  "home.about.text1": {
    fr: "Le Cabinet Dentaire Ilyass accueille les patients à Tiflet, Hay Andalos. Notre priorité : expliquer clairement chaque étape, proposer des créneaux réalistes et garder un suivi simple entre les séances.",
    ar: "تستقبل عيادة إيل ياس المرضى في تيفلت، حي الأندلس. أولويتنا: شرح كل خطوة بوضوح، اقتراح مواعيد واقعية، والحفاظ على متابعة بسيطة بين الجلسات.",
  },
  "home.about.text2": {
    fr: "Les informations présentées sur ce site (praticiens, horaires, tarifs) sont mises à jour depuis l'espace d'administration du cabinet.",
    ar: "المعلومات المعروضة في هذا الموقع (الأطباء، المواعيد، الأسعار) يتم تحديثها من لوحة إدارة العيادة.",
  },
  "home.about.link": { fr: "En savoir plus sur le cabinet", ar: "المزيد عن العيادة" },
  "home.about.imageAlt": {
    fr: "Salle de soins dentaires lumineuse et moderne",
    ar: "غرفة علاج أسنان مضيئة وعصرية",
  },
  "home.steps.eyebrow": { fr: "Rendez-vous", ar: "المواعيد" },
  "home.steps.title": { fr: "Votre rendez-vous en 4 étapes", ar: "موعدك في 4 خطوات" },
  "home.steps.subtitle": {
    fr: "Une demande envoyée n'est pas encore un rendez-vous confirmé : le cabinet vous recontacte pour valider le créneau.",
    ar: "الطلب المرسل ليس موعدًا مؤكدًا بعد: تتواصل معك العيادة لتأكيد الموعد.",
  },
  "home.step1.title": { fr: "Choisissez un soin", ar: "اختر العلاج" },
  "home.step1.text": { fr: "Sélectionnez le soin qui correspond à votre besoin.", ar: "اختر العلاج الذي يناسب حاجتك." },
  "home.step2.title": { fr: "Choisissez un praticien", ar: "اختر الطبيب" },
  "home.step2.text": { fr: "Ou laissez-nous proposer le premier disponible.", ar: "أو اتركنا نقترح أول طبيب متاح." },
  "home.step3.title": { fr: "Date et heure", ar: "التاريخ والوقت" },
  "home.step3.text": { fr: "Consultez les créneaux réellement disponibles.", ar: "اطلع على المواعيد المتاحة فعليًا." },
  "home.step4.title": { fr: "Confirmation", ar: "التأكيد" },
  "home.step4.text": { fr: "L'équipe confirme votre demande par téléphone.", ar: "يؤكد فريق العيادة طلبك عبر الهاتف." },
  "home.benefits.eyebrow": { fr: "Pourquoi nous choisir", ar: "لماذا تختارنا" },
  "home.benefits.title": { fr: "Ce que le cabinet met à votre disposition", ar: "ما توفره العيادة لك" },
  "home.benefit1.title": { fr: "Prise de rendez-vous simple", ar: "حجز سهل" },
  "home.benefit1.text": { fr: "Une demande en quelques minutes, depuis mobile ou ordinateur.", ar: "طلب في دقائق من الهاتف أو الحاسوب." },
  "home.benefit2.title": { fr: "Validation humaine", ar: "تأكيد بشري" },
  "home.benefit2.text": { fr: "Chaque demande est relue par l'équipe avant confirmation.", ar: "يقوم الفريق بمراجعة كل طلب قبل التأكيد." },
  "home.benefit3.title": { fr: "Plusieurs praticiens", ar: "عدة أطباء" },
  "home.benefit3.text": { fr: "Des disponibilités distinctes selon les praticiens du cabinet.", ar: "مواعيد منفصلة حسب أطباء العيادة." },
  "home.benefit4.title": { fr: "Suivi des séances", ar: "متابعة الجلسات" },
  "home.benefit4.text": { fr: "Les plans de traitement sont suivis séance par séance.", ar: "تتم متابعة خطط العلاج جلسة تلو الأخرى." },
  "home.benefit5.title": { fr: "Informations claires", ar: "معلومات واضحة" },
  "home.benefit5.text": { fr: "Durées et tarifs affichés quand ils sont renseignés par le cabinet.", ar: "تظهر المدة والأسعار عند تحديدها من طرف العيادة." },
  "home.benefit6.title": { fr: "Données protégées", ar: "بيانات محمية" },
  "home.benefit6.text": { fr: "Vos coordonnées restent accessibles uniquement au cabinet.", ar: "تبقى بياناتك متاحة لفريق العيادة فقط." },
  "home.doctors.eyebrow": { fr: "L'équipe", ar: "الفريق" },
  "home.doctors.title": { fr: "Les praticiens du cabinet", ar: "أطباء العيادة" },
  "home.doctors.subtitle": {
    fr: "Chaque profil est publié et mis à jour par l'administration du cabinet.",
    ar: "يتم نشر كل ملف وإدارته من طرف إدارة العيادة.",
  },
  "home.doctors.services": { fr: "Soins proposés", ar: "العلاجات المقدمة" },
  "home.contact.eyebrow": { fr: "Contact", ar: "اتصل بنا" },
  "home.contact.title": { fr: "Une question avant de réserver ?", ar: "لديك سؤال قبل الحجز؟" },
  "home.contact.text": {
    fr: "Appelez le cabinet ou écrivez-nous : nous vous répondons aux heures d'ouverture.",
    ar: "اتصل بالعيادة أو راسلنا: نجيبك خلال أوقات العمل.",
  },
  "home.contact.call": { fr: "Appeler le cabinet", ar: "الاتصال بالعيادة" },
  "home.contact.write": { fr: "Écrire un e-mail", ar: "إرسال بريد إلكتروني" },
  "home.contact.hoursTitle": { fr: "Horaires d'ouverture", ar: "أوقات العمل" },
  "home.contact.hoursMissing": {
    fr: "Les horaires seront publiés prochainement. Appelez-nous pour confirmer.",
    ar: "سيتم نشر الأوقات قريبًا. اتصل بنا للتأكيد.",
  },

  /* ---------------------------------------------------------- services page */
  "services.title": { fr: "Nos soins dentaires", ar: "علاجاتنا السنية" },
  "services.intro": {
    fr: "Retrouvez les soins proposés par le Cabinet Dentaire Ilyass. Les durées et tarifs indicatifs sont renseignés depuis l'espace d'administration.",
    ar: "اكتشف العلاجات التي توفرها عيادة إيل ياس. يتم تحديد المدة والأسعار الإرشادية من لوحة الإدارة.",
  },
  "services.demoNote": {
    fr: "Contenu de démonstration : les soins ci-dessous sont des exemples éditables, à confirmer par le cabinet.",
    ar: "محتوى تجريبي: العلاجات أدناه أمثلة قابلة للتعديل بانتظار تأكيد العيادة.",
  },
  "services.priceOnRequest": { fr: "Tarif sur demande", ar: "السعر عند الطلب" },
  "services.durationValue": { fr: "{value} min", ar: "{value} دقيقة" },
  "services.bookThis": { fr: "Réserver ce soin", ar: "احجز هذا العلاج" },

  /* ---------------------------------------------------------- about page */
  "about.title": { fr: "Le Cabinet Dentaire Ilyass", ar: "عيادة إيل ياس لطب الأسنان" },
  "about.intro": {
    fr: "Un cabinet dentaire implanté à Tiflet, Hay Andalos, au service des familles du secteur.",
    ar: "عيادة أسنان مقيمة بتيفلت، حي الأندلس، في خدمة عائلات المنطقة.",
  },
  "about.envTitle": { fr: "Un environnement de travail soigné", ar: "بيئة عمل مرتبة" },
  "about.envText": {
    fr: "Le cabinet organise ses salles, ses équipements et son accueil pour que chaque patient sache à l'avance ce qui va se passer. Les soins sont expliqués avant de commencer, et le déroulement des séances est annoncé clairement.",
    ar: "تنظم العيادة غرفها ومعداتها واستقبالها ليعرف كل مريض مسبقًا ما سيحدث. تُشرح العلاجات قبل البدء، ويتم الإعلان عن سير الجلسات بوضوح.",
  },
  "about.careTitle": { fr: "Une attention portée à chaque patient", ar: "اهتمام بكل مريض" },
  "about.careText": {
    fr: "Chaque patient dispose d'un dossier, de rendez-vous suivis et, lorsqu'un traitement se déroule en plusieurs fois, d'un plan de séances visible par l'équipe du cabinet.",
    ar: "لكل مريض ملف، ومواعيد متابعة، وعندما يتم العلاج على عدة مرات، خطة جلسات يطّلع عليها فريق العيادة.",
  },
  "about.docsTitle": { fr: "Les praticiens", ar: "الأطباء" },
  "about.docsText": {
    fr: "Les profils ci-dessous sont publiés par l'administration. Aucun nom, diplôme ou photo n'est inventé : seules les informations validées par le cabinet apparaissent.",
    ar: "يتم نشر الملفات أدناه من طرف الإدارة. لا يوجد اسم أو شهادة أو صورة مخترعة: تظهر المعلومات المعتمدة من طرف العيادة فقط.",
  },
  "about.docsDemo": {
    fr: "Profils de démonstration : à remplacer par les informations réelles du cabinet.",
    ar: "ملفات تجريبية: يجب استبدالها بمعلومات العيادة الحقيقية.",
  },
  "about.valuesTitle": { fr: "Nos repères", ar: "مرجعياتنا" },
  "about.value1": { fr: "Clarté", ar: "الوضوح" },
  "about.value1Text": { fr: "Expliquer avant d'agir.", ar: "الشرح قبل التنفيذ." },
  "about.value2": { fr: "Organisation", ar: "التنظيم" },
  "about.value2Text": { fr: "Des horaires tenus, des séances planifiées.", ar: "مواعيد محترمة وجلسات مخططة." },
  "about.value3": { fr: "Écoute", ar: "الاستماع" },
  "about.value3Text": { fr: "Prendre le temps de comprendre la demande.", ar: "إعطاء الوقت لفهم الطلب." },
  "about.value4": { fr: "Suivi", ar: "المتابعة" },
  "about.value4Text": { fr: "Rester présent entre les séances.", ar: "الاستمرارية بين الجلسات." },

  /* ---------------------------------------------------------- contact page */
  "contact.title": { fr: "Contact & accès", ar: "الاتصال والوصول" },
  "contact.intro": {
    fr: "Une question, un imprévu ou une demande particulière ? Contactez directement le Cabinet Dentaire Ilyass.",
    ar: "لديك سؤال أو طارئ أو طلب خاص؟ تواصل مباشرة مع عيادة إيل ياس لطب الأسنان.",
  },
  "contact.callUs": { fr: "Téléphone", ar: "الهاتف" },
  "contact.emailUs": { fr: "E-mail", ar: "البريد الإلكتروني" },
  "contact.addressUs": { fr: "Adresse", ar: "العنوان" },
  "contact.hoursUs": { fr: "Horaires", ar: "الأوقات" },
  "contact.mapLink": { fr: "Ouvrir l'itinéraire", ar: "فتح خريطة الطريق" },
  "contact.mapAlt": { fr: "Localisation du cabinet à Tiflet", ar: "موقع العيادة بتيفلت" },
  "contact.formTitle": { fr: "Écrire au cabinet", ar: "مراسلة العيادة" },
  "contact.formIntro": {
    fr: "Ce formulaire est réservé aux questions générales. N'y indiquez aucune information médicale.",
    ar: "هذا النموذج مخصص للأسئلة العامة. لا تذكر فيه أي معلومات طبية.",
  },
  "contact.subject": { fr: "Sujet", ar: "الموضوع" },
  "contact.subjectOption1": { fr: "Rendez-vous", ar: "موعد" },
  "contact.subjectOption2": { fr: "Horaires d'ouverture", ar: "أوقات العمل" },
  "contact.subjectOption3": { fr: "Tarifs", ar: "الأسعار" },
  "contact.subjectOption4": { fr: "Autre demande", ar: "طلب آخر" },
  "contact.message": { fr: "Message", ar: "الرسالة" },
  "contact.messagePlaceholder": {
    fr: "Décrivez votre demande en quelques lignes…",
    ar: "صف طلبك في بضع أسطر…",
  },
  "contact.send": { fr: "Envoyer le message", ar: "إرسال الرسالة" },
  "contact.success": {
    fr: "Message enregistré. Le cabinet vous répondra dès que possible.",
    ar: "تم تسجيل الرسالة. سترد العيادة عليك في أقرب وقت.",
  },
  "contact.hoursMissing": {
    fr: "Les horaires ne sont pas encore publiés. Appelez le cabinet pour les connaître.",
    ar: "لم يتم نشر أوقات العمل بعد. اتصل بالعيادة لمعرفتها.",
  },
  "contact.closed": { fr: "Fermé", ar: "مغلق" },

  /* ---------------------------------------------------------- formulaire de contact */
  "form.name": { fr: "Votre nom", ar: "اسمك" },
  "form.email": { fr: "Votre e-mail", ar: "بريدك الإلكتروني" },
  "form.phone": { fr: "Votre téléphone", ar: "رقم هاتفك" },

  /* ---------------------------------------------------------- booking */
  "booking.title": { fr: "Prendre rendez-vous", ar: "حجز موعد" },
  "booking.intro": {
    fr: "Remplissez les étapes ci-dessous. Votre demande reste en attente tant que le cabinet ne l'a pas confirmée.",
    ar: "املأ الخطوات أدناه. يبقى طلبك معلقًا حتى تؤكده العيادة.",
  },
  "booking.step": { fr: "Étape {current} sur {total}", ar: "الخطوة {current} من {total}" },
  "booking.step1": { fr: "Le soin", ar: "العلاج" },
  "booking.step2": { fr: "Le praticien", ar: "الطبيب" },
  "booking.step3": { fr: "Date et heure", ar: "التاريخ والوقت" },
  "booking.step4": { fr: "Vos coordonnées", ar: "بياناتك" },
  "booking.step5": { fr: "Vérification", ar: "المراجعة" },
  "booking.chooseService": { fr: "Quel soin souhaitez-vous ?", ar: "ما العلاج الذي تريده؟" },
  "booking.chooseDoctor": { fr: "Quel praticien préférez-vous ?", ar: "أي طبيب تفضل؟" },
  "booking.anyDoctor": { fr: "N'importe quel praticien disponible", ar: "أي طبيب متاح" },
  "booking.anyDoctorDesc": { fr: "Nous vous proposons le premier praticien libre.", ar: "نقترح عليك أول طبيب متاح." },
  "booking.chooseDate": { fr: "Choisissez une date", ar: "اختر تاريخًا" },
  "booking.chooseSlot": { fr: "Choisissez une heure", ar: "اختر وقتًا" },
  "booking.availabilityLoading": { fr: "Recherche des créneaux…", ar: "جارٍ البحث عن المواعيد…" },
  "booking.yourInfo": { fr: "Vos coordonnées", ar: "بياناتك" },
  "booking.noteLabel": { fr: "Note pour le cabinet (facultatif)", ar: "ملاحظة للعيادة (اختياري)" },
  "booking.notePlaceholder": {
    fr: "Quelques mots sur votre demande (pas d'information médicale sensible).",
    ar: "بضع كلمات عن طلبك (بدون معلومات طبية حساسة).",
  },
  "booking.review": { fr: "Vérifiez votre demande", ar: "راجع طلبك" },
  "booking.reviewService": { fr: "Soin", ar: "العلاج" },
  "booking.reviewDoctor": { fr: "Praticien", ar: "الطبيب" },
  "booking.reviewDate": { fr: "Date et heure", ar: "التاريخ والساعة" },
  "booking.reviewPatient": { fr: "Patient", ar: "المريض" },
  "booking.reviewContact": { fr: "Contact", ar: "التواصل" },
  "booking.reviewNote": { fr: "Note", ar: "ملاحظة" },
  "booking.send": { fr: "Envoyer ma demande", ar: "إرسال طلبي" },
  "booking.sending": { fr: "Envoi en cours…", ar: "جارٍ الإرسال…" },
  "booking.successTitle": { fr: "Demande envoyée", ar: "تم إرسال الطلب" },
  "booking.successText": {
    fr: "Votre demande est enregistrée et reste EN ATTENTE de validation par le cabinet. Ce n'est pas encore un rendez-vous confirmé : l'équipe vous contactera par téléphone pour confirmer ou proposer un autre créneau.",
    ar: "تم تسجيل طلبك وهو في انتظار موافقة العيادة. هذا ليس موعدًا مؤكده بعد: سيتواصل معك فريق العيادة عبر الهاتف للتأكيد أو اقتراح موعد آخر.",
  },
  "booking.referenceLabel": { fr: "Numéro de référence", ar: "رقم المرجع" },
  "booking.referenceHelp": {
    fr: "Conservez ce numéro : il vous permet de suivre l'état de votre demande sans créer de compte.",
    ar: "احتفظ بهذا الرقم: يتيح لك متابعة حالة طلبك دون إنشاء حساب.",
  },
  "booking.pendingBadge": { fr: "Demande en attente", ar: "طلب في انتظار الموافقة" },
  "booking.callUs": { fr: "Appeler le cabinet", ar: "الاتصال بالعيادة" },
  "booking.newRequest": { fr: "Faire une autre demande", ar: "إرسال طلب آخر" },
  "booking.alreadySubmitted": {
    fr: "Une demande identique a déjà été envoyée pour ce créneau. Voici sa référence.",
    ar: "تم إرسال طلب مماثل لهذا الموعد بالفعل. هذا هو رقم مرجعه.",
  },
  "booking.demoNotice": {
    fr: "Les soins et praticiens affichés sont des données de démonstration, modifiables depuis l'espace d'administration.",
    ar: "العلاجات والأطباء المعروضون بيانات تجريبية قابلة للتعديل من لوحة الإدارة.",
  },

  /* ---------------------------------------------------------- suivi de demande */
  "track.title": { fr: "Suivre ma demande", ar: "تتبع طلبي" },
  "track.intro": {
    fr: "Indiquez votre numéro de référence et le téléphone utilisé lors de la demande.",
    ar: "أدخل رقم المرجع والهاتف المستخدم عند تقديم الطلب.",
  },
  "track.reference": { fr: "Numéro de référence", ar: "رقم المرجع" },
  "track.referencePlaceholder": { fr: "Ex. CDI-483921", ar: "مثال: CDI-483921" },
  "track.check": { fr: "Vérifier l'état", ar: "فحص الحالة" },
  "track.resultTitle": { fr: "État de votre demande", ar: "حالة طلبك" },
  "track.sentAt": { fr: "Demande envoyée le", ar: "تاريخ إرسال الطلب" },
  "track.nextStep": { fr: "Prochaine étape", ar: "الخطوة التالية" },
  "track.nextPending": {
    fr: "Le cabinet examine votre demande et vous recontacte par téléphone.",
    ar: "تقوم العيادة بمراجعة طلبك وستتواصل معك عبر الهاتف.",
  },
  "track.nextConfirmed": {
    fr: "Votre créneau est confirmé. Présentez-vous à l'heure indiquée.",
    ar: "تم تأكيد موعدك. يرجى الحضور في الوقت المحدد.",
  },
  "track.nextRejected": {
    fr: "Le créneau demandé n'est pas disponible. Appelez le cabinet pour trouver une autre solution.",
    ar: "الموعد المطلوب غير متاح. اتصل بالعيادة للعثور على بديل.",
  },
  "track.nextCancelled": { fr: "Cette demande a été annulée.", ar: "تم إلغاء هذا الطلب." },
  "track.nextExpired": {
    fr: "Cette demande a expiré sans confirmation. Vous pouvez en envoyer une nouvelle.",
    ar: "انتهت صلاحية الطلب دون تأكيد. يمكنك إرسال طلب جديد.",
  },
  "track.hint": {
    fr: "Vous n'avez pas de compte patient : le suivi se fait uniquement par numéro de référence.",
    ar: "ليس لديك حساب مريض: التتبع يتم فقط برقم المرجع.",
  },

  /* ---------------------------------------------------------- privacy */
  "privacy.title": { fr: "Politique de confidentialité", ar: "سياسة الخصوصية" },
  "privacy.updated": { fr: "Dernière mise à jour : version initiale du site.", ar: "آخر تحديث: النسخة الأولى للموقع." },
  "privacy.s1Title": { fr: "Données collectées", ar: "البيانات المجمّعة" },
  "privacy.s1Text": {
    fr: "Pour une demande de rendez-vous, nous collectons uniquement : nom complet, numéro de téléphone, e-mail (s'il est renseigné) et la note facultaire que vous saisissez. Le formulaire de contact collecte votre nom, votre e-mail, le sujet et votre message.",
    ar: "لطلب الموعد، نجمع فقط: الاسم الكامل، رقم الهاتف، البريد الإلكتروني (إن وُجد)، والملاحظة الاختيارية التي تكتبها. ونموذج الاتصال يجمع اسمك وبريدك الإلكتروني والموضوع ورسالتك.",
  },
  "privacy.s2Title": { fr: "Finalité des données", ar: "غرض من البيانات" },
  "privacy.s2Text": {
    fr: "Ces informations servent uniquement à traiter votre demande de rendez-vous, vous joindre par téléphone et organiser les soins. Elles ne sont pas vendues ni utilisées à des fins publicitaires.",
    ar: "تُستخدم هذه المعلومات فقط لمعالجة طلب الموعد، والتواصل معك هاتفيًا، وتنظيم العلاجات. لا تُباع ولا تُستخدم لأغراض إعلانية.",
  },
  "privacy.s3Title": { fr: "Accès et conservation", ar: "الوصول والاحتفاظ" },
  "privacy.s3Text": {
    fr: "Seuls les membres autorisés du cabinet accèdent aux demandes. Les données sont conservées le temps nécessaire au suivi des rendez-vous, puis supprimées ou anonymisées sur demande.",
    ar: "يتوفر على الطلبات فقط أعضاء العيادة المصرح لهم. تُحفظ البيانات للمدة اللازمة لمتابعة المواعيد، ثم تُحذف أو تُخفى عند الطلب.",
  },
  "privacy.s4Title": { fr: "Aucune donnée médicale dans le formulaire", ar: "لا بيانات طبية في النموذج" },
  "privacy.s4Text": {
    fr: "Nous vous demandons de ne pas indiquer de détail médical sensible dans les champs libres. Les échanges médicaux ont lieu au cabinet.",
    ar: "نرجو عدم كتابة أي معلومة طبية حساسة في الحقول المفتوحة. تتم المناقشات الطبية داخل العيادة.",
  },
  "privacy.s5Title": { fr: "Vos droits", ar: "حقوقك" },
  "privacy.s5Text": {
    fr: "Vous pouvez demander l'accès, la rectification ou la suppression de vos données en écrivant à ilyassdr60@gmail.com ou en appelant le +212659349160.",
    ar: "يمكنك طلب الوصول إلى بياناتك أو تصحيحها أو حذفها عبر مراسلتنا على ilyassdr60@gmail.com أو بالاتصال على +212659349160.",
  },
  "privacy.s6Title": { fr: "Cookies et mesure d'audience", ar: "الكوكيز وقياس الجمهور" },
  "privacy.s6Text": {
    fr: "Le site n'utilise que des cookies techniques nécessaires au fonctionnement (langue, session). Aucune mesure d'audience publicitaire n'est activée par défaut.",
    ar: "يستخدم الموقع فقط الكوكيز التقنية الضرورية لعمله (اللغة، الجلسة). لا يتم تفعيل أي قياس إعلاني افتراضيًا.",
  },
  "privacy.contactTitle": { fr: "Contact", ar: "اتصل بنا" },

  /* ---------------------------------------------------------- footer */
  "footer.about": {
    fr: "Cabinet dentaire à Tiflet, Hay Andalos. Prise de rendez-vous en ligne avec validation par l'équipe.",
    ar: "عيادة أسنان بتيفلت، حي الأندلس. حجز المواعيد عبر الإنترنت مع تأكيد من الفريق.",
  },
  "footer.links": { fr: "Navigation", ar: "التنقل" },
  "footer.contact": { fr: "Contact", ar: "اتصل بنا" },
  "footer.legal": { fr: "Informations légales", ar: "معلومات قانونية" },
  "footer.privacy": { fr: "Confidentialité", ar: "الخصوصية" },
  "footer.rights": { fr: "Tous droits réservés.", ar: "جميع الحقوق محفوظة." },
  "footer.hours": { fr: "Horaires", ar: "الأوقات" },
  "footer.hoursMissing": { fr: "À renseigner par le cabinet", ar: "تحددها العيادة" },

  /* ---------------------------------------------------------- pages diverses */
  "notFound.title": { fr: "Page introuvable", ar: "الصفحة غير موجودة" },
  "notFound.text": { fr: "La page demandée n'existe pas ou a été déplacée.", ar: "الصفحة المطلوبة غير موجودة أو تم نقلها." },
  "notFound.home": { fr: "Retour à l'accueil", ar: "العودة إلى الرئيسية" },

  /* ---------------------------------------------------------- admin : connexion */
  "admin.loginTitle": { fr: "Espace administration", ar: "لوحة الإدارة" },
  "admin.loginSubtitle": {
    fr: "Réservé au personnel autorisé du cabinet.",
    ar: "مخصص لموظفين العيادة المصرح لهم.",
  },
  "admin.email": { fr: "Adresse e-mail", ar: "البريد الإلكتروني" },
  "admin.password": { fr: "Mot de passe", ar: "كلمة المرور" },
  "admin.signIn": { fr: "Se connecter", ar: "تسجيل الدخول" },
  "admin.signingIn": { fr: "Connexion…", ar: "جارٍ تسجيل الدخول…" },
  "admin.signOut": { fr: "Se déconnecter", ar: "تسجيل الخروج" },
  "admin.noAccount": {
    fr: "Aucun compte ? La création du premier administrateur est décrite dans le README.",
    ar: "لا يوجد حساب؟ يتم إنشاء أول مدير في ملف README.",
  },

  /* ---------------------------------------------------------- admin : structure */
  "admin.dashboard": { fr: "Tableau de bord", ar: "لوحة القيادة" },
  "admin.appointments": { fr: "Rendez-vous", ar: "المواعيد" },
  "admin.doctors": { fr: "Praticiens", ar: "الأطباء" },
  "admin.services": { fr: "Soins", ar: "العلاجات" },
  "admin.patients": { fr: "Patients", ar: "المرضى" },
  "admin.treatments": { fr: "Plans de traitement", ar: "خطط العلاج" },
  "admin.settings": { fr: "Paramètres", ar: "الإعدادات" },
  "admin.overview": { fr: "Vue d'ensemble", ar: "نظرة عامة" },
  "admin.section": { fr: "Administration", ar: "الإدارة" },

  /* ---------------------------------------------------------- admin : overview */
  "admin.kpi.pending": { fr: "Demandes en attente", ar: "طلبات معلقة" },
  "admin.kpi.confirmed": { fr: "Rendez-vous confirmés", ar: "مواعيد مؤكدة" },
  "admin.kpi.today": { fr: "Aujourd'hui", ar: "اليوم" },
  "admin.kpi.doctors": { fr: "Praticiens actifs", ar: "أطباء نشطون" },
  "admin.kpi.sessions": { fr: "Séances à venir", ar: "جلسات قادمة" },
  "admin.kpi.patients": { fr: "Patients enregistrés", ar: "مرضى مسجّلون" },
  "admin.overview.todayTitle": { fr: "Planning du jour", ar: "برنامج اليوم" },
  "admin.overview.pendingTitle": { fr: "Dernières demandes", ar: "أحدث الطلبات" },
  "admin.overview.sessionsTitle": { fr: "Séances planifiées", ar: "الجلسات المخططة" },
  "admin.overview.quickActions": { fr: "Actions rapides", ar: "إجراءات سريعة" },
  "admin.overview.goAppointments": { fr: "Traiter les demandes", ar: "معالجة الطلبات" },
  "admin.overview.goSeed": { fr: "Charger les données de démonstration", ar: "تحميل البيانات التجريبية" },

  /* ---------------------------------------------------------- admin : rendez-vous */
  "admin.appt.title": { fr: "Gestion des rendez-vous", ar: "إدارة المواعيد" },
  "admin.appt.searchPlaceholder": { fr: "Rechercher un patient, une référence…", ar: "البحث عن مريض أو مرجع…" },
  "admin.appt.filterStatus": { fr: "Statut", ar: "الحالة" },
  "admin.appt.filterDoctor": { fr: "Praticien", ar: "الطبيب" },
  "admin.appt.filterDate": { fr: "Date", ar: "التاريخ" },
  "admin.appt.reference": { fr: "Référence", ar: "المرجع" },
  "admin.appt.requested": { fr: "Demandé", ar: "المطلوب" },
  "admin.appt.created": { fr: "Reçu le", ar: "تاريخ الاستلام" },
  "admin.appt.note": { fr: "Note du patient", ar: "ملاحظة المريض" },
  "admin.appt.approve": { fr: "Approuver", ar: "موافقة" },
  "admin.appt.reject": { fr: "Refuser", ar: "رفض" },
  "admin.appt.reschedule": { fr: "Replanifier", ar: "إعادة الجدولة" },
  "admin.appt.reassign": { fr: "Changer de praticien", ar: "تغيير الطبيب" },
  "admin.appt.complete": { fr: "Marquer terminé", ar: "تحديد كمنجز" },
  "admin.appt.cancel": { fr: "Annuler", ar: "إلغاء" },
  "admin.appt.confirmApprove": {
    fr: "Confirmer ce rendez-vous ? Le créneau sera bloqué pour ce praticien.",
    ar: "تأكيد هذا الموعد؟ سيتم حجز هذا الوقت لهذا الطبيب.",
  },
  "admin.appt.confirmReject": {
    fr: "Refuser cette demande ? Le créneau sera de nouveau proposé.",
    ar: "رفض هذا الطلب؟ سيتم إتاحة الموعد من جديد.",
  },
  "admin.appt.approved": { fr: "Rendez-vous approuvé.", ar: "تمت الموافقة على الموعد." },
  "admin.appt.rejected": { fr: "Demande refusée.", ar: "تم رفض الطلب." },
  "admin.appt.updated": { fr: "Demande mise à jour.", ar: "تم تحديث الطلب." },
  "admin.appt.conflict": {
    fr: "Conflit de planning : ce créneau est déjà occupé pour ce praticien.",
    ar: "تعارض في البرنامج: هذا الموعد محجوز بالفعل لهذا الطبيب.",
  },
  "admin.appt.newSlot": { fr: "Nouveau créneau", ar: "موعد جديد" },
  "admin.appt.newDoctor": { fr: "Nouveau praticien", ar: "طبيب جديد" },
  "admin.appt.internalNotes": { fr: "Notes internes (jamais visibles du patient)", ar: "ملاحظات داخلية (غير ظاهرة للمريض)" },
  "admin.appt.notesPlaceholder": {
    fr: "Consignation interne…",
    ar: "ملاحظة داخلية…",
  },
  "admin.appt.saveNotes": { fr: "Enregistrer la note", ar: "حفظ الملاحظة" },
  "admin.appt.showOnPatient": {
    fr: "Visible côté patient via le numéro de référence.",
    ar: "ظاهر للمريض عبر رقم المرجع.",
  },

  /* ---------------------------------------------------------- admin : praticiens */
  "admin.doctors.title": { fr: "Gestion des praticiens", ar: "إدارة الأطباء" },
  "admin.doctors.add": { fr: "Ajouter un praticien", ar: "إضافة طبيب" },
  "admin.doctors.edit": { fr: "Modifier le praticien", ar: "تعديل الطبيب" },
  "admin.doctors.displayName": { fr: "Nom affiché", ar: "الاسم المعروض" },
  "admin.doctors.displayNamePlaceholder": { fr: "Ex. Dr. Prénom Nom (donnée de démo)", ar: "مثال: د. الاسم (بيانات تجريبية)" },
  "admin.doctors.bio": { fr: "Présentation professionnelle", ar: "النبذة المهنية" },
  "admin.doctors.bioPlaceholder": {
    fr: "Deux ou trois phrases, uniquement des informations validées par le cabinet.",
    ar: "جملتان أو ثلاث، معلومات معتمدة من العيادة فقط.",
  },
  "admin.doctors.photoUrl": { fr: "URL de la photo", ar: "رابط الصورة" },
  "admin.doctors.photoHelp": {
    fr: "Laissez vide pour afficher une carte initiales. Utilisez une image déposée dans /public/images.",
    ar: "اتركه فارغًا لعرض بطاقة الأحرف الأولى. استخدم صورة موجودة في /public/images.",
  },
  "admin.doctors.services": { fr: "Soins proposés", ar: "العلاجات المقدمة" },
  "admin.doctors.workingDays": { fr: "Jours travaillés", ar: "أيام العمل" },
  "admin.doctors.hours": { fr: "Heures de travail", ar: "ساعات العمل" },
  "admin.doctors.breaks": { fr: "Pauses", ar: "استراحات" },
  "admin.doctors.addBreak": { fr: "Ajouter une pause", ar: "إضافة استراحة" },
  "admin.doctors.timezone": { fr: "Fuseau horaire", ar: "المنطقة الزمنية" },
  "admin.doctors.unavailableDates": { fr: "Dates indisponibles", ar: "تواريخ غير متاحة" },
  "admin.doctors.unavailableHelp": {
    fr: "Une date par ligne, format AAAA-MM-JJ (ex. 2026-01-01).",
    ar: "تاريخ في كل سطر، الصيغة AAAA-MM-JJ (مثال: 2026-01-01).",
  },
  "admin.doctors.activate": { fr: "Activer", ar: "تفعيل" },
  "admin.doctors.deactivate": { fr: "Désactiver", ar: "إلغاء التفعيل" },
  "admin.doctors.saved": { fr: "Praticien enregistré.", ar: "تم حفظ الطبيب." },
  "admin.doctors.deleted": { fr: "Praticien supprimé.", ar: "تم حذف الطبيب." },
  "admin.doctors.nameRequired": { fr: "Le nom affiché est obligatoire.", ar: "الاسم المعروض مطلوب." },
  "admin.doctors.hoursInvalid": {
    fr: "Les heures de travail ne sont pas valides.",
    ar: "ساعات العمل غير صالحة.",
  },
  "admin.doctors.confirmDelete": {
    fr: "Supprimer ce praticien ? Les rendez-vous existants sont conservés.",
    ar: "حذف هذا الطبيب؟ تبقى المواعيد الموجودة.",
  },

  /* ---------------------------------------------------------- admin : soins */
  "admin.services.title": { fr: "Gestion des soins", ar: "إدارة العلاجات" },
  "admin.services.add": { fr: "Ajouter un soin", ar: "إضافة علاج" },
  "admin.services.edit": { fr: "Modifier le soin", ar: "تعديل العلاج" },
  "admin.services.nameFr": { fr: "Nom (français)", ar: "الاسم (فرنسية)" },
  "admin.services.nameAr": { fr: "Nom (arabe)", ar: "الاسم (عربية)" },
  "admin.services.descFr": { fr: "Description (français)", ar: "الوصف (فرنسية)" },
  "admin.services.descAr": { fr: "Description (arabe)", ar: "الوصف (عربية)" },
  "admin.services.durationMin": { fr: "Durée (minutes)", ar: "المدة (دقائق)" },
  "admin.services.price": { fr: "Tarif (MAD, facultatif)", ar: "السعر (درهم، اختياري)" },
  "admin.services.priceHelp": {
    fr: "Laissez vide pour afficher « Tarif sur demande ».",
    ar: "اتركه فارغًا لعرض «السعر عند الطلب».",
  },
  "admin.services.image": { fr: "Image (chemin /public)", ar: "الصورة (مسار /public)" },
  "admin.services.order": { fr: "Ordre d'affichage", ar: "ترتيب العرض" },
  "admin.services.saved": { fr: "Soin enregistré.", ar: "تم حفظ العلاج." },
  "admin.services.deleted": { fr: "Soin supprimé.", ar: "تم حذف العلاج." },
  "admin.services.nameRequired": { fr: "Le nom français et le nom arabe sont obligatoires.", ar: "الاسم بالفرنسية والعربية مطلوبان." },
  "admin.services.durationInvalid": { fr: "La durée doit être comprise entre 5 et 480 minutes.", ar: "يجب أن تكون المدة بين 5 و480 دقيقة." },
  "admin.services.confirmDelete": { fr: "Supprimer ce soin ?", ar: "حذف هذا العلاج؟" },

  /* ---------------------------------------------------------- admin : patients */
  "admin.patients.title": { fr: "Patients", ar: "المرضى" },
  "admin.patients.searchPlaceholder": { fr: "Rechercher par nom, téléphone ou e-mail…", ar: "البحث بالاسم أو الهاتف أو البريد…" },
  "admin.patients.column": { fr: "Patient", ar: "المريض" },
  "admin.patients.appointments": { fr: "Rendez-vous", ar: "المواعيد" },
  "admin.patients.lastVisit": { fr: "Dernier rendez-vous", ar: "آخر موعد" },
  "admin.patients.masked": { fr: "Coordonnées masquées", ar: "بيانات مخفية" },
  "admin.patients.reveal": { fr: "Afficher", ar: "إظهار" },
  "admin.patients.privacyNote": {
    fr: "Les coordonnées complètes sont masquées par défaut : affichez-les uniquement si nécessaire.",
    ar: "البيانات الكاملة مخفية افتراضيًا: أظهرها عند الحاجة فقط.",
  },

  /* ---------------------------------------------------------- admin : traitements */
  "admin.treatments.title": { fr: "Plans de traitement", ar: "خطط العلاج" },
  "admin.treatments.newPlan": { fr: "Nouveau plan", ar: "خطة جديدة" },
  "admin.treatments.planLabel": { fr: "Intitulé du plan", ar: "عنوان الخطة" },
  "admin.treatments.planLabelPlaceholder": { fr: "Ex. Alignment dentaire (démo)", ar: "مثال: تقويم الأسنان (تجريبي)" },
  "admin.treatments.patient": { fr: "Patient", ar: "المريض" },
  "admin.treatments.patientName": { fr: "Nom du patient", ar: "اسم المريض" },
  "admin.treatments.patientContact": { fr: "Téléphone du patient", ar: "هاتف المريض" },
  "admin.treatments.sessions": { fr: "Séances", ar: "الجلسات" },
  "admin.treatments.addSession": { fr: "Ajouter une séance", ar: "إضافة جلسة" },
  "admin.treatments.sessionNumber": { fr: "N° de séance", ar: "رقم الجلسة" },
  "admin.treatments.plannedDate": { fr: "Date prévue", ar: "التاريخ المخطط" },
  "admin.treatments.progress": { fr: "Progression", ar: "التقدم" },
  "admin.treatments.completedOf": { fr: "{done} séance(s) terminée(s) sur {total}", ar: "{done} جلسة منجزة من {total}" },
  "admin.treatments.markCompleted": { fr: "Marquer terminée", ar: "تحديد كمنجزة" },
  "admin.treatments.markMissed": { fr: "Marquer non honorée", ar: "تحديد كمحجورة" },
  "admin.treatments.markCancelled": { fr: "Annuler la séance", ar: "إلغاء الجلسة" },
  "admin.treatments.reschedule": { fr: "Replanifier", ar: "إعادة الجدولة" },
  "admin.treatments.planNote": { fr: "Note interne du plan", ar: "ملاحظة داخلية للخطة" },
  "admin.treatments.confirmCreateSession": {
    fr: "Planifier cette séance maintenant ? Une séance n'est jamais réservée automatiquement.",
    ar: "جدولة هذه الجلسة الآن؟ لا يتم حجز الجلسة تلقائيًا أبدًا.",
  },
  "admin.treatments.sessionSaved": { fr: "Séance enregistrée.", ar: "تم حفظ الجلسة." },
  "admin.treatments.planSaved": { fr: "Plan enregistré.", ar: "تم حفظ الخطة." },
  "admin.treatments.planDeleted": { fr: "Plan supprimé.", ar: "تم حذف الخطة." },
  "admin.treatments.noMedicalNote": {
    fr: "Renseignez ici uniquement des informations nécessaires au suivi. L'accès est restreint aux rôles autorisés.",
    ar: "أدخل هنا فقط المعلومات الضرورية للمتابعة. الوصول محدود بالأدوار المصرح بها.",
  },
  "admin.treatments.sessionStatus": { fr: "État de la séance", ar: "حالة الجلسة" },
  "admin.treatments.patientRequired": { fr: "Le nom et le téléphone du patient sont obligatoires.", ar: "اسم وهاتف المريض مطلوبان." },
  "admin.treatments.planTitleRequired": { fr: "L'intitulé du plan est obligatoire.", ar: "عنوان الخطة مطلوب." },
  "admin.treatments.sessionDateRequired": { fr: "Choisissez une date de séance.", ar: "اختر تاريخ الجلسة." },

  /* ---------------------------------------------------------- admin : paramètres */
  "admin.settings.title": { fr: "Paramètres du cabinet", ar: "إعدادات العيادة" },
  "admin.settings.clinicInfo": { fr: "Informations du cabinet", ar: "معلومات العيادة" },
  "admin.settings.hours": { fr: "Horaires d'ouverture", ar: "أوقات العمل" },
  "admin.settings.hoursHelp": {
    fr: "Laissez un jour fermé pour le marquer « Fermé ». Ces horaires sont affichés publiquement.",
    ar: "اترك اليوم فارغًا لتحديده كـ«مغلق». تُعرض هذه الأوقات للعموم.",
  },
  "admin.settings.timezone": { fr: "Fuseau horaire", ar: "المنطقة الزمنية" },
  "admin.settings.language": { fr: "Langue par défaut", ar: "اللغة الافتراضية" },
  "admin.settings.bookingPolicy": { fr: "Politique de réservation", ar: "سياسة الحجز" },
  "admin.settings.holdHours": {
    fr: "Durée de blocage d'un créneau en attente (heures)",
    ar: "مدة حجز الموعد المعلق (ساعات)",
  },
  "admin.settings.holdHelp": {
    fr: "Passé ce délai, une demande non traitée expire et le créneau redevient libre.",
    ar: "بعد هذا المدة، ينتهي الطلب غير المعالج ويعود الموعد متاحًا.",
  },
  "admin.settings.maxDays": { fr: "Réservation maximale à l'avance (jours)", ar: "أقصى مدة للحجز مسبقًا (أيام)" },
  "admin.settings.slotStep": { fr: "Pas des créneaux (minutes)", ar: "خطوة المواعيد (دقائق)" },
  "admin.settings.defaultLanguageHelp": {
    fr: "Langue proposée au premier chargement du site.",
    ar: "اللغة المقترحة عند أول تحميل للموقع.",
  },
  "admin.settings.saved": { fr: "Paramètres enregistrés.", ar: "تم حفظ الإعدادات." },
  "admin.settings.seed": { fr: "Charger les données de démonstration", ar: "تحميل البيانات التجريبية" },
  "admin.settings.seedHelp": {
    fr: "Crée des soins, deux praticiens et des paramètres de démonstration. Aucune donnée existante n'est écrasée.",
    ar: "ينشئ علاجين وطبيبين وإعدادات تجريبية. لا يتم استبدال أي بيانات موجودة.",
  },
  "admin.settings.seedDone": { fr: "Données de démonstration chargées.", ar: "تم تحميل البيانات التجريبية." },
  "admin.settings.nameRequired": { fr: "Le nom du cabinet est obligatoire.", ar: "اسم العيادة مطلوب." },

  /* ---------------------------------------------------------- admin : formulaires */
  "admin.form.cancel": { fr: "Annuler", ar: "إلغاء" },
  "admin.form.save": { fr: "Enregistrer", ar: "حفظ" },
  "admin.form.saving": { fr: "Enregistrement…", ar: "جارٍ الحفظ…" },
  "admin.form.close": { fr: "Fermer", ar: "إغلاق" },
  "admin.days.mon": { fr: "Lun", ar: "الاثنين" },
  "admin.days.tue": { fr: "Mar", ar: "الثلاثاء" },
  "admin.days.wed": { fr: "Mer", ar: "الأربعاء" },
  "admin.days.thu": { fr: "Jeu", ar: "الخميس" },
  "admin.days.fri": { fr: "Ven", ar: "الجمعة" },
  "admin.days.sat": { fr: "Sam", ar: "السبت" },
  "admin.days.sun": { fr: "Dim", ar: "الأحد" },
  "admin.open": { fr: "Ouvert", ar: "مفتوح" },
  "admin.closed": { fr: "Fermé", ar: "مغلق" },

  /* ------------------------- messages centralisés (voir messages.js) --
   * Erreurs, validations, toasts et états vides : une seule source.    */
  ...UI_MESSAGES,
};

/** Jours de la semaine (index JS : 0 = dimanche). */
export const DAY_KEYS = [
  "admin.days.sun",
  "admin.days.mon",
  "admin.days.tue",
  "admin.days.wed",
  "admin.days.thu",
  "admin.days.fri",
  "admin.days.sat",
];

export const LANGUAGES = [
  { code: "fr", label: "FR", htmlLang: "fr", dir: "ltr", intl: "fr-MA" },
  { code: "ar", label: "AR", htmlLang: "ar", dir: "rtl", intl: "ar-MA" },
];

export function isLanguage(value) {
  return value === "fr" || value === "ar";
}

/**
 * Traduit une clé. Repli automatique sur le français si la clé n'existe
 * pas dans la langue demandée.
 */
export function translate(key, lang = "fr", vars = null) {
  const entry = messages[key];
  if (!entry) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[i18n] clé manquante : ${key}`);
    }
    return key;
  }
  let text = entry[lang] ?? entry.fr;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.split(`{${name}}`).join(String(value));
    }
  }
  return text;
}

/**
 * Champ bilingue d'une collection Firestore : `nameFr` / `nameAr`.
 * Repli sur la langue disponible, puis sur la valeur vide.
 */
export function localized(item, field, lang = "fr", fallback = "") {
  if (!item) return fallback;
  const ar = item[`${field}Ar`];
  const fr = item[`${field}Fr`];
  const value = lang === "ar" ? ar || fr : fr || ar;
  return value || fallback;
}
