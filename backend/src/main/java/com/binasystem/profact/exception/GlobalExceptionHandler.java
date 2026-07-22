package com.binasystem.profact.exception;

import com.binasystem.profact.dto.ErrorResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

// RNF-008: Mensajes de error descriptivos en español con acción correctiva
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CredencialesInvalidasException.class)
    public ResponseEntity<ErrorResponseDTO> handleCredencialesInvalidas(CredencialesInvalidasException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(new ErrorResponseDTO(ex.getMessage()));
    }

    @ExceptionHandler(CuentaBloqueadaException.class)
    public ResponseEntity<ErrorResponseDTO> handleCuentaBloqueada(CuentaBloqueadaException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(new ErrorResponseDTO(ex.getMessage()));
    }

    @ExceptionHandler(EmailDuplicadoException.class)
    public ResponseEntity<ErrorResponseDTO> handleEmailDuplicado(EmailDuplicadoException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponseDTO(ex.getMessage()));
    }

    @ExceptionHandler(NombreDuplicadoException.class)
    public ResponseEntity<ErrorResponseDTO> handleNombreDuplicado(NombreDuplicadoException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponseDTO(ex.getMessage()));
    }

    @ExceptionHandler(StockInsuficienteException.class)
    public ResponseEntity<ErrorResponseDTO> handleStockInsuficiente(StockInsuficienteException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponseDTO(ex.getMessage()));
    }

    @ExceptionHandler(ValidacionException.class)
    public ResponseEntity<ErrorResponseDTO> handleValidacion(ValidacionException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponseDTO(ex.getMessage()));
    }

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<ErrorResponseDTO> handleNoEncontrado(RecursoNoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponseDTO(ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDTO> handleValidacionDTO(MethodArgumentNotValidException ex) {
        String errores = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(new ErrorResponseDTO("Error de validación: " + errores));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDTO> handleGeneral(Exception ex) {
        // RNF-002: No revelar información interna del sistema
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponseDTO("Error interno del servidor. Contacte al administrador."));
    }
}
