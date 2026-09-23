package com.example.exp5.controller;

import com.example.exp5.dto.AIPostRequest;
import com.example.exp5.dto.ApiResponse;
import com.example.exp5.service.AIPostService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIPostService aiPostService;

    public AIController(AIPostService aiPostService) {
        this.aiPostService = aiPostService;
    }

    @PostMapping("/generate-post")
    public ResponseEntity<ApiResponse<Map<String, String>>> generatePost(
            @Valid @RequestBody AIPostRequest request) {

        String generatedContent = aiPostService.generatePost(
                request.getTopic(),
                request.getPlatform(),
                request.getTone()
        );

        Map<String, String> data = Map.of(
                "topic", request.getTopic(),
                "platform", request.getPlatform(),
                "tone", request.getTone(),
                "content", generatedContent
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "AI post generated successfully",
                        data
                )
        );
    }
}