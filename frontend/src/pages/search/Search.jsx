import React, { useState } from 'react'
import ProductCard from '../shop/ProductCard';
import { useGetProductsQuery } from '../../redux/features/products/productsApi';

const Search = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [submitted, setSubmitted] = useState("");

    const { data, isFetching } = useGetProductsQuery({ search: submitted, limit: 50 }, { skip: submitted === "" && false });
    const products = data?.data?.products || [];

    const handleSearch = (e) => {
        e?.preventDefault();
        setSubmitted(searchQuery.trim());
    };

    return (
        <>
            <section className='page-hero'>
                <h1>Search Products</h1>
                <p>Find exactly what you are looking for across our collection.</p>
            </section>
            <section className='section__container'>
                <form onSubmit={handleSearch} className='w-full mb-12 flex flex-col md:flex-row items-center justify-center gap-4'>
                    <input type='text' value={searchQuery} placeholder='Search for products...'
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='search-bar w-full max-w-4xl p-2 border rounded' />
                    <button type='submit' className='search-button w-full md:w-auto py-2 px-8 bg-primary text-white rounded'>Search</button>
                </form>
                {isFetching ? (
                    <p>Searching…</p>
                ) : products.length === 0 ? (
                    <p className='text-gray-500 text-center'>No products found{submitted ? ` for “${submitted}”` : ''}.</p>
                ) : (
                    <ProductCard products={products} />
                )}
            </section>
        </>
    );
};

export default Search;
