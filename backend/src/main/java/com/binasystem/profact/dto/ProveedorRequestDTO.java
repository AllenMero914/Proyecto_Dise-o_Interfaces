package com.binasystem.profact.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProveedorRequestDTO {
    @NotBlank private String nombre;
    private String email;
    private String telefono;
    private String direccion;
}
