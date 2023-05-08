package main

import (
  "bufio"
  "fmt"
  "os"
  "strconv"
  "strings"
)

var (
  stdin = bufio.NewReader(os.Stdin)
)

func main() {
  app := &App{ob: NewOrderBook()}
  if err := app.Run(); err != nil {
    fmt.Fprintln(os.Stderr, err)
    os.Exit(1)
  }
}

type App struct {
  ob *OrderBook
}

func (a *App) Run() error {
  for {
    line, err := stdin.ReadString('\n')
    if err != nil {
      return err
    }
    parts := strings.Split(strings.TrimSpace(line), " ")
    if len(parts) == 0 {
      continue
    }
    switch parts[0] {
    case "buy", "sell":
      a.handleOrder(parts)
    case "print":
      a.handlePrint()
    case "help":
      a.handleHelp()
    case "exit":
      a.handleExit()
      return nil
    default:
      fmt.Println("Invalid command")
    }
  }
}

func (a *App) handleOrder(parts []string) {
  var orderSide OrderSide
  if parts[0] == "buy" {
    orderSide = OrderSideBuy
  } else {
    orderSide = OrderSideSell
  }
  order := Order{Side: orderSide, Type: OrderTypeMarket}
  var size int64 = -1
  parts = parts[1:]
  for i := range parts {
    if parts[i] != "" {
      size, _ = strconv.ParseInt(parts[i], 10, 64)
      parts = parts[i+1:]
      break
    }
  }
  if size == 0 {
    fmt.Println("Invalid order size")
  } else if size == -1 {
    fmt.Println("Missing order size")
  }
  order.Size = size

  price := 0.0
  for _, part := range parts {
    if len(part) == 0 {
      continue
    }
    if price == -1.0 {
      price, _ = strconv.ParseFloat(part, 64)
      break
    }
    if part[0] == '@' {
      if len(part) != 1 {
        price, _ = strconv.ParseFloat(part[1:], 64)
        break
      }
      price = -1.0
    }
  }
  if price < 0.0 {
    fmt.Println("Missing or invalid limit price")
  } else if price > 0.0 {
    order.Price = price
    order.Type = OrderTypeLimit
  }
  switch order.Side {
  case OrderSideBuy:
    switch order.Type {
    case OrderTypeMarket:
      a.ob.addMarketBuy(order)
    case OrderTypeLimit:
      a.ob.addBid(order)
    }
  case OrderSideSell:
    switch order.Type {
    case OrderTypeMarket:
      a.ob.addMarketSell(order)
    case OrderTypeLimit:
      a.ob.addAsk(order)
    }
  }
}

func (a *App) handleHelp() {
  fmt.Println("Help: h,help")
  fmt.Println("Buy: buy <qty> [@ <price>]")
  fmt.Println("Sell: sell <qty> [@ <price>]")
  fmt.Println("Print Book: print")
}

func (a *App) handlePrint() {
  fmt.Println(strings.Repeat("-", 38))
  fmt.Printf("| %15s || %15s |\n", "Market Buy", "Market Sell")
  fmt.Println(strings.Repeat("-", 38))
  mbn, msn := a.ob.MarketBuys.Head(), a.ob.MarketSells.Head()
  if msn != nil || mbn != nil {
    if mbn != nil {
      cumBuy := mbn.Value
      for mbn = mbn.Next(); mbn != nil && mbn.Value.Price == cumBuy.Price; mbn = mbn.Next() {
        cumBuy.Size += mbn.Value.Size
      }
      fmt.Printf("| %15d |", cumBuy.Size)
    } else {
      fmt.Printf("| %15s |", "")
    }
    if msn != nil {
      cumSell := msn.Value
      for msn = msn.Next(); msn != nil && msn.Value.Price == cumSell.Price; msn = msn.Next() {
        cumSell.Size += msn.Value.Size
      }
      fmt.Printf("| %15d |", cumSell.Size)
    } else {
      fmt.Printf("| %15s |", "")
    }
    fmt.Println("\n"+strings.Repeat("-", 38))
  }

  fmt.Println(strings.Repeat("-", 38))
  fmt.Printf("| %15s || %15s |\n", "Bid", "Ask")
  fmt.Println(strings.Repeat("-", 38))
  fmt.Printf("| %6s | %6s || %6s | %6s |\n", "Size", "Price", "Price", "Size")
  fmt.Println(strings.Repeat("-", 38))
  an, bn := a.ob.Asks.Head(), a.ob.Bids.Head()
  for an != nil || bn != nil {
    if bn != nil {
      cumBid := bn.Value
      for bn = bn.Next(); bn != nil && bn.Value.Price == cumBid.Price; bn = bn.Next() {
        cumBid.Size += bn.Value.Size
      }
      fmt.Printf("| %6d | %6.2f |", cumBid.Size, cumBid.Price)
    } else {
      fmt.Printf("| %6s | %6s |", "", "")
    }
    if an != nil {
      cumAsk := an.Value
      for an = an.Next(); an != nil && an.Value.Price == cumAsk.Price; an = an.Next() {
        cumAsk.Size += an.Value.Size
      }
      fmt.Printf("| %6.2f | %6d |", cumAsk.Price, cumAsk.Size)
    } else {
      fmt.Printf("| %6s | %6s |", "", "")
    }
    fmt.Println("\n"+strings.Repeat("-", 38))
  }
}

func (a *App) handleExit() {
}
