import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faTrash } from '@fortawesome/free-solid-svg-icons';
import './MediaCarousel.css';

const MediaCarousel = ({ media, onRemoveMedia }) => (
  <Carousel>
    {media.map((item, index) => (
      <div key={index} className="carousel-item">
        {item.type === 'image' && <img src={item.path} alt="Event Media" />}
        {item.type === 'video' && <video controls src={item.path} />}
        {item.type === 'document' && (
          <a href={item.path} target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faFilePdf} className="pdf-icon" /> PDF Document
          </a>
        )}
        <button className="remove-media" onClick={() => onRemoveMedia(item.type, item.path)}>
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </div>
    ))}
  </Carousel>
);

export default MediaCarousel;
