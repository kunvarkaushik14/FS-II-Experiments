package com.example.exp5.rag;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.ollama.OllamaEmbeddingModel;
import org.springframework.ai.ollama.api.OllamaApi;
import org.springframework.ai.ollama.api.OllamaEmbeddingOptions;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RagConfig {

    @Bean
    public EmbeddingModel embeddingModel() {

        OllamaApi ollamaApi = OllamaApi.builder()
                .baseUrl("http://localhost:11434")
                .build();

        OllamaEmbeddingOptions options = OllamaEmbeddingOptions.builder()
                .model("nomic-embed-text")
                .build();

        return OllamaEmbeddingModel.builder()
                .ollamaApi(ollamaApi)
                .options(options)
                .build();
    }

    @Bean
    public VectorStore vectorStore(EmbeddingModel embeddingModel) {
        return SimpleVectorStore.builder(embeddingModel).build();
    }
}