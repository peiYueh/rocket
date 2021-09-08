import {
  NConfigProvider,
  NLoadingBarProvider,
  NNotificationProvider,
  darkTheme,
} from "naive-ui";
import { defineComponent } from "vue";

export const Provider = defineComponent({
  setup(_, { slots }) {
    return { slots };
  },
  render() {
    const { slots } = this;

    return (
      <NConfigProvider theme={darkTheme}>
        <NLoadingBarProvider>
          <NNotificationProvider>
            {slots.default && slots.default()}
          </NNotificationProvider>
        </NLoadingBarProvider>
      </NConfigProvider>
    );
  },
});
