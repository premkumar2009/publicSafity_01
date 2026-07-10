package com.publicesafity.repository;

import com.publicesafity.entity.AlertImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AlertImageRepo extends JpaRepository<AlertImage, Long> {
    Optional<AlertImage> findByStorageKey(String storageKey);
}
