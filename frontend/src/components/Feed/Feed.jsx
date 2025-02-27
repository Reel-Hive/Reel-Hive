import React, { useEffect, useRef, useState } from "react";
import './Feed.css';
import { Link, useNavigate } from 'react-router-dom';
import API from "../../axios";
import thumbnail1 from '/Assets/thumbnail1.png';
import profile_icon from '/Assets/jack.png';
import { formatDistanceToNow } from "date-fns";


// const Feed = ({ videoCount = 16 }) => {


//   const thumbnails = [
//     thumbnail1, thumbnail2, thumbnail3, thumbnail4,
//     thumbnail5, thumbnail6, thumbnail7, thumbnail8
//   ];

//   const profileImage = profile_icon;
//   const title = "Best channel to learn coding that help you to be a developer";
//   const channelName = "GrateStack";
//   const views = "15k views &bull; 2 days ago";

//   // Repeat the thumbnails as necessary
//   const repeatedThumbnails = [];
//   while (repeatedThumbnails.length < videoCount) {
//     repeatedThumbnails.push(...thumbnails);
//   }

//   // Generate the number of cards based on videoCount
//   const cards = [];
//   for (let i = 0; i < videoCount; i++) {
//     const index = i;
//     const videoId = `video_${i}`; 

//     cards.push(
//       <div className="card" key={i}>
//         <Link to={`/video/tech/${videoId}`}> {/* Add category 'tech' here */}
//           <img src={repeatedThumbnails[index]} alt="Video Thumbnail" />
//         </Link>
//         <img src={profileImage} className="profile_logo" alt="Profile" />
//         <h2>{title}</h2>
//         <h3>{channelName}</h3>
//         <p>{views}</p>
//       </div>
//     );
//   }
//   return (

//     <div className="feed">
//         {cards}
//     </div>
//   );
// }



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
              <img src={video.thumbnail.url} alt={video.title} />
              <div className="box">
                <div className="image">
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
        {/* <img src={thumbnail1} alt="" />
        <img src={profile_icon} className="profile_logo" alt="" />
        <h2>Best channel to learn coding that help you to be a developer</h2>
        <h3>GrateStack</h3>
        <p>15k views &bull; 2 days ago</p> */}
      </div>
    </div>

  )
}

export default Feed;



