import { NConfigProvider, NLoadingBarProvider, darkTheme } from "naive-ui";
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
          {slots.default && slots.default()}
        </NLoadingBarProvider>
      </NConfigProvider>
    );
  },
});
