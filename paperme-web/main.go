package main

import (
  "net/http"

  webs "golang.org/x/net/websocket"
)

func main() {
  /*
  http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
    http.ServeFile(w, r, "index.html")
  })
  http.HandleFunc("script.js", func(w http.ResponseWriter, r *http.Request) {
    //w.Header().Set("Content-Type", "text/javascript");
    http.ServeFile(w, r, "script.js")
  })
  http.HandleFunc("main.js", func(w http.ResponseWriter, r *http.Request) {
    //w.Header().Set("Content-Type", "text/javascript");
    http.ServeFile(w, r, "main.js")
  })
  */
  http.Handle("/", http.FileServer(http.Dir(".")))
  http.Handle("/stocks/data/bars", webs.Handler(func(ws *webs.Conn) {
    defer ws.Close()
    var msg string
    webs.Message.Receive(ws, &msg)
  }))
  panic(http.ListenAndServe("127.0.0.1:8000", nil))
}
