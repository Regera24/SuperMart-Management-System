package mss.smms.inventory.service.impl;

import mss.smms.inventory.dto.request.SupplierRequest;
import mss.smms.inventory.dto.response.SupplierResponse;
import mss.smms.inventory.entity.Supplier;
import mss.smms.inventory.exception.AppException;
import mss.smms.inventory.exception.ErrorCode;
import mss.smms.inventory.repository.SupplierRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SupplierServiceImplTest {

    @Mock
    SupplierRepository supplierRepository;

    @InjectMocks
    SupplierServiceImpl service;

    @Test
    void createRejectsDuplicateSupplierName() {
        SupplierRequest request = new SupplierRequest();
        request.setName("Fresh Farm");
        when(supplierRepository.existsByName("Fresh Farm")).thenReturn(true);

        assertThatThrownBy(() -> service.create(request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.SUPPLIER_ALREADY_EXISTS);

        verify(supplierRepository, never()).save(any());
    }

    @Test
    void updateAppliesOnlyProvidedFields() {
        Supplier existing = Supplier.builder()
                .id(7L)
                .name("Old Supplier")
                .contactInfo("old-phone")
                .build();
        SupplierRequest request = new SupplierRequest();
        request.setContactInfo("new-phone");
        when(supplierRepository.findById(7L)).thenReturn(Optional.of(existing));
        when(supplierRepository.save(existing)).thenReturn(existing);

        SupplierResponse response = service.update(7L, request);

        assertThat(response.getName()).isEqualTo("Old Supplier");
        assertThat(response.getContactInfo()).isEqualTo("new-phone");
        verify(supplierRepository).save(existing);
    }
}
