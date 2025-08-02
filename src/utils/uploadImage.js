import { API_PATHS } from "./apiPaths";
import axiosInstance from "./axiosInstance";

const uploadImage = async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
        const response = await axiosInstance.post(API_PATHS.IMAGE.UPLOAD, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', //set header for file upload
            }
        });
        return response.data; // return respone data
    } catch (error) {
        console.error("Error while uploading the image", error);
        throw error; // rethrow error for handling
    }
};

export default uploadImage;