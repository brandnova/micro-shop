import React from 'react';
import { FaFacebook, FaTwitter, FaWhatsapp, FaLink } from 'react-icons/fa';

const ShareButtons = ({ product, mainColor }) => {
  const shareUrl = `${window.location.origin}${window.location.pathname}?productId=${product.id}`;
  const shareText = `Check out this amazing product: ${product.name}`;

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Link copied to clipboard!');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  const shareNative = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: shareText,
        url: shareUrl,
      }).then(() => {
        console.log('Thanks for sharing!');
      }).catch(console.error);
    } else {
      // Fallback for browsers that don't support native sharing
      copyLink();
    }
  };

  return (
    <div className="flex space-x-4">
      <button onClick={shareToFacebook} className="text-blue-600 hover:text-blue-800" aria-label="Share on Facebook">
        <FaFacebook size={24} />
      </button>
      <button onClick={shareToTwitter} className="text-blue-400 hover:text-blue-600" aria-label="Share on Twitter">
        <FaTwitter size={24} />
      </button>
      <button onClick={shareToWhatsApp} className="text-green-500 hover:text-green-700" aria-label="Share on WhatsApp">
        <FaWhatsapp size={24} />
      </button>
      <button onClick={copyLink} className="text-gray-600 hover:text-gray-800" aria-label="Copy link">
        <FaLink size={24} />
      </button>
      <button onClick={shareNative} style={{ backgroundColor: mainColor }} className="text-white px-4 py-2 rounded-full hover:bg-pink-600 transition-colors duration-300">
        Share
      </button>
    </div>
  );
};

export default ShareButtons;