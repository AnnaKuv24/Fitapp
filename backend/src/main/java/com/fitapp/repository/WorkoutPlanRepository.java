package com.fitapp.repository;
import com.fitapp.model.WorkoutPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WorkoutPlanRepository extends JpaRepository<WorkoutPlan, Long> {
    List<WorkoutPlan> findByCreatedByOrCreatedByIsNull(Long userId);
}