package com.example.exp5.dto;

import jakarta.validation.constraints.NotBlank;

public class AIPostRequest {

    @NotBlank(message = "Topic is required")
    private String topic;

    @NotBlank(message = "Platform is required")
    private String platform;

    @NotBlank(message = "Tone is required")
    private String tone;

    public AIPostRequest() {
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public String getTone() {
        return tone;
    }

    public void setTone(String tone) {
        this.tone = tone;
    }
}