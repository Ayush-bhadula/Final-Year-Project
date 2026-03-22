package com.myapp.backend.service;

import com.myapp.backend.model.User;
import com.myapp.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    // SIGNUP
    public String signup(User user) {
        // Check karo email already exist toh nahi karti
        Optional<User> existing = userRepository.findByEmail(user.getEmail());
        if (existing.isPresent()) {
            return "Email already registered!";
        }
        userRepository.save(user);
        return "Signup successful! Please login.";
    }

    // LOGIN
    public String login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return "User not found!";
        }

        User user = userOpt.get();

        if (!user.getPassword().equals(password)) {
            return "Invalid password!";
        }

        return "Login successful";
    }
}