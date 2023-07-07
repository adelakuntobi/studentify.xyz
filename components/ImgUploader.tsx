import { FormInput, Modalstyle } from '@/styles/useStyles';
import { useState } from 'react';
import cogotoast from './toaster';
import CircleLoader from './Loader';
import { AiOutlineClose } from 'react-icons/ai';

function ImageUploader(props) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [base64Image, setBase64Image] = useState<any>('');
  const [isLoading, setIsLoading] = useState(false)

  const handleImageUpload = (event) => {
    const file = event.target.files[0];

    const maxSize = 0.5 * 1024 * 1024; 
    if (file && file.size > maxSize) {
      cogotoast('File size exceeds the maximum limit (500kb)', 'error');
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      const base64String = reader.result;
      setBase64Image(base64String);
    };

    if (file) {
      reader.readAsDataURL(file);
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const submit = () => {
    setIsLoading(true)
    setTimeout(() => {
      sessionStorage.setItem("selfie", base64Image)
      cogotoast("Your image has been saved, proceed to signature", "success")
      setIsLoading(false)
      props.nextStep()
    }, 3000);
  }

  return (
    <>

      <Modalstyle className='!fixed'>
        <div className=" max-w-lg bg-white w-full text-black px-6 py-6 rounded-lg flex gap-6 flex-col relative">
        <AiOutlineClose className="absolute top-5 right-6 text-xl cursor-pointer" onClick={() => props.setUpload(false)} />

          <div>
            <h2 className="font-bold text-2xl mb-3">Selfie verification</h2>
            <p>Kindly select a picture and upload</p>
          </div>
          {selectedImage && <img className='h-64 object-contain mx-auto' src={selectedImage} alt="Selected" />}
          <FormInput>
            <label htmlFor="firstName">Select Image to Upload</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </FormInput>
          <button className='w-full mt-6' disabled={isLoading} onClick={submit}>
            {
              isLoading ? <CircleLoader /> : "Submit"
            }
            </button>
          {/* {base64Image && (
            <div>
              <h4>Base64 Image:</h4>
              <textarea rows={6} value={base64Image} readOnly />
            </div>
          )} */}
        </div>
      </Modalstyle>

    </>

  );
}

export default ImageUploader;
