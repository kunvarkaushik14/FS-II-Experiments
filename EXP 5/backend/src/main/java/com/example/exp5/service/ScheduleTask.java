package com.example.exp5.service;

import com.example.exp5.model.Schedule;
import com.example.exp5.repository.ScheduleRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class ScheduleTask {

    private final ScheduleRepository scheduleRepository;

    public ScheduleTask(ScheduleRepository scheduleRepository) {
        this.scheduleRepository = scheduleRepository;
    }

    @Scheduled(fixedRate = 30000)
    public void processSchedules() {

        LocalDateTime now = LocalDateTime.now();

        List<Schedule> schedules =
                scheduleRepository.findAll();

        for (Schedule schedule : schedules) {

            if ("SCHEDULED".equalsIgnoreCase(schedule.getStatus())
                    && schedule.getScheduledAt() != null
                    && !schedule.getScheduledAt().isAfter(now)) {

                schedule.setStatus("EXECUTED");
                scheduleRepository.save(schedule);

                System.out.println(
                        "Scheduled task executed: "
                                + schedule.getTitle()
                );
            }
        }
    }
}