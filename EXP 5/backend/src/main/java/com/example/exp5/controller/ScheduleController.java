package com.example.exp5.controller;

import com.example.exp5.dto.ApiResponse;
import com.example.exp5.dto.ScheduleRequest;
import com.example.exp5.model.Schedule;
import com.example.exp5.service.ScheduleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Schedule>>> getAllSchedules() {
        return ResponseEntity.ok(
                ApiResponse.success("Schedules retrieved successfully",
                        scheduleService.getAllSchedules())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Schedule>> getSchedule(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                ApiResponse.success("Schedule retrieved successfully",
                        scheduleService.getScheduleById(id))
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Schedule>> createSchedule(
            @Valid @RequestBody ScheduleRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success("Schedule created successfully",
                        scheduleService.createSchedule(request))
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Schedule>> updateSchedule(
            @PathVariable Long id,
            @Valid @RequestBody ScheduleRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success("Schedule updated successfully",
                        scheduleService.updateSchedule(id, request))
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(
            @PathVariable Long id) {

        scheduleService.deleteSchedule(id);

        return ResponseEntity.ok(
                ApiResponse.success("Schedule deleted successfully", null)
        );
    }
}