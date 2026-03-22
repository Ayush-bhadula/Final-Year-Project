package com.myapp.backend.Controller;

import com.myapp.backend.model.User;
import com.myapp.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:63342") // ✅ specific origin
public class AuthController {

    @Autowired
    private AuthService authService;

    // ✅ HANDLE PREFLIGHT (VERY IMPORTANT)
    @RequestMapping(value = "/**", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleOptions() {
        return ResponseEntity.ok().build();
    }

    // POST /api/auth/signup
    @PostMapping("/signup")
    public String signup(@RequestBody User user) {
        return authService.signup(user);
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public String login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        return authService.login(email, password);
    }
}