package com.fitapp.controller;
import com.fitapp.dto.*;
import com.fitapp.model.User;
import com.fitapp.repository.UserRepository;
import com.fitapp.security.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthRequest req) {
        if (userRepo.existsByEmail(req.getEmail()))
            return ResponseEntity.badRequest().body(Map.of("message", "Email вже зайнятий"));

        User user = User.builder()
            .name(req.getName() != null ? req.getName() : req.getEmail().split("@")[0])
            .email(req.getEmail())
            .passwordHash(encoder.encode(req.getPassword()))
            .role(User.Role.USER)
            .subscription(User.Subscription.FREE)
            .goal(parseGoal(req.getGoal()))
            .build();
        user = userRepo.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(buildResponse(user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req) {
        var user = userRepo.findByEmail(req.getEmail()).orElse(null);
        if (user == null || !encoder.matches(req.getPassword(), user.getPasswordHash()))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Невірний email або пароль"));
        return ResponseEntity.ok(buildResponse(user));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> body) {
        String rt = body.get("refreshToken");
        if (rt == null || !jwtUtil.validateToken(rt))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Невалідний токен"));
        String email = jwtUtil.extractEmail(rt);
        var user = userRepo.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(Map.of(
            "accessToken",  jwtUtil.generateAccess(email, user.getRole().name()),
            "refreshToken", jwtUtil.generateRefresh(email)
        ));
    }

    private AuthResponse buildResponse(User user) {
        return AuthResponse.builder()
            .accessToken(jwtUtil.generateAccess(user.getEmail(), user.getRole().name()))
            .refreshToken(jwtUtil.generateRefresh(user.getEmail()))
            .user(AuthResponse.UserDto.builder()
                .id(user.getId()).name(user.getName()).email(user.getEmail())
                .role(user.getRole().name()).subscription(user.getSubscription().name())
                .goal(user.getGoal() != null ? user.getGoal().name() : null)
                .build())
            .build();
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