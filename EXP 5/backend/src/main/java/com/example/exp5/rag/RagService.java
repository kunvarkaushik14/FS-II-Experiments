package com.example.exp5.rag;

import java.util.List;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.document.Document;
import org.springframework.ai.ollama.api.OllamaChatOptions;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

@Service
public class RagService {

    private final VectorStore vectorStore;
    private final ChatClient chatClient;

    public RagService(VectorStore vectorStore, ChatClient.Builder chatClientBuilder) {
        this.vectorStore = vectorStore;
        this.chatClient = chatClientBuilder.build();
    }

    public String ask(String question) {

        // Retrieve the most relevant documents from the EXP 5 knowledge base
        SearchRequest searchRequest = SearchRequest.builder()
                .query(question)
                .topK(3)
                .similarityThreshold(0.2)
                .build();

        List<Document> documents = vectorStore.similaritySearch(searchRequest);

        StringBuilder context = new StringBuilder();

        for (Document document : documents) {
            context.append(document.getText()).append("\n\n");
        }

        String promptText = """
                You are the AI Assistant for EXP 5.

                Answer the user's question using the provided EXP 5 knowledge base.

                Knowledge base:
                %s

                User question:
                %s

                Give a clear and concise answer.
                If the knowledge base does not contain enough information, say so instead of inventing details.
                """.formatted(context, question);

        // Explicitly force the installed Ollama model
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