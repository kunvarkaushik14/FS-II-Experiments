package com.example.exp5.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.exp5.model.Notification;
import com.example.exp5.repository.NotificationRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(
            NotificationRepository notificationRepository
    ) {
        this.notificationRepository = notificationRepository;
    }

    /* ==========================================
       GET ALL NOTIFICATIONS
       ========================================== */

    public List<Notification> getAllNotifications() {
        return notificationRepository
                .findAllByOrderByCreatedAtDesc();
    }

    /* ==========================================
       GET UNREAD COUNT
       ========================================== */

    public long getUnreadCount() {
        return notificationRepository
                .countByReadFalse();
    }

    /* ==========================================
       CREATE NOTIFICATION
       ========================================== */

    public Notification createNotification(
            String title,
            String message,
            String type
    ) {

        Notification notification =
                new Notification(
                        title,
                        message,
                        type
                );

        return notificationRepository.save(
                notification
        );
    }

    /* ==========================================
       MARK ONE AS READ
       ========================================== */

    public Notification markAsRead(Long id) {

        Notification notification =
                notificationRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Notification not found"
                                )
                        );

        notification.setRead(true);

        return notificationRepository.save(
                notification
        );
    }

    /* ==========================================
       MARK ALL AS READ
       ========================================== */

    public void markAllAsRead() {

        List<Notification> notifications =
                notificationRepository
                        .findAllByOrderByCreatedAtDesc();

        for (Notification notification :
                notifications) {

            notification.setRead(true);
        }

        notificationRepository.saveAll(
                notifications
        );
    }

    /* ==========================================
       DELETE NOTIFICATION
       ========================================== */

    public void deleteNotification(Long id) {

        if (!notificationRepository.existsById(id)) {
            throw new RuntimeException(
                    "Notification not found"
            );
        }

        notificationRepository.deleteById(id);
    }
}