package com.example.exp5.controller;

import com.example.exp5.dto.ApiResponse;
import com.example.exp5.dto.PostRequest;
import com.example.exp5.model.Post;
import com.example.exp5.service.PostService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Post>>> getAllPosts() {
        return ResponseEntity.ok(
                ApiResponse.success("Posts retrieved successfully",
                        postService.getAllPosts())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Post>> getPost(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Post retrieved successfully",
                        postService.getPostById(id))
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Post>> createPost(
            @Valid @RequestBody PostRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success("Post created successfully",
                        postService.createPost(request))
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Post>> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody PostRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success("Post updated successfully",
                        postService.updatePost(id, request))
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(
            @PathVariable Long id) {

        postService.deletePost(id);

        return ResponseEntity.ok(
                ApiResponse.success("Post deleted successfully", null)
        );
    }
}