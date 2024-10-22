# Meta Threads Media Downloader API

This API allows you to download images, videos, and carousel posts from Meta Threads. The API provides endpoints to fetch and download media content, making it easy to save and access your desired media.

## Features
**• Fetch and Download Images:** Retrieve images from Meta Threads posts.

**• Fetch and Download Videos:** Retrieve videos from Meta Threads posts.

**• Fetch and Download Carousel Posts:** Retrieve carousel images from Meta Threads posts and download them as a ZIP file.

## Endpoints -

### Fetch Image -
**• GET** `/fetch-img?q=<MetaThreadsPostUrl>`
     • Fetches and downloads an image from the specified Meta Threads post URL in the Server.

### • Download Image -
**• GET** `/download-img`
     • Downloads the last fetched image to the Client.

### Fetch Video -
**• GET** `/fetch-vid?q=<MetaThreadsPostUrl>`
    •Fetches and downloads a video from the specified Meta Threads post URL.

### Download Video -

**• GET** `/download-vid`
   • Downloads the last fetched video.
   
   *• Note: Video fetching can take up to 20-30 seconds depending on the network connection.*
     
### Fetch Carousel Images -
**• GET** `/fetch-crsel-imgs?q=<MetaThreadsPostUrl>`
    • Fetches images from a carousel post and downloads them as a ZIP file.
   
### Download Carousel Images -

**• GET** `/download-crsel-imgs`
   • Downloads the last fetched carousel images as a ZIP file.
    
   *• Note: Carousel fetching can take up to 20-30 seconds depending on the network connection.*    

