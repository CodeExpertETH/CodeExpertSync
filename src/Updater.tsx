import { createSignal } from "solid-js";
import "./App.css";
import { listen } from "@tauri-apps/api/event";

function Updater() {
  const [getValue, setValue] = createSignal("");

  listen("tauri://update-status", function (res) {
    console.log(res);
    setValue(JSON.stringify(res.payload));
  });
  return (
    <div class="container">
      <h1>Update status</h1>

      <div class="row">{getValue()}</div>
    </div>
  );
}

export default Updater;
