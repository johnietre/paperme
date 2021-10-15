package com.paperme.desktop.gui.home;

import com.paperme.desktop.gui.GUI;
import javax.swing.JLabel;
import javax.swing.JPanel;

public class Home extends JPanel {
  private GUI gui;

  public Home(GUI gui) {
    this.gui = gui;
    JLabel label = new JLabel("Hello from the PaperMe team (just me)");
    this.add(label);
    JLabel label2 =
        new JLabel("The PaperMe consists of a staggering 1 employee");
    this.add(label2);
  }
}
