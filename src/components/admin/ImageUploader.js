import React, { useState, useRef } from 'react';
import { uploadImages } from '../../services/productService';
import { BASE_URL } from '../../services/api';

const ImageUploader = ({ onImagesUploaded, currentImages = [] }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    const imageFiles = files.filter(
      (file) =>
        file.type.startsWith('image/') ||
        ['jpg', 'jpeg', 'png', 'gif'].includes(file.name.split('.').pop().toLowerCase())
    );

    if (imageFiles.length === 0) {
      setError('Пожалуйста, выберите изображения (JPG, PNG, GIF)');
      return;
    }

    try {
      setError(null);
      setUploading(true);
      console.log('Uploading files:', imageFiles);
      const uploadedImages = await uploadImages(imageFiles);
      console.log('Upload successful:', uploadedImages);
      onImagesUploaded(uploadedImages);
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Ошибка при загрузке изображений. Проверьте формат и размер файлов.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    const newImages = [...currentImages];
    newImages.splice(index, 1);
    onImagesUploaded(newImages);
  };

  const getImageUrl = (image) => {
    if (!image) return `${BASE_URL}/placeholder-image.jpg`;
    if (image.startsWith('http')) return image;
    const cleanPath = image.startsWith('/') ? image : `/${image}`;
    return `${BASE_URL}${cleanPath}`;
  };

  return (
    <div className="image-uploader">
      {/* Зона для drag and drop */}
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: isDragging ? '2px dashed #8d1f2c' : '2px dashed #ddd',
          backgroundColor: isDragging ? 'rgba(141, 31, 44, 0.05)' : '#f9f9f9',
          padding: '2rem',
          textAlign: 'center',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onClick={() => fileInputRef.current.click()}
      >
        {uploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              className="spinner"
              style={{
                width: '30px',
                height: '30px',
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #8d1f2c',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '1rem',
              }}
            ></div>
            <p>Загрузка изображений...</p>
          </div>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8d1f2c"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginBottom: '1rem' }}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <p style={{ marginBottom: '0.5rem' }}>Перетащите изображения сюда или нажмите для выбора</p>
            <small style={{ color: '#666', display: 'block' }}>Поддерживаемые форматы: JPG, PNG, GIF (макс. 5MB)</small>
          </>
        )}
      </div>

      {/* Скрытый input для выбора файлов */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/gif"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      {/* Отображение ошибок */}
      {error && (
        <div
          style={{
            color: '#c33',
            backgroundColor: '#ffebee',
            padding: '0.75rem',
            borderRadius: '4px',
            marginTop: '1rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Предпросмотр загруженных изображений */}
      {currentImages && currentImages.length > 0 && (
        <div
          className="image-preview-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '1rem',
            marginTop: '2rem',
          }}
        >
          {currentImages.map((image, index) => (
            <div
              key={index}
              style={{
                position: 'relative',
                aspectRatio: '1/1',
              }}
            >
              <img
                src={getImageUrl(image)}
                alt={`Preview ${index + 1}`}
                onError={(e) => {
                  e.target.src = `${BASE_URL}/placeholder-image.jpg`;
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  border: '1px solid #eee',
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  background: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
