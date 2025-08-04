import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import SpinnerLoader from '../../components/Loader/SpinnerLoader';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const CreateSessionForm = () => {
    const [formData, setFormData] = useState({
        role: '',
        experience: '',
        topicsToFocus: '',
        description: '',
    });
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const handleChange = (key, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [key]: value,
        }));
    };

    const handleCreateSession = async (e) => {
        e.preventDefault();
        const { role, experience, topicsToFocus, description } = formData;
        if(!role || !experience || !topicsToFocus){
            setError("Please fill all the required fields");
            return;
        }

        setError("");
        setIsLoading(true);
        
        try {
         // call AI API to generate questions
         const aiResponse = await axiosInstance.post(
            API_PATHS.AI.GENERATE_QUESTIONS,
            {
                role,
                experience,
                topicsToFocus,
                numberOfQuestions: 10,
            }
         );

         // should be array like [{questions, answer},..]
         const generatedQuestions = aiResponse.data;

         const response = await axiosInstance.post(API_PATHS.SESSION.CREATE,{
            ...formData,
            questions: generatedQuestions,
         });

         if (response.data?.session?._id){
            navigate(`/interview-prep/${response.data?.session?._id}`)
         }
        } catch(error){
            if (error.response && error.response.data.message) {
                setError(error.response.data.message);
            } else{
                setError("Something went wrong. Please try again.");
            }
        } finally{
            setIsLoading(   );
        }
    }
  return <div className='w-[90vw] md:w-[35vw] p-7 flex flex-col justify-center'>
        <h3 className='text-lg fontsemibold text-black'>
            Start a New Interview Journey
        </h3>
        <p className='text-xs text-slate-700 mt-[5px] mb-3'>
            Fill out a few quick details and unlock your personalized set of interview Questions!
        </p>

        <form onSubmit={handleCreateSession} className='flex flex-col gap-3'>
            <Input
               value={formData.role}
               onchange={({target}) => handleChange("role", target.value)}
               label="Target Role"
               placeholder="(e.g., Frontend developer, UI/UX Designer, etc)"
               type="text"
            />

            <Input
               value={formData.experience}
               onchange={({target}) => handleChange("experience", target.value)}
               label="Years of Experience"
               placeholder="(e.g., 1 year, 3 years, 5+ year)"
               type="number"
            />

            <Input
               value={formData.topicsToFocus}
               onchange={({target}) => handleChange("topicsToFocus", target.value)}
               label="topics To Focus On"
               placeholder="(Comma-separated, e.g., React, Node.js, MongoDB etc)"
               type="text"
            />

            <Input
               value={formData.description}
               onchange={({target}) => handleChange("description", target.value)}
               label="Description"
               placeholder="(Any specific goals or notes for this session)"
               type="text"
            />

            {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}

            <button
              type='submit'
              className='btn-primary w-full mt-2'
              disabled={isLoading}
            >
            {isLoading ? <SpinnerLoader /> : 'Create Session'}
            </button>
        </form>
    </div>
}

export default CreateSessionForm