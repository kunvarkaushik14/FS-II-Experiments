package com.example.exp5.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.exp5.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}