import React, { useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/free-mode';
import './../styles/header.css';

const Header = ({ productCategories }) => {
    const swiperRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const slidesRefs = useRef(Array(productCategories.length).fill(null).map(() => React.createRef()));

    const handleClick = (index) => {
        setActiveIndex(index);
        swiperRef.current.slideTo(index);
        const target = document.getElementById("categoryCell_" + index);
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 60,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div className='w-full header'>
            <Swiper
                modules={[FreeMode]}
                freeMode={true}
                slidesPerView='auto'
                centeredSlides={true}
                centeredSlidesBounds={true}
                className="category-swiper"
                onSwiper={swiper => swiperRef.current = swiper}
            >
                {productCategories.map((element, index) => (
                    <SwiperSlide 
                        key={index} 
                        ref={slidesRefs.current[index]}
                        className="!w-auto"
                    >
                        <button
                            onClick={() => handleClick(index)}
                            className={`rounded-full text-sm font-semibold transition-colors duration-300 ${activeIndex === index && 'isActive'}`}
                        >
                            {element['CategoryLogo']} {element['CategoryName']}
                        </button>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default Header;