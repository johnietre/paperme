;
const app = {
    data() {
        const url = new URL("/ws", document.location.href);
        url.protocol = "ws";
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
        msgHandler(ev) {
            console.log("message received");
        },
        openHandler(ev) {
            console.log("websocket opened");
        },
        errHandler(ev) {
            console.log("websocket error occurred:", ev);
        },
        closeHandler(ev) {
            console.log("websocket closed:", ev);
        },
    },
};
function newOrder() {
    return { symbol: "", side: "buy", oprice: 0.0, size: 0 };
}
export { app };
