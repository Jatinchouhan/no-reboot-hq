package com.example.demo.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ConfigRequest {
    @NotBlank
    private String key;

    @NotBlank
    private String value;
}
