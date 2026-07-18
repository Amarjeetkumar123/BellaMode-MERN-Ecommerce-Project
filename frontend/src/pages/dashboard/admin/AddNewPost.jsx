import React, { useState } from 'react'
import {
    useGetBlogsQuery,
    useCreateBlogMutation,
    useDeleteBlogMutation,
} from '../../../redux/features/blogs/blogsApi'
import ImageInput from '../../../components/ImageInput'

const blank = { title: '', subtitle: '', content: '', image: '' };

const AddNewPost = () => {
    const { data } = useGetBlogsQuery({ all: 'true' });
    const [createBlog] = useCreateBlogMutation();
    const [deleteBlog] = useDeleteBlogMutation();
    const blogs = data?.data?.blogs || [];

    const [form, setForm] = useState(blank);
    const [msg, setMsg] = useState('');
    const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');
        try {
            await createBlog(form).unwrap();
            setForm(blank);
            setMsg('Post published.');
        } catch (err) { setMsg(err?.data?.message || 'Failed.'); }
    };

    return (
        <div>
            <h2 className='text-2xl font-semibold mb-6'>Blog Posts</h2>
            <form onSubmit={handleSubmit} className='bg-primary-light p-4 rounded space-y-3 mb-8 max-w-2xl'>
                <h3 className='font-semibold'>New Post</h3>
                <input required placeholder='Title' value={form.title} onChange={(e) => setField('title', e.target.value)} className='border p-2 rounded w-full' />
                <input placeholder='Subtitle' value={form.subtitle} onChange={(e) => setField('subtitle', e.target.value)} className='border p-2 rounded w-full' />
                <textarea placeholder='Content' value={form.content} onChange={(e) => setField('content', e.target.value)} className='border p-2 rounded w-full' rows={4} />
                <ImageInput value={form.image} onChange={(url) => setField('image', url)} />
                {msg && <p className='text-primary text-sm'>{msg}</p>}
                <button className='px-5 py-2 bg-primary text-white rounded'>Publish</button>
            </form>

            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
                {blogs.map((b) => (
                    <div key={b._id} className='border rounded p-3'>
                        {b.image && <img src={b.image} alt='' className='w-full h-28 object-cover rounded mb-2' />}
                        <p className='font-medium'>{b.title}</p>
                        <p className='text-xs text-gray-500'>{b.subtitle}</p>
                        <button onClick={() => window.confirm('Delete post?') && deleteBlog(b._id)} className='text-red-600 text-sm mt-2'>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AddNewPost;
