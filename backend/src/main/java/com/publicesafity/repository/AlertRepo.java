package com.publicesafity.repository;

import com.publicesafity.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AlertRepo extends JpaRepository<Alert, Long> {
    List<Alert> findByStatusOrderByCreatedAtDesc(String status);
    List<Alert> findByCreatedByOfficerIdOrderByCreatedAtDesc(Long createdByOfficerId);
    Optional<Alert> findByIdAndCreatedByOfficerId(Long id, Long createdByOfficerId);
}
