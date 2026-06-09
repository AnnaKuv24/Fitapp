package com.fitapp.model;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "exercises")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Exercise {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 150)
    private String name;
    @Column(columnDefinition = "TEXT")
    private String description;
    @Column(name = "muscle_group", length = 80)
    private String muscleGroup;
    @Column(name = "image_url")
    private String imageUrl;
    @Column(name = "created_by")
    private Long createdBy;
}