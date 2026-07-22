package com.binasystem.profact.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

// RNF-008: Mensajes de error descriptivos en español
@Data
@AllArgsConstructor
public class ErrorResponseDTO {
    private String error;
    private String mensaje;
    private LocalDateTime timestamp;

    public ErrorResponseDTO(String error) {
        this.error = error;
        this.timestamp = LocalDateTime.now();
    }
}
