// model/User.java
package com.myapp.backend.model;
import jakarta.persistence.*;
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String password; // encrypted store hogi

    private String username;
    private String country;

   

    // Getters + Setters
    public Long getId() { return id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getUsername(){return username;}
    public void setUsername(String username){this.username = username;}
    public String getCountry(){return country;}
    public void setCountry(String country){this.country = country;}

}