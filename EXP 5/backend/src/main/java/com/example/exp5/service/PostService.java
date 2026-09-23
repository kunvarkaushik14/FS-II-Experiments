package com.example.exp5.service;

import com.example.exp5.dto.PostRequest;
import com.example.exp5.model.Post;
import com.example.exp5.repository.PostRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final NotificationService notificationService;

    public PostService(
            PostRepository postRepository,
            NotificationService notificationService
    ) {
        this.postRepository = postRepository;
        this.notificationService = notificationService;
    }

    /* =====================================================
       GET ALL POSTS
       ===================================================== */

    public List<Post> getAllPosts() {

        return postRepository.findAll();
    }

    /* =====================================================
       GET POST BY ID
       ===================================================== */

    public Post getPostById(Long id) {

        return postRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Post not found with id: " + id
                        )
                );
    }

    /* =====================================================
       CREATE POST
       ===================================================== */

    public Post createPost(PostRequest request) {

        Post post = new Post();

        post.setPlatform(
                request.getPlatform()
        );

        post.setContent(
                request.getContent()
        );

        post.setWordCount(
                request.getWordCount()
        );

        post.setStatus(
                request.getStatus()
        );

        Post savedPost =
                postRepository.save(post);

        /* ---------------------------------------------
           CREATE NOTIFICATION
           --------------------------------------------- */

        notificationService.createNotification(
                "Post Created",
                "A new "
                        + savedPost.getPlatform()
                        + " post was created.",
                "POST_CREATED"
        );

        return savedPost;
    }

    /* =====================================================
       UPDATE POST
       ===================================================== */

    public Post updatePost(
            Long id,
            PostRequest request
    ) {

        Post post = getPostById(id);

        post.setPlatform(
                request.getPlatform()
        );

        post.setContent(
                request.getContent()
        );

        post.setWordCount(
                request.getWordCount()
        );

        post.setStatus(
                request.getStatus()
        );

        Post updatedPost =
                postRepository.save(post);

        /* ---------------------------------------------
           CREATE NOTIFICATION
           --------------------------------------------- */

        notificationService.createNotification(
                "Post Updated",
                "The "
                        + updatedPost.getPlatform()
                        + " post with ID "
                        + updatedPost.getId()
                        + " was updated.",
                "POST_UPDATED"
        );

        return updatedPost;
    }

    /* =====================================================
       DELETE POST
       ===================================================== */

    public void deletePost(Long id) {

        Post post = getPostById(id);

        String platform =
                post.getPlatform();

        postRepository.deleteById(id);

        /* ---------------------------------------------
           CREATE NOTIFICATION
           --------------------------------------------- */

        notificationService.createNotification(
                "Post Deleted",
                "The "
                        + platform
                        + " post with ID "
                        + id
                        + " was deleted.",
                "POST_DELETED"
        );
    }
}