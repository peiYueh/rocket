export type SystemState = "EARTH" | "PAUSED" | "LAUNCHING" | "ARRIVED";

export type Message = {
  type: string;
  username: string;
  message: string;
  sent_by: string;
};

export type ImageTransitionProps = { opacity: number; delayed: number };

export type ImageTransition = {
  moon: ImageTransitionProps;
  rocket: ImageTransitionProps;
  users: ImageTransitionProps;
};
