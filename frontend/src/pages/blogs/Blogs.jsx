import React from 'react'
import { useGetBlogsQuery } from '../../redux/features/blogs/blogsApi'

const Blogs = () => {
    const { data } = useGetBlogsQuery();
    const blogs = data?.data?.blogs || [];

    const formatDate = (ms) => (ms ? new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '');

    return (
        <section className='section__container blog__container'>
            <h2 className='section__header'>Latest From Blog</h2>
            <p className='section__subheader'>Elevate your wardrobe with our freshest style tips, trends and inspiration.</p>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-12'>
                {blogs.map((blog) => (
                    <div key={blog._id} className='blog__card cursor-pointer hover:scale-105 transition-all duration-300'>
                        <img src={blog.image} alt={blog.title} />
                        <div className='blog__card__content'>
                            <h6>{blog.subtitle}</h6>
                            <h4>{blog.title}</h4>
                            <p>{formatDate(blog.create_date)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Blogs;
