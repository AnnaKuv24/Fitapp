package com.fitapp.controller;
import com.fitapp.dto.*;
import com.fitapp.model.User;
import com.fitapp.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('USER','TRAINER','ADMIN')")
public class ProfileController {
    private final UserRepository userRepo;

    @GetMapping
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(toDto(currentUser(ud)));
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(@Valid @RequestBody ProfileUpdateRequest req,
                                            @AuthenticationPrincipal UserDetails ud) {
        User user = currentUser(ud);
        if (!user.getEmail().equalsIgnoreCase(req.getEmail()) && userRepo.existsByEmail(req.getEmail()))
            return ResponseEntity.badRequest().body(Map.of("message", "Email вже зайнятий"));

        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setGoal(parseGoal(req.getGoal()));
        user = userRepo.save(user);
        return ResponseEntity.ok(toDto(user));
    }

    private AuthResponse.UserDto toDto(User user) {
        return AuthResponse.UserDto.builder()
            .id(user.getId()).name(user.getName()).email(user.getEmail())
            .role(user.getRole().name()).subscription(user.getSubscription().name())
            .goal(user.getGoal() != null ? user.getGoal().name() : null)
            .build();
    }

    private User currentUser(UserDetails ud) {
        return userRepo.findByEmail(ud.getUsername()).orElseThrow();
    }

    private User.Goal parseGoal(String goal) {
        if (goal == null || goal.isBlank()) return null;
        try {
            return User.Goal.valueOf(goal.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
