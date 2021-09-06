import { defineComponent } from "vue";
import { NLayout } from "naive-ui";
import { Stars } from "@/components";

export default defineComponent({
  render() {
    return (
      <NLayout position="absolute">
        <Stars count={50} />
      </NLayout>
    );
  },
});
