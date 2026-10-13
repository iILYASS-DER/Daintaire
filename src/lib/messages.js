/**
 * Central store for every error, validation, toast and empty-state message
 * shown by the site or returned by the API.
 *
 * - `en` is the CANONICAL text: API responses always contain the English
 *   message, whatever the visitor's language.
 * - `fr` / `ar` are what the UI displays through the language switcher, so
 *   a patient never sees two languages on the same screen.
 *
 * i18n.js imports UI_MESSAGES, so `t("form.error.dateInvalid")` keeps
 * working exactly as before — but the text now lives in this single file.
 */

export const MESSAGES = {
  /* ------------------------------------------------------------- shared */
  "common.error": {
    en: "Something went wrong on our side. Please try again.",
    fr: "Une erreur est survenue.",
    ar: "حدث خطأ ما.",
  },
  "common.networkError": {
    en: "We could not reach the server. Check your connection and try again.",
    fr: "Impossible de joindre le serveur. Vérifiez votre connexion.",
    ar: "تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.",
  },
  "common.empty": {
    en: "Nothing to show here yet.",
    fr: "Aucun résultat.",
    ar: "لا توجد نتائج.",
  },

  /* ------------------------------------------------- form validation */
  "form.error.nameRequired": {
    en: "Please enter your full name.",
    fr: "Veuillez indiquer votre nom.",
    ar: "يرجى إدخال اسمك.",
  },
  "form.error.nameTooLong": {
    en: "This name is too long.",
    fr: "Le nom est trop long.",
    ar: "الاسم طويل جدًا.",
  },
  "form.error.emailRequired": {
    en: "Please enter your email address.",
    fr: "Veuillez indiquer votre e-mail.",
    ar: "يرجى إدخال بريدك الإلكتروني.",
  },
  "form.error.emailInvalid": {
    en: "This email address is not valid.",
    fr: "L'adresse e-mail n'est pas valide.",
    ar: "البريد الإلكتروني غير صالح.",
  },
  "form.error.phoneInvalid": {
    en: "This phone number is not valid (example: 06 12 34 56 78).",
    fr: "Le numéro de téléphone n'est pas valide (ex. 06 12 34 56 78).",
    ar: "رقم الهاتف غير صالح (مثال: 0612345678).",
  },
  "form.error.messageRequired": {
    en: "Please write a message.",
    fr: "Veuillez écrire un message.",
    ar: "يرجى كتابة رسالة.",
  },
  "form.error.messageTooShort": {
    en: "This message is too short.",
    fr: "Le message est trop court.",
    ar: "الرسالة قصيرة جدًا.",
  },
  "form.error.messageTooLong": {
    en: "This message is too long.",
    fr: "Le message est trop long.",
    ar: "الرسالة طويلة جدًا.",
  },
  "form.error.serviceRequired": {
    en: "Please choose a treatment.",
    fr: "Veuillez choisir un soin.",
    ar: "يرجى اختيار علاج.",
  },
  "form.error.doctorRequired": {
    en: "Please choose a dentist.",
    fr: "Veuillez choisir un praticien.",
    ar: "يرجى اختيار طبيب.",
  },
  "form.error.dateRequired": {
    en: "Please choose a valid date.",
    fr: "Veuillez choisir une date.",
    ar: "يرجى اختيار تاريخ.",
  },
  "form.error.dateInvalid": {
    en: "Please choose a valid date.",
    fr: "La date n'est pas valide.",
    ar: "التاريخ غير صالح.",
  },
  "form.error.datePast": {
    en: "This date is in the past. Please select a future date.",
    fr: "La date doit être dans le futur.",
    ar: "يجب أن يكون التاريخ في المستقبل.",
  },
  "form.error.dateTooFar": {
    en: "This date is too far ahead. Appointments can be booked up to 90 days in advance.",
    fr: "Les réservations sont possibles jusqu'à 90 jours.",
    ar: "يسمح بالحجز حتى 90 يومًا.",
  },
  "form.error.slotRequired": {
    en: "Please choose a time.",
    fr: "Veuillez choisir une heure.",
    ar: "يرجى اختيار وقت.",
  },
  "form.error.slotUnavailable": {
    en: "This time slot is no longer available. Please choose another one.",
    fr: "Ce créneau vient d'être pris. Choisissez-en un autre.",
    ar: "تم حجز هذا الموعد للتو. اختر موعدًا آخر.",
  },
  "form.error.noteTooLong": {
    en: "This note is too long.",
    fr: "La note est trop longue.",
    ar: "الملاحظة طويلة جدًا.",
  },
  "form.error.invalid": {
    en: "Some of the information you entered is not valid.",
    fr: "Certains champs ne sont pas valides.",
    ar: "بعض الحقول غير صالحة.",
  },
  "form.error.generic": {
    en: "We could not send this. Please try again in a moment.",
    fr: "L'envoi a échoué. Réessayez dans un instant.",
    ar: "فشل الإرسال. حاول مرة أخرى بعد قليل.",
  },
  "form.error.rateLimited": {
    en: "Too many attempts. Please wait a moment and try again.",
    fr: "Trop de tentatives. Patientez un peu avant de réessayer.",
    ar: "محاولات كثيرة. انتظر قليلًا قبل إعادة المحاولة.",
  },

  /* -------------------------------------------------- API error replies
   * Returned verbatim (in English) inside JSON by every /api route.     */
  "error.dateRequired": {
    en: "Please choose a valid date.",
    fr: "Veuillez choisir une date valide.",
    ar: "يرجى اختيار تاريخ صالح.",
  },
  "error.invalidDate": {
    en: "Please choose a valid date.",
    fr: "La date choisie n'est pas valide.",
    ar: "التاريخ المختار غير صالح.",
  },
  "error.datePast": {
    en: "This date is in the past. Please select a future date.",
    fr: "Cette date est dans le passé. Choisissez une date future.",
    ar: "هذا التاريخ في الماضي. اختر تاريخًا مستقبليًا.",
  },
  "error.dateTooFar": {
    en: "This date is too far ahead. Appointments can be booked up to 90 days in advance.",
    fr: "Cette date est trop éloignée. Les réservations sont possibles jusqu'à 90 jours.",
    ar: "هذا التاريخ بعيد جدًا. يمكن الحجز حتى 90 يومًا مسبقًا.",
  },
  "error.slotUnavailable": {
    en: "This time slot is no longer available. Please choose another one.",
    fr: "Ce créneau n'est plus disponible. Choisissez-en un autre.",
    ar: "هذا الموعد لم يعد متاحًا. اختر موعدًا آخر.",
  },
  "error.serviceNotFound": {
    en: "We could not find this treatment.",
    fr: "Ce soin est introuvable.",
    ar: "لم نتمكن من العثور على هذا العلاج.",
  },
  "error.doctorNotFound": {
    en: "We could not find this dentist.",
    fr: "Ce praticien est introuvable.",
    ar: "لم نتمكن من العثور على هذا الطبيب.",
  },
  "error.invalidPayload": {
    en: "Some of the information you sent is not valid.",
    fr: "Certaines informations envoyées ne sont pas valides.",
    ar: "بعض المعلومات المرسلة غير صالحة.",
  },
  "error.rateLimited": {
    en: "Too many requests. Please wait a moment and try again.",
    fr: "Trop de requêtes. Patientez un instant puis réessayez.",
    ar: "طلبات كثيرة. انتظر قليلًا ثم أعد المحاولة.",
  },
  "error.unauthorized": {
    en: "You do not have permission to do this.",
    fr: "Vous n'avez pas l'autorisation d'effectuer cette action.",
    ar: "ليس لديك صلاحية لتنفيذ هذا الإجراء.",
  },
  "error.notFound": {
    en: "We could not find what you were looking for.",
    fr: "Nous n'avons pas trouvé ce que vous cherchez.",
    ar: "لم نتمكن من العثور على ما تبحث عنه.",
  },
  "error.serverNotConfigured": {
    en: "The server is missing its Firebase configuration. Add FIREBASE_SERVICE_ACCOUNT_KEY in .env.local and restart.",
    fr: "La configuration Firebase du serveur est absente. Ajoutez FIREBASE_SERVICE_ACCOUNT_KEY dans .env.local puis redémarrez.",
    ar: "إعدادات Firebase على الخادم مفقودة. أضف FIREBASE_SERVICE_ACCOUNT_KEY في .env.local ثم أعد التشغيل.",
  },
  "error.rulesMissing": {
    en: "The database access rules are not deployed yet. Deploy firestore.rules (see README) and try again.",
    fr: "Les règles de sécurité Firestore ne sont pas encore actives : déployez firestore.rules (voir README) puis réessayez.",
    ar: "قواعد أمان Firestore غير مفعّلة بعد: انشر ملف firestore.rules (راجع README) ثم أعد المحاولة.",
  },
  "error.indexMissing": {
    en: "The database could not answer this request yet (a Firestore index is missing). Deploy firestore.indexes.json and try again.",
    fr: "La base de données ne peut pas encore répondre (un index Firestore manque). Déployez firestore.indexes.json puis réessayez.",
    ar: "لم تستطع قاعدة البيانات الرد بعد (ينقص فهرس Firestore). انشر firestore.indexes.json ثم أعد المحاولة.",
  },
  "error.internal": {
    en: "Something went wrong on our side. Please try again.",
    fr: "Une erreur est survenue côté serveur. Réessayez dans un instant.",
    ar: "حدث خطأ من جانبنا. حاول مرة أخرى بعد قليل.",
  },

  /* ------------------------------------------------------ empty states */
  "services.empty": {
    en: "No treatment is published yet.",
    fr: "Aucun soin publié pour le moment.",
    ar: "لا يوجد علاج منشور حاليًا.",
  },
  "home.doctors.empty": {
    en: "The dentist profiles will be published soon.",
    fr: "Les profils des praticiens seront publiés prochainement.",
    ar: "سيتم نشر ملفات الأطباء قريبًا.",
  },
  "booking.noSlot": {
    en: "No time slot is free on this day. Please try another date.",
    fr: "Aucun créneau libre ce jour. Essayez une autre date.",
    ar: "لا يوجد موعد فارغ في هذا اليوم. جرّب تاريخًا آخر.",
  },
  "track.notFound": {
    en: "No request matches these details.",
    fr: "Aucune demande ne correspond à ces informations.",
    ar: "لا يوجد طلب مطابق لهذه المعلومات.",
  },
  "admin.overview.noPending": {
    en: "No request is waiting for review.",
    fr: "Aucune demande en attente.",
    ar: "لا توجد طلبات معلقة.",
  },
  "admin.overview.noSessions": {
    en: "No session is scheduled.",
    fr: "Aucune séance planifiée.",
    ar: "لا توجد جلسات مخططة.",
  },
  "admin.overview.emptyToday": {
    en: "No appointment is scheduled for today.",
    fr: "Rendez-vous prévu aujourd'hui : aucun.",
    ar: "لا توجد مواعيد اليوم.",
  },
  "admin.appt.empty": {
    en: "No request matches this filter.",
    fr: "Aucune demande pour ce filtre.",
    ar: "لا طلب مطابق لهذا التصفية.",
  },
  "admin.doctors.empty": {
    en: "No dentist has been added yet.",
    fr: "Aucun praticien enregistré.",
    ar: "لا يوجد طبيب مسجّل.",
  },
  "admin.services.empty": {
    en: "No treatment has been added yet.",
    fr: "Aucun soin enregistré.",
    ar: "لا يوجد علاج مسجّل.",
  },
  "admin.patients.empty": {
    en: "No patient has been added yet.",
    fr: "Aucun patient enregistré.",
    ar: "لا يوجد مريض مسجّل.",
  },
  "admin.patients.noAppointments": {
    en: "No appointment.",
    fr: "Aucun rendez-vous.",
    ar: "لا مواعيد.",
  },
  "admin.treatments.empty": {
    en: "No treatment plan has been added yet.",
    fr: "Aucun plan de traitement.",
    ar: "لا توجد خطة علاج.",
  },
  "admin.treatments.selectPlan": {
    en: "Select a plan to see its sessions.",
    fr: "Sélectionnez un plan pour voir ses séances.",
    ar: "اختر خطة لعرض جلساتها.",
  },

  /* ------------------------------------------- admin: pages and toasts */
  "error.title": {
    en: "Something went wrong",
    fr: "Une erreur est survenue",
    ar: "حدث خطأ",
  },
  "error.text": {
    en: "Could not load this content. Please refresh the page.",
    fr: "Le contenu n'a pas pu être chargé. Réessayez plus tard.",
    ar: "تعذر تحميل المحتوى. حاول مرة أخرى لاحقًا.",
  },
  "error.loadFailed": {
    en: "Could not load the dashboard data. Please refresh the page.",
    fr: "Les données du tableau de bord n'ont pas pu être chargées. Rechargez la page.",
    ar: "تعذر تحميل بيانات لوحة القيادة. يرجى تحديث الصفحة.",
  },
  "error.saveFailed": {
    en: "Could not save your changes. Please try again.",
    fr: "Vos modifications n'ont pas pu être enregistrées. Réessayez.",
    ar: "تعذر حفظ التغييرات. حاول مرة أخرى.",
  },
  "admin.loginError": {
    en: "Wrong credentials, or this account is not authorized.",
    fr: "Identifiants incorrects ou compte non autorisé.",
    ar: "بيانات الدخول غير صحيحة أو الحساب غير مصرح له.",
  },
  "admin.unauthorized": {
    en: "You do not have access to this section.",
    fr: "Vous n'avez pas accès à cette section.",
    ar: "ليس لديك صلاحية الوصول إلى هذا القسم.",
  },
  "admin.serverNotConfigured": {
    en: "The Firebase server is not configured. Add the private FIREBASE_SERVICE_ACCOUNT_KEY variable and restart the server.",
    fr: "Serveur Firebase non configuré : ajoutez la variable privée FIREBASE_SERVICE_ACCOUNT_KEY puis redémarrez le serveur.",
    ar: "خادم Firebase غير مُعد: أضف المتغير الخاص FIREBASE_SERVICE_ACCOUNT_KEY ثم أعد تشغيل الخادم.",
  },
};

/** Texte anglais canonique (réponses API). */
export function msg(key, fallback = "Something went wrong. Please try again.") {
  return MESSAGES[key]?.en || fallback;
}

/** Traduit une clé de validation (« form.error.* ») en texte anglais. */
export function validationMessage(key) {
  return MESSAGES[key]?.en || msg("error.invalidPayload");
}

/** Copie FR / AR absorbée par le dictionnaire i18n. */
export const UI_MESSAGES = Object.fromEntries(
  Object.entries(MESSAGES).map(([key, entry]) => [
    key,
    { fr: entry.fr, ar: entry.ar },
  ])
);
