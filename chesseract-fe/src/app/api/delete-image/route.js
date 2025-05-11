import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request) {
    try {
        const { publicId } = await request.json();
        
        if (!publicId) {
            return NextResponse.json(
                { success: false, error: 'Public ID is required' },
                { status: 400 }
            );
        }

        console.log("publicId", publicId, "process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, "process.env.CLOUDINARY_API_KEY", process.env.CLOUDINARY_API_KEY, "process.env.CLOUDINARY_API_SECRET", process.env.CLOUDINARY_API_SECRET);
        
        const result = await cloudinary.uploader.destroy(publicId);
        
        if (result.result === 'ok') {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { success: false, error: 'Failed to delete image' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
        );
    }
}