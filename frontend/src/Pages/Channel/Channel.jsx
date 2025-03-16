import React, { useEffect, useState } from 'react';
import API from '../../axios';
import { formatDistanceToNow } from 'date-fns';
import '../YourVideos/YourVideos.css';
import { useNavigate, useParams } from 'react-router-dom';

const Channel = () => {
  const { username } = useParams();
  const [channelData, setChannelData] = useState(null);
  const navigate = useNavigate();

  // Fetch channel Details
  useEffect(() => {
    const fetchChannelDetails = async () => {
      try {
        const response = await API.get(`/api/v1/channels/${username}`);
        setChannelData(response.data.data);
      } catch (error) {
        console.error('Error fetching channel details:', error);
      }
    };

    if (username) {
      fetchChannelDetails();
    }
  }, [username]);

  if (!channelData) return <h1>Loading...</h1>;

  const handleVideoClick = (videoId) => {
    navigate(`/watch/${videoId}`);
  };

  return (
    <div className="channelContainer">
      <div className="channelContent">
        <div className="channelCoverImage">
          <img src={channelData.coverImage} alt="Cover Image" />
        </div>
        <div className="channelAvtar">
          <div className="channelImage">
            <img src={channelData.avatar} alt="Avatar" />
          </div>
          <div className="channelUserInfo">
            <h1>{channelData.name}</h1>
            <span>
              <p>@{channelData.username}</p>
              <span className="dot"> • </span>
              <p>{channelData.subscriberCount} subscribers</p>
              <span className="dot"> • </span>
              <p>{channelData.subscriptionCount} subscriptions</p>
            </span>
            <button>
              {channelData.isSubscribed ? 'Unsubscribe' : 'Subscribe'}
            </button>
          </div>
        </div>
        <div className="channelVideoList">
          {channelData.videos.length > 0 ? (
            channelData.videos.map((video) => (
              <div
                className="channelVideoBox"
                key={video._id}
                onClick={() => handleVideoClick(video._id)}>
                <div className="channelBox">
                  <img src={video.thumbnail.url} alt={video.title} />
                </div>
                <div className="channelInfo">
                  <div className="channelUser">
                    <img src={channelData.avatar} alt="Avatar" />
                  </div>
                  <div className="channelDescription">
                    <h2>{video.title}</h2>
                    <h3>@{channelData.username}</h3>
                    <div className="channelInfo">
                      <p>{video.views} views • </p>
                      <p>
                        {formatDistanceToNow(new Date(video.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>No videos to display</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Channel;
