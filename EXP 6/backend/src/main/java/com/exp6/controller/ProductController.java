package com.exp6.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.exp6.entity.Product;
import com.exp6.service.ProductService;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(
        origins = "http://localhost:5173"
)
public class ProductController {

    private final ProductService productService;

    public ProductController(
            ProductService productService
    ) {
        this.productService = productService;
    }

    /*
     * =================================================
     * PAGINATION + SORTING
     *
     * GET
     * /api/products?page=0&size=5&sort=id,desc
     * =================================================
     */
    @GetMapping
    public ResponseEntity<Page<Product>> getProducts(

            @RequestParam(
                    defaultValue = "0"
            )
            int page,

            @RequestParam(
                    defaultValue = "5"
            )
            int size,

            @RequestParam(
                    defaultValue = "id,desc"
            )
            String[] sort

    ) {

        Sort.Direction direction =
                sort.length > 1 &&
                sort[1].equalsIgnoreCase("asc")
                        ? Sort.Direction.ASC
                        : Sort.Direction.DESC;

        String property =
                sort.length > 0
                        ? sort[0]
                        : "id";

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(
                                direction,
                                property
                        )
                );

        return ResponseEntity.ok(
                productService.getProducts(
                        pageable
                )
        );
    }

    /*
     * =================================================
     * SEARCH + PAGINATION
     * =================================================
     */
    @GetMapping("/search")
    public ResponseEntity<Page<Product>> search(

            @RequestParam String keyword,

            @RequestParam(
                    defaultValue = "0"
            )
            int page,

            @RequestParam(
                    defaultValue = "5"
            )
            int size

    ) {

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(
                                Sort.Direction.ASC,
                                "name"
                        )
                );

        return ResponseEntity.ok(
                productService.searchProducts(
                        keyword,
                        pageable
                )
        );
    }

    /*
     * =================================================
     * GET PRODUCT BY ID
     * =================================================
     */
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                productService.getProductById(
                        id
                )
        );
    }

    /*
     * =================================================
     * TOP SELLING
     * =================================================
     */
    @GetMapping("/analytics/top")
    public ResponseEntity<List<Product>> getTopProducts() {

        return ResponseEntity.ok(
                productService.getTopProducts()
        );
    }

    /*
     * =================================================
     * LOW STOCK
     * =================================================
     */
    @GetMapping("/analytics/low-stock")
    public ResponseEntity<List<Product>> getLowStock() {

        return ResponseEntity.ok(
                productService.getLowStockProducts()
        );
    }

    /*
     * =================================================
     * NATIVE SQL
     * =================================================
     */
    @GetMapping("/analytics/available-top")
    public ResponseEntity<List<Product>> getAvailableTop() {

        return ResponseEntity.ok(
                productService.getTopAvailableProducts()
        );
    }

    /*
     * =================================================
     * CREATE
     * =================================================
     */
    @PostMapping
    public ResponseEntity<Product> createProduct(
            @RequestBody Product product
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        productService.createProduct(
                                product
                        )
                );
    }

    /*
     * =================================================
     * UPDATE
     *
     * PUT /api/products/{id}
     * =================================================
     */
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(

            @PathVariable Long id,

            @RequestBody Product product

    ) {

        return ResponseEntity.ok(
                productService.updateProduct(
                        id,
                        product
                )
        );
    }

    /*
     * =================================================
     * DELETE
     * =================================================
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id
    ) {

        productService.deleteProduct(id);

        return ResponseEntity.noContent()
                .build();
    }
}