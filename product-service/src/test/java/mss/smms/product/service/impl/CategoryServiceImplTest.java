package mss.smms.product.service.impl;

import mss.smms.product.converter.CategoryConverter;
import mss.smms.product.dto.request.CategoryRequest;
import mss.smms.product.dto.response.CategoryResponse;
import mss.smms.product.entity.Category;
import mss.smms.product.exception.AppException;
import mss.smms.product.exception.ErrorCode;
import mss.smms.product.repository.CategoryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoryServiceImplTest {

    @Mock
    CategoryRepository categoryRepository;
    @Mock
    CategoryConverter categoryConverter;

    @InjectMocks
    CategoryServiceImpl service;

    @Test
    void createCategoryGeneratesSlugFromVietnameseNameWhenSlugIsMissing() {
        CategoryRequest request = new CategoryRequest();
        request.setName("Đồ Uống Đóng Chai");
        CategoryResponse response = CategoryResponse.builder().slug("do-uong-dong-chai").build();
        when(categoryRepository.existsBySlug("do-uong-dong-chai")).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(categoryConverter.toResponse(any(Category.class))).thenReturn(response);

        CategoryResponse result = service.createCategory(request);

        ArgumentCaptor<Category> categoryCaptor = ArgumentCaptor.forClass(Category.class);
        verify(categoryRepository).save(categoryCaptor.capture());
        assertThat(categoryCaptor.getValue().getSlug()).isEqualTo("do-uong-dong-chai");
        assertThat(result.getSlug()).isEqualTo("do-uong-dong-chai");
    }

    @Test
    void createCategoryRejectsDuplicateExplicitSlug() {
        CategoryRequest request = new CategoryRequest();
        request.setName("Snacks");
        request.setSlug("snacks");
        when(categoryRepository.existsBySlug("snacks")).thenReturn(true);

        assertThatThrownBy(() -> service.createCategory(request))
                .isInstanceOf(AppException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.CATEGORY_SLUG_EXISTS);

        verify(categoryRepository, never()).save(any());
    }
}
