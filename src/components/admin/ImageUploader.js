import React, { useState, useRef } from 'react';
import { uploadImages } from '../../services/productService';
import { BASE_URL } from '../../services/api';


// 2. ДОБАВЛЯЕМ 'onImageDelete' В ПРОПСЫ
const ImageUploader = ({ onImagesUploaded, currentImages = [], onImageDelete }) => {
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
      const uploadedImages = await uploadImages(imageFiles);
      onImagesUploaded(uploadedImages);
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Ошибка при загрузке изображений. Проверьте формат и размер файлов.');
    } finally {
      setUploading(false);
    }
  };

  // 3. ИСПРАВЛЕНИЕ ЗДЕСЬ: Заменяем 'imagePath' на 'image'
  const getImageUrl = (image) => {
    if (!image) {
      // Используем плейсхолдер из public, т.к. BASE_URL может не работать для плейсхолдера
      return '/placeholder.jpg';
    }
    if (image.startsWith('http')) {
      return image; // Это уже полный URL
    }

    // Убираем 'public/' из начала пути
    const cleanPath = image.startsWith('public/')
    ? image.substring(7) // 7 — это длина 'public/'
    : image;

    // Собираем URL с BASE_URL
    return `${BASE_URL}/${cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath}`;
  };


  return (
    <div className="image-uploader">
    {/* Зона для drag and drop */}
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

    {/* Скрытый input для выбора файлов */}
    <input
    ref={fileInputRef}
    type="file"
    multiple
    accept="image/jpeg,image/png,image/gif"
    className="image-uploader__file-input"
    onChange={handleFileSelect}
    disabled={uploading}
    />

    {/* Отображение ошибок */}
    {error && <div className="image-uploader__error">{error}</div>}

    {/* Предпросмотр загруженных изображений */}
    {currentImages && currentImages.length > 0 && (
      <div className="image-uploader__preview-grid">
      {currentImages.map((image, index) => (
        <div key={index} className="image-uploader__preview-item">
        <img
        src={getImageUrl(image)}
        alt={`Preview ${index + 1}`}
        className="image-uploader__preview-image"
        onError={(e) => {
          // Если (даже после исправления) URL битый, ставим плейсхолдер
          e.target.src = '/placeholder.jpg';
        }}
        />
        <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onImageDelete(image); // Вызываем 'onImageDelete' с URL
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
