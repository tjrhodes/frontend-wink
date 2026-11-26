/**
 * The Redux store: the current route, plus RTK Query's cache of Google Books answers.
 */
import { combineSlices, configureStore } from "@reduxjs/toolkit";
import { booksApi } from "../books/booksApi";
import { routeSlice } from "../routing/routeSlice";

const rootReducer = combineSlices(routeSlice, booksApi);

export const store = configureStore({
  reducer: rootReducer,
  // RTK Query's middleware handles caching, cancelling and refetching.
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(booksApi.middleware),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
