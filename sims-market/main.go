package main

import (
  "log"
  "net/http"
  "sync"

  webs "golang.org/x/net/websocket"
)

var (
  addr string
)

func main() {
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

type originalOrder struct {
  Order
  originalSize uint64
}

type OrderBook struct {
  Symbol string
  Bids []Order
  Asks []Order

  marketBuys []originalOrder
  marketSells []originalOrder

  mtx sync.RWMutex
}

func (ob *OrderBook) ToJSON() ([]byte, error) {
  ob.RLock()
  defer ob.RULock()
  return ob.lockedToJSON()
}

func (ob *OrderBook) lockedToJSON() ([]byte, error) {
  return json.Marshal(ob)
}

// SubmitLimitBuy attempts to place a buy order for the given price and size
// If the order cannot be fully filled given the price and size, it will
// placed in the order book
func (ob *OrderBook) SubmitLimitBuy(o Order) Order {
  ob.mtx.Lock()
  defer ob.mtx.Unlock()
  return ob.lockedSubmitLimitBuy(o)
}

func lockedSubmitLimitBuy(o Order) Order {
  original := o
  floatSize := float64(orignal.Size)
  for i, bid := range ob.Bids {
    if bid.Price > o.Price {
      // TODO
      break
    }
    if bid.Size < o.Size {
      o.Price += bid.Price * float64(bid.Size) / floatSize
      o.Size -= bid.Size
    } else {
      // Check if current bid needs to be removed
      if bid.Size == o.Size {
        i++
      } else {
        ob.Bids[i].Size -= o.Size
      }
      o.Price += bid.Price * float64(o.Size) / floatSize
      o.Size = original.Size
      ob.Bids = ob.Bids[i+1:]
      return o
    }
  }
  return o
}

// SubmitMarketBuy attempts to submit a market buy order for the given size
// If the order cannot be fully filled, it will be partially filled and stored
// until it can be completed
func (ob *OrderBook) SubmitMarketBuy(o Order) Order {
  ob.mtx.Lock()
  defer ob.mtx.Unlock()
  return ob.lockedSubmitMarketBuy(o)
}

func (ob *OrderBook) lockedSubmitMarketBuy(o Order) Order {
  original := o
  floatSize := float64(original.Size)
  o.Price = 0.0
  for i, ask := range ob.Asks {
    if ask.Size < o.Size {
      o.Price += ask.Price * float64(ask.Size) / floatSize
      o.Size -= ask.Size
    } else {
      // Check if current ask needs to be removed
      if ask.Size == o.Size {
        i++
      } else {
        ob.Asks[i].Size -= o.Size
      }
      o.Price += ask.Price * float64(o.Size) / floatSize
      o.Size = original.Size
      ob.Asks = ob.Asks[i+1:]
      return o
    }
  }
  ob.Asks = nil
  ob.marketBuys = append(
    ob.marketBuys,
    originalOrder{Order: o, orginalSize: original.Size},
  )
  o.Price *= floatSize / float64(o.Size)
  return o
}

// SubmitMarketSell attempts to submit a market sell order for the given size
// If the order cannot be fully filled, it will be partially filled and stored
// until it can be completed
func (ob *OrderBook) SubmitMarketSell(o Order) Order {
  ob.mtx.Lock()
  defer ob.mtx.Unlock()
  return ob.lockedSubmitMarketSell(o)
}

func (ob *OrderBook) lockedSubmitMarketSell(o Order) Order {
  original := o
  floatSize := float64(original.Size)
  o.Price = 0.0
  for i, bid := range ob.Bids {
    if bid.Size < o.Size {
      o.Price += bid.Price * float64(bid.Size) / floatSize
      o.Size -= bid.Size
    } else {
      // Check if current bid needs to be removed
      if bid.Size == o.Size {
        i++
      } else {
        ob.Bids[i].Size -= o.Size
      }
      o.Price += bid.Price * float64(o.Size) / floatSize
      o.Size = original.Size
      ob.Bids = ob.Bids[i+1:]
      return o
    }
  }
  ob.Bids = nil
  ob.marketSells = append(
    ob.marketSells,
    originalOrder{Order: o, orginalSize: original.Size},
  )
  o.Price *= floatSize / float64(o.Size)
  return o
}

// AddBid adds a bid to the order book, returning the best bid
func (ob *OrderBook) AddBid(o Order) Order {
  ob.mtx.Lock()
  defer ob.mtx.Unlock()
  return ob.lockedAddBid(o)
}

func (ob *OrderBook) lockedAddBid(order Order) Order {
  l := len(ob.Bids)
  if l == 0 {
    ob.Bids = append(ob.Bids, order)
    return order
  }
  pos := 0
  for i := ob.Bids {
    if ob.Bids[i].Price < order.Price {
      break
    }
    pos++
  }
  ob.Bids = append(append(ob.Bids[:pos], order), ob.Bids[pos:]...)
  return ob.Bids[0]
}

// AddAsk adds an ask to the order book, returning the best ask
func (ob *OrderBook) AddAsk(o Order) Order {
  ob.mtx.Lock()
  defer ob.mtx.Unlock()
  return ob.lockedAddAsk(o)
}

func (ob *OrderBook) lockedAddAsk(order Order) Order {
  l := len(ob.Asks)
  if l == 0 {
    ob.Asks = append(ob.Asks, order)
    return order
  }
  pos := 0
  for i := ob.Asks {
    if ob.Asks[i].Price > order.Price {
      break
    }
    pos++
  }
  ob.Asks = append(append(ob.Asks[:pos], order), ob.Asks[pos:]...)
  return ob.Asks[0]
}

// MarketDepth returns the market depth of the book
func (ob *OrderBook) MarketDepth() uint64 {
  ob.mtx.Lock()
  defer ob.mtx.Unlock()
}

func (ob *OrderBook) lockedMarketDepth() uint64 {
  depth := 0
  if len(ob.Bids) != 0 {
    price := ob.Bids[0].Price
    for _, o := ob.Bids {
      if o.Price != price {
        break
      }
      depth++
    }
  }
  if len(ob.Asks) != 0 {
    price := ob.Asks[0].Price
    for _, o := ob.Asks {
      if o.Price != price {
        break
      }
      depth++
    }
  }
  return depth
}

type Order struct {
  User string
  Price float64
  Size uint64
}
