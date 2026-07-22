package com.binasystem.profact.exception;

public class CuentaBloqueadaException extends RuntimeException {
    // PV-002: Mensaje de bloqueo temporal
    public CuentaBloqueadaException() {
        super("Cuenta bloqueada temporalmente. Intente en 10 minutos.");
    }
}
