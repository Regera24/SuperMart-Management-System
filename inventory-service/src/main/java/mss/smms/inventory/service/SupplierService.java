package mss.smms.inventory.service;

import mss.smms.inventory.dto.request.SupplierRequest;
import mss.smms.inventory.dto.response.SupplierResponse;

import java.util.List;

public interface SupplierService {
    SupplierResponse create(SupplierRequest request);
    SupplierResponse getById(Long id);
    List<SupplierResponse> getAll();
    SupplierResponse update(Long id, SupplierRequest request);
    void delete(Long id);
}
