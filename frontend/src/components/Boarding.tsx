import { defineComponent } from "vue";
import { NLayout, NH2, NInput, NIcon, NButton } from "naive-ui";
import { Rocket, User } from "@vicons/carbon";

export const Boarding = defineComponent({
  setup() {},
  render() {
    const inputSlots = {
      prefix: () => (
        <NIcon>
          <User />
        </NIcon>
      ),
    };

    const buttonSlots = {
      icon: () => (
        <NIcon size="medium">
          <Rocket />
        </NIcon>
      ),
    };

    return (
      <NLayout
        position="absolute"
        class="flex flex-col justify-center items-center"
        contentStyle={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <NH2 class="mb-3">Enter your name to enter</NH2>
        <NInput placeholder="Name" round v-slots={inputSlots} />
        <NButton round size="small" v-slots={buttonSlots} class="mt-4">
          Let's Go
        </NButton>
      </NLayout>
    );
  },
});
