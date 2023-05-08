#![allow(dead_code)]
use std::collections::LinkedList;

pub struct OrderBook {
    bids: LinkedList<Order>,
    asks: LinkedList<Order>,
    market_buys: LinkedList<Order>,
    market_sells: LinkedList<Order>,
}

impl OrderBook {
    pub fn new() -> Self {
        Self {
            bids: LinkedList::new(),
            asks: LinkedList::new(),
            market_buys: LinkedList::new(),
            market_sells: LinkedList::new(),
        }
    }

    pub fn bids(&self) -> &LinkedList<Order> {
        &self.bids
    }

    pub fn asks(&self) -> &LinkedList<Order> {
        &self.asks
    }

    pub fn market_buys(&self) -> &LinkedList<Order> {
        &self.market_buys
    }

    pub fn market_sells(&self) -> &LinkedList<Order> {
        &self.market_sells
    }

    pub fn add_bid(&mut self, mut order: Order) {
        self.check_market_sells(&mut order);
        if order.is_filled() {
            return;
        }

        let mut cur = self.asks.cursor_front_mut();
        while let Some(ask) = cur.current() {
            if ask.price > order.price {
                break;
            }
            order.fill_with(ask);
            if ask.is_filled() {
                cur.remove_current();
            } else {
                cur.move_next();
            }
            if order.is_filled() {
                return;
            }
        }
        let mut cur = self.bids.cursor_front_mut();
        while let Some(bid) = cur.current() {
            if bid.price < order.price {
                cur.insert_before(order);
                return;
            }
            cur.move_next();
        }
        self.bids.push_back(order);
    }

    pub fn add_market_buy(&mut self, mut order: Order) {
        if !self.market_buys.is_empty() {
            self.market_buys.push_back(order);
            return;
        }
        let mut cur = self.asks.cursor_front_mut();
        while let Some(ask) = cur.current() {
            let filled = ask.fill(ask.price, order.size);
            order.fill(ask.price, filled);
            if order.is_filled() {
                return;
            }
            if ask.is_filled() {
                cur.remove_current();
            } else {
                cur.move_next();
            }
        }
        self.market_buys.push_back(order);
    }

    fn check_market_buys(&mut self, order: &mut Order) {
        let mut cur = self.market_buys.cursor_front_mut();
        while let Some(buy) = cur.current() {
            order.fill_with(buy);
            if order.is_filled() {
                return;
            }
            cur.move_next();
        }
    }

    pub fn add_ask(&mut self, mut order: Order) {
        self.check_market_sells(&mut order);
        if order.is_filled() {
            return;
        }

        let mut cur = self.bids.cursor_front_mut();
        while let Some(bid) = cur.current() {
            if bid.price < order.price {
                break;
            }
            order.fill_with(bid);
            if order.is_filled() {
                return;
            }
            if bid.is_filled() {
                cur.remove_current();
            } else {
                cur.move_next();
            }
        }
        let mut cur = self.asks.cursor_front_mut();
        while let Some(ask) = cur.current() {
            if ask.price > order.price {
                cur.insert_before(order);
                return;
            }
            cur.move_next();
        }
        self.asks.push_back(order);
    }

    pub fn add_market_sell(&mut self, mut order: Order) {
        if !self.market_sells.is_empty() {
            self.market_sells.push_back(order);
            return;
        }
        let mut cur = self.bids.cursor_front_mut();
        while let Some(bid) = cur.current() {
            let filled = bid.fill(bid.price, order.size);
            order.fill(bid.price, filled);
            if order.is_filled() {
                return;
            }
            if bid.is_filled() {
                cur.remove_current();
            } else {
                cur.move_next();
            }
        }
        self.market_sells.push_back(order);
    }

    fn check_market_sells(&mut self, order: &mut Order) {
        let mut cur = self.market_sells.cursor_front_mut();
        while let Some(sell) = cur.current() {
            order.fill_with(sell);
            if order.is_filled() {
                return;
            }
            cur.move_next();
        }
    }
}

#[derive(Default, Clone)]
pub struct Order {
    id: u64,
    user_id: u64,

    pub otype: OrderType,
    pub side: OrderSide,

    pub price: f64,
    pub size: u64,

    filled_price: f64,
    filled_size: u64,

    canceled: bool,
}

impl Order {
    pub fn otype(mut self, otype: OrderType) -> Self {
        self.otype = otype;
        self
    }

    pub fn side(mut self, side: OrderSide) -> Self {
        self.side = side;
        self
    }

    pub fn price(mut self, price: f64) -> Self {
        self.price = price;
        self
    }

    pub fn size(mut self, size: u64) -> Self {
        self.size = size;
        self
    }

    pub fn filled_price(&self) -> f64 {
        self.filled_price
    }

    pub fn filled_size(&self) -> u64 {
        self.filled_size
    }

    pub fn canceled(&self) -> bool {
        self.canceled
    }

    pub fn remaining_size(&self) -> u64 {
        self.size - self.filled_size
    }

    fn fill(&mut self, price: f64, size: u64) -> u64 {
        let r = self.remaining_size();
        let size = if r < size { r } else { size };
        let (ffilled, fsize) = (self.filled_size as f64, size as f64);
        let f_new_filled = ffilled + fsize;
        let old_part = self.filled_price / f_new_filled * ffilled;
        let new_part = price / f_new_filled * fsize;
        self.filled_price = old_part + new_part;
        self.filled_size += size;
        size
    }

    fn fill_with(&mut self, order: &mut Order) -> u64 {
        let filled = self.fill(order.price, order.size);
        order.fill(order.price, filled);
        filled
    }

    pub fn is_filled(&self) -> bool {
        self.size == self.filled_size
    }
}

#[derive(Clone, Copy, Default, PartialEq, Eq)]
pub enum OrderType {
    #[default]
    Unknown,
    Limit,
    Market,
}

#[derive(Clone, Copy, Default, PartialEq, Eq)]
pub enum OrderSide {
    #[default]
    Unknown,
    Buy,
    Sell,
}
