/** Redux hooks that already know the shape of our store, so components get full types. */
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentRoute } from "../routing/routeSlice";
import type { AppDispatch, RootState } from "./store";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

/** The route on screen right now. */
export function useCurrentRoute() {
  return useAppSelector(selectCurrentRoute);
}
