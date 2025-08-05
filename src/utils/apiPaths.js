export const BASE_URL="https://interview-platform-backend-uawb.onrender.com/";

export const API_PATHS = {
    AUTH:{
        REGISTER: "/api/auth/register", //register new user
        LOGIN: "/api/auth/login", //authenticate user & return JWT token
        GET_PROFILE: "/api/auth/profile" //get logged in user details
    },

    IMAGE:{
        UPLOAD: "/api/auth/upload-image", //upload image to server
    },

    AI:{
        GENERATE_QUESTIONS: "/api/ai/generate-questions", //generate interview questions & answers using gemini
        GENERATE_EXPLANATION: "/api/ai/generate-explanation", //generate explanation using gemini
    },

    SESSION:{
        CREATE: "/api/sessions/create", //create a new interview session with questions
        GET_ALL: "/api/sessions/my-sessions", //get all sessions
        GET_ONE: (id) => `/api/sessions/${id}`, //get a session by id
        DELETE: (id) => `/api/sessions/${id}`, //delete a session by id
    },

    QUESTION:{
        ADD_TO_SESSION: "/api/questions/add", // add more questions to a session
        PIN: (id) => `/api/questions/${id}/pin`, //pin or unpin question
        UPDATE_NOTE: (id) => `/api/questions/${id}/note`, //update question note
    },
};