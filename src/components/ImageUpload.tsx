import React, { useState } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { storageService } from '../lib/api';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  onImageUpload: (url: string) => void;
  currentImageUrl?: string;
  folderName: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, currentImageUrl, folderName }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileName = `${folderName}/${Date.now()}-${file.name}`;
      const url = await storageService.uploadFile('exam-files', fileName, file);
      onImageUpload(url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (currentImageUrl) {
      try {
        // Extract path from URL
        const urlParts = currentImageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const path = `${folderName}/${fileName}`;
        
        await storageService.deleteFile('exam-files', path);
        onImageUpload('');
        toast.success('Image removed');
      } catch (error) {
        console.error('Failed to remove image:', error);
        toast.error('Failed to remove image');
      }
    }
  };

  return (
    <div className="space-y-4">
      {currentImageUrl ? (
        <div className="relative">
          <img
            src={currentImageUrl}
            alt="Uploaded"
            className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300"
          />
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors duration-200">
          <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-sm font-medium text-gray-900 mb-2">Upload Image</p>
          <p className="text-xs text-gray-600 mb-4">
            Click to browse or drag and drop
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white cursor-pointer ${
              uploading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {uploading ? 'Uploading...' : 'Choose Image'}
          </label>
          <p className="text-xs text-gray-500 mt-2">
            PNG, JPG, GIF up to 5MB
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
