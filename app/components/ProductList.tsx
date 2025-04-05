const handleDelete = async (productId: string) => {
  // 添加確認對話框
  if (!confirm('確定要刪除此產品嗎？')) {
    return;
  }
  
  try {
    await deleteProduct(productId);
    // 重新加載產品列表或更新狀態
  } catch (error) {
    console.error('刪除產品時發生錯誤:', error);
  }
} 