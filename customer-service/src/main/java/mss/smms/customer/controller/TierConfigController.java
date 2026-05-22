package mss.smms.customer.controller;

import lombok.RequiredArgsConstructor;
import mss.smms.customer.dto.request.TierConfigRequest;
import mss.smms.customer.dto.response.ApiResponse;
import mss.smms.customer.dto.response.TierConfigResponse;
import mss.smms.customer.entity.TierConfig;
import mss.smms.customer.enums.TierLevel;
import mss.smms.customer.repository.TierConfigRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/tier-configs")
@RequiredArgsConstructor
public class TierConfigController {

    private final TierConfigRepository tierConfigRepository;

    /**
     * Seed default configs if none exist (first startup).
     */
    @PostConstruct
    public void seedDefaults() {
        if (tierConfigRepository.count() > 0) return;

        tierConfigRepository.saveAll(List.of(
                TierConfig.builder().tierLevel(TierLevel.REGULAR)
                        .minPoints(0).discountPercent(BigDecimal.ZERO)
                        .maxDiscountAmount(BigDecimal.ZERO)
                        .description("Khách hàng thường — không giảm giá").isActive(true).build(),
                TierConfig.builder().tierLevel(TierLevel.SILVER)
                        .minPoints(200).discountPercent(new BigDecimal("3.00"))
                        .maxDiscountAmount(new BigDecimal("50000"))
                        .description("Hạng Bạc — Giảm 3%, tối đa 50.000₫").isActive(true).build(),
                TierConfig.builder().tierLevel(TierLevel.GOLD)
                        .minPoints(1000).discountPercent(new BigDecimal("5.00"))
                        .maxDiscountAmount(new BigDecimal("100000"))
                        .description("Hạng Vàng — Giảm 5%, tối đa 100.000₫").isActive(true).build(),
                TierConfig.builder().tierLevel(TierLevel.DIAMOND)
                        .minPoints(5000).discountPercent(new BigDecimal("10.00"))
                        .maxDiscountAmount(new BigDecimal("200000"))
                        .description("Hạng Kim cương — Giảm 10%, tối đa 200.000₫").isActive(true).build()
        ));
    }

    /**
     * List all tier configs (public, for POS and admin).
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<TierConfigResponse>>> getAll() {
        List<TierConfigResponse> data = tierConfigRepository.findAllByOrderByMinPointsAsc()
                .stream().map(this::toResponse).toList();
        return ResponseEntity.ok(ApiResponse.<List<TierConfigResponse>>builder()
                .code(200).message("OK").data(data).build());
    }

    /**
     * Get discount info for a specific tier (for POS checkout).
     */
    @GetMapping("/discount")
    public ResponseEntity<ApiResponse<TierConfigResponse>> getDiscount(
            @RequestParam String tierLevel) {
        TierLevel level;
        try { level = TierLevel.valueOf(tierLevel.toUpperCase()); }
        catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.<TierConfigResponse>builder()
                    .code(400).message("Invalid tier level: " + tierLevel).build());
        }
        TierConfig config = tierConfigRepository.findByTierLevel(level)
                .orElse(TierConfig.builder().tierLevel(level).minPoints(0)
                        .discountPercent(BigDecimal.ZERO).maxDiscountAmount(BigDecimal.ZERO)
                        .isActive(false).build());
        return ResponseEntity.ok(ApiResponse.<TierConfigResponse>builder()
                .code(200).message("OK").data(toResponse(config)).build());
    }

    /**
     * Update config for a specific tier (Admin only).
     */
    @PutMapping("/{tierLevel}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TierConfigResponse>> update(
            @PathVariable String tierLevel,
            @RequestBody TierConfigRequest request) {
        TierLevel level;
        try { level = TierLevel.valueOf(tierLevel.toUpperCase()); }
        catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.<TierConfigResponse>builder()
                    .code(400).message("Invalid tier level: " + tierLevel).build());
        }

        TierConfig config = tierConfigRepository.findByTierLevel(level)
                .orElse(TierConfig.builder().tierLevel(level).minPoints(0)
                        .discountPercent(BigDecimal.ZERO).maxDiscountAmount(BigDecimal.ZERO)
                        .isActive(true).build());

        if (request.getMinPoints() != null) config.setMinPoints(request.getMinPoints());
        if (request.getDiscountPercent() != null) config.setDiscountPercent(request.getDiscountPercent());
        if (request.getMaxDiscountAmount() != null) config.setMaxDiscountAmount(request.getMaxDiscountAmount());
        if (request.getDescription() != null) config.setDescription(request.getDescription());
        if (request.getIsActive() != null) config.setIsActive(request.getIsActive());

        return ResponseEntity.ok(ApiResponse.<TierConfigResponse>builder()
                .code(200).message("Tier config updated")
                .data(toResponse(tierConfigRepository.save(config))).build());
    }

    private TierConfigResponse toResponse(TierConfig c) {
        return TierConfigResponse.builder()
                .id(c.getId())
                .tierLevel(c.getTierLevel().name())
                .minPoints(c.getMinPoints())
                .discountPercent(c.getDiscountPercent())
                .maxDiscountAmount(c.getMaxDiscountAmount())
                .description(c.getDescription())
                .isActive(c.getIsActive())
                .build();
    }
}
