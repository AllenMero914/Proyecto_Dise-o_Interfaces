package com.binasystem.profact.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DetalleVentaDTO {
    @NotNull
    private Long productoId;
    @Min(1)
    private int cantidad;
}
