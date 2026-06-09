package com.fitapp.controller;
import com.fitapp.model.Exercise;
import com.fitapp.repository.ExerciseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/exercises")
@RequiredArgsConstructor
public class ExerciseController {
    private final ExerciseRepository repo;

    @GetMapping
    public ResponseEntity<List<Exercise>> getAll(@RequestParam(required = false) String muscle) {
        if (muscle != null && !muscle.isBlank())
            return ResponseEntity.ok(repo.findByMuscleGroupContainingIgnoreCase(muscle));
        return ResponseEntity.ok(repo.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Exercise> getById(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TRAINER','ADMIN')")
    public ResponseEntity<Exercise> create(@RequestBody Exercise exercise) {
        return ResponseEntity.status(201).body(repo.save(exercise));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TRAINER','ADMIN')")
    public ResponseEntity<Exercise> update(@PathVariable Long id, @RequestBody Exercise exercise) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        exercise.setId(id);
        return ResponseEntity.ok(repo.save(exercise));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}