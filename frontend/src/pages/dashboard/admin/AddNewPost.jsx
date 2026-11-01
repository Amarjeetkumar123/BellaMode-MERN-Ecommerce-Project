import { useState } from 'react'
import {
    useGetBlogsQuery,
    useCreateBlogMutation,
    useDeleteBlogMutation,
} from '../../../redux/features/blogs/blogsApi'
import ImageInput from '../../../components/ImageInput'
import { card, input, primaryBtn, titleFont } from './adminUI'

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
            <h2 className='text-2xl font-bold mb-6' style={titleFont}>Blog Posts</h2>
            <form onSubmit={handleSubmit} className={`${card} space-y-3 mb-8 max-w-2xl`}>
                <h3 className='font-semibold' style={titleFont}>New Post</h3>
                <input required placeholder='Title' value={form.title} onChange={(e) => setField('title', e.target.value)} className={input} />
                <input placeholder='Subtitle' value={form.subtitle} onChange={(e) => setField('subtitle', e.target.value)} className={input} />
                <textarea placeholder='Content' value={form.content} onChange={(e) => setField('content', e.target.value)} className={input} rows={4} />
                <ImageInput value={form.image} onChange={(url) => setField('image', url)} />
                {msg && <p className='text-primary text-sm'>{msg}</p>}
                <button className={primaryBtn}>Publish Post</button>
            </form>

            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
                {blogs.map((b) => (
                    <div key={b._id} className='bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition'>
                        {b.image && <img src={b.image} alt='' className='w-full h-32 object-cover' />}
                        <div className='p-3'>
                            <p className='font-medium line-clamp-1'>{b.title}</p>
                            <p className='text-xs text-text-light line-clamp-1'>{b.subtitle}</p>
                            <button onClick={() => window.confirm('Delete post?') && deleteBlog(b._id)} className='text-primary text-sm hover:underline mt-2'>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AddNewPost;
