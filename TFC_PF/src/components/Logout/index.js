import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './style.css';

const Logout = (props) => {
    const navigate = useNavigate();
    const handleClick = () => {
        props.authentication(false);
        props.admin(false);
        localStorage.removeItem("access");
        localStorage.removeItem("fresh");
        navigate('/', {
            state: {msg: 'successfuly logged out'}
        });
    };

    return (
        <>
        <div className="container">
            <h2>Logout</h2> <br />
            <p>Are you sure to log out?</p> <br />
            <button onClick={handleClick}>Logout</button>
        </div>
        </>
    )
}

export default Logout;