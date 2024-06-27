import React from 'react';

const FileUploader = ({ onFileUpload }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.epw')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        onFileUpload(content);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid EPW file.');
    }
  };

  return (
    <div>
      <input type="file" accept=".epw" onChange={handleFileChange} />
    </div>
  );
};

export default FileUploader;
