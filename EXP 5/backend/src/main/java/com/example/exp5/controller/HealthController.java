package com.example.exp5.controller;

import com.example.exp5.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> health() {

        Map<String, String> data = Map.of(
                "status", "UP",
                "application", "EXP 5 Backend"
        );

        return ResponseEntity.ok(
                ApiResponse.success("Backend is running", data)
        );
    }
}