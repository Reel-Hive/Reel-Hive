import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../userContext';
import API from '../../axios';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate, } from 'react-router-dom';


const History = () => {
  const [watchHistory, setWatchHistory] = useState([]);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWatchHistory = async () => {
      try {
        const response = await API.get(`/api/v1/users/${user._id}/getHistory`);

        if (response.data?.data) {
          setWatchHistory(response.data.data);
        }
      } catch (error) {
        console.error('Error while fetching watch history: ', error);
      }
    };

    if (user) {
      fetchWatchHistory();
    }
  }, [user]);

  const handleVideoClick = (videoId) => {
    navigate(`/watch/${videoId}`);
  };

  return (
    <div className="feed">
      <div className="card">
        {watchHistory.length > 0 ? (
          watchHistory.map((video) => (
            <div className="videoBox"
            key={video._id}
              onClick={() => handleVideoClick(video._id)}>
              <div className="box">
                <img src={video.thumbnail.url || './images/signup-backgorund.jpg'}
                  alt={video.title} />
              </div>
              <div className="feed-info">
                <div className="user">
                  <img src={video.owner.avatar || './images/user.svg'}
                    className="profile_logo"
                    alt={video.owner.username} />
                </div>
                <div className='description'>
                  <h2>{video.title}</h2>
                  <h3>@{video.owner.username}</h3>
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
          <p>No watch history found </p>
        )}
      </div>
    </div>
  )
}



export default History;