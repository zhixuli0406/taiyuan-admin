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
import axios from "axios";
import CreatableSelect from "react-select/creatable";
import ToogleSwitch from "../components/settings/ToogleSwitch";
import "react-quill/dist/quill.snow.css";
import { PacmanLoader } from "react-spinners";
import { useParams } from "react-router-dom";
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

    const updateFiles = (incommingFiles) => {
        incommingFiles[0]
        setImages(incommingFiles);
    };
    const onDelete = (id) => {
        setImages(images.filter((x) => x.id !== id));
    };
    const handleSee = (imageSource) => {
        setImageSrc(imageSource);
    };

    const getCategoryList = async () => {
        const url = window.api + "/categories";
        try {
            const response = await axios({
                url: url,
                method: "get",
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            });
            if (response.status === 200) {
                let categoryList = [];
                response.data.categories.forEach((category) => {
                    if (category.parentCategory !== null)
                        categoryList.push({
                            value: category._id,
                            label: category.parentCategory.name + " / " + category.name,
                        });
                    else categoryList.push({ value: category._id, label: category.name });
                });
                setCategory(categoryList);
            }
        } catch (error) {
            console.log(error);
            localStorage.clear();
            window.location.href = "/";
        }
    };

    const getProductFromID = async (id) => {
        const url = window.api + "/products/" + id;
        try {
            const response = await axios({
                url: url,
                method: "get",
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
            });
            if (response.status === 200) {
                const data = response.data.product;
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
            }
        } catch (error) {
            console.log(error);
            localStorage.clear();
            window.location.href = "/";
        }
    }

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
    });

    const handleOnCreate = async (inputValue) => {
        try {
            const url = window.api + "/categories"
            const response = await axios({
                url: url,
                method: "post",
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
                data: {
                    "name": inputValue,
                    "description": inputValue,
                    "isActive": true,
                    "parentCategory": null
                }
            });
            if (response.status === 200) {
                const name = response.data.category.name;
                const id = response.data.category._id;
                setCategory((prev) => [...prev, { value: id, label: name }]);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleRemove = (index) => {
        setImageURLList(imageURLList.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        setLoading(true);
        let imagesList = [];
        let transportList = [];
        for (let image of images) {
            const file = image.file;
            const base64 = await toBase64(file);
            imagesList.push(base64.split(',')[1]);
        }
        for (let t of selectedTransport) {
            transportList.push(t.value);
        }
        try {
            const url = window.api + "/products/" + id;
            const response = await axios({
                url: url,
                method: "put",
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
                data: {
                    "name": productName,
                    "description": description,
                    "price": price,
                    "category": selectedCategory.value,
                    "images": imageURLList,
                    "newImages": imagesList,
                    "isCustomizable": isCustomizable,
                    "customizableFields": [
                        "備註",
                    ],
                    "stock": stock,
                    "transport": transportList,
                    "isFeatured": true
                },
            });
            if (response.status === 200) {
                setLoading(false);
                window.location.href = "/products";
            }
        } catch (error) {
            console.log(error);
            localStorage.clear();
            window.location.href = "/";
        }
    }

    useEffect(() => {
        getProductFromID(id);
        getCategoryList();
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
                                onChange={(e) => setStock(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
                            />
                        </div>
                        <div className="flex flex-col space-y-1 mb-4">
                            <label className="text-sm text-gray-300">價格</label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
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
                        <div className="flex flex-wrap gap-4 p-4">
                            {imageURLList.map((url, index) => (
                                <div key={url} className="relative group">
                                    {/* 圖片 */}
                                    <img
                                        src={url}
                                        alt="Gallery"
                                        className="w-[150px] h-[150px] object-cover rounded-md border shadow-md"
                                    />
                                    {/* 刪除按鈕 */}
                                    <button
                                        onClick={() => handleRemove(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition-opacity">
                                        Ｘ
                                    </button>
                                </div>
                            ))}
                        </div>
                        <Dropzone onChange={updateFiles} value={images} accept="image/*">
                            {images.map((images) => (
                                <FileMosaic
                                    {...images}
                                    key={images.id}
                                    onDelete={onDelete}
                                    onSee={handleSee}
                                    resultOnTooltip
                                    alwaysActive
                                    preview
                                    info
                                />
                            ))}
                        </Dropzone>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-1 mb-4">
                            <label className="text-sm text-gray-300">運送方式</label>
                            <CreatableSelect
                                isClearable
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
                            更新產品
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

export default EditProduct;
