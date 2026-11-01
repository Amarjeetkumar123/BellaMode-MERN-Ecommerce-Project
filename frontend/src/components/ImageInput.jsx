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
            <label className='font-medium text-sm'>{label}</label>
            {value && <img src={value} alt='' className='h-20 w-20 object-cover rounded-lg border' />}
            <input type='file' accept='image/*' onChange={handleFile}
                className='block w-full text-sm text-text-light file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-gray-100 file:text-text-dark hover:file:bg-gray-200 file:cursor-pointer' />
            <div className='flex gap-2 min-w-0'>
                <input placeholder='or paste image URL' value={urlText}
                    onChange={(e) => setUrlText(e.target.value)}
                    className='border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-0 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15' />
                <button type='button' onClick={handleUrl} disabled={savingUrl}
                    className='px-3 py-2 bg-text-dark text-white rounded-lg text-sm shrink-0 hover:opacity-90'>Use URL</button>
            </div>
            {(uploading || status) && <p className='text-xs text-gray-500'>{uploading ? 'Uploading…' : status}</p>}
        </div>
    );
};

export default ImageInput;
