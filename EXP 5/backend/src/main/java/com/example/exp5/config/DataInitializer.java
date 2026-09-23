package com.example.exp5.config;

import com.example.exp5.model.AppUser;
import com.example.exp5.repository.AppUserRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeUsers(
            AppUserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            if (!userRepository.existsByEmail("admin@exp5.com")) {

                userRepository.save(
                        new AppUser(
                                "admin@exp5.com",
                                passwordEncoder.encode("admin123"),
                                "ADMIN"
                        )
                );
            }

            if (!userRepository.existsByEmail("editor@exp5.com")) {

                userRepository.save(
                        new AppUser(
                                "editor@exp5.com",
                                passwordEncoder.encode("editor123"),
                                "EDITOR"
                        )
                );
            }

            if (!userRepository.existsByEmail("viewer@exp5.com")) {

                userRepository.save(
                        new AppUser(
                                "viewer@exp5.com",
                                passwordEncoder.encode("viewer123"),
                                "VIEWER"
                        )
                );
            }

            System.out.println("=================================");
            System.out.println("EXP 5 Demo Users Ready");
            System.out.println("Admin  : admin@exp5.com / admin123");
            System.out.println("Editor : editor@exp5.com / editor123");
            System.out.println("Viewer : viewer@exp5.com / viewer123");
            System.out.println("=================================");
        };
    }
}