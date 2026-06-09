package com.fitapp.dto;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
public class ProfileUpdateRequest {
    @NotBlank
    private String name;
    @Email @NotBlank
    private String email;
    private String goal;
}
