package com.fitapp.repository;
import com.fitapp.model.WorkoutLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WorkoutLogRepository extends JpaRepository<WorkoutLog, Long> {
    List<WorkoutLog> findByUserIdOrderByStartedAtDesc(Long userId);
    Optional<WorkoutLog> findByIdAndUserId(Long id, Long userId);
}