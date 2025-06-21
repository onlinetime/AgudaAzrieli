// internationalization/internationalization.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

const resources = {
  he: {
    translation: {
      /* ── Settings ── */
      settings: "הגדרות",
      language: "שפה",
      hebrew: "עברית",
      english: "English",
      darkMode: "מצב חשוך",

      /* ── Home (user) ── */
      welcomeTitle: "ברוכים הבאים לאגודת הסטודנטים",
      studentCard: "כרטיס סטודנט",
      upcomingEvents: "אירועים קרובים",
      inbox: "הודעות",
      forums: "פורומים",
      storesList: "רשימת חנויות",
      sendFeedback: "שליחת פידבק",
      collectGift: "איסוף מתנה",

      /* ── Home (admin) ── */
      welcomeAdmin: "ברוך הבא אדמין יקר",
      feedback: "צפייה בפידבקים",
      forumApprove: "אישור פורום",      // ⬅︎ שינוי שם
      addCard: "הוסף כרטיס סטודנט",
      eventManagement: "ניהול אירועים",
      storeManagement: "ניהול חנויות",

      /* --- NEW admin actions --- */
      createGift: "יצירת מתנה",
      giftEligibility: "זכאות למתנה",
      uploadUsers: "העלאת משתמשים",

      /* ── Events ── */
      addToCalendar: "הוסף ליומן",
      noUpcomingEvents: "אין אירועים קרובים",
      noPermission: "אין הרשאה",
      needCalendarPermission: "יש לאשר גישה ליומן כדי להוסיף אירוע",
      completed: "הושלם",
      eventAdded: "האירוע נוסף ליומן בהצלחה!",
      error: "שגיאה",
      cannotAddEvent: "לא ניתן להוסיף את האירוע ליומן",

      /* ── Stores ── */
      searchStore: "חפש חנות...",
      all: "הכול",
      noStoresFound: "לא נמצאו חנויות",

      /* ── Feedback ── */
      weValueFeedback: "אנחנו מעריכים את דעתך",
      letUsKnow: "ספר לנו מה אתה חושב או מציע.",
      feedbackPlaceholder: "כתוב כאן את המשוב...",
      enterFeedback: "אנא כתוב משוב.",
      sending: "שולח...",
      thankYou: "תודה!",
      feedbackSent: "המשוב הוגש בהצלחה.",
      feedbackFailed: "שליחת המשוב נכשלה.",
    },
  },

  en: {
    translation: {
      /* ── Settings ── */
      settings: "Settings",
      language: "Language",
      hebrew: "Hebrew",
      english: "English",
      darkMode: "Dark Mode",

      /* ── Home (user) ── */
      welcomeTitle: "Welcome Student!",
      studentCard: "Student Card",
      upcomingEvents: "Upcoming Events",
      inbox: "Inbox",
      forums: "Forums",
      storesList: "Stores List",
      sendFeedback: "Send Feedback",
      collectGift: "Gift Collection",

      /* ── Home (admin) ── */
      welcomeAdmin: "Welcome, Admin!",
      feedback: "View Feedback",
      forumApprove: "Forum Approval",    // ⬅︎ שינוי שם
      addCard: "Add Student Card",
      eventManagement: "Event Management",
      storeManagement: "Store Management",

      /* --- NEW admin actions --- */
      createGift: "Create Gift",
      giftEligibility: "Gift Eligibility",
      uploadUsers: "Upload Users",

      /* ── Events ── */
      addToCalendar: "Add to Calendar",
      noUpcomingEvents: "No upcoming events",
      noPermission: "No Permission",
      needCalendarPermission: "Calendar access is required to add event",
      completed: "Completed",
      eventAdded: "Event added to calendar!",
      error: "Error",
      cannotAddEvent: "Could not add event to calendar",

      /* ── Stores ── */
      searchStore: "Search store...",
      all: "All",
      noStoresFound: "No stores found",

      /* ── Feedback ── */
      weValueFeedback: "We Value Your Feedback",
      letUsKnow: "Let us know your thoughts or suggestions.",
      feedbackPlaceholder: "Type your feedback here...",
      enterFeedback: "Please enter your feedback.",
      sending: "Sending...",
      thankYou: "Thank you!",
      feedbackSent: "Feedback sent successfully.",
      feedbackFailed: "Could not send feedback.",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "he",
  fallbackLng: "he",
  interpolation: { escapeValue: false },
});

const deviceLang = Localization.locale.split("-")[0];
if (["he", "en"].includes(deviceLang)) i18n.changeLanguage(deviceLang);

export default i18n;