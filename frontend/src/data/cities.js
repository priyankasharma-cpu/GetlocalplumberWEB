import cityDataUrl from "./cities.json?url";
let pending;
export function loadCities() {
  pending ??= fetch(cityDataUrl)
    .then((r) => {
      if (!r.ok) throw new Error("City directory unavailable");
      return r.json();
    })
    .catch((error) => {
      pending = null;
      throw error;
    });
  return pending;
}
