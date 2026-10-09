package com.exp6.service;

import java.util.List;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.exp6.entity.Product;
import com.exp6.repository.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /*
     * PAGINATED + SORTABLE API
     */
    public Page<Product> getProducts(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    /*
     * SEARCH
     */
    public Page<Product> searchProducts(
            String keyword,
            Pageable pageable
    ) {
        return productRepository.findByNameContainingIgnoreCase(
                keyword,
                pageable
        );
    }

    /*
     * GET PRODUCT BY ID
     */
    @Cacheable(
            value = "products",
            key = "#id"
    )
    public Product getProductById(Long id) {

        return productRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Product not found: " + id
                        )
                );
    }

    /*
     * TOP SELLING PRODUCTS
     */
    @Cacheable("topProducts")
    public List<Product> getTopProducts() {

        return productRepository
                .findTop5ByOrderByTotalSoldDesc();
    }

    /*
     * LOW STOCK
     */
    public List<Product> getLowStockProducts() {

        return productRepository
                .findByStockLessThan(20);
    }

    /*
     * NATIVE SQL
     */
    public List<Product> getTopAvailableProducts() {

        return productRepository
                .findTopAvailableProducts();
    }

    /*
     * CREATE PRODUCT
     */
    @CacheEvict(
            value = {
                    "products",
                    "topProducts"
            },
            allEntries = true
    )
    public Product createProduct(Product product) {

        return productRepository.save(product);
    }

    /*
     * UPDATE PRODUCT
     *
     * PUT /api/products/{id}
     */
    @CacheEvict(
            value = {
                    "products",
                    "topProducts"
            },
            allEntries = true
    )
    public Product updateProduct(
            Long id,
            Product updatedProduct
    ) {

        Product existingProduct = productRepository
                .findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Product not found: " + id
                        )
                );

        // Editable fields
        existingProduct.setName(
                updatedProduct.getName()
        );

        existingProduct.setCategory(
                updatedProduct.getCategory()
        );

        existingProduct.setPrice(
                updatedProduct.getPrice()
        );

        existingProduct.setStock(
                updatedProduct.getStock()
        );

        existingProduct.setDescription(
                updatedProduct.getDescription()
        );

        // Keep the existing value if frontend doesn't send it
        if (updatedProduct.getActive() != null) {
            existingProduct.setActive(
                    updatedProduct.getActive()
            );
        }

        /*
         * Do NOT replace:
         * - id
         * - totalSold
         * - createdAt
         */

        return productRepository.save(existingProduct);
    }

    /*
     * DELETE PRODUCT
     */
    @CacheEvict(
            value = {
                    "products",
                    "topProducts"
            },
            allEntries = true
    )
    public void deleteProduct(Long id) {

        productRepository.deleteById(id);
    }
}