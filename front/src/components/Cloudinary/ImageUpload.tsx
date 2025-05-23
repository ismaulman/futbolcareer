import Image from "next/image";
import { useState } from "react";

interface ImageUploadProps {
  onUpload: (url: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const uploadImage = async () => {
    if (!file) return;

    setUploading(true);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_UPLOAD_PRESET;
    console.log("Cloud Name:", cloudName);
    console.log("Upload Preset:", uploadPreset);

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_UPLOAD_PRESET || ""
    );

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setImageUrl(data.secure_url);
      onUpload(data.secure_url); // Llama a la función onUpload con la URL
    } catch (error) {
      console.error("Error subiendo la imagen:", error);
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  return (
    <div className="mb-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-700 border border-gray-200 rounded-lg p-2"
      />
      <button
        onClick={uploadImage}
        disabled={uploading}
        className={`mt-2 w-2/5 rounded-lg p-2 text-white ${
          uploading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {uploading ? "Subiendo..." : "Subir Imagen"}
      </button>
      {imageUrl && (
        <Image
          width={100}
          height={100}
          src={imageUrl}
          alt="Imagen subida"
          className="mt-2  rounded-lg"
        />
      )}
    </div>
  );
};

export default ImageUpload;
