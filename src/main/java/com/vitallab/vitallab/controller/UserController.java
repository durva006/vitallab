package com.vitallab.vitallab.controller;

import com.vitallab.vitallab.entity.User;
import com.vitallab.vitallab.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // Register new user
    @PostMapping("/signup")
    public ResponseEntity<?> register(@RequestBody User user) {
        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            return ResponseEntity.badRequest().body("User with this email already exists!");
        }
        User saved = userRepository.save(user);
        // return saved user (without password would be better; keep simple for now)
        saved.setPassword(null);
        return ResponseEntity.ok(saved);
    }

    // Login: return user object when successful
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User user) {
        Optional<User> existingUser = userRepository.findByEmailAndPassword(
                user.getEmail(), user.getPassword());

        if (existingUser.isPresent()) {
            User u = existingUser.get();
            u.setPassword(null); // don't send password back
            return ResponseEntity.ok(u);
        } else {
            return ResponseEntity.status(401).body("Invalid email or password.");
        }
    }

    @GetMapping("/all")
public List<User> getAllUsers() {
    return userRepository.findAll(); 
    // This fetches every row from your 'users' table in PostgreSQL
}

    // Get user by email
    @GetMapping("/users/{email}")
    public Optional<User> getUserByEmail(@PathVariable String email) {
        return userRepository.findByEmail(email);
    }

    @PutMapping("/{id}/status")
public User updateStatus(@PathVariable Long id, @RequestBody String status) {
    User user = userRepository.findById(id).orElseThrow();
    user.setReportStatus(status);
    return userRepository.save(user);
}
    
}
