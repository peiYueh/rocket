import { NLayout, NH2 } from "naive-ui";
import { defineComponent } from "vue";

export default defineComponent({
  render() {
    return (
      <NLayout position="absolute" class="h-full flex justify-center py-8">
        <NH2 class="text-red-500">Error 404</NH2>
      </NLayout>
    );
  },
});
