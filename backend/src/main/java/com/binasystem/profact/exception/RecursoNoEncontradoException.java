package com.binasystem.profact.exception;

public class RecursoNoEncontradoException extends RuntimeException {
    public RecursoNoEncontradoException(String recurso, Long id) {
        super(recurso + " con ID " + id + " no encontrado");
    }
}
