// app/utils/translate.ts
/* ----------------------------------------------------------------
   מילון עברית → אנגלית  (אפשר להרחיב חופשי בהמשך)
----------------------------------------------------------------- */
export const HE_EN: Record<string, string> = {
  /* 🖥️ - UI כלליות */
  storesList: "Stores List",
  searchStore: "Search store…",
  all: "All",
  noStores: "No stores found",
  addToCalendar: "Add to Calendar",
  noUpcomingEvents: "No upcoming events",

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

  /* 🎉 - אירועים לדוגמה (אפשר להוסיף) */
  "מסיבת סטודנטים": "Student Party",
  "ישראל ישראלה": "Israel Israelah",
  "ממש פה": "Right here",
  "אוניברסיטת אריאל": "Ariel University",
};

/* ----------------------------------------------------------------
   פונקציית תרגום קצרה
   - אם השפה אנגלית ובמילון – מחזירה תרגום,
   - אחרת מחזירה את הטקסט המקורי.
----------------------------------------------------------------- */
export const tr = (txt: string, lang: string) =>
  lang === "en" ? HE_EN[txt] ?? txt : txt;
export default () => null;