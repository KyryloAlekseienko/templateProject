export class AppRoutes {
  static readonly productions = "/_ZZDemo/Productions";
  static readonly patronRegister = "/_ZZDemo/Patron/Register";
  static readonly checkout = "/_ZZDemo/Cart/Checkout";
  static adminSettings(orgId: string, section: string): string {
    return `/${orgId}/Admin/Settings/${section}`;
  }
  static performances(prodId: string): string {
    return `/_ZZDemo/Productions/${prodId}/Performances`;
  }
  static test3PartyExternalPage(saleId: string): string {
    return `/_ZZDemo/Cart/Test3Party/ExternalPage?sale_id=${saleId}`;
  }
  static test3PartyCompleteSalePage(saleId: string): string {
    return `/_ZZDemo/Cart/Test3Party/CompleteSale?sale_id=${saleId}`;
  }

  static readonly adminHQLogin = "/Admin/HQ/Login";
  static readonly adminHQTokensValidate = "/Admin/HQ/Tokens/Validate";
  static readonly adminHQList = "/Admin/HQ/List";
  static readonly adminHQLicensing = "/Admin/HQ/Licensing";
  static readonly adminHQCC = "/Admin/HQ/CC";
}
