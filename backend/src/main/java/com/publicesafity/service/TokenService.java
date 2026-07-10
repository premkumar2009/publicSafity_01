package com.publicesafity.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;

@Service
public class TokenService {

    private final String secret;
    private static final long EXPIRY_SECONDS = 60L * 60L * 12L;

    public TokenService(@Value("${app.jwt.secret}") String secret) {
        this.secret = secret;
    }

    public String generateToken(Long officerId, String email) {
        long expiresAt = Instant.now().getEpochSecond() + EXPIRY_SECONDS;
        String payload = officerId + "|" + email + "|" + expiresAt;
        String encodedPayload = Base64.getUrlEncoder().withoutPadding().encodeToString(payload.getBytes(StandardCharsets.UTF_8));
        String signature = sign(encodedPayload);
        return encodedPayload + "." + signature;
    }

    public Optional<TokenPrincipal> parseToken(String token) {
        try {
            if (token == null || token.isBlank() || !token.contains(".")) {
                return Optional.empty();
            }
            String[] parts = token.split("\\.");
            if (parts.length != 2) {
                return Optional.empty();
            }
            String encodedPayload = parts[0];
            String providedSignature = parts[1];
            String expectedSignature = sign(encodedPayload);
            if (!expectedSignature.equals(providedSignature)) {
                return Optional.empty();
            }
            String payload = new String(Base64.getUrlDecoder().decode(encodedPayload), StandardCharsets.UTF_8);
            String[] values = payload.split("\\|");
            if (values.length != 3) {
                return Optional.empty();
            }
            long officerId = Long.parseLong(values[0]);
            String email = values[1];
            long expiresAt = Long.parseLong(values[2]);
            if (Instant.now().getEpochSecond() > expiresAt) {
                return Optional.empty();
            }
            return Optional.of(new TokenPrincipal(officerId, email));
        } catch (Exception ex) {
            return Optional.empty();
        }
    }

    private String sign(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(key);
            byte[] signature = mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(signature);
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to sign token", ex);
        }
    }

    public record TokenPrincipal(Long officerId, String email) {
    }
}
