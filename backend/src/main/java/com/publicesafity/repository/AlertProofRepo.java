package com.publicesafity.repository;

import com.publicesafity.entity.AlertProof;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AlertProofRepo extends JpaRepository<AlertProof, Long> {
    List<AlertProof> findByAlertIdOrderByCreatedAtDesc(Long alertId);

    Optional<AlertProof> findByIdAndAlertId(Long id, Long alertId);
}