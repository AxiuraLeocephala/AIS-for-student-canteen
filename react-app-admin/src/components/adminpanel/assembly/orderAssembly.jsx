import {useRef} from 'react';

import MainHeader from './../mainHeader/mainHeader.jsx';
import Table from './table.jsx';
import "./../../../style/orderAssembly.css";

const OrderAssembly = ({ listOrders }) => {
    const columnRef = useRef();

    return (
        <div className="column-wrapper">
            <MainHeader/>
            <div className="column" ref={columnRef}>
                <div className="column-header">
                    <div className="header-top second">
                        В сборке 
                        <div className="order-counter">
                            {listOrders.oAssembly.length}
                        </div>
                    </div>
                </div> 
                <div className="order-list" style={{height: "calc(100vh - 86px)"}}>
                    {listOrders.oAssembly.map((order, id) => {
                        return <Table key={id} order={order} columnRef={columnRef}/>
                    })}
                </div>
            </div>
        </div>
    )
}

export default OrderAssembly  