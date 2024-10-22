import axios from "axios";
import fetch from 'node-fetch';
import fs from 'fs';

async function downloadImage(ogImageUrl, imageName, directoryPath) {
  try {
    const response = await fetch(ogImageUrl);
    const buffer = await response.arrayBuffer();

    const fileName = `${directoryPath}${imageName}.jpg`;
    await fs.promises.writeFile(fileName, Buffer.from(buffer));

    console.log(`Image ${fileName} downloaded!`);
    return fileName;
  } catch (error) {
    console.error(`Error downloading image ${ogImageUrl}:`, error.message);
    throw error;
  }
}

async function downloadVideo(videoUrl, videoName, directoryPath){
  try {
    const response = await axios.get(videoUrl, { responseType: 'arraybuffer' });
    const buffer = response.data;

    const fileName = `${directoryPath}${videoName}.mp4`;
    await fs.promises.writeFile(fileName, Buffer.from(buffer));

    console.log(`Video ${fileName} downloaded!`);
    return fileName;
  } catch (error) {
    console.error(`Error downloading video ${videoUrl}:`, error.message);
    throw error;
  }
}

export { downloadImage, downloadVideo };