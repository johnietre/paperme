package com.paperme.desktop.gui;

import com.paperme.desktop.gui.home.Home;
import com.paperme.desktop.gui.login.Login;
import java.awt.BorderLayout;
import java.awt.CardLayout;
import java.awt.Container;
import javax.swing.JFrame;
import javax.swing.JPanel;

public class GUI extends JFrame {
  public JPanel panel;
  public CardLayout cards;
  public Container pane;

  public GUI() {
    // Create the application frame
    panel = new JPanel();
    // Create the cards and set it as the layout of the frame
    cards = new CardLayout();
    panel.setLayout(cards);

    // Add the cards to the frame
    panel.add(new Login(this), "login");
    panel.add(new Home(this), "home");
  }

  public void run() {
    this.setTitle("PaperMe");
    this.setSize(1500, 1000);
    this.add(panel);
    this.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
    this.setVisible(true);
  }
}
