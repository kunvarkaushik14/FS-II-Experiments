package com.example.exp5.service;

import com.example.exp5.dto.ScheduleRequest;
import com.example.exp5.model.Schedule;
import com.example.exp5.repository.ScheduleRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final NotificationService notificationService;

    public ScheduleService(
            ScheduleRepository scheduleRepository,
            NotificationService notificationService
    ) {
        this.scheduleRepository = scheduleRepository;
        this.notificationService = notificationService;
    }

    /* =====================================================
       GET ALL SCHEDULES
       ===================================================== */

    public List<Schedule> getAllSchedules() {

        return scheduleRepository.findAll();
    }

    /* =====================================================
       GET SCHEDULE BY ID
       ===================================================== */

    public Schedule getScheduleById(Long id) {

        return scheduleRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Schedule not found with id: " + id
                        )
                );
    }

    /* =====================================================
       CREATE SCHEDULE
       ===================================================== */

    public Schedule createSchedule(
            ScheduleRequest request
    ) {

        Schedule schedule = new Schedule();

        schedule.setTitle(
                request.getTitle()
        );

        schedule.setDescription(
                request.getDescription()
        );

        schedule.setScheduledAt(
                request.getScheduledAt()
        );

        schedule.setStatus(
                request.getStatus()
        );

        schedule.setPlatform(
                request.getPlatform()
        );

        Schedule savedSchedule =
                scheduleRepository.save(schedule);

        notificationService.createNotification(
                "Schedule Created",
                "The schedule \""
                        + savedSchedule.getTitle()
                        + "\" was created.",
                "SCHEDULE_CREATED"
        );

        return savedSchedule;
    }

    /* =====================================================
       UPDATE SCHEDULE
       ===================================================== */

    public Schedule updateSchedule(
            Long id,
            ScheduleRequest request
    ) {

        Schedule schedule =
                getScheduleById(id);

        schedule.setTitle(
                request.getTitle()
        );

        schedule.setDescription(
                request.getDescription()
        );

        schedule.setScheduledAt(
                request.getScheduledAt()
        );

        schedule.setStatus(
                request.getStatus()
        );

        schedule.setPlatform(
                request.getPlatform()
        );

        Schedule updatedSchedule =
                scheduleRepository.save(schedule);

        notificationService.createNotification(
                "Schedule Updated",
                "The schedule \""
                        + updatedSchedule.getTitle()
                        + "\" was updated.",
                "SCHEDULE_UPDATED"
        );

        return updatedSchedule;
    }

    /* =====================================================
       DELETE SCHEDULE
       ===================================================== */

    public void deleteSchedule(Long id) {

        Schedule schedule =
                getScheduleById(id);

        String title =
                schedule.getTitle();

        scheduleRepository.deleteById(id);

        notificationService.createNotification(
                "Schedule Deleted",
                "The schedule \""
                        + title
                        + "\" was deleted.",
                "SCHEDULE_DELETED"
        );
    }
}