import { defineComponent } from "vue";
import { RouterView } from "vue-router";
import { darkTheme, NConfigProvider, NThemeEditor } from "naive-ui";

import "virtual:windi.css";
import "@/styles/global.css";

// General Font
import "vfonts/Inter.css";
// Monospace Font
import "vfonts/FiraCode.css";

export default defineComponent({
  name: "App",
  setup() {
    return () => (
      <NConfigProvider theme={darkTheme}>
        {import.meta.env.DEV ? (
          <NThemeEditor>
            <RouterView />
          </NThemeEditor>
        ) : (
          <RouterView />
        )}
      </NConfigProvider>
    );
  },
});
