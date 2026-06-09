package com.fitapp.controller;
import com.fitapp.dto.*;
import com.fitapp.model.*;
import com.fitapp.repository.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class WorkoutController {
    private final WorkoutPlanRepository planRepo;
    private final WorkoutLogRepository  logRepo;
    private final SetLogRepository      setLogRepo;
    private final PersonalRecordRepository prRepo;
    private final com.fitapp.repository.UserRepository userRepo;

    @GetMapping("/workout-plans")
    public ResponseEntity<?> getPlans(@AuthenticationPrincipal UserDetails ud) {
        Long uid = userId(ud);
        return ResponseEntity.ok(planRepo.findByCreatedByOrCreatedByIsNull(uid));
    }

    @GetMapping("/workout-plans/{id}")
    public ResponseEntity<?> getPlan(@PathVariable Long id) {
        return planRepo.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/workout-plans")
    @PreAuthorize("hasAnyRole('TRAINER','ADMIN')")
    public ResponseEntity<WorkoutPlan> createPlan(@RequestBody WorkoutPlan plan,
                                                   @AuthenticationPrincipal UserDetails ud) {
        plan.setId(null);
        plan.setCreatedBy(userId(ud));
        return ResponseEntity.status(201).body(planRepo.save(plan));
    }

    @PutMapping("/workout-plans/{id}")
    @PreAuthorize("hasAnyRole('TRAINER','ADMIN')")
    public ResponseEntity<WorkoutPlan> updatePlan(@PathVariable Long id, @RequestBody WorkoutPlan plan) {
        var existing = planRepo.findById(id);
        if (existing.isEmpty()) return ResponseEntity.notFound().build();
        plan.setId(id);
        plan.setCreatedBy(existing.get().getCreatedBy());
        plan.setExercises(existing.get().getExercises());
        return ResponseEntity.ok(planRepo.save(plan));
    }

    @DeleteMapping("/workout-plans/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePlan(@PathVariable Long id) {
        planRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/workout/start")
    @PreAuthorize("hasAnyRole('USER','TRAINER','ADMIN')")
    public ResponseEntity<?> start(@RequestBody Map<String, Long> body,
                                   @AuthenticationPrincipal UserDetails ud) {
        WorkoutLog log = WorkoutLog.builder()
            .userId(userId(ud)).planId(body.get("planId"))
            .startedAt(LocalDateTime.now()).build();
        log = logRepo.save(log);
        return ResponseEntity.ok(Map.of("workoutLogId", log.getId(), "status", "STARTED"));
    }

    @PostMapping("/workout/set")
    @PreAuthorize("hasAnyRole('USER','TRAINER','ADMIN')")
    public ResponseEntity<?> logSet(@Valid @RequestBody LogSetRequest req,
                                    @AuthenticationPrincipal UserDetails ud) {
        Long uid = userId(ud);
        SetLog sl = SetLog.builder()
            .workoutLogId(req.getWorkoutLogId()).exerciseId(req.getExerciseId())
            .setNum(req.getSetNum()).repsDone(req.getRepsDone()).weightKg(req.getWeightKg())
            .build();
        setLogRepo.save(sl);

        // Check PR
        var pr = prRepo.findByUserIdAndExerciseId(uid, req.getExerciseId());
        boolean isPR = pr.isEmpty() || pr.get().getMaxWeightKg().compareTo(req.getWeightKg()) < 0;
        if (isPR) {
            prRepo.save(PersonalRecord.builder()
                .userId(uid).exerciseId(req.getExerciseId())
                .maxWeightKg(req.getWeightKg()).achievedAt(LocalDateTime.now()).build());
        }
        return ResponseEntity.status(201).body(Map.of(
            "success", true, "setLogId", sl.getId(), "isPersonalRecord", isPR,
            "message", isPR ? "Новий рекорд! " + req.getWeightKg() + " кг" : "Підхід збережено"
        ));
    }

    @PostMapping("/workout/finish")
    @PreAuthorize("hasAnyRole('USER','TRAINER','ADMIN')")
    public ResponseEntity<WorkoutSummary> finish(@RequestBody Map<String, Long> body,
                                                  @AuthenticationPrincipal UserDetails ud) {
        Long logId = body.get("workoutLogId");
        var sets = setLogRepo.findByWorkoutLogId(logId);
        BigDecimal vol = sets.stream()
            .map(s -> s.getWeightKg().multiply(BigDecimal.valueOf(s.getRepsDone())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        var log = logRepo.findById(logId).orElseThrow();
        log.setFinishedAt(LocalDateTime.now());
        log.setTotalVolumeKg(vol);
        logRepo.save(log);
        long dur = Duration.between(log.getStartedAt(), log.getFinishedAt()).toMinutes();
        return ResponseEntity.ok(WorkoutSummary.builder()
            .workoutLogId(logId).totalVolumeKg(vol)
            .durationMinutes(dur).totalSets(sets.size()).build());
    }

    @DeleteMapping("/workout/log/{id}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<?> deleteLog(@PathVariable Long id,
                                       @AuthenticationPrincipal UserDetails ud) {
        var log = logRepo.findByIdAndUserId(id, userId(ud))
            .orElseThrow(() -> new RuntimeException("Не знайдено"));
        setLogRepo.deleteByWorkoutLogId(id);
        logRepo.delete(log);
        return ResponseEntity.ok(Map.of("status","DELETED","message","Запис видалено"));
    }

    @GetMapping("/progress")
    public ResponseEntity<?> progress(@RequestParam(defaultValue = "month") String period,
                                      @AuthenticationPrincipal UserDetails ud) {
        Long uid = userId(ud);
        var logs = logRepo.findByUserIdOrderByStartedAtDesc(uid);
        long totalWorkouts = logs.size();
        BigDecimal totalVol = logs.stream()
            .map(l -> l.getTotalVolumeKg() != null ? l.getTotalVolumeKg() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        double avgDur = logs.stream()
            .filter(l -> l.getStartedAt() != null && l.getFinishedAt() != null)
            .mapToLong(l -> Duration.between(l.getStartedAt(), l.getFinishedAt()).toMinutes())
            .average().orElse(0);
        long prs = prRepo.findByUserIdOrderByMaxWeightKgDesc(uid).size();
        return ResponseEntity.ok(Map.of(
            "totalWorkouts", totalWorkouts,
            "totalVolumeKg", totalVol,
            "avgDurationMin", (long) avgDur,
            "newPRs", prs
        ));
    }

    @GetMapping("/progress/records")
    public ResponseEntity<?> records(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(prRepo.findByUserIdOrderByMaxWeightKgDesc(userId(ud)));
    }

    @GetMapping("/progress/history")
    public ResponseEntity<?> history(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(logRepo.findByUserIdOrderByStartedAtDesc(userId(ud)));
    }

    private Long userId(UserDetails ud) {
        return userRepo.findByEmail(ud.getUsername()).orElseThrow().getId();
    }
}