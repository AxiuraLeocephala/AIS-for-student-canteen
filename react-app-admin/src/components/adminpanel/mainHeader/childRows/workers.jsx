import {useState} from "react";
import { useMainContext } from "./../../../../context/mainContext.js";
import ArrowBlack from "./../../../../assets/images/Arrow-black.svg";
import ArrowWhite from "./../../../../assets/images/Arrow-white.svg";
import Trashcan from "./../../../../assets/images/trashcan.svg"
import "./../../../../style/workers.css";

const Workers = ({ visibleFormAddChangeWorker }) => {
    const [isTurned, setTurned] = useState(false);
    const { webSocket, workers, currentTheme } = useMainContext();

    const handleClickArrow = () => {
        if (!isTurned) {
            webSocket.send(JSON.stringify({
                "contentType": "getWorkers"
            }))
        }
        setTurned(prevState => !prevState)
    }

    const handleClickRemoveWorker = (workerId, role, firstName, secondName) => {
        webSocket.send(JSON.stringify({
            "contentType": "removeWorker", 
            "id": workerId,
            "role": role,
            "firstName": firstName,
            "secondName": secondName
        }))
    }

    const handleClickChangeWorker = (workerId, role, firstName, secondName, phoneNumber) => {
        visibleFormAddChangeWorker(
            {
                "workerId": workerId,
                "role": role, 
                "firstName": firstName, 
                "secondName": secondName, 
                "phoneNumber": phoneNumber
            }
        )
    }

    return (
        <>
            <div className="row workers">
                Сотрудники
                <div className={`arrow ${isTurned ? ("turned"):("")}`} onClick={handleClickArrow}>
                    <img src={currentTheme === "dark" ? ArrowBlack : ArrowWhite} alt=''/>
                </div>
            </div>
            {isTurned && workers && (
                <div className="list-workers-container">
                    <button className='btn-add-worker' onClick={() => visibleFormAddChangeWorker(null)}>Добавить работника</button>
                    <div className="list-workers">
                        {workers.map((worker, id) => {
                            return (
                                <div key={id} className="worker">
                                    <button 
                                        className='btn-remove-worker' 
                                        onClick={() => handleClickRemoveWorker(
                                            worker["Worker_Id"],
                                            worker["Role"],
                                            worker["FirstName"],
                                            worker["SecondName"]
                                        )}
                                    >
                                        <img src={Trashcan} alt="" />
                                    </button>
                                    <span className="name">{worker["FirstName"]} {worker["SecondName"]}</span>
                                    <span className="role">{worker["Role"] === "worker" ? ("работник"):("админ")}</span>
                                    <button 
                                        className='btn-change-worker' 
                                        onClick={()=> handleClickChangeWorker(
                                            worker["Worker_Id"],
                                            worker["Role"],
                                            worker["FirstName"],
                                            worker["SecondName"],
                                            worker["PhoneNumber"]
                                        )}
                                    >
                                        изменить
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </>
    )
}

export default Workers