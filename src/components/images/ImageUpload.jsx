import { useState } from "react";
import { Upload } from "lucide-react";
import { uploadImage, getPresignedUrl } from "../../core/api/images";

const ImageUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const fileType = `.${file.name.split(".").pop()}`;
      const { uploadUrl, imageUrl, headers } = await getPresignedUrl(fileType);

      // 使用預簽名 URL 上傳到 S3
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
          ...headers,
        },
      });

      // 保存圖片信息到後端
      await uploadImage({
        image: imageUrl,
        title: file.name,
        description: "",
      });

      setFile(null);
      window.location.reload(); // 刷新頁面以顯示新上傳的圖片
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow p-4 mb-4">
      <div className="flex items-center space-x-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="flex items-center px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 cursor-pointer"
        >
          <Upload size={20} className="mr-2" />
          選擇圖片
        </label>
        {file && (
          <div className="flex items-center space-x-2">
            <span className="text-gray-300">{file.name}</span>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 disabled:opacity-50"
            >
              {uploading ? "上傳中..." : "上傳"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload; 