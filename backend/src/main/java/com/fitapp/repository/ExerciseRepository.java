package com.fitapp.repository;
import com.fitapp.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    List<Exercise> findByMuscleGroupContainingIgnoreCase(String muscleGroup);
}