import { useState, useEffect, useRef } from 'react';
import SortableTree, { getFlatDataFromTree } from 'react-sortable-tree';
import 'react-sortable-tree/style.css';
import './styles/customSortableTree.css';
import Header from '../components/common_components/Header';
import { categoriesApi } from '../core/api';
import MyDarkTheme from '../themes/MyDarkTheme';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

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
      const response = await categoriesApi.getAll();
      const data = response.categories || [];
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

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || '獲取分類列表失敗');
      if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/';
      }
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
        await categoriesApi.update(categoryForm._id, {
          name: categoryForm.name,
          description: categoryForm.description,
          isActive: categoryForm.isActive,
          parentCategory: categoryForm.parentCategory?._id ?? null,
          order: categoryForm.order,
        });
      } else {
        // 新增
        await categoriesApi.create({
          name: categoryForm.name,
          description: categoryForm.description,
          isActive: categoryForm.isActive,
          parentCategory: categoryForm.parentCategory?._id ?? null,
          order: categoryForm.order,
        });
      }
      closeModal();
      fetchCategories();
      toast.success(isEditing ? '分類更新成功' : '分類創建成功');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || (isEditing ? '更新分類失敗' : '創建分類失敗'));
      if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/';
      }
    }
  };

  // 刪除
  const handleDeleteCategory = async (node) => {
    if (!window.confirm('確定要刪除這個分類嗎？')) return;
    try {
      await categoriesApi.delete(node._id);
      fetchCategories();
      toast.success('分類刪除成功');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || '刪除分類失敗');
      if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/';
      }
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
        await categoriesApi.update(node._id, {
          name: node.title,
          description: node.description,
          isActive: node.isActive,
          parentCategory,
          order: treeIndex,
        });
      }
      toast.success('分類順序更新成功');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || '更新分類順序失敗');
      if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/';
      }
    }
  };

  // 計算所有節點數量
  const countAllNodes = (nodes) => {
    let count = 0;
    nodes.forEach((node) => {
      count++;
      if (node.children) {
        count += countAllNodes(node.children);
      }
    });
    return count;
  };

  return (
    <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
      <Header title="分類管理" />
      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <div className="bg-gray-800 bg-opacity-50 shadow-lg backdrop-blur-md rounded-xl p-5 border border-gray-700 mb-6 relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-100">分類列表</h2>
            <button
              onClick={openAddModal}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md"
            >
              新增分類
            </button>
          </div>
          <div style={{ height: 600 }}>
            <SortableTree
              treeData={treeData}
              onChange={handleMoveNode}
              theme={MyDarkTheme}
              canDrag={({ node }) => !node.children || node.children.length === 0}
              generateNodeProps={({ node }) => ({
                buttons: [
                  <button
                    key="edit"
                    className="text-blue-500 hover:text-blue-700 mr-2"
                    onClick={() => openEditModal(node)}
                  >
                    編輯
                  </button>,
                  <button
                    key="delete"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteCategory(node)}
                  >
                    刪除
                  </button>,
                ],
              })}
            />
          </div>
        </div>
      </main>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2 className="text-xl font-semibold text-gray-100 mb-4">
          {isEditing ? '編輯分類' : '新增分類'}
        </h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              分類名稱
            </label>
            <input
              type="text"
              name="name"
              value={categoryForm.name}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              描述
            </label>
            <textarea
              name="description"
              value={categoryForm.description}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              父分類
            </label>
            <select
              name="parentCategory"
              value={categoryForm.parentCategory?._id || ''}
              onChange={(e) => {
                const selectedId = e.target.value;
                setCategoryForm((prev) => ({
                  ...prev,
                  parentCategory: selectedId
                    ? { _id: selectedId }
                    : null,
                }));
              }}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
            >
              <option value="">無</option>
              {rootCategories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={categoryForm.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
            />
            <label className="ml-2 block text-sm text-gray-300">
              啟用
            </label>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveCategory}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md"
            >
              儲存
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoriesPage;
