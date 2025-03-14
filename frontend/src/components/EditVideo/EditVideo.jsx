import React, { useEffect, useRef, useState } from 'react'
import API from '../../axios';
import { useLocation, useNavigate } from "react-router-dom";
import "./EditVideo.css";

const EditVideo = () => {
    const navigate= useNavigate();
    const location = useLocation();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [video, setVideo] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [publishStatus, setPublishStatus] = useState(false);
    const [alert, setAlert] = useState({
        message: '',
        isOpen: false,
        redirectTo: null,
    });

    const thumbnailInputRef = useRef(null);

    useEffect(() => {
        if (location.state?.video) {
            const videoData = location.state.video;
            setVideo(videoData);

            // Populate form fields with exsiting data
            setTitle(videoData.title);
            setDescription(videoData.description);
            setPublishStatus(videoData.publishStatus);
            if (videoData.thumbnail) {
                setThumbnail({ url: videoData.thumbnail.url });
            }
        }
    }, [location.state]);

    const handleThumbnailUploadClick = () => {
        thumbnailInputRef.current.click();
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnail(file);
        }
    };

    const handlePublishStatusChange = (e) => {
        setPublishStatus(e.target.value === 'true');
    };

    const handleUpdateVideo = async () => {
        // Prepare form data to send
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        if (thumbnail instanceof File) formData.append('thumbnail', thumbnail);
        formData.append('isPublished', publishStatus);

        try {
            const response = await API.patch(`/api/v1/videos/${video._id}`, formData);
            setAlert({
                message: 'Video Updated successfully',
                isOpen: true,
                redirectTo: '/home',
            });
            navigate("/home");
        } catch (error) {
            console.error('Error updating video:', error);
        }
    };

    
    return (
        <div className="editVideo-container">
            <h1>Update Video Details</h1>
            <div className="editVideo-content">
            <div className="editVideo-left">
                        <div className="editVideo-inputField">
                            <input type="text"
                                placeholder='Title (Required)'
                                name="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="editVideo-textAreaFeild">
                            <textarea name="message"
                                placeholder='Description (required)'
                                value={description}
                                onChange={(e => setDescription(e.target.value))}
                            >
                            </textarea>
                        </div>
                        <div className="editVideo-thumbnail">
                            <h4>Thumbnail</h4>
                            <div className="editVideo-boxes" onClick={handleThumbnailUploadClick}>
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
                        <div className="editVideo-publishStatus">
                            <h4>Publish Status</h4>
                            <select className="editVideo-select" value={publishStatus} onChange={handlePublishStatusChange}>
                                <option value={false} >False</option>
                                <option value={true} >True</option>
                            </select>
                        </div>
                        <button onClick={handleUpdateVideo}>Update Video</button>
                    </div>
            </div>
        </div>
        
        
    )
}

export default EditVideo;