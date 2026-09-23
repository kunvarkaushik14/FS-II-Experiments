package com.example.exp5.config;

import com.example.exp5.model.User;
import com.example.exp5.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class UserDataLoader {

    @Bean
    CommandLineRunner loadUsers(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {

        return args -> {

            if (userRepository.count() == 0) {

                User admin = new User(
                        "admin@exp5.com",
                        passwordEncoder.encode("admin123"),
                        "ADMIN"
                );

                User editor = new User(
                        "editor@exp5.com",
                        passwordEncoder.encode("editor123"),
                        "EDITOR"
                );

                User viewer = new User(
                        "viewer@exp5.com",
                        passwordEncoder.encode("viewer123"),
                        "VIEWER"
                );

                userRepository.save(admin);
                userRepository.save(editor);
                userRepository.save(viewer);

                System.out.println("======================================");
                System.out.println("EXP 5 DEMO USERS CREATED");
                System.out.println("ADMIN  : admin@exp5.com / admin123");
                System.out.println("EDITOR : editor@exp5.com / editor123");
                System.out.println("VIEWER : viewer@exp5.com / viewer123");
                System.out.println("======================================");
            }
        };
    }
}