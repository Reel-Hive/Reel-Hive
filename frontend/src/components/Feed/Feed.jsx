import React, { useEffect, useRef, useState } from "react";
import './Feed.css';
import {useNavigate } from 'react-router-dom';
import API from "../../axios";
import { formatDistanceToNow } from "date-fns";

const Feed = () => {
  const [videos, setVideos] = useState([]);
  const navigate = useNavigate();

  // Fetch vidoes data
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await API.get('/api/v1/videos/');
        if (Array.isArray(response.data.data.videos)) {
          setVideos(response.data.data.videos);
        } else {
          console.error(
            'The videos data is not an array',
            response.data.data.videos
          );
        }
      } catch (error) {
        console.error('Failed to fetch videos:', error);
      }
    };
    fetchVideos();
  }, []);

  const handleVideoClick = (videoId) => {
    navigate(`/watch/${videoId}`);
  };
  
  return (
    <div className="feed">
      <div className="card">
        {videos.length > 0 ? (
          videos.map((video) => (
            <div className="videoBox"
              key={video._id}
              onClick={() => handleVideoClick(video._id)}>
              <div className="box">
                <img src={video.thumbnail.url} alt={video.title} />
              </div>
              <div className="feed-info">
                <div className="user">
                  <img src={video.ownerDetails.avatar || './images/user.svg'}
                    className="profile_logo"
                    alt={video.ownerDetails.name} />
                </div>
                <div className='description'>
                  <h2>{video.title}</h2>
                  <h3>@{video.ownerDetails.username}</h3>
                  <div className="info">
                    <p>{video.views} views •{' '} </p>
                    <p>
                      {formatDistanceToNow(new Date(video.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )

          )) : (
          <p>No videos found. </p>
        )}
      </div>
    </div>

  )
}

export default Feed;



