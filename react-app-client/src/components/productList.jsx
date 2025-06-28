import React from 'react';
import ProductItem from './productItem.jsx';
import './../styles/productList.css';

const Menu = ({ productCategories, productInfo }) => {
    return (
        <div className='productList'>
            {productCategories.map((category, idx) => (
                <div key={category['CategoryId']} id={`categoryCell_${category['CategoryId']}`}>
                    <h2>
                        {category['CategoryLogo']} {category['CategoryName']}
                    </h2>
                    <div className='list'>
                        {productInfo
                            .filter(product => category['CategoryId'] === product['CategoryId'])
                            .map((product, id) => {
                                return (
                                    <ProductItem
                                        key={id}
                                        product={product}
                                    />
                                );
                            })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Menu;