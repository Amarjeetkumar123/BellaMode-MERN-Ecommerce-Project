import { useState } from 'react'
import {
    useGetBlogsQuery,
    useCreateBlogMutation,
    useDeleteBlogMutation,
} from '../../../redux/features/blogs/blogsApi'
import ImageInput from '../../../components/ImageInput'
import { Link } from 'react-router-dom'
import { card, input, primaryBtn, titleFont, linkBtn } from './adminUI'
import { AdminHead, L } from './AdminParts'

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
            <AdminHead title='Blog posts' sub='Posts appear in the journal on the store home pages.' />
            <form onSubmit={handleSubmit} className={`${card} space-y-3 mb-8 max-w-2xl`}>
                <h3 style={titleFont}>New post</h3>
                <L t='Title'><input placeholder='e.g. Five ways to wear a white shirt' required value={form.title} onChange={(e) => setField('title', e.target.value)} className={input} /></L>
                <L t='Topic (shown above the title, e.g. Style notes)'><input placeholder='e.g. Style notes' value={form.subtitle} onChange={(e) => setField('subtitle', e.target.value)} className={input} /></L>
                <L t='Text (a blank line starts a new paragraph)'><textarea placeholder='Write the post here. Leave a blank line between paragraphs.' value={form.content} onChange={(e) => setField('content', e.target.value)} className={input} rows={8} /></L>
                <ImageInput label='Cover photo' aspect={[3, 2]} note='It fills the journal card and the top of the post.' value={form.image} onChange={(url) => setField('image', url)} />
                {msg && <p className='wf-alert' role='status'>{msg}</p>}
                <button className={primaryBtn}>Publish post</button>
            </form>

            <div className='wf-atiles'>
                {blogs.map((b) => (
                    <div key={b._id} className='wf-atile'>
                        {b.image ? <img src={b.image} alt='' loading='lazy' /> : <div className='aspect-[4/3] bg-gray-100' />}
                        <div>
                            <b className='line-clamp-1'>{b.title}</b>
                            <small className='line-clamp-1'>{b.subtitle || 'Journal'}</small>
                            <div className='wf-acts'>
                                <Link to={`/journal/${b.slug}`} className={linkBtn}>View</Link>
                                <button type='button' onClick={() => window.confirm(`Delete “${b.title}”?`) && deleteBlog(b._id)} className={`${linkBtn} wf-danger`}>Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AddNewPost;
