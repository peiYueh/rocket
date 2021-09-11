import { h, watch, ref, defineComponent, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import {
  useWebSocket,
  useDebounceFn,
  useIntervalFn,
  useTransition,
  onStartTyping,
  TransitionPresets,
} from "@vueuse/core";
import VueDanmu from "vue3-danmaku";
import {
  NProgress,
  NLayout,
  NButton,
  NInput,
  NSpin,
  NIcon,
  NTag,
  NH4,
  useNotification,
  useMessage,
} from "naive-ui";
import { Satellite } from "@vicons/carbon";
import { Stars } from "@/components";

import MEME1 from "@/assets/MEME1.png";
import MEME2 from "@/assets/MEME2.png";
import MEME3 from "@/assets/MEME3.png";
import MEME4 from "@/assets/MEME4.png";
import MEME5 from "@/assets/MEME5.png";
import MEME6 from "@/assets/MEME6.png";
import MEME7 from "@/assets/MEME7.png";
import RocketNotMoving from "@/assets/RocketNotMoving.png";
import RocketMoving1 from "@/assets/RocketMoving1.png";
import RocketMoving2 from "@/assets/RocketMoving2.png";
import RocketMoving3 from "@/assets/RocketMoving3.png";
import Moon from "@/assets/Moon.png";
import { ImageTransition, Message, SystemState } from "@/types";

const SERVER_URL = `${
  import.meta.env.PROD
    ? import.meta.env.VITE_PROD_SERVER_URL
    : import.meta.env.VITE_DEV_SERVER_URL
}`;
const TARGET_MESSAGE_THRESHOLD = 1000;
const ROCKET_MOVING = [RocketMoving1, RocketMoving2, RocketMoving3];
const MEMES = [MEME1, MEME2, MEME3, MEME4, MEME5, MEME6, MEME7];

const ERR_NOTIF = {
  title: "Opps, something went wrong",
  content: "Failed connecting to the server",
  meta: new Date().toLocaleString(),
  duration: 2000,
};

export default defineComponent({
  setup() {
    const notification = useNotification();
    const alert = useMessage();

    const input = ref<HTMLInputElement>();
    const message = ref("");
    const messages = ref<Message[]>([]);
    const connectedUsers = ref<string[]>([]);
    const rocket = ref(RocketNotMoving);
    const isLaunch = ref(false);
    const moonOpacity = ref(0);
    const rocketOpacity = ref(100);
    const usersOpacity = ref(100);
    const serverMessagesCount = ref(0);

    const { query } = useRoute();
    const { name } = query;

    const danmus = computed(() => [...messages.value]);
    const percentage = computed(() => {
      return (
        ((messages.value.length + serverMessagesCount.value) /
          TARGET_MESSAGE_THRESHOLD) *
        100
      );
    });

    watch(percentage, () => console.log(percentage.value));

    const moonOpacityTransition = useTransition(moonOpacity, {
      duration: 1500,
      transition: TransitionPresets.easeOutCubic,
    });

    const rocketOpacityTransition = useTransition(rocketOpacity, {
      duration: 1500,
      transition: TransitionPresets.easeOutCubic,
    });

    const usersOpacityTransition = useTransition(usersOpacity, {
      duration: 1500,
      transition: TransitionPresets.easeOutCubic,
    });

    const { status, data, send } = useWebSocket(`${SERVER_URL}/ws/${name}`, {
      onError: () => notification.error(ERR_NOTIF),
      autoReconnect: {
        retries: 100,
        delay: 2000,
        onFailed: () => notification.error(ERR_NOTIF),
      },
      heartbeat: { message: "heartbeat", interval: 10000 },
    });

    const { pause, resume } = useIntervalFn(
      () =>
        (rocket.value =
          ROCKET_MOVING[Math.floor(Math.random() * ROCKET_MOVING.length)]),
      500,
      { immediate: false }
    );

    const setMessage = useDebounceFn(
      (newMessage: string) => (message.value = newMessage),
      1000
    );

    const imageTransition = ({ moon, rocket, users }: ImageTransition) => {
      setTimeout(() => (moonOpacity.value = moon.opacity), moon.delayed);
      setTimeout(() => (rocketOpacity.value = rocket.opacity), rocket.delayed);
      setTimeout(() => (usersOpacity.value = users.opacity), users.delayed);
    };

    const triggerState = (state: SystemState) => {
      switch (state) {
        case "EARTH":
          isLaunch.value = false;
          pause();
          rocket.value = RocketNotMoving;
          imageTransition({
            moon: { opacity: 0, delayed: 0 },
            rocket: { opacity: 100, delayed: 0 },
            users: { opacity: 100, delayed: 0 },
          });
          break;
        case "PAUSED":
          isLaunch.value = false;
          pause();
          break;
        case "LAUNCHING":
          isLaunch.value = true;
          resume();
          imageTransition({
            moon: { opacity: 0, delayed: 0 },
            rocket: { opacity: 100, delayed: 0 },
            users: { opacity: 0, delayed: 0 },
          });
          break;
        case "ARRIVED":
          isLaunch.value = false;
          pause();
          imageTransition({
            moon: { opacity: 100, delayed: 0 },
            rocket: { opacity: 0, delayed: 0 },
            users: { opacity: 100, delayed: 1000 },
          });
          break;
      }
    };

    onStartTyping(() => input.value?.focus());

    // Listen on data returned from server
    watch(data, () => {
      if (!data.value) return;
      if (!messages.value) return;

      let res: any;

      try {
        res = JSON.parse(data.value);
      } catch (err) {
        return;
      }
      if (!res) return;

      if (res.type === "state") {
        triggerState(res.state);
        serverMessagesCount.value = res.messages_count;
        console.log(serverMessagesCount.value);
        return;
      }

      if (res.type === "announcement") {
        if (res.annoucement_type === "USER_JOINED")
          alert.success(res.message, {
            icon: () => h(NIcon, null, { default: () => h(Satellite) }),
          });
        else if (res.annoucement_type === "USER_LEFT")
          alert.warning(res.message, {
            icon: () => h(NIcon, null, { default: () => h(Satellite) }),
          });

        return;
      }

      if (res.type === "message") {
        messages.value.push(res);
        return;
      }

      if (res.type === "event" && res.event === "Launch") {
        triggerState("LAUNCHING");
        return;
      } else if (res.type === "event" && res.event === "Stop") {
        triggerState("PAUSED");
        return;
      } else if (res.type === "event" && res.event === "Reset") {
        triggerState("EARTH");
        return;
      } else if (res.type === "event" && res.event === "Arrived") {
        triggerState("ARRIVED");
        return;
      }

      if (res.type !== "event" || res.type !== "message") {
        connectedUsers.value = res;
        return;
      }
    });

    return {
      message,
      danmus,
      rocket,
      percentage,
      connectedUsers,
      name,
      status,
      moonOpacityTransition,
      rocketOpacityTransition,
      usersOpacityTransition,
      isLaunch,
      send,
      setMessage,
    };
  },
  render() {
    const {
      message,
      danmus,
      rocket,
      percentage,
      connectedUsers,
      name,
      status,
      moonOpacityTransition,
      rocketOpacityTransition,
      usersOpacityTransition,
      isLaunch,
      send,
      setMessage,
    } = this;

    const tagTypes = [
      "default",
      "success",
      "warning",
      "error",
      "info",
      "primary",
      undefined,
    ] as (
      | "default"
      | "error"
      | "info"
      | "success"
      | "warning"
      | "primary"
      | undefined
    )[];

    return (
      <NLayout position="absolute" class="relative">
        <NSpin
          show={status === "CONNECTING" || status === "CLOSED"}
          class="h-full flex justify-center items-center overflow-hidden"
        >
          <VueDanmu
            danmus={danmus}
            speeds={100}
            useSlot={true}
            style={{
              width: "100vw",
              height: "200px",
              display: "absolute",
              // top: "-320px",
            }}
            v-slots={{
              dm: ({
                danmu,
              }: {
                danmu: { type: string; username: string; message: string };
              }) => (
                <NTag
                  type={tagTypes[Math.floor(Math.random() * tagTypes.length)]}
                >
                  {danmu.username}: {danmu.message}
                </NTag>
              ),
            }}
          />
          <div class="absolute inset-0">
            <Stars count={50} animate={isLaunch} />
          </div>
          <div class="flex justify-center align-center">
            {isLaunch && (
              <NProgress
                type="line"
                status="success"
                percentage={percentage}
                showIndicator={false}
                class="absolute top-24"
                style={{ width: "80%" }}
              />
            )}
            <img
              src={Moon}
              class="object-contain w-full md:w-4/5 lg:w-2/5 absolute top-0"
              style={{ opacity: `${moonOpacityTransition}%` }}
            />
            <img
              src={rocket}
              class="w-60 mx-auto transform -translate-y-24 object-contain"
              style={{ opacity: `${rocketOpacityTransition}%` }}
            />
            <NH4 class="absolute bottom-24">Welcome onboard, {name}!</NH4>
            {/* <NText class="absolute top-24">{data}</NText>
            <NText class="absolute top-36">{connectedUsers}</NText> */}
            {connectedUsers.map((user) => (
              <img
                key={user}
                src={MEMES[Math.floor(Math.random() * MEMES.length)]}
                class="w-[100px] object-contain absolute -bottom-6"
                style={{
                  left: `${Math.floor(Math.random() * 80)}vw`,
                  opacity: `${usersOpacityTransition}%`,
                }}
              />
            ))}
            <NInput
              ref="input"
              type="text"
              placeholder="Your message..."
              round
              style="width: 300px;"
              class="absolute bottom-56"
              onUpdateValue={(input) => setMessage(input)}
              onKeydown={(e) => e.key === "Enter" && send(message)}
            />
            <NButton
              type="primary"
              class="absolute bottom-40"
              onClick={() => {
                if (message === "") return;

                send(message);
              }}
            >
              Send Message
            </NButton>
          </div>
        </NSpin>
      </NLayout>
    );
  },
});
