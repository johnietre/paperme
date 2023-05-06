interface Message {
  action: string;
};

type OrderSide = "buy" | "sell";

interface Order {
  symbol: string;
  side: OrderSide;
  price: number;
  size: number;
};

const app = {
  data() {
    // Create WebSocket
    const url = new URL("/ws", document.location.href); url.protocol = "ws";
    const ws = new WebSocket(url);
    ws.onopen = this.openHandler;
    ws.onmessage = this.msgHandler;
    ws.onerror = this.errHandler;
    ws.onclose = this.closeHandler;

    return {
      order: newOrder(),
      searchSym: "",
      positions: [],
      ws: ws,
    };
  },

  methods: {
    submitSymSearch() {
      if (this.searchSym == "")
        return;
      this.order.symbol = this.searchSym;
    },

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

function newOrder(): Order {
  return { symbol: "", side: "buy", price: 0.0, size: 0 };
}

export { app };
