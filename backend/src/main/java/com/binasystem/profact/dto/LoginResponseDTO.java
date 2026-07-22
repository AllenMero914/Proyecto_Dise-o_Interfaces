package com.binasystem.profact.dto;

import com.binasystem.profact.enums.Rol;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponseDTO {
    private String token;
    private Long id;
    private String nombre;
    private String email;
    private Rol rol;
}
