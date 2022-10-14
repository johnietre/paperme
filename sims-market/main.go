package main

import (
  "log"
  "net/http"

  webs "golang.org/x/net/websocket"
)

var (
  addr string
)

func main() {
  //

  r := http.NewServeMux()
  r.Handle("/ws", webs.Handler(wsHandler))
  log.Fatal(http.ListenAndServe(addr, r))
}

func wsHandler(ws *webs.Conn) {
  defer ws.Close()
}

type Message struct {
  Action string `json:"action"`
  //
}

type OrderBook struct {
  Symbol string
  Bids []Order
  Asks []Order
}

type Order struct {
  User string
  Price uint64
  Size uint64
}
