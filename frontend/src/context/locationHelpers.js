export const locationLabel = (l) =>
  l ? (l.city ? `${l.city}, ${l.abbr}` : l.name) : "Choose your city";
