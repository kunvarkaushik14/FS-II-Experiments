package com.example.exp5;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class Exp5Application {

    public static void main(String[] args) {
        SpringApplication.run(Exp5Application.class, args);
    }
}