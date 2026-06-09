package com.fitapp.dto;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class LogSetRequest {
    @NotNull private Long workoutLogId;
    @NotNull private Long exerciseId;
    @NotNull @Min(1) private Integer setNum;
    @NotNull @Min(1) private Integer repsDone;
    @NotNull @DecimalMin(value = "0", inclusive = true) private BigDecimal weightKg;
}