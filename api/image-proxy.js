// api/image-proxy.js

export default async function handler(req, res) {
    // Get the image URL from the query string
    const imageUrl = req.query.url;

    // SECURITY CHECK: Very important!
    // Only allow proxying for the specific domain to prevent abuse.
    const allowedHost = 'images.ygoprodeck.com';
    if (!imageUrl || new URL(imageUrl).hostname !== allowedHost) {
        return res.status(400).json({ error: 'Invalid or disallowed URL.' });
    }

    try {
        // Fetch the image from the actual source
        const imageResponse = await fetch(imageUrl);

        if (!imageResponse.ok) {
            return res.status(imageResponse.status).json({ error: 'Failed to fetch the image from the source.' });
        }

        // Get the image data as a raw buffer
        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

        // Send the image back to your app with the correct headers
        res.setHeader('Content-Type', imageResponse.headers.get('content-type') || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=604800, s-maxage=604800'); // Cache for 7 days
        res.status(200).send(imageBuffer);

    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).json({ error: 'There was an error proxying the image.' });
    }
}