import { useState, useRef, useEffect } from "react";
import { useMainContext } from "./../../../../context/mainContext.js";
import { CurrentTheme } from "./../../../../utils/theme.js";
import BlackCross from "./../../../../assets/images/Cross-black.svg";
import WhiteCross from "./../../../../assets/images/Cross-white.svg";
import "./../../../../style/formAddChangeWorker.css";

const FormAddChangeWorker = ({ visibleFormAddChangeWorker, workerInfo, setWorkerInfo }) => {
    const arrow = CurrentTheme() === "black" ? (WhiteCross):(BlackCross);
    const { webSocket, isLoadingNewWorker, setIsLoadingNewChangeWorker, login, password } = useMainContext();
    const [isShowForm, setIsShowForm] = useState(true);
    const formWrapperRef = useRef();
    const [height, setHeight] = useState("auto");
    const [isChange, setIsChange] = useState(workerInfo);
    const [firstName, setFirstName] = useState(workerInfo ? (workerInfo["firstName"]):("")); 
    const [secondName, setSecondName] = useState(workerInfo ? (workerInfo["secondName"]):("")); 
    const [phoneNumber, setPhoneNumber] = useState(workerInfo ? (workerInfo["phoneNumber"]):(""));
    const [role, setRole] = useState(workerInfo && workerInfo["role"]);
    const [isChangedInfo, setIsChangeInfo] = useState(false);
    const [isShowWarning, setIsShowWarning] = useState(false);

    const addChangeWorker = (e) => {
        e.preventDefault();
        setIsShowWarning(false);
        setIsLoadingNewChangeWorker(true);
        setHeight(`${formWrapperRef.current.getBoundingClientRect().height}px`);
        if (!isChange) {
            if (isChangedInfo) {
                webSocket.send(JSON.stringify({
                    contentType: "addWorker",
                    firstName: e.target.elements["firstName"].value,
                    secondName: e.target.elements["secondName"].value,
                    role: e.target.elements["role"].value,
                    phoneNumber: e.target.elements["phoneNumber"].value
                }));
                setIsShowForm(false);
            } else {
                setIsShowWarning(true);
                setTimeout(() => setIsShowWarning(false), 2500);
            }
        } else {
            if (isChangedInfo) {
                console.log(workerInfo);
                webSocket.send(JSON.stringify({
                    contentType: "changeWorker",
                    workerId: workerInfo["workerId"],
                    newInfo: {
                        firstName: e.target.elements["firstName"].value,
                        secondName: e.target.elements["secondName"].value,
                        role: e.target.elements["role"].value,
                        phoneNumber: e.target.elements["phoneNumber"].value
                    }
                }));
                setIsShowForm(false);
            } else {
                setIsShowWarning(true);
                setTimeout(() => setIsShowWarning(false), 2500);
            }
        }
    }

    const handleBlur = (e) => {
        setIsShowWarning(false);
        if (e.target.value === "") {
            e.target.setAttribute("required", "");
        } else {
            e.target.removeAttribute("required");
        }
    }

    useEffect(() => {
        setHeight(formWrapperRef.current.getBoundingClientRect().height);
        if (workerInfo) {
            setIsChange(true);
        }
    }, [])

    useEffect(() => {
        if (!isLoadingNewWorker && isChange) {
            setTimeout(() => {
                setWorkerInfo(null);
                visibleFormAddChangeWorker(null);
            }, 3000)
        }
    }, [isLoadingNewWorker]);

    return (
        <div className="add-worker-wrapper"  ref={formWrapperRef} style={{height: height + "px"}}>
            <div className="cross" onClick={() => {
                setWorkerInfo(null);
                visibleFormAddChangeWorker(null);
            }}>
                <img src={arrow} alt="" />
            </div>
            <h4>{isChange ? ("Изменить информацию"):("Новый сотрудник")}</h4>
            {isShowForm ? (
                <form onSubmit={addChangeWorker}>
                    <section>
                        <article>
                            <div className="cell-fild">
                                <label>Имя</label>
                                <input 
                                    name="firstName" 
                                    type="text" 
                                    pattern="[А-Яа-яЁё]+" 
                                    maxLength={15} 
                                    onBlur={handleBlur}
                                    value={firstName}
                                    onChange={(e) => {
                                        setIsChangeInfo(true);
                                        setFirstName(e.target.value);
                                    }}
                                />
                            </div>
                            <div className="cell-fild">
                                <label>Фамилия</label>
                                <input 
                                    name="secondName" 
                                    type="text" 
                                    pattern="[А-Яа-яЁё]+" 
                                    maxLength={15} 
                                    onBlur={handleBlur}
                                    value={secondName}
                                    onChange={(e) => {
                                        setIsChangeInfo(true);
                                        setSecondName(e.target.value);
                                    }}
                                />
                            </div>
                            <div className="cell-fild">
                                <label>Роль</label>
                                <div className="input-select-question-wrapper">
                                    <select 
                                        name="role" 
                                        onBlur={handleBlur}
                                        onChange={(e) => {
                                            setIsChangeInfo(true);
                                            setRole(e.target.value);
                                        }}
                                        defaultValue={role}
                                    >
                                        <option value="worker">Работник</option>
                                        <option value="admin">Админ</option>
                                    </select>
                                    <div className="description">
                                        * «Работник» может принимать\отклонять заказы,
                                        сообщать об их сборке и выдавать <br/>
                                        * «Админ» имеет те же возможности, 
                                        что и «Работник», + возможность управлять системой
                                    </div>
                                </div>
                            </div>
                            <div className="cell-fild">
                                <label>Номер телефона</label>
                                <div className={isChange ? ("input-select-question-wrapper change"):("input-select-question-wrapper")}>
                                    <input 
                                        name="phoneNumber"
                                        placeholder="89006005544"
                                        type="tel"
                                        pattern="[8]{1}[0-9]{10}" 
                                        minLength="11" 
                                        maxLength="12"
                                        value={phoneNumber}
                                        onBlur={handleBlur}
                                        onChange={(e) => {
                                            setIsChangeInfo(true);
                                            setPhoneNumber(e.target.value)
                                        }}
                                    />
                                    <div className="description">
                                        * Не обязательно. Номер телефона необходим для авторизации 
                                        с помощью QR-кода через Телеграм
                                    </div>
                                </div>
                            </div>
                        </article>
                    </section>
                    <button className={isChange && ("change")}>
                        {isChange ? (
                            !isShowWarning ? ("Изменить"):("Внесите изменения или закройте форму")
                        ):(
                            !isShowWarning ? ("Добавить"):("Внесите изменения или закройте форму")
                        )}
                    </button>
                </form>
            ):(
                <div className="response-block">
                    {!isChange ? (
                        <>
                            <div className="login">
                                <span>Логин:  </span> 
                                {isLoadingNewWorker ? (
                                    <span className="spoiler-container">
                                        <span className="shine"></span>
                                        <span className="spoiler">***************</span>
                                    </span>
                                ):(
                                    login
                                )}
                            </div>
                            <div className="password">
                                <span>Пароль:  </span> 
                                {isLoadingNewWorker ? (
                                    <span className="spoiler-container">
                                        <span className="shine"></span>
                                        <span className="spoiler">***************</span>
                                    </span>
                                ):(
                                    password
                                )}
                            </div>
                            <div className="description">
                                * Полученный логин и пароль теперь может использоваться 
                                сотрудником для получения доступа к системе. Если при 
                                регистрации был указан его номер телефона - он может 
                                воспользователься qr-кодом для авторизации 
                            </div>
                        </>
                    ):(
                        <div className="response">
                            {isLoadingNewWorker ? (
                                <span className="spoiler-container">
                                    <span className="shine"></span>
                                    <span className="spoiler">*****************</span>
                                </span>
                            ):(
                                <>
                                    <span className="response-msg">Изменения внесены</span>
                                    <div className="loaderbar"></div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default FormAddChangeWorker;