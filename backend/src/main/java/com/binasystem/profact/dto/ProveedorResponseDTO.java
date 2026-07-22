package com.binasystem.profact.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProveedorResponseDTO {
    private Long id;
    private String nombre;
    private String email;
    private String telefono;
}
