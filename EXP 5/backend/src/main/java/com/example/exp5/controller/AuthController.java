package com.example.exp5.controller;

import com.example.exp5.dto.ApiResponse;
import com.example.exp5.dto.LoginRequest;
import com.example.exp5.service.AuthService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ApiResponse<?> login(
            @Valid @RequestBody LoginRequest request) {

        String token = authService.login(request);

        return ApiResponse.success(
                "Login successful",
                Map.of(
                        "token", token,
                        "email", request.getEmail()
                )
        );
    }
}