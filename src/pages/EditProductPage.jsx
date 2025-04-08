import { useEffect, useState } from "react";
import Header from "../components/common_components/Header";
import { motion } from "framer-motion";
import ReactQuill from "react-quill";
import {
    Dropzone,
    FileMosaic,
    FullScreen,
} from "@dropzone-ui/react";
import { productsApi, categoriesApi } from "../core/api";
import CreatableSelect from "react-select/creatable";
import ToogleSwitch from "../components/settings/ToogleSwitch";
import "react-quill/dist/quill.snow.css";
import { PacmanLoader } from "react-spinners";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const EditProduct = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [productName, setProductName] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState([]);
    const [imageSrc, setImageSrc] = useState(undefined);
    const [imageURLList, setImageURLList] = useState([]);
    const [category, setCategory] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState([]);
    const [transport, ] = useState([
        { value: '7-11', label: '7-11' },
        { value: '全家', label: '全家' },
        { value: '宅配', label: '宅配' }
    ]);
    const [selectedTransport, setSelectedTransport] = useState([]);
    const [isCustomizable, setIsCustomizable] = useState(false);
    const [price, setPrice] = useState(0);
    const [stock, setStock] = useState(0);
    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, 4, false] }],
            ["bold", "italic", "underline", "strike", "blockquote"],
            [
                { list: "ordered" },
                { list: "bullet" },
                { indent: "-1" },
                { indent: "+1" },
            ],
            ["link"],
            ["clean"],
        ],
    };
    const formats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "blockquote",
        "list",
        "bullet",
        "indent",
        "link",
    ];

    const updateFiles = async (incommingFiles) => {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const validFiles = incommingFiles.filter(file => {
            if (file.file.size > maxSize) {
                toast.error(`檔案 ${file.file.name} 超過5MB限制`);
                return false;
            }
            return true;
        });
        
        try {
            const uploadedFiles = await Promise.all(validFiles.map(async (file) => {
                const fileType = `.${file.file.name.split('.').pop()}`;
                const { data } = await productsApi.getPresignedUrl(fileType);
                
                // 使用 XMLHttpRequest 來監控上傳進度
                const xhr = new XMLHttpRequest();
                const promise = new Promise((resolve, reject) => {
                    xhr.upload.addEventListener('progress', (event) => {
                        if (event.lengthComputable) {
                            const progress = Math.round((event.loaded * 100) / event.total);
                            // 更新該檔案的上傳進度
                            setImages(prev => prev.map(img => 
                                img.id === file.id ? { ...img, uploadProgress: progress } : img
                            ));
                        }
                    });

                    xhr.addEventListener('load', () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve({
                                ...file,
                                imageUrl: data.imageUrl,
                                uploadProgress: 100
                            });
                        } else {
                            reject(new Error('上傳失敗'));
                        }
                    });

                    xhr.addEventListener('error', () => reject(new Error('上傳失敗')));
                    xhr.addEventListener('abort', () => reject(new Error('上傳已取消')));

                    xhr.open('PUT', data.uploadUrl);
                    xhr.setRequestHeader('Content-Type', file.file.type);
                    xhr.send(file.file);
                });

                return await promise;
            }));
            
            setImages(uploadedFiles);
        } catch (error) {
            console.error('上傳圖片失敗:', error);
            toast.error('上傳圖片失敗');
        }
    };
    const onDelete = (id) => {
        setImages(images.filter((x) => x.id !== id));
    };
    const handleSee = (imageSource) => {
        setImageSrc(imageSource);
    };

    const getCategoryList = async () => {
        try {
            const response = await categoriesApi.getAll();
            let categoryList = [];
            response.categories.forEach((category) => {
                if (category.parentCategory !== null)
                    categoryList.push({
                        value: category._id,
                        label: category.parentCategory.name + " / " + category.name,
                    });
                else categoryList.push({ value: category._id, label: category.name });
            });
            setCategory(categoryList);
        } catch (error) {
            console.error('獲取分類列表失敗:', error);
            toast.error(error.response?.data?.message || '獲取分類列表失敗');
            if (error.response?.status === 401) {
                localStorage.clear();
                window.location.href = "/";
            }
        }
    };

    const getProductFromID = async (id) => {
        try {
            const response = await productsApi.getById(id);
            const data = response.product;
            let transportList = [];
            for (let i = 0; i < data.transport.length; i++) {
                transportList.push({ value: data.transport[i], label: data.transport[i] });
            }
            setProductName(data.name);
            setDescription(data.description);
            setImageURLList(data.images);
            setSelectedCategory({ value: data.category._id, label: data.categoryName });
            setSelectedTransport(transportList);
            setIsCustomizable(data.isCustomizable);
            setPrice(data.price);
            setStock(data.stock);
        } catch (error) {
            console.error('獲取產品詳情失敗:', error);
            toast.error(error.response?.data?.message || '獲取產品詳情失敗');
            if (error.response?.status === 401) {
                localStorage.clear();
                window.location.href = "/";
            }
        }
    }

    const handleOnCreate = async (inputValue) => {
        try {
            const response = await categoriesApi.create({
                name: inputValue,
                description: inputValue,
                isActive: true,
                parentCategory: null
            });
            const name = response.category.name;
            const id = response.category._id;
            setCategory((prev) => [...prev, { value: id, label: name }]);
        } catch (error) {
            console.error('創建分類失敗:', error);
            toast.error(error.response?.data?.message || '創建分類失敗');
        }
    }

    const handleSubmit = async () => {
        setLoading(true);
        let transportList = [];
        for (let t of selectedTransport) {
            transportList.push(t.value);
        }
        try {
            await productsApi.update(id, {
                name: productName,
                description: description,
                price: price,
                category: selectedCategory.value,
                images: imageURLList,
                newImages: images.map(img => img.imageUrl),
                isCustomizable: isCustomizable,
                customizableFields: ["備註"],
                stock: stock,
                transport: transportList,
                isFeatured: true
            });
            toast.success('產品更新成功');
            window.location.href = "/products";
        } catch (error) {
            console.error('更新產品失敗:', error);
            toast.error(error.response?.data?.message || '更新產品失敗');
            if (error.response?.status === 401) {
                localStorage.clear();
                window.location.href = "/";
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getProductFromID(id);
        getCategoryList();
    }, []);

    return (
        <div className="flex-1 overflow-auto relative z-10 bg-gray-900" >
            <Header title="編輯產品" />

            {/* STAT DATA  */}
            <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
                <motion.div
                    className="bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700 mb-6 relative z-10"
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.2 }}
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-100">編輯產品</h2>
                    </div>
                    {/* FORM */}
                    <div className="flex flex-col space-y-1 mb-4">
                        <label className="text-sm text-gray-300">產品名稱</label>
                        <input
                            type="text"
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
                        />
                    </div>
                    <div className="flex flex-col space-y-1 mb-4">
                        <label className="text-sm text-gray-300">產品分類</label>
                        <CreatableSelect
                            isClearable
                            options={category}
                            onChange={(selectedOptions) => setSelectedCategory(selectedOptions)}
                            onCreateOption={handleOnCreate}
                            value={selectedCategory}
                            styles={{
                                control: (baseStyles) => ({
                                    ...baseStyles,
                                    borderColor: "rgb(55 65 81 / var(--tw-bg-opacity, 1))",
                                    backgroundColor: "rgb(55 65 81 / var(--tw-bg-opacity, 1))",
                                }),
                                input: (baseStyles) => ({
                                    ...baseStyles,
                                    color: "rgb(255 255 255 / var(--tw-text-opacity, 1))",
                                }),
                                singleValue: (baseStyles) => ({
                                    ...baseStyles,
                                    color: "rgb(255 255 255 / var(--tw-text-opacity, 1))",
                                }),
                                menu: (baseStyles) => ({
                                    ...baseStyles,
                                    backgroundColor: "rgb(55 65 81)",
                                }),
                                option: (baseStyles, state) => ({
                                    ...baseStyles,
                                    backgroundColor: state.isFocused
                                        ? "#111827"
                                        : "rgb(55 65 81)",
                                }),
                            }}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-1 mb-4">
                            <label className="text-sm text-gray-300">庫存</label>
                            <input
                                type="number"
                                value={stock}
                                min="0"
                                step="1"
                                onChange={(e) => setStock(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
                            />
                        </div>
                        <div className="flex flex-col space-y-1 mb-4">
                            <label className="text-sm text-gray-300">價格</label>
                            <input
                                type="number"
                                value={price}
                                min="0"
                                step="0.01"
                                onChange={(e) => setPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                                className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col space-y-1 mb-4">
                        <label className="text-sm text-gray-300">產品描述</label>
                        <ReactQuill
                            theme="snow"
                            value={description}
                            onChange={setDescription}
                            modules={modules}
                            formats={formats}
                            className="bg-gray-700 text-white rounded-md"
                        />
                    </div>
                    <div className="flex flex-col space-y-1 mb-4">
                        <label className="text-sm text-gray-300">產品圖片</label>
                        <Dropzone
                            onChange={updateFiles}
                            value={images}
                            maxFiles={5}
                            maxFileSize={5 * 1024 * 1024}
                            accept="image/*"
                            label="拖放圖片到這裡或點擊上傳"
                            color="#4f46e5"
                            minHeight="195px"
                            maxHeight="300px"
                            onClean={onDelete}
                            onSee={handleSee}
                            translation={{
                                dictDefaultMessage: "拖放圖片到這裡或點擊上傳",
                                dictFallbackMessage: "您的瀏覽器不支持拖放上傳",
                                dictFileTooBig: "檔案太大",
                                dictInvalidFileType: "不支持的文件類型",
                                dictResponseError: "上傳失敗",
                                dictCancelUpload: "取消上傳",
                                dictUploadCanceled: "上傳已取消",
                                dictCancelUploadConfirmation: "確定要取消上傳嗎？",
                                dictRemoveFile: "刪除檔案",
                                dictMaxFilesExceeded: "超過最大檔案數量限制",
                            }}
                        >
                            {images.map((file) => (
                                <FileMosaic
                                    key={file.id}
                                    {...file}
                                    preview
                                    uploadProgress={file.uploadProgress}
                                />
                            ))}
                        </Dropzone>
                        <FullScreen
                            open={imageSrc !== undefined}
                            onClose={() => setImageSrc(undefined)}
                            src={imageSrc}
                        />
                    </div>
                    <div className="flex flex-col space-y-1 mb-4">
                        <label className="text-sm text-gray-300">運送方式</label>
                        <CreatableSelect
                            isMulti
                            options={transport}
                            onChange={(selectedOptions) => setSelectedTransport(selectedOptions)}
                            value={selectedTransport}
                            styles={{
                                control: (baseStyles) => ({
                                    ...baseStyles,
                                    borderColor: "rgb(55 65 81 / var(--tw-bg-opacity, 1))",
                                    backgroundColor: "rgb(55 65 81 / var(--tw-bg-opacity, 1))",
                                }),
                                input: (baseStyles) => ({
                                    ...baseStyles,
                                    color: "rgb(255 255 255 / var(--tw-text-opacity, 1))",
                                }),
                                multiValue: (baseStyles) => ({
                                    ...baseStyles,
                                    backgroundColor: "rgb(31 41 55)",
                                }),
                                multiValueLabel: (baseStyles) => ({
                                    ...baseStyles,
                                    color: "rgb(255 255 255 / var(--tw-text-opacity, 1))",
                                }),
                                menu: (baseStyles) => ({
                                    ...baseStyles,
                                    backgroundColor: "rgb(55 65 81)",
                                }),
                                option: (baseStyles, state) => ({
                                    ...baseStyles,
                                    backgroundColor: state.isFocused
                                        ? "#111827"
                                        : "rgb(55 65 81)",
                                }),
                            }}
                        />
                    </div>
                    <div className="flex flex-col space-y-1 mb-4">
                        <label className="text-sm text-gray-300">是否可客製化</label>
                        <ToogleSwitch
                            isOn={isCustomizable}
                            handleToggle={() => setIsCustomizable(!isCustomizable)}
                        />
                    </div>
                    <div className="flex justify-end mt-6">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md flex items-center gap-2"
                        >
                            {loading ? (
                                <PacmanLoader color="#ffffff" size={10} />
                            ) : (
                                "更新產品"
                            )}
                        </button>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default EditProduct;
