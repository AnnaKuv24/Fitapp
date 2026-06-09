package com.fitapp.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "users")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 100)
    private String name;
    @Column(nullable = false, unique = true, length = 150)
    private String email;
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role = Role.USER;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Subscription subscription = Subscription.FREE;
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Goal goal;
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Role { USER, TRAINER, ADMIN }
    public enum Subscription { FREE, PREMIUM }
    public enum Goal { WEIGHT_LOSS, MUSCLE_GAIN, MAINTENANCE }
}