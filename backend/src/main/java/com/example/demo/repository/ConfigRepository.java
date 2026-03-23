package com.example.demo.repository;

import com.example.demo.domain.Config;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConfigRepository extends JpaRepository<Config, Long> {
    List<Config> findByKeyOrderByVersionDesc(String key);
    List<Config> findByIsActiveTrue();
    Optional<Config> findByKeyAndIsActiveTrue(String key);
    Optional<Config> findByKeyAndVersion(String key, Integer version);
}
