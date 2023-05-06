package main

import (
  "database/sql"
  "encoding/json"
  "flag"
  "io"
  "log"
  "net/http"
  "os"
  "path/filepath"
  "runtime"
  "sync"

  _ "github.com/mattn/go-sqlite3"
  webs "golang.org/x/net/websocket"
)

var (
  orderBook = &OrderBook{}
  logger = log.New(os.Stderr, "", 0)

  clients sync.Map

  db *sql.DB
  insertOrderStmt *sql.Stmt
  selectOrderStmt *sql.Stmt
)

func init() {
}

func main() {
  _ = webs.Conn{}
  addr := flag.String("addr", "8000", "Address to run on")
  flag.Parse()

  log.Fatal(http.ListenAndServe(*addr, nil))
}

func handleOrders(w http.ResponseWriter, r *http.Request) {
  switch r.Method {
  case http.MethodGet:
    getOrders(w, r)
  case http.MethodPost:
    createOrder(w, r)
  case http.MethodDelete:
    deleteOrder(w, r)
  }
}

func getOrders(w http.ResponseWriter, r *http.Request) {
}

func createOrder(w http.ResponseWriter, r *http.Request) {
}

func deleteOrder(w http.ResponseWriter, r *http.Request) {
}

func handleBook(w http.ResponseWriter, r *http.Request) {
  orderBook.mtx.RLock()
  json.NewEncoder(w).Encode(orderBook)
  orderBook.mtx.RUnlock()
}

type server struct {
  orderBook *OrderBook

  logger *log.Logger

  clients sync.Map

  db *sql.DB
  insertOrderStmt *sql.Stmt
  selectOrderStmt *sql.Stmt
}

func newServer() *server {
  s := &server{orderBook: & OrderBook{}}

  _, thisFile, _, _ := runtime.Caller(0)
  thisDir := filepath.Dir(thisFile)

  logFile := filepath.Join(thisDir, "server.log")
  f, err := os.OpenFile(logFile, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0644)
  if err != nil {
    s.logger.Fatal("error opening log file: ", err)
  }
  s.logger.SetOutput(f)

  dbFile := filepath.Join(thisDir, "sims.db")
  s.db, err = sql.Open("sqlite3", dbFile)
  if err != nil {
    s.logger.Fatal("error opening database: ", err)
  }

  s.insertOrderStmt, err = db.Prepare(`INSERT INTO orders(user,price,size) VALUES (?,?,?)`)
  if err != nil {
    s.logger.Fatal("error creating insert order stmt: ", err)
  }

  s.selectOrderStmt, err = db.Prepare(`SELECT // FROM orders`)
  if err != nil {
    s.logger.Fatal("error creating select order stmt: ", err)
  }

  return s
}

func (s *server) handleWs(ws *webs.Conn) {
  defer ws.Close()
  clientAddr := ws.RemoteAddr().String()
  logFunc := func(format string, args ...any) {
    s.logger.Printf("["+clientAddr+"]"+format, args...)
  }

  // Receive user identification
  var email string
  if err := webs.Message.Receive(ws, &email); err != nil {
    return
  }
  row := db.QueryRow(`SELECT email FROM users WHERE email=?`, email)
  switch err := row.Scan(&email); err {
  case nil:
  case sql.ErrNoRows:
    webs.Message.Send(ws, "invalid email")
    return
  default:
    webs.Message.Send(ws, "internal server error")
    logFunc("error getting user data: %v", err)
    return
  }

  s.clients.Store(clientAddr, ws)
  defer s.clients.Delete(clientAddr)

  var msg string
  for {
    if err := webs.Message.Receive(ws, &msg); err != nil {
      if err != io.EOF {
        logFunc("error reading from client: %v", err)
      }
      return
    }
  }
}

func (s *server) addOrder(order Order) {
  if order.Size > 0 {
    s.orderBook.addBid(order)
  } else {
    s.orderBook.addAsk(order)
  }
}

type OrderBook struct {
  Bids *List[Order] `json:"bids"`
  Asks *List[Order] `json:"asks"`
  mtx sync.RWMutex
}

func (ob *OrderBook) addBid(order Order) {
  ob.mtx.Lock()
  ob.lockedAddBid(order)
  ob.mtx.Unlock()
}

func (ob *OrderBook) lockedAddBid(order Order) {
  // TODO: Remove ask
  // Loop through finding asks with prices less than or equal to the order
  // price
  for n := ob.Asks.Head(); n != nil; n = n.Next() {
    if n.Value.Price <= order.Price {
      ask := &n.Value
      // TODO: Update filled price
      // TODO: Notify on order book change
      if ask.Size < order.Size {
        //
      } else if ask.Size == order.Size {
        return
      } else {
      }
    }
  }
  for n := ob.Bids.Head(); n != nil; n = n.Next() {
    if n.Value.Price < order.Price {
      n.InsertBefore(order)
      return
    }
  }
  ob.Bids.PushBack(order)
}

func (ob *OrderBook) addAsk(order Order) {
  ob.mtx.Lock()
  ob.lockedAddAsk(order)
  ob.mtx.Unlock()
}

func (ob *OrderBook) lockedAddAsk(order Order) {
  // TODO: Remove bid
  for n := ob.Asks.Head(); n != nil; n = n.Next() {
    if n.Value.Price > order.Price {
      n.InsertBefore(order)
      return
    }
  }
  ob.Asks.PushBack(order)
}

// TODO: Size things
type Order struct {
  Id uint64 `json:"id"`
  User string `json:"user"`

  Price float64 `json:"price"`
  Size int64 `json:"size"`

  FilledPrice int64 `json:"filledPrice"`
  FilledSize int64 `json:"filledSize"`

  Canceled bool `json:"canceled"`
}

type List[T any] struct {
  head, tail *Node[T]
  len int
}

func NewList[T any]() *List[T] {
  return &List[T]{}
}

func (l *List[T]) Head() *Node[T] {
  return l.head
}

func (l *List[T]) Tail() *Node[T] {
  return l.tail
}

func (l *List[T]) Len() int {
  return l.len
}

func (l *List[T]) PushBack(value T) *Node[T] {
  if l.tail != nil {
    return l.tail.InsertAfter(value)
  }
  l.len++
  node := &Node[T]{Value: value, list: l}
  l.head, l.tail = node, node
  return node
}

func (l *List[T]) PushFront(value T) *Node[T] {
  if l.head != nil {
    return l.head.InsertBefore(value)
  }
  l.len++
  node := &Node[T]{Value: value, list: l}
  l.head, l.tail = node, node
  return node
}

func (l *List[T]) PopBack() *Node[T] {
  if l.tail == nil {
    return nil
  }
  l.len--
  node := l.tail
  node.Remove()
  return node
}

func (l *List[T]) PopFront() *Node[T] {
  if l.head == nil {
    return nil
  }
  l.len--
  node := l.head
  node.Remove()
  return node
}

func (l *List[T]) Clear() {
  l.head, l.tail, l.len = nil, nil, 0
}

func (l *List[T]) MarshalJSON() ([]byte, error) {
  if l.head == nil {
    return []byte("[]"), nil
  }
  b := []byte{'['}
  for n := l.head; n != nil; n = n.next {
    nb, err := json.Marshal(n)
    if err != nil {
      return nil, err
    }
    b = append(b, append(nb, ',')...)
  }
  b[len(b)-1] = ']'
  return b, nil
}

func (l *List[T]) UnmarshalJSON(b []byte) error {
  var arr []T
  if err := json.Unmarshal(b, &arr); err != nil {
    return err
  }
  for _, v := range arr {
    l.PushBack(v)
  }
  return nil
}

type Node[T any] struct {
  Value T
  prev, next *Node[T]
  list *List[T]
}

func (n *Node[T]) Next() *Node[T] {
  return n.next
}

func (n *Node[T]) Prev() *Node[T] {
  return n.prev
}

func (n *Node[T]) List() *List[T] {
  return n.list
}

func (n *Node[T]) InsertAfter(value T) *Node[T] {
  if n.list == nil {
    return nil
  }
  newNode := &Node[T]{Value: value, prev: n, list: n.list}
  if n.next != nil {
    n.next.prev = newNode
    newNode.next = n.next
  } else {
    n.list.tail = newNode
  }
  n.next = newNode
  n.list.len++
  return newNode
}

func (n *Node[T]) InsertBefore(value T) *Node[T] {
  if n.list == nil {
    return nil
  }
  newNode := &Node[T]{Value: value, next: n, list: n.list}
  if n.prev != nil {
    n.prev.next = newNode
    newNode.prev = n.prev
  } else {
    n.list.head = newNode
  }
  n.prev = newNode
  n.list.len++
  return newNode
}

func (n *Node[T]) Remove() {
  if n.list == nil {
    return
  }
  if n == n.list.head {
    if n == n.list.tail {
      n.list.tail = nil
    }
    n.list.head = n.next
  } else if n == n.list.tail {
    n.list.tail = n.prev
  }
  if n.next != nil {
    n.next.prev = n.prev
  }
  if n.prev != nil {
    n.prev.next = n.next
  }
  n.list = nil
  n.list.len--
}

func (n *Node[T]) MarshalJSON() ([]byte, error) {
  return json.Marshal(n.Value)
}

func (n *Node[T]) UnmarshalJSON(b []byte) error {
  return json.Unmarshal(b, &n.Value)
}
