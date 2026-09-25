export const NETWORK_REQUESTS = {
  seatsNumSeats: /^https:\/\/zz\.patronbase\.com\/_ZZDemo\/Seats\/NumSeats\?/,
  sectionsChoose: /^https:\/\/zz\.patronbase\.com\/_ZZDemo\/Sections\/Choose\?/,
  seatsConfirm: /^https:\/\/zz\.patronbase\.com\/_ZZDemo\/Seats\/Confirm\?/,
  seatsBookTypes: /^https:\/\/zz\.patronbase\.com\/_ZZDemo\/Seats\/BookTypes$/,
  seatsAddToCart: /^https:\/\/zz\.patronbase\.com\/_ZZDemo\/Seats\/AddToCart$/,
  cartShow: /^https:\/\/zz\.patronbase\.com\/_ZZDemo\/Cart\/Show$/,
  cartCheckout: /^https:\/\/zz\.patronbase\.com\/_ZZDemo\/Cart\/Checkout$/,
  cartContactDetails: /^https:\/\/zz\.patronbase\.com\/_ZZDemo\/Cart\/ContactDetails$/,
  cartAddBookingProtect: /^https:\/\/zz\.patronbase\.com\/_ZZDemo\/Cart\/AddBookingProtect$/,
  cartTest3PartyRedirect: /^https:\/\/zz\.patronbase\.com\/_ZZDemo\/Cart\/Test3Party\/Redirect$/,
  cartTest3PartyExternalPage:
    /^https:\/\/zz\.patronbase\.com\/_ZZDemo\/Cart\/Test3Party\/ExternalPage\?/,
  cartTest3PartyReturn: /^https:\/\/zz\.patronbase\.com\/_ZZDemo\/Cart\/Test3Party\/Return$/,
  cartTest3PartyCompleteSale:
    /^https:\/\/zz\.patronbase\.com\/_ZZDemo\/Cart\/Test3Party\/CompleteSale\?/,
} as const;
