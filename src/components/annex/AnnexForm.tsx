import React, { useState, useEffect } from 'react';
import { RiArrowDropDownLine, RiArrowDropUpLine, RiCloseCircleLine } from 'react-icons/ri';
import universitiesData from '../../constants/annex/Universities.json';

interface University {
  id: string;
  name: string;
}

interface AnnexFormProps {
  initialData?: any; 
  onSubmit: (data: any, isEditing: boolean) => void; 
  onCancel: () => void; 
  isEditing: boolean; 
}

const AnnexForm: React.FC<AnnexFormProps> = ({ initialData, onSubmit, onCancel, isEditing }) => {
  const [title, setTitle] = useState('');
  const [selectedCampus, setSelectedCampus] = useState<string | null>(null);
  const [openCampusDropDown, setOpenCampusDropDown] = useState(false);
  const [filteredCampuses, setFilteredCampuses] = useState<University[]>(universitiesData);
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [featuresText, setFeaturesText] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]); 
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  useEffect(() => {
    setFilteredCampuses(universitiesData);
    if (initialData) {
      setTitle(initialData.title || '');
      setSelectedCampus(initialData.university || null); 
      setAddress(initialData.address || '');
      setPrice(initialData.price ? initialData.price.replace('Rs. ', '').replace('/month', '') : '');
      setDescription(initialData.description || '');
      setFeaturesText(initialData.features ? initialData.features.join('\n') : '');
      setExistingImageUrls(initialData.images || []); 
      setContactName(initialData.contactName || '');
      setContactPhone(initialData.contactPhone || '');
      setContactEmail(initialData.contactEmail || '');
    } else {
      setTitle('');
      setSelectedCampus(null);
      setAddress('');
      setPrice('');
      setDescription('');
      setFeaturesText('');
      setImages([]);
      setExistingImageUrls([]);
      setContactName('');
      setContactPhone('');
      setContactEmail('');
    }
  }, [initialData]);

  const handleSearch = (text: string) => {
    const filtered = universitiesData.filter(uni =>
      uni.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCampuses(filtered);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const totalImages = existingImageUrls.length + images.length + newFiles.length;

      if (totalImages > 3) {
        alert(`You can only upload a maximum of 3 images. You currently have ${existingImageUrls.length + images.length} images.`);
        e.target.value = ''; 
        return;
      }
      setImages(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index: number) => {
    // Backend එකට මේ image එක delete කරන්න කියලා request එකක් යවන්න ඕන
    // දැනට dummy data වලින් remove කරනවා
    setExistingImageUrls(existingImageUrls.filter((_, i) => i !== index));
    alert('Existing image removal functionality not fully implemented (needs backend call).');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const adData = {
      title,
      selectedCampus,
      address,
      price,
      description,
      features: featuresText.split('\n').map(f => f.trim()).filter(f => f !== ''),
      newImages: images, 
      existingImages: existingImageUrls, 
      contactName,
      contactPhone,
      contactEmail,
    };
    onSubmit(adData, isEditing);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5"> 
      <div className="bg-gray-600 shadow-lg rounded-lg p-6 md:p-8"> 
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 space-y-5">
            {/* Title Field */}
            <div className='flex justify-center items-center'>
              <div className='w-full max-w-[300px]'>
                <label htmlFor="title" className="block text-md font-semibold text-white">Title</label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="title"
                    className="bg-gray-500 p-2 text-white block w-full sm:text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-gray-100"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Campus Dropdown */}
            <div className='flex justify-center items-center'>
              <div className='w-full max-w-[300px] relative'>
                <label htmlFor="campus" className="block text-md font-semibold text-white">Select Campus</label>
                <div
                  onClick={() => setOpenCampusDropDown(!openCampusDropDown)}
                  className='flex justify-between items-center w-full text-white bg-gray-500 rounded-md border border-gray-600 px-3 py-2 mt-2 cursor-pointer'
                >
                  <p className='text-white'>
                    {selectedCampus || 'Select Campus'}
                  </p>
                  <div>
                    {openCampusDropDown ? <RiArrowDropUpLine className='text-2xl' /> : <RiArrowDropDownLine className='text-2xl' />}
                  </div>
                </div>
                <div className={`absolute z-20 mt-1 w-full max-w-[300px] bg-gray-500 rounded-md shadow-lg max-h-56 overflow-y-auto ${openCampusDropDown ? 'block' : 'hidden'}`}>
                  {openCampusDropDown && (
                    <div>
                      {filteredCampuses.map((campus) => (
                        <div
                          key={campus.id}
                          onClick={() => {
                            setSelectedCampus(campus.name);
                            setOpenCampusDropDown(false);
                            handleSearch(''); 
                          }}
                          className='px-4 py-2 text-sm text-gray-100 hover:bg-gray-600 cursor-pointer'
                        >
                          {campus.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Price Field */}
            <div className='flex justify-center items-center'>
              <div className='w-full max-w-[300px]'>
                <label htmlFor="price" className="block text-md font-semibold text-white">Price (Rs. per month)</label>
                <div className="mt-2 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    id="price"
                    className="p-2 block w-full sm:text-sm bg-gray-500 text-white rounded-md appearance-none pr-12 focus:outline-none focus:ring-1 focus:ring-gray-100"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-100 sm:text-sm">
                    Rs.
                  </div>
                </div>
              </div>
            </div>

            {/* Address Field */}
            <div className='flex justify-center items-center'>
              <div className='w-full max-w-[300px]'>
                <label htmlFor="address" className="block text-md font-semibold text-white">Address</label>
                <div className="mt-2">
                  <textarea
                    id="address"
                    rows={4}
                    className="shadow-sm p-2 block w-full sm:text-sm bg-gray-500 text-white rounded-md focus:outline-none focus:ring-1 focus:ring-gray-100"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Description Field */}
            <div className='flex justify-center items-center'>
              <div className='w-full max-w-[300px]'>
                <label htmlFor="description" className="block text-md font-semibold text-white">Description</label>
                <div className="mt-2">
                  <textarea
                    id="description"
                    rows={4}
                    className="p-2 block w-full sm:text-sm bg-gray-500 text-white rounded-md focus:outline-none focus:ring-1 focus:ring-gray-100"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Features Textarea */}
            <div className='flex justify-center items-center'>
              <div className='w-full max-w-[300px]'>
                <label htmlFor="features" className="block text-md font-semibold text-white">Features (one per line)</label>
                <div className="mt-2">
                  <textarea
                    id="features"
                    rows={4}
                    className="p-2 block w-full sm:text-sm bg-gray-500 text-white rounded-md focus:outline-none focus:ring-1 focus:ring-gray-100"
                    value={featuresText}
                    onChange={(e) => setFeaturesText(e.target.value)}
                  />
                  {/* <p className="mt-1 text-sm text-gray-500">Enter each feature on a new line.</p> */}
                </div>
              </div>
            </div>

            {/* Contact Name */}
            <div className='flex justify-center items-center'>
              <div className='w-full max-w-[300px]'>
                <label htmlFor="contactName" className="block text-md font-semibold text-white">Contact Name</label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="contactName"
                    className="p-2 block w-full sm:text-sm bg-gray-500 text-white rounded-md focus:outline-none focus:ring-1 focus:ring-gray-100"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Phone */}
            <div className='flex justify-center items-center'>
              <div className='w-full max-w-[300px]'>
                <label htmlFor="contactPhone" className="block text-md font-semibold text-white">Contact Phone</label>
                <div className="mt-2">
                  <input
                    type="tel"
                    id="contactPhone"
                    className="p-2 block w-full sm:text-sm bg-gray-500 text-white rounded-md focus:outline-none focus:ring-1 focus:ring-gray-100"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Email */}
            <div className='flex justify-center items-center'>
              <div className='w-full max-w-[300px]'>
                <label htmlFor="contactEmail" className="block text-md font-semibold text-white">Contact Email (Optional)</label>
                <div className="mt-2">
                  <input
                    type="email"
                    id="contactEmail"
                    className="p-2 block w-full sm:text-sm bg-gray-500 text-white rounded-md focus:outline-none focus:ring-1 focus:ring-gray-100"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Images Upload */}
            <div className='flex justify-center items-center'>
              <div className='w-full max-w-[300px]'>
                <label htmlFor="images" className="block text-md font-semibold text-white">Images</label>
                <div className="mt-2">
                  {/* Only allow uploading if total images < 3 */}
                  {(existingImageUrls.length + images.length) < 3 && (
                    <input
                      type="file"
                      id="images"
                      className="p-2 block w-full bg-gray-500 text-white sm:text-sm rounded-md"
                      multiple
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                  )}
                  <p className="mt-1 text-sm text-gray-300">Upload one or more new images for the annex. Max 3 images allowed.</p>
                  {/* Display newly selected images */}
                  {images.length > 0 && (
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {images.map((image, index) => (
                        <div key={`new-${index}`} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`New Uploaded Image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveNewImage(index)}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-75 hover:opacity-100"
                          >
                            <RiCloseCircleLine size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Display existing images when editing */}
                  {existingImageUrls.length > 0 && (
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <p className="col-span-full text-sm text-gray-600 mb-1">Existing Images:</p>
                      {existingImageUrls.map((imgUrl: string, index: number) => (
                        <div key={`existing-${index}`} className="relative">
                          <img
                            src={imgUrl}
                            alt={`Existing Image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md"
                          />
                          <div
                            onClick={() => handleRemoveExistingImage(index)}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-75 hover:opacity-100"
                          >
                            <RiCloseCircleLine size={16} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div> 

          {/* Submit and Go Back Buttons */}
          <div className="pt-5 flex justify-end space-x-4">
            <div
              onClick={onCancel}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full sm:w-auto cursor-pointer"
            >
              Cancel
            </div>
            <div
            onClick={handleSubmit}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full sm:w-auto cursor-pointer"
            >
              {/* {isEditing ? 'Update Ad' : 'Post Ad'} */}
              Update Ad
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnexForm;
