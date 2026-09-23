package com.example.exp5.dto;

import jakarta.validation.constraints.NotBlank;

public class RagRequest {

    @NotBlank(message = "Question is required")
    private String question;

    public RagRequest() {
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }
}