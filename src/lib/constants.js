/** Constantes partagées côté client et serveur. */

export const COLLECTIONS = {
  USERS: "users",
  DOCTORS: "doctors",
  SERVICES: "services",
  APPOINTMENTS: "appointments",
  TREATMENT_PLANS: "treatmentPlans",
  TREATMENT_SESSIONS: "treatmentSessions",
  CLINIC_SETTINGS: "clinicSettings",
  BLOCKED_SLOTS: "blockedSlots",
  SLOT_LOCKS: "slotLocks",
  APPOINTMENT_REFERENCES: "appointmentReferences",
  CONTACT_MESSAGES: "contactMessages",
};

/** Statuts des demandes de rendez-vous. */
export const APPOINTMENT_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
  COMPLETED: "completed",
  MISSED: "missed",
};

export const APPOINTMENT_STATUSES = Object.values(APPOINTMENT_STATUS);

/** Statuts qui occupent encore un créneau. */
export const BLOCKING_STATUSES = [
  APPOINTMENT_STATUS.PENDING,
  APPOINTMENT_STATUS.CONFIRMED,
];

/** Statuts visibles côté patient via le numéro de référence. */
export const PATIENT_VISIBLE_STATUSES = [
  APPOINTMENT_STATUS.PENDING,
  APPOINTMENT_STATUS.CONFIRMED,
  APPOINTMENT_STATUS.REJECTED,
  APPOINTMENT_STATUS.CANCELLED,
  APPOINTMENT_STATUS.EXPIRED,
];

/** Statuts des séances d'un plan de traitement. */
export const SESSION_STATUS = {
  PLANNED: "planned",
  SCHEDULED: "scheduled",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  MISSED: "missed",
};

export const SESSION_STATUSES = Object.values(SESSION_STATUS);

export const ROLES = {
  ADMIN: "admin",
  DOCTOR: "doctor",
  PATIENT: "patient",
};

export const STAFF_ROLES = [ROLES.ADMIN, ROLES.DOCTOR];

export const DEFAULT_TIMEZONE = "Africa/Casablanca";

export const PHONE_DISPLAY = "+212659349160";
export const PHONE_LINK = "tel:+212659349160";
export const EMAIL_LINK = "mailto:ilyassdr60@gmail.com";

/** Durée pendant laquelle une demande bloquante occupe un créneau (sec). */
export const DEFAULT_PENDING_HOLD_HOURS = 48;
export const DEFAULT_MAX_ADVANCE_DAYS = 90;
export const DEFAULT_SLOT_STEP_MINUTES = 30;
export const DEFAULT_MIN_NOTICE_MINUTES = 60;

/** Longueur maximale d'un message de contact. */
export const CONTACT_MAX_LEN = 1500;
