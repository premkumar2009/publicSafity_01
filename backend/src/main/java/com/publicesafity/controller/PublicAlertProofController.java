package com.publicesafity.controller;

import com.publicesafity.dto.AlertProofResponse;
import com.publicesafity.dto.AlertProofSubmissionRequest;
import com.publicesafity.service.AlertProofService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/public/alerts")
public class PublicAlertProofController {

    private final AlertProofService alertProofService;

    public PublicAlertProofController(AlertProofService alertProofService) {
        this.alertProofService = alertProofService;
    }

    @PostMapping(value = "/{alertId}/proofs", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> submitProof(@PathVariable Long alertId,
                                         @Valid @ModelAttribute AlertProofSubmissionRequest request,
                                         @RequestPart(value = "proofImage", required = false) MultipartFile proofImage) {
        try {
            AlertProofResponse response = alertProofService.submitPublicProof(alertId, request, proofImage);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Proof submission failed"));
        }
    }
}