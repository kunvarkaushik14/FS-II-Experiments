package com.example.exp5.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.exp5.service.AIContentAnalysisService;

@RestController
@RequestMapping("/api/ai")
public class AIContentAnalysisController {

    private final AIContentAnalysisService analysisService;

    public AIContentAnalysisController(
            AIContentAnalysisService analysisService
    ) {
        this.analysisService = analysisService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeContent(
            @RequestBody Map<String, String> request
    ) {

        String content = request.get("content");
        String platform = request.get("platform");
        String tone = request.get("tone");

        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "success", false,
                            "message", "Content is required"
                    )
            );
        }

        if (platform == null || platform.trim().isEmpty()) {
            platform = "Twitter";
        }

        if (tone == null || tone.trim().isEmpty()) {
            tone = "Professional";
        }

        String analysis = analysisService.analyzeContent(
                content,
                platform,
                tone
        );

        return ResponseEntity.ok(
                Map.of(
                        "success", true,
                        "message", "Content analyzed successfully",
                        "data", Map.of(
                                "content", content,
                                "platform", platform,
                                "tone", tone,
                                "analysis", analysis
                        )
                )
        );
    }
}