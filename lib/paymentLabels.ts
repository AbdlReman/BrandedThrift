/** Labels for stored payment method codes (orders, emails, admin). */
export function paymentMethodLabel(code: string): string {
  switch ((code || "").toLowerCase()) {
    case "easypaisa":
      return "EasyPaisa";
    case "jazzcash":
      return "JazzCash";
    case "mcbislamic":
      return "MCB Islamic Bank";
    case "cod":
      return "Cash on Delivery";
    case "sadapay":
      return "Sada Pay";
    case "meezan":
      return "Meezan Bank";
    default:
      return (code || "").trim() || "—";
  }
}
