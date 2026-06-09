package com.fitapp.model;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity @Table(name = "set_logs")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SetLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "workout_log_id", nullable = false)
    private Long workoutLogId;
    @Column(name = "exercise_id", nullable = false)
    private Long exerciseId;
    @Column(name = "set_num")
    private Integer setNum;
    @Column(name = "reps_done")
    private Integer repsDone;
    @Column(name = "weight_kg", precision = 6, scale = 2)
    private BigDecimal weightKg;
}