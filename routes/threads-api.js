import puppeteer from "puppeteer";
import express from "express";
import { load } from "cheerio";
import fs from "fs";
import { promises as fsPromises } from 'fs';
import path from 'path';
import axios from "axios";
import JSZip from 'jszip';
import dotenv from "dotenv";
dotenv.config();
const router = express.Router();
// Variable to initiate different UUIDs for different threads
// Get the directory path of the current module
const __dirname = path.dirname(new URL(import.meta.url).pathname);
router.get("/fetch-img", async (req, res) => {
  const postUrl = req.query.q;
  const directoryPath = "./threadsRes/";

  if (!postUrl || !postUrl.includes('https://www.threads.net/')) {
    return res.status(400).send('Invalid Threads URL. Please provide a valid URL.');
  }

  try {
    // Fetch HTML content using Axios
    const response = await axios.get(postUrl);
    const body = response.data;
    const $ = load(body);
    
    const ogImageUrl = $('meta[property="og:image"]').attr("content");
    const postTitle = $('meta[property="og:title"]').attr("content");
    const postDescription = $('meta[property="og:description"]').attr("content");
    const postAuthor = $('meta[property="article:author"]').attr("content");

    // Download and save the og:image
    const imageName = `image_${uuidv4()}`;
    fetchedImageUUID = imageName; // Store the image name
    const fullImagePath = `${directoryPath}${fetchedImageUUID}.jpg`;
    const imagePath = await downloadImage(ogImageUrl, imageName, directoryPath);

    // Sending JSON as a response
    const jsonResponse = {
      response: "200",
      message: "Image downloaded on server successfully!!",
      data: {
        postData: {
          postTitle: postTitle,
          postDescription: postDescription,
          postAuthor: postAuthor,
        },
        imageData: {
          imageName: imageName,
          resolution: "HD",
          imageSizeKB: (fs.statSync(imagePath).size / 1024).toFixed(2) + "kb",
          imageSizeMB: ((fs.statSync(imagePath).size / 1024) / 1024).toFixed(2) + "mb",
          imageUrl: ogImageUrl,
        },
      },
      downloadImage: {
        message: "You can Download Image from endpoint /download-img",
        url: `/download-img?q=${postUrl}`,
      },
    };
const imgDeleteTime = 300000 / (1000 * 60);
   await setTimeout(() => {
    fs.unlink(fullImagePath, (error) => {
      if (error) {
        console.error('Error deleting image file:', error);
      } else {
        console.log('Image file deleted successfully!');
      }
    });
  }, imgDeleteTime);
    res.status(200).json(jsonResponse);
  } catch (error) {
    console.error(error);
    const errResponse = {
      response: "500",
      message: "An error occurred while fetching the image.",
      error: error.message,
    };
    res.status(500).json(errResponse);
  }
});

router.get("/fetch-vid", async (req, res) => {
  const postUrl = req.query.q;

  if (!postUrl || !postUrl.includes("https://www.threads.net/")) {
    return res.status(400).send("Invalid Threads URL. Please provide a valid URL.");
  }

  try {
    // Execute Axios request first
    const response = await axios.get(postUrl);

    // Extract meta tags from the response
    const $ = load(response.data);
    const metaTags = {
      ogImageUrl: $('meta[property="og:image"]').attr("content"),
      postTitle: $('meta[property="og:title"]').attr("content"),
      postDescription: $('meta[property="og:description"]').attr("content"),
      postAuthor: $('meta[property="article:author"]').attr("content"),
    };
    console.log('Meta tags Extracted!!');

    // Launch Puppeteer browser after the Axios request has completed
    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
        "--disable-gpu",
        "--disable-dev-shm-usage",
        '--ignore-certificate-errors',
        '--disable-background-networking',
        '--disable-background-timer-throttling',
        '--disable-extensions',
        '--disable-features=AudioServiceOutOfProcess',
        '--disable-renderer-backgrounding',
        '--mute-audio',
        '--no-first-run',
        '--no-default-browser-check',
      ],
      executablePath: process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
    });

    // Create a new page and setup interception
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (['image', 'stylesheet', 'font', 'manifest'].includes(request.resourceType())) {
        request.abort();
      } else {
        request.continue();
      }
    });
    // Go to the post URL and wait for selector to load
    await page.goto(postUrl);
    await page.waitForSelector(".x1ja2u2z");
    // Extract the nested HTML for the video
    const nestedDivsHTML = await page.evaluate(() => {
      const nestedDivs = Array.from(document.querySelectorAll('.x1ja2u2z'));
      const targetDivs = nestedDivs.filter(div => div.querySelector('.x1xmf6yo'));
      return targetDivs.map(div => ({ content: div.innerHTML }));
    });
  // Combine the HTML from nested divs
    const combinedHTML = nestedDivsHTML.map(div => div.content).join('');
    const $2 = load(combinedHTML);
    const nestedVidTagDiv = $2('.x1xmf6yo').eq(0);
    const videoUrl = nestedVidTagDiv.find('video').attr('src');
    // Send response as soon as video URL is found
    if (!videoUrl) {
      console.log("Video not found!");
      return res.json({
        response: "404",
        message: "Video not found.",
      });
    }
    console.log("Video fetched !!");
    res.json({
      response: "200",
      message: "Video URL extracted successfully!",
      data: {
        postData: {
          postTitle: metaTags.postTitle,
          postDescription: metaTags.postDescription,
          postAuthor: metaTags.postAuthor,
        },
        videoData: {
          videoUrl: videoUrl,
          resolution: "HD",
        },
      },
    });
    page.close().catch(err => console.error("Error closing page: ", err));
} catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching the video.");
  }
}); 

router.get("/fetch-crsel-media", async (req, res) => {
  const postUrl = req.query.q;

  if (!postUrl || !postUrl.includes('https://www.threads.net/')) {
    return res.status(400).send('Invalid Threads URL. Please provide a valid URL.');
  }

  async function main() {
    try {
      const browser = await puppeteer.launch({
        headless: "new",
        args: [
          "--disable-setuid-sandbox",
          "--no-sandbox",
          "--single-process",
          "--no-zygote",
          "--disable-gpu",
          "--disable-dev-shm-usage",
        ],
        executablePath:
          process.env.NODE_ENV === "production"
            ? process.env.PUPPETEER_EXECUTABLE_PATH
            : puppeteer.executablePath(),
      });

      const page = await browser.newPage();
      await page.goto(postUrl);

      // Block unnecessary resources
      await page.setRequestInterception(true);
      page.on("request", (req) => {
        const resourceType = req.resourceType();
        if (["stylesheet", "image", "font"].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      // Extract metadata
      const metaTags = await page.evaluate(() => {
        return {
          postTitle: document.querySelector('meta[property="og:title"]')?.getAttribute("content"),
          postDescription: document.querySelector('meta[property="og:description"]')?.getAttribute("content"),
          postAuthor: document.querySelector('meta[property="article:author"]')?.getAttribute("content"),
        };
      });

      // Wait for the dynamic div to load
      await page.waitForSelector('div[id^="mount_0_"]');
      // Get the HTML of the entire page
      const pageHTML = await page.content();
      const $ = load(pageHTML);

      // Find the specific div containing the images
      const targetDiv = $('.x1xmf6yo').first(); // Use `.first()` to limit to the first matching div

      if (!targetDiv.length) {
        throw new Error("Target div not found.");
      }

      console.log("Target div found!");

      // Extract and log all <picture> tags within this specific container
      const desiredImages = [];
      targetDiv.find('picture').each((index, element) => {
        const imgTag = $(element).find('img');
        const srcset = imgTag.attr('srcset');

        if (srcset) {
          // Extract the 720w image from the srcset
          const imgSrc = srcset
            .split(',')
            .find((src) => src.includes('720w'))
            ?.trim()
            .split(' ')[0]; // Get the URL part

          if (imgSrc) {
            desiredImages.push(imgSrc);
            console.log(`Image ${index + 1} (720w): images Pushed Successfully`);
          }
        } else {
          console.log(`Image ${index + 1} has no srcset.`);
        }
      });

      if (desiredImages.length === 0) {
        console.log("No valid 720w images found.");
      }

      // Zip the images
      const zip = new JSZip();
      try {
        await Promise.all(desiredImages.map(async (imgSrc, i) => {
          const response = await axios.get(imgSrc, { responseType: 'arraybuffer' });
          zip.file(`image_${i}.jpg`, response.data, { binary: true });
          console.log(`Added image_${i}.jpg to zip`);
        }));

        const zipFilePath = `./threadsRes/crsel_media/crsel_media_${uuidv4()}.zip`;
        fetchedCrselUUID = zipFilePath; // Store the file path globally for download access
        
        const content = await zip.generateAsync({ type: "nodebuffer" });
        fs.writeFileSync(zipFilePath, content);
        console.log('Zip file created successfully!');

        // Prepare the JSON response
        const jsonResponse = {
          response: "200",
          message: "Carousel posts downloaded as a zip file on server successfully!!",
          data: {
            postData: {
              postTitle: metaTags.postTitle,
              postDescription: metaTags.postDescription,
              postAuthor: metaTags.postAuthor,
            },
            crselData: {
              crselZipFileName: path.basename(zipFilePath),
              resolution: "HD",
              crselSize: ((fs.statSync(zipFilePath).size / 1024) / 1024) + "mb",
              crselUrl: "Sorry, No carousel post urls available.",
            },
          },
          downloadCrsel: {
            message: "You can Download Carousel Images from endpoint /download-crsel-media on rapid API",
            url: `/download-crsel-media?q=${postUrl}`,
          }
        };

     const crselDeleteTime = 300000 / (1000 * 60);
   await setTimeout(() => {
    fs.unlink(zipFilePath, (error) => {
      if (error) {
        console.error('Error deleting zip file:', error);
      } else {
        console.log('Zip file deleted successfully!');
      }
    });
  }, crselDeleteTime);   res.status(200).json(jsonResponse);

      } catch (err) {
        console.error("Error downloading or zipping images: ", err.message);
        res.status(500).json({
          response: "500",
          message: "Failed to download and zip carousel images.",
          error: err.message,
        });
      }

      await browser.close();
    } catch (error) {
      console.error(error);
      res.status(500).json({
        response: "500",
        message: "An error occurred while fetching the Carousel Images.",
        error: error.message,
      });
    }
  }

  await main();
});

router.get('/download-crsel-media', async (req, res) => {
  const postUrl = req.query.q;
  const zipFilePath = fetchedCrselUUID; // Assuming this is the full path

  if (!zipFilePath) {
    return res.status(400).json({ error: 'No carousel images have been fetched.' });
  }

  try {
    // Check if the file exists before proceeding
    await fsPromises.access(zipFilePath);

    const fileSize = fs.statSync(zipFilePath).size;

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${path.basename(zipFilePath)}"`,
      'Content-Length': `${fileSize}`
    });

    const zipStream = fs.createReadStream(zipFilePath);

    zipStream.pipe(res);

    zipStream.on('end', () => {
      // Delete the file after the download is complete
      fsPromises.unlink(zipFilePath)
        .then(() => {
          console.log('Zip file deleted successfully!');
        })
        .catch((error) => {
          console.error('Error deleting zip file:', error);
        });
    });

    zipStream.on('error', (err) => {
      console.error('Error streaming zip file:', err);
      res.status(500).json({ error: 'Error streaming zip file.' });
    });

  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('File not found:', zipFilePath);
      res.status(404).json({
        error: 'The carousel media file you are trying to download does not exist. Please fetch the media again.'
      });
    } else {
      console.error('Error accessing the file:', error);
      res.status(500).json({ error: 'An error occurred while accessing the file.' });
    }
  }
});


export default router