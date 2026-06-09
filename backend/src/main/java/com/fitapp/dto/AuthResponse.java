package com.fitapp.dto;
import lombok.*;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private UserDto user;

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class UserDto {
        private Long id;
        private String name;
        private String email;
        private String role;
        private String subscription;
        private String goal;
    }
}