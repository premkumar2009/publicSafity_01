package com.publicesafity.controller;

import com.publicesafity.service.ImageStorageService;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class FileUploadController {

    private final ImageStorageService imageStorageService;

    public FileUploadController(ImageStorageService imageStorageService) {
        this.imageStorageService = imageStorageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            ImageStorageService.StoredImage storedImage = imageStorageService.storeImage(file);
            return ResponseEntity.ok(Map.of(
                    "fileName", storedImage.storageKey(),
                    "originalFileName", storedImage.originalFileName(),
                    "imageUrl", storedImage.imageUrl(),
                    "storedIn", "postgresql"
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Image upload failed"));
        }
    }

    @GetMapping("/uploads/images/{storageKey}")
    public ResponseEntity<?> getImage(@PathVariable String storageKey) {
        Optional<com.publicesafity.entity.AlertImage> optionalImage = imageStorageService.findImageByStorageKey(storageKey);
        if (optionalImage.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Image not found"));
        }

        com.publicesafity.entity.AlertImage image = optionalImage.get();
        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(image.getContentType());
        } catch (Exception ex) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .cacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic())
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + image.getOriginalFileName() + "\"")
                .body(image.getImageData());
    }
}
