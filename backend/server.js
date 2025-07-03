require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 5050;
const NASA_KEY = process.env.NASA_KEY || 'DEMO_KEY';

app.use(cors());
app.use(express.json());

// memory cache
const cache = new Map();
function getCached(key, fetcher, ttlMs = 1000 * 60 * 5) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttlMs) {
    return Promise.resolve(cached.data);
  }
  return fetcher().then(data => {
    cache.set(key, { timestamp: Date.now(), data });
    return data;
  });
}

// proxy image
app.get('/proxy-image', async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) return res.status(400).send('Missing url param');

  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    res.set('Content-Type', response.headers['content-type']);
    res.send(response.data);
  } catch (err) {
    console.error('Image proxy failed:', err.message);
    res.status(500).send('Failed to fetch image');
  }
});

// NASA Image Library pic/video
app.get('/api/card1', async (req, res) => {
  try {
    const url = `https://images-api.nasa.gov/search?q=earth&media_type=image,video`;
    const response = await axios.get(url);
    const items = response.data.collection.items.slice(0, 18);

    const images = items.map(item => ({
      title: item?.data?.[0]?.title || 'Untitled',
      url: item?.links?.[0]?.href || '',
      description: item?.data?.[0]?.description || 'No description available',
      nasa_id: item?.data?.[0]?.nasa_id || 'N/A',
      center: item?.data?.[0]?.center || 'N/A',
      date: item?.data?.[0]?.date_created || '',
    }));

    res.json(images);
  } catch (err) {
    console.error('Error fetching card1:', err.message);
    res.status(500).json({ error: 'Failed to fetch NASA Image Library' });
  }
});

// EPIC pic
app.get('/api/card2', async (req, res) => {
  try {
    const metaUrl = `https://api.nasa.gov/EPIC/api/natural/images?api_key=${NASA_KEY}`;
    const data = await getCached('epic-latest', () => axios.get(metaUrl).then(r => r.data));
    const items = data.slice(0, 18);

    const images = items.map(item => {
      const date = item.date.split(' ')[0].replace(/-/g, '/');
      return {
        title: item.caption,
        url: `https://epic.gsfc.nasa.gov/archive/natural/${date}/jpg/${item.image}.jpg`,
        date: item.date,
      };
    });

    res.json(images);
  } catch (err) {
    console.error('Error fetching EPIC:', err.message);
    res.status(500).json({ error: 'Failed to fetch EPIC data' });
  }
});

// APOD pic
app.get('/api/card3', async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 17);

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}&count=18`;
    const response = await axios.get(url);

    const images = response.data
      .filter(item => item.media_type === 'image')
      .map(item => ({
        title: item.title,
        url: item.hdurl || item.url,
        explanation: item.explanation,
        date: item.date,
      }))
      .reverse();

    res.json(images);
  } catch (err) {
    console.error('Error fetching APOD:', err.message);
    res.status(500).json({ error: 'Failed to fetch APOD data' });
  }
});

// search
app.get('/api/search', async (req, res) => {
  const { lib, q } = req.query;
  if (!lib || !q) return res.status(400).json({ error: 'Missing lib or q parameter' });

  const keyword = q.toLowerCase();
  try {
    let images = [];

    if (lib === 'NASA Image Library') {
      const url = `https://images-api.nasa.gov/search?q=${q}&media_type=image`;
      const response = await axios.get(url);
      const items = response.data.collection.items.slice(0, 18);
      images = items.map(item => ({
        title: item?.data?.[0]?.title || 'Untitled',
        url: item?.links?.[0]?.href || '',
        description: item?.data?.[0]?.description || 'No description available',
        nasa_id: item?.data?.[0]?.nasa_id || 'N/A',
        center: item?.data?.[0]?.center || 'N/A',
        date: item?.data?.[0]?.date_created || '',
      }));
    } else if (lib === 'EPIC') {
      const metaUrl = `https://api.nasa.gov/EPIC/api/natural/images?api_key=${NASA_KEY}`;
      const data = await getCached('epic-search', () => axios.get(metaUrl).then(r => r.data));
      const items = data.slice(0, 30);
      images = items
        .filter(item => item.caption.toLowerCase().includes(keyword))
        .map(item => {
          const date = item.date.split(' ')[0].replace(/-/g, '/');
          return {
            title: item.caption,
            url: `https://epic.gsfc.nasa.gov/archive/natural/${date}/jpg/${item.image}.jpg`,
            date: item.date,
          };
        });
    } else if (lib === 'APOD') {
      const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}&count=40`;
      const response = await axios.get(url);
      images = response.data
        .filter(item => item.media_type === 'image' && item.title.toLowerCase().includes(keyword))
        .map(item => ({
          title: item.title,
          url: item.hdurl || item.url,
          explanation: item.explanation,
          date: item.date,
        }));
    } else {
      return res.status(400).json({ error: 'Invalid library name' });
    }

    res.json(images.slice(0, 18));
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

// EPIC detail
app.get('/api/epic-detail', async (req, res) => {
  const { date, title } = req.query;
  if (!date || !title) return res.status(400).json({ error: 'Missing date or title' });

  const cleanDate = date.split(' ')[0];
  const url = `https://api.nasa.gov/EPIC/api/natural/date/${cleanDate}?api_key=${NASA_KEY}`;

  try {
    const data = await getCached(`epic-${cleanDate}`, () => axios.get(url).then(r => r.data));
    const match = data.find(item => item.caption === title);

    if (!match) return res.status(404).json({ error: 'No matching EPIC data found' });

    res.json({
      earthToSun: match.sun_j2000_position.x,
      earthToMoon: match.lunar_j2000_position.x,
      earthToEpic: match.dscovr_j2000_position.x,
      sevAngle: match.attitude_quaternions.q0 * 10,
    });
  } catch (err) {
    console.error('EPIC detail fetch failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch EPIC detail' });
  }
});

// APOD detail
app.get('/api/apod-detail', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'Missing date parameter' });

  try {
    const data = await getCached(`apod-${date}`, () =>
      axios.get(`https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}&date=${date}`).then(r => r.data)
    );

    if (data.media_type !== 'image') {
      return res.status(404).json({ error: 'Not an image type' });
    }

    res.json({
      title: data.title,
      explanation: data.explanation,
      url: data.hdurl || data.url,
      date: data.date,
    });
  } catch (err) {
    console.error('APOD detail fetch failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch APOD detail' });
  }
});

// high-quality mage
app.get('/api/image-detail', async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  try {
    const data = await getCached(`asset-${id}`, () =>
      axios.get(`https://images-api.nasa.gov/asset/${id}`).then(r => r.data)
    );

    const items = data.collection.items;
    const video = items.find(i => i.href.endsWith('.mp4'));
    if (video) return res.json({ type: 'video', url: video.href });

    const image =
      items.find(i => i.href.includes('~orig')) ||
      items.find(i => i.href.includes('~large')) ||
      items.find(i => i.href.endsWith('.jpg')) ||
      items[0];

    if (image) return res.json({ type: 'image', url: image.href });

    res.status(404).json({ error: 'No media resource found' });
  } catch (err) {
    console.error('Failed to fetch asset:', err.message);
    res.status(500).json({ error: 'Failed to fetch media asset' });
  }
});

// meta data
app.get('/api/metadata', async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  try {
    const metaUrl = `https://images-api.nasa.gov/metadata/${id}`;
    const metaRes = await axios.get(metaUrl);
    const location = metaRes.data.location;

    if (!location) return res.status(404).json({ error: 'No metadata found' });

    const dataRes = await axios.get(location);
    res.json(dataRes.data);
  } catch (err) {
    console.error('Metadata fetch failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch metadata' });
  }
});

// caption
app.get('/api/captions', async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  try {
    const resp = await axios.get(`https://images-api.nasa.gov/captions/${id}`);
    const { location } = resp.data;

    if (!location) return res.status(404).json({ error: 'No captions found' });

    res.json({ url: location });
  } catch (err) {
    console.error('Captions fetch failed:', err.message);
    res.status(500).json({ error: 'Failed to fetch captions' });
  }
});

// notification
app.listen(port, () => {
  console.log(`NASA backend server running on port ${port}`);
});
