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
          imageUrl: ogImageUrl,
        },
      },
    };
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

async function main(postUrl) {
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
        "--ignore-certificate-errors",
        "--disable-background-networking",
        "--disable-background-timer-throttling",
        "--disable-extensions",
        "--disable-features=AudioServiceOutOfProcess",
        "--disable-renderer-backgrounding",
        "--mute-audio",
        "--no-first-run",
        "--no-default-browser-check",
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
        console.log("Resources Blocked!!");
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
    // Extract and log all <picture> tags within this specific container
    const pageHTML = await page.content();
    const $ = load(pageHTML);

    // Find the specific div containing the images
    const targetDiv = $(".x1xmf6yo").first();
    if (!targetDiv.length) {
      throw new Error("Target div not found.");
    }
    console.log("Target div found!");
const desiredImages = [];
  targetDiv.find("picture").each((i, element) => {
    const imgTag = $(element).find("img"); // Find img within picture
    const imgSrc = imgTag.attr("src"); // Get the src attribute

    if (imgSrc) {
      console.log(`Image ${i + 1}: ${imgSrc}`);
      desiredImages.push(imgSrc);
    } else {
      console.log(`Image ${i + 1}: No src attribute found`);
    }
  });
    // Construct the JSON response
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
          resolution: "HD",
          crselImgUrls: desiredImages,
        },
      },
    };

    console.log("Json response sent !!", jsonResponse);

    await browser.close();
    return jsonResponse;
  } catch (error) {
    console.error("Error:", error.message);
    return {
      response: "500",
      message: "An error occurred while fetching the Carousel Images.",
      error: error.message,
    };
  }
}
main();
  
});

export default router