import { defineComponent } from "vue";
import { darkTheme, NConfigProvider, NThemeEditor } from "naive-ui";
import { Boarding } from "@/components";

import "virtual:windi.css";

// General Font
import "vfonts/Inter.css";
// Monospace Font
import "vfonts/FiraCode.css";

export default defineComponent({
  name: "App",
  setup() {
    return () => (
      <NConfigProvider theme={darkTheme}>
        <NThemeEditor>
          <Boarding />
        </NThemeEditor>
      </NConfigProvider>
    );
  },
});
