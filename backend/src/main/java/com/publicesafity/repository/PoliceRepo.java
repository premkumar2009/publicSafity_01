package com.publicesafity.repository;

import com.publicesafity.entity.PoliceOfficer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PoliceRepo extends JpaRepository<PoliceOfficer, Long> {
    Optional<PoliceOfficer> findByEmailIgnoreCase(String email);
}
