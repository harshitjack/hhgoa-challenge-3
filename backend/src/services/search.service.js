const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const os = require("os");
const sharp = require("sharp");
const env = require("../config/env");
const logger = require("../utils/logger");

/**
 * Genuine Reverse Image Search using SerpAPI Google Lens.
 * Strictly parses real search engine responses without hardcoded results.
 */
class SearchService {
  constructor() {
    this.apiKey = env.SERPAPI_KEY;
    this.baseUrl = "https://serpapi.com/search.json";
  }

  /**
   * Compresses an image to JPEG under 450KB for SerpAPI upload limit (max 500KB).
   * @param {string} imagePath - Original image path
   * @returns {Promise<{compressedPath: string, isTemp: boolean}>}
   */
  async compressImageForUpload(imagePath) {
    const fileSizeBytes = fs.statSync(imagePath).size;
    const MAX_SIZE = 450 * 1024; // 450KB

    if (fileSizeBytes <= MAX_SIZE) {
      // Check if it's already a supported format (not just size)
      const ext = path.extname(imagePath).toLowerCase();
      if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        return { compressedPath: imagePath, isTemp: false };
      }
    }

    logger.info(`Image size ${Math.round(fileSizeBytes / 1024)}KB exceeds 450KB — compressing for SerpAPI upload...`);
    const tempPath = path.join(os.tmpdir(), `serpapi_upload_${Date.now()}.jpg`);

    await sharp(imagePath)
      .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(tempPath);

    const newSize = fs.statSync(tempPath).size;
    logger.info(`Compressed image to ${Math.round(newSize / 1024)}KB at ${tempPath}`);
    return { compressedPath: tempPath, isTemp: true };
  }

  /**
   * Executes genuine reverse image search using Google Lens via SerpAPI.
   * @param {string} imagePath - Local filesystem path of the original image.
   * @param {string} [imageUrl] - Optional direct URL if available.
   * @returns {Promise<Array<{title: string, url: string, source: string, thumbnail: string}>>}
   */
  async searchGoogleLens(imagePath, imageUrl = null) {
    if (!this.apiKey) {
      throw new Error(
        "SERPAPI_KEY environment variable is not configured. Genuine reverse image search requires a valid SerpAPI key."
      );
    }

    logger.info("Executing Google Lens reverse image search via SerpAPI...");

    try {
      let response;

      if (imageUrl) {
        // Direct search via image URL
        response = await axios.get(this.baseUrl, {
          params: {
            engine: "google_lens",
            url: imageUrl,
            api_key: this.apiKey,
          },
          timeout: 25000,
        });
      } else if (imagePath && fs.existsSync(imagePath)) {
        // Compress image to stay within SerpAPI's 500KB upload limit
        const { compressedPath, isTemp } = await this.compressImageForUpload(imagePath);

        // Step 1: Upload image to SerpAPI Image API to get image_id
        logger.info("Uploading image to SerpAPI Image API...");
        const uploadForm = new FormData();
        uploadForm.append("image", fs.createReadStream(compressedPath));
        uploadForm.append("api_key", this.apiKey);

        let uploadResponse;
        try {
          uploadResponse = await axios.post("https://serpapi.com/image", uploadForm, {
            headers: {
              ...uploadForm.getHeaders(),
            },
            timeout: 30000,
          });
        } finally {
          // Clean up temp compressed file
          if (isTemp && fs.existsSync(compressedPath)) {
            fs.unlinkSync(compressedPath);
          }
        }

        const imageId = uploadResponse.data?.image_id;
        if (!imageId) {
          logger.error(`SerpAPI image upload response: ${JSON.stringify(uploadResponse.data)}`);
          throw new Error("SerpAPI image upload did not return an image_id.");
        }

        logger.info(`Image uploaded to SerpAPI. image_id: ${imageId}`);

        // Step 2: Use image_id in Google Lens search
        response = await axios.get(this.baseUrl, {
          params: {
            engine: "google_lens",
            image_id: imageId,
            api_key: this.apiKey,
          },
          timeout: 25000,
        });
      } else {
        throw new Error("A valid image file path or image URL is required for reverse image search.");
      }

      const searchData = response.data;
      const candidates = [];

      // Check for visual matches in real SerpAPI Google Lens response
      if (Array.isArray(searchData.visual_matches)) {
        for (const match of searchData.visual_matches) {
          const candidateUrl = match.link || match.url;
          const candidateThumb = match.thumbnail || match.original_image || match.image;

          if (candidateUrl) {
            candidates.push({
              title: match.title || "Discovered Visual Match",
              url: candidateUrl,
              source: match.source || new URL(candidateUrl).hostname,
              thumbnail: candidateThumb || "",
            });
          }
        }
      }

      // Check for exact matches if present
      if (Array.isArray(searchData.exact_matches)) {
        for (const match of searchData.exact_matches) {
          const candidateUrl = match.link || match.url;
          const candidateThumb = match.thumbnail || match.original_image || match.image;

          if (candidateUrl && !candidates.some((c) => c.url === candidateUrl)) {
            candidates.push({
              title: match.title || "Discovered Exact Match",
              url: candidateUrl,
              source: match.source || new URL(candidateUrl).hostname,
              thumbnail: candidateThumb || "",
            });
          }
        }
      }

      // Also parse knowledge graph or related image sections if visual_matches was empty
      if (candidates.length === 0 && Array.isArray(searchData.images_results)) {
        for (const item of searchData.images_results) {
          const candidateUrl = item.link || item.url;
          if (candidateUrl) {
            candidates.push({
              title: item.title || "Related Web Match",
              url: candidateUrl,
              source: item.source || (candidateUrl.startsWith("http") ? new URL(candidateUrl).hostname : "Web"),
              thumbnail: item.thumbnail || item.original || "",
            });
          }
        }
      }

      logger.info(`Google Lens search completed. Found ${candidates.length} candidate(s) from real search results.`);
      return candidates;
    } catch (error) {
      logger.error(`Google Lens reverse search failed: ${error.message}`);
      if (error.response) {
        logger.error(`SerpAPI error response: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }
}

module.exports = new SearchService();
