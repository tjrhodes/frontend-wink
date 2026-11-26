import { useEffect } from "react";
import { APP_NAME } from "../config";

/** Sets the browser tab's title, e.g. "Dune · Book Search", or just the app name. */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
  }, [title]);
}
