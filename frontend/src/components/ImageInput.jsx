import { useState } from 'react'
import { useUploadFileMutation, useUploadByUrlMutation } from '../redux/features/upload/uploadApi'

// Reusable image field: upload a file OR paste a URL. Calls onChange(url) when resolved.
const ImageInput = ({ value, onChange, label = 'Image' }) => {
    const [urlText, setUrlText] = useState('');
    const [status, setStatus] = useState('');
    const [uploadFile, { isLoading: uploading }] = useUploadFileMutation();
    const [uploadByUrl, { isLoading: savingUrl }] = useUploadByUrlMutation();

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setStatus('Uploading…');
        try {
            const res = await uploadFile(file).unwrap();
            onChange(res.data.url);
            setStatus('Uploaded');
        } catch (err) {
            setStatus(err?.data?.message || 'Upload failed');
        }
    };

    const handleUrl = async () => {
        if (!urlText) return;
        setStatus('Saving…');
        try {
            const res = await uploadByUrl(urlText).unwrap();
            onChange(res.data.url);
            setUrlText('');
            setStatus('Saved');
        } catch (err) {
            setStatus(err?.data?.message || 'Failed');
        }
    };

    return (
        <div className='space-y-2 min-w-0'>
            <span className='wf-alabel'>{label}</span>
            {value && <img src={value} alt='' className='h-20 w-20 object-cover border border-gray-200 bg-gray-100' />}
            <input type='file' accept='image/*' onChange={handleFile} aria-label={`Upload ${label}`}
                className='block w-full text-sm wf-muted file:mr-3 file:py-2 file:px-4 file:border-[1.5px] file:border-black file:bg-white file:text-sm file:font-bold file:text-black hover:file:bg-black hover:file:text-white file:cursor-pointer file:transition' />
            <div className='flex gap-2 min-w-0'>
                <input placeholder='or paste an image URL' value={urlText} aria-label={`${label} URL`}
                    onChange={(e) => setUrlText(e.target.value)}
                    className='wf-ainput flex-1 min-w-0' />
                <button type='button' onClick={handleUrl} disabled={savingUrl}
                    className='wf-btn wf-btn--sm shrink-0'>Use URL</button>
            </div>
            {(uploading || status) && <p className='text-xs wf-muted'>{uploading ? 'Uploading…' : status}</p>}
        </div>
    );
};

export default ImageInput;
