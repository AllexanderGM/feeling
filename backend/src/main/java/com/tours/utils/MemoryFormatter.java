package com.tours.utils;

import org.springframework.stereotype.Component;

@Component
public class MemoryFormatter {
    private static final long KILOBYTE = 1024;
    private static final long MEGABYTE = KILOBYTE * 1024;
    private static final long GIGABYTE = MEGABYTE * 1024;
    private static final long TERABYTE = GIGABYTE * 1024;

    public static String formatMemorySize(long bytes) {
        if (bytes >= TERABYTE) {
            return String.format("%.2f TB", (double) bytes / TERABYTE);
        } else if (bytes >= GIGABYTE) {
            return String.format("%.2f GB", (double) bytes / GIGABYTE);
        } else if (bytes >= MEGABYTE) {
            return String.format("%.2f MB", (double) bytes / MEGABYTE);
        } else if (bytes >= KILOBYTE) {
            return String.format("%.2f KB", (double) bytes / KILOBYTE);
        } else {
            return String.format("%d bytes", bytes);
        }
    }
}
