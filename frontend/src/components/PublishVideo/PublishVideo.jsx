import React, { useRef, useState } from 'react';
import API from '../../axios';
import './PublishVideo.css';

const PublishVideo = () => {
    const [thumbnail, setThumbnail] = useState(null);
    const [video, setVideo] = useState(null);
    const [publishStatus, setPublishStatus] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [alert, setAlert] = useState({
        message: '',
        isOpen: false,
        redirectTo: null,
    });

    const thumbnailInputRef = useRef(null);
    const videoInputRef = useRef(null);

    const handleThumbnailUploadClick = () => {
        thumbnailInputRef.current.click();
    };

    const handleVideoUploadClick = () => {
        videoInputRef.current.click();
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnail(file);
        }
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideo(file);
        }
    };

    const handlePublishStatusChange = (e) => {
        setPublishStatus(e.target.value === 'true');
    };

    const handlePublish = async () => {
        if (!title || !description || !video || !thumbnail) {
            alert('All files are required!');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('videoFile', video);
        formData.append('thumbnail', thumbnail);
        formData.append('isPublished', publishStatus);

        try {
            const response = await API.post('/api/v1/videos/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log(response.data.data.video);
            setAlert({
                message: 'Video Created successfully',
                isOpen: true,
                redirectTo: '/home',
            });
        } catch (error) {
            setAlert({
                message: error.response?.data?.message || 'Something went wrong!',
                isOpen: true,
            });
        }
    };
    return (
        <div>
            <div className="publishVideo-container">
                <h1>Video Details</h1>
                <div className="publishVideo-content">
                    <div className="publishVideo-left">
                        <div className="publishVideo-inputField">
                            <input type="text"
                                placeholder='Title (Required)'
                                name="title"
                                value={FormData.title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="publishVideo-textAreaFeild">
                            <textarea name="message"
                                placeholder='Description (required)'
                                value={FormData.description}
                                onChange={(e => setDescription(e.target.value))}
                            >
                            </textarea>
                        </div>
                        <div className="publishVideo-thumbnail">
                            <h4>Thumbnail</h4>
                            <div className="publishVideo-boxes" onClick={handleThumbnailUploadClick}>
                                {thumbnail ? (
                                    <img
                                        src={URL.createObjectURL(thumbnail)}
                                        alt="Thumbnail preview"
                                    />
                                ) : (
                                    <i className="bx bxs-camera"></i>
                                )}
                            </div>
                            <input type="file"
                                ref={thumbnailInputRef}
                                style={{ display: 'none' }}
                                accept='image/*'
                                onChange={handleThumbnailChange}
                            />
                        </div>
                        <button onClick={handlePublish}>Publish Video</button>
                    </div>
                    <div className="publishVideo-right">
                        <div className="publishVideo-upload" onClick={handleVideoUploadClick} >
                            {video ? (
                                <video src={URL.createObjectURL(video)} controls />
                            ) : (
                                <>
                                    <i className="bx bxs-camera"></i>
                                    <span>Upload video</span>
                                </>
                            )}
                        </div>
                        <input type='file'
                            ref={videoInputRef}
                            style={{ display: 'none' }}
                            accept="video/*"
                            onChange={handleVideoChange}
                        />
                        <div className="publishVideo-publishStatus">
                            <h4>Publish Status</h4>
                            <select className="publishVideo-select" value={publishStatus} onChange={handlePublishStatusChange}>
                                <option value={false} >False</option>
                                <option value={true} >True</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PublishVideo;