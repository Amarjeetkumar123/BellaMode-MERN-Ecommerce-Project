import React, { useState } from 'react'
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
        <div className='space-y-2'>
            <label className='font-medium text-sm'>{label}</label>
            {value && <img src={value} alt='' className='h-20 w-20 object-cover rounded border' />}
            <div className='flex flex-col sm:flex-row gap-2'>
                <input type='file' accept='image/*' onChange={handleFile} className='text-sm' />
                <div className='flex gap-2 flex-1'>
                    <input placeholder='or paste image URL' value={urlText}
                        onChange={(e) => setUrlText(e.target.value)} className='border p-1 rounded flex-1 text-sm' />
                    <button type='button' onClick={handleUrl} disabled={savingUrl}
                        className='px-3 py-1 bg-gray-700 text-white rounded text-sm'>Use URL</button>
                </div>
            </div>
            {(uploading || status) && <p className='text-xs text-gray-500'>{uploading ? 'Uploading…' : status}</p>}
        </div>
    );
};

export default ImageInput;
