package com.fitapp.model;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "personal_records",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id","exercise_id"}))
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PersonalRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id", nullable = false)
    private Long userId;
    @Column(name = "exercise_id", nullable = false)
    private Long exerciseId;
    @Column(name = "max_weight_kg", precision = 6, scale = 2)
    private BigDecimal maxWeightKg;
    @Column(name = "achieved_at")
    private LocalDateTime achievedAt;
}