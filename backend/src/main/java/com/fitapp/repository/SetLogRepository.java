package com.fitapp.repository;
import com.fitapp.model.SetLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SetLogRepository extends JpaRepository<SetLog, Long> {
    List<SetLog> findByWorkoutLogId(Long workoutLogId);
    void deleteByWorkoutLogId(Long workoutLogId);
}