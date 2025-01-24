import {
  PUSHER_APP_ID,
  PUSHER_CLUSTER,
  PUSHER_KEY,
  PUSHER_SECRET,
} from "@/keys";
import PusherServer from "pusher";
import Pusher from "pusher-js";

export const pusherServer = new PusherServer({
  appId: PUSHER_APP_ID,
  key: PUSHER_KEY,
  secret: PUSHER_SECRET,
  cluster: PUSHER_CLUSTER,
});

export const pusherClient = new Pusher(PUSHER_KEY, {
  cluster: PUSHER_CLUSTER,
  auth: {
    headers: {
      "Content-Type": "application/json",
    },
  },
});
