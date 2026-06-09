package com.fitapp.repository;
import com.fitapp.model.PersonalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PersonalRecordRepository extends JpaRepository<PersonalRecord, Long> {
    List<PersonalRecord> findByUserIdOrderByMaxWeightKgDesc(Long userId);
    Optional<PersonalRecord> findByUserIdAndExerciseId(Long userId, Long exerciseId);
}