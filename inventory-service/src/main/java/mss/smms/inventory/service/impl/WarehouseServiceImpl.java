package mss.smms.inventory.service.impl;

import lombok.RequiredArgsConstructor;
import mss.smms.inventory.dto.request.WarehouseRequest;
import mss.smms.inventory.dto.response.WarehouseResponse;
import mss.smms.inventory.entity.Warehouse;
import mss.smms.inventory.exception.AppException;
import mss.smms.inventory.exception.ErrorCode;
import mss.smms.inventory.repository.WarehouseRepository;
import mss.smms.inventory.service.WarehouseService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WarehouseServiceImpl implements WarehouseService {

    private final WarehouseRepository warehouseRepository;

    @Override
    @Transactional
    public WarehouseResponse create(WarehouseRequest request) {
        Warehouse warehouse = Warehouse.builder()
                .name(request.getName())
                .location(request.getLocation())
                .build();
        return toResponse(warehouseRepository.save(warehouse));
    }

    @Override
    public WarehouseResponse getById(Long id) {
        return toResponse(warehouseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_NOT_FOUND)));
    }

    @Override
    public List<WarehouseResponse> getAll() {
        return warehouseRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public WarehouseResponse update(Long id, WarehouseRequest request) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.WAREHOUSE_NOT_FOUND));
        if (request.getName() != null) warehouse.setName(request.getName());
        if (request.getLocation() != null) warehouse.setLocation(request.getLocation());
        return toResponse(warehouseRepository.save(warehouse));
    }

    private WarehouseResponse toResponse(Warehouse w) {
        return WarehouseResponse.builder()
                .id(w.getId())
                .name(w.getName())
                .location(w.getLocation())
                .build();
    }
}
