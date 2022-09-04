interface StockBar {
  type: string;
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  time: number;
  tradeCount: number;
  vwap: number;
};

const app = {
  data() {
    // Websocket construction
    const url = new URL("/stocks/data/bars", document.location.href);
    url.protocol = "ws:"
    const ws = new WebSocket(url);
    ws.onopen = (ev: Event) => {
      console.log("websocket opened");
    };
    ws.onmessage = (ev: MessageEvent<any>) => {
      const json = JSON.parse(ev.data);
      if (json.type === undefined) {
        return;
      }
      if (json.type == "b") {
        this.bars.push(json);
        return;
      }
    };
    ws.onerror = (err: Event) => {
      console.log(err);
    };
    ws.onclose = (ev: CloseEvent) => {
      console.log("closed", this.bars.length);
    };

    return {
      ws: ws,
      bars: [],
    }
  },
  
  methods: {
    close() {
      this.ws.close();
    }
  },
};

export { app };
