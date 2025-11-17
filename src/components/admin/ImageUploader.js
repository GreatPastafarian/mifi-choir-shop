import React, { useState, useRef } from 'react';
import { uploadImages } from '../../services/productService';
import { BASE_URL } from '../../services/api';

// Вычисляем чистый домен сервера один раз
const SERVER_URL = BASE_URL.replace(/\/api\/?$/, '');

const ImageUploader = ({ onImagesUploaded, currentImages = [], onImageDelete, uploadType = 'default' }) => {
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
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      setError('Пожалуйста, выберите изображения (JPG, PNG, GIF)');
      return;
    }

    try {
      setError(null);
      setUploading(true);
      // Передаем тип загрузки (product/category)
      const uploadedImages = await uploadImages(imageFiles, uploadType);
      onImagesUploaded(uploadedImages);
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Ошибка при загрузке изображений. Проверьте формат и размер файлов.');
    } finally {
      setUploading(false);
    }
  };

  // Локальный хелпер для отображения превью
  const getPreviewUrl = (image) => {
    if (!image) {
      return '/placeholder.png'; // (ИСПРАВЛЕНИЕ) .png вместо .jpg
    }
    if (image.startsWith('http')) {
      return image;
    }

    // Убираем 'public/' если вдруг он там есть
    let cleanPath = image;
    if (cleanPath.startsWith('public/')) {
      cleanPath = cleanPath.substring(7);
    }

    // Убеждаемся, что путь начинается со слэша
    if (!cleanPath.startsWith('/')) {
      cleanPath = '/' + cleanPath;
    }

    // (ИСПРАВЛЕНИЕ) Используем SERVER_URL вместо BASE_URL, чтобы не было /api/uploads
    return `${SERVER_URL}${cleanPath}`;
  };

  return (
    <div className="image-uploader">
    <div
    className={`image-uploader__drop-zone ${
      isDragging ? 'image-uploader__drop-zone--dragging' : ''
    } ${uploading ? 'image-uploader__drop-zone--uploading' : ''}`}
    onDragOver={handleDragOver}
    onDragLeave={handleDragLeave}
    onDrop={handleDrop}
    onClick={() => !uploading && fileInputRef.current.click()}
    >
    {uploading ? (
      <div className="image-uploader__spinner-container">
      <div className="image-uploader__spinner"></div>
      <p>Загрузка изображений...</p>
      </div>
    ) : (
      <>
      <svg
      className="image-uploader__drop-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
      </svg>
      <p className="image-uploader__drop-text">
      Перетащите изображения сюда или нажмите для выбора
      </p>
      <small className="image-uploader__drop-hint">
      Поддерживаемые форматы: JPG, PNG, GIF
      </small>
      </>
    )}
    </div>

    <input
    ref={fileInputRef}
    type="file"
    multiple
    accept="image/jpeg,image/png,image/gif"
    className="image-uploader__file-input"
    onChange={handleFileSelect}
    disabled={uploading}
    />

    {error && <div className="image-uploader__error">{error}</div>}

    {currentImages && currentImages.length > 0 && (
      <div className="image-uploader__preview-grid">
      {currentImages.map((image, index) => (
        <div key={index} className="image-uploader__preview-item">
        <img
        src={getPreviewUrl(image)}
        alt={`Preview ${index + 1}`}
        className="image-uploader__preview-image"
        onError={(e) => {
          e.target.src = '/placeholder.png'; // (ИСПРАВЛЕНИЕ) .png
        }}
        />
        <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onImageDelete(image);
        }}
        className="image-uploader__preview-delete"
        aria-label="Удалить изображение"
        >
        &times;
        </button>
        </div>
      ))}
      </div>
    )}
    </div>
  );
};

export default ImageUploader;
