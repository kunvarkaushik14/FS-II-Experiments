package com.example.exp5.controller;

import com.example.exp5.model.User;
import com.example.exp5.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Get all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.findAll());
    }

    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    // Get user by email
    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(
            @PathVariable String email
    ) {
        return ResponseEntity.ok(userService.findByEmail(email));
    }

    // Create user
    @PostMapping
    public ResponseEntity<User> createUser(
            @RequestBody User user
    ) {
        return ResponseEntity.ok(userService.save(user));
    }

    // Update user
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(
            @PathVariable Long id,
            @RequestBody User updatedUser
    ) {

        User existingUser = userService.findById(id);

        existingUser.setEmail(updatedUser.getEmail());

        if (updatedUser.getPassword() != null &&
                !updatedUser.getPassword().isBlank()) {

            existingUser.setPassword(updatedUser.getPassword());
        }

        existingUser.setRole(updatedUser.getRole());

        return ResponseEntity.ok(
                userService.save(existingUser)
        );
    }

    // Delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id
    ) {

        userService.delete(id);

        return ResponseEntity.noContent().build();
    }
}