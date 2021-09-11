import { withModifiers, defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { NLayout, NH2, NInput, NIcon, NButton } from "naive-ui";
import { Rocket, User } from "@vicons/carbon";

export default defineComponent({
  name: "Boarding",
  setup() {
    const { push } = useRouter();
    const name = ref("");

    const updateName = (input: string) => (name.value = input);
    const goRocket = () => {
      if (name.value === "") {
        alert("Name cannot be empty");
        return;
      }
      push({ path: "/rocket", query: { name: name.value } });
    };

    return { updateName, goRocket };
  },
  render() {
    const { updateName, goRocket } = this;

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
        <NInput
          type="text"
          placeholder="Name"
          round
          v-slots={inputSlots}
          onUpdateValue={(input) => updateName(input)}
          onKeydown={(e) => e.key === "Enter" && goRocket()}
        />
        <NButton
          round
          size="small"
          v-slots={buttonSlots}
          class="mt-4"
          onClick={goRocket}
        >
          Let's Go
        </NButton>
      </NLayout>
    );
  },
});
