import React from 'react'
import { Link } from 'react-router-dom'
import { useGetCategoriesQuery } from '../../redux/features/categories/categoriesApi'

const Categories = () => {
    const { data } = useGetCategoriesQuery();
    // Show up to 8 categories that have an image, dynamically from the API.
    const categories = (data?.data?.categories || []).filter((c) => c.image).slice(0, 8);

    return (
        <div className='product__grid'>
            {categories.map((category) => (
                <Link key={category._id} to={`/categories/${category.slug}`} className='categories__card'>
                    <img src={category.image} alt={category.name} />
                    <h4>{category.name}</h4>
                </Link>
            ))}
        </div>
    );
};

export default Categories;
