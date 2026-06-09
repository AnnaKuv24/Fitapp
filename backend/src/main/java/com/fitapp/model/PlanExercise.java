package com.fitapp.model;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "plan_exercises")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PlanExercise {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "plan_id") @JsonIgnore
    private WorkoutPlan plan;
    @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "exercise_id")
    private Exercise exercise;
    @Column(name = "sets_count")
    private Integer sets = 3;
    private Integer reps = 10;
    @Column(name = "rest_seconds")
    private Integer restSeconds = 90;
    @Column(name = "order_num")
    private Integer orderNum = 0;
}