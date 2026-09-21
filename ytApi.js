// ytApi.js — YouTube Data API v3 wrapper.
// All googleapis.com communication is centralised here.
// No other module ever calls YouTube directly.

import { YT_API_KEY, YT_CHANNEL_ID } from './config.js';

// ---- Internal error type ----
class YTError extends Error {
  constructor(msg) { super(msg); this.name = 'YTError'; }
}

// ---- Core fetch wrapper ----
async function yt(path, params) {
  const url = new URL('https://www.googleapis.com/youtube/v3/' + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  url.searchParams.set('key', YT_API_KEY);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  let response, json;
  try {
    response = await fetch(url, { signal: controller.signal });
    json = await response.json().catch(() => null);
  } catch (err) {
    throw new YTError(
      err?.name === 'AbortError'
        ? 'YouTube took too long to respond. Try again.'
        : 'Could not reach YouTube. Check your connection or ad-blocker.'
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const reason = json?.error?.errors?.[0]?.reason || json?.error?.message || `HTTP ${response.status}`;
    if (/keyInvalid|API key not valid/i.test(reason))
      throw new YTError('Invalid YouTube API key. Update config.js with a valid key.');
    if (/quota|rateLimitExceeded|dailyLimitExceeded/i.test(reason))
      throw new YTError('YouTube API quota exhausted. Try again tomorrow.');
    if (/accessNotConfigured|SERVICE_DISABLED/i.test(reason))
      throw new YTError('YouTube Data API is not enabled for this key. Check Google Cloud Console.');
    throw new YTError(`YouTube API error: ${reason}`);
  }

  return json || {};
}

// ---- ISO 8601 duration → seconds ----
function isoSecs(iso) {
  const m = (iso || '').match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] || 0) * 3600) + (parseInt(m[2] || 0) * 60) + parseInt(m[3] || 0);
}

// ---- Filter: skip deleted/private/live/shorts ----
function isValidVideo(item, dur) {
  const title = item.snippet?.title || '';
  if (/^(private|deleted) video$/i.test(title)) return false;
  const broadcast = item.snippet?.liveBroadcastContent;
  if (broadcast === 'live' || broadcast === 'upcoming') return false;
  if (dur <= 95) return false; // YouTube Shorts threshold
  return true;
}

// ---- Public API ----

/**
 * Fetch full metadata for an array of video IDs.
 * Batches automatically at the API's hard limit of 50.
 * @param {string[]} ids
 * @returns {Promise<Array<{id, title, duration, publishedAt}>>}
 */
export async function fetchVideoDetails(ids) {
  const results = [];
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const data = await yt('videos', {
      part: 'snippet,contentDetails',
      id: batch.join(','),
    });
    for (const item of data.items || []) {
      const dur = isoSecs(item.contentDetails?.duration);
      if (!isValidVideo(item, dur)) continue;
      results.push({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description || '',
        tags: item.snippet.tags || [],
        duration: dur,
        publishedAt: item.snippet.publishedAt
          ? new Date(item.snippet.publishedAt).getTime()
          : 0,
      });
    }
  }
  return results;
}

/**
 * Scan the channel's uploads playlist and return an array of video IDs.
 * @param {{ fullScan?: boolean }} opts — fullScan=false stops after 2 pages (incremental)
 * @returns {Promise<string[]>}
 */
export async function fetchChannelUploads({ fullScan = true } = {}) {
  // Resolve the uploads playlist ID from the channel
  const channelData = await yt('channels', {
    part: 'contentDetails',
    id: YT_CHANNEL_ID,
  });
  const uploadsId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsId) throw new YTError('Could not find uploads playlist for this channel.');

  const videoIds = [];
  let pageToken = '';
  let page = 0;
  const maxPages = fullScan ? 60 : 2;

  while (page < maxPages) {
    const params = {
      part: 'contentDetails',
      playlistId: uploadsId,
      maxResults: 50,
    };
    if (pageToken) params.pageToken = pageToken;

    const data = await yt('playlistItems', params);
    for (const item of data.items || []) {
      const id = item.contentDetails?.videoId;
      if (id) videoIds.push(id);
    }

    pageToken = data.nextPageToken || '';
    page++;
    if (!pageToken) break;
  }

  return videoIds;
}

/**
 * Fetch channel-level statistics (title, avatar, subscriber count, etc).
 * @returns {Promise<{title, avatar, subs, views, videos}>}
 */
export async function fetchChannelInfo() {
  const data = await yt('channels', {
    part: 'snippet,statistics',
    id: YT_CHANNEL_ID,
  });
  const item = data.items?.[0];
  if (!item) throw new YTError('Channel not found.');

  return {
    title:  item.snippet?.title   || '',
    avatar: item.snippet?.thumbnails?.medium?.url || '',
    subs:   parseInt(item.statistics?.subscriberCount || '0', 10),
    views:  parseInt(item.statistics?.viewCount       || '0', 10),
    videos: parseInt(item.statistics?.videoCount      || '0', 10),
  };
}

export { YTError };
