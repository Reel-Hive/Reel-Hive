import React, { useContext, useEffect, useState } from 'react';
import './Subscription.css';
import { UserContext } from '../../UserContext';
import API from '../../axios';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate, } from 'react-router-dom';

const Subscription = () => {
  const { user } = useContext(UserContext);
  const [subscribedChannels, setSubscribedChannels] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubscribedChannels = async () => {
      try {
        const response = await API.get(
          `/api/v1/subscriptions/u/${user._id}`
        );
        setSubscribedChannels(response.data.subscribedChannels);
        console.log("Subscription Response:", response.data); // Debugging
      } catch (error) {
        console.error(
          "Error while fetching the subscribed channel's videos: ",
          error
        );
      }
    };
    fetchSubscribedChannels();
  }, [user]);

  const handleVideoClick = (videoId) => {
    navigate(`/watch/${videoId}`);
  };


  return (
    <div className="feed">
      <div className="card">
        {subscribedChannels.length > 0 ? (
          subscribedChannels.map((channel) => (
            <div className="videoBox" key={channel._id}
              onClick={() => handleVideoClick(channel.latestVideo._id)}>
              <div className="box">
                <img src={channel.latestVideo.thumbnail.url} alt={channel.name} />
              </div>
              <div className="feed-info">
                <div className="user">
                  <img src={channel.avatar} className='profile_logo' alt={channel.name} />
                </div>
                <div className='description'>
                  <h2>{channel.latestVideo.title}</h2>
                  <h3>@{channel.username}</h3>
                  <div className="info">
                    <p>{channel.latestVideo.views} views • </p>
                    <p>
                      {formatDistanceToNow(new Date(channel.latestVideo.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No subscriptions found</p>
        )}
      </div>
    </div>
  );

}



export default Subscription;