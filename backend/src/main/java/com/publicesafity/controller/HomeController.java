package com.publicesafity.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, Object> home() {
        return Map.of(
                "status", "success",
                "application", "Public Safety Alert System",
                "message", "Backend is running successfully.",
                "version", "1.0.0",
                "timestamp", Instant.now().toString()
        );
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of(
                "status", "UP",
                "database", "CONNECTED",
                "application", "Public Safety Alert System"
        );
    }
}
