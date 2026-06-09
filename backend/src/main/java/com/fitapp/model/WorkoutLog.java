package com.fitapp.model;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "workout_logs")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class WorkoutLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id", nullable = false)
    private Long userId;
    @Column(name = "plan_id")
    private Long planId;
    @Column(name = "started_at")
    private LocalDateTime startedAt;
    @Column(name = "finished_at")
    private LocalDateTime finishedAt;
    @Column(name = "total_volume_kg", precision = 10, scale = 2)
    private BigDecimal totalVolumeKg;
}