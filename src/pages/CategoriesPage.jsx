import React, { useState, useEffect, useRef, useCallback } from 'react';
// 移除旧库导入
// import { SortableTreeWithoutDndContext, getFlatDataFromTree } from 'react-sortable-tree';
// import 'react-sortable-tree/style.css';
// import MyDarkTheme from '../themes/MyDarkTheme'; // 这个可能也不需要了，看新库是否支持主题

// 引入 @hello-pangea/dnd
// import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'; // 重新引入 Draggable
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// import './styles/customSortableTree.css'; // 註釋掉舊的 CSS
import Header from '../components/common_components/Header';
import { categoriesApi } from '../core/api';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

// 错误边界组件
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500">
          加载树形结构时发生错误，请刷新页面重试。
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

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

// 辅助函数：将扁平数据构建成嵌套树（用于渲染）
const buildTree = (items, parentId = null) => {
  return items
    .filter(item => (item.parentCategory?._id ?? null) === parentId) // 修正比较逻辑
    .sort((a, b) => a.order - b.order)
    .map(item => ({
      // 直接使用从 API 获取的原始 item 结构
      ...item,
      // 递归构建 children
      children: buildTree(items, item._id)
    }));
};

// 暂时注释掉 flattenTree 函数
// const flattenTree = (nodes, parentId = null, depth = 0) => {
//   let list = [];
//   nodes.forEach((node, index) => {
//     list.push({ 
//       ...node.originalData, // 使用原始数据结构
//       depth: depth,          // 添加深度信息
//     });
//     if (node.children && node.children.length > 0) {
//       list = list.concat(flattenTree(node.children, node.id, depth + 1));
//     }
//   });
//   return list;
// };

// 定义拖拽项类型
const ItemTypes = {
  TREE_ITEM: 'treeItem'
};

// 检查是否会产生循环引用
const checkCircularReference = (sourceId, targetId, nodes) => {
  // 如果目标节点是源节点本身，则会产生循环引用
  if (sourceId === targetId) return true;
  
  // 如果目标节点是 null（根节点），则不会产生循环引用
  if (targetId === null) return false;
  
  // 获取目标节点的所有父节点
  const getParentIds = (nodeId) => {
    const parentIds = [];
    let currentNode = nodes.find(n => n._id === nodeId);
    while (currentNode?.parentCategory?._id) {
      parentIds.push(currentNode.parentCategory._id);
      currentNode = nodes.find(n => n._id === currentNode.parentCategory._id);
    }
    return parentIds;
  };

  // 获取源节点的所有父节点
  const sourceParentIds = getParentIds(sourceId);
  
  // 如果目标节点是源节点的父节点之一，则会产生循环引用
  return sourceParentIds.includes(targetId);
};

// 检查是否可以设置父节点
const canSetParent = (sourceId, targetId, nodes) => {
  // 如果目标节点是源节点本身，则不能设置
  if (sourceId === targetId) return false;
  
  // 如果目标节点是 null（根节点），则可以设置
  if (targetId === null) return true;
  
  // 获取源节点的深度
  const getDepth = (nodeId) => {
    let depth = 0;
    let currentNode = nodes.find(n => n._id === nodeId);
    while (currentNode?.parentCategory?._id) {
      depth++;
      currentNode = nodes.find(n => n._id === currentNode.parentCategory._id);
    }
    return depth;
  };

  // 检查源节点是否有子节点
  const hasChildren = (nodeId) => {
    return nodes.some(node => node.parentCategory?._id === nodeId);
  };

  // 获取源节点的深度
  const sourceDepth = getDepth(sourceId);
  // 获取目标节点的深度
  const targetDepth = getDepth(targetId);
  
  // 如果源节点是第二层，则不能设置
  if (sourceDepth >= 1) {
    return false;
  }

  // 如果源节点有子节点，则不能设置
  if (hasChildren(sourceId)) {
    return false;
  }

  // 如果目标节点不是根节点，则不能设置
  if (targetDepth > 0) {
    return false;
  }
  
  // 检查是否会产生循环引用
  return !checkCircularReference(sourceId, targetId, nodes);
};

// 可拖动的树节点组件
const DraggableTreeNode = ({ 
  node, 
  draggedItemId, 
  handleDragStart, 
  handleHover,     
  handleDragEnd,   
  findNode,
  derivedTreeData,
  onEdit,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.TREE_ITEM,
    item: () => {
      handleDragStart(node._id);
      return { 
        id: node._id,
        parentId: node.parentCategory?._id || null
      };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult) {
        const { targetId, targetIndex } = dropResult;
        console.log('Drop result:', { targetId, targetIndex });
        handleDragEnd();
      } else {
        handleDragEnd();
      }
    },
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.TREE_ITEM,
    hover: (item, monitor) => {
      if (!monitor.isOver({ shallow: true })) return;
      handleHover(node._id);
    },
    canDrop: (item) => {
      // 不能拖拽到自身
      if (item.id === node._id) return false;
      
      // 检查是否可以设置父节点
      if (!canSetParent(item.id, node._id, derivedTreeData)) {
        return false;
      }
      
      return true;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop()
    }),
    drop: (item, monitor) => {
      if (monitor.didDrop()) {
        return undefined;
      }
      return {
        targetId: node._id,
        targetIndex: findNode(node._id).index
      };
    }
  });

  const opacity = isDragging ? 0.4 : 1;
  const backgroundColor = isOver ? (canDrop ? '#374151' : '#4B5563') : '#2d3748';

  return (
    <div ref={(node) => drag(drop(node))} style={{ opacity, display: 'block' }}>
      <div
        style={{
          padding: '8px',
          marginBottom: '4px',
          backgroundColor,
          borderRadius: '4px',
          cursor: canDrop ? 'move' : 'not-allowed',
          position: 'relative',
        }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {node.children && node.children.length > 0 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-gray-300 focus:outline-none"
              >
                {isExpanded ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            )}
            <div>
              {node.name}
              {node.parentCategory && (
                <span style={{ 
                  fontSize: '0.8em', 
                  color: '#9CA3AF',
                  marginLeft: '8px'
                }}>
                  (父級: {node.parentCategory.name})
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(node)}
              className="text-blue-400 hover:text-blue-300"
            >
              編輯
            </button>
            <button
              onClick={() => onDelete(node._id)}
              className="text-red-400 hover:text-red-300"
            >
              刪除
            </button>
          </div>
        </div>
      </div>
      {node.children && node.children.length > 0 && isExpanded && (
        <div style={{ marginLeft: '20px' }}>
          {node.children.map((child) => (
            <DraggableTreeNode
              key={child._id}
              node={child}
              draggedItemId={draggedItemId}
              handleDragStart={handleDragStart}
              handleHover={handleHover}
              handleDragEnd={handleDragEnd}
              findNode={findNode}
              derivedTreeData={derivedTreeData}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

DraggableTreeNode.propTypes = {
  node: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    parentCategory: PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
    }),
    children: PropTypes.array,
  }).isRequired,
  draggedItemId: PropTypes.string,
  handleDragStart: PropTypes.func.isRequired,
  handleHover: PropTypes.func.isRequired,
  handleDragEnd: PropTypes.func.isRequired,
  findNode: PropTypes.func.isRequired,
  derivedTreeData: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

// 根节点拖拽区域组件
const RootDropZone = ({ onHover }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.TREE_ITEM,
    hover: (_, monitor) => {
      if (!monitor.isOver({ shallow: true })) return;
      onHover(null);
    },
    canDrop: () => true,
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop()
    }),
    drop: () => ({
      targetId: null,
      targetIndex: -1
    })
  });

  return (
    <div
      ref={drop}
      className="mb-4 p-4 border-2 border-dashed border-gray-600 rounded-lg"
      style={{ minHeight: '50px' }}
    >
      {isOver && canDrop && (
        <div className="text-center text-gray-400">
          拖放到此處成為根節點
        </div>
      )}
    </div>
  );
};

RootDropZone.propTypes = {
  onHover: PropTypes.func.isRequired
};

const CategoriesPage = () => {
  // 状态管理
  const [treeData, setTreeData] = useState([]);
  const [derivedTreeData, setDerivedTreeData] = useState([]);
  const [draggedItemId, setDraggedItemId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' 或 'edit'
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hoverIndexRef = useRef(null);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await categoriesApi.getAll();
      const data = response.categories || [];

      if (data.length === 0) {
        setTreeData([]);
        setDerivedTreeData([]);
        setIsLoading(false);
        return;
      }

      setTreeData(data);
      const tree = buildTree(data);
      setDerivedTreeData(tree);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setTreeData([]);
      setDerivedTreeData([]);
      setIsLoading(false);
      toast.error(error.response?.data?.message || '獲取分類列表失敗');
      if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const findNode = (id) => {
    console.log('查找节点:', id);
    const node = treeData.find(item => item._id === id);
    const index = treeData.indexOf(node);
    console.log('查找结果:', { node, index, treeDataLength: treeData.length });
    if (!node) return { node: null, index: -1 }; 
    return {
      node,
      index,
    };
  };

  // 处理拖拽开始
  const handleDragStart = useCallback((itemId) => {
    setDraggedItemId(itemId);
    console.log('开始拖拽:', itemId);
  }, []);

  // 处理拖拽结束
  const handleDragEnd = useCallback(() => {
    console.log('拖拽结束');
    if (draggedItemId) {
      const sourceNode = findNode(draggedItemId);
      
      // 如果拖拽到根节点区域
      if (hoverIndexRef.current === null) {
        console.log('移动为根节点:', {
          sourceId: draggedItemId,
          sourceNode: sourceNode.node
        });
        
        // 更新节点的父级关系
        const newTreeData = [...treeData];
        const sourceIndex = newTreeData.findIndex(node => node._id === draggedItemId);
        
        if (sourceIndex !== -1) {
          const movedNode = { ...newTreeData[sourceIndex] };
          movedNode.parentCategory = null;
          
          // 移除源节点
          newTreeData.splice(sourceIndex, 1);
          // 添加到末尾
          newTreeData.push(movedNode);
          
          // 更新所有节点的顺序
          const updatedTreeData = newTreeData.map((node, index) => ({
            ...node,
            order: index
          }));
          
          setTreeData(updatedTreeData);
          
          // 准备更新数据
          const updateData = updatedTreeData.map(node => ({
            id: node._id,
            order: node.order,
            parentCategory: node.parentCategory?._id || null
          }));

          console.log('准备发送更新请求:', updateData);
          
          // 调用 API 更新顺序和父级关系
          categoriesApi.updateOrder(updateData)
            .then(response => {
              console.log('更新成功:', response);
              toast.success('更新顺序成功');
              fetchCategories();
            })
            .catch(error => {
              console.error('更新失败:', error);
              toast.error('更新顺序失败');
              fetchCategories();
            });
        }
      } else if (hoverIndexRef.current) {
        const targetNode = findNode(hoverIndexRef.current);
        
        if (sourceNode.node && targetNode.node) {
          // 检查是否会产生循环引用
          if (checkCircularReference(draggedItemId, hoverIndexRef.current, treeData)) {
            toast.error('不能將節點移動到其子節點下');
            setDraggedItemId(null);
            hoverIndexRef.current = null;
            return;
          }

          // 检查目标节点是否是根节点
          if (targetNode.node.parentCategory) {
            toast.error('只能將節點移動到根節點下');
            setDraggedItemId(null);
            hoverIndexRef.current = null;
            return;
          }

          // 检查源节点是否有子节点
          const hasChildren = treeData.some(node => node.parentCategory?._id === draggedItemId);
          if (hasChildren) {
            toast.error('不能將有子節點的根節點移動到其他根節點下');
            setDraggedItemId(null);
            hoverIndexRef.current = null;
            return;
          }

          console.log('执行移动操作:', {
            sourceId: draggedItemId,
            targetId: hoverIndexRef.current,
            sourceNode: sourceNode.node,
            targetNode: targetNode.node
          });
          
          // 更新节点的父级关系
          const newTreeData = [...treeData];
          const sourceIndex = newTreeData.findIndex(node => node._id === draggedItemId);
          const targetIndex = newTreeData.findIndex(node => node._id === hoverIndexRef.current);
          
          console.log('节点索引:', {
            sourceIndex,
            targetIndex,
            treeDataLength: newTreeData.length
          });
          
          if (sourceIndex !== -1 && targetIndex !== -1) {
            const movedNode = { ...newTreeData[sourceIndex] };
            movedNode.parentCategory = { _id: newTreeData[targetIndex]._id };
            
            // 移除源节点
            newTreeData.splice(sourceIndex, 1);
            // 在目标位置插入
            newTreeData.splice(targetIndex, 0, movedNode);
            
            // 更新所有节点的顺序
            const updatedTreeData = newTreeData.map((node, index) => ({
              ...node,
              order: index
            }));
            
            setTreeData(updatedTreeData);
            
            // 准备更新数据
            const updateData = updatedTreeData.map(node => ({
              id: node._id,
              order: node.order,
              parentCategory: node.parentCategory?._id || null
            }));

            console.log('准备发送更新请求:', updateData);
            
            // 调用 API 更新顺序和父级关系
            categoriesApi.updateOrder(updateData)
              .then(response => {
                console.log('更新成功:', response);
                toast.success('更新顺序成功');
                fetchCategories();
              })
              .catch(error => {
                console.error('更新失败:', error);
                toast.error('更新顺序失败');
                fetchCategories();
              });
          } else {
            console.error('找不到节点:', {
              sourceIndex,
              targetIndex,
              draggedItemId,
              targetId: hoverIndexRef.current
            });
          }
        } else {
          console.error('节点查找失败:', {
            sourceNode,
            targetNode,
            draggedItemId,
            targetId: hoverIndexRef.current
          });
        }
      }
    }
    
    setDraggedItemId(null);
    hoverIndexRef.current = null;
  }, [draggedItemId, treeData, findNode, fetchCategories]);

  // 处理悬停
  const handleHover = useCallback((targetNodeId) => {
    if (targetNodeId !== hoverIndexRef.current) {
      hoverIndexRef.current = targetNodeId;
      console.log('悬停更新:', {
        targetNodeId
      });
    }
  }, []);

  // ... Modal 相关函数 (openAddModal, closeModal, handleChange, handleSaveCategory) ...
  const openAddModal = () => {
    setModalType('add');
    setNewCategoryName('');
    setSelectedParentId(null);
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setModalType('edit');
    setNewCategoryName(category.name);
    setSelectedParentId(category.parentCategory?._id || null);
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    setNewCategoryName(e.target.value);
  };

  const handleParentChange = (e) => {
    setSelectedParentId(e.target.value || null);
  };

  const handleSaveCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('請輸入分類名稱');
      return;
    }

    // 检查父节点深度
    const getDepth = (nodeId) => {
      if (!nodeId) return 0;
      let depth = 0;
      let currentNode = treeData.find(n => n._id === nodeId);
      while (currentNode?.parentCategory?._id) {
        depth++;
        currentNode = treeData.find(n => n._id === currentNode.parentCategory._id);
      }
      return depth;
    };

    // 如果选择的父节点已经是第二层，则不允许创建
    if (selectedParentId) {
      const parentDepth = getDepth(selectedParentId);
      if (parentDepth >= 1) {
        toast.error('不能將分類添加到第二層分類下');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: newCategoryName.trim(),
        description: '',
        isActive: true,
        parentCategory: selectedParentId,
        order: treeData.length,
      };

      if (modalType === 'add') {
        await categoriesApi.create(payload);
        toast.success('分類創建成功');
      } else {
        await categoriesApi.update(editingCategory._id, payload);
        toast.success('分類更新成功');
      }
      
      closeModal();
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || (modalType === 'add' ? '創建分類失敗' : '更新分類失敗'));
      if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('確定要刪除此分類嗎？')) {
      return;
    }

    try {
      await categoriesApi.delete(categoryId);
      toast.success('分類刪除成功');
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || '刪除分類失敗');
      if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
  };

  // 获取根节点列表
  const getRootNodes = () => {
    return treeData.filter(node => !node.parentCategory);
  };

  return (
    <div className="flex-1 overflow-auto relative z-10 bg-gray-900">
      <Header title="分類管理" />

      <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
        <div className="flex justify-end items-center mb-6">
          <button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            新增分類
          </button>
        </div>

        <ErrorBoundary>
          <DndProvider backend={HTML5Backend}>
            <div className="bg-gray-800 rounded-lg shadow p-6">
              <RootDropZone onHover={handleHover} />

              {isLoading ? (
                <div className="text-center text-gray-400">
                  正在載入分類數據...
                </div>
              ) : treeData.length > 0 ? (
                <div>
                  {derivedTreeData.map((node) => (
                    <DraggableTreeNode
                      key={node._id}
                      node={node}
                      draggedItemId={draggedItemId}
                      handleDragStart={handleDragStart}
                      handleHover={handleHover}
                      handleDragEnd={handleDragEnd}
                      findNode={findNode}
                      derivedTreeData={derivedTreeData}
                      onEdit={openEditModal}
                      onDelete={handleDeleteCategory}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  暫無分類數據
                </div>
              )}
            </div>
          </DndProvider>
        </ErrorBoundary>

        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-white">
              {modalType === 'add' ? '新增分類' : '編輯分類'}
            </h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                分類名稱
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="請輸入分類名稱"
                autoFocus
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                父級分類
              </label>
              <select
                value={selectedParentId || ''}
                onChange={handleParentChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                <option value="">無（根節點）</option>
                {getRootNodes()
                  .filter(node => modalType === 'add' || node._id !== editingCategory?._id)
                  .map(node => (
                    <option key={node._id} value={node._id}>
                      {node.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors duration-200"
              >
                取消
              </button>
              <button
                onClick={handleSaveCategory}
                disabled={isSubmitting || !newCategoryName.trim()}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    保存中...
                  </>
                ) : (
                  '保存'
                )}
              </button>
            </div>
          </div>
        </Modal>
      </main>
    </div>
  );
};

export default CategoriesPage;

