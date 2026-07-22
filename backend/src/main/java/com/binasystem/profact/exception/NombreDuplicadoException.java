package com.binasystem.profact.exception;

public class NombreDuplicadoException extends RuntimeException {
    // PV-004
    public NombreDuplicadoException(String entidad) {
        super("El nombre de la " + entidad + " ya existe");
    }
}
