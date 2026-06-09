package com.fitapp.dto;
import lombok.*;
import java.math.BigDecimal;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class WorkoutSummary {
    private Long workoutLogId;
    private BigDecimal totalVolumeKg;
    private Long durationMinutes;
    private Integer totalSets;
}