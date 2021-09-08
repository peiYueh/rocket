import { watch, ref, defineComponent } from "vue";
import { useRoute } from "vue-router";
import { useWebSocket } from "@vueuse/core";
import {
  NLayout,
  NButton,
  NInput,
  NSpin,
  NText,
  NH4,
  useNotification,
} from "naive-ui";
import { Stars } from "@/components";

const SERVER_URL = "ws://localhost:8000";

export default defineComponent({
  setup() {
    const notification = useNotification();

    const message = ref("");

    const { query } = useRoute();
    const { name } = query;

    const errorNotif = {
      title: "Opps, something went wrong",
      content: "Failed connecting to the server",
      meta: new Date().toLocaleString(),
      duration: 2000,
    };

    const { status, data, send } = useWebSocket(`${SERVER_URL}/ws/${name}`, {
      onError: () => notification.error(errorNotif),
      autoReconnect: {
        retries: 3,
        delay: 2000,
        onFailed: () => notification.error(errorNotif),
      },
      heartbeat: { message: "heartbeat", interval: 10000 },
    });

    watch(data, () => console.log(data.value));

    const setMessage = (newMessage: string) => (message.value = newMessage);

    return { message, name, status, data, send, setMessage };
  },
  render() {
    const { message, name, status, data, send, setMessage } = this;

    return (
      <NLayout position="absolute">
        <NSpin
          show={status === "CONNECTING" || status === "CLOSED"}
          class="h-full flex justify-center items-center overflow-y-hidden"
        >
          <div class="absolute inset-0">
            <Stars count={50} animate />
          </div>
          <div class="flex justify-center align-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Cartoon_space_rocket.png/626px-Cartoon_space_rocket.png"
              class="w-60 mx-auto transform -rotate-45"
            />
            <NH4 class="absolute bottom-24">Welcome onboard, {name}!</NH4>
            <NText class="absolute top-24">{data}</NText>
            <NInput
              type="text"
              placeholder="Name"
              round
              style="width: 300px;"
              class="absolute bottom-56"
              onUpdateValue={(input) => setMessage(input)}
            />
            <NButton
              type="primary"
              class="absolute bottom-40"
              onClick={() => send(message)}
            >
              Send Message
            </NButton>
          </div>
        </NSpin>
      </NLayout>
    );
  },
});
