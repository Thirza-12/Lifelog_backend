import Entry from '../models/entry.model.js'
import cloudinary from '../lib/cloudinary.js';

// Create a new entry
export const createEntry = async (req, res) => {
    const { title, content, images } = req.body; // Images will be base64 strings

    try {
        if (!title || !content) {
            return res.status(400).json({ message: "Fill title and content" });
        }

        // Upload images directly to Cloudinary
        const uploadedImages = await Promise.all(
            images.map(async (image) => {
                const result = await cloudinary.uploader.upload(image, {
                    transformation: [
                            { width: 800, height: 600, crop: 'limit' },
                            { quality: "auto:good", fetch_format: "auto" }
                        ]
                });
                return result.secure_url;
            })
        );

        const newEntry = await Entry.create({
            userId: req.user._id,
            title,
            content,
            images: uploadedImages
        });

        res.status(201).json(newEntry);
    } catch (error) {
        console.error('Error creating entry:', error);
        res.status(500).json({ error: 'Failed to create entry' });
    }
};


// Get all entries for logged-in user
export const getEntries = async (req, res) => {
    try {
        const entries = await Entry.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(entries);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch entries' });
    }
};

// Edit an existing entry
export const editEntry = async (req, res) => {
    const { title, content, images } = req.body; // New images as base64 strings
    const { id } = req.params; // Entry ID

    try {
        const entry = await Entry.findById(id);
        if (!entry) {
            return res.status(404).json({ error: 'Entry not found' });
        }

        // Check if the entry belongs to the logged-in user
        if (entry.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Handle image updates
        let uploadedImages = entry.images; // Default to existing images

        if (images && images.length > 0) {
            // Delete old Cloudinary images
            await Promise.all(
                entry.images.map(async (oldImage) => {
                    const publicId = oldImage.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                })
            );

            // Upload new images
            uploadedImages = await Promise.all(
                images.map(async (image) => {
                    const result = await cloudinary.uploader.upload(image, {
                        transformation: [{ width: 800, height: 600, crop: 'limit' }]
                    });
                    return result.secure_url;
                })
            );
        }

        // Update entry details
        entry.title = title || entry.title;
        entry.content = content || entry.content;
        entry.images = uploadedImages;

        await entry.save();

        res.status(200).json(entry);
    } catch (error) {
        console.error('Error editing entry:', error);
        res.status(500).json({ error: 'Failed to edit entry' });
    }
};
// Get a single entry by ID
export const getEntryById = async (req, res) => {
    const { id } = req.params;

    try {
        const entry = await Entry.findById(id);

        if (!entry) {
            return res.status(404).json({ error: 'Entry not found' });
        }

        // Ensure the entry belongs to the logged-in user
        if (entry.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        res.status(200).json(entry);
    } catch (error) {
        console.error('Error fetching entry:', error);
        res.status(500).json({ error: 'Failed to fetch entry' });
    }
};

// Delete an entry
export const deleteEntry = async (req, res) => {
    const { id } = req.params;

    try {
        const entry = await Entry.findById(id);
        if (!entry) {
            return res.status(404).json({ error: 'Entry not found' });
        }

        // Check if the entry belongs to the logged-in user
        if (entry.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Delete associated images from Cloudinary
        if (entry.images && entry.images.length > 0) {
            await Promise.all(
                entry.images.map(async (imageUrl) => {
                    const publicId = imageUrl.split('/').pop().split('.')[0];
                    try {
                        await cloudinary.uploader.destroy(publicId);
                    } catch (cloudinaryError) {
                        console.warn(`Failed to delete image: ${imageUrl}`, cloudinaryError);
                    }
                })
            );
        }

        // Delete the entry from the database
        await Entry.findByIdAndDelete(id);

        res.status(200).json({ message: 'Memory deleted successfully!' });
    } catch (error) {
        console.error('Error deleting entry:', error);
        res.status(500).json({ error: 'Failed to delete entry' });
    }
};