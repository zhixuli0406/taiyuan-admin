import { useState, useEffect, useRef } from 'react';
import SortableTree, { getFlatDataFromTree } from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import './styles/customSortableTree.css';
import Header from '../components/common_components/Header';
import axios from 'axios';
import MyDarkTheme from '../themes/MyDarkTheme';
import PropTypes from 'prop-types';

// 自訂 Modal，用 Tailwind 寫最基本的開關顯示
const Modal = ({ isOpen, onClose, children }) => {
  const elementRef = useRef(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-300"
          onClick={onClose}
        >
          X
        </button>
        <div ref={elementRef}>
          {children}
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

const CategoriesPage = () => {
  const [treeData, setTreeData] = useState([]);
  const [rootCategories, setRootCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  // 表單資料
  const [categoryForm, setCategoryForm] = useState({
    _id: '',
    name: '',
    description: '',
    isActive: true,
    parentCategory: null,
    order: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  // 取得分類資料並轉成 React Sortable Tree 需要的格式
  const fetchCategories = async () => {
    try {
      const res = await axios.get(window.api + '/categories', {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      });

      const data = res.data.categories || [];
      // 將 categories 陣列中的每個項目轉成 treeData
      const newTreeData = data.map((cat) => ({
        _id: cat._id,
        title: cat.name,
        description: cat.description,
        isActive: cat.isActive,
        parentCategory: cat.parentCategory,
        order: cat.order,
        children: [],
      }));

      // 進行巢狀化：找出 parentCategory=null 的當父層，否則塞到對應父層的 children
      // 因為最大深度只有 2，所以只要巢狀到第二層即可
      newTreeData.forEach((node) => {
        if (node.parentCategory) {
          // 找到父节点
          const parentIndex = newTreeData.findIndex(
            (p) => p._id === node.parentCategory._id
          );
          if (parentIndex !== -1) {
            newTreeData[parentIndex].children.push(node);
          }
        }
      });

      // 最後再把第一層的節點取出( parentCategory === null )
      const rootTreeData = newTreeData.filter(
        (node) => !node.parentCategory
      );

      setTreeData(rootTreeData);

      // 另外建立根分類清單，用於下拉選單 (只需要 _id 與 title)
      // 注意: 部分 API 可能會回傳 parentCategory = null 或是 parentCategory = { ... }，
      //       這邊可依實際資料結構調整判斷條件
      const rootOnly = data.filter(
        (catItem) => catItem.parentCategory === null
      ).map((catItem) => ({
        _id: catItem._id,
        name: catItem.name,
      }));
      setRootCategories(rootOnly);

    } catch (err) {
      console.error(err);
      localStorage.clear()
      window.location.href = '/'
    }
  };

  // 開啟「新增」對話框
  const openAddModal = () => {
    // 新增時，order 預設為目前 treeData 所有節點的總數量
    const count = countAllNodes(treeData);
    setCategoryForm({
      _id: '',
      name: '',
      description: '',
      isActive: true,
      parentCategory: null,
      order: count,
    });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  // 開啟「編輯」對話框
  const openEditModal = (node) => {
    setCategoryForm({
      _id: node._id,
      name: node.title,
      description: node.description,
      isActive: node.isActive,
      parentCategory: node.parentCategory,
      order: node.order,
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // 關閉對話框
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 統一處理輸入欄位
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCategoryForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // 新增或更新
  const handleSaveCategory = async () => {
    try {
      if (isEditing) {
        // 編輯
        const url = `${window.api}/categories/${categoryForm._id}`;
        await axios.put(
          url,
          {
            name: categoryForm.name,
            description: categoryForm.description,
            isActive: categoryForm.isActive,
            parentCategory: categoryForm.parentCategory?._id ?? null,
            order: categoryForm.order,
          },
          {
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('token'),
            },
          }
        );
      } else {
        // 新增
        const url = `${window.api}/categories`;
        await axios.post(
          url,
          {
            name: categoryForm.name,
            description: categoryForm.description,
            isActive: categoryForm.isActive,
            parentCategory: categoryForm.parentCategory?._id ?? null,
            order: categoryForm.order,
          },
          {
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('token'),
            },
          }
        );
      }
      closeModal();
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  // 刪除
  const handleDeleteCategory = async (node) => {
    if (!window.confirm('確定要刪除這個分類嗎？')) return;
    try {
      await axios.delete(`${window.api}/categories/${node._id}`, {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      });
      fetchCategories();
    } catch (err) {
      console.error(err);
      window.alert(err.response.data.error);
    }
  };

  // 拖曳（移動）後更新順序
  const handleMoveNode = async ({ treeData: newTreeData }) => {
    setTreeData(newTreeData);
    // 更新所有 category 的順序
    // 先把整棵樹攤平成 flat 資料，再依照 index 更新 order
    const flatData = getFlatDataFromTree({
      treeData: newTreeData,
      getNodeKey: ({ node }) => node._id, // 以 _id 當作 key
      ignoreCollapsed: false,
    });

    try {
      // 逐一更新
      for (let i = 0; i < flatData.length; i++) {
        const { node, parentNode, treeIndex } = flatData[i];
        // 如果 parentNode 存在，則表示有父級
        const parentCategory = parentNode ? parentNode._id : null;
        // 用 PUT 更新
        await axios.put(
          `${window.api}/categories/${node._id}`,
          {
            name: node.title,
            description: node.description,
            isActive: node.isActive,
            parentCategory,
            order: treeIndex,
          },
          {
            headers: {
              Authorization: 'Bearer ' + localStorage.getItem('token'),
            },
          }
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 計算所有節點（包含子節點）的數量，用於自動設定 order
  const countAllNodes = (nodes) => {
    let count = 0;
    const stack = [...nodes];
    while (stack.length) {
      const node = stack.pop();
      count++;
      if (node.children) stack.push(...node.children);
    }
    return count;
  };

  return (
    <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
      <Header title="分類" />
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-100">分類管理</h2>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md flex"
            onClick={openAddModal}
          >
            新增分類
          </button>
        </div>
        <div className="bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700 mb-6 h-[80vh] overflow-y-auto">
          <SortableTree
            treeData={treeData}
            onChange={(newTreeData) => setTreeData(newTreeData)}
            onMoveNode={handleMoveNode}
            maxDepth={2}
            theme={MyDarkTheme}
            generateNodeProps={({ node }) => ({
              style: {
                backgroundColor: '#2d2d2d',
                border: 'none',
              },
              title: (
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-white">{node.title}</span>
                </div>
              ),
              buttons: [
                <button
                  key="edit"
                  className="mr-3 text-blue-400 hover:text-blue-200"
                  onClick={() => openEditModal(node)}
                >
                  <svg className="w-6 h-6 text-gray-800 dark:text-blue-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m14.304 4.844 2.852 2.852M7 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-4.5m2.409-9.91a2.017 2.017 0 0 1 0 2.853l-6.844 6.844L8 14l.713-3.565 6.844-6.844a2.015 2.015 0 0 1 2.852 0Z" />
                  </svg>

                </button>,
                <button
                  key="delete"
                  className="text-red-400 hover:text-red-200"
                  onClick={() => handleDeleteCategory(node)}
                >
                  <svg className="w-6 h-6 text-gray-800 dark:text-red-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z" />
                  </svg>

                </button>,
              ],
            })}
          />
        </div>
      </main>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2 className="text-xl text-gray-100 mb-4">
          {isEditing ? '編輯分類' : '新增分類'}
        </h2>
        <div className="flex flex-col space-y-4">
          <label className="text-gray-300 flex flex-col">
            名稱
            <input
              className="mt-1 p-2 rounded bg-gray-700 text-white"
              type="text"
              name="name"
              value={categoryForm.name}
              onChange={handleChange}
            />
          </label>
          <label className="text-gray-300 flex flex-col">
            描述
            <textarea
              className="mt-1 p-2 rounded bg-gray-700 text-white"
              name="description"
              value={categoryForm.description}
              onChange={handleChange}
            />
          </label>
          <label className="text-gray-300 flex items-center space-x-2">
            <input
              type="checkbox"
              name="isActive"
              checked={categoryForm.isActive}
              onChange={handleChange}
            />
            <span>是否啟用</span>
          </label>
          <label className="text-gray-300 flex flex-col">
            父層分類
            <select
              className="mt-1 p-2 rounded bg-gray-700 text-white"
              name="parentCategory"
              value={categoryForm.parentCategory?._id || ''}
              onChange={(e) => {
                const selectedId = e.target.value;
                if (!selectedId) {
                  setCategoryForm((prev) => ({
                    ...prev,
                    parentCategory: null,
                  }));
                } else {
                  setCategoryForm((prev) => ({
                    ...prev,
                    parentCategory: { _id: selectedId },
                  }));
                }
              }}
            >
              <option value="">無</option>
              {rootCategories
                .filter((cat) => cat._id !== categoryForm._id)
                .map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </label>
          <label className="text-gray-300 flex flex-col">
            排序 Order
            <input
              className="mt-1 p-2 rounded bg-gray-700 text-white"
              type="number"
              name="order"
              value={categoryForm.order}
              onChange={handleChange}
            />
          </label>
        </div>
        <div className="flex justify-end mt-6">
          <button
            className="bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded mr-2"
            onClick={handleSaveCategory}
          >
            確認
          </button>
          <button
            className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded"
            onClick={closeModal}
          >
            取消
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default CategoriesPage;
