package com.fitapp.model;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity @Table(name = "workout_plans")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class WorkoutPlan {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 150)
    private String name;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Level level = Level.BEGINNER;
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Goal goal = Goal.MAINTENANCE;
    private String emoji;
    private String color;
    @Column(name = "created_by")
    private Long createdBy;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @OrderBy("orderNum ASC")
    private List<PlanExercise> exercises;

    public enum Level { BEGINNER, INTERMEDIATE, ADVANCED }
    public enum Goal  { WEIGHT_LOSS, MUSCLE_GAIN, MAINTENANCE, ENDURANCE }
}