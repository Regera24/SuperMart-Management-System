package mss.smms.inventory.service;

import mss.smms.inventory.dto.request.WarehouseRequest;
import mss.smms.inventory.dto.response.WarehouseResponse;

import java.util.List;

public interface WarehouseService {
    WarehouseResponse create(WarehouseRequest request);
    WarehouseResponse getById(Long id);
    List<WarehouseResponse> getAll();
    WarehouseResponse update(Long id, WarehouseRequest request);
}
