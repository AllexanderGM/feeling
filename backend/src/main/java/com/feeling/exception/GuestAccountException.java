package com.feeling.exception;

public class GuestAccountException extends UnauthorizedException {

    private final String email;
    private final String errorCode;

    public GuestAccountException(String email, String errorCode, String message) {
        super(message);
        this.email = email;
        this.errorCode = errorCode;
    }

    public String getEmail() {
        return email;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
