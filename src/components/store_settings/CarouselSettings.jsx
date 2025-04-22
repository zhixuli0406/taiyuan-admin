import { useState } from 'react';
import PropTypes from 'prop-types';
import carouselsApi from '../../core/api/carousels';
import { toast } from 'react-toastify';

const CarouselSettings = ({ carousels, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCarousel, setEditingCarousel] = useState(null);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleImageUpload = async (file) => {
        if (!file) return null;
        
        try {
            setUploading(true);
            setUploadProgress(0);
            const fileType = `.${file.name.split('.').pop()}`;
            
            // 检查文件类型是否支持
            if (!['.jpg', '.jpeg', '.png', '.gif'].includes(fileType.toLowerCase())) {
                throw new Error('不支持的文件類型，請上傳 .jpg、.jpeg、.png 或 .gif 格式的圖片');
            }

            console.log('開始獲取預簽名 URL，文件類型:', fileType);
            const response = await carouselsApi.getPresignedUrl(fileType);
            console.log('預簽名 URL 響應:', response);

            const { uploadUrl, imageUrl, headers } = response;
            console.log('解析後的 URL:', { uploadUrl, imageUrl });
            
            // 使用 XMLHttpRequest 來監控上傳進度
            const xhr = new XMLHttpRequest();
            const promise = new Promise((resolve, reject) => {
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const progress = Math.round((event.loaded * 100) / event.total);
                        setUploadProgress(progress);
                    }
                });

                xhr.addEventListener('load', () => {
                    console.log('上傳完成，狀態碼:', xhr.status);
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(imageUrl);
                    } else {
                        reject(new Error(`上傳失敗，狀態碼: ${xhr.status}`));
                    }
                });

                xhr.addEventListener('error', (error) => {
                    console.error('上傳錯誤:', error);
                    reject(new Error('上傳失敗'));
                });
                xhr.addEventListener('abort', () => reject(new Error('上傳已取消')));

                console.log('開始上傳到:', uploadUrl);
                xhr.open('PUT', uploadUrl);
                xhr.setRequestHeader('Content-Type', file.type);
                // 添加其他必要的 headers
                if (headers) {
                    Object.entries(headers).forEach(([key, value]) => {
                        xhr.setRequestHeader(key, value);
                    });
                }
                xhr.send(file);
            });

            const resultImageUrl = await promise;
            console.log('上傳成功，圖片 URL:', resultImageUrl);
            return resultImageUrl;
        } catch (error) {
            console.error('上傳圖片失敗:', error);
            toast.error(error.message || '上傳圖片失敗');
            return null;
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!editingCarousel?.title) {
            setError('請填寫輪播圖標題');
            return;
        }
        if (!editingCarousel?.image && !editingCarousel?.imageUrl) {
            setError('請上傳輪播圖圖片');
            return;
        }

        try {
            const carouselData = { ...editingCarousel };
            
            if (carouselData.image) {
                const imageUrl = await handleImageUpload(carouselData.image);
                if (!imageUrl) return;
                carouselData.imageUrl = imageUrl;
                delete carouselData.image;
            }
            
            if (editingCarousel._id) {
                await carouselsApi.update(editingCarousel._id, carouselData);
            } else {
                await carouselsApi.create(carouselData);
            }
            setIsModalOpen(false);
            onUpdate();
            setError(null);
        } catch (error) {
            console.error('保存輪播圖失敗:', error);
            setError(editingCarousel.id ? '更新輪播圖失敗' : '創建輪播圖失敗');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('確定要刪除這個輪播圖嗎？')) return;

        try {
            await carouselsApi.delete(id);
            onUpdate();
            setError(null);
        } catch {
            setError('刪除輪播圖失敗');
        }
    };

    return (
        <div className="bg-gray-800 shadow rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-white">輪播圖管理</h2>
                <button
                    onClick={() => {
                        setEditingCarousel(null);
                        setIsModalOpen(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    新增輪播圖
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-900 text-red-200 rounded-md">
                    {error}
                </div>
            )}

            <div className="bg-gray-800 shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                標題
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                圖片
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                狀態
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                                操作
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {carousels.map((carousel) => (
                            <tr key={carousel._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {carousel.title}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <img
                                        src={carousel.imageUrl}
                                        alt={carousel.title}
                                        className="h-12 w-20 object-cover rounded"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {carousel.isActive ? '啟用' : '停用'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleDelete(carousel._id)}
                                        className="text-red-400 hover:text-red-300"
                                    >
                                        刪除
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 新增/編輯輪播圖彈窗 */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full">
                        <h3 className="text-lg font-medium text-white mb-6">
                            {editingCarousel?.id ? '編輯輪播圖' : '新增輪播圖'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-300">
                                    標題 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    required
                                    value={editingCarousel?.title || ''}
                                    onChange={(e) => setEditingCarousel({ ...editingCarousel, title: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>

                            <div>
                                <label htmlFor="image" className="block text-sm font-medium text-gray-300">
                                    圖片 {!editingCarousel?.imageUrl && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type="file"
                                    id="image"
                                    accept="image/*"
                                    required={!editingCarousel?.imageUrl}
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setEditingCarousel({ ...editingCarousel, image: file });
                                        }
                                    }}
                                    className="mt-1 block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600"
                                />
                                {uploading && (
                                    <div className="mt-2">
                                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                                            <div
                                                className="bg-indigo-500 h-2.5 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                        <div className="mt-1 text-sm text-gray-400 text-right">
                                            {uploadProgress}%
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="inline-flex justify-center rounded-md border border-gray-700 bg-gray-700 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    保存
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

CarouselSettings.propTypes = {
    carousels: PropTypes.arrayOf(
        PropTypes.shape({
            _id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            description: PropTypes.string,
            imageUrl: PropTypes.string,
            order: PropTypes.number,
            isActive: PropTypes.bool
        })
    ).isRequired,
    onUpdate: PropTypes.func.isRequired
};

export default CarouselSettings; 