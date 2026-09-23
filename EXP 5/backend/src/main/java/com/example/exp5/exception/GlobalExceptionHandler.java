package com.example.exp5.exception;

import com.example.exp5.dto.ApiResponse;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /* =====================================================
       VALIDATION ERROR
       ===================================================== */

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleValidationException(
            MethodArgumentNotValidException exception
    ) {

        Map<String, String> errors =
                new HashMap<>();

        exception.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        errors.put(
                                error.getField(),
                                error.getDefaultMessage()
                        )
                );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(
                        ApiResponse.failure(
                                "Validation failed",
                                errors
                        )
                );
    }

    /* =====================================================
       RUNTIME ERROR
       ===================================================== */

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Void>>
    handleRuntimeException(
            RuntimeException exception
    ) {

        exception.printStackTrace();

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        ApiResponse.failure(
                                exception.getMessage() != null
                                        ? exception.getMessage()
                                        : "Runtime error occurred",
                                null
                        )
                );
    }

    /* =====================================================
       ALL OTHER ERRORS
       ===================================================== */

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Map<String, String>>>
    handleException(
            Exception exception,
            HttpServletRequest request
    ) {

        System.err.println(
                "========================================"
        );

        System.err.println(
                "ERROR REQUEST: "
                        + request.getMethod()
                        + " "
                        + request.getRequestURI()
        );

        System.err.println(
                "ERROR TYPE: "
                        + exception.getClass().getName()
        );

        System.err.println(
                "ERROR MESSAGE: "
                        + exception.getMessage()
        );

        exception.printStackTrace();

        System.err.println(
                "========================================"
        );

        Map<String, String> error =
                new HashMap<>();

        error.put(
                "type",
                exception.getClass().getSimpleName()
        );

        error.put(
                "message",
                exception.getMessage() != null
                        ? exception.getMessage()
                        : "No error message available"
        );

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(
                        ApiResponse.failure(
                                "Unexpected error occurred",
                                error
                        )
                );
    }
}