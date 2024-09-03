package ru.kata.spring.boot_security.demo.exeption_handling;

import lombok.Data;

@Data
public class NoSuchUserException extends RuntimeException {
    public NoSuchUserException(String message) {
        super(message);
    }
}
