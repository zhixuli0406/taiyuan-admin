import { useEffect, useState } from "react";
import Header from "../components/common_components/Header";
import { motion } from "framer-motion";
import ReactQuill from "react-quill";
import {
    Dropzone,
    FileMosaic,
    FullScreen,
    ImagePreview,
} from "@dropzone-ui/react";
import { productsApi, categoriesApi } from "../core/api";
import transportApi from "../core/api/transport";
import CreatableSelect from "react-select/creatable";
import ToogleSwitch from "../components/settings/ToogleSwitch";
import "react-quill/dist/quill.snow.css";
import { PacmanLoader } from "react-spinners";
import { toast } from "react-toastify";

const CreateProduct = () => {
    const [loading, setLoading] = useState(false);
    const [productName, setProductName] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState([]);
    const [imageSrc, setImageSrc] = useState(undefined);
    const [category, setCategory] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState([]);
    const [transport, setTransport] = useState([]);
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
                try {
                    const response = await productsApi.getPresignedUrl(fileType);
                    
                    if (!response || !response.uploadUrl || !response.imageUrl) {
                        throw new Error('獲取預簽名 URL 失敗：返回數據格式不正確');
                    }

                    console.log('預簽名 URL:', response.uploadUrl);
                    console.log('文件類型:', file.file.type);
                    
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
                            console.log('上傳完成，狀態碼:', xhr.status);
                            console.log('響應頭:', xhr.getAllResponseHeaders());
                            console.log('響應內容:', xhr.responseText);
                            
                            if (xhr.status >= 200 && xhr.status < 300) {
                                resolve({
                                    ...file,
                                    imageUrl: response.imageUrl,
                                    uploadProgress: 100
                                });
                            } else {
                                console.error('上傳失敗，狀態碼:', xhr.status);
                                console.error('響應:', xhr.responseText);
                                reject(new Error(`上傳失敗: ${xhr.status} ${xhr.statusText}`));
                            }
                        });

                        xhr.addEventListener('error', (error) => {
                            console.error('上傳請求錯誤:', error);
                            reject(new Error('上傳請求錯誤'));
                        });
                        
                        xhr.addEventListener('abort', () => reject(new Error('上傳已取消')));

                        xhr.open('PUT', response.uploadUrl);
                        // 只設置 Content-Type 請求頭
                        xhr.setRequestHeader('Content-Type', file.file.type);
                        xhr.send(file.file);
                    });

                    return await promise;
                } catch (error) {
                    console.error('獲取預簽名 URL 失敗:', error);
                    toast.error('獲取上傳連結失敗，請稍後再試');
                    throw error;
                }
            }));
            
            setImages(uploadedFiles);
        } catch (error) {
            console.error('上傳圖片失敗:', error);
            toast.error('上傳圖片失敗，請稍後再試');
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

    const getTransportList = async () => {
        try {
            const response = await transportApi.getAll();
            const transportList = response.transports
                .filter(t => t.isActive) // 只获取启用的运输方式
                .map(t => ({
                    value: t._id,
                    label: `${t.name} ($${t.fee})`,
                    fee: t.fee,
                    description: t.description,
                    estimatedDays: t.estimatedDays
                }));
            setTransport(transportList);
        } catch (error) {
            console.error('获取运输方式列表失败:', error);
            toast.error(error.response?.data?.message || '获取运输方式列表失败');
        }
    };

    const handleOnCreate = async (inputValue) => {
        try {
            const response = await productsApi.createCategory({
                name: inputValue,
                description: inputValue,
                isActive: true,
                parentCategory: null
            });
            const name = response.category.name;
            const id = response.category._id;
            setCategory((prev) => [...prev, { value: id, label: name }]);
            setSelectedCategory({value: id, label: name});
        } catch (error) {
            console.error('創建分類失敗:', error);
            toast.error(error.response?.data?.message || '創建分類失敗');
        }
    }

    const handleSubmit = async () => {
        if (!productName || !description || !selectedCategory || !price || selectedTransport.length === 0) {
            toast.error("請填寫所有必要欄位！");
            return;
        }
        
        setLoading(true);
        let transportList = selectedTransport.map(t => t.value);
        try {
            await productsApi.create({
                name: productName,
                description: description,
                price: price,
                category: selectedCategory.value,
                images: images.map(img => img.imageUrl),
                isCustomizable: isCustomizable,
                customizableFields: ["備註"],
                stock: stock,
                transport: transportList,
                isFeatured: true
            });
            toast.success('產品創建成功');
            window.location.href = "/products";
        } catch (error) {
            console.error('創建產品失敗:', error);
            toast.error(error.response?.data?.message || '創建產品失敗');
            if (error.response?.status === 401) {
                localStorage.clear();
                window.location.href = "/";
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getCategoryList();
        getTransportList();
    }, []);

    return (
        <div className="flex-1 overflow-auto relative z-10 bg-gray-900" >
            <Header title="新增產品" />

            {/* STAT DATA  */}
            <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
                <motion.div
                    className="bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700 mb-6 relative z-10"
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.2 }}
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-100">新增產品</h2>
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
                        />
                    </div>

                    <div className="flex flex-col space-y-1 mb-4">
                        <label className="text-sm text-gray-300">圖片</label>
                        <Dropzone onChange={updateFiles} value={images} accept="image/*">
                            {images.map((file) => (
                                <FileMosaic
                                    {...file}
                                    key={file.id}
                                    onDelete={onDelete}
                                    onSee={handleSee}
                                    resultOnTooltip
                                    alwaysActive
                                    preview
                                    info
                                    uploadProgress={file.uploadProgress}
                                />
                            ))}
                        </Dropzone>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-1 mb-4">
                            <label className="text-sm text-gray-300">運送方式</label>
                            <CreatableSelect
                                isMulti
                                isClearable={false}
                                isCreatable={false}
                                options={transport}
                                value={selectedTransport}
                                onChange={(selectedOptions) => setSelectedTransport(selectedOptions)}
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
                                        color: "rgb(255 255 255 / var(--tw-text-opacity, 1))",
                                    }),
                                }}
                                noOptionsMessage={() => "無可用的運送方式"}
                                placeholder="選擇運送方式..."
                            />
                            {selectedTransport.length > 0 && (
                                <div className="mt-2 space-y-2">
                                    {selectedTransport.map((t) => (
                                        <div key={t.value} className="text-sm text-gray-400">
                                            <div>{t.description}</div>
                                            {t.estimatedDays && (
                                                <div>預計 {t.estimatedDays} 天送達</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col space-y-1 mb-4">
                            <ToogleSwitch
                                Label={"是否開啟備注欄位"}
                                isOn={isCustomizable}
                                onToggle={() => setIsCustomizable(!isCustomizable)}
                            />
                        </div>
                    </div>
                    {loading ? <PacmanLoader color="#fde047" className="mt-4 ml-2" /> :
                        <button
                            className='bg-indigo-600 hover:bg-indigo-800 text-white font-semibold py-2 px-6 rounded transition duration-300 w-full sm:w-auto'
                            onClick={handleSubmit}
                        >
                            建立產品
                        </button>}

                </motion.div>
                <FullScreen
                    open={imageSrc !== undefined}
                    onClose={() => setImageSrc(undefined)}
                >
                    <ImagePreview src={imageSrc} />
                </FullScreen>
            </main>
        </div>
    );
};

export default CreateProduct;
