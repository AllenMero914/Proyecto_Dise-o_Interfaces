package com.binasystem.profact.dto;

import jakarta.validation.constraints.NotBlank;

public class ParametroDTO {
    
    private Long id;
    
    @NotBlank(message = "La clave es obligatoria")
    private String clave;
    
    @NotBlank(message = "El valor es obligatorio")
    private String valor;
    
    private String descripcion;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getClave() { return clave; }
    public void setClave(String clave) { this.clave = clave; }
    public String getValor() { return valor; }
    public void setValor(String valor) { this.valor = valor; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}
