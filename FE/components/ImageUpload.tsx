'use client';

import { useState, useRef } from 'react';
import { azureStorage } from '@/lib/azureStorage';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string | null) => void;
  disabled?: boolean;
}

export default function ImageUpload({ currentImage, onImageChange, disabled }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      // Upload new image using SAS token from backend
      const imageUrl = await azureStorage.uploadImage(file);
      onImageChange(imageUrl);
      
      // Delete old image if exists
      if (currentImage && currentImage.includes('blob.core.windows.net')) {
        try {
          await azureStorage.deleteImage(currentImage);
        } catch (error) {
          console.warn('Failed to delete old image:', error);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleRemoveImage = async () => {
    if (currentImage && currentImage.includes('blob.core.windows.net')) {
      try {
        await azureStorage.deleteImage(currentImage);
      } catch (error) {
        console.warn('Failed to delete image:', error);
      }
    }
    onImageChange(null);
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ 
        display: 'block', 
        marginBottom: '5px', 
        fontWeight: 'bold',
        color: '#2c3e50'
      }}>
        Product Image
      </label>
      
      {currentImage ? (
        <div style={{ marginBottom: '10px' }}>
          <img 
            src={currentImage} 
            alt="Product" 
            style={{ 
              width: '200px', 
              height: '200px', 
              objectFit: 'cover', 
              borderRadius: '8px',
              border: '1px solid #ddd'
            }} 
          />
          <div style={{ marginTop: '10px' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
              style={{
                padding: '8px 16px',
                marginRight: '8px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: disabled || uploading ? 'not-allowed' : 'pointer',
                opacity: disabled || uploading ? 0.6 : 1
              }}
            >
              {uploading ? 'Uploading...' : 'Change Image'}
            </button>
            <button
              type="button"
              onClick={handleRemoveImage}
              disabled={disabled || uploading}
              style={{
                padding: '8px 16px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: disabled || uploading ? 'not-allowed' : 'pointer',
                opacity: disabled || uploading ? 0.6 : 1
              }}
            >
              Remove Image
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? '#3b82f6' : '#ddd'}`,
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center',
            cursor: disabled || uploading ? 'not-allowed' : 'pointer',
            background: dragOver ? '#f0f9ff' : '#fafafa',
            transition: 'all 0.2s ease',
            opacity: disabled || uploading ? 0.6 : 1
          }}
        >
          {uploading ? (
            <div>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
              <p style={{ color: '#666', margin: 0 }}>Uploading image...</p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
              <p style={{ color: '#666', margin: '0 0 8px 0' }}>
                Drag and drop an image here, or click to select
              </p>
              <p style={{ color: '#999', fontSize: '14px', margin: 0 }}>
                Supports: JPG, PNG, GIF (max 5MB)
              </p>
            </div>
          )}
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        disabled={disabled || uploading}
      />
    </div>
  );
}