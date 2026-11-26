/**
 * The route the app is showing right now, kept in Redux so any component can read it.
 * Only the router (navigation.ts) changes it, always from the address bar.
 */
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { emptySearchRoute, type Route } from "./routes";

export const routeSlice = createSlice({
  name: "route",
  initialState: { current: emptySearchRoute() as Route },
  reducers: {
    routeChanged(state, action: PayloadAction<Route>) {
      state.current = action.payload;
    },
  },
  selectors: {
    selectCurrentRoute: (state) => state.current,
  },
});

export const { routeChanged } = routeSlice.actions;
export const { selectCurrentRoute } = routeSlice.selectors;
