package com.publicesafity.service;

import com.publicesafity.entity.AlertImage;
import com.publicesafity.repository.AlertImageRepo;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Service
public class ImageStorageService {

    private static final long MAX_IMAGE_SIZE_BYTES = 10L * 1024L * 1024L;

    private final AlertImageRepo alertImageRepo;

    public ImageStorageService(AlertImageRepo alertImageRepo) {
        this.alertImageRepo = alertImageRepo;
    }

    public StoredImage storeImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please select an image");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }
        if (file.getSize() > MAX_IMAGE_SIZE_BYTES) {
            throw new IllegalArgumentException("Image size must be 10 MB or less");
        }

        String originalName = file.getOriginalFilename() == null ? "image" : file.getOriginalFilename();
        String safeName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
        String storageKey = UUID.randomUUID().toString();

        AlertImage alertImage = new AlertImage();
        alertImage.setStorageKey(storageKey);
        alertImage.setOriginalFileName(safeName);
        alertImage.setContentType(contentType);
        alertImage.setImageData(file.getBytes());
        alertImage.setFileSizeBytes(file.getSize());
        alertImageRepo.save(alertImage);

        return new StoredImage(storageKey, safeName, contentType, file.getSize(), "/api/uploads/images/" + storageKey);
    }

    public Optional<AlertImage> findImageByStorageKey(String storageKey) {
        return alertImageRepo.findByStorageKey(storageKey);
    }

    public record StoredImage(String storageKey, String originalFileName, String contentType, long fileSizeBytes, String imageUrl) {
    }
}