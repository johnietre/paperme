package com.paperme.desktop.gui.login;

import java.awt.Component;
import java.awt.Container;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

import javax.swing.BoxLayout;
import javax.swing.JButton;
import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.JPasswordField;
import javax.swing.JTextField;

public class Login extends JFrame {
  public Login() {
    // Create the login frame
    this.setSize(500, 500);
    this.setLayout(null);
    this.setLocationRelativeTo(null);
    this.setDefaultCloseOperation(this.EXIT_ON_CLOSE);

    // Create the label and add it to the screen
    JLabel loginLabel = new JLabel("Login", JLabel.CENTER);
    loginLabel.setBounds(230, 100, 40, 30);
    this.add(loginLabel);

    // Create the email lable and field and add it to the screen
    JLabel emailLabel = new JLabel("Email", JLabel.RIGHT);
    emailLabel.setBounds(40, 150, 100, 30);
    JTextField emailField = new JTextField();
    emailField.setBounds(150, 150, 200, 30);
    this.add(emailLabel);
    this.add(emailField);

    // Create the password field and add it to the screen
    JLabel passwordLabel = new JLabel("Password", JLabel.TRAILING);
    passwordLabel.setBounds(40, 200, 100, 30);
    JPasswordField passwordField = new JPasswordField();
    passwordField.setBounds(150, 200, 200, 30);
    this.add(passwordLabel);
    this.add(passwordField);

    // Create the submit button and add it to the screen
    JButton submitButton = new JButton("Login");
    submitButton.setBounds(210, 250, 80, 50);
    submitButton.addActionListener(new ActionListener() {
      public void actionPerformed(ActionEvent event) {
        System.out.println("Logging in with credentials:");
        System.out.printf("\tEmail: %s\n", emailField.getText());
        System.out.printf("\tPassword: %s\n", passwordField.getText());
      }
    });
    this.add(submitButton);
  }
}
