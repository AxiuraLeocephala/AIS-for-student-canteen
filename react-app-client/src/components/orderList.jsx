import {useRef} from 'react';
import './../styles/orderList.css';

const OrderList = ({ setPaymentMethod, detailOrder }) => {
    const totalPrice = detailOrder.data['totalPrice'];
    const isChanged = detailOrder.data['isChanged'];
    const cashRef = useRef();
    const cardRef = useRef();

    const handleClickCash = () => {
        setPaymentMethod('CASH');
        cardRef.current.classList.remove('active');
        cashRef.current.classList.add('active');
    }

    const handleClickCard = () => {
        setPaymentMethod('CARD');
        cashRef.current.classList.remove('active');
        cardRef.current.classList.add('active');
    }

    return (
        <>
            <div className='ol1'>Заказ</div>
            <div className='orderList'>
                <section>
                    <div className='title'>Способ оплаты</div>
                    <div className='paymentMethod'>
                        <div className='option'onClick={handleClickCash} ref={cashRef}>Наличные</div>
                        <div className='option active' onClick={handleClickCard} ref={cardRef}>Карта</div>
                    </div>
                </section>

                <section>
                    <div className='title'>Дополнительная информация</div>
                    <div className='address'>Адрес: Меридиан, Красноармейская улица, 73</div>
                </section>

                <section>
                    <div className='title'>Итог</div>
                    <div className='totalPrice'>
                        <span>Итого</span>
                        <span className='price'>{totalPrice} ₽</span>
                    </div>
                    {isChanged && (
                        <div className="warning">
                            * Некоторые из выбранных вами блюд попали в стоп-лист, поэтому их стоимость не была учтена
                        </div>
                    )}
                </section>
            </div>
        </>
    )
}

export default OrderList