"use client";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import settingsReducer from "../reducers/settingsSlice";
import userReducer from "../reducers/userSlice";
import helpersReducer from "../reducers/helpersReducer";
import bookingDetailsReducer from "../reducers/bookingDetailsSlice";
import languageReducer from "../reducers/languageSlice";
import currencyReducer from "../reducers/currencySlice";

const persistConfig = {
  key: "e-stay",
  storage,
  // Settings come from the server prefetch / API each load. Persisting them makes
  // the client rehydrate a different mode than SSR and breaks header hydration.
  blacklist: ["settings"],
};

const rootReducer = combineReducers({
  settings: settingsReducer,
  user: userReducer,
  helpers: helpersReducer,
  bookingDetails: bookingDetailsReducer,
  language: languageReducer,
  currency: currencyReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
