import { useLoadingBar } from "naive-ui";
import { defineComponent } from "vue";
import { RouterView, useRouter } from "vue-router";

export const Viewer = defineComponent({
  setup() {
    const loadingBar = useLoadingBar();
    const router = useRouter();

    router.beforeEach(() => loadingBar.start());
    router.afterEach(() => loadingBar.finish());
    router.onError(() => loadingBar.error());
  },
  render() {
    return <RouterView />;
  },
});
