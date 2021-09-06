import { defineComponent } from "vue";
import { Provider, Viewer } from "@/components";

import "virtual:windi.css";
import "@/styles/global.css";

// General Font
import "vfonts/Inter.css";
// Monospace Font
import "vfonts/FiraCode.css";

export default defineComponent({
  name: "App",
  setup() {},
  render() {
    return (
      <Provider>
        <Viewer />
      </Provider>
    );
  },
});
