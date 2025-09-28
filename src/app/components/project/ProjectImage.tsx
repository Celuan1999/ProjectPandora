import { useState, useRef } from 'react';

interface ProjectImageProps {
  imageUrl?: string;
  title: string;
  isFavorited?: boolean;
  onFavoriteToggle?: () => void;
  projectId?: number;
  onImageUploaded?: (imageUrl: string) => void;
  onImageUploadError?: (errorMessage: string) => void;
}

export default function ProjectImage({ 
  imageUrl, 
  title, 
  isFavorited = false, 
  onFavoriteToggle,
  projectId,
  onImageUploaded,
  onImageUploadError
}: ProjectImageProps) {
  const [isFav, setIsFav] = useState(isFavorited);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFavoriteClick = () => {
    setIsFav(!isFav);
    onFavoriteToggle?.();
  };

  const handleFileSelect = async (file: File) => {
    if (!projectId || !onImageUploaded || !onImageUploadError) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onImageUploadError('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      onImageUploadError('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    
    try {
      const { projectsApi } = await import('../../api/projects');
      
      // For now, we'll use mock auth data - in a real app, this would come from context
      const mockAuthToken = 'mock-token';
      const mockOrgId = 'mock-org-id';
      
      const response = await projectsApi.uploadProjectImage(
        mockAuthToken, 
        mockOrgId, 
        projectId, 
        file
      );
      
      onImageUploaded(response.data.image_url || '');
    } catch (error) {
      console.error('Error uploading image:', error);
      onImageUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative w-full h-80 bg-gray-200 rounded-lg overflow-hidden">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <svg
            className="w-16 h-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
      )}
      
      {/* Heart icon for favorite */}
      <button
        onClick={handleFavoriteClick}
        className="absolute top-3 left-3 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all duration-200"
      >
        <svg
          className={`w-5 h-5 transition-colors duration-200 ${
            isFav ? 'text-red-500 fill-current' : 'text-gray-600'
          }`}
          fill={isFav ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

      {/* Upload arrow icon in bottom left */}
      {projectId && onImageUploaded && onImageUploadError && (
        <button
          onClick={handleUploadClick}
          disabled={isUploading}
          className="absolute bottom-3 left-3 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Upload new image"
        >
          {isUploading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          ) : (
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          )}
        </button>
      )}

      {/* Hidden file input */}
      {projectId && onImageUploaded && onImageUploadError && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading}
        />
      )}
    </div>
  );
}
