/**
 * Where the app starts: read the address, draw the first screen, and fade it in.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { Provider } from "react-redux";
import { App } from "./App";
import { store } from "./app/store";
import { revealScreen, startRouter } from "./routing/navigation";
import "./styles/app.css";

startRouter(store);

const root = createRoot(document.getElementById("root")!);
// Draw the first screen now, so the entrance animation has something to reveal.
flushSync(() =>
  root.render(
    <StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </StrictMode>,
  ),
);
void revealScreen({ isFirstScreen: true });
