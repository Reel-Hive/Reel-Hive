import React, { useContext, useEffect, useState } from 'react';
import API from '../../axios';
import { UserContext } from '../../userContext';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate, } from 'react-router-dom';



const LikeVideos = () => {
  const [likedVideos, setLikedVideos] = useState([]);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLikedVideos = async () => {
      try {
        const response = await API.get('/api/v1/likes/getAllLikedVideos');
        if (response.data?.data) {
          setLikedVideos(response.data.data);
        }
      } catch (error) {
        console.error('Error while fetching videos: ', error);
      }
    };

    if (user) {
      fetchLikedVideos();
    }
  }, [user]);

  const handleVideoClick = (videoId) => {
    navigate(`/watch/${videoId}`);
  };

  return (
    <div className="feed">
      <div className="card">
        {likedVideos.length > 0 ? (
          likedVideos.map(({ likedVideo }, index) => {
            const video = likedVideo[0]; // Extracting video details
            return (
              <div className="videoBox"
                key={index}
                onClick={() => handleVideoClick(video._id)}>
                <div className="box">
                  <img src={video.thumbnail.url || './images/signup-backgorund.jpg'}
                    alt={video.title || 'Video thumbnail'} />
                </div>
                <div className="feed-info">
                  <div className="user">
                    <img src={video.ownerDetails?.avatar || './images/user.svg'}
                      className="profile_logo"
                      alt={video.ownerDetails?.username || 'User avatar'} />
                  </div>
                  <div className='description'>
                    <h2>{video.title || 'Untitled video'}</h2>
                    <h3>@{video.ownerDetails?.username || 'Unknown User'}</h3>
                    <div className="info">
                      <p>{video.views || '0'} views</p> •{' '}
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

          }

          )) : (
          <p>No liked videos found </p>
        )}
      </div>
    </div>
  )
}



export default LikeVideos;