import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Header from "../components/common_components/Header";
import ImageTable from "../components/images/ImageTable";
import { getImages, deleteImage } from "../core/api/images";

const ImagesPage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchImages = async () => {
    try {
      const data = await getImages();
      setImages(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleDelete = async (image) => {
    try {
      await deleteImage(image.key);
      setImages(images.filter((img) => img.key !== image.key));
      toast.success("圖片刪除成功");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
      <Header title="圖片管理" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        {/* 圖片表格 */}
        <ImageTable images={images} loading={loading} onDelete={handleDelete} onRefresh={fetchImages} />
      </main>
    </div>
  );
};

export default ImagesPage;
