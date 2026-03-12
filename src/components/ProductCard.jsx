import React from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

const ProductCard = ({ product, onAdd }) => {
    return (
        <div className="product-card animate-fade-in-up">
            <div className="product-image-container">
                <img
                    src={product.image}
                    alt={product.title}
                    className="product-image"
                    loading="lazy"
                />
            </div>
            <div className="product-info">
                <h3 className="product-title">{product.title}</h3>
                <div className="product-meta">
                    <span className="product-price">${product.price.toFixed(2)}</span>
                    <button
                        className="product-add-btn"
                        onClick={() => onAdd(product)}
                        aria-label={`Add ${product.title} to cart`}
                    >
                        <MdAddShoppingCart size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
