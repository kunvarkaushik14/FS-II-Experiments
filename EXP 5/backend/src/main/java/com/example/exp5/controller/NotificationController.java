package com.example.exp5.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.exp5.dto.ApiResponse;
import com.example.exp5.model.Notification;
import com.example.exp5.service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService
    ) {
        this.notificationService = notificationService;
    }

    /* =====================================================
       GET ALL NOTIFICATIONS
       ===================================================== */

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>>
    getNotifications() {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Notifications fetched successfully",
                        notificationService.getAllNotifications()
                )
        );
    }

    /* =====================================================
       GET UNREAD COUNT
       ===================================================== */

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>>
    getUnreadCount() {

        Map<String, Long> data = new HashMap<>();

        data.put(
                "count",
                notificationService.getUnreadCount()
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Unread count fetched successfully",
                        data
                )
        );
    }

    /* =====================================================
       CREATE TEST NOTIFICATION
       ===================================================== */

    @PostMapping("/test")
    public ResponseEntity<ApiResponse<Notification>>
    createTestNotification() {

        Notification notification =
                notificationService.createNotification(
                        "Test Notification",
                        "Your EXP 5 notification system is working!",
                        "SYSTEM"
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Test notification created",
                        notification
                )
        );
    }

    /* =====================================================
       MARK ONE AS READ
       ===================================================== */

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Notification>>
    markAsRead(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Notification marked as read",
                        notificationService.markAsRead(id)
                )
        );
    }

    /* =====================================================
       MARK ALL AS READ
       ===================================================== */

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>>
    markAllAsRead() {

        notificationService.markAllAsRead();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "All notifications marked as read",
                        null
                )
        );
    }

    /* =====================================================
       DELETE NOTIFICATION
       ===================================================== */

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>>
    deleteNotification(
            @PathVariable Long id
    ) {

        notificationService.deleteNotification(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Notification deleted successfully",
                        null
                )
        );
    }
}