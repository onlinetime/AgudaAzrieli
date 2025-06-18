// libs/utils/translate.ts
import i18n from "../../internationalization/internationalization";

/**
 * מילון תרגום עברית → אנגלית
 */
export const HE_EN: Record<string, string> = {
  /* 🖥️ - UI כלליות */
  storesList: "Stores List",
  searchStore: "Search store…",
  all: "All",
  noStores: "No stores found",
  addToCalendar: "Add to Calendar",
  noUpcomingEvents: "No upcoming events",
  "איסוף מתנה": "Gift Collection",


  

  /* 🛑 - הודעות ו-Alert-ים */
  "אין הרשאה": "No permission",
  "לא ניתן להוסיף ליומן ללא הרשאה":
    "Cannot add to calendar without permission",
  הושלם: "Done",
  "האירוע נוסף ליומן בהצלחה!": "Event added to calendar successfully!",
  שגיאה: "Error",
  "לא ניתן להוסיף את האירוע ליומן":
    "Could not add the event to the calendar",

  /* 🗂️ - קטגוריות חנויות */
  אוכל: "Food",
  פנאי: "Leisure",

  /* 🏪 - שמות חנויות */
  "ימית 2000": "Yamit 2000",
  "בורגרס בר": "Burgers Bar",
  "(ישראל) השמן": "Shipudei Hamen",

  /* 📝 - תיאורי חנויות */
  'סטודנטים יקרים, עשינו שת"פ חדש עם החנות בורגרסבר ממליצים!!':
    "Dear students – new collab with Burgers Bar!!",
  "הנחה שווה ומפנקת לסטודנטים": "Great student discount",

  /* 🎉 - אירועים לדוגמה */
  "מסיבת סטודנטים": "Student Party",
  "ישראל ישראלה": "Israel Israelah",
  "ממש פה": "Right here",
  "אוניברסיטת אריאל": "Ariel University",

  /* ✨ - מפתחות חדשים שהוספנו */
  "אימות קבלת מתנה": "Verify Gift Receipt",
  "חפש": "Search",
  "סרוק QR": "Scan QR",
  "קוד איסוף": "Claim Code",
};

/**
 * פונקצית תרגום:
 * אם השפה הנוכחית היא אנגלית – תחזיר תרגום מהמילון (או את המקורי אם לא נמצא),
 * אחרת תחזיר את הטקסט המקורי.
 */
export function tr(txt: string): string {
  return i18n.language === "en" ? HE_EN[txt] ?? txt : txt;
}
