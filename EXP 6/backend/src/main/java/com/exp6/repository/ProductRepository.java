package com.exp6.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.exp6.entity.Product;

@Repository
public interface ProductRepository
        extends JpaRepository<Product, Long> {

    /*
     * PAGINATION
     *
     * Spring Data automatically applies:
     *
     * page
     * size
     * sorting
     */
    Page<Product> findAll(Pageable pageable);


    /*
     * SEARCH + PAGINATION
     */
    Page<Product> findByNameContainingIgnoreCase(
            String name,
            Pageable pageable
    );


    /*
     * CATEGORY FILTER
     */
    Page<Product> findByCategoryIgnoreCase(
            String category,
            Pageable pageable
    );


    /*
     * LOW STOCK QUERY
     */
    List<Product> findByStockLessThan(
            Integer stock
    );


    /*
     * TOP SELLING PRODUCTS
     */
    List<Product> findTop5ByOrderByTotalSoldDesc();


    /*
     * NATIVE SQL
     *
     * This demonstrates optimized/native
     * database querying.
     */
    @Query(
        value = """
                SELECT *
                FROM products
                WHERE stock > 0
                ORDER BY total_sold DESC
                LIMIT 5
                """,
        nativeQuery = true
    )
    List<Product> findTopAvailableProducts();
}