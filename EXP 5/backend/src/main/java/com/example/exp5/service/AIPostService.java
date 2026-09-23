package com.example.exp5.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.ollama.api.OllamaChatOptions;
import org.springframework.stereotype.Service;

@Service
public class AIPostService {

    private final ChatClient chatClient;
    private final NotificationService notificationService;

    public AIPostService(
            ChatClient.Builder chatClientBuilder,
            NotificationService notificationService
    ) {
        this.chatClient = chatClientBuilder.build();
        this.notificationService = notificationService;
    }

    /* =====================================================
       GENERATE AI POST
       ===================================================== */

    public String generatePost(
            String topic,
            String platform,
            String tone
    ) {

        String promptText = """
                You are an AI social media content writer.

                Generate a social media post using the following information:

                Topic: %s
                Platform: %s
                Tone: %s

                Requirements:
                - Write only the final post content.
                - Do not include explanations.
                - Keep the content suitable for the selected platform.
                - Make it engaging and professional.
                - Do not invent statistics or fake facts.
                """.formatted(
                topic,
                platform,
                tone
        );

        OllamaChatOptions options =
                OllamaChatOptions.builder()
                        .model("llama3.2")
                        .temperature(0.7)
                        .build();

        Prompt prompt =
                new Prompt(
                        promptText,
                        options
                );

        String generatedContent =
                chatClient
                        .prompt(prompt)
                        .call()
                        .content();

        /* =================================================
           CREATE NOTIFICATION
           ================================================= */

        notificationService.createNotification(
                "AI Content Generated",
                "AI content was generated for "
                        + platform
                        + " about \""
                        + topic
                        + "\".",
                "AI_GENERATED"
        );

        return generatedContent;
    }
}