import axios from "axios";

const API_URL = "https://api.taiyuan.dudustudio.monster";

const handleError = (error, defaultMessage) => {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        throw new Error(data.error || "請求參數錯誤");
      case 401:
        throw new Error("未經授權，請重新登入");
      case 403:
        throw new Error("權限不足");
      case 404:
        throw new Error(data.error || "資源未找到");
      case 500:
        throw new Error("伺服器錯誤，請稍後再試");
      default:
        throw new Error(defaultMessage);
    }
  } else {
    throw new Error(defaultMessage);
  }
};

export const getImages = async () => {
  try {
    const response = await axios.get(`${API_URL}/images`);
    return response.data.images;
  } catch (error) {
    handleError(error, "獲取圖片列表失敗");
  }
};

export const getPresignedUrl = async (fileType) => {
  try {
    const response = await axios.get(`${API_URL}/images/presigned-url`, {
      params: { fileType },
    });
    return response.data;
  } catch (error) {
    handleError(error, "獲取預簽名 URL 失敗");
  }
};

export const uploadImage = async (file, presignedUrl, headers) => {
  try {
    const response = await axios.put(presignedUrl, file, {
      headers: {
        ...headers,
        "Content-Type": file.type,
      },
    });
    return response.data;
  } catch (error) {
    handleError(error, "圖片上傳失敗");
  }
};

export const updateImage = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}/images/${id}`, data);
    return response.data;
  } catch (error) {
    handleError(error, "圖片更新失敗");
  }
};

export const deleteImage = async (s3Key) => {
  try {
    const response = await axios.delete(`${API_URL}/images/${encodeURIComponent(s3Key)}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.usedBy) {
      const usedBy = error.response.data.usedBy.join("、");
      throw new Error(`圖片正在被使用，無法刪除。使用位置：${usedBy}`);
    } else {
      handleError(error, "圖片刪除失敗");
    }
  }
};
