package com.example.exp5.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.ollama.api.OllamaChatOptions;
import org.springframework.stereotype.Service;

@Service
public class AIContentAnalysisService {

    private final ChatClient chatClient;

    public AIContentAnalysisService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public String analyzeContent(
            String content,
            String platform,
            String tone
    ) {

        String promptText = """
                You are an AI social media content analyst.

                Analyze the following social media post.

                POST:
                %s

                PLATFORM:
                %s

                TONE:
                %s

                Return the analysis EXACTLY in this format:

                READABILITY: <number>/100
                ENGAGEMENT: <number>/100
                TONE_SCORE: <number>/100
                PLATFORM_FIT: <number>/100

                STRENGTHS:
                - <strength 1>
                - <strength 2>
                - <strength 3>

                SUGGESTIONS:
                - <suggestion 1>
                - <suggestion 2>
                - <suggestion 3>

                IMPROVED_VERSION:
                <improved version of the post>

                Rules:
                - Use realistic scores between 0 and 100.
                - Keep suggestions practical.
                - Do not invent statistics.
                - Keep the improved version suitable for the selected platform.
                - Do not add explanations outside the requested format.
                """.formatted(
                content,
                platform,
                tone
        );

        OllamaChatOptions options = OllamaChatOptions.builder()
                .model("llama3.2")
                .temperature(0.3)
                .build();

        Prompt prompt = new Prompt(promptText, options);

        return chatClient
                .prompt(prompt)
                .call()
                .content();
    }
}