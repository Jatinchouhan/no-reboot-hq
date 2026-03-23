package com.example.demo.service;

import com.example.demo.domain.AuditLog;
import com.example.demo.domain.Config;
import com.example.demo.repository.AuditLogRepository;
import com.example.demo.repository.ConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ConfigService {
    private final ConfigRepository configRepository;
    private final AuditLogRepository auditLogRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public Config createConfig(String key, String value) {
        if (configRepository.findByKeyAndIsActiveTrue(key).isPresent()) {
            throw new IllegalArgumentException("Active config with this key already exists");
        }
        Config config = Config.builder()
                .key(key)
                .value(value)
                .version(1)
                .isActive(true)
                .build();
        config = configRepository.save(config);
        logAction("CREATE", key);
        broadcastUpdate(config);
        return config;
    }

    @Transactional
    @CacheEvict(value = "configs", key = "#key")
    public Config updateConfig(String key, String newValue) {
        Optional<Config> activeOpt = configRepository.findByKeyAndIsActiveTrue(key);
        if (activeOpt.isEmpty()) {
            throw new IllegalArgumentException("Active config not found");
        }
        Config active = activeOpt.get();
        active.setIsActive(false);
        configRepository.save(active);

        Config newConfig = Config.builder()
                .key(key)
                .value(newValue)
                .version(active.getVersion() + 1)
                .isActive(true)
                .build();
        newConfig = configRepository.save(newConfig);

        logAction("UPDATE", key);
        broadcastUpdate(newConfig);
        return newConfig;
    }

    @Cacheable(value = "configs", key = "#key")
    public Optional<Config> getActiveConfig(String key) {
        return configRepository.findByKeyAndIsActiveTrue(key);
    }

    public List<Config> getAllActiveConfigs() {
        return configRepository.findByIsActiveTrue();
    }

    public List<Config> getConfigHistory(String key) {
        return configRepository.findByKeyOrderByVersionDesc(key);
    }

    @Transactional
    @CacheEvict(value = "configs", key = "#key")
    public void deleteConfig(String key) {
        Optional<Config> activeOpt = configRepository.findByKeyAndIsActiveTrue(key);
        if (activeOpt.isPresent()) {
            Config active = activeOpt.get();
            active.setIsActive(false);
            configRepository.save(active);
            logAction("DELETE", key);
            broadcastUpdate(Config.builder().key(key).isActive(false).build());
        }
    }

    @Transactional
    @CacheEvict(value = "configs", key = "#key")
    public Config rollbackConfig(String key, Integer targetVersion) {
        Optional<Config> activeOpt = configRepository.findByKeyAndIsActiveTrue(key);
        activeOpt.ifPresent(active -> {
            active.setIsActive(false);
            configRepository.save(active);
        });

        Config target = configRepository.findByKeyAndVersion(key, targetVersion)
                .orElseThrow(() -> new IllegalArgumentException("Version not found"));
        target.setIsActive(true);
        target = configRepository.save(target);

        logAction("ROLLBACK", key);
        broadcastUpdate(target);
        return target;
    }

    private void logAction(String action, String key) {
        String username = "system";
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        }
        AuditLog auditLog = AuditLog.builder()
                .username(username)
                .action(action)
                .targetKey(key)
                .build();
        auditLogRepository.save(auditLog);
    }

    private void broadcastUpdate(Config config) {
        messagingTemplate.convertAndSend("/topic/configs", config);
    }
}
