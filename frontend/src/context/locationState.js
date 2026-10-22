import { createContext, useContext } from "react";
// Context primitives are independent of presentation, avoiding provider/component cycles.
export const Context = createContext();
export const useLocationChoice = () => useContext(Context);
