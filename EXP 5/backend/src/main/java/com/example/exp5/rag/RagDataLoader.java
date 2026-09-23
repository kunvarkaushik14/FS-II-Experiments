package com.example.exp5.rag;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;


@Component
public class RagDataLoader implements CommandLineRunner {

    private final VectorStore vectorStore;

    public RagDataLoader(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    @Override
    public void run(String... args) {

        List<Document> documents = List.of(

                new Document(
                        "EXP 5 is a Spring Boot REST API project. " +
                        "It demonstrates CRUD operations, validation, " +
                        "standardized API responses, CORS, logging, " +
                        "correlation IDs and exception handling."
                ),

                new Document(
                        "REST APIs use HTTP methods such as GET, POST, PUT and DELETE. " +
                        "GET retrieves data, POST creates data, PUT updates data, " +
                        "and DELETE removes data."
                ),

                new Document(
                        "RAG means Retrieval Augmented Generation. " +
                        "It retrieves relevant information from a vector store " +
                        "and provides that information to an AI model as context."
                ),

                new Document(
                        "Ollama allows local AI models to run on a computer. " +
                        "EXP 5 uses llama3.2 for chat generation and " +
                        "nomic-embed-text for embeddings."
                )
        );

        vectorStore.add(documents);
    }
}