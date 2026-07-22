package com.binasystem.profact.exception;

public class CredencialesInvalidasException extends RuntimeException {
    // PV-001: Mensaje genérico sin revelar qué campo falló
    public CredencialesInvalidasException() {
        super("Credenciales inválidas");
    }
}
