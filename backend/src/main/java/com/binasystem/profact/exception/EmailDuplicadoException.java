package com.binasystem.profact.exception;

public class EmailDuplicadoException extends RuntimeException {
    // PV-003
    public EmailDuplicadoException() {
        super("El correo ya está registrado en el sistema");
    }
}
