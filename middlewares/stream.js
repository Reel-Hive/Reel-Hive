import fs from 'fs';
import { exec } from 'child_process';
import { stderr, stdout } from 'process';

export const processVideoStream = (cloudinaryUrl, videoId) => {
  return new Promise((resolve, reject) => {
    const localPath = './public/videos';
    if (!fs.existsSync(localPath)) {
      fs.mkdirSync(localPath);
    }

    const hlsPath = `${localPath}/${videoId}.m3u8`;
    const ffmpegCommand = `ffmpeg -i "${cloudinaryUrl}" -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${localPath}/segment%03d.ts" -start_number 0 ${hlsPath}`;

    exec(ffmpegCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('FFmpeg error:', error);
        return reject(new Error('Error processing video stream'));
      }

      resolve({
        streamUrl: `http://localhost:4000/public/videos/${videoId}.m3u8`,
        hlsPath,
        localPath,
      });
    });
  });
};

export const cleanupTemporaryFiles = (localPath) => {
  if (fs.existsSync(localPath)) {
    fs.rmSync(localPath, { recursive: true, force: true });
    console.log('Temporary files deleted!');
  }
};
