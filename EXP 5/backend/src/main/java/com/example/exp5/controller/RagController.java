package com.example.exp5.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.exp5.dto.ApiResponse;
import com.example.exp5.dto.RagRequest;
import com.example.exp5.rag.RagService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/rag")
public class RagController {

    private final RagService ragService;

    public RagController(RagService ragService) {
        this.ragService = ragService;
    }

    @PostMapping("/ask")
    public ResponseEntity<ApiResponse<Map<String, String>>> ask(
            @Valid @RequestBody RagRequest request) {

        String answer = ragService.ask(request.getQuestion());

        Map<String, String> data = Map.of(
                "question", request.getQuestion(),
                "answer", answer
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "RAG response generated successfully",
                        data
                )
        );
    }
}