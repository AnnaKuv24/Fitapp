package com.fitapp.dto;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AuthRequest {
    @Email @NotBlank
    private String email;
    @NotBlank @Size(min = 8)
    private String password;
    private String name;
    private String goal;
}