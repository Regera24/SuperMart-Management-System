package mss.smms.inventory.service.impl;

import lombok.RequiredArgsConstructor;
import mss.smms.inventory.dto.request.SupplierRequest;
import mss.smms.inventory.dto.response.SupplierResponse;
import mss.smms.inventory.entity.Supplier;
import mss.smms.inventory.exception.AppException;
import mss.smms.inventory.exception.ErrorCode;
import mss.smms.inventory.repository.SupplierRepository;
import mss.smms.inventory.service.SupplierService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;

    @Override
    @Transactional
    public SupplierResponse create(SupplierRequest request) {
        if (supplierRepository.existsByName(request.getName())) {
            throw new AppException(ErrorCode.SUPPLIER_ALREADY_EXISTS);
        }
        Supplier supplier = Supplier.builder()
                .name(request.getName())
                .contactInfo(request.getContactInfo())
                .build();
        return toResponse(supplierRepository.save(supplier));
    }

    @Override
    public SupplierResponse getById(Long id) {
        return toResponse(supplierRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND)));
    }

    @Override
    public List<SupplierResponse> getAll() {
        return supplierRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public SupplierResponse update(Long id, SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SUPPLIER_NOT_FOUND));
        if (request.getName() != null) supplier.setName(request.getName());
        if (request.getContactInfo() != null) supplier.setContactInfo(request.getContactInfo());
        return toResponse(supplierRepository.save(supplier));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!supplierRepository.existsById(id)) {
            throw new AppException(ErrorCode.SUPPLIER_NOT_FOUND);
        }
        supplierRepository.deleteById(id);
    }

    private SupplierResponse toResponse(Supplier s) {
        return SupplierResponse.builder()
                .id(s.getId())
                .name(s.getName())
                .contactInfo(s.getContactInfo())
                .build();
    }
}
