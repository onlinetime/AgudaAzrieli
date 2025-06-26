export const clean = (s: string) =>
  s
    .replace(/[\u200E\u200F\u202A-\u202E]/g, "") // bidi marks
    .replace(/\u00A0/g, " ")                    // NBSP
    .replace(/\s+/g, " ")                       // collapse spaces
    .trim();
export default () => null;