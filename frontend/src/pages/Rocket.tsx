import { defineComponent } from "vue";
import { useRoute } from "vue-router";
import { NLayout, NH4 } from "naive-ui";
import { Stars } from "@/components";

export default defineComponent({
  setup() {
    const { query } = useRoute();
    const { name } = query;

    return { name };
  },
  render() {
    const { name } = this;

    return (
      <NLayout position="absolute">
        <Stars count={50} />
        <div class="flex justify-center items-center h-full">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Cartoon_space_rocket.png/626px-Cartoon_space_rocket.png"
            class="w-60 mx-auto transform -rotate-45"
          />
          <NH4 class="absolute bottom-24">Welcome onboard, {name}!</NH4>
        </div>
      </NLayout>
    );
  },
});
