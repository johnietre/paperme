#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")] // hide console window on Windows in release
#![feature(linked_list_cursors)]
use eframe::egui;
use egui::{Color32, Key};
use egui_extras::{TableBuilder, Column};

#[allow(dead_code)]
mod order_book;
use order_book::*;

fn main() -> Result<(), eframe::Error> {
    eframe::run_native(
        "Order Book",
        eframe::NativeOptions::default(),
        Box::new(|_cc| Box::<MyApp>::default()),
    )
}

struct MyApp {
    order_book: OrderBook,
    command: String,
    cmd_err: Option<String>,
}

impl eframe::App for MyApp {
    fn update(&mut self, ctx: &egui::Context, _frame: &mut eframe::Frame) {
        egui::SidePanel::left("command_panel").show(ctx, |ui| {
            if ctx.input(|i| i.key_pressed(Key::Enter)) {
                self.do_command();
                self.command.clear();
            }
            ui.text_edit_singleline(&mut self.command);
            if let Some(err) = self.cmd_err.as_ref() {
                //ui.label(RichText::new(err).color(Color32::RED));
                ui.colored_label(Color32::RED, err);
            }
        });
        let market_buy_size: u64 = self.order_book.market_buys().iter().map(|o| o.size).sum();
        let market_sell_size: u64 = self.order_book.market_sells().iter().map(|o| o.size).sum();

        let mut bids = Vec::with_capacity(self.order_book.bids().len());
        let mut iter = self.order_book.bids().iter().peekable();
        while let Some(order) = iter.next() {
            let mut cum_order = Order::default().price(order.price).size(order.size);
            while let Some(order) = iter.peek() {
                if order.price != cum_order.price {
                    break;
                }
                cum_order.size += order.size;
                iter.next();
            }
            bids.push(cum_order);
        }

        let mut asks = Vec::with_capacity(self.order_book.asks().len());
        let mut iter = self.order_book.asks().iter().peekable();
        while let Some(order) = iter.next() {
            let mut cum_order = Order::default().price(order.price).size(order.size);
            while let Some(order) = iter.peek() {
                if order.price != cum_order.price {
                    break;
                }
                cum_order.size += order.size;
                iter.next();
            }
            asks.push(cum_order);
        }

        egui::CentralPanel::default().show(ctx, |ui| {
            ui.vertical(|ui| {
                TableBuilder::new(ui)
                    .columns(Column::remainder(), 2)
                    .header(20.0, |mut header| {
                        header.col(|ui| {
                            ui.heading("Buy");
                        });
                        header.col(|ui| {
                            ui.heading("Sell");
                        });
                    })
                    .body(move |mut body| {
                        body.row(30.0, |mut row| {
                            row.col(|ui| {
                                ui.label(market_buy_size.to_string());
                            });
                            row.col(|ui| {
                                ui.label(market_sell_size.to_string());
                            });
                        });
                    });
                TableBuilder::new(ui)
                    .column(Column::remainder())
                    .header(20.0, |mut header| {
                        header.col(|ui| {
                            ui.heading("Bid Size");
                        });
                        header.col(|ui| {
                            ui.heading("Bid Price");
                        });
                        header.col(|ui| {
                            ui.heading("Ask Price");
                        });
                        header.col(|ui| {
                            ui.heading("Ask Size");
                        });
                    })
                    .body(move |mut body| {
                        body.rows(30.0, bids.len().max(asks.len()), |index, mut row| {
                            let bid = bids.get(index);
                            row.col(|ui| {
                                ui.label(
                                    bid.map(|o| format!("{}", o.size)).unwrap_or_default(),
                                );
                            });
                            row.col(|ui| {
                                ui.label(
                                    bid.map(|o| format!("${}", o.price)).unwrap_or_default(),
                                );
                            });
                            let ask = asks.get(index);
                            row.col(|ui| {
                                ui.label(
                                    ask.map(|o| format!("${}", o.price)).unwrap_or_default(),
                                );
                            });
                            row.col(|ui| {
                                ui.label(
                                    ask.map(|o| format!("{}", o.size)).unwrap_or_default(),
                                );
                            });
                        });
                    });
            });
        });
    }
}

impl MyApp {
    fn do_command(&mut self) {
        if self.command.len() == 0 {
            return;
        }
        // TODO: Figure out better way to do
        let cmd = self.command.clone();
        let args = cmd.split_whitespace().collect::<Vec<_>>();
        match args[0] {
            "buy" | "sell" => self.do_order(&args),
            "print" => self.do_print(&args),
            "help" => self.do_help(&args),
            _ => self.cmd_err = Some(format!("invalid argument: {}", args[0])),
        }
    }

    fn do_order(&mut self, args: &[&str]) {
        if args.len() < 2 {
            self.cmd_err = Some(String::from("missing order size"));
            return;
        }
        let side = match args[0] {
            "buy" => OrderSide::Buy,
            "sell" => OrderSide::Sell,
            _ => unreachable!(),
        };
        let Ok(size) = args[1].parse() else {
            self.cmd_err = Some(format!("invalid size: {}", args[1]));
            return;
        };
        let (otype, price) = if let Some(arg) = args.get(2) {
            let num_str = if arg.starts_with('@') {
                if arg == &"@" {
                    if let Some(num_str) = args.get(3) {
                        num_str
                    } else {
                        self.cmd_err = Some("missing limit price".into());
                        return;
                    }
                } else {
                    &arg[1..]
                }
            } else {
                self.cmd_err = Some(format!("invalid argument: {}", arg));
                return;
            };
            let Ok(price) = num_str.parse() else {
                self.cmd_err = Some(format!("invalid limit price: {}", num_str));
                return;
            };
            (OrderType::Limit, price)
        } else {
            (OrderType::Market, 0.0)
        };
        let order = Order::default()
            .otype(otype)
            .side(side)
            .price(price)
            .size(size);
        match (otype, side) {
            (OrderType::Limit, OrderSide::Buy) => self.order_book.add_bid(order),
            (OrderType::Limit, OrderSide::Sell) => self.order_book.add_ask(order),
            (OrderType::Market, OrderSide::Buy) => self.order_book.add_market_buy(order),
            (OrderType::Market, OrderSide::Sell) => self.order_book.add_market_sell(order),
            _ => unreachable!(),
        }
    }

    fn do_print(&self, _: &[&str]) {
    }

    fn do_help(&self, _: &[&str]) {
    }
}

impl Default for MyApp {
    fn default() -> Self {
        Self {
            order_book: OrderBook::new(),
            command: String::new(),
            cmd_err: None,
        }
    }
}
