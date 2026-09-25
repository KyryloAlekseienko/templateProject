export interface Patron {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  homePhone: string;
  addressStreet: string;
  town: string;
  postcode: string;
  country: string;
}

export function createPatron(overrides: Partial<Patron> = {}): Patron {
  return {
    firstName: "Test",
    lastName: "Patron",
    email: `test${Date.now()}${Math.random().toString(36).slice(2, 8)}@example.net`,
    password: "test1234",
    homePhone: "123 456",
    addressStreet: "1 Station Road",
    town: "Wellington",
    postcode: "6011",
    country: "New Zealand",
    ...overrides,
  };
}
