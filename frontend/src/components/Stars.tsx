import { defineComponent } from "vue";

export const Stars = defineComponent({
  props: {
    count: { type: Number, required: true },
    animate: { type: Boolean, default: false },
  },
  render() {
    const { count, animate } = this;

    return (
      <>
        {[...Array(count).keys()].map((c) => {
          const x = Math.floor(Math.random() * window.innerWidth);
          const y = Math.floor(Math.random() * window.innerHeight);
          const h = Math.floor(Math.random() * 100);
          const duration = Math.random() * 1;

          return (
            <div
              key={c}
              style={{
                left: `${x}px`,
                width: `${1}px`,
                height: `${h}px`,
                animation: animate ? "animateStars linear infinite" : "",
                animationDuration: `${duration}s`,
                transform: `translateY(${y}px)`,
              }}
              class="absolute bg-white opacity-50"
            />
          );
        })}
      </>
    );
  },
});
