package main

import "sync"

type OrderBook struct {
  Bids *List[Order] `json:"bids"`
  Asks *List[Order] `json:"asks"`
  /*
  MarketBuys []Order `json:"marketBuys"`
  MarketSells []Order `json:"marketSells"`
  */
  MarketBuys *List[Order] `json:"marketBuys"`
  MarketSells *List[Order] `json:"marketSells"`
  mtx sync.RWMutex
}

func NewOrderBook() *OrderBook {
  return &OrderBook{
    Bids: NewList[Order](),
    Asks: NewList[Order](),
    MarketBuys: NewList[Order](),
    MarketSells: NewList[Order](),
  }
}

func (ob *OrderBook) addBid(order Order) {
  ob.mtx.Lock()
  ob.lockedAddBid(order)
  ob.mtx.Unlock()
}

func (ob *OrderBook) lockedAddBid(order Order) {
  // Check market orders
  order = ob.lockedCheckMarketSells(order)
  // TODO: Notify?
  if order.IsFilled() {
    return
  }
  // Loop through finding asks with prices less than or equal to the order
  // price
  for n := ob.Asks.Head(); n != nil && n.Value.Price <= order.Price; n = n.Next() {
    // TODO: Update filled price
    // TODO: Notify on order book change
    ask := &n.Value
    order.FillWith(ask)
    if ask.IsFilled() {
      n.Remove()
    }
    if order.IsFilled() {
      return
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

func (ob *OrderBook) addMarketBuy(order Order) {
  ob.mtx.Lock()
  ob.lockedAddMarketBuy(order)
  ob.mtx.Unlock()
}

func (ob *OrderBook) lockedAddMarketBuy(order Order) {
  if !ob.MarketBuys.IsEmpty() {
    ob.MarketBuys.PushBack(order)
    return
  }
  ob.Asks.Range(func(n *Node[Order]) bool {
    // TODO: Notify
    ask := &n.Value
    filledSize := ask.Fill(ask.Price, order.Size)
    if ask.IsFilled() {
      n.Remove()
    }
    order.Fill(ask.Price, filledSize)
    return !order.IsFilled()
  })
  if !order.IsFilled() {
    // NOTE: MarketBuys will be empty
    ob.MarketBuys.PushFront(order)
  }
}

func (ob *OrderBook) lockedCheckMarketBuys(order Order) Order {
  // TODO: Notify
  ob.MarketBuys.Range(func(n *Node[Order]) bool {
    order.FillWith(&n.Value)
    return !order.IsFilled()
  })
  return order
}

func (ob *OrderBook) addAsk(order Order) {
  ob.mtx.Lock()
  ob.lockedAddAsk(order)
  ob.mtx.Unlock()
}

func (ob *OrderBook) lockedAddAsk(order Order) {
  // Check market orders
  order = ob.lockedCheckMarketBuys(order)
  // TODO: Notify?
  if order.IsFilled() {
    return
  }
  // Loop through finding bids with prices greater than or equal to the order
  // price
  for n := ob.Bids.Head(); n != nil && n.Value.Price >= order.Price; n = n.Next() {
    // TODO: Update filled price
    // TODO: Notify on order book change
    bid := &n.Value
    order.FillWith(bid)
    if bid.IsFilled() {
      n.Remove()
    }
    if order.IsFilled() {
      return
    }
  }
  for n := ob.Asks.Head(); n != nil; n = n.Next() {
    if n.Value.Price > order.Price {
      n.InsertBefore(order)
      return
    }
  }
  ob.Asks.PushBack(order)
}

func (ob *OrderBook) addMarketSell(order Order) {
  ob.mtx.Lock()
  ob.lockedAddMarketSell(order)
  ob.mtx.Unlock()
}

func (ob *OrderBook) lockedAddMarketSell(order Order) {
  if !ob.MarketSells.IsEmpty() {
    ob.MarketSells.PushBack(order)
    return
  }
  ob.Bids.Range(func(n *Node[Order]) bool {
    // TODO: Notify
    bid := &n.Value
    filledSize := bid.Fill(bid.Price, order.Size)
    if bid.IsFilled() {
      n.Remove()
    }
    order.Fill(bid.Price, filledSize)
    return order.IsFilled()
  })
  if !order.IsFilled() {
    // NOTE: MarketSells will be empty
    ob.MarketSells.PushFront(order)
  }
}

func (ob *OrderBook) lockedCheckMarketSells(order Order) Order {
  // TODO: Notify
  ob.MarketSells.Range(func(n *Node[Order]) bool {
    order.FillWith(&n.Value)
    return !order.IsFilled()
  })
  return order
}

type OrderType int

const (
  OrderTypeUnknown OrderType = iota
  OrderTypeMarket
  OrderTypeLimit
)

type OrderSide int

const (
  OrderSideUnknown OrderSide = iota
  OrderSideBuy
  OrderSideSell
)

// TODO: Size things
type Order struct {
  Id uint64 `json:"id"`
  User string `json:"user"`

  Type OrderType `json:"orderType"`
  Side OrderSide `json:"side"`

  Price float64 `json:"price"`
  Size int64 `json:"size"`

  FilledPrice float64 `json:"filledPrice"`
  FilledSize int64 `json:"filledSize"`

  Canceled bool `json:"canceled"`
}

func (o Order) RemainingSize() int64 {
  return o.Size - o.FilledSize
}

// Fill attempts to fill the order with the given price and size. This method
// does not check to make sure order types and prices match, that is the job of
// the caller. It returns the size filled, which will be <= size (less if the
// remaining size is less than the passed size).
func (o *Order) Fill(price float64, size int64) int64 {
  if r := o.RemainingSize(); r < size {
    size = r
  }
  ffilled, fsize := float64(o.FilledSize), float64(size)
  fNewFilled := ffilled + fsize
  oldPart := o.FilledPrice / fNewFilled * ffilled
  newPart := price / fNewFilled * fsize
  o.FilledPrice = oldPart + newPart
  o.FilledSize += size
  return size
}

// FillWith fills the calling order with the passed order as much as possible,
// using the passed order's price and size. It will also fill the passed order,
// calling Fill on both. It returns the size filled, which will be
// <= order.Size. See Order.Fill for further detail.
func (o *Order) FillWith(order *Order) int64 {
  filled := o.Fill(order.Price, order.Size)
  order.Fill(order.Price, filled)
  return filled
}

func (o Order) IsFilled() bool {
  return o.RemainingSize() == 0
}
