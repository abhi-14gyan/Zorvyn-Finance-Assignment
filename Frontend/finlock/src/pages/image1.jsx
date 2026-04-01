import React from 'react';
import image1 from '../assets/image1.jpg';
import './TiltedImage.css'; // for keeping styles clean

const TiltedImageSection = () => {
  return (
    <div className="tilted-image-container">
      <img src={image1} alt="AI Finance Visual" className="tilted-image" />
    </div>
  );
};

export default TiltedImageSection;
