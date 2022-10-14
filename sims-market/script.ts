class Message {
  action: string;

  constructor() {
  }
  
  toJSON() {
    return {
      action: //
    };
  }
};

const app = {
  data() {
    const url = new URL("/ws", document.location.origin); url.protocol = "ws";
    const ws = new WebSocket(url);
    ws.onopen = this.openHandler;
    ws.onmessage = this.msgHandler;
    ws.onerror = this.errHandler;
    ws.onclose = this.closeHandler;
    return {
      ws: ws,
    };
  },

  methods: {
    msgHandler(ev: MessageEvent<any>) {
      console.log("message received");
    },

    openHandler(ev: Event) {
      console.log("websocket opened");
    },

    errHandler(ev: Event) {
      console.log("websocket error occurred:", ev);
    },

    closeHandler(ev: CloseEvent) {
      console.log("websocket closed:", ev);
    },
  },
};

export app;
