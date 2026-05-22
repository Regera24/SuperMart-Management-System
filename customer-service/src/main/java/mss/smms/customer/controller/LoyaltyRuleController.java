package mss.smms.customer.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mss.smms.customer.dto.request.LoyaltyRuleRequest;
import mss.smms.customer.dto.response.ApiResponse;
import mss.smms.customer.dto.response.LoyaltyRuleResponse;
import mss.smms.customer.entity.LoyaltyRule;
import mss.smms.customer.repository.LoyaltyRuleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/loyalty-rules")
@RequiredArgsConstructor
public class LoyaltyRuleController {

    private final LoyaltyRuleRepository loyaltyRuleRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LoyaltyRuleResponse>>> getAll() {
        List<LoyaltyRuleResponse> data = loyaltyRuleRepository.findAll().stream()
                .map(this::toResponse).toList();
        return ResponseEntity.ok(ApiResponse.<List<LoyaltyRuleResponse>>builder()
                .code(200).message("OK").data(data).build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<LoyaltyRuleResponse>> create(
            @Valid @RequestBody LoyaltyRuleRequest request) {
        LoyaltyRule rule = LoyaltyRule.builder()
                .name(request.getName())
                .pointConversionRate(request.getPointConversionRate())
                .minOrderValue(request.getMinOrderValue())
                .isActive(request.getIsActive())
                .priority(request.getPriority())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();
        return ResponseEntity.status(201).body(ApiResponse.<LoyaltyRuleResponse>builder()
                .code(201).message("Loyalty rule created")
                .data(toResponse(loyaltyRuleRepository.save(rule))).build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<LoyaltyRuleResponse>> update(
            @PathVariable Long id, @RequestBody LoyaltyRuleRequest request) {
        LoyaltyRule rule = loyaltyRuleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Loyalty rule not found"));
        if (request.getName() != null) rule.setName(request.getName());
        if (request.getPointConversionRate() != null) rule.setPointConversionRate(request.getPointConversionRate());
        if (request.getMinOrderValue() != null) rule.setMinOrderValue(request.getMinOrderValue());
        if (request.getIsActive() != null) rule.setIsActive(request.getIsActive());
        if (request.getPriority() != null) rule.setPriority(request.getPriority());
        if (request.getStartDate() != null) rule.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) rule.setEndDate(request.getEndDate());
        return ResponseEntity.ok(ApiResponse.<LoyaltyRuleResponse>builder()
                .code(200).message("Loyalty rule updated")
                .data(toResponse(loyaltyRuleRepository.save(rule))).build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        loyaltyRuleRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(200).message("Loyalty rule deleted").build());
    }

    private LoyaltyRuleResponse toResponse(LoyaltyRule r) {
        return LoyaltyRuleResponse.builder()
                .id(r.getId())
                .name(r.getName())
                .pointConversionRate(r.getPointConversionRate())
                .minOrderValue(r.getMinOrderValue())
                .isActive(r.getIsActive())
                .priority(r.getPriority())
                .startDate(r.getStartDate())
                .endDate(r.getEndDate())
                .build();
    }
}
