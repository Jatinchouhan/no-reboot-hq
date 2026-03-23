package com.example.demo.controller;

import com.example.demo.domain.Config;
import com.example.demo.payload.request.ConfigRequest;
import com.example.demo.service.ConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/configs")
@RequiredArgsConstructor
public class ConfigController {

    private final ConfigService configService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('DEVELOPER') or hasRole('VIEWER')")
    public ResponseEntity<List<Config>> getAllConfigs() {
        return ResponseEntity.ok(configService.getAllActiveConfigs());
    }

    @GetMapping("/{key}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DEVELOPER') or hasRole('VIEWER')")
    public ResponseEntity<Config> getConfig(@PathVariable String key) {
        return configService.getActiveConfig(key)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('DEVELOPER')")
    public ResponseEntity<Config> createConfig(@Valid @RequestBody ConfigRequest request) {
        return ResponseEntity.ok(configService.createConfig(request.getKey(), request.getValue()));
    }

    @PutMapping("/{key}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DEVELOPER')")
    public ResponseEntity<Config> updateConfig(@PathVariable String key, @Valid @RequestBody ConfigRequest request) {
        return ResponseEntity.ok(configService.updateConfig(key, request.getValue()));
    }

    @DeleteMapping("/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteConfig(@PathVariable String key) {
        configService.deleteConfig(key);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/history/{key}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('DEVELOPER')")
    public ResponseEntity<List<Config>> getConfigHistory(@PathVariable String key) {
        return ResponseEntity.ok(configService.getConfigHistory(key));
    }

    @PostMapping("/rollback/{key}/{versionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Config> rollbackConfig(@PathVariable String key, @PathVariable Integer versionId) {
        return ResponseEntity.ok(configService.rollbackConfig(key, versionId));
    }
}
