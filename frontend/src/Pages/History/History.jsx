import React, { useContext, useEffect, useState } from 'react';
import './History.css';
import Feed from '../../components/Feed/Feed';
import { UserContext } from '../../userContext';
import thumbnail1 from '/Assets/thumbnail1.png';
import profile_icon from '/Assets/jack.png';
import API from '../../axios';
import { formatDistanceToNow } from 'date-fns';




const History = () => {
  const [watchHistory, setWatchHistory] = useState([]);
  const { user } = useContext(UserContext);

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
  return (
    <div className="feed">
      <div className="card">
        {watchHistory.length > 0 ? (
          watchHistory.map((video) => (
            <div className="videoBox"
              key={video._id}>
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
        {/* <img src={thumbnail1} alt="" />
          <img src={profile_icon} className="profile_logo" alt="" />
          <h2>Best channel to learn coding that help you to be a developer</h2>
          <h3>GrateStack</h3>
          <p>15k views &bull; 2 days ago</p> */}
      </div>
    </div>
  )
}



export default History;