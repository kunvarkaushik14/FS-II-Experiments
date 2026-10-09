package com.exp6;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class Exp6Application {

    public static void main(String[] args) {

        SpringApplication.run(
                Exp6Application.class,
                args
        );

    }
}