import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

/* ───────── Resources ───────── */
const resources = {
  /* ───────────────── HE ───────────────── */
  he: {
    translation: {
      /* ─ Settings ─ */
      settings: "הגדרות",
      language: "שפה",
      hebrew: "עברית",
      english: "English",
      darkMode: "מצב חשוך",
      Back: "חזרה",

      /* ─ Common ─ */
      yes: "כן",
      no: "לא",
      cancel: "ביטול",
      delete: "מחק",
      completed: "הושלם",
      error: "שגיאה",

      /* ─ Home (user) ─ */
      welcomeTitle: "ברוכים הבאים לאגודת הסטודנטים",
      studentCard: "כרטיס סטודנט",
      upcomingEvents: "אירועים קרובים",
      inbox: "הודעות",
      forums: "פורומים",
      storesList: "רשימת חנויות",
      sendFeedback: "שליחת פידבק",

      /* ─ Feedback UI ─ */
      weValueFeedback: "אנחנו מעריכים את דעתך",
      letUsKnow: "ספר לנו מה אתה חושב או מציע.",
      feedbackPlaceholder: "כתוב כאן את המשוב...",
      sendFeedbackButton: "שלח משוב",

      collectGift: "איסוף מתנה",

      /* ─––––– Forums / New Forum ─–––– */
      createNewForum: "יצירת פורום חדש",
      "יצירת פורום חדש": "יצירת פורום חדש",
      forumTitleLabel: "כותרת פורום",
      "כותרת פורום": "כותרת פורום",
      "כותרת פורום *": "כותרת פורום *",
      enterTitle: "הכנס כותרת",
      chooseCategory: "בחר קטגוריה",
      categoryLabel: "קטגוריה",
      "קטגוריה": "קטגוריה",
      "קטגוריה *": "קטגוריה *",
      descriptionOptionalLabel: "תיאור (לא חובה)",
      enterDescription: "הכנס תיאור",
      saveForumButton: "שמור פורום",
      searchTitlePlaceholder: "חפש כותרת...",
      titleAndCategoryRequired: "חובה למלא כותרת וקטגוריה",
      noLoggedInUser: "אין משתמש מחובר",
      cannotSaveForum: "לא ניתן לשמור פורום",
      noMatchingForums: "אין פורומים תואמים",
      commentsLabel: "תגובות",
      Comments: "תגובות",
      writeCommentPlaceholder: "כתוב תגובה...",
      Publisher: "מפרסם",
      "Publisher:": "מפרסם:",
      Category: "קטגוריה",
      "Category:": "קטגוריה:",
      Unknown: "לא ידוע",
      IdoAgai: "עידו אגאי",

      /* ─ Home (admin) ─ */
      welcomeAdmin: "ברוך הבא אדמין יקר",
      feedback: "צפייה בפידבקים",
      forumApprove: "אישור פורום",
      forumPost: "פרסום בפורום",
      waveSettings: "צבעי הגלים",
      addCard: "הוסף כרטיס סטודנט",
      eventManagement: "ניהול אירועים",
      storeManagement: "ניהול חנויות",

      /* – NEW admin actions – */
      createGift: "יצירת מתנה",
      giftEligibility: "זכאות למתנה",
      uploadUsers: "העלאת משתמשים",
      uploadUsersExcel: "העלאת קובץ משתמשים (Excel)",

      /* ─ Events (generic) ─ */
      addToCalendar: "הוסף ליומן",
      noUpcomingEvents: "אין אירועים קרובים",
      noPermission: "אין הרשאה",
      needCalendarPermission: "יש לאשר גישה ליומן כדי להוסיף אירוע",
      eventAdded: "האירוע נוסף ליומן בהצלחה!",
      cannotAddEvent: "לא ניתן להוסיף את האירוע ליומן",

      /* ─ Open Events ─ */
      openEventsTitle: "אירועים פתוחים",
      noOpenEvents: "אין אירועים פתוחים",
      startLabel: "התחלה",
      endLabel: "סיום",
      studentParty: "מסיבת סטודנטים",
      interestingWorkshop: "סדנה מעניינת",
      stressReductionTopic: "בנושא הורדת לחץ ותפקוד יעיל",
      areYouSureDeleteEvent: "האם אתה בטוח שברצונך למחוק את האירוע?",

      /* ─ Feedback list / alerts ─ */
      usersFeedbackTitle: "משוב משתמשים",
      noFeedback: "אין משוב להצגה",
      enterFeedback: "אנא כתוב משוב.",
      sending: "שולח...",
      thankYou: "תודה!",
      feedbackSent: "המשוב הוגש בהצלחה.",
      feedbackFailed: "שליחת המשוב נכשלה.",

      /* ─ Gift Upload / Claim ─ */
      giftAddTitle: "הוסף מתנה חדשה",
      giftNameLabel: "שם המתנה",
      giftDescLabel: "תיאור",
      claimCodeLabel: "קוד איסוף:",
      alreadyClaimedGift2025: "כבר דרשת מתנה לשנת 2025!",
      pleaseLogin: "אנא התחבר",
      noGiftAvailable: "לא נמצאה מתנה זמינה",
      giftAvailable2025: "מתנה זמינה לשנת 2025",
      claimGiftButton: "דרוש מתנה",

      giftVerifyTitle: "אימות קבלת מתנה",
      giftEnterCodeLabel: "הזן קוד איסוף",
      giftEnterCodePH: "קוד איסוף",
      search: "חפש",
      scanQR: "סרוק QR",
      noCameraPerm: "אין הרשאת מצלמה",
      close: "סגור",
      userDetails: "פרטי משתמש",
      idLabel: "מזהה",
      codeLabel: "קוד",
      giftMarked: "המתנה סומנה כמחולקת!",
      giftAlreadyMarked: "המתנה כבר סומנה כמחולקת!",
      markDelivered: "סמן כמחולקת",
      giftCodeNotFound: "לא נמצא קוד כזה",
      somethingWentWrong: "אירעה שגיאה, נסה שוב",

      /* ─ Student Card ─ */
      changePhoto: "שינוי תמונה",
      studentCardHeading: "כרטיס סטודנט",
      studentNotFound: "לא נמצאו פרטי סטודנט",
      couldNotLoadStudent: "לא ניתן לטעון פרטי סטודנט",
      needGalleryAccess: "יש לאפשר גישה לגלריה",
      uploadError: "שגיאה בהעלאה",

      /* ─ Wave Settings ─ */
      wavePickHex: "בחר/הדבק קוד HEX לצבע הגלים:",
      save: "שמירה",

      /* ––– Add Event ––– */
      addEventTitle: "הוסף אירוע חדש",
      eventTitleLabel: "כותרת",
      eventTitlePlaceholder: "הכנס כותרת",
      eventDescLabel: "תיאור",
      eventDescPlaceholder: "הכנס תיאור",
      startDateLabel: "תאריך התחלה",
      startDatePlaceholder: "הכנס תאריך התחלה",
      endDateLabel: "תאריך סיום",
      endDatePlaceholder: "הכנס תאריך סיום",
      addressLabel: "כתובת",
      addressPlaceholder: "הכנס כתובת",
      maxAttendeesLabel: "מס' משתתפים מקסימלי",
      maxAttendeesPlaceholder: "הכנס מס' מקסימלי",
      currentAttendeesLabel: "מס' משתתפים נוכחי",
      currentAttendeesPlaceholder: "הכנס מס' נוכחי",
      priorityLabel: "עדיפות",
      priorityPlaceholder: "הכנס עדיפות",
      phoneLabel: "מספר טלפון",
      phonePlaceholder: "הכנס מספר טלפון",
      categoryLabelEvent: "קטגוריה",
      categoryPlaceholder: "הכנס קטגוריה",
      registrationRequiredLabel: "נדרש רישום",
      pictureLabel: "תמונה",
      noImageSelected: "לא נבחרה תמונה",
      pickImage: "בחר תמונה",
      addEventSubmit: "הוסף אירוע",
      eventTitleRequired: "יש למלא כותרת האירוע.",
      eventStartRequired: "יש למלא תאריך התחלה.",
      failedAddEvent: "נכשל בהוספת אירוע.",

      /* ──── Add Store ──── */
      addStoreTitle: "הוסף חנות חדשה",
      storeNameLabel: "שם החנות",
      storeNamePlaceholder: "הכנס שם חנות",
      descriptionLabel: "תיאור",
      descriptionPlaceholder: "הכנס תיאור",
      discountLabel: "הנחה",
      discountPlaceholder: "הכנס הנחה",
      addStoreSubmit: "הוסף חנות",
      storeNameRequired: "יש למלא שם חנות.",
      discountRequired: "יש למלא הנחה.",
      storeAddedSuccess: "החנות נוספה בהצלחה!",
      failedAddStore: "נכשל בהוספת חנות. נסה שוב.",

      /* ──── List Stores ──── */
      listStoresTitle: "רשימת חנויות",
      cannotLoadStores: "לא ניתן לטעון את החנויות",
      deleteStoreTitle: "מחק חנות",
      areYouSureDeleteStore: "האם אתה בטוח?",
      edit: "ערוך",

      "searchStore": "חפש חנות",
      "All": "הכל",

      /* קטגוריות + סטטוסים */
      "הכל": "הכל",
      "תוכנה": "תוכנה",
      "תעשייה וניהול": "תעשייה וניהול",
      "חומרים": "חומרים",
      "בניין": "בניין",
      "פארמה": "פארמה",
      "מדעי המחשב": "מדעי המחשב",
      "חשמל ואלקטרוניקה": "חשמל ואלקטרוניקה",
      "מכונות": "מכונות",
      "אחר": "אחר",
      "פעיל": "פעיל",
      "לא פעיל": "לא פעיל",

      /* local keys */
      "ימית 2000": "ימית 2000",
      "בורגרס בר לכולם": "בורגרס בר לכולם",
      "אגריפס": "אגריפס",
      "ישראל) השמן)": "ישראל) השמן)",
      "בר יוחאי": "בר יוחאי",
      "סדנה מעניינת": "סדנה מעניינת",
      "בנושא הורדת לחץ ותפקוד יעיל": "בנושא הורדת לחץ ותפקוד יעיל",
      "מסיבת סטודנטים": "מסיבת סטודנטים",
      "תיק": "תיק",
      "מתנות תחילת שנה": "מתנות תחילת שנה"
    }
  },

  /* ───────────────── EN ───────────────── */
  en: {
    translation: {
      /* ─ Settings ─ */
      settings: "Settings",
      language: "Language",
      hebrew: "Hebrew",
      english: "English",
      darkMode: "Dark Mode",
      Back: "Back",

      /* ─ Common ─ */
      yes: "Yes",
      no: "No",
      cancel: "Cancel",
      delete: "Delete",
      completed: "Completed",
      error: "Error",

      /* ─ Home (user) ─ */
      welcomeTitle: "Welcome Student!",
      studentCard: "Student Card",
      upcomingEvents: "Upcoming Events",
      inbox: "Inbox",
      forums: "Forums",
      storesList: "Stores List",
      sendFeedback: "Send Feedback",

      /* ─ Feedback UI ─ */
      weValueFeedback: "We Value Your Feedback",
      letUsKnow: "Let us know your thoughts or suggestions.",
      feedbackPlaceholder: "Type your feedback here...",
      sendFeedbackButton: "Send Feedback",

      collectGift: "Gift Collection",

      /* ─––––– Forums / New Forum ─–––– */
      createNewForum: "Create New Forum",
      "יצירת פורום חדש": "Create New Forum",
      forumTitleLabel: "Forum title",
      "כותרת פורום": "Forum title",
      "כותרת פורום *": "Forum title *",
      enterTitle: "Enter title",
      chooseCategory: "Choose category",
      categoryLabel: "Category",
      "קטגוריה": "Category",
      "קטגוריה *": "Category *",
      descriptionOptionalLabel: "Description (optional)",
      enterDescription: "Enter description",
      saveForumButton: "Save Forum",
      searchTitlePlaceholder: "Search title…",
      titleAndCategoryRequired: "Title and category are required",
      noLoggedInUser: "No logged-in user",
      cannotSaveForum: "Cannot save forum",
      noMatchingForums: "No matching forums",
      commentsLabel: "Comments",
      Comments: "Comments",
      writeCommentPlaceholder: "Write a comment…",
      Publisher: "Publisher",
      "Publisher:": "Publisher:",
      Category: "Category",
      "Category:": "Category:",
      Unknown: "Unknown",
      IdoAgai: "Ido Agai",

      /* ─ Home (admin) ─ */
      welcomeAdmin: "Welcome Admin!",
      feedback: "View Feedback",
      forumApprove: "Approve Forum",
      forumPost: "Post to Forum",
      waveSettings: "Wave Colors",
      addCard: "Add Student Card",
      eventManagement: "Manage Events",
      storeManagement: "Manage Stores",

      /* – NEW admin actions – */
      createGift: "Create Gift",
      giftEligibility: "Gift Eligibility",
      uploadUsers: "Upload Users",
      uploadUsersExcel: "Upload Users (Excel)",

      /* ─ Events (generic) ─ */
      addToCalendar: "Add to Calendar",
      noUpcomingEvents: "No upcoming events",
      noPermission: "No Permission",
      needCalendarPermission: "Calendar access is required to add event",
      eventAdded: "Event added to calendar!",
      cannotAddEvent: "Could not add event to calendar",

      /* ─ Open Events ─ */
      openEventsTitle: "Open Events",
      noOpenEvents: "No open events",
      startLabel: "Start",
      endLabel: "End",
      studentParty: "Student Party",
      interestingWorkshop: "Interesting Workshop",
      stressReductionTopic: "On stress reduction and efficient functioning",
      areYouSureDeleteEvent: "Are you sure you want to delete this event?",

      /* ─ Feedback list / alerts ─ */
      usersFeedbackTitle: "User Feedback",
      noFeedback: "No feedback to show",
      enterFeedback: "Please enter your feedback.",
      sending: "Sending...",
      thankYou: "Thank you!",
      feedbackSent: "Feedback sent successfully.",
      feedbackFailed: "Could not send feedback.",

      /* ─ Gift Upload / Claim ─ */
      giftAddTitle: "Add New Gift",
      giftNameLabel: "Gift name",
      giftDescLabel: "Description",
      claimCodeLabel: "Claim code:",
      alreadyClaimedGift2025: "You already claimed a gift for 2025!",
      pleaseLogin: "Please log in",
      noGiftAvailable: "No gift available",
      giftAvailable2025: "Gift available for 2025",
      claimGiftButton: "Claim Gift",

      /* ─ Gift Verification ─ */
      giftVerifyTitle: "Gift Claim Verification",
      giftEnterCodeLabel: "Enter claim code",
      giftEnterCodePH: "Claim code",
      search: "Search",
      scanQR: "Scan QR",
      noCameraPerm: "No camera permission",
      close: "Close",
      userDetails: "User Details",
      idLabel: "ID",
      codeLabel: "Code",
      giftMarked: "Gift marked as delivered!",
      giftAlreadyMarked: "Gift was already delivered!",
      markDelivered: "Mark as delivered",
      giftCodeNotFound: "No such code found",
      somethingWentWrong: "Something went wrong, please try again",

      /* ─ Student Card ─ */
      changePhoto: "Change Photo",
      studentCardHeading: "Student Card",
      studentNotFound: "Student data not found",
      couldNotLoadStudent: "Could not load student details",
      needGalleryAccess: "Gallery access is required",
      uploadError: "Upload error",

      /* ─ Wave Settings ─ */
      wavePickHex: "Paste HEX color for waves:",
      save: "Save",

      /* ––– Add Event ––– */
      addEventTitle: "Add New Event",
      eventTitleLabel: "Title",
      eventTitlePlaceholder: "Enter title",
      eventDescLabel: "Description",
      eventDescPlaceholder: "Enter description",
      startDateLabel: "Start Date",
      startDatePlaceholder: "Enter start date",
      endDateLabel: "End Date",
      endDatePlaceholder: "Enter end date",
      addressLabel: "Address",
      addressPlaceholder: "Enter address",
      maxAttendeesLabel: "Max Attendees",
      maxAttendeesPlaceholder: "Enter max attendees",
      currentAttendeesLabel: "Current Attendees",
      currentAttendeesPlaceholder: "Enter current attendees",
      priorityLabel: "Priority",
      priorityPlaceholder: "Enter priority",
      phoneLabel: "Phone Number",
      phonePlaceholder: "Enter phone number",
      categoryLabelEvent: "Category",
      categoryPlaceholder: "Enter category",
      registrationRequiredLabel: "Registration Required",
      pictureLabel: "Picture",
      noImageSelected: "No image selected",
      pickImage: "Pick an Image",
      addEventSubmit: "Add Event",
      eventTitleRequired: "Please enter a title.",
      eventStartRequired: "Please enter start date.",
      failedAddEvent: "Failed to add event.",

      /* ──── Add Store ──── */
      addStoreTitle: "Add New Store",
      storeNameLabel: "Store Name",
      storeNamePlaceholder: "Enter store name",
      descriptionLabel: "Description",
      descriptionPlaceholder: "Enter description",
      discountLabel: "Discount",
      discountPlaceholder: "Enter discount",
      addStoreSubmit: "Add Store",
      storeNameRequired: "Please enter the store name.",
      discountRequired: "Please enter the discount.",
      storeAddedSuccess: "Store added successfully!",
      failedAddStore: "Failed to add store. Please try again.",

      /* ──── List Stores ──── */
      listStoresTitle: "List of Stores",
      cannotLoadStores: "Could not load stores",
      deleteStoreTitle: "Delete Store",
      areYouSureDeleteStore: "Are you sure?",
      edit: "Edit",

      /* Categories & status */
      "פנאי": "Leisure",
      "אוכל": "Food",
      "הכל": "All",
      "תוכנה": "Software",
      "תעשייה וניהול": "Industrial Engineering & Management",
      "חומרים": "Materials",
      "בניין": "Civil Engineering",
      "פארמה": "Pharma",
      "מדעי המחשב": "Computer Science",
      "חשמל ואלקטרוניקה": "Electrical & Electronics",
      "מכונות": "Mechanical",
      "אחר": "Other",
      "פעיל": "Active",
      "לא פעיל": "Inactive",

      /* Local keys */
      "searchStore": "Find a store",
      "ימית 2000": "Yamit 2000",
      "בורגרס בר לכולם": "Burgers Bar for Everyone",
      "אגריפס": "Agripas",
      "ישראל) השמן)": "(Israel) The Fat",
      "בר יוחאי": "Bar Yochai",
      "סדנה מעניינת": "Interesting Workshop",
      "בנושא הורדת לחץ ותפקוד יעיל": "On stress reduction and efficient functioning",
      "מסיבת סטודנטים": "Student Party",
      "תיק": "Bag",
      "מתנות תחילת שנה": "New Year's gifts",

      // Example descriptions (add more as needed)
      "סטודנטים יקרים, יצרנו שותפות חדשה עם החנות בברגרס בר. ממליצים!!":
        "Dear students, we have made a new partnership with the store at Burgers Bar. Recommend!!",
      "הנחה גדולה ומפנקת לסטודנטים":
        "A great and luxurious discount for students"
    }
  }
};

/* ─────────────────────────── */
i18n.use(initReactI18next).init({
  resources,
  lng: "he",
  fallbackLng: "he",
  interpolation: { escapeValue: false }
});

const deviceLang = Localization.getLocales()[0]?.languageCode?.split("-")[0];
if (deviceLang && ["he","en"].includes(deviceLang)) {
  i18n.changeLanguage(deviceLang);
}

export default i18n;