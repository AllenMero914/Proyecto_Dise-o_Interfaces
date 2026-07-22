package com.binasystem.profact.exception;

public class StockInsuficienteException extends RuntimeException {
    // CA-005.2
    public StockInsuficienteException(String productoNombre, int disponible, int requerido) {
        super("Stock insuficiente para '" + productoNombre + "'. Disponible: " + disponible + ", Requerido: " + requerido);
    }
}
