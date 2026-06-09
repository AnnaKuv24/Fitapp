package com.fitapp.controller;
import com.fitapp.model.User;
import com.fitapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/subscription")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('USER','TRAINER','ADMIN')")
public class SubscriptionController {
    private final UserRepository userRepo;

    @PostMapping("/purchase")
    public ResponseEntity<?> purchase(@RequestBody(required = false) Map<String, String> body,
                                       @AuthenticationPrincipal UserDetails ud) {
        User user = currentUser(ud);
        user.setSubscription(User.Subscription.PREMIUM);
        userRepo.save(user);
        return ResponseEntity.ok(Map.of(
            "status", "ACTIVE",
            "subscription", user.getSubscription().name(),
            "message", "Підписку PREMIUM активовано"
        ));
    }

    @DeleteMapping
    public ResponseEntity<?> cancel(@AuthenticationPrincipal UserDetails ud) {
        User user = currentUser(ud);
        user.setSubscription(User.Subscription.FREE);
        userRepo.save(user);
        return ResponseEntity.ok(Map.of(
            "status", "CANCELLED",
            "subscription", user.getSubscription().name(),
            "message", "Підписку скасовано"
        ));
    }

    private User currentUser(UserDetails ud) {
        return userRepo.findByEmail(ud.getUsername()).orElseThrow();
    }
}
