;
const app = {
    data() {
        // Websocket construction
        const url = new URL("/stocks/data/bars", document.location.href);
        url.protocol = "ws:";
        const ws = new WebSocket(url);
        ws.onopen = (ev) => {
            console.log("websocket opened");
        };
        ws.onmessage = (ev) => {
            const json = JSON.parse(ev.data);
            if (json.type === undefined) {
                return;
            }
            if (json.type == "b") {
                this.bars.push(json);
                return;
            }
        };
        ws.onerror = (err) => {
            console.log(err);
        };
        ws.onclose = (ev) => {
            console.log("closed", this.bars.length);
        };
        return {
            ws: ws,
            bars: [],
        };
    },
    methods: {
        close() {
            this.ws.close();
        }
    },
};
export { app };
